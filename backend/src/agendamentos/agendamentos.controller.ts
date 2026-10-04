import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';

import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { verificarToken } from '../auth/security';

import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { ReservarAgendamentoDto } from './dto/reservar-agendamento.dto';

@Controller('agendamentos')
export class AgendamentosController {
  constructor(private readonly service: AgendamentosService) {}

  // Criação manual pelo painel administrativo.
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateAgendamentoDto) {
    return this.service.create(dto);
  }

  // Usuário autenticado reserva para a própria conta.
  @Post('reservar')
  reservar(
    @Req() req: { user: { sub: number } },
    @Body() dto: ReservarAgendamentoDto,
  ) {
    return this.service.reservar(req.user.sub, dto);
  }

  // Disponibilidade pública.
  @Public()
  @Get('disponibilidade')
  disponibilidade(
    @Query('data') data: string,
    @Query('barbeiroId') barbeiroId?: string,
  ) {
    return this.service.disponibilidade(
      data,
      barbeiroId ? Number(barbeiroId) : undefined,
    );
  }

  // Minhas reservas.
  //
  // @Public faz os guards globais não bloquearem a rota por role.
  // Porém a rota continua exigindo autenticação:
  // o token é validado manualmente aqui.
  @Public()
  @Get('minhas')
  minhas(@Req() req: { headers: { authorization?: string } }) {
    const authorization = req.headers.authorization;

    const [tipo, token] = authorization?.split(' ') ?? [];

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Faça login para acessar suas reservas',
      );
    }

    try {
      const usuario = verificarToken(token);

      return this.service.findMinhas(usuario.sub);
    } catch {
      throw new UnauthorizedException(
        'Sessão inválida ou expirada',
      );
    }
  }

  // Lista todos os agendamentos.
  // Somente administrador.
  @Roles('ADMIN')
  @Get()
  findAll(
    @Query('data') data?: string,
    @Query('barbeiroId') barbeiroId?: string,
    @Query('clienteId') clienteId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll({
      data,
      barbeiroId: barbeiroId
        ? Number(barbeiroId)
        : undefined,
      clienteId: clienteId
        ? Number(clienteId)
        : undefined,
      status,
    });
  }

  // Detalhes de um agendamento.
  // Prefixo evita conflito com /minhas.
  @Roles('ADMIN')
  @Get('detalhes/:id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(id);
  }

  // Atualização administrativa.
  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAgendamentoDto,
  ) {
    return this.service.update(id, dto);
  }

  // Exclusão administrativa.
  @Roles('ADMIN')
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(id);
  }
}
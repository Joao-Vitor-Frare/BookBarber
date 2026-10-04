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
} from '@nestjs/common';

import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { ReservarAgendamentoDto } from './dto/reservar-agendamento.dto';

@Controller('agendamentos')
export class AgendamentosController {
  constructor(private readonly service: AgendamentosService) {}

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

  // Duas partes no caminho para nunca colidir com /agendamentos/:id.
  // O JwtAuthGuard global continua exigindo login.
  @Get('cliente/minhas')
  minhas(@Req() req: { user: { sub: number } }) {
    return this.service.findMinhas(req.user.sub);
  }

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
      barbeiroId: barbeiroId ? Number(barbeiroId) : undefined,
      clienteId: clienteId ? Number(clienteId) : undefined,
      status,
    });
  }

  @Roles('ADMIN')
  @Get('detalhes/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAgendamentoDto,
  ) {
    return this.service.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

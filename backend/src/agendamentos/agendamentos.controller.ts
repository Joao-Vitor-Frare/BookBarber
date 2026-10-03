import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { ReservarAgendamentoDto } from './dto/reservar-agendamento.dto';

@Roles('ADMIN')
@Controller('agendamentos')
export class AgendamentosController {
  constructor(private readonly service: AgendamentosService) {}

  @Post()
  create(@Body() dto: CreateAgendamentoDto) {
    return this.service.create(dto);
  }

  @Roles('CLIENTE', 'ADMIN')
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
    return this.service.disponibilidade(data, barbeiroId ? Number(barbeiroId) : undefined);
  }

  @Roles('CLIENTE', 'ADMIN')
  @Get('minhas')
  minhas(@Req() req: { user: { sub: number } }) {
    return this.service.findMinhas(req.user.sub);
  }

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

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAgendamentoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

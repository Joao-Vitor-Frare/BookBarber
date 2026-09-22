import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { ReservarAgendamentoDto } from './dto/reservar-agendamento.dto';

@Controller('agendamentos')
export class AgendamentosController {
  constructor(private readonly service: AgendamentosService) {}

  @Post() create(@Body() dto: CreateAgendamentoDto) { return this.service.create(dto); }
  @Post('reservar') reservar(@Body() dto: ReservarAgendamentoDto) { return this.service.reservar(dto); }

  @Get('disponibilidade')
  disponibilidade(
    @Query('data') data: string,
    @Query('barbeiroId') barbeiroId?: string,
  ) {
    return this.service.disponibilidade(data, barbeiroId ? Number(barbeiroId) : undefined);
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

  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAgendamentoDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

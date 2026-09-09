import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';

@Injectable()
export class AgendamentosService {
  constructor(private readonly prisma: PrismaService) {}

  private include = { cliente: true, barbeiro: true, servico: true };

  async create(data: CreateAgendamentoDto) {
    await this.validarRelacionamentos(data.clienteId, data.barbeiroId, data.servicoId);

    return this.prisma.agendamento.create({
      data: {
        ...data,
        dataHora: new Date(data.dataHora),
      },
      include: this.include,
    });
  }

  findAll() {
    return this.prisma.agendamento.findMany({
      include: this.include,
      orderBy: { dataHora: 'asc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.agendamento.findUnique({
      where: { id },
      include: this.include,
    });
    if (!item) throw new NotFoundException('Agendamento não encontrado');
    return item;
  }

  async update(id: number, data: UpdateAgendamentoDto) {
    const atual = await this.findOne(id);
    await this.validarRelacionamentos(
      data.clienteId ?? atual.clienteId,
      data.barbeiroId ?? atual.barbeiroId,
      data.servicoId ?? atual.servicoId,
    );

    return this.prisma.agendamento.update({
      where: { id },
      data: {
        ...data,
        dataHora: data.dataHora ? new Date(data.dataHora) : undefined,
      },
      include: this.include,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.agendamento.delete({ where: { id } });
  }

  private async validarRelacionamentos(clienteId: number, barbeiroId: number, servicoId: number) {
    const [cliente, barbeiro, servico] = await Promise.all([
      this.prisma.cliente.findUnique({ where: { id: clienteId } }),
      this.prisma.barbeiro.findUnique({ where: { id: barbeiroId } }),
      this.prisma.servico.findUnique({ where: { id: servicoId } }),
    ]);

    if (!cliente) throw new BadRequestException('Cliente inválido');
    if (!barbeiro || !barbeiro.ativo) throw new BadRequestException('Barbeiro inválido ou inativo');
    if (!servico || !servico.ativo) throw new BadRequestException('Serviço inválido ou inativo');
  }
}

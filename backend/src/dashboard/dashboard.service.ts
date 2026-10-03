import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private mesAtual() {
    return new Date().toISOString().slice(0, 7);
  }

  async vendas(mesRecebido?: string) {
    const mes = mesRecebido?.trim() || this.mesAtual();
    if (!/^\d{4}-\d{2}$/.test(mes)) {
      throw new BadRequestException('Use o mês no formato YYYY-MM');
    }

    const agendamentos = await this.prisma.agendamento.findMany({
      where: { data: { startsWith: mes } },
      include: { barbeiro: true, servico: true },
      orderBy: { dataHora: 'asc' },
    });

    const porBarbeiro = new Map<string, { nome: string; quantidade: number; totalCentavos: number }>();
    const porServico = new Map<string, { nome: string; quantidade: number }>();

    let totalCentavos = 0;
    let totalAtendimentos = 0;
    let totalCancelados = 0;
    let totalAgendados = 0;

    for (const agendamento of agendamentos) {
      if (agendamento.status === 'CANCELADO') {
        totalCancelados += 1;
        continue;
      }

      if (agendamento.status === 'AGENDADO') {
        totalAgendados += 1;
        continue;
      }

      if (agendamento.status !== 'CONCLUIDO') continue;

      const preco = agendamento.servico.precoCentavos;
      totalCentavos += preco;
      totalAtendimentos += 1;

      const barbeiroAtual = porBarbeiro.get(agendamento.barbeiro.nome) ?? {
        nome: agendamento.barbeiro.nome,
        quantidade: 0,
        totalCentavos: 0,
      };
      barbeiroAtual.quantidade += 1;
      barbeiroAtual.totalCentavos += preco;
      porBarbeiro.set(agendamento.barbeiro.nome, barbeiroAtual);

      const servicoAtual = porServico.get(agendamento.servico.nome) ?? {
        nome: agendamento.servico.nome,
        quantidade: 0,
      };
      servicoAtual.quantidade += 1;
      porServico.set(agendamento.servico.nome, servicoAtual);
    }

    return {
      mes,
      totalCentavos,
      totalAtendimentos,
      ticketMedioCentavos: totalAtendimentos ? Math.round(totalCentavos / totalAtendimentos) : 0,
      totalAgendados,
      totalCancelados,
      porBarbeiro: [...porBarbeiro.values()].sort((a, b) => b.totalCentavos - a.totalCentavos),
      porServico: [...porServico.values()].sort((a, b) => b.quantidade - a.quantidade),
    };
  }
}

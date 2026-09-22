import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfiguracaoService } from '../configuracao/configuracao.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { ReservarAgendamentoDto } from './dto/reservar-agendamento.dto';

const DIAS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

@Injectable()
export class AgendamentosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configuracao: ConfiguracaoService,
  ) {}

  private include = { cliente: true, barbeiro: true, servico: true };

  private toDateTime(data: string, hora: string) {
    return new Date(`${data}T${hora}:00-03:00`);
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

  private async validarHorarioConfigurado(data: string, hora: string) {
    const config = await this.configuracao.findOne();
    const indiceDia = new Date(`${data}T12:00:00Z`).getUTCDay();
    const chave = DIAS[indiceDia];
    const dia = config.horariosSemana?.[chave];

    if (!dia?.aberto) throw new BadRequestException('A barbearia está fechada nesse dia');
    if (!dia.horarios?.includes(hora)) throw new BadRequestException('Esse horário não está disponível na agenda da barbearia');

    const momento = this.toDateTime(data, hora);
    if (Number.isNaN(momento.getTime())) throw new BadRequestException('Data ou hora inválida');
    if (momento.getTime() <= Date.now()) throw new BadRequestException('Não é possível agendar um horário no passado');
  }

  private async validarConflito(barbeiroId: number, data: string, hora: string, ignorarId?: number) {
    const conflito = await this.prisma.agendamento.findFirst({
      where: {
        barbeiroId,
        data,
        hora,
        status: 'AGENDADO',
        ...(ignorarId ? { NOT: { id: ignorarId } } : {}),
      },
    });
    if (conflito) throw new ConflictException('Esse horário já está ocupado para o barbeiro selecionado');
  }

  async create(dto: CreateAgendamentoDto) {
    await this.validarRelacionamentos(dto.clienteId, dto.barbeiroId, dto.servicoId);
    await this.validarHorarioConfigurado(dto.data, dto.hora);
    await this.validarConflito(dto.barbeiroId, dto.data, dto.hora);

    return this.prisma.agendamento.create({
      data: {
        ...dto,
        dataHora: this.toDateTime(dto.data, dto.hora),
      },
      include: this.include,
    });
  }

  async reservar(dto: ReservarAgendamentoDto) {
    await this.validarHorarioConfigurado(dto.data, dto.hora);

    let servicoId = dto.servicoId;
    if (!servicoId) {
      const primeiroServico = await this.prisma.servico.findFirst({ where: { ativo: true }, orderBy: { id: 'asc' } });
      if (!primeiroServico) throw new BadRequestException('Nenhum serviço ativo foi cadastrado');
      servicoId = primeiroServico.id;
    }

    let barbeiroId = dto.barbeiroId;
    if (!barbeiroId) {
      const barbeiros = await this.prisma.barbeiro.findMany({ where: { ativo: true }, orderBy: { id: 'asc' } });
      for (const barbeiro of barbeiros) {
        const conflito = await this.prisma.agendamento.findFirst({
          where: { barbeiroId: barbeiro.id, data: dto.data, hora: dto.hora, status: 'AGENDADO' },
        });
        if (!conflito) {
          barbeiroId = barbeiro.id;
          break;
        }
      }
      if (!barbeiroId) throw new ConflictException('Não há barbeiros disponíveis nesse horário');
    }

    const cliente = await this.prisma.cliente.upsert({
      where: { email: dto.email },
      create: { nome: dto.nomeCliente, email: dto.email, telefone: dto.telefone },
      update: { nome: dto.nomeCliente, telefone: dto.telefone },
    });

    return this.create({
      data: dto.data,
      hora: dto.hora,
      clienteId: cliente.id,
      barbeiroId,
      servicoId,
      observacoes: dto.observacoes,
    });
  }

  findAll(filtros?: { data?: string; barbeiroId?: number; clienteId?: number; status?: string }) {
    return this.prisma.agendamento.findMany({
      where: {
        ...(filtros?.data ? { data: filtros.data } : {}),
        ...(filtros?.barbeiroId ? { barbeiroId: filtros.barbeiroId } : {}),
        ...(filtros?.clienteId ? { clienteId: filtros.clienteId } : {}),
        ...(filtros?.status ? { status: filtros.status } : {}),
      },
      include: this.include,
      orderBy: { dataHora: 'asc' },
    });
  }

  async disponibilidade(data: string, barbeiroId?: number) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new BadRequestException('Use data no formato YYYY-MM-DD');

    const config = await this.configuracao.findOne();
    const indiceDia = new Date(`${data}T12:00:00Z`).getUTCDay();
    const chave = DIAS[indiceDia];
    const dia = config.horariosSemana?.[chave];

    if (!dia?.aberto) {
      return { data, aberto: false, horarios: [], livres: [], ocupados: [] };
    }

    const barbeiros = await this.prisma.barbeiro.findMany({
      where: { ativo: true, ...(barbeiroId ? { id: barbeiroId } : {}) },
      orderBy: { id: 'asc' },
    });

    if (barbeiroId && barbeiros.length === 0) throw new NotFoundException('Barbeiro não encontrado ou inativo');

    const agendados = await this.prisma.agendamento.findMany({
      where: {
        data,
        status: 'AGENDADO',
        ...(barbeiroId ? { barbeiroId } : {}),
      },
      select: { hora: true, barbeiroId: true },
    });

    const horarios = dia.horarios.map((hora: string) => {
      const barbeirosDisponiveis = barbeiros.filter(
        (b: { id: number }) => !agendados.some((a: { hora: string; barbeiroId: number }) => a.hora === hora && a.barbeiroId === b.id),
      );
      return {
        hora,
        disponivel: barbeirosDisponiveis.length > 0,
        barbeirosDisponiveis: barbeirosDisponiveis.map((b: { id: number; nome: string }) => ({ id: b.id, nome: b.nome })),
      };
    });

    return {
      data,
      aberto: true,
      horarios,
      livres: horarios.filter((h: { disponivel: boolean }) => h.disponivel).map((h: { hora: string }) => h.hora),
      ocupados: horarios.filter((h: { disponivel: boolean }) => !h.disponivel).map((h: { hora: string }) => h.hora),
    };
  }

  async findOne(id: number) {
    const item = await this.prisma.agendamento.findUnique({ where: { id }, include: this.include });
    if (!item) throw new NotFoundException('Agendamento não encontrado');
    return item;
  }

  async update(id: number, dto: UpdateAgendamentoDto) {
    const atual = await this.findOne(id);
    const data = dto.data ?? atual.data;
    const hora = dto.hora ?? atual.hora;
    const clienteId = dto.clienteId ?? atual.clienteId;
    const barbeiroId = dto.barbeiroId ?? atual.barbeiroId;
    const servicoId = dto.servicoId ?? atual.servicoId;

    await this.validarRelacionamentos(clienteId, barbeiroId, servicoId);
    if ((dto.status ?? atual.status) === 'AGENDADO') {
      await this.validarHorarioConfigurado(data, hora);
      await this.validarConflito(barbeiroId, data, hora, id);
    }

    return this.prisma.agendamento.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.data || dto.hora ? { dataHora: this.toDateTime(data, hora) } : {}),
      },
      include: this.include,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.agendamento.delete({ where: { id } });
  }
}

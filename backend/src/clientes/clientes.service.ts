import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateClienteDto) {
    try {
      return await this.prisma.cliente.create({ data });
    } catch (erro: any) {
      if (erro?.code === 'P2002') throw new ConflictException('Já existe um cliente com esse email');
      throw erro;
    }
  }

  findAll() {
    return this.prisma.cliente.findMany({ orderBy: { nome: 'asc' } });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');
    return cliente;
  }

  async update(id: number, data: UpdateClienteDto) {
    await this.findOne(id);
    try {
      return await this.prisma.cliente.update({ where: { id }, data });
    } catch (erro: any) {
      if (erro?.code === 'P2002') throw new ConflictException('Já existe um cliente com esse email');
      throw erro;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.cliente.delete({ where: { id } });
  }
}

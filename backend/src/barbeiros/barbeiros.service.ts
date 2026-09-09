import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBarbeiroDto } from './dto/create-barbeiro.dto';
import { UpdateBarbeiroDto } from './dto/update-barbeiro.dto';

@Injectable()
export class BarbeirosService {
  constructor(private readonly prisma: PrismaService) {}
  create(data: CreateBarbeiroDto) { return this.prisma.barbeiro.create({ data }); }
  findAll() { return this.prisma.barbeiro.findMany({ orderBy: { nome: 'asc' } }); }
  async findOne(id: number) {
    const item = await this.prisma.barbeiro.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Barbeiro não encontrado');
    return item;
  }
  async update(id: number, data: UpdateBarbeiroDto) {
    await this.findOne(id);
    return this.prisma.barbeiro.update({ where: { id }, data });
  }
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.barbeiro.delete({ where: { id } });
  }
}

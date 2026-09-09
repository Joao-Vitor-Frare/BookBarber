import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';

@Injectable()
export class ServicosService {
  constructor(private readonly prisma: PrismaService) {}
  create(data: CreateServicoDto) { return this.prisma.servico.create({ data }); }
  findAll() { return this.prisma.servico.findMany({ orderBy: { nome: 'asc' } }); }
  async findOne(id: number) {
    const item = await this.prisma.servico.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Serviço não encontrado');
    return item;
  }
  async update(id: number, data: UpdateServicoDto) {
    await this.findOne(id);
    return this.prisma.servico.update({ where: { id }, data });
  }
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.servico.delete({ where: { id } });
  }
}

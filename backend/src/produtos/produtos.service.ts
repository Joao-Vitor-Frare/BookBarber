import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateProdutoDto) {
    return this.prisma.produto.create({ data });
  }

  findAll(incluirInativos = false) {
    return this.prisma.produto.findMany({
      where: incluirInativos ? undefined : { ativo: true },
      orderBy: [{ ordem: 'asc' }, { id: 'asc' }],
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.produto.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Produto não encontrado');
    return item;
  }

  async update(id: number, data: UpdateProdutoDto) {
    await this.findOne(id);
    return this.prisma.produto.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.produto.delete({ where: { id } });
  }
}

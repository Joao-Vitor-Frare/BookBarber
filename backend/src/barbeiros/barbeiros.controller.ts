import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { BarbeirosService } from './barbeiros.service';
import { CreateBarbeiroDto } from './dto/create-barbeiro.dto';
import { UpdateBarbeiroDto } from './dto/update-barbeiro.dto';

@Roles('ADMIN')
@Controller('barbeiros')
export class BarbeirosController {
  constructor(private readonly service: BarbeirosService) {}

  @Post() create(@Body() dto: CreateBarbeiroDto) { return this.service.create(dto); }

  @Public()
  @Get() findAll(@Query('incluirInativos') incluir?: string) { return this.service.findAll(incluir === 'true'); }

  @Public()
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBarbeiroDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

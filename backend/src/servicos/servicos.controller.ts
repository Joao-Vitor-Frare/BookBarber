import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ServicosService } from './servicos.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';

@Roles('ADMIN')
@Controller('servicos')
export class ServicosController {
  constructor(private readonly service: ServicosService) {}
  @Post() create(@Body() dto: CreateServicoDto) { return this.service.create(dto); }

  @Public()
  @Get() findAll(@Query('incluirInativos') incluir?: string) { return this.service.findAll(incluir === 'true'); }

  @Public()
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServicoDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

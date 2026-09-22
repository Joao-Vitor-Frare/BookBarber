import { Body, Controller, Get, Patch, Put } from '@nestjs/common';
import { ConfiguracaoService } from './configuracao.service';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';

@Controller('configuracao')
export class ConfiguracaoController {
  constructor(private readonly service: ConfiguracaoService) {}
  @Get() findOne() { return this.service.findOne(); }
  @Patch() update(@Body() dto: UpdateConfiguracaoDto) { return this.service.update(dto); }
  @Put() replace(@Body() dto: UpdateConfiguracaoDto) { return this.service.update(dto); }
}

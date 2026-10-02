import { Body, Controller, Get, Patch, Put } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ConfiguracaoService } from './configuracao.service';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';

@Roles('ADMIN')
@Controller('configuracao')
export class ConfiguracaoController {
  constructor(private readonly service: ConfiguracaoService) {}

  @Public()
  @Get() findOne() { return this.service.findOne(); }

  @Patch() update(@Body() dto: UpdateConfiguracaoDto) { return this.service.update(dto); }
  @Put() replace(@Body() dto: UpdateConfiguracaoDto) { return this.service.update(dto); }
}

import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';

@Roles('ADMIN')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('vendas')
  vendas(@Query('mes') mes?: string) {
    return this.service.vendas(mes);
  }
}

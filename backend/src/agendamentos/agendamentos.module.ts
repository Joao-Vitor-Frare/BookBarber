import { Module } from '@nestjs/common';
import { ConfiguracaoModule } from '../configuracao/configuracao.module';
import { AgendamentosController } from './agendamentos.controller';
import { AgendamentosService } from './agendamentos.service';

@Module({ imports: [ConfiguracaoModule], controllers: [AgendamentosController], providers: [AgendamentosService] })
export class AgendamentosModule {}

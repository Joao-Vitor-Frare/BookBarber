import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ClientesModule } from './clientes/clientes.module';
import { BarbeirosModule } from './barbeiros/barbeiros.module';
import { ServicosModule } from './servicos/servicos.module';
import { AgendamentosModule } from './agendamentos/agendamentos.module';

@Module({
  imports: [
    PrismaModule,
    ClientesModule,
    BarbeirosModule,
    ServicosModule,
    AgendamentosModule,
  ],
})
export class AppModule {}

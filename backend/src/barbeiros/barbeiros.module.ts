import { Module } from '@nestjs/common';
import { BarbeirosController } from './barbeiros.controller';
import { BarbeirosService } from './barbeiros.service';
@Module({ controllers: [BarbeirosController], providers: [BarbeirosService] })
export class BarbeirosModule {}

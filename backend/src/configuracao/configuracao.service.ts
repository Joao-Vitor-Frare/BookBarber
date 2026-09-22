import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';

export const CONFIG_PADRAO = {
  nomeBanner: 'BookBarber',
  descBanner: 'Corte com estilo, sempre no capricho',
  imagensBanner: [
    'media/imagem-banner-1.jpg',
    'media/imagem-banner-2.jpg',
    'media/imagem-banner-3.jpg',
  ],
  horariosSemana: {
    segunda: { aberto: true, horarios: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'] },
    terca: { aberto: true, horarios: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'] },
    quarta: { aberto: true, horarios: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'] },
    quinta: { aberto: true, horarios: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'] },
    sexta: { aberto: true, horarios: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'] },
    sabado: { aberto: true, horarios: ['08:00', '09:00', '10:00'] },
    domingo: { aberto: false, horarios: [] },
  },
  telefone: '(11) 99999-9999',
  endereco: 'Rua Miramar, 123 - Anchieta-SC',
  instagram: 'https://instagram.com/bookbarber',
  whatsapp: 'https://wa.me/5549999999999',
};

@Injectable()
export class ConfiguracaoService {
  constructor(private readonly prisma: PrismaService) {}

  private serializar(config: typeof CONFIG_PADRAO) {
    return {
      nomeBanner: config.nomeBanner,
      descBanner: config.descBanner,
      imagensBannerJson: JSON.stringify(config.imagensBanner),
      horariosSemanaJson: JSON.stringify(config.horariosSemana),
      telefone: config.telefone,
      endereco: config.endereco,
      instagram: config.instagram,
      whatsapp: config.whatsapp,
    };
  }

  private formatar(registro: any) {
    return {
      id: registro.id,
      nomeBanner: registro.nomeBanner,
      descBanner: registro.descBanner,
      imagensBanner: JSON.parse(registro.imagensBannerJson),
      horariosSemana: JSON.parse(registro.horariosSemanaJson),
      contato: {
        telefone: registro.telefone,
        endereco: registro.endereco,
        instagram: registro.instagram,
        whatsapp: registro.whatsapp,
      },
      atualizadoEm: registro.atualizadoEm,
    };
  }

  async getRaw() {
    let registro = await this.prisma.configuracao.findUnique({ where: { id: 1 } });
    if (!registro) {
      registro = await this.prisma.configuracao.create({
        data: { id: 1, ...this.serializar(CONFIG_PADRAO) },
      });
    }
    return registro;
  }

  async findOne() {
    return this.formatar(await this.getRaw());
  }

  async update(dto: UpdateConfiguracaoDto) {
    const atual = await this.findOne();
    const dados = {
      nomeBanner: dto.nomeBanner ?? atual.nomeBanner,
      descBanner: dto.descBanner ?? atual.descBanner,
      imagensBanner: dto.imagensBanner ?? atual.imagensBanner,
      horariosSemana: dto.horariosSemana ?? atual.horariosSemana,
      telefone: dto.telefone ?? atual.contato.telefone,
      endereco: dto.endereco ?? atual.contato.endereco,
      instagram: dto.instagram ?? atual.contato.instagram,
      whatsapp: dto.whatsapp ?? atual.contato.whatsapp,
    };

    const registro = await this.prisma.configuracao.upsert({
      where: { id: 1 },
      create: { id: 1, ...this.serializar(dados) },
      update: this.serializar(dados),
    });

    return this.formatar(registro);
  }
}

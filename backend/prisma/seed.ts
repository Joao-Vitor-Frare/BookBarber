import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const horariosSemana = {
  segunda: { aberto: true, horarios: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'] },
  terca: { aberto: true, horarios: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'] },
  quarta: { aberto: true, horarios: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'] },
  quinta: { aberto: true, horarios: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'] },
  sexta: { aberto: true, horarios: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'] },
  sabado: { aberto: true, horarios: ['08:00', '09:00', '10:00'] },
  domingo: { aberto: false, horarios: [] },
};

async function main() {
  await prisma.configuracao.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      nomeBanner: 'BookBarber',
      descBanner: 'Corte com estilo, sempre no capricho',
      imagensBannerJson: JSON.stringify(['media/imagem-banner-1.jpg', 'media/imagem-banner-2.jpg', 'media/imagem-banner-3.jpg']),
      horariosSemanaJson: JSON.stringify(horariosSemana),
      telefone: '(11) 99999-9999',
      endereco: 'Rua Miramar, 123 - Anchieta-SC',
      instagram: 'https://instagram.com/bookbarber',
      whatsapp: 'https://wa.me/5549999999999',
    },
    update: {},
  });

  if ((await prisma.barbeiro.count()) === 0) {
    await prisma.barbeiro.createMany({
      data: [
        { nome: 'Carlos', especialidade: 'Cortes masculinos' },
        { nome: 'Rafael', especialidade: 'Barba e acabamento' },
      ],
    });
  }

  if ((await prisma.servico.count()) === 0) {
    await prisma.servico.createMany({
      data: [
        { nome: 'Corte', descricao: 'Corte masculino', precoCentavos: 4000, duracaoMinutos: 40 },
        { nome: 'Barba', descricao: 'Barba e acabamento', precoCentavos: 3000, duracaoMinutos: 30 },
        { nome: 'Corte + Barba', descricao: 'Combo completo', precoCentavos: 6500, duracaoMinutos: 60 },
      ],
    });
  }

  if ((await prisma.produto.count()) === 0) {
    await prisma.produto.createMany({
      data: [
        { nome: 'Pomada Modeladora', precoCentavos: 4500, imagem: 'media/produto-1.jpg', ordem: 1 },
        { nome: 'Óleo para Barba', precoCentavos: 3800, imagem: 'media/produto-2.jpg', ordem: 2 },
        { nome: 'Shampoo Anticaspa', precoCentavos: 3200, imagem: 'media/produto-3.jpg', ordem: 3 },
        { nome: 'Minoxidil', precoCentavos: 3000, imagem: 'media/produto-4.jpg', ordem: 4 },
      ],
    });
  }

  console.log('Dados iniciais do BookBarber inseridos.');
}

main().finally(async () => prisma.$disconnect());

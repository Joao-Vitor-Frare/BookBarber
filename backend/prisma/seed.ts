import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { hashSenha } from '../src/auth/security';

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error('Configure DATABASE_URL ou DIRECT_URL antes de executar o seed.');
}

const adapter = new PrismaPg({ connectionString });
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

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@bookbarber.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminNome = process.env.ADMIN_NOME || 'Administrador';
  const adminTelefone = process.env.ADMIN_TELEFONE || '(00) 00000-0000';
  const adminSenhaHash = hashSenha(adminPassword);

  await prisma.usuario.upsert({
    where: { email: adminEmail },
    create: {
      nome: adminNome,
      email: adminEmail,
      telefone: adminTelefone,
      senhaHash: adminSenhaHash,
      perfil: 'ADMIN',
    },
    update: {
      nome: adminNome,
      telefone: adminTelefone,
      senhaHash: adminSenhaHash,
      perfil: 'ADMIN',
    },
  });

  console.log('Dados iniciais do BookBarber inseridos no PostgreSQL.');
  console.log(`Administrador: ${adminEmail}`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());

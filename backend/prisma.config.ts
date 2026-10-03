import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  // No Supabase usamos uma conexão sem transaction pooling para migrations.
  // Em produção, o Prisma Client usa DATABASE_URL (pooler) no PrismaService.
  datasource: {
    url: env('DIRECT_URL'),
  },
});

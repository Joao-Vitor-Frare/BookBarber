import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const originsPermitidas = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      // Requisições sem Origin (Postman, acesso direto, health checks etc.).
      if (!origin) return callback(null, true);

      const origemNormalizada = origin.replace(/\/$/, '');

      if (originsPermitidas.includes(origemNormalizada)) {
        return callback(null, true);
      }

      // Também aceita previews do projeto frontend na Vercel.
      if (
        /^https:\/\/bookbarber-frontend(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(
          origemNormalizada,
        )
      ) {
        return callback(null, true);
      }

      return callback(new Error('Origem não permitida pelo CORS'));
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`BookBarber API rodando em http://localhost:${port}/api`);
}

bootstrap();

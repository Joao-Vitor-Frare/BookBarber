# BookBarber Backend

API do BookBarber em **NestJS + TypeScript + Prisma ORM 7 + PostgreSQL/Supabase**.

## Banco

O backend usa PostgreSQL no Supabase.

- `DATABASE_URL`: conexão pooled do Supabase para execução da aplicação.
- `DIRECT_URL`: conexão usada pelo Prisma CLI para migrations.

O SQLite e o adapter `better-sqlite3` foram removidos.

## Primeira execução

Na pasta `backend/`:

```bash
cp .env.example .env
npm install
npm run setup
npm run start:dev
```

Antes de `npm run setup`, preencha `DATABASE_URL` e `DIRECT_URL` no `.env`.

API local:

```text
http://localhost:3000/api
```

## Autenticação

- `POST /api/cadastro`: recebe `nome`, `telefone`, `email` e `senha` e cria usuário `CLIENTE`.
- `POST /api/login`: recebe `email` e `senha` e devolve token + conta.
- `GET /api/me`: devolve dados da conta autenticada.
- `POST /api/agendamentos/reservar`: exige login e usa nome, telefone e e-mail da conta.
- `GET /api/agendamentos/minhas`: devolve somente as reservas do cliente autenticado.
- `GET /api/dashboard/vendas?mes=YYYY-MM`: resumo mensal de vendas, disponível apenas para `ADMIN`.
- Rotas administrativas exigem perfil `ADMIN`.

## Deploy

Na Vercel, use `backend` como **Root Directory** e configure as variáveis do `.env.example` no painel do projeto.

O script `postinstall` executa `prisma generate`, permitindo que o Prisma Client seja gerado durante a instalação no deploy.

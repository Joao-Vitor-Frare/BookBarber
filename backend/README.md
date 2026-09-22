# BookBarber Backend

Backend do MVP em **NestJS + Prisma + SQLite**.

## Primeira execução / atualização

Na pasta `backend`:

```bash
cp .env.example .env
npm install
npm run setup
npm run start:dev
```

`npm run setup` gera o Prisma Client, sincroniza o banco SQLite existente com o schema e insere dados iniciais sem duplicar os registros-base.

API: `http://localhost:3000/api`

## Principais rotas

- `GET/POST/PATCH/DELETE /api/clientes`
- `GET/POST/PATCH/DELETE /api/barbeiros`
- `GET/POST/PATCH/DELETE /api/servicos`
- `GET/POST/PATCH/DELETE /api/produtos`
- `GET/PATCH /api/configuracao`
- `GET/POST/PATCH/DELETE /api/agendamentos`
- `POST /api/agendamentos/reservar` — reserva pública e cria/atualiza o cliente pelo e-mail
- `GET /api/agendamentos/disponibilidade?data=YYYY-MM-DD` — horários livres/ocupados

## Banco

O banco local é `backend/dev.db` e está ignorado pelo Git. O projeto mantém o schema e migrations no repositório para documentar a estrutura do banco.

## Observação

O painel admin ainda não possui autenticação, pois o frontend original não definiu um fluxo de login. Para o MVP atual, a página administrativa consome diretamente as rotas CRUD.

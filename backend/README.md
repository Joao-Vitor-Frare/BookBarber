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

`npm run setup` gera o Prisma Client, sincroniza o banco SQLite com o schema e insere os dados iniciais sem duplicar os registros-base. O usuário administrador é criado/atualizado a partir de `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

API: `http://localhost:3000/api`

## Autenticação

- `POST /api/cadastro` — cria usuário `CLIENTE`.
- `POST /api/login` — valida e-mail/senha e devolve um token com validade de 8 horas.
- `GET /api/me` — devolve o usuário da sessão.
- Senhas são armazenadas com `scrypt` + salt.
- Rotas administrativas exigem token e perfil `ADMIN`.

Exemplo de `.env`:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
JWT_SECRET="troque-esta-chave-em-producao"
ADMIN_EMAIL="admin@bookbarber.com"
ADMIN_PASSWORD="admin123"
```

## Principais rotas públicas

- `GET /api/barbeiros`
- `GET /api/servicos`
- `GET /api/produtos`
- `GET /api/configuracao`
- `POST /api/agendamentos/reservar`
- `GET /api/agendamentos/disponibilidade?data=YYYY-MM-DD`

## Administração

Com token de `ADMIN`:

- CRUD de clientes
- CRUD de barbeiros
- CRUD de serviços
- CRUD de produtos
- alteração da configuração
- consulta/alteração/exclusão de agendamentos

## Banco

O banco local é `backend/dev.db` e está ignorado pelo Git. O projeto mantém o schema e migrations no repositório para documentar a estrutura do banco.

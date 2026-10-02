# BookBarber

Projeto acadêmico com frontend **HTML/CSS/JavaScript** e backend **NestJS + Prisma + SQLite**.

## Execução rápida

Na raiz do projeto, entre no backend:

```bash
cd backend
cp .env.example .env
npm install
npm run setup
npm run start:dev
```

Depois abra a pasta raiz usando o **Live Server** do VS Code e acesse `index.html`.

A API local fica em `http://localhost:3000/api`.

## Login

O frontend possui cadastro e login em `login.html`.

- Contas criadas pelo site recebem o perfil `CLIENTE`.
- O painel `admin.html` exige uma conta com perfil `ADMIN`.
- A autenticação usa token assinado com expiração de 8 horas.
- As senhas são armazenadas com hash e salt; a senha original não é salva no banco.
- A reserva pública continua funcionando sem login, mas nome e e-mail são preenchidos automaticamente quando há uma sessão ativa.

O `npm run setup` cria/atualiza o administrador inicial usando os valores do `.env`:

```env
ADMIN_EMAIL="admin@bookbarber.com"
ADMIN_PASSWORD="admin123"
```

Para apresentação ou deploy, altere principalmente `JWT_SECRET` e `ADMIN_PASSWORD` no `.env`.

## Funcionalidades integradas

- Cadastro e login de usuários
- Proteção das rotas administrativas
- Configurações do site persistidas no banco
- Produtos carregados da API
- Barbeiros e serviços cadastráveis pelo painel admin
- Consulta real de disponibilidade
- Reserva de horário com cliente, serviço e barbeiro
- Prevenção de conflito de horário por barbeiro
- Lista administrativa de agendamentos com conclusão/cancelamento

## Banco de dados

O SQLite local fica em `backend/dev.db` e está ignorado pelo Git. O schema Prisma e as migrations ficam versionados.

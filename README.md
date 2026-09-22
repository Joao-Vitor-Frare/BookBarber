# BookBarber

Projeto acadêmico com frontend HTML/CSS/JavaScript e backend NestJS + Prisma + SQLite.

## Execução rápida

```bash
cd backend
cp .env.example .env
npm install
npm run setup
npm run start:dev
```

Depois abra a pasta raiz usando Live Server no VS Code e acesse `index.html`.

A API local fica em `http://localhost:3000/api`.

## Funcionalidades integradas

- Configurações do site persistidas no banco
- Produtos carregados da API
- Barbeiros e serviços cadastráveis pelo painel admin
- Consulta real de disponibilidade
- Reserva de horário com cliente, serviço e barbeiro
- Prevenção de conflito de horário por barbeiro
- Lista administrativa de agendamentos com conclusão/cancelamento

O painel administrativo ainda não possui autenticação. Isso pode ser incluído posteriormente caso seja requisito do projeto.

# BookBarber Backend

API REST do MVP BookBarber, criada com NestJS, Prisma ORM e SQLite.

## Entidades

- Clientes
- Barbeiros
- Serviços
- Agendamentos

## Como executar

1. Instale Node.js 20+.
2. Entre na pasta do backend.
3. Copie `.env.example` para `.env`.
4. Execute:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

A API ficará disponível em `http://localhost:3000/api`.

## Rotas CRUD

Cada recurso possui `POST`, `GET`, `GET /:id`, `PATCH /:id` e `DELETE /:id`.

- `/api/clientes`
- `/api/barbeiros`
- `/api/servicos`
- `/api/agendamentos`

### Exemplo: criar cliente

```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "11999999999"
}
```

### Exemplo: criar barbeiro

```json
{
  "nome": "Carlos",
  "especialidade": "Cortes masculinos"
}
```

### Exemplo: criar serviço

```json
{
  "nome": "Corte",
  "descricao": "Corte masculino",
  "precoCentavos": 4000,
  "duracaoMinutos": 40
}
```

### Exemplo: criar agendamento

```json
{
  "dataHora": "2026-09-15T14:00:00-03:00",
  "clienteId": 1,
  "barbeiroId": 1,
  "servicoId": 1,
  "observacoes": "Preferência por degradê"
}
```

# BookBarber

**BookBarber** é um sistema web de gerenciamento de barbearia desenvolvido para a disciplina de **Programação IV**. O projeto reúne uma área pública para clientes, autenticação, reservas online, painel administrativo e dashboard de vendas.

## Objetivo

O sistema foi criado para digitalizar tarefas comuns de uma barbearia, permitindo que clientes consultem serviços e horários, criem suas próprias reservas e acompanhem seus agendamentos, enquanto administradores gerenciam o funcionamento da barbearia em uma interface separada.

## Principais funcionalidades

### Área do cliente

- criação de conta com nome, telefone, e-mail e senha;
- login e sessão autenticada;
- visualização dos serviços oferecidos;
- visualização de produtos;
- consulta da disponibilidade da agenda;
- escolha de serviço, barbeiro, data e horário;
- criação de reserva usando automaticamente os dados da conta;
- página **Minhas reservas**, com próximos horários e histórico do próprio cliente.

### Área administrativa

- acesso restrito ao perfil `ADMIN`;
- gerenciamento de barbeiros;
- gerenciamento de serviços;
- gerenciamento de produtos;
- edição das informações e horários da barbearia;
- visualização e alteração de agendamentos;
- dashboard mensal de vendas.

### Dashboard de vendas

O dashboard utiliza os agendamentos registrados no sistema para apresentar indicadores do mês selecionado, incluindo:

- total vendido;
- quantidade de atendimentos concluídos;
- ticket médio;
- quantidade de agendamentos pendentes;
- cancelamentos;
- desempenho por barbeiro;
- serviços mais realizados.

Somente agendamentos com status `CONCLUIDO` são considerados vendas.

## Perfis e permissões

O BookBarber possui dois perfis principais.

**CLIENTE:** pode utilizar o site, fazer reservas e consultar apenas os próprios agendamentos.

**ADMIN:** possui acesso ao painel administrativo, gerenciamento das entidades e dashboard de vendas.

As permissões são validadas no backend, evitando que o controle de acesso dependa apenas de elementos ocultos na interface.

## Arquitetura

```text
Cliente / navegador
        ↓
Frontend — HTML, CSS e JavaScript
        ↓
API — NestJS + TypeScript
        ↓
Prisma ORM
        ↓
PostgreSQL — Supabase
```

O frontend e o backend são publicados separadamente na Vercel. O banco PostgreSQL é hospedado no Supabase.

## Tecnologias utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- TypeScript
- NestJS
- Prisma ORM 7

### Banco de dados

- PostgreSQL
- Supabase

### Versionamento e deploy

- Git
- GitHub
- Vercel

## Estrutura do repositório

```text
BookBarber/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── admin.html
│   ├── dashboard.html
│   ├── minhas-reservas.html
│   ├── api.js
│   ├── script.js
│   └── ...
│
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── package.json
│   ├── prisma.config.ts
│   └── ...
│
└── README.md
```

## Entidades principais

- **Usuario** — conta, autenticação e perfil de acesso;
- **Cliente** — dados utilizados nos agendamentos;
- **Barbeiro** — profissionais disponíveis;
- **Servico** — serviços oferecidos pela barbearia;
- **Agendamento** — relação entre cliente, serviço, barbeiro, data e horário;
- **Produto** — produtos exibidos e administrados pelo sistema;
- **Configuracao** — informações gerais e horários de funcionamento.

## Fluxo de uma reserva

```text
Cliente faz login
      ↓
Escolhe serviço
      ↓
Escolhe barbeiro
      ↓
Escolhe data e horário disponível
      ↓
Backend verifica conflitos
      ↓
Dados da conta são associados à reserva
      ↓
Agendamento é salvo no PostgreSQL
      ↓
Reserva aparece em “Minhas reservas”
```

## Segurança e autenticação

As senhas são armazenadas de forma derivada com salt, e não em texto puro. Após o login, o backend fornece um token assinado utilizado nas rotas autenticadas.

A rota **Minhas reservas** identifica o cliente a partir da própria sessão, sem aceitar um identificador de outro cliente informado pelo navegador. Rotas administrativas exigem o perfil `ADMIN`.

## Banco e ORM

O BookBarber utiliza Prisma ORM para acessar um banco PostgreSQL hospedado no Supabase. O banco persiste contas, clientes, profissionais, serviços, produtos, configurações e agendamentos utilizados pelas diferentes áreas do sistema.

## Deploy

O sistema é publicado em dois projetos na Vercel:

- **Frontend:** arquivos da pasta `frontend`;
- **Backend:** API NestJS da pasta `backend`.

A API se conecta ao PostgreSQL do Supabase por variáveis de ambiente configuradas na plataforma. Senhas, URLs privadas do banco e chaves de autenticação não são armazenadas no repositório público.

## Estado do projeto

O MVP contempla frontend, backend, banco de dados por ORM, CRUD das principais entidades, autenticação, controle de acesso, reservas, painel administrativo, dashboard de vendas e deploy em ambiente web.

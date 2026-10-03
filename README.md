# BookBarber

Sistema web de barbearia desenvolvido como projeto acadêmico da disciplina **Programação IV**.

O BookBarber possui frontend, backend, banco de dados com ORM, autenticação, CRUDs administrativos, reserva de horários e estrutura preparada para deploy.

## Tecnologias

### Frontend

- HTML5
- CSS3
- JavaScript
- FullCalendar

### Backend

- TypeScript
- NestJS
- Prisma ORM 7
- PostgreSQL
- Supabase
- Node.js / npm

### Deploy

- Vercel para o frontend
- Vercel para o backend NestJS
- Supabase para o banco PostgreSQL

## Estrutura do projeto

```text
BookBarber/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── agendamentos/
│   │   ├── auth/
│   │   ├── barbeiros/
│   │   ├── clientes/
│   │   ├── configuracao/
│   │   ├── prisma/
│   │   ├── produtos/
│   │   └── servicos/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── admin.html
│   ├── api.js
│   ├── config.js
│   ├── script.js
│   └── ...
├── .gitignore
└── README.md
```

A pasta `.vscode/` **não é necessária para o funcionamento do projeto**. Ela é criada pelo VS Code ou por extensões para guardar configurações locais do editor. No frontend recebido havia apenas uma configuração do Live Preview. Ela deve permanecer ignorada pelo Git.

## Funcionalidades

### Cliente

- Criação de conta com nome, telefone, e-mail e senha
- Login com e-mail e senha
- Consulta de serviços, barbeiros e produtos
- Consulta de disponibilidade por dia
- Reserva de horário
- Escolha de serviço e barbeiro
- Dados pessoais do agendamento obtidos automaticamente da conta logada
- Bloqueio de conflito de horário para o mesmo barbeiro

### Administrador

- Login com perfil `ADMIN`
- Acesso protegido ao painel administrativo
- CRUD de clientes
- CRUD de barbeiros
- CRUD de serviços
- CRUD de produtos
- Visualização e alteração de agendamentos
- Alteração das configurações da barbearia

## Autenticação

As contas comuns usam o perfil:

```text
CLIENTE
```

O administrador usa:

```text
ADMIN
```

As senhas não são armazenadas em texto puro. O backend usa `scrypt` com salt para gerar o hash.

Após o login, o backend gera um token assinado com validade de 8 horas. O frontend salva esse token e o envia no cabeçalho `Authorization` das rotas protegidas.

O agendamento exige login. Nome, telefone e e-mail **não são enviados pelo formulário de reserva**: o backend identifica o usuário pelo token e usa os dados da conta.

## Banco de dados: Supabase

O projeto não usa mais SQLite. O banco agora é PostgreSQL hospedado no Supabase.

No Supabase, crie um projeto e abra a opção **Connect** para obter as strings de conexão.

O backend usa duas URLs:

```env
DATABASE_URL="...porta 6543..."
DIRECT_URL="...porta 5432..."
```

- `DATABASE_URL`: conexão com pool para o backend em execução, adequada ao ambiente serverless.
- `DIRECT_URL`: conexão usada pelo Prisma CLI para migrations.

Não envie essas URLs para o GitHub.

## Configurando o backend pela primeira vez

Abra o Git Bash na raiz do repositório:

```bash
cd BookBarber
```

Entre no backend:

```bash
cd backend
```

Crie o `.env`:

```bash
cp .env.example .env
```

Abra `backend/.env` e substitua as URLs de exemplo pelas URLs do seu projeto Supabase.

Exemplo:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:SENHA@REGIAO.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_REF:SENHA@REGIAO.pooler.supabase.com:5432/postgres"
PORT=3000
JWT_SECRET="uma-chave-grande-e-dificil-de-adivinhar"
FRONTEND_URL="http://127.0.0.1:5500"
ADMIN_NOME="Administrador"
ADMIN_TELEFONE="(00) 00000-0000"
ADMIN_EMAIL="admin@bookbarber.com"
ADMIN_PASSWORD="troque-esta-senha"
```

Instale as dependências:

```bash
npm install
```

Crie as tabelas no Supabase e execute o seed:

```bash
npm run setup
```

Inicie o backend:

```bash
npm run start:dev
```

A API local ficará em:

```text
http://localhost:3000/api
```

## Rodando o frontend localmente

Na raiz `BookBarber/`, abra a pasta no VS Code e use Live Server/Live Preview em:

```text
frontend/index.html
```

Enquanto estiver desenvolvendo localmente, `frontend/api.js` usa por padrão:

```text
http://localhost:3000/api
```

## Deploy recomendado na Vercel

O caminho mais simples para este projeto é criar **dois projetos Vercel ligados ao mesmo repositório**.

### 1. Backend

Crie um projeto Vercel e configure:

```text
Root Directory: backend
```

Adicione no painel da Vercel as variáveis:

```text
DATABASE_URL
DIRECT_URL
JWT_SECRET
FRONTEND_URL
ADMIN_NOME
ADMIN_TELEFONE
ADMIN_EMAIL
ADMIN_PASSWORD
```

`DATABASE_URL` deve usar a conexão pooled do Supabase.

Antes do primeiro deploy, ou após criar migrations novas, execute localmente na pasta `backend/`:

```bash
npm run db:deploy
npm run prisma:seed
```

Depois publique o backend e copie sua URL, por exemplo:

```text
https://bookbarber-api.vercel.app
```

### 2. Frontend

Crie outro projeto Vercel usando o mesmo repositório e configure:

```text
Root Directory: frontend
```

Antes de publicar, configure no frontend a URL da API para apontar para o backend publicado, incluindo `/api`:

```text
https://bookbarber-api.vercel.app/api
```

Depois que o frontend tiver sua URL definitiva, coloque essa URL em `FRONTEND_URL` no projeto do backend e faça um novo deploy do backend.

## Principais rotas da API

### Públicas

| Método | Rota | Função |
|---|---|---|
| POST | `/api/cadastro` | Criar conta de cliente |
| POST | `/api/login` | Fazer login |
| GET | `/api/configuracao` | Consultar configuração pública |
| GET | `/api/produtos` | Listar produtos ativos |
| GET | `/api/servicos` | Listar serviços ativos |
| GET | `/api/barbeiros` | Listar barbeiros ativos |
| GET | `/api/agendamentos/disponibilidade` | Consultar horários disponíveis |

### Usuário autenticado

| Método | Rota | Função |
|---|---|---|
| GET | `/api/me` | Consultar a conta logada |
| POST | `/api/agendamentos/reservar` | Criar reserva usando os dados da conta |

### Administrador

As demais operações administrativas exigem token de uma conta com perfil `ADMIN`.

## Scripts do backend

```bash
npm run start:dev       # inicia o NestJS em desenvolvimento
npm run build           # compila o backend
npm run start:prod      # executa o build localmente
npm run setup           # generate + migrate deploy + seed
npm run db:deploy       # aplica migrations existentes
npm run prisma:generate # gera o Prisma Client
npm run prisma:migrate  # cria/aplica migrations em desenvolvimento
npm run prisma:push     # sincroniza o schema sem criar migration
npm run prisma:seed     # insere dados iniciais/admin
npm run prisma:studio   # abre o Prisma Studio
```

## Arquivos que não devem ir para o GitHub

```text
backend/.env
backend/node_modules/
backend/dist/
backend/generated/
.vscode/
```

Não existe mais `backend/dev.db`, pois o banco passou a ser PostgreSQL/Supabase.

## Estado do MVP

O projeto possui:

- frontend;
- backend;
- banco PostgreSQL com Prisma ORM;
- autenticação;
- CRUDs;
- integração entre frontend e backend;
- reserva de horários com verificação de conflito;
- estrutura preparada para deploy.

Para concluir o trabalho acadêmico, o grupo ainda deve confirmar:

- testes finais do fluxo completo;
- criação/configuração do projeto Supabase;
- deploy do backend na Vercel;
- deploy do frontend na Vercel;
- revisão final do repositório GitHub;
- gravação do vídeo de apresentação de 5 a 10 minutos.

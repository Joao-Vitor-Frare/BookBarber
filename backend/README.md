# BookBarber — Backend

O backend do **BookBarber** concentra as regras de negócio, autenticação, controle de acesso, persistência dos dados e integração entre o frontend e o banco PostgreSQL do Supabase.

## Papel do backend no sistema

O frontend nunca acessa o banco diretamente. As páginas HTML/JavaScript fazem requisições HTTP para a API NestJS, que valida os dados, verifica a sessão do usuário, aplica as permissões e usa o Prisma ORM para consultar ou alterar o PostgreSQL.

Fluxo geral:

```text
Frontend (Vercel)
        ↓ HTTP/JSON
Backend NestJS (Vercel)
        ↓ Prisma ORM
PostgreSQL (Supabase)
```

## Tecnologias

- **Node.js** e **TypeScript**
- **NestJS** para a API
- **Prisma ORM 7** para acesso ao banco
- **PostgreSQL** hospedado no Supabase
- autenticação por token assinado
- Vercel para publicação da API

## Perfis de usuário

### CLIENTE

É o perfil atribuído automaticamente às contas criadas pelo site. Um cliente pode:

- entrar e manter uma sessão autenticada;
- consultar serviços, produtos, barbeiros e configuração pública;
- consultar horários disponíveis;
- criar uma reserva usando os dados da própria conta;
- acessar **Minhas reservas**, vendo somente os próprios agendamentos.

### ADMIN

Além das operações comuns de uma conta autenticada, o administrador pode:

- consultar todos os agendamentos;
- alterar o status de agendamentos;
- criar, editar e remover barbeiros;
- criar, editar e remover serviços;
- criar, editar e remover produtos;
- alterar as configurações da barbearia;
- acessar o dashboard de vendas.

As permissões administrativas são verificadas no backend, e não apenas escondidas no frontend.

## Funcionalidades principais

### Autenticação

O cadastro cria uma conta com nome, telefone, e-mail e senha. A senha não é armazenada em texto puro. No login, a API devolve um token que identifica a sessão e o perfil do usuário.

Rotas principais:

- `POST /api/cadastro`
- `POST /api/login`
- `GET /api/me`

### Agendamentos

O cliente escolhe serviço, barbeiro, data e horário. O backend valida se a barbearia funciona naquele dia, se o horário faz parte da agenda configurada e se já existe conflito para o barbeiro escolhido.

Os dados pessoais do agendamento vêm da conta autenticada; o cliente não precisa preencher novamente nome, e-mail e telefone ao reservar.

Rotas relevantes:

- `GET /api/agendamentos/disponibilidade`
- `POST /api/agendamentos/reservar`
- `GET /api/agendamentos/minhas`

As operações administrativas de listagem completa, alteração e exclusão permanecem restritas ao perfil `ADMIN`.

### Minhas reservas

A rota `GET /api/agendamentos/minhas` usa a identidade da sessão para localizar o cadastro de cliente correspondente e retorna apenas os agendamentos daquela conta. Não é aceito um `clienteId` fornecido pelo navegador para essa consulta, evitando que um cliente veja reservas de outra pessoa.

### Dashboard de vendas

O dashboard administrativo considera como venda somente agendamentos com status `CONCLUIDO`. Agendamentos ainda marcados e cancelados são contabilizados separadamente.

A rota:

- `GET /api/dashboard/vendas?mes=YYYY-MM`

retorna, para o mês selecionado:

- valor total vendido;
- quantidade de atendimentos concluídos;
- ticket médio;
- quantidade de agendamentos ainda marcados;
- quantidade de cancelamentos;
- vendas por barbeiro;
- serviços mais realizados.

Essa rota é exclusiva de `ADMIN`.

## Entidades do banco

### Usuario

Representa a conta usada para autenticação. Armazena nome, e-mail, telefone, hash da senha e perfil (`CLIENTE` ou `ADMIN`).

### Cliente

Representa os dados do cliente utilizados nos agendamentos. A conta de usuário e o cliente são sincronizados pelo e-mail.

### Barbeiro

Armazena os profissionais disponíveis, especialidade e estado ativo/inativo.

### Servico

Contém nome, descrição, preço em centavos, duração e estado ativo/inativo.

### Agendamento

Relaciona cliente, barbeiro e serviço e armazena data, hora, observações e status (`AGENDADO`, `CONCLUIDO` ou `CANCELADO`).

### Produto

Representa os produtos exibidos no site e administrados pelo painel.

### Configuracao

Armazena dados gerais da barbearia, banner, contato e horários de funcionamento.

## Organização do código

```text
src/
├── auth/             autenticação, token e permissões
├── clientes/         CRUD de clientes
├── barbeiros/        CRUD de barbeiros
├── servicos/         CRUD de serviços
├── agendamentos/     reservas, disponibilidade e administração da agenda
├── produtos/         CRUD de produtos
├── configuracao/     dados e horários da barbearia
├── dashboard/        resumo de vendas
├── prisma/           conexão com o banco
├── app.module.ts     composição dos módulos
└── main.ts           inicialização, prefixo /api, validação e CORS
```

## Integração com o frontend

Em produção, o frontend chama a API publicada na Vercel, atualmente sob o prefixo `/api`. O backend permite por CORS o domínio oficial configurado em `FRONTEND_URL` e os previews do projeto `bookbarber-frontend` na Vercel.

O arquivo `frontend/api.js` concentra as chamadas HTTP usadas pelas páginas do site, do painel administrativo, do dashboard e de **Minhas reservas**.

## Deploy

O projeto é dividido em dois deploys na Vercel usando o mesmo repositório:

- projeto do frontend com `frontend` como diretório raiz;
- projeto do backend com `backend` como diretório raiz.

O backend utiliza o PostgreSQL do Supabase por meio das variáveis de ambiente configuradas diretamente na Vercel. Credenciais reais não ficam versionadas no GitHub.

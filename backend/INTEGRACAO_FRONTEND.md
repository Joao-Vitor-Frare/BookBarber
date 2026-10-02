# Integração com o frontend

A integração está aplicada nos arquivos da raiz do projeto.

- `api.js`: cliente HTTP centralizado, armazenamento de sessão e envio do token nas rotas protegidas.
- `login.js`: cadastro e login usando `/api/cadastro` e `/api/login`.
- `script.js`: carrega configuração/produtos, consulta disponibilidade, envia reservas e preenche nome/e-mail do usuário conectado.
- `admin.js`: valida o perfil `ADMIN` antes de carregar o painel e gerencia configurações, barbeiros, serviços, produtos e agendamentos.
- `index.html`: possui entrada para login e exibe o atalho administrativo apenas para uma sessão de administrador válida.

## Rotas públicas

- `POST /api/cadastro`
- `POST /api/login`
- `GET /api/configuracao`
- `GET /api/produtos`
- `GET /api/servicos`
- `GET /api/barbeiros`
- `GET /api/agendamentos/disponibilidade`
- `POST /api/agendamentos/reservar`

## Rotas autenticadas

- `GET /api/me` — retorna o usuário da sessão.
- Operações administrativas de escrita e gerenciamento exigem perfil `ADMIN`.

Para trocar a URL do backend no futuro, altere o valor padrão em `api.js` ou defina `window.BOOKBARBER_API_URL` antes de carregar o arquivo.

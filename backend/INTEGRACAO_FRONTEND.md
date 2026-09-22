# Integração com o frontend

A integração já está aplicada nos arquivos da raiz do projeto.

- `api.js`: cliente HTTP centralizado em `http://localhost:3000/api`.
- `script.js`: carrega configuração/produtos da API, consulta disponibilidade e envia reservas.
- `admin.js`: salva configuração e gerencia barbeiros, serviços, produtos e agendamentos.
- `index.html`: possui modal de reserva com nome, e-mail, telefone, serviço e barbeiro.

Para trocar a URL do backend no futuro, altere o valor padrão em `api.js` ou defina `window.BOOKBARBER_API_URL` antes de carregar o arquivo.

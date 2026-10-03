# Integração com o frontend

O frontend fica em `frontend/` e o backend em `backend/`.

## Cadastro

O frontend envia:

```json
{
  "nome": "Cliente",
  "telefone": "49999999999",
  "email": "cliente@teste.com",
  "senha": "123456"
}
```

O backend cria a conta `CLIENTE` e sincroniza nome, e-mail e telefone com a entidade `Cliente`.

## Reserva

O frontend envia somente os dados do agendamento:

```json
{
  "data": "2026-10-10",
  "hora": "14:00",
  "servicoId": 1,
  "barbeiroId": 1,
  "observacoes": "Opcional"
}
```

A rota exige `Authorization: Bearer <token>`. Nome, telefone e e-mail são obtidos da conta identificada pelo token.

## Desenvolvimento local

API:

```text
http://localhost:3000/api
```

## Produção

Se frontend e backend forem projetos Vercel separados, o frontend deve usar a URL pública do backend, por exemplo:

```text
https://bookbarber-api.vercel.app/api
```

No backend, `FRONTEND_URL` deve receber a URL pública do frontend para o CORS.

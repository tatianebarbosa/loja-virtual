# Loja Virtual

Projeto simples de loja virtual com backend em Express e frontend estático.

## Como rodar

Instale as dependências do backend:

```bash
npm run install:backend
```

Inicie o projeto:

```bash
npm run dev
```

Acesse no navegador:

```txt
http://localhost:3001
```

## Rotas

- `GET /` abre a loja.
- `GET /api/produtos` lista os produtos.
- `GET /api/produtos/:id` busca um produto pelo id.

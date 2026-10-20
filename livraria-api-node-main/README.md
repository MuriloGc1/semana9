# Livraria API (Node.js + Express)

API REST de **Livros e Autores** com autenticação JWT, hash BCrypt, controle de acesso por perfil (RBAC) e documentação **OpenAPI 3.0** com Swagger UI.

## Como executar

```bash
npm install
cp .env.example .env   # opcional: defina JWT_SECRET
npm start
```

A API sobe em `http://localhost:3000`.

## Documentação

| Recurso | URL |
|---|---|
| Swagger UI (interativa) | http://localhost:3000/docs |
| Especificação OpenAPI (JSON) | http://localhost:3000/docs/api.json |
| Alias do JSON | http://localhost:3000/api-docs.json |

### Testando rotas protegidas no Swagger UI

1. Abra `/docs` e execute `POST /api/v1/auth/login` com um usuário de demonstração.
2. Copie o `token` da resposta.
3. Clique em **Authorize**, cole o token (sem o prefixo `Bearer`) e confirme.
4. Teste as rotas com cadeado (comentários, autores, livros).

### Usuários de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| ADMIN | admin@livraria.com | admin123 |
| USER | leitor@gmail.com | leitor123 |

> Se já existir um `database.txt` antigo, apague-o para recriar os usuários com hashes BCrypt válidos.

## Matriz de endpoints

| Método | Rota | Acesso | Sucesso | Falhas documentadas |
|---|---|---|---|---|
| GET | `/api/v1/livros` | Público | 200 | 500 |
| GET | `/api/v1/livros/{id}` | Público | 200 | 404 |
| POST | `/api/v1/auth/register` | Público | 201 | 400, 409 |
| POST | `/api/v1/auth/login` | Público | 200 | 400, 401 |
| POST | `/api/v1/livros/{id}/comentarios` | USER ou ADMIN | 201 | 400, 401, 404 |
| POST | `/api/v1/autores` | ADMIN | 201 | 400, 401, 403 |
| POST | `/api/v1/livros` | ADMIN | 201 | 400, 401, 403, 404 |
| GET | `/api/v1/autores` | Público | 200 | 500 |

Falhas de validação retornam **400 Bad Request** com o formato `{ "erro": "mensagem" }`.

## Segurança

- Senhas com hash **BCrypt** (`bcryptjs`, 10 rounds).
- Autenticação **stateless** com JWT (`jsonwebtoken`), expiração padrão de 1h.
- Middleware `autenticarToken` (401 para token ausente, expirado ou inválido) e `exigirRole('ADMIN')` (403).
- O cadastro público (`/auth/register`) sempre cria usuários `USER`; o perfil não é aceito no corpo da requisição.

## Estrutura

```
config/        configuração do JWT
controllers/   camada HTTP
docs/          definição OpenAPI (swagger-jsdoc)
middlewares/   autenticação, RBAC e tratamento de erros
repositories/  persistência em arquivo (database.txt)
routes/        rotas + anotações @openapi
services/      regras de negócio
```

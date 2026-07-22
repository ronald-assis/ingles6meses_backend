# Inglês em 6 Meses — Backend

API REST da plataforma. Stack: **Node.js + Express + TypeScript + Prisma + PostgreSQL**.
Autenticação por **JWT**, senhas com **bcrypt**. Arquitetura em camadas (rotas → services → Prisma),
seguindo os documentos 03, 04 e 06 do Obsidian.

## Rodar com Docker (recomendado)
Na **raiz do repositório** (`ingles6meses/`):

```bash
cp .env.example .env          # ajuste as senhas
docker compose up -d --build  # sobe Postgres + API
```
A API sobe em http://localhost:3333 e aplica as migrations automaticamente.
Para popular dados de exemplo:
```bash
docker compose exec backend npm run seed
```

## Rodar localmente (sem Docker para a API)
Precisa de um PostgreSQL acessível (pode subir só o banco com `docker compose up -d db`).

```bash
cd backend
cp ../.env.example .env        # e ajuste DATABASE_URL para localhost
npm install
npx prisma migrate dev         # cria as tabelas
npm run seed                   # dados de exemplo
npm run dev                    # API em http://localhost:3333
```

## Documentação Swagger
Com a API rodando, acesse **http://localhost:3333/docs** (Swagger UI interativo).
O JSON da spec OpenAPI fica em **http://localhost:3333/docs.json**.

## Endpoints (prefixo `/api/v1`)
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/auth/register` | — | Cadastro (nome, email, senha) |
| POST | `/auth/login` | — | Login → `{ token, user }` |
| GET | `/me` | ✅ | Dados + stats do usuário (XP, streak, nível) |
| GET | `/cursos` | ✅ | Lista cursos publicados (busca/categoria) |
| GET | `/cursos/:id` | ✅ | Curso com módulos, aulas e progresso |
| POST | `/cursos/:id/matricula` | ✅ | Matricula o aluno |
| GET | `/aulas/:id` | ✅ | Detalhe da aula |
| POST | `/aulas/:id/concluir` | ✅ | Marca/desmarca conclusão (dá XP) |
| GET | `/quiz/:id` | ✅ | Quiz com questões e alternativas |
| POST | `/quiz/:id/tentativa` | ✅ | Envia respostas → pontuação |

Envie o token em `Authorization: Bearer <token>`.

## Usuário de teste (após o seed)
- e-mail: `aluno@exemplo.com`
- senha: `123456`

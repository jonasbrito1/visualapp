# 🐢 VisualApp — Visual Fashion Kids

> Plataforma de moda infantil personalizada com recomendações por IA

## Stack
- **Frontend/Backend:** Next.js 15 + TypeScript
- **Estilização:** Tailwind CSS + shadcn/ui
- **Banco de dados:** PostgreSQL 16 + Prisma ORM
- **Auth:** NextAuth.js v5 (email/senha)
- **IA:** Claude (Anthropic) para recomendações
- **Storage:** MinIO (S3 local)
- **Cache:** Redis 7
- **Containers:** Docker + Docker Compose

## Portas
| Serviço         | Porta  |
|-----------------|--------|
| Web App (cliente) | 3100 |
| Admin Panel     | 3110   |
| PostgreSQL      | 5480   |
| Redis           | 6399   |
| MinIO (API)     | 9100   |
| MinIO (Console) | 9101   |
| Prisma Studio   | 5555   |

## Setup Rápido

```bash
# 1. Subir infraestrutura Docker
docker compose up -d postgres redis minio

# 2. Instalar dependências
npm install

# 3. Setup do banco
cd packages/database
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed

# 4. Iniciar apps (modo desenvolvimento)
npm run dev
```

## Acessos

| Recurso         | URL                        |
|-----------------|----------------------------|
| Web App         | http://localhost:3100      |
| Admin Panel     | http://localhost:3110      |
| Prisma Studio   | http://localhost:5555      |
| MinIO Console   | http://localhost:9101      |

**Admin padrão:**
- Email: `admin@visualfashionkids.com.br`
- Senha: `Admin@2024!`

> ⚠️ Trocar a senha após o primeiro login!

## Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha as variáveis,
principalmente `ANTHROPIC_API_KEY` para as recomendações por IA.

## Estrutura

```
visualapp/
├── apps/
│   ├── web/          # App do cliente (porta 3100)
│   └── admin/        # Painel admin (porta 3110)
├── packages/
│   └── database/     # Prisma schema + client
├── docker/
│   └── postgres/     # Init SQL
├── docker-compose.yml
└── setup.sh
```

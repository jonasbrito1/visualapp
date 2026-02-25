# Deploy no Vercel — VisualApp

## Estrutura de projetos no Vercel

Criar **2 projetos separados** no Vercel:

| Projeto Vercel | Root Directory | App |
|---|---|---|
| `visualapp-web` | `apps/web` | App do cliente (porta 3100) |
| `visualapp-admin` | `apps/admin` | Painel admin (porta 3110) |

---

## 1. Banco de dados para produção

O PostgreSQL local (Docker) **não funciona no Vercel**.
Use um dos serviços abaixo (todos têm plano gratuito para demo):

| Serviço | Free tier | Link |
|---|---|---|
| **Neon** (recomendado) | 512MB | https://neon.tech |
| Supabase | 500MB | https://supabase.com |
| Railway | $5/mês | https://railway.app |

**Após criar o banco:**
1. Copie a `DATABASE_URL` gerada (formato: `postgresql://user:pass@host/db?sslmode=require`)
2. Execute as migrations remotamente:
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx tsx packages/database/prisma/seed.ts
```

---

## 2. Variáveis de ambiente no Vercel

### App Web (`visualapp-web`)

| Variável | Valor |
|---|---|
| `DATABASE_URL` | URL do PostgreSQL (Neon/Supabase) |
| `NEXTAUTH_URL` | `https://seu-projeto.vercel.app` |
| `NEXTAUTH_SECRET` | String aleatória ≥ 32 chars (use: `openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | `https://seu-projeto.vercel.app` |
| `NEXT_PUBLIC_ADMIN_URL` | `https://admin-visualapp.vercel.app` |
| `ANTHROPIC_API_KEY` | Chave da API Claude (https://console.anthropic.com) |
| `MINIO_ENDPOINT` | Host do storage em produção |
| `MINIO_ACCESS_KEY` | Access key do MinIO/S3 |
| `MINIO_SECRET_KEY` | Secret key do MinIO/S3 |
| `MINIO_BUCKET` | `visualapp` |
| `MINIO_USE_SSL` | `true` |
| `STRIPE_PUBLISHABLE_KEY` | Chave pública do Stripe (pagamentos) |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe |

### App Admin (`visualapp-admin`)

| Variável | Valor |
|---|---|
| `DATABASE_URL` | Mesma URL do banco |
| `NEXTAUTH_URL` | `https://admin-visualapp.vercel.app` |
| `NEXTAUTH_SECRET` | String **diferente** do web app |
| `NEXT_PUBLIC_APP_URL` | URL do web app |
| `NEXT_PUBLIC_ADMIN_URL` | URL do admin |
| `MINIO_ENDPOINT` | Mesmo do web |
| `MINIO_ACCESS_KEY` | Mesmo do web |
| `MINIO_SECRET_KEY` | Mesmo do web |
| `MINIO_BUCKET` | `visualapp` |
| `MINIO_USE_SSL` | `true` |

---

## 3. Configuração do projeto no Vercel

Para cada projeto:

1. **Framework Preset:** Next.js
2. **Root Directory:** `apps/web` (ou `apps/admin`)
3. **Build Command:** `cd ../.. && npm run build --filter=@visualapp/web`
   (ou `--filter=@visualapp/admin`)
4. **Install Command:** `cd ../.. && npm install`
5. **Output Directory:** `.next` (padrão)

---

## 4. Storage de imagens em produção

Para uploads de fotos de produtos, use uma das opções:
- **Cloudflare R2** (S3-compatível, free tier generoso)
- **Backblaze B2** (S3-compatível, 10GB gratuito)
- **Vercel Blob** (integrado ao Vercel)

---

## 5. Checklist pré-deploy

- [ ] Banco criado e `DATABASE_URL` configurada
- [ ] Migrations executadas no banco de produção
- [ ] Seed executado (admin + categorias)
- [ ] `NEXTAUTH_SECRET` gerado (diferente para cada app)
- [ ] `ANTHROPIC_API_KEY` configurada
- [ ] `NEXTAUTH_URL` apontando para a URL correta do Vercel
- [ ] Variáveis configuradas nos dois projetos Vercel

---

## Desenvolvimento local

```bash
# Subir infraestrutura
docker compose up -d

# Instalar dependências
npm install

# Banco: gerar client + rodar migrations + seed
cd packages/database
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
cd ../..

# Iniciar apps (web: 3100, admin: 3110)
npm run dev
```

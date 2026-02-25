#!/bin/bash
# =============================================
# VisualApp - Setup Script
# =============================================
set -e

echo ""
echo "🐢 VisualApp - Setup Completo"
echo "================================"

# 1. Verificar Node e npm
echo ""
echo "1️⃣  Verificando Node.js..."
node --version
npm --version

# 2. Instalar dependências
echo ""
echo "2️⃣  Instalando dependências..."
npm install

# 3. Subir Docker
echo ""
echo "3️⃣  Subindo serviços Docker..."
echo "    PostgreSQL  → porta 5480"
echo "    Redis       → porta 6399"
echo "    MinIO       → porta 9100 (console: 9101)"
echo "    Prisma UI   → porta 5555"
docker compose up -d postgres redis minio
echo "    Aguardando serviços ficarem saudáveis..."
sleep 8

# 4. Gerar Prisma Client
echo ""
echo "4️⃣  Gerando Prisma Client..."
cd packages/database && npm install && npx prisma generate && cd ../..

# 5. Migrar banco
echo ""
echo "5️⃣  Executando migrations do banco..."
cd packages/database && npx prisma migrate dev --name init && cd ../..

# 6. Seed
echo ""
echo "6️⃣  Populando dados iniciais..."
cd packages/database && npm run db:seed && cd ../..

echo ""
echo "✅ Setup concluído!"
echo ""
echo "🚀 Para iniciar os apps:"
echo "   npm run dev"
echo ""
echo "📱 URLs:"
echo "   Web App:     http://localhost:3100"
echo "   Admin:       http://localhost:3110"
echo "   Prisma UI:   http://localhost:5555"
echo "   MinIO:       http://localhost:9101"
echo ""
echo "🔐 Admin padrão:"
echo "   E-mail:  admin@visualfashionkids.com.br"
echo "   Senha:   Admin@2024!"
echo ""
echo "⚠️  IMPORTANTE: Troque a senha do admin após o primeiro login!"

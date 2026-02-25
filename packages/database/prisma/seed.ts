import { PrismaClient, Gender, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Admin user
  const adminPassword = await bcrypt.hash("Admin@2024!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@visualfashionkids.com.br" },
    update: {},
    create: {
      email: "admin@visualfashionkids.com.br",
      password: adminPassword,
      name: "Administrador",
      role: Role.ADMIN,
      lgpdConsent: true,
      lgpdConsentAt: new Date(),
      active: true,
    },
  });
  console.log("✅ Admin criado:", admin.email);

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "camisetas" },
      update: {},
      create: { name: "Camisetas", slug: "camisetas", order: 1, active: true },
    }),
    prisma.category.upsert({
      where: { slug: "calcas" },
      update: {},
      create: { name: "Calças", slug: "calcas", order: 2, active: true },
    }),
    prisma.category.upsert({
      where: { slug: "vestidos" },
      update: {},
      create: { name: "Vestidos", slug: "vestidos", order: 3, active: true },
    }),
    prisma.category.upsert({
      where: { slug: "conjuntos" },
      update: {},
      create: { name: "Conjuntos", slug: "conjuntos", order: 4, active: true },
    }),
    prisma.category.upsert({
      where: { slug: "shorts" },
      update: {},
      create: { name: "Shorts", slug: "shorts", order: 5, active: true },
    }),
    prisma.category.upsert({
      where: { slug: "moletom" },
      update: {},
      create: { name: "Moletom", slug: "moletom", order: 6, active: true },
    }),
    prisma.category.upsert({
      where: { slug: "fantasias" },
      update: {},
      create: { name: "Fantasias", slug: "fantasias", order: 7, active: true },
    }),
    prisma.category.upsert({
      where: { slug: "baby" },
      update: {},
      create: { name: "Baby", slug: "baby", order: 8, active: true },
    }),
  ]);
  console.log("✅ Categorias criadas:", categories.length);

  // Sample Products
  const camisetasCategory = categories.find((c) => c.slug === "camisetas")!;
  const calcasCategory = categories.find((c) => c.slug === "calcas")!;
  const vestidosCategory = categories.find((c) => c.slug === "vestidos")!;

  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: "camiseta-basica-rosa" },
      update: {},
      create: {
        name: "Camiseta Básica Rosa",
        slug: "camiseta-basica-rosa",
        description:
          "Camiseta básica de algodão, confortável para o dia a dia. Tecido macio e durável.",
        price: 39.9,
        comparePrice: 49.9,
        categoryId: camisetasCategory.id,
        brand: "Tip Top",
        gender: Gender.MENINA,
        ageMin: 24,
        ageMax: 120,
        colors: ["rosa", "branco"],
        tags: ["casual", "escola", "passeio", "básico"],
        material: "100% Algodão",
        featured: true,
        active: true,
        sizes: {
          create: [
            { size: "2", stock: 10 },
            { size: "4", stock: 8 },
            { size: "6", stock: 12 },
            { size: "8", stock: 5 },
            { size: "10", stock: 3 },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { slug: "calca-moletinho-verde" },
      update: {},
      create: {
        name: "Calça Moletinho Verde",
        slug: "calca-moletinho-verde",
        description:
          "Calça de moletinho sem felpa, leve e confortável. Perfeita para o dia a dia.",
        price: 49.9,
        categoryId: calcasCategory.id,
        brand: "Pingo Lele",
        gender: Gender.UNISSEX,
        ageMin: 24,
        ageMax: 144,
        colors: ["verde", "azul marinho"],
        tags: ["casual", "escola", "esporte", "moletinho"],
        material: "96% Algodão, 4% Elastano",
        featured: true,
        active: true,
        sizes: {
          create: [
            { size: "2", stock: 15 },
            { size: "4", stock: 10 },
            { size: "6", stock: 8 },
            { size: "8", stock: 6 },
            { size: "10", stock: 4 },
            { size: "12", stock: 2 },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { slug: "vestido-princesa-frozen" },
      update: {},
      create: {
        name: "Vestido Fantasia Princesa",
        slug: "vestido-princesa-frozen",
        description:
          "Fantasia de princesa com detalhes encantadores. Ideal para festas e eventos especiais.",
        price: 89.9,
        comparePrice: 119.9,
        categoryId: vestidosCategory.id,
        gender: Gender.MENINA,
        ageMin: 24,
        ageMax: 96,
        colors: ["azul", "rosa"],
        tags: ["festa", "fantasia", "princesa", "especial"],
        featured: true,
        active: true,
        sizes: {
          create: [
            { size: "2", stock: 5 },
            { size: "4", stock: 8 },
            { size: "6", stock: 6 },
            { size: "8", stock: 3 },
          ],
        },
      },
    }),
  ]);
  console.log("✅ Produtos criados:", products.length);

  // App Settings
  await prisma.appSetting.upsert({
    where: { key: "store_name" },
    update: {},
    create: { key: "store_name", value: "Visual Fashion Kids" },
  });
  await prisma.appSetting.upsert({
    where: { key: "store_phone" },
    update: {},
    create: { key: "store_phone", value: "(24) 99999-9999" },
  });
  await prisma.appSetting.upsert({
    where: { key: "store_address" },
    update: {},
    create: {
      key: "store_address",
      value: "Rua Abel Rodrigues Pontes, Resende - RJ, 27510010",
    },
  });
  await prisma.appSetting.upsert({
    where: { key: "lgpd_version" },
    update: {},
    create: { key: "lgpd_version", value: "1.0" },
  });

  console.log("✅ Configurações criadas");
  console.log("🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@visualapp/database";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const { childId } = await req.json();

    const child = await prisma.child.findFirst({
      where: { id: childId, userId: session.user.id, active: true },
    });

    if (!child) {
      return NextResponse.json({ message: "Criança não encontrada" }, { status: 404 });
    }

    // Busca produtos disponíveis
    const products = await prisma.product.findMany({
      where: { active: true },
      include: {
        category: true,
        sizes: { where: { stock: { gt: 0 } } },
        images: { where: { isPrimary: true }, take: 1 },
      },
      take: 50,
    });

    if (products.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    // Calcula idade da criança em meses
    const birthDate = new Date(child.birthDate);
    const now = new Date();
    const ageMonths =
      (now.getFullYear() - birthDate.getFullYear()) * 12 +
      (now.getMonth() - birthDate.getMonth());

    // Filtra produtos compatíveis com a idade
    const compatibleProducts = products.filter(
      (p) => p.ageMin <= ageMonths && p.ageMax >= ageMonths
    );

    const targetProducts = compatibleProducts.length > 0 ? compatibleProducts : products;

    // Prompt para Claude
    const childProfile = `
Criança: ${child.name}
Gênero: ${child.gender === "MENINO" ? "Menino" : child.gender === "MENINA" ? "Menina" : "Unissex"}
Idade: ${Math.floor(ageMonths / 12)} anos e ${ageMonths % 12} meses (${ageMonths} meses no total)
Tamanho de roupa: ${child.clothingSize}
Estilo preferido: ${child.stylePrefs.join(", ")}
Ocasiões: ${child.occasionPrefs.join(", ")}
Cores preferidas: ${child.colorPrefs.join(", ")}
${child.notes ? `Observações: ${child.notes}` : ""}
    `.trim();

    const productsText = targetProducts
      .slice(0, 20)
      .map(
        (p) =>
          `ID: ${p.id} | ${p.name} | Gênero: ${p.gender} | Categoria: ${p.category.name} | Tags: ${p.tags.join(", ")} | Cores: ${p.colors.join(", ")} | Preço: R$${p.price}`
      )
      .join("\n");

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Você é um especialista em moda infantil da loja Visual Fashion Kids.

Perfil da criança:
${childProfile}

Produtos disponíveis:
${productsText}

Selecione os 6 produtos mais adequados para esta criança e retorne SOMENTE um JSON válido no formato:
[{"productId": "id_do_produto", "score": 0.95, "reason": "motivo em português (max 80 chars)"}]

Ordene por relevância (score 0.0 a 1.0). Considere gênero, idade, estilo, cores e ocasiões.`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "[]";

    // Parse seguro do JSON
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    // Salva recomendações no banco
    const validRecs = recommendations.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r: any) => r.productId && targetProducts.find((p) => p.id === r.productId)
    );

    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validRecs.map((rec: any) =>
        prisma.recommendation.upsert({
          where: { childId_productId: { childId: child.id, productId: rec.productId } },
          update: { score: rec.score, reason: rec.reason },
          create: {
            childId: child.id,
            productId: rec.productId,
            score: rec.score,
            reason: rec.reason,
          },
        })
      )
    );

    // Busca dados completos dos produtos recomendados
    const recommendedProducts = await prisma.product.findMany({
      where: { id: { in: validRecs.map((r: { productId: string }) => r.productId) } },
      include: {
        category: true,
        images: { orderBy: { order: "asc" }, take: 2 },
        sizes: { where: { stock: { gt: 0 } } },
      },
    });

    const result = validRecs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((rec: any) => ({
        ...rec,
        product: recommendedProducts.find((p) => p.id === rec.productId),
      }))
      .filter((r: { product: unknown }) => r.product);

    return NextResponse.json({ recommendations: result });
  } catch (error) {
    console.error("[RECOMMENDATIONS]", error);
    return NextResponse.json(
      { message: "Erro ao gerar recomendações" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");

  if (!childId) {
    return NextResponse.json({ message: "childId é obrigatório" }, { status: 400 });
  }

  const recommendations = await prisma.recommendation.findMany({
    where: {
      childId,
      child: { userId: session.user.id },
    },
    orderBy: { score: "desc" },
    include: {
      product: {
        include: {
          category: true,
          images: { orderBy: { order: "asc" }, take: 1 },
          sizes: { where: { stock: { gt: 0 } } },
        },
      },
    },
  });

  return NextResponse.json(recommendations);
}

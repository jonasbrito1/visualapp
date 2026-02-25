import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@visualapp/database";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    include: {
      category: { select: { name: true } },
      sizes: { orderBy: { size: "asc" } },
      images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
    },
  });

  if (!product) {
    return NextResponse.json({ message: "Produto não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  });
}

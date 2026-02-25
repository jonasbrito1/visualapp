import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@visualapp/database";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          sizes: true,
        },
      },
    },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  const { productId, size, quantity = 1 } = await req.json();

  if (!productId || !size)
    return NextResponse.json({ message: "productId e size são obrigatórios" }, { status: 400 });

  const item = await prisma.cartItem.upsert({
    where: { userId_productId_size: { userId: session.user.id, productId, size } },
    update: { quantity: { increment: quantity } },
    create: { userId: session.user.id, productId, size, quantity },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  const { itemId } = await req.json();
  await prisma.cartItem.delete({ where: { id: itemId, userId: session.user.id } });

  return NextResponse.json({ success: true });
}

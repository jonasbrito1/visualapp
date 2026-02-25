import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@visualapp/database";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  if ((session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PROCESSING", "PAID", "FAILED", "REFUNDED"]).optional(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { name: true, images: { where: { isPrimary: true }, take: 1 } } },
        },
      },
      address: true,
    },
  });

  if (!order) return NextResponse.json({ message: "Pedido não encontrado" }, { status: 404 });

  return NextResponse.json({
    ...order,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shipping: Number(order.shipping),
    total: Number(order.total),
    items: order.items.map((item) => ({ ...item, price: Number(item.price) })),
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Dados inválidos" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(parsed.data.status && { status: parsed.data.status }),
      ...(parsed.data.paymentStatus && { paymentStatus: parsed.data.paymentStatus }),
      ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
    },
  });

  return NextResponse.json(order);
}

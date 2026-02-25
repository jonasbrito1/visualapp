import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@visualapp/database";
import { z } from "zod";
import { randomUUID } from "crypto";

const addressSchema = z.object({
  recipientName: z.string().min(2),
  zipCode: z.string().min(8),
  street: z.string().min(3),
  number: z.string().min(1),
  complement: z.string().optional(),
  district: z.string().min(2),
  city: z.string().min(2),
  state: z.string().length(2),
});

const checkoutSchema = z.object({
  address: addressSchema,
  paymentMethod: z.enum(["PIX", "CREDIT_CARD", "DEBIT_CARD"]),
});

/** Generate a fake Pix "copia e cola" code for demo purposes */
function generatePixCode(amount: number, orderId: string): string {
  const amountStr = amount.toFixed(2).replace(".", "");
  const txId = orderId.replace(/-/g, "").slice(0, 25).toUpperCase();
  return `00020126580014BR.GOV.BCB.PIX0136visualfashionkids@pix.com.br5204000053039865802BR5925Visual Fashion Kids LTDA6009Resende62070503${txId}63041234${amountStr}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Dados inválidos", errors: parsed.error.flatten() }, { status: 400 });
  }

  const { address, paymentMethod } = parsed.data;
  const userId = session.user.id;

  // Fetch cart items
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { select: { id: true, name: true, price: true } } },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ message: "Carrinho vazio" }, { status: 400 });
  }

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  const total = subtotal; // no shipping for demo

  const orderId = randomUUID();

  // Generate Pix code if PIX
  const pixCode = paymentMethod === "PIX" ? generatePixCode(total, orderId) : null;

  // Create order in transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        id: orderId,
        userId,
        status: "PENDING",
        paymentMethod,
        paymentStatus: "PENDING",
        subtotal,
        total,
        pixCode,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
        address: {
          create: {
            recipientName: address.recipientName,
            zipCode: address.zipCode,
            street: address.street,
            number: address.number,
            complement: address.complement ?? null,
            district: address.district,
            city: address.city,
            state: address.state.toUpperCase(),
          },
        },
      },
    });

    // Clear cart
    await tx.cartItem.deleteMany({ where: { userId } });

    return newOrder;
  });

  return NextResponse.json(
    { orderId: order.id, orderNumber: order.orderNumber, pixCode, total },
    { status: 201 }
  );
}

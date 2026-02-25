import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@visualapp/database";
import { z } from "zod";

const childSchema = z.object({
  name: z.string().min(2).max(60),
  birthDate: z.string().transform((s) => new Date(s)),
  gender: z.enum(["MENINO", "MENINA", "UNISSEX"]),
  clothingSize: z.string(),
  shoeSize: z.string().optional().nullable(),
  weight: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  stylePrefs: z.array(z.string()),
  occasionPrefs: z.array(z.string()),
  colorPrefs: z.array(z.string()),
  skinTone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const children = await prisma.child.findMany({
    where: { userId: session.user.id, active: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(children);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = childSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const child = await prisma.child.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
      },
    });

    return NextResponse.json(child, { status: 201 });
  } catch (error) {
    console.error("[CHILDREN POST]", error);
    return NextResponse.json(
      { message: "Erro ao cadastrar criança" },
      { status: 500 }
    );
  }
}

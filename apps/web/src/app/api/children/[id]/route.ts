import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@visualapp/database";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const child = await prisma.child.findFirst({
    where: { id, userId: session.user.id, active: true },
  });

  if (!child)
    return NextResponse.json({ message: "Não encontrado" }, { status: 404 });

  return NextResponse.json(child);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const child = await prisma.child.findFirst({
    where: { id, userId: session.user.id, active: true },
  });

  if (!child)
    return NextResponse.json({ message: "Não encontrado" }, { status: 404 });

  const updated = await prisma.child.update({
    where: { id },
    data: {
      name: body.name,
      birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
      gender: body.gender,
      clothingSize: body.clothingSize,
      shoeSize: body.shoeSize ?? null,
      height: body.height ? parseFloat(body.height) : null,
      weight: body.weight ? parseFloat(body.weight) : null,
      stylePrefs: body.stylePrefs,
      occasionPrefs: body.occasionPrefs,
      colorPrefs: body.colorPrefs,
      notes: body.notes ?? null,
      avatar: body.avatar ?? null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.child.update({
    where: { id, userId: session.user.id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@visualapp/database";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
  lgpdConsentAt: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone, password, lgpdConsentAt } = parsed.data;

    // Verifica se e-mail já existe
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { message: "E-mail já cadastrado" },
        { status: 409 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Captura IP para registro LGPD
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        password: hashedPassword,
        lgpdConsent: true,
        lgpdConsentAt: lgpdConsentAt ? new Date(lgpdConsentAt) : new Date(),
        lgpdConsentIp: ip,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Conta criada com sucesso!", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { message: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}

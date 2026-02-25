import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@visualapp/database";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional().nullable(),
  categoryId: z.string(),
  brand: z.string().optional(),
  gender: z.enum(["MENINO", "MENINA", "UNISSEX"]),
  ageMin: z.number().int().min(0),
  ageMax: z.number().int().min(1),
  colors: z.array(z.string()),
  tags: z.array(z.string()),
  material: z.string().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  sizes: z.array(z.object({
    size: z.string(),
    stock: z.number().int().min(0),
    sku: z.string().optional(),
  })),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    isPrimary: z.boolean().default(false),
  })).optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  if ((session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base;
  let i = 0;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    i++;
    slug = `${base}-${i}`;
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Dados inválidos", errors: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const slug = await uniqueSlug(slugify(data.name));

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      comparePrice: data.comparePrice ?? null,
      categoryId: data.categoryId,
      brand: data.brand,
      gender: data.gender,
      ageMin: data.ageMin,
      ageMax: data.ageMax,
      colors: data.colors,
      tags: data.tags,
      material: data.material,
      featured: data.featured,
      active: data.active,
      sizes: { create: data.sizes.map((s) => ({ size: s.size, stock: s.stock, sku: s.sku })) },
      images: data.images
        ? { create: data.images.map((img, i) => ({ url: img.url, alt: img.alt, isPrimary: img.isPrimary, order: i })) }
        : undefined,
    },
  });

  return NextResponse.json(product, { status: 201 });
}

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

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  price: z.number().positive().optional(),
  comparePrice: z.number().positive().optional().nullable(),
  categoryId: z.string().optional(),
  brand: z.string().optional().nullable(),
  gender: z.enum(["MENINO", "MENINA", "UNISSEX"]).optional(),
  ageMin: z.number().int().min(0).optional(),
  ageMax: z.number().int().min(1).optional(),
  colors: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  material: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  sizes: z.array(z.object({
    size: z.string(),
    stock: z.number().int().min(0),
    sku: z.string().optional().nullable(),
  })).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    isPrimary: z.boolean().default(false),
  })).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      sizes: { orderBy: { size: "asc" } },
      images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
    },
  });

  if (!product) return NextResponse.json({ message: "Produto não encontrado" }, { status: 404 });

  return NextResponse.json({
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Dados inválidos", errors: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Resolve slug if name changed
  let slug: string | undefined;
  if (data.name) {
    slug = await uniqueSlug(slugify(data.name), id);
  }

  const product = await prisma.$transaction(async (tx) => {
    // Replace sizes if provided
    if (data.sizes) {
      await tx.productSize.deleteMany({ where: { productId: id } });
    }
    // Replace images if provided
    if (data.images) {
      await tx.productImage.deleteMany({ where: { productId: id } });
    }

    return tx.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name, slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.comparePrice !== undefined && { comparePrice: data.comparePrice }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.brand !== undefined && { brand: data.brand }),
        ...(data.gender && { gender: data.gender }),
        ...(data.ageMin !== undefined && { ageMin: data.ageMin }),
        ...(data.ageMax !== undefined && { ageMax: data.ageMax }),
        ...(data.colors && { colors: data.colors }),
        ...(data.tags && { tags: data.tags }),
        ...(data.material !== undefined && { material: data.material }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.sizes && {
          sizes: { create: data.sizes.map((s) => ({ size: s.size, stock: s.stock, sku: s.sku ?? null })) },
        }),
        ...(data.images && {
          images: {
            create: data.images.map((img, i) => ({
              url: img.url,
              alt: img.alt ?? null,
              isPrimary: img.isPrimary,
              order: i,
            })),
          },
        }),
      },
      include: { sizes: true, images: true },
    });
  });

  return NextResponse.json(product);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

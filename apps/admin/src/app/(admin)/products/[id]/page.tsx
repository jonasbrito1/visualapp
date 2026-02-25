import { prisma } from "@visualapp/database";
import { notFound } from "next/navigation";
import ProductForm from "../_components/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        sizes: { orderBy: { size: "asc" } },
        images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
      },
    }),
    prisma.category.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
  ]);

  if (!product) notFound();

  const productData = {
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Editar produto</h1>
        <p className="text-gray-500 text-sm">{product.name}</p>
      </div>
      <ProductForm categories={categories} product={productData} />
    </div>
  );
}

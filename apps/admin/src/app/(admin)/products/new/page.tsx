import { prisma } from "@visualapp/database";
import ProductForm from "../_components/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Novo produto</h1>
        <p className="text-gray-500 text-sm">Preencha os dados do produto</p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}

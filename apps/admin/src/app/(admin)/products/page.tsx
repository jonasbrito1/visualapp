import { prisma } from "@visualapp/database";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Package } from "lucide-react";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      sizes: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
  });

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Produtos</h1>
          <p className="text-gray-500 text-sm">{products.length} produto(s) cadastrado(s)</p>
        </div>
        <Link
          href="/products/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo produto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border p-16 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-bold text-gray-500">Nenhum produto cadastrado</p>
          <p className="text-sm text-gray-400 mt-1">Clique em &quot;Novo produto&quot; para começar</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Produto</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Categoria</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Gênero</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Preço</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Estoque</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.images[0].url} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Package className="w-5 h-5 text-blue-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold leading-tight">{product.name}</p>
                          {product.brand && <p className="text-xs text-gray-400">{product.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        product.gender === "MENINA" ? "bg-pink-100 text-pink-700" :
                        product.gender === "MENINO" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {product.gender === "MENINA" ? "👧 Menina" : product.gender === "MENINO" ? "👦 Menino" : "🧒 Unissex"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-blue-600">{formatCurrency(Number(product.price))}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        totalStock === 0 ? "bg-red-100 text-red-700" :
                        totalStock <= 5 ? "bg-orange-100 text-orange-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {totalStock} peça{totalStock !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        product.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {product.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/products/${product.id}`}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 inline-flex"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

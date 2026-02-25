import { prisma } from "@visualapp/database";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      include: {
        category: true,
        images: { where: { isPrimary: true }, take: 1 },
        sizes: { where: { stock: { gt: 0 } } },
      },
    }),
    prisma.category.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Produtos</h1>
        <p className="text-muted-foreground text-sm">{products.length} item(ns) disponíveis</p>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
        <Link href="/products">
          <button className="flex-shrink-0 px-4 py-2 rounded-full border-2 border-primary bg-primary text-white text-sm font-semibold">
            Todos
          </button>
        </Link>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="flex-shrink-0 px-4 py-2 rounded-full border-2 border-border hover:border-primary text-sm font-semibold transition-colors"
          >
            {cat.name}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-bold text-muted-foreground">Nenhum produto disponível</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`}>
              <Card className="overflow-hidden card-hover cursor-pointer h-full">
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-green-50 relative">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-muted-foreground/20" />
                    </div>
                  )}
                  {product.featured && (
                    <Badge className="absolute top-2 left-2 text-xs bg-yellow-500 text-yellow-900">
                      ⭐ Destaque
                    </Badge>
                  )}
                  {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                    <Badge className="absolute top-2 right-2 text-xs bg-red-500">
                      -{Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)}%
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">{product.category.name}</p>
                  <p className="font-bold text-sm leading-tight line-clamp-2">{product.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="font-black text-primary">
                      {formatCurrency(Number(product.price))}
                    </span>
                    {product.comparePrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatCurrency(Number(product.comparePrice))}
                      </span>
                    )}
                  </div>
                  {product.sizes.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {product.sizes.slice(0, 4).map((s) => (
                        <span key={s.size} className="text-[10px] border rounded px-1.5 py-0.5 font-semibold text-muted-foreground">
                          {s.size}
                        </span>
                      ))}
                      {product.sizes.length > 4 && (
                        <span className="text-[10px] text-muted-foreground">+{product.sizes.length - 4}</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

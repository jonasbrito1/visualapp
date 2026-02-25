import { auth } from "@/lib/auth";
import { prisma } from "@visualapp/database";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, ShoppingBag, Star, ArrowRight } from "lucide-react";
import { formatCurrency, getAgeLabel } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id!;

  const [children, recentOrders, featuredProducts] = await Promise.all([
    prisma.child.findMany({
      where: { userId, active: true },
      take: 6,
    }),
    prisma.order.findMany({
      where: { userId },
      take: 3,
      orderBy: { createdAt: "desc" },
      include: {
        items: { take: 1, include: { product: true } },
      },
    }),
    prisma.product.findMany({
      where: { active: true, featured: true },
      take: 4,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
      },
    }),
  ]);

  const firstName = session!.user.name?.split(" ")[0] || "Mamãe/Papai";

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-black">
          Olá, {firstName}! 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {children.length > 0
            ? `Você tem ${children.length} ${children.length === 1 ? "perfil de criança" : "perfis de crianças"} cadastrado${children.length > 1 ? "s" : ""}`
            : "Cadastre o perfil da sua criança para receber recomendações"}
        </p>
      </div>

      {/* Children Cards */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Meus filhos</h2>
          <Link href="/children/new">
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Adicionar
            </Button>
          </Link>
        </div>

        {children.length === 0 ? (
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
            <CardContent className="py-10 text-center">
              <div className="text-5xl mb-3">🐢</div>
              <p className="font-bold mb-1">Nenhum filho cadastrado ainda</p>
              <p className="text-sm text-muted-foreground mb-4">
                Cadastre o perfil para receber recomendações personalizadas
              </p>
              <Link href="/children/new">
                <Button variant="brand" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Cadastrar agora
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {children.map((child) => (
              <Link key={child.id} href={`/children/${child.id}`}>
                <Card className="card-hover cursor-pointer border-2 hover:border-primary/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">
                      {child.avatar || (child.gender === "MENINA" ? "🦋" : child.gender === "MENINO" ? "🦁" : "🐢")}
                    </div>
                    <p className="font-bold text-sm truncate">{child.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getAgeLabel(child.birthDate)}
                    </p>
                    <div className="mt-2">
                      <Link href={`/children/${child.id}/recommendations`}>
                        <Button size="sm" variant="outline" className="text-xs gap-1 h-7 w-full">
                          <Sparkles className="w-3 h-3" />
                          Looks
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            <Link href="/children/new">
              <Card className="card-hover cursor-pointer border-2 border-dashed border-muted hover:border-primary/50 bg-muted/20">
                <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[120px]">
                  <Plus className="w-8 h-8 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground font-semibold text-center">
                    Adicionar filho
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Destaques da semana
            </h2>
            <Link href="/products">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`}>
                <Card className="card-hover cursor-pointer overflow-hidden">
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
                        <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                      <Badge className="absolute top-2 left-2 text-xs bg-red-500">
                        -{Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)}%
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">{product.category.name}</p>
                    <p className="font-bold text-sm leading-tight truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-black text-primary">
                        {formatCurrency(Number(product.price))}
                      </span>
                      {product.comparePrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatCurrency(Number(product.comparePrice))}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Pedidos recentes</h2>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="card-hover cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">
                        Pedido #{order.orderNumber.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.items[0]?.product?.name}
                        {order.items.length > 1 && ` +${order.items.length - 1}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          order.status === "DELIVERED" ? "success" :
                          order.status === "CANCELLED" ? "destructive" :
                          "info"
                        }
                        className="text-xs mb-1"
                      >
                        {order.status === "PENDING" && "Aguardando"}
                        {order.status === "CONFIRMED" && "Confirmado"}
                        {order.status === "PREPARING" && "Preparando"}
                        {order.status === "SHIPPED" && "Enviado"}
                        {order.status === "DELIVERED" && "Entregue"}
                        {order.status === "CANCELLED" && "Cancelado"}
                      </Badge>
                      <p className="font-black text-sm text-primary">
                        {formatCurrency(Number(order.total))}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

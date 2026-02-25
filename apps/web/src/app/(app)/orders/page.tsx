import { auth } from "@/lib/auth";
import { prisma } from "@visualapp/database";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; variant: "info" | "success" | "warning" | "destructive" | "outline" }> = {
  PENDING:   { label: "Aguardando pagamento", variant: "warning" },
  CONFIRMED: { label: "Confirmado", variant: "info" },
  PREPARING: { label: "Em preparação", variant: "info" },
  SHIPPED:   { label: "Enviado", variant: "info" },
  DELIVERED: { label: "Entregue", variant: "success" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
};

export default async function OrdersPage() {
  const session = await auth();
  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id! },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: { select: { name: true } } },
        take: 2,
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2">
        <Package className="w-6 h-6" /> Meus Pedidos
      </h1>

      {orders.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-14 text-center">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-bold mb-1">Nenhum pedido ainda</p>
            <p className="text-sm text-muted-foreground">Seus pedidos aparecerão aqui</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="card-hover cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-black text-sm">
                        Pedido #{order.orderNumber.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <Badge variant={STATUS_CONFIG[order.status]?.variant || "outline"} className="text-xs">
                      {STATUS_CONFIG[order.status]?.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {order.items.map((i) => i.product.name).join(", ")}
                  </p>
                  <p className="font-black text-primary mt-2">
                    {formatCurrency(Number(order.total))}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

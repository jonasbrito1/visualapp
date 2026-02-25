import { auth } from "@/lib/auth";
import { prisma } from "@visualapp/database";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, MapPin, CreditCard, QrCode, ArrowLeft } from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; variant: "info" | "success" | "warning" | "destructive" | "outline"; step: number }> = {
  PENDING:   { label: "Aguardando pagamento", variant: "warning", step: 0 },
  CONFIRMED: { label: "Confirmado",           variant: "info",    step: 1 },
  PREPARING: { label: "Em preparação",        variant: "info",    step: 2 },
  SHIPPED:   { label: "Enviado",              variant: "info",    step: 3 },
  DELIVERED: { label: "Entregue",             variant: "success", step: 4 },
  CANCELLED: { label: "Cancelado",            variant: "destructive", step: -1 },
};

const STEPS = ["Aguardando", "Confirmado", "Preparando", "Enviado", "Entregue"];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const order = await prisma.order.findUnique({
    where: { id, userId: session!.user.id! },
    include: {
      items: {
        include: { product: { select: { name: true, images: { where: { isPrimary: true }, take: 1 } } } },
      },
      address: true,
    },
  });

  if (!order) notFound();

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Link
        href="/orders"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Meus pedidos
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-black">
            Pedido #{order.orderNumber.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {STEPS.map((label, i) => (
                <div key={label} className="flex flex-col items-center gap-1 flex-1">
                  <div className="relative flex items-center w-full">
                    {i > 0 && (
                      <div className={`absolute right-1/2 top-3 w-full h-0.5 ${
                        i <= status.step ? "bg-primary" : "bg-border"
                      }`} />
                    )}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 mx-auto ${
                      i < status.step ? "bg-primary text-white" :
                      i === status.step ? "bg-primary text-white ring-4 ring-primary/20" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {i < status.step ? "✓" : i + 1}
                    </div>
                  </div>
                  <p className="text-[10px] font-semibold text-center leading-tight text-muted-foreground">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="w-4 h-4" /> Itens do pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex-shrink-0 overflow-hidden">
                {item.product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product.images[0].url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-200" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">
                  Tamanho: {item.size} • Qtd: {item.quantity}
                </p>
              </div>
              <p className="font-bold text-sm">{formatCurrency(Number(item.price) * item.quantity)}</p>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between font-black">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(Number(order.total))}</span>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      {order.address && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Endereço de entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm space-y-0.5">
            <p className="font-semibold">{order.address.recipientName}</p>
            <p className="text-muted-foreground">
              {order.address.street}, {order.address.number}
              {order.address.complement && ` — ${order.address.complement}`}
            </p>
            <p className="text-muted-foreground">
              {order.address.district}, {order.address.city} — {order.address.state}
            </p>
            <p className="text-muted-foreground">CEP: {order.address.zipCode}</p>
          </CardContent>
        </Card>
      )}

      {/* Payment */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {order.paymentMethod === "PIX" ? <QrCode className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
            Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Método</span>
            <span className="font-semibold">
              {order.paymentMethod === "PIX" ? "Pix" : order.paymentMethod === "CREDIT_CARD" ? "Cartão de crédito" : "Cartão de débito"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className={`font-semibold ${order.paymentStatus === "PAID" ? "text-green-600" : "text-yellow-600"}`}>
              {order.paymentStatus === "PAID" ? "Pago" : order.paymentStatus === "FAILED" ? "Falhou" : "Aguardando"}
            </span>
          </div>

          {order.pixCode && order.paymentStatus === "PENDING" && (
            <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
              <p className="text-xs font-bold text-green-800 mb-2">Código Pix Copia e Cola</p>
              <p className="text-xs font-mono break-all text-gray-600">{order.pixCode}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

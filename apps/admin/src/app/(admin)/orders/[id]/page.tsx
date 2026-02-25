import { prisma } from "@visualapp/database";
import { notFound } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Package, MapPin, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import OrderStatusUpdater from "./_components/OrderStatusUpdater";

const STATUS_COLORS: Record<string, string> = {
  PENDING:   "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-purple-100 text-purple-700",
  SHIPPED:   "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando", CONFIRMED: "Confirmado", PREPARING: "Preparando",
  SHIPPED: "Enviado", DELIVERED: "Entregue", CANCELLED: "Cancelado",
};

const PAY_STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando", PROCESSING: "Processando", PAID: "Pago",
  FAILED: "Falhou", REFUNDED: "Estornado",
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { name: true, images: { where: { isPrimary: true }, take: 1 } } },
        },
      },
      address: true,
    },
  });

  if (!order) notFound();

  return (
    <div className="max-w-4xl">
      <Link
        href="/orders"
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Pedidos
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">
            Pedido #{order.orderNumber.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2 items-center">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          }`}>
            Pgto: {PAY_STATUS_LABELS[order.paymentStatus]}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Left column — items + address */}
        <div className="md:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-white rounded-2xl border p-5">
            <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" /> Itens
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex-shrink-0 overflow-hidden">
                    {item.product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-blue-200 m-auto mt-3.5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.product.name}</p>
                    <p className="text-xs text-gray-400">
                      Tam: {item.size} • Qtd: {item.quantity}
                      {item.color && ` • Cor: ${item.color}`}
                    </p>
                  </div>
                  <p className="font-bold text-sm">
                    {formatCurrency(Number(item.price) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto</span>
                  <span>-{formatCurrency(Number(order.discount))}</span>
                </div>
              )}
              {Number(order.shipping) > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Frete</span>
                  <span>{formatCurrency(Number(order.shipping))}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-base pt-1 border-t">
                <span>Total</span>
                <span className="text-blue-600">{formatCurrency(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Address */}
          {order.address && (
            <div className="bg-white rounded-2xl border p-5">
              <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Endereço de entrega
              </h2>
              <div className="text-sm space-y-0.5">
                <p className="font-semibold">{order.address.recipientName}</p>
                <p className="text-gray-500">
                  {order.address.street}, {order.address.number}
                  {order.address.complement && ` — ${order.address.complement}`}
                </p>
                <p className="text-gray-500">
                  {order.address.district}, {order.address.city} — {order.address.state}
                </p>
                <p className="text-gray-500">CEP: {order.address.zipCode}</p>
              </div>
            </div>
          )}

          {/* Pix code */}
          {order.pixCode && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
              <h2 className="font-bold text-green-800 mb-2 text-sm">Código Pix Copia e Cola</h2>
              <p className="text-xs font-mono break-all text-gray-600">{order.pixCode}</p>
            </div>
          )}
        </div>

        {/* Right column — customer + actions */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="bg-white rounded-2xl border p-5">
            <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" /> Cliente
            </h2>
            <div className="text-sm space-y-1">
              <p className="font-semibold">{order.user.name}</p>
              <p className="text-gray-500">{order.user.email}</p>
              {order.user.phone && <p className="text-gray-500">{order.user.phone}</p>}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl border p-5">
            <h2 className="font-bold text-gray-700 mb-3">Pagamento</h2>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Método</span>
                <span className="font-semibold">
                  {order.paymentMethod === "PIX" ? "Pix" : order.paymentMethod === "CREDIT_CARD" ? "Cartão crédito" : order.paymentMethod === "DEBIT_CARD" ? "Cartão débito" : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-semibold ${order.paymentStatus === "PAID" ? "text-green-600" : "text-yellow-600"}`}>
                  {PAY_STATUS_LABELS[order.paymentStatus]}
                </span>
              </div>
            </div>
          </div>

          {/* Status updater (client component) */}
          <OrderStatusUpdater
            orderId={order.id}
            currentStatus={order.status}
            currentPaymentStatus={order.paymentStatus}
            notes={order.notes}
          />
        </div>
      </div>
    </div>
  );
}

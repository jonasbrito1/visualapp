import { prisma } from "@visualapp/database";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Aguardando", color: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "Confirmado", color: "bg-blue-100 text-blue-700" },
  PREPARING: { label: "Preparando", color: "bg-purple-100 text-purple-700" },
  SHIPPED:   { label: "Enviado",    color: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "Entregue",   color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelado",  color: "bg-red-100 text-red-700" },
};

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Pedidos</h1>
        <p className="text-gray-500 text-sm">{orders.length} pedido(s) no total</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <p className="font-bold">Nenhum pedido ainda</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Pedido</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Itens</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Data</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Total</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">
                    #{order.orderNumber.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{order.user.name}</p>
                    <p className="text-xs text-gray-400">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.items[0]?.product.name}
                    {order.items.length > 1 && <span className="text-xs text-gray-400"> +{order.items.length - 1}</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_CONFIG[order.status]?.color}`}>
                      {STATUS_CONFIG[order.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-black text-blue-600">
                    {formatCurrency(Number(order.total))}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/orders/${order.id}`} className="text-xs text-blue-600 hover:underline font-semibold">
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

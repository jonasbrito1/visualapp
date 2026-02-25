import { auth } from "@/lib/auth";
import { prisma } from "@visualapp/database";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  AlertCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [
    totalProducts,
    totalUsers,
    totalOrders,
    pendingOrders,
    recentOrders,
    lowStockProducts,
    revenue,
  ] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.user.count({ where: { role: "CUSTOMER", active: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        items: { take: 1 },
      },
    }),
    prisma.productSize.findMany({
      where: { stock: { lte: 3 } },
      include: { product: { select: { name: true } } },
      take: 5,
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    }),
  ]);

  const stats = [
    {
      label: "Produtos Ativos",
      value: totalProducts,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/products",
    },
    {
      label: "Clientes",
      value: totalUsers,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
      href: "/users",
    },
    {
      label: "Total de Pedidos",
      value: totalOrders,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/orders",
    },
    {
      label: "Receita Total",
      value: formatCurrency(Number(revenue._sum.total || 0)),
      icon: TrendingUp,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      href: "/orders",
    },
  ];

  const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Aguardando", color: "bg-yellow-100 text-yellow-700" },
    CONFIRMED: { label: "Confirmado", color: "bg-blue-100 text-blue-700" },
    PREPARING: { label: "Preparando", color: "bg-purple-100 text-purple-700" },
    SHIPPED: { label: "Enviado", color: "bg-indigo-100 text-indigo-700" },
    DELIVERED: { label: "Entregue", color: "bg-green-100 text-green-700" },
    CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-700" },
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Visão geral da loja Visual Fashion Kids
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-sm text-gray-500 font-medium mt-0.5">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Pedidos Recentes
            </h2>
            {pendingOrders > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">
                {pendingOrders} pendente{pendingOrders > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                Nenhum pedido ainda
              </p>
            ) : (
              recentOrders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="flex items-center justify-between py-3 border-b last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                    <div>
                      <p className="font-bold text-sm">
                        #{order.orderNumber.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.user.name} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          statusLabels[order.status]?.color
                        }`}
                      >
                        {statusLabels[order.status]?.label}
                      </span>
                      <span className="font-black text-sm text-blue-600">
                        {formatCurrency(Number(order.total))}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          <Link
            href="/orders"
            className="text-blue-600 text-sm font-semibold mt-3 block text-center hover:underline"
          >
            Ver todos os pedidos →
          </Link>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Estoque Baixo
          </h2>
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              ✅ Estoque OK
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-semibold text-sm leading-tight">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">Tamanho {item.size}</p>
                  </div>
                  <span
                    className={`text-xs font-black px-2 py-1 rounded-full ${
                      item.stock === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {item.stock === 0 ? "Esgotado" : `${item.stock} restante${item.stock > 1 ? "s" : ""}`}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/products"
            className="text-blue-600 text-sm font-semibold mt-3 block text-center hover:underline"
          >
            Gerenciar estoque →
          </Link>
        </div>
      </div>
    </div>
  );
}

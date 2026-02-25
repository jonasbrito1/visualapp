import { prisma } from "@visualapp/database";
import { formatDate } from "@/lib/utils";
import { Users } from "lucide-react";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { children: true, orders: true } },
    },
  });

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Users className="w-6 h-6" /> Clientes
        </h1>
        <p className="text-gray-500 text-sm">{users.length} cliente(s) cadastrado(s)</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Nome</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">E-mail</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Filhos</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Pedidos</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Cadastro</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">LGPD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="font-semibold">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3 text-center">{user._count.children}</td>
                <td className="px-4 py-3 text-center">{user._count.orders}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user.lgpdConsent ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {user.lgpdConsent ? "✓ Aceito" : "✗ Pendente"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { prisma } from "@visualapp/database";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const settings = await prisma.appSetting.findMany({ orderBy: { key: "asc" } });

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Settings className="w-6 h-6" /> Configurações
        </h1>
        <p className="text-gray-500 text-sm mt-1">Configurações gerais da loja</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border divide-y">
        {settings.map((s) => (
          <div key={s.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="font-semibold text-sm font-mono text-gray-700">{s.key}</p>
            </div>
            <p className="text-sm text-gray-600 max-w-xs text-right">{s.value}</p>
          </div>
        ))}
        {settings.length === 0 && (
          <div className="p-10 text-center text-gray-400">Nenhuma configuração encontrada</div>
        )}
      </div>
    </div>
  );
}

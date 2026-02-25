"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Credenciais inválidas ou acesso negado");
        return;
      }

      toast.success("Bem-vindo ao painel admin!");
      router.push("/dashboard");
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🐢</span>
          <h1 className="text-2xl font-black text-white mt-3">
            VisualApp <span className="text-yellow-400">Admin</span>
          </h1>
          <p className="text-blue-200 text-sm mt-1">Painel de Gerenciamento</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@visualfashionkids.com.br"
                required
                className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? "Entrando..." : "Entrar no Painel"}
            </button>
          </form>
        </div>
        <p className="text-center text-blue-200 text-xs mt-4">
          Acesso restrito a administradores
        </p>
      </div>
    </div>
  );
}

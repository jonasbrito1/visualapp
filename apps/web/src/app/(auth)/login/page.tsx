"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, EyeOff, LogIn } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("E-mail ou senha incorretos");
        return;
      }

      toast.success("Bem-vindo(a) de volta! 🐢");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/30">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐢</span>
            <span className="font-black text-primary">
              Visual<span className="text-yellow-500">App</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="text-4xl mb-2">🐢</div>
              <CardTitle className="text-2xl">Bem-vindo(a) de volta!</CardTitle>
              <CardDescription>Entre com seu e-mail e senha</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  {...register("email")}
                  type="email"
                  label="E-mail"
                  placeholder="seu@email.com"
                  error={errors.email?.message}
                  autoComplete="email"
                />

                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  label="Senha"
                  placeholder="Sua senha"
                  error={errors.password?.message}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                />

                <Button
                  type="submit"
                  size="lg"
                  variant="brand"
                  loading={loading}
                  className="w-full gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  Entrar
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Não tem conta?{" "}
                <Link
                  href="/lgpd"
                  className="text-primary font-semibold hover:underline"
                >
                  Criar conta gratuita
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

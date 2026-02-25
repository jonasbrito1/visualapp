"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, "Nome deve ter ao menos 3 caracteres")
      .max(100, "Nome muito longo"),
    email: z.string().email("E-mail inválido"),
    phone: z
      .string()
      .min(10, "Telefone inválido")
      .max(15, "Telefone inválido")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Senha deve ter ao menos 8 caracteres")
      .regex(/[A-Z]/, "Senha deve ter ao menos uma letra maiúscula")
      .regex(/[0-9]/, "Senha deve ter ao menos um número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verifica se aceitou o LGPD
  useEffect(() => {
    const lgpdAccepted = sessionStorage.getItem("lgpd_accepted");
    if (!lgpdAccepted) {
      router.replace("/lgpd");
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const lgpdAcceptedAt = sessionStorage.getItem("lgpd_accepted_at");
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          password: data.password,
          lgpdConsentAt: lgpdAcceptedAt,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Erro ao criar conta");
        return;
      }

      sessionStorage.removeItem("lgpd_accepted");
      sessionStorage.removeItem("lgpd_accepted_at");
      toast.success("Conta criada com sucesso! Faça login.");
      router.push("/login");
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
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/lgpd">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
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
          {/* Progress indicator */}
          <div className="flex items-center gap-2 justify-center mb-6">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">✓</div>
              <span className="text-xs font-semibold text-green-600">LGPD</span>
            </div>
            <div className="w-8 h-0.5 bg-primary" />
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</div>
              <span className="text-xs font-semibold text-primary">Cadastro</span>
            </div>
            <div className="w-8 h-0.5 bg-muted" />
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center font-bold">3</div>
              <span className="text-xs text-muted-foreground">Perfil</span>
            </div>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="text-4xl mb-2">🐢</div>
              <CardTitle className="text-2xl">Criar sua conta</CardTitle>
              <CardDescription>
                Dados do responsável — a criança você cadastra depois!
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  {...register("name")}
                  label="Seu nome completo"
                  placeholder="Maria da Silva"
                  error={errors.name?.message}
                  autoComplete="name"
                />

                <Input
                  {...register("email")}
                  type="email"
                  label="E-mail"
                  placeholder="seu@email.com"
                  error={errors.email?.message}
                  autoComplete="email"
                />

                <Input
                  {...register("phone")}
                  type="tel"
                  label="Telefone / WhatsApp (opcional)"
                  placeholder="(24) 99999-9999"
                  error={errors.phone?.message}
                />

                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  label="Senha"
                  placeholder="Mínimo 8 caracteres"
                  error={errors.password?.message}
                  hint="Use letras maiúsculas e números"
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

                <Input
                  {...register("confirmPassword")}
                  type={showConfirm ? "text" : "password"}
                  label="Confirmar senha"
                  placeholder="Repita sua senha"
                  error={errors.confirmPassword?.message}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? (
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
                  className="w-full mt-2 gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Criar conta
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Já tem conta?{" "}
                <Link
                  href="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Faça login
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

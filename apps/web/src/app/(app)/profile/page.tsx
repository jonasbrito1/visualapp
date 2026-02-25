import { auth } from "@/lib/auth";
import { prisma } from "@visualapp/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { User, Mail, Phone, Shield, CalendarDays } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id! },
    select: {
      name: true,
      email: true,
      phone: true,
      lgpdConsentAt: true,
      createdAt: true,
      _count: { select: { children: true, orders: true } },
    },
  });

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2">
        <User className="w-6 h-6" /> Meu Perfil
      </h1>

      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-black text-primary">{user._count.children}</p>
              <p className="text-sm text-muted-foreground font-semibold">filhos cadastrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-black text-primary">{user._count.orders}</p>
              <p className="text-sm text-muted-foreground font-semibold">pedidos realizados</p>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dados pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Nome</p>
                <p className="font-semibold">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="font-semibold">{user.email}</p>
              </div>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="font-semibold">{user.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <CalendarDays className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Membro desde</p>
                <p className="font-semibold">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LGPD */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-green-800 text-sm">Consentimento LGPD ativo</p>
              <p className="text-xs text-green-700 mt-0.5">
                Aceito em {user.lgpdConsentAt ? formatDate(user.lgpdConsentAt) : "—"}.
                Seus dados estão protegidos conforme a Lei 13.709/2018.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

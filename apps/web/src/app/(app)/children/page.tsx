import { auth } from "@/lib/auth";
import { prisma } from "@visualapp/database";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Sparkles, Pencil } from "lucide-react";
import { getAgeLabel } from "@/lib/utils";

export default async function ChildrenPage() {
  const session = await auth();
  const children = await prisma.child.findMany({
    where: { userId: session!.user.id!, active: true },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { recommendations: true } } },
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Meus filhos</h1>
          <p className="text-muted-foreground text-sm">
            {children.length} perfil(is) cadastrado(s)
          </p>
        </div>
        <Link href="/children/new">
          <Button variant="brand" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </Link>
      </div>

      {children.length === 0 ? (
        <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
          <CardContent className="py-14 text-center">
            <div className="text-5xl mb-3">🐢</div>
            <p className="font-bold mb-1">Nenhum filho cadastrado ainda</p>
            <p className="text-sm text-muted-foreground mb-4">
              Cadastre o perfil para receber recomendações personalizadas
            </p>
            <Link href="/children/new">
              <Button variant="brand" className="gap-2">
                <Plus className="w-4 h-4" /> Cadastrar agora
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {children.map((child) => (
            <Card key={child.id} className="card-hover">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="text-4xl">{child.avatar || (child.gender === "MENINA" ? "🦋" : child.gender === "MENINO" ? "🦁" : "🐢")}</div>
                <div className="flex-1">
                  <p className="font-bold text-lg">{child.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {getAgeLabel(child.birthDate)} • Tam. {child.clothingSize} •{" "}
                    {child.gender === "MENINA" ? "👧 Menina" : child.gender === "MENINO" ? "👦 Menino" : "🧒 Unissex"}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {child.stylePrefs.slice(0, 3).map((s) => (
                      <span key={s} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href={`/children/${child.id}`}>
                    <Button size="sm" variant="outline" className="gap-1 w-full">
                      <Sparkles className="w-3.5 h-3.5" /> Looks
                    </Button>
                  </Link>
                  <Link href={`/children/${child.id}/edit`}>
                    <Button size="sm" variant="ghost" className="gap-1 w-full text-muted-foreground">
                      <Pencil className="w-3.5 h-3.5" /> Editar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  Heart,
} from "lucide-react";
import { formatCurrency, getAgeLabel } from "@/lib/utils";
import toast from "react-hot-toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Recommendation = { productId: string; score: number; reason: string; product: any };

export default function ChildDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [child, setChild] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingChild, setLoadingChild] = useState(true);

  useEffect(() => {
    fetch(`/api/children/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.id) setChild(data);
        else router.replace("/children");
      })
      .finally(() => setLoadingChild(false));

    fetch(`/api/recommendations?childId=${id}`)
      .then((r) => r.json())
      .then((data) => setRecommendations(data || []));
  }, [id, router]);

  const generateRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId: id }),
      });
      const data = await res.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);
        toast.success("Looks gerados com sucesso! ✨");
      }
    } catch {
      toast.error("Erro ao gerar recomendações");
    } finally {
      setLoadingRecs(false);
    }
  };

  const addToCart = async (productId: string, size: string) => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, size, quantity: 1 }),
    });
    if (res.ok) toast.success("Adicionado ao carrinho! 🛒");
    else toast.error("Erro ao adicionar");
  };

  if (loadingChild) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-4xl animate-bounce-gentle">🐢</div>
        <p className="text-muted-foreground mt-2">Carregando...</p>
      </div>
    );
  }

  if (!child) return null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/children">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <span className="text-3xl">{child.avatar || "🐢"}</span>
          <div>
            <h1 className="text-xl font-black">{child.name}</h1>
            <p className="text-sm text-muted-foreground">
              {getAgeLabel(child.birthDate)} • Tam. {child.clothingSize}
            </p>
          </div>
        </div>
      </div>

      {/* Child Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {child.stylePrefs?.map((s: string) => (
          <Badge key={s} variant="info">{s}</Badge>
        ))}
        {child.occasionPrefs?.map((o: string) => (
          <Badge key={o} variant="outline">{o}</Badge>
        ))}
      </div>

      {/* Recommendations */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Looks recomendados
        </h2>
        <Button
          size="sm"
          variant="outline"
          onClick={generateRecommendations}
          loading={loadingRecs}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {recommendations.length > 0 ? "Atualizar" : "Gerar looks"}
        </Button>
      </div>

      {recommendations.length === 0 && !loadingRecs ? (
        <Card className="border-2 border-dashed border-yellow-200 bg-yellow-50">
          <CardContent className="py-10 text-center">
            <Sparkles className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
            <p className="font-bold mb-1">Nenhum look gerado ainda</p>
            <p className="text-sm text-muted-foreground mb-4">
              Clique em &quot;Gerar looks&quot; para receber sugestões personalizadas para {child.name}
            </p>
            <Button variant="brand" onClick={generateRecommendations} loading={loadingRecs} className="gap-2">
              <Sparkles className="w-4 h-4" /> Gerar looks agora
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <Card key={rec.productId} className="overflow-hidden card-hover">
              <div className="aspect-square bg-gradient-to-br from-blue-50 to-green-50 relative">
                {rec.product?.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={rec.product.images[0].url}
                    alt={rec.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-black px-1.5 py-0.5 rounded-full">
                  {Math.round(rec.score * 100)}%
                </div>
              </div>
              <CardContent className="p-3">
                <p className="font-bold text-sm leading-tight">{rec.product?.name}</p>
                {rec.reason && (
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">{rec.reason}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="font-black text-primary text-sm">
                    {rec.product?.price && formatCurrency(Number(rec.product.price))}
                  </span>
                </div>
                {rec.product?.sizes?.length > 0 && (
                  <Button
                    size="sm"
                    className="w-full mt-2 gap-1 h-8 text-xs"
                    onClick={() => addToCart(rec.productId, rec.product.sizes[0].size)}
                  >
                    <Heart className="w-3 h-3" /> Adicionar
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

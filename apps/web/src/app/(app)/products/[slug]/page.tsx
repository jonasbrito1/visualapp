"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, ShoppingBag, ArrowLeft, Check } from "lucide-react";
import toast from "react-hot-toast";

type ProductSize = { id: string; size: string; stock: number };
type ProductImage = { id: string; url: string; isPrimary: boolean };
type ProductDetail = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  gender: string;
  ageMin: number;
  ageMax: number;
  colors: string[];
  tags: string[];
  material: string | null;
  featured: boolean;
  category: { name: string };
  sizes: ProductSize[];
  images: ProductImage[];
};

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const addToCart = async () => {
    if (!selectedSize) {
      toast.error("Selecione um tamanho");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product!.id, size: selectedSize }),
      });
      if (res.ok) {
        setAdded(true);
        toast.success("Adicionado ao carrinho!");
        setTimeout(() => setAdded(false), 2000);
      } else {
        const data = await res.json();
        if (res.status === 401) {
          toast.error("Faça login para adicionar ao carrinho");
          router.push("/login");
        } else {
          toast.error(data.message || "Erro ao adicionar");
        }
      }
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-4xl animate-bounce-gentle">🐢</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="font-bold text-muted-foreground">Produto não encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    );
  }

  const availableSizes = product.sizes.filter((s) => s.stock > 0);
  const ageLabel = `${Math.floor(product.ageMin / 12)}–${Math.floor(product.ageMax / 12)} anos`;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl overflow-hidden">
            {product.images[activeImage] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[activeImage].url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-muted-foreground/20" />
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${
                    i === activeImage ? "border-primary" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{product.category.name}</p>
            <h1 className="text-2xl font-black leading-tight mt-0.5">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              {product.featured && (
                <Badge className="bg-yellow-500 text-yellow-900 text-xs">⭐ Destaque</Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {product.gender === "MENINA" ? "👧 Menina" : product.gender === "MENINO" ? "👦 Menino" : "🧒 Unissex"}
              </Badge>
              <Badge variant="outline" className="text-xs">{ageLabel}</Badge>
            </div>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-primary">
              {formatCurrency(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <>
                <span className="text-base text-muted-foreground line-through">
                  {formatCurrency(product.comparePrice)}
                </span>
                <Badge className="bg-red-500 text-white text-xs">
                  -{Math.round((1 - product.price / product.comparePrice) * 100)}%
                </Badge>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          {/* Sizes */}
          <div>
            <p className="text-sm font-bold mb-2">
              Tamanho {selectedSize && <span className="text-primary">— {selectedSize}</span>}
            </p>
            {availableSizes.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Sem estoque disponível</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((s) => (
                  <button
                    key={s.size}
                    onClick={() => setSelectedSize(s.size)}
                    className={`px-3 py-1.5 rounded-xl border-2 text-sm font-bold transition-all ${
                      selectedSize === s.size
                        ? "border-primary bg-primary text-white"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div>
              <p className="text-sm font-bold mb-2">Cores disponíveis</p>
              <div className="flex flex-wrap gap-1.5">
                {product.colors.map((color) => (
                  <span
                    key={color}
                    className="text-xs border rounded-full px-2.5 py-1 text-muted-foreground capitalize"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Material */}
          {product.material && (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Material:</span> {product.material}
            </p>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <span key={tag} className="text-xs bg-muted rounded-full px-2.5 py-1 capitalize">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="pt-2 space-y-2">
            <Button
              variant="brand"
              size="lg"
              className="w-full gap-2"
              onClick={addToCart}
              disabled={adding || availableSizes.length === 0}
            >
              {added ? (
                <><Check className="w-5 h-5" /> Adicionado!</>
              ) : (
                <><ShoppingCart className="w-5 h-5" /> Adicionar ao carrinho</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Extra info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl mb-1">🚚</p>
            <p className="text-xs font-bold">Entrega</p>
            <p className="text-xs text-muted-foreground">Sob encomenda</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl mb-1">💳</p>
            <p className="text-xs font-bold">Pagamento</p>
            <p className="text-xs text-muted-foreground">Pix ou cartão</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl mb-1">🔒</p>
            <p className="text-xs font-bold">Segurança</p>
            <p className="text-xs text-muted-foreground">Compra protegida</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CartItem = { id: string; quantity: number; size: string; product: any };

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const removeItem = async (itemId: string) => {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    toast.success("Item removido");
  };

  const total = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-4xl animate-bounce-gentle">🐢</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2">
        <ShoppingCart className="w-6 h-6" /> Meu Carrinho
      </h1>

      {items.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-14 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-bold mb-1">Carrinho vazio</p>
            <p className="text-sm text-muted-foreground mb-4">Explore os produtos e adicione ao carrinho</p>
            <Link href="/products">
              <Button variant="brand">Ver produtos</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-xl flex-shrink-0">
                    {item.product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-blue-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm leading-tight">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tamanho: {item.size} • Qtd: {item.quantity}
                    </p>
                    <p className="font-black text-primary mt-1">
                      {formatCurrency(Number(item.product.price) * item.quantity)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gray-50">
            <CardContent className="p-5">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between mb-4 text-lg font-black border-t pt-2 mt-2">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
              <Link href="/checkout">
                <Button variant="brand" size="lg" className="w-full gap-2">
                  Finalizar pedido <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

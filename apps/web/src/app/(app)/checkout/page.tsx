"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, CreditCard, QrCode, MapPin, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CartItem = { id: string; quantity: number; size: string; product: any };

type CheckoutStep = "address" | "payment" | "pix";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<CheckoutStep>("address");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);

  const [address, setAddress] = useState({
    recipientName: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const total = items.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0
  );

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const required = ["recipientName", "zipCode", "street", "number", "district", "city", "state"] as const;
    for (const field of required) {
      if (!address[field].trim()) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }
    }
    setStep("payment");
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, paymentMethod }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Erro ao finalizar pedido");
        return;
      }
      setOrderId(data.orderId);
      if (paymentMethod === "PIX") {
        setPixCode(data.pixCode);
        setStep("pix");
      } else {
        toast.success("Pedido realizado! Aguardando confirmação do pagamento.");
        router.push(`/orders/${data.orderId}`);
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-4xl animate-bounce-gentle">🐢</div>
      </div>
    );
  }

  if (items.length === 0 && step !== "pix") {
    router.replace("/cart");
    return null;
  }

  const stepIndicator = (
    <div className="flex items-center gap-2 mb-6 text-xs font-semibold">
      {(["address", "payment", "pix"] as const).map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          {i > 0 && <div className="w-6 h-px bg-border" />}
          <div className={`px-3 py-1 rounded-full ${step === s ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
            {s === "address" ? "1. Endereço" : s === "payment" ? "2. Pagamento" : "3. Pix"}
          </div>
        </div>
      ))}
    </div>
  );

  // ── PIX screen ──────────────────────────────────────────────────────────────
  if (step === "pix" && pixCode) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <h1 className="text-2xl font-black mb-2">Pagamento via Pix</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Copie o código abaixo e pague no seu banco
        </p>

        <Card className="mb-4 border-green-200 bg-green-50">
          <CardContent className="p-5 text-center">
            <QrCode className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-green-800 mb-3">Código Pix Copia e Cola</p>
            <div className="bg-white rounded-xl p-3 text-xs font-mono break-all text-gray-700 border">
              {pixCode}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                navigator.clipboard.writeText(pixCode);
                toast.success("Código copiado!");
              }}
            >
              Copiar código
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="p-4 text-sm text-muted-foreground space-y-1">
            <p>• O pagamento é confirmado em poucos minutos</p>
            <p>• Valor: <strong>{formatCurrency(total)}</strong></p>
            <p>• Pedido: <strong>#{orderId?.slice(-8).toUpperCase()}</strong></p>
          </CardContent>
        </Card>

        <Button
          variant="brand"
          className="w-full"
          onClick={() => router.push(`/orders/${orderId}`)}
        >
          Acompanhar pedido
        </Button>
      </div>
    );
  }

  // ── Payment step ─────────────────────────────────────────────────────────────
  if (step === "payment") {
    return (
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {stepIndicator}
        <h1 className="text-2xl font-black mb-6">Pagamento</h1>

        {/* Order summary */}
        <Card className="mb-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Resumo do pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.product.name} ({item.size}) × {item.quantity}
                </span>
                <span className="font-semibold">
                  {formatCurrency(Number(item.product.price) * item.quantity)}
                </span>
              </div>
            ))}
            <div className="flex justify-between font-black text-base border-t pt-2 mt-2">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment method */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-bold">Método de pagamento</p>
          <button
            onClick={() => setPaymentMethod("PIX")}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
              paymentMethod === "PIX" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <QrCode className={`w-5 h-5 ${paymentMethod === "PIX" ? "text-primary" : "text-muted-foreground"}`} />
            <div>
              <p className="font-bold text-sm">Pix</p>
              <p className="text-xs text-muted-foreground">Aprovação imediata • Sem taxas</p>
            </div>
            {paymentMethod === "PIX" && (
              <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
          </button>
          <button
            onClick={() => setPaymentMethod("CREDIT_CARD")}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
              paymentMethod === "CREDIT_CARD" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <CreditCard className={`w-5 h-5 ${paymentMethod === "CREDIT_CARD" ? "text-primary" : "text-muted-foreground"}`} />
            <div>
              <p className="font-bold text-sm">Cartão de crédito</p>
              <p className="text-xs text-muted-foreground">Parcelamento disponível</p>
            </div>
            {paymentMethod === "CREDIT_CARD" && (
              <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
          </button>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setStep("address")}>
            Voltar
          </Button>
          <Button
            variant="brand"
            className="flex-1 gap-2"
            onClick={handlePlaceOrder}
            disabled={submitting}
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
            ) : (
              `Finalizar — ${formatCurrency(total)}`
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ── Address step (default) ────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      {stepIndicator}
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2">
        <MapPin className="w-6 h-6" /> Endereço de entrega
      </h1>

      <form onSubmit={handleAddressSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-semibold block mb-1">Nome do destinatário *</label>
          <input
            required
            value={address.recipientName}
            onChange={(e) => setAddress((a) => ({ ...a, recipientName: e.target.value }))}
            className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Nome completo"
          />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">CEP *</label>
          <input
            required
            value={address.zipCode}
            onChange={(e) => setAddress((a) => ({ ...a, zipCode: e.target.value }))}
            className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="00000-000"
            maxLength={9}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="text-sm font-semibold block mb-1">Rua / Av. *</label>
            <input
              required
              value={address.street}
              onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Rua das Flores"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Número *</label>
            <input
              required
              value={address.number}
              onChange={(e) => setAddress((a) => ({ ...a, number: e.target.value }))}
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="123"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Complemento</label>
          <input
            value={address.complement}
            onChange={(e) => setAddress((a) => ({ ...a, complement: e.target.value }))}
            className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Apto, bloco, etc."
          />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Bairro *</label>
          <input
            required
            value={address.district}
            onChange={(e) => setAddress((a) => ({ ...a, district: e.target.value }))}
            className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Centro"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold block mb-1">Cidade *</label>
            <input
              required
              value={address.city}
              onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Resende"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Estado *</label>
            <input
              required
              value={address.state}
              onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="RJ"
              maxLength={2}
            />
          </div>
        </div>

        {/* Mini cart preview */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{items.length} item(ns) no carrinho</span>
            </div>
            <p className="font-black text-primary text-lg">{formatCurrency(total)}</p>
          </CardContent>
        </Card>

        <Button type="submit" variant="brand" size="lg" className="w-full">
          Continuar para pagamento
        </Button>
      </form>
    </div>
  );
}

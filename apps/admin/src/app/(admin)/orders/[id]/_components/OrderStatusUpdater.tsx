"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";

const ORDER_STATUSES = [
  { value: "PENDING",   label: "Aguardando pagamento" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "PREPARING", label: "Em preparação" },
  { value: "SHIPPED",   label: "Enviado" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELLED", label: "Cancelado" },
] as const;

const PAYMENT_STATUSES = [
  { value: "PENDING",    label: "Aguardando" },
  { value: "PROCESSING", label: "Processando" },
  { value: "PAID",       label: "Pago" },
  { value: "FAILED",     label: "Falhou" },
  { value: "REFUNDED",   label: "Estornado" },
] as const;

interface Props {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
  notes: string | null;
}

export default function OrderStatusUpdater({ orderId, currentStatus, currentPaymentStatus, notes: initialNotes }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus, notes: notes || null }),
      });
      if (res.ok) {
        toast.success("Pedido atualizado!");
        router.refresh();
      } else {
        toast.error("Erro ao atualizar pedido");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border p-5 space-y-4">
      <h2 className="font-bold text-gray-700">Atualizar pedido</h2>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Status do pedido
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Status do pagamento
        </label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Notas internas
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Notas sobre o pedido..."
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Salvar
      </button>
    </div>
  );
}

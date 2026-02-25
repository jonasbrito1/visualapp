"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, ArrowLeft, ImagePlus } from "lucide-react";
import toast from "react-hot-toast";

type Category = { id: string; name: string };
type SizeRow = { size: string; stock: number; sku: string };
type ImageRow = { url: string; alt: string; isPrimary: boolean };

type ProductData = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  categoryId: string;
  brand: string | null;
  gender: "MENINO" | "MENINA" | "UNISSEX";
  ageMin: number;
  ageMax: number;
  colors: string[];
  tags: string[];
  material: string | null;
  featured: boolean;
  active: boolean;
  sizes: { size: string; stock: number; sku: string | null }[];
  images: { url: string; alt: string | null; isPrimary: boolean }[];
};

interface ProductFormProps {
  categories: Category[];
  product?: ProductData;
}

const TAG_OPTIONS = ["casual", "esportivo", "festa", "escola", "praia", "dormir", "elegante", "colorido", "neutro"];
const COLOR_OPTIONS = ["azul", "rosa", "verde", "amarelo", "vermelho", "branco", "preto", "neutro", "colorido", "lilás"];
const COMMON_SIZES = ["PP", "P", "M", "G", "GG", "1", "2", "3", "4", "5", "6", "7", "8", "10", "12", "14", "16"];

export default function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(product?.id);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [comparePrice, setComparePrice] = useState(product?.comparePrice?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? (categories[0]?.id ?? ""));
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [gender, setGender] = useState<"MENINO" | "MENINA" | "UNISSEX">(product?.gender ?? "UNISSEX");
  const [ageMin, setAgeMin] = useState(product?.ageMin?.toString() ?? "0");
  const [ageMax, setAgeMax] = useState(product?.ageMax?.toString() ?? "36");
  const [material, setMaterial] = useState(product?.material ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [active, setActive] = useState(product?.active ?? true);
  const [colors, setColors] = useState<string[]>(product?.colors ?? []);
  const [tags, setTags] = useState<string[]>(product?.tags ?? []);

  // Sizes
  const [sizes, setSizes] = useState<SizeRow[]>(
    product?.sizes.map((s) => ({ size: s.size, stock: s.stock, sku: s.sku ?? "" })) ?? [
      { size: "", stock: 0, sku: "" },
    ]
  );

  // Images
  const [images, setImages] = useState<ImageRow[]>(
    product?.images.map((img) => ({ url: img.url, alt: img.alt ?? "", isPrimary: img.isPrimary })) ?? []
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  const toggleTag = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const toggleColor = (color: string) =>
    setColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]));

  const addSize = () => setSizes((prev) => [...prev, { size: "", stock: 0, sku: "" }]);
  const removeSize = (i: number) => setSizes((prev) => prev.filter((_, idx) => idx !== i));
  const updateSize = (i: number, field: keyof SizeRow, value: string | number) =>
    setSizes((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const addQuickSize = (size: string) => {
    if (!sizes.some((s) => s.size === size)) {
      setSizes((prev) => [...prev, { size, stock: 1, sku: "" }]);
    }
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    try {
      new URL(newImageUrl);
    } catch {
      toast.error("URL inválida");
      return;
    }
    setImages((prev) => [
      ...prev,
      { url: newImageUrl.trim(), alt: "", isPrimary: prev.length === 0 },
    ]);
    setNewImageUrl("");
  };

  const removeImage = (i: number) =>
    setImages((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });

  const setPrimaryImage = (i: number) =>
    setImages((prev) => prev.map((img, idx) => ({ ...img, isPrimary: idx === i })));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validSizes = sizes.filter((s) => s.size.trim());
    if (validSizes.length === 0) {
      toast.error("Adicione pelo menos um tamanho");
      return;
    }
    if (!price || isNaN(parseFloat(price))) {
      toast.error("Preço inválido");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        description: description || null,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        categoryId,
        brand: brand || null,
        gender,
        ageMin: parseInt(ageMin) || 0,
        ageMax: parseInt(ageMax) || 36,
        colors,
        tags,
        material: material || null,
        featured,
        active,
        sizes: validSizes.map((s) => ({ size: s.size, stock: Number(s.stock), sku: s.sku || undefined })),
        images: images.map((img) => ({ url: img.url, alt: img.alt || undefined, isPrimary: img.isPrimary })),
      };

      const url = isEditing ? `/api/products/${product!.id}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isEditing ? "Produto atualizado!" : "Produto criado!");
        router.push("/products");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "Erro ao salvar");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Excluir este produto? Esta ação não pode ser desfeita.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${product!.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Produto excluído");
        router.push("/products");
      } else {
        toast.error("Erro ao excluir");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Basic info */}
      <div className="bg-white rounded-2xl border p-5 space-y-4">
        <h2 className="font-bold text-gray-700">Informações básicas</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-semibold block mb-1">Nome do produto *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Vestido Floral Primavera"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Preço *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0,00"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Preço original (opcional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                className="w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0,00"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Categoria *</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Marca</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Visual Kids"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Gênero *</label>
            <div className="flex gap-2">
              {(["MENINO", "MENINA", "UNISSEX"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                    gender === g ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {g === "MENINO" ? "👦 Menino" : g === "MENINA" ? "👧 Menina" : "🧒 Unissex"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold block mb-1">Idade mín. (meses)</label>
              <input
                type="number"
                min="0"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Idade máx. (meses)</label>
              <input
                type="number"
                min="1"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold block mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Descreva o produto..."
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Material</label>
            <input
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 100% algodão"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm font-semibold">Produto ativo</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 accent-yellow-500"
            />
            <span className="text-sm font-semibold">⭐ Destaque</span>
          </label>
        </div>
      </div>

      {/* Sizes */}
      <div className="bg-white rounded-2xl border p-5 space-y-3">
        <h2 className="font-bold text-gray-700">Tamanhos e estoque</h2>

        {/* Quick add */}
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addQuickSize(s)}
              className={`text-xs border rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                sizes.some((row) => row.size === s)
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : "hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {sizes.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={row.size}
                onChange={(e) => updateSize(i, "size", e.target.value)}
                className="border rounded-xl px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tam."
              />
              <input
                type="number"
                min="0"
                value={row.stock}
                onChange={(e) => updateSize(i, "stock", parseInt(e.target.value) || 0)}
                className="border rounded-xl px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Estoque"
              />
              <input
                value={row.sku}
                onChange={(e) => updateSize(i, "sku", e.target.value)}
                className="border rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SKU (opcional)"
              />
              <button
                type="button"
                onClick={() => removeSize(i)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSize}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold"
        >
          <Plus className="w-4 h-4" /> Adicionar tamanho
        </button>
      </div>

      {/* Colors */}
      <div className="bg-white rounded-2xl border p-5 space-y-3">
        <h2 className="font-bold text-gray-700">Cores disponíveis</h2>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => toggleColor(color)}
              className={`px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all capitalize ${
                colors.includes(color)
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-2xl border p-5 space-y-3">
        <h2 className="font-bold text-gray-700">Tags (para IA de recomendação)</h2>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all capitalize ${
                tags.includes(tag)
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl border p-5 space-y-3">
        <h2 className="font-bold text-gray-700">Imagens</h2>
        <div className="flex gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
            className="flex-1 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://... URL da imagem"
          />
          <button
            type="button"
            onClick={addImage}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
          >
            <ImagePlus className="w-4 h-4" /> Adicionar
          </button>
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt}
                  className={`w-full aspect-square object-cover rounded-xl border-2 ${
                    img.isPrimary ? "border-blue-600" : "border-transparent"
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                  }}
                />
                {img.isPrimary && (
                  <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    Principal
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-1">
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(i)}
                      className="text-[10px] bg-white text-gray-800 px-2 py-1 rounded-md font-semibold"
                    >
                      Principal
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="p-1 bg-red-500 text-white rounded-md"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {isEditing ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Excluir produto
          </button>
        ) : <div />}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isEditing ? "Salvar alterações" : "Criar produto"}
        </button>
      </div>
    </form>
  );
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

export function calculateAge(birthDate: Date | string): {
  years: number;
  months: number;
  totalMonths: number;
} {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMonths = years * 12 + months;
  return { years, months, totalMonths };
}

export function getAgeLabel(birthDate: Date | string): string {
  const { years, months } = calculateAge(birthDate);
  if (years === 0) return `${months} meses`;
  if (months === 0) return `${years} ${years === 1 ? "ano" : "anos"}`;
  return `${years} ${years === 1 ? "ano" : "anos"} e ${months} ${months === 1 ? "mês" : "meses"}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export const CLOTHING_SIZES = [
  { value: "RN", label: "Recém Nascido" },
  { value: "P", label: "P (0-3 meses)" },
  { value: "M", label: "M (3-6 meses)" },
  { value: "G", label: "G (6-9 meses)" },
  { value: "GG", label: "GG (9-12 meses)" },
  { value: "1", label: "Número 1 (1 ano)" },
  { value: "2", label: "Número 2 (2 anos)" },
  { value: "4", label: "Número 4 (4 anos)" },
  { value: "6", label: "Número 6 (6 anos)" },
  { value: "8", label: "Número 8 (8 anos)" },
  { value: "10", label: "Número 10 (10 anos)" },
  { value: "12", label: "Número 12 (12 anos)" },
  { value: "14", label: "Número 14 (14 anos)" },
  { value: "16", label: "Número 16 (16 anos)" },
];

export const STYLE_PREFS = [
  { value: "casual", label: "Casual", emoji: "👕", color: "bg-blue-100 text-blue-700" },
  { value: "esportivo", label: "Esportivo", emoji: "⚽", color: "bg-green-100 text-green-700" },
  { value: "elegante", label: "Elegante", emoji: "✨", color: "bg-purple-100 text-purple-700" },
  { value: "colorido", label: "Colorido", emoji: "🎨", color: "bg-yellow-100 text-yellow-700" },
  { value: "neutro", label: "Neutro", emoji: "🤍", color: "bg-gray-100 text-gray-700" },
  { value: "romantico", label: "Romântico", emoji: "🌸", color: "bg-pink-100 text-pink-700" },
  { value: "aventureiro", label: "Aventureiro", emoji: "🏕️", color: "bg-orange-100 text-orange-700" },
];

export const OCCASION_PREFS = [
  { value: "escola", label: "Escola", emoji: "🎒" },
  { value: "passeio", label: "Passeio", emoji: "🚶" },
  { value: "festa", label: "Festa", emoji: "🎉" },
  { value: "esporte", label: "Esporte", emoji: "⚽" },
  { value: "praia", label: "Praia", emoji: "🏖️" },
  { value: "dormir", label: "Dormir", emoji: "😴" },
  { value: "dia_a_dia", label: "Dia a dia", emoji: "🌤️" },
];

export const COLOR_PREFS = [
  { value: "azul", label: "Azul", hex: "#3B82F6" },
  { value: "rosa", label: "Rosa", hex: "#EC4899" },
  { value: "verde", label: "Verde", hex: "#10B981" },
  { value: "amarelo", label: "Amarelo", hex: "#F59E0B" },
  { value: "vermelho", label: "Vermelho", hex: "#EF4444" },
  { value: "roxo", label: "Roxo", hex: "#8B5CF6" },
  { value: "laranja", label: "Laranja", hex: "#F97316" },
  { value: "branco", label: "Branco", hex: "#F9FAFB" },
  { value: "preto", label: "Preto", hex: "#1F2937" },
  { value: "neutro", label: "Neutros", hex: "#9CA3AF" },
];

export const CHILD_AVATARS = [
  { value: "🐢", label: "Tartaruga" },
  { value: "🦋", label: "Borboleta" },
  { value: "🌟", label: "Estrela" },
  { value: "🦊", label: "Raposa" },
  { value: "🐻", label: "Urso" },
  { value: "🐱", label: "Gato" },
  { value: "🐶", label: "Cachorro" },
  { value: "🦄", label: "Unicórnio" },
  { value: "🐸", label: "Sapo" },
  { value: "🦁", label: "Leão" },
  { value: "🐧", label: "Pinguim" },
  { value: "🐘", label: "Elefante" },
];

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Baby,
} from "lucide-react";
import {
  CLOTHING_SIZES,
  STYLE_PREFS,
  OCCASION_PREFS,
  COLOR_PREFS,
  CHILD_AVATARS,
  cn,
} from "@/lib/utils";
import Link from "next/link";

const STEPS = [
  { id: 1, title: "Quem é?", emoji: "👶" },
  { id: 2, title: "Medidas", emoji: "📏" },
  { id: 3, title: "Estilo", emoji: "✨" },
  { id: 4, title: "Cores", emoji: "🎨" },
  { id: 5, title: "Avatar", emoji: "🐢" },
];

const childSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  birthDate: z.string().min(1, "Informe a data de nascimento"),
  gender: z.enum(["MENINO", "MENINA", "UNISSEX"], {
    required_error: "Selecione o gênero",
  }),
  clothingSize: z.string().min(1, "Selecione o tamanho"),
  shoeSize: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  stylePrefs: z.array(z.string()).min(1, "Selecione ao menos 1 estilo"),
  occasionPrefs: z.array(z.string()).min(1, "Selecione ao menos 1 ocasião"),
  colorPrefs: z.array(z.string()).min(1, "Selecione ao menos 1 cor"),
  notes: z.string().optional(),
  avatar: z.string().optional(),
});

type ChildFormData = z.infer<typeof childSchema>;

export default function NewChildPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    trigger,
  } = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      stylePrefs: [],
      occasionPrefs: [],
      colorPrefs: [],
    },
  });

  const stylePrefs = watch("stylePrefs") || [];
  const occasionPrefs = watch("occasionPrefs") || [];
  const colorPrefs = watch("colorPrefs") || [];
  const avatar = watch("avatar");
  const gender = watch("gender");

  const toggleArrayValue = (
    field: "stylePrefs" | "occasionPrefs" | "colorPrefs",
    value: string
  ) => {
    const current = getValues(field) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue(field, updated, { shouldValidate: true });
  };

  const nextStep = async () => {
    const fieldsPerStep: Record<number, (keyof ChildFormData)[]> = {
      1: ["name", "birthDate", "gender"],
      2: ["clothingSize"],
      3: ["stylePrefs", "occasionPrefs"],
      4: ["colorPrefs"],
    };

    const valid = await trigger(fieldsPerStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const onSubmit = async (data: ChildFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          height: data.height ? parseFloat(data.height) : null,
          weight: data.weight ? parseFloat(data.weight) : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || "Erro ao cadastrar");
        return;
      }

      const child = await res.json();
      toast.success(`${data.name} cadastrado(a) com sucesso! 🎉`);
      router.push(`/children/${child.id}`);
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/children">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-black">Novo perfil</h1>
          <p className="text-xs text-muted-foreground">
            {STEPS[step - 1].emoji} {STEPS[step - 1].title}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-6">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              s.id <= step ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basic info */}
        {step === 1 && (
          <Card className="animate-slide-up">
            <CardContent className="p-6 space-y-5">
              <div className="text-center mb-2">
                <Baby className="w-10 h-10 text-primary mx-auto mb-2" />
                <h2 className="text-xl font-bold">Quem é seu filho(a)?</h2>
                <p className="text-sm text-muted-foreground">Informações básicas da criança</p>
              </div>

              <Input
                {...register("name")}
                label="Nome da criança"
                placeholder="Ex: Sofia, Miguel..."
                error={errors.name?.message}
              />

              <Input
                {...register("birthDate")}
                type="date"
                label="Data de nascimento"
                error={errors.birthDate?.message}
                max={new Date().toISOString().split("T")[0]}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Gênero</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "MENINA", label: "Menina", emoji: "👧" },
                    { value: "MENINO", label: "Menino", emoji: "👦" },
                    { value: "UNISSEX", label: "Unissex", emoji: "🧒" },
                  ].map(({ value, label, emoji }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setValue("gender", value as "MENINO" | "MENINA" | "UNISSEX", {
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
                        gender === value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-xs font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-xs text-destructive">⚠️ {errors.gender.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Measurements */}
        {step === 2 && (
          <Card className="animate-slide-up">
            <CardContent className="p-6 space-y-5">
              <div className="text-center mb-2">
                <span className="text-4xl">📏</span>
                <h2 className="text-xl font-bold mt-2">Medidas e tamanho</h2>
                <p className="text-sm text-muted-foreground">Para sugerir o tamanho certo</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tamanho de roupa <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CLOTHING_SIZES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setValue("clothingSize", value, { shouldValidate: true })
                      }
                      className={cn(
                        "py-2 px-1 rounded-xl border-2 text-xs font-bold transition-all",
                        watch("clothingSize") === value
                          ? "border-primary bg-primary text-white"
                          : "border-border hover:border-primary/50"
                      )}
                      title={label}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                {errors.clothingSize && (
                  <p className="text-xs text-destructive">⚠️ {errors.clothingSize.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  {...register("height")}
                  type="number"
                  label="Altura (cm)"
                  placeholder="Ex: 85"
                  hint="Opcional"
                />
                <Input
                  {...register("weight")}
                  type="number"
                  label="Peso (kg)"
                  placeholder="Ex: 12"
                  hint="Opcional"
                />
              </div>

              <Input
                {...register("shoeSize")}
                label="Número do calçado"
                placeholder="Ex: 26, 28..."
                hint="Opcional"
              />
            </CardContent>
          </Card>
        )}

        {/* Step 3: Style */}
        {step === 3 && (
          <Card className="animate-slide-up">
            <CardContent className="p-6 space-y-5">
              <div className="text-center mb-2">
                <span className="text-4xl">✨</span>
                <h2 className="text-xl font-bold mt-2">Estilo e ocasiões</h2>
                <p className="text-sm text-muted-foreground">
                  Selecione ao menos 1 de cada
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estilo preferido</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_PREFS.map(({ value, label, emoji, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleArrayValue("stylePrefs", value)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all",
                        stylePrefs.includes(value)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className={cn("rounded-lg px-2 py-0.5 text-xs", color)}>
                        {emoji}
                      </span>
                      {label}
                      {stylePrefs.includes(value) && (
                        <Check className="w-4 h-4 text-primary ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
                {errors.stylePrefs && (
                  <p className="text-xs text-destructive">⚠️ {errors.stylePrefs.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ocasiões</label>
                <div className="flex flex-wrap gap-2">
                  {OCCASION_PREFS.map(({ value, label, emoji }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleArrayValue("occasionPrefs", value)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-full border-2 text-sm font-semibold transition-all",
                        occasionPrefs.includes(value)
                          ? "border-primary bg-primary text-white"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span>{emoji}</span> {label}
                    </button>
                  ))}
                </div>
                {errors.occasionPrefs && (
                  <p className="text-xs text-destructive">⚠️ {errors.occasionPrefs.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Colors */}
        {step === 4 && (
          <Card className="animate-slide-up">
            <CardContent className="p-6 space-y-5">
              <div className="text-center mb-2">
                <span className="text-4xl">🎨</span>
                <h2 className="text-xl font-bold mt-2">Cores favoritas</h2>
                <p className="text-sm text-muted-foreground">
                  Que cores ele(a) mais gosta?
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {COLOR_PREFS.map(({ value, label, hex }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleArrayValue("colorPrefs", value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all",
                      colorPrefs.includes(value)
                        ? "border-primary scale-105"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full border-2",
                        value === "branco" ? "border-gray-200" : "border-transparent"
                      )}
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-xs font-semibold">{label}</span>
                    {colorPrefs.includes(value) && (
                      <Check className="w-3 h-3 text-primary" />
                    )}
                  </button>
                ))}
              </div>
              {errors.colorPrefs && (
                <p className="text-xs text-destructive">⚠️ {errors.colorPrefs.message}</p>
              )}

              <Input
                {...register("notes")}
                label="Observações extras (opcional)"
                placeholder="Ex: alergia a tecido sintético, não gosta de colarinho..."
              />
            </CardContent>
          </Card>
        )}

        {/* Step 5: Avatar */}
        {step === 5 && (
          <Card className="animate-slide-up">
            <CardContent className="p-6 space-y-5">
              <div className="text-center mb-2">
                <span className="text-4xl">🐢</span>
                <h2 className="text-xl font-bold mt-2">Escolha um avatar</h2>
                <p className="text-sm text-muted-foreground">
                  Para identificar o perfil visualmente
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {CHILD_AVATARS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue("avatar", value)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
                      avatar === value
                        ? "border-primary bg-primary/10 scale-110"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-3xl">{value}</span>
                    <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}

          {step < STEPS.length ? (
            <Button
              type="button"
              size="lg"
              variant="brand"
              onClick={nextStep}
              className="flex-1 gap-2"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="lg"
              variant="brand"
              loading={loading}
              className="flex-1 gap-2"
            >
              <Check className="w-5 h-5" />
              Criar perfil!
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

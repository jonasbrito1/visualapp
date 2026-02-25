"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

/** Renderiza texto com **negrito** como <strong> */
function RichText({ text }: { text: string }) {
  return (
    <span className="whitespace-pre-line">
      {text.split("\n").map((line, i) => {
        const parts = line.split(/\*\*(.+?)\*\*/g);
        return (
          <span key={i}>
            {parts.map((part, j) =>
              j % 2 === 1 ? (
                <strong key={j} className="font-semibold text-foreground">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
            {i < text.split("\n").length - 1 && "\n"}
          </span>
        );
      })}
    </span>
  );
}

const LGPD_SECTIONS = [
  {
    id: "coleta",
    title: "📋 Quais dados coletamos?",
    content: `Coletamos as seguintes informações quando você usa o VisualApp:

• **Dados do responsável:** nome completo, e-mail, telefone e senha
• **Dados da criança:** nome, data de nascimento, gênero, tamanhos de roupa e calçado
• **Preferências:** estilo, cores e ocasiões favoritas da criança (sem fotos)
• **Dados de uso:** produtos visualizados, pedidos realizados
• **Dados técnicos:** endereço IP (para fins de segurança)

Não coletamos fotos ou imagens das crianças.`,
  },
  {
    id: "finalidade",
    title: "🎯 Para que usamos os dados?",
    content: `Seus dados são utilizados exclusivamente para:

• Personalizar recomendações de roupas para sua criança
• Processar e entregar seus pedidos
• Comunicar sobre novidades e promoções (com seu consentimento)
• Melhorar a experiência do aplicativo
• Cumprir obrigações legais

Nunca vendemos ou compartilhamos seus dados com terceiros para fins comerciais.`,
  },
  {
    id: "menores",
    title: "👶 Proteção especial para menores",
    content: `Tratamos os dados de crianças com cuidado especial, conforme a LGPD (Lei 13.709/2018) e o ECA:

• Dados de menores de 18 anos só são coletados com consentimento expresso do responsável legal
• Ao aceitar estes termos, você declara ser o responsável legal pela(s) criança(s) cadastrada(s)
• Não coletamos imagens ou fotos das crianças
• Você pode solicitar a exclusão dos dados da criança a qualquer momento
• Não exibimos publicidade direcionada a menores`,
  },
  {
    id: "direitos",
    title: "⚖️ Seus direitos como titular",
    content: `Conforme a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), você tem direito a:

• **Acesso:** solicitar confirmação e acesso aos seus dados
• **Correção:** corrigir dados incompletos ou desatualizados
• **Eliminação:** solicitar a exclusão dos seus dados
• **Portabilidade:** receber seus dados em formato estruturado
• **Revogação:** revogar o consentimento a qualquer momento
• **Informação:** saber com quem compartilhamos seus dados

Para exercer seus direitos, entre em contato: privacidade@visualfashionkids.com.br`,
  },
  {
    id: "seguranca",
    title: "🔒 Como protegemos seus dados?",
    content: `Implementamos medidas técnicas e organizacionais para proteger seus dados:

• Criptografia de dados em trânsito (HTTPS/TLS)
• Senhas armazenadas com algoritmo bcrypt (hash seguro)
• Acesso restrito aos dados por pessoal autorizado
• Backups regulares e seguros
• Monitoramento de acessos suspeitos`,
  },
];

export default function LGPDPage() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>("coleta");
  const [checkboxes, setCheckboxes] = useState({
    dataConsent: false,
    minorConsent: false,
    termsConsent: false,
  });

  const allChecked = Object.values(checkboxes).every(Boolean);

  const handleCheckbox = (key: keyof typeof checkboxes) => {
    setCheckboxes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAccept = () => {
    if (!allChecked) return;
    // Salva flag de consentimento na sessão para o registro
    sessionStorage.setItem("lgpd_accepted", "true");
    sessionStorage.setItem("lgpd_accepted_at", new Date().toISOString());
    router.push("/register");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="glass border-b border-white/30 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐢</span>
            <span className="font-black text-primary">Visual<span className="text-yellow-500">App</span></span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-3">
            Proteção de Dados e Privacidade
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Antes de criar sua conta, leia como coletamos e protegemos os dados
            da sua família. Sua privacidade é nossa prioridade.
          </p>
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 rounded-full px-4 py-2 text-sm font-semibold mt-3">
            <CheckCircle2 className="w-4 h-4" />
            Conforme LGPD — Lei nº 13.709/2018
          </div>
        </div>

        {/* LGPD Sections */}
        <div className="space-y-3 mb-8">
          {LGPD_SECTIONS.map((section) => (
            <Card key={section.id} className="overflow-hidden">
              <button
                onClick={() =>
                  setExpandedSection(
                    expandedSection === section.id ? null : section.id
                  )
                }
                className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-bold text-base">{section.title}</span>
                {expandedSection === section.id ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              {expandedSection === section.id && (
                <CardContent className="pt-0 pb-5">
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <RichText text={section.content} />
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Consent Checkboxes */}
        <Card className="mb-6 border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-blue-800">
                Para continuar, você precisa aceitar todos os itens abaixo:
              </p>
            </div>

            {[
              {
                key: "dataConsent" as const,
                label:
                  "Li e concordo com a Política de Privacidade e autorizo o tratamento dos meus dados pessoais conforme descrito acima, nos termos da LGPD (Lei nº 13.709/2018).",
              },
              {
                key: "minorConsent" as const,
                label:
                  "Declaro ser o responsável legal pelas crianças que vou cadastrar e autorizo o tratamento dos dados delas exclusivamente para personalização de recomendações de moda infantil, sem coleta de imagens.",
              },
              {
                key: "termsConsent" as const,
                label:
                  "Tenho ciência de que posso revogar este consentimento e solicitar a exclusão dos meus dados a qualquer momento, conforme previsto na LGPD.",
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <div
                  onClick={() => handleCheckbox(item.key)}
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    checkboxes[item.key]
                      ? "bg-primary border-primary"
                      : "border-input bg-white group-hover:border-primary"
                  }`}
                >
                  {checkboxes[item.key] && (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-foreground leading-relaxed">
                  {item.label}
                </span>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleAccept}
            disabled={!allChecked}
            size="lg"
            variant="brand"
            className="w-full gap-2"
          >
            Aceitar e criar minha conta
            <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Ao continuar, você concorda com os termos acima.
          </p>
          <Link href="/" className="text-center">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Voltar para o início
            </Button>
          </Link>
        </div>

        {/* Version info */}
        <p className="text-center text-xs text-muted-foreground mt-6 pb-8">
          Política de Privacidade v1.0 — Visual Fashion Kids © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

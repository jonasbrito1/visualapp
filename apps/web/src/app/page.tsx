import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingBag, Star, ArrowRight, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-3xl">🐢</span>
            <div>
              <span className="font-black text-xl text-brand-blue">Visual</span>
              <span className="font-black text-xl text-brand-yellow-DEFAULT">App</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/produtos" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
              Produtos
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Entrar</Button>
            </Link>
            <Link href="/lgpd">
              <Button size="sm">Começar</Button>
            </Link>
          </nav>
          <div className="flex md:hidden gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm">Entrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-2 text-sm font-semibold mb-6 animate-bounce-gentle">
              <Sparkles className="w-4 h-4" />
              Recomendações inteligentes para o seu filho
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6 leading-tight">
              Moda infantil{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
                personalizada
              </span>{" "}
              para cada criança
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Informe o perfil da sua criança e receba sugestões de roupas que combinam
              com o estilo, idade e personalidade dela. Desde 2010 vestindo crianças com amor! 🐢
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/lgpd">
                <Button size="xl" variant="brand" className="w-full sm:w-auto gap-3">
                  <Sparkles className="w-5 h-5" />
                  Descobrir looks para meu filho
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/produtos">
                <Button size="xl" variant="outline" className="w-full sm:w-auto gap-3">
                  <ShoppingBag className="w-5 h-5" />
                  Ver produtos
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: "🎯",
                title: "Perfil Personalizado",
                desc: "Informe idade, tamanho, estilo e preferências da criança",
                color: "bg-blue-50 border-blue-200",
              },
              {
                icon: "✨",
                title: "IA Recomenda",
                desc: "Nossa inteligência artificial seleciona as melhores peças",
                color: "bg-yellow-50 border-yellow-200",
              },
              {
                icon: "❤️",
                title: "Compra Fácil",
                desc: "Compre via Pix ou cartão direto no app, sem complicação",
                color: "bg-green-50 border-green-200",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`rounded-2xl border-2 p-8 text-center card-hover ${feature.color}`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Social Proof */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-2xl font-bold mb-2">
              +7.000 famílias já confiam na Visual Fashion Kids
            </p>
            <p className="text-muted-foreground">
              Desde 2010, vestindo crianças em Resende - RJ e região
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-10">
              {[
                { num: "7.105", label: "Seguidores" },
                { num: "3.274", label: "Posts" },
                { num: "14+", label: "Anos de história" },
                { num: "100%", label: "Dedicação" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-black text-primary">{stat.num}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-green-500 rounded-3xl p-10 text-white">
            <span className="text-5xl mb-4 block">🐢</span>
            <h2 className="text-3xl font-black mb-4">
              Pronto para descobrir o look perfeito?
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Crie sua conta gratuita e receba recomendações personalizadas agora mesmo!
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              {[
                "Cadastro 100% gratuito",
                "Proteção de dados LGPD",
                "Múltiplos perfis de filhos",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Link href="/lgpd" className="inline-block mt-8">
              <Button size="xl" className="bg-white text-blue-600 hover:bg-blue-50 font-black">
                Criar conta gratuita →
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🐢</span>
            <span className="font-black text-white text-lg">
              Visual<span className="text-yellow-400">App</span>
            </span>
          </div>
          <p className="text-sm">Visual Fashion Kids © {new Date().getFullYear()}</p>
          <p className="text-xs mt-1">
            Rua Abel Rodrigues Pontes, Resende - RJ
          </p>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <Link href="/lgpd" className="hover:text-white transition-colors">
              Política de Privacidade
            </Link>
            <span>•</span>
            <Link href="/lgpd" className="hover:text-white transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

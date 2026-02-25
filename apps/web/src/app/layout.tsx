import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VisualApp | Visual Fashion Kids",
    template: "%s | VisualApp",
  },
  description:
    "Moda infantil personalizada para o seu filho. Descubra looks incríveis baseados no perfil da sua criança.",
  keywords: ["moda infantil", "roupas criança", "visual fashion kids", "moda kids"],
  authors: [{ name: "Visual Fashion Kids" }],
  creator: "Visual Fashion Kids",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "VisualApp | Visual Fashion Kids",
    description: "Moda infantil personalizada para o seu filho.",
    siteName: "VisualApp",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <body className={nunito.className}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              fontFamily: "Nunito, sans-serif",
              fontWeight: 600,
            },
            success: {
              style: { background: "#ECFDF5", color: "#065F46" },
              iconTheme: { primary: "#10B981", secondary: "#fff" },
            },
            error: {
              style: { background: "#FEF2F2", color: "#991B1B" },
              iconTheme: { primary: "#EF4444", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}

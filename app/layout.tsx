import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0A0E17",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Escalante Pro | GTAM GMF",
  description: "Plataforma de Gestão Tática de Escalas, Afastamentos e Inteligência Operacional do GTAM/GMF.",
  keywords: ["GTAM", "GMF", "Escalante", "Gestão Tática", "Segurança Pública"],
  authors: [{ name: "GTAM GMF" }],
  icons: {
    icon: "/logo-gtam.png",
    apple: "/logo-gtam.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Preconnect to Google Fonts if needed */}
      </head>
      <body className={`${inter.className} antialiased bg-[#0A0E17] text-white selection:bg-blue-500/30`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

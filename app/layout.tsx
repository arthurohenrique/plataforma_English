import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reinaldo Montes — Aulas particulares de inglês",
  description:
    "Aulas particulares de inglês online, individuais, com foco em conversação. Horários flexíveis, plano sob medida e resultados reais.",
  icons: {
    icon: "/logo.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Fraunces, Libre_Franklin } from "next/font/google";

import "./globals.css";

// 2026-04-28: Tipografía institucional (sin Arial genérico) + soporte español México.

const sans = Libre_Franklin({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portal de alta de facturación — Winston",
  description: "Portal de alta de facturación 2026-2027. Datos fiscales.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <body
        className={`${sans.variable} ${display.variable} min-h-screen font-sans text-slate-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

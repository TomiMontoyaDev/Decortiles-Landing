import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import Analytics from "@/components/Analytics";
import { asset } from "@/lib/config";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-anton" });
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://proyectos.decorcolombiatiles.com";

export const metadata: Metadata = {
  // Solo el origen: Next agrega el basePath a las rutas de metadata por su cuenta.
  metadataBase: new URL(new URL(SITE_URL).origin),
  title: "DECORTILES · Catálogo digital de porcelanatos, pisos y revestimientos",
  description:
    "Recibe el catálogo digital de DECORTILES: porcelanatos, pisos y revestimientos de importación directa. Diseños, formatos y referencias para tu proyecto.",
  // Landing exclusiva para pauta: no se indexa.
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/",
    siteName: "DECORTILES",
    title: "Tu próximo proyecto empieza con una buena selección de materiales.",
    description: "Recibe el catálogo digital de porcelanatos, pisos y revestimientos de DECORTILES.",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: asset("/images/logo.png"), apple: asset("/images/logo.png") },
};

export const viewport: Viewport = {
  themeColor: "#f2eee6",
  width: "device-width",
  initialScale: 1,
  // Habilita env(safe-area-inset-*) en iPhone (notch y barra inferior).
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${anton.variable} ${inter.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

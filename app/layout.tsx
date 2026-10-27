import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import Analytics from "@/components/Analytics";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-anton" });
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://proyectos.decorcolombiatiles.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "DECORTILES Proyectos · Porcelanato y cerámica con stock local",
  description:
    "Importación directa de porcelanato 60×120, pisos de alto tránsito, revestimientos y sanitarios. Stock en Medellín y Barranquilla para constructoras, arquitectos, diseñadores y contratistas.",
  // Landing exclusiva para pauta: no se indexa.
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/",
    siteName: "DECORTILES",
    title: "Acabados con stock. No con promesas.",
    description: "Porcelanato, cerámica y sanitarios de importación directa. Stock en Medellín y Barranquilla.",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/images/logo.png", apple: "/images/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#0a1424",
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

import type { NextConfig } from "next";

// Dos modos de build:
// - Servidor (por defecto): Vercel o Render Web Service. Incluye /api/lead y el middleware.
// - Estático (STATIC_EXPORT=1, `npm run build:static`): genera out/ para GitHub Pages o
//   Render Static Site. Los archivos *.api.ts (route handler y middleware) se excluyen
//   porque un export estático no puede tener servidor.
const ESTATICO = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = ESTATICO
  ? {
      output: "export",
      basePath,
      trailingSlash: true,
      pageExtensions: ["tsx", "ts"],
      images: { unoptimized: true },
      env: { NEXT_PUBLIC_STATIC_EXPORT: "1" },
    }
  : {
      poweredByHeader: false,
      pageExtensions: ["tsx", "ts", "api.ts"],
      images: { formats: ["image/avif", "image/webp"] },
      async headers() {
        return [
          {
            // Landing solo para pauta: que ningún buscador la indexe.
            source: "/:path*",
            headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
          },
        ];
      },
    };

export default nextConfig;

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

// Imagen OG propia (1200×630), generada en build. Next la publica con URL
// absoluta gracias a `metadataBase` en el layout.
export const alt = "DECORTILES · Catálogo digital de porcelanatos, pisos y revestimientos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Se genera una sola vez en el build (necesario también para el export estático).
export const dynamic = "force-static";

const dataUri = async (rel: string, mime: string) =>
  `data:${mime};base64,${(await readFile(path.join(process.cwd(), "public", rel))).toString("base64")}`;

export default async function OgImage() {
  const [foto, marca, anton] = await Promise.all([
    dataUri("images/productos/black-gold.jpg", "image/jpeg"),
    dataUri("images/marca.png", "image/png"),
    readFile(path.join(process.cwd(), "assets/fonts/Anton-Regular.ttf")),
  ]);
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#f2eee6", color: "#0a1424" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 56px", width: 720 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={marca} width={56} height={56} alt="" />
            <span style={{ fontFamily: "Anton", fontSize: 38, letterSpacing: 3 }}>DECORTILES</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Anton", fontSize: 64, lineHeight: 1, textTransform: "uppercase" }}>
            <span>Tu próximo proyecto empieza</span>
            <span style={{ color: "#c81d14" }}>con una buena selección de materiales.</span>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#4a5568" }}>
            Catálogo digital · Porcelanatos, pisos y revestimientos
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foto} width={480} height={630} alt="" style={{ objectFit: "cover" }} />
      </div>
    ),
    { ...size, fonts: [{ name: "Anton", data: anton, style: "normal", weight: 400 }] },
  );
}

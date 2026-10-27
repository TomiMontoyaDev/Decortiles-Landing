import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

// Imagen OG propia (1200×630), generada en build. Next la publica con URL
// absoluta gracias a `metadataBase` en el layout.
export const alt = "DECORTILES · Acabados con stock. No con promesas.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0a1424", color: "#f2eee6" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 56px", width: 720 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={marca} width={56} height={56} alt="" />
            <span style={{ fontFamily: "Anton", fontSize: 38, letterSpacing: 3 }}>DECORTILES</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Anton", fontSize: 88, lineHeight: 0.98, textTransform: "uppercase" }}>
            <span>Acabados con stock.</span>
            <span style={{ color: "#e1251b" }}>No con promesas.</span>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#93a0b5" }}>
            Importación directa · Stock en Medellín y Barranquilla
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foto} width={480} height={630} alt="" style={{ objectFit: "cover" }} />
      </div>
    ),
    { ...size, fonts: [{ name: "Anton", data: anton, style: "normal", weight: 400 }] },
  );
}

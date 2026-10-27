import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Landing from "@/components/Landing";
import { PERFILES, PERFILES_PAUTA, type PerfilPauta } from "@/content/perfiles";
import { asset } from "@/lib/config";

export const dynamicParams = false;

export function generateStaticParams() {
  return PERFILES_PAUTA.map((perfil) => ({ perfil }));
}

type Params = { params: Promise<{ perfil: string }> };

function perfilDe(valor: string) {
  return (PERFILES_PAUTA as readonly string[]).includes(valor) ? PERFILES[valor as PerfilPauta] : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const perfil = perfilDe((await params).perfil);
  if (!perfil) return {};
  const titulo = perfil.h1.join(" ");
  return {
    title: `${titulo} · DECORTILES`,
    // La URL pública es la de "/?perfil=…"; /p/* es interna.
    alternates: { canonical: asset(`/?perfil=${perfil.id}`) },
    // Al redefinir openGraph se pierde la imagen heredada de app/opengraph-image: se declara explícita.
    openGraph: {
      title: titulo,
      description: perfil.subtitulo,
      url: asset(`/?perfil=${perfil.id}`),
      images: [{ url: asset("/opengraph-image"), width: 1200, height: 630, alt: "DECORTILES" }],
    },
    twitter: { card: "summary_large_image", images: [asset("/opengraph-image")] },
  };
}

export default async function PaginaPerfil({ params }: Params) {
  const perfil = perfilDe((await params).perfil);
  if (!perfil) notFound();
  return <Landing perfil={perfil} />;
}

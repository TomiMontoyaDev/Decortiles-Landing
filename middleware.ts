import { NextResponse, type NextRequest } from "next/server";
import { PERFILES_PAUTA } from "@/content/perfiles";

// "/?perfil=constructora&utm_..." → se sirve la versión estática /p/constructora.
// La URL del navegador no cambia, así que las UTMs siguen visibles para el cliente.
export function middleware(req: NextRequest) {
  const perfil = req.nextUrl.searchParams
    .get("perfil")
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (!perfil || !(PERFILES_PAUTA as readonly string[]).includes(perfil)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = `/p/${perfil}`;
  return NextResponse.rewrite(url);
}

export const config = { matcher: "/" };

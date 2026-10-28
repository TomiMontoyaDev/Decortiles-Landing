// Tipos mínimos del runtime de Deno que usan las Edge Functions, para que VS Code
// no marque errores sin la extensión de Deno. En Supabase existen de verdad.
declare namespace Deno {
  const env: { get(key: string): string | undefined };
  function serve(handler: (req: Request) => Response | Promise<Response>): unknown;
}

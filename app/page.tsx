import Landing from "@/components/Landing";
import { PERFILES } from "@/content/perfiles";

// Versión general (sin ?perfil=). Las versiones por perfil están en /p/[perfil]
// y el middleware las sirve en "/" según el parámetro.
export default function Home() {
  return <Landing perfil={PERFILES.general} />;
}

import Landing from "@/components/Landing";
import { PERFILES, PERFILES_PAUTA } from "@/content/perfiles";
import { BASE_PATH, ES_ESTATICO } from "@/lib/config";

// Versión general (sin ?perfil=). Las versiones por perfil están en /p/[perfil].
// Con servidor, el middleware las sirve en "/" según el parámetro. En el export
// estático no hay middleware: este script redirige antes de pintar, conservando las UTMs.
const redireccionEstatica = `(function(){try{var q=new URLSearchParams(location.search),p=(q.get("perfil")||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");if(${JSON.stringify(
  PERFILES_PAUTA,
)}.indexOf(p)>-1)location.replace(${JSON.stringify(BASE_PATH)}+"/p/"+p+"/"+location.search+location.hash)}catch(e){}})();`;

export default function Home() {
  return (
    <>
      {ES_ESTATICO && <script dangerouslySetInnerHTML={{ __html: redireccionEstatica }} />}
      <Landing perfil={PERFILES.general} />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { NEGOCIO } from "@/content/negocio";

// TODO cliente / LEGAL: texto base para revisión por un abogado antes de lanzar.
// Completar NIT, responsable del área de datos y fecha de entrada en vigencia.
// Marco: Ley 1581 de 2012 y Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015).

export const metadata: Metadata = {
  title: "Política de tratamiento de datos personales · DECORTILES",
};

const NIT = "[NIT pendiente]";
const VIGENCIA = "[fecha pendiente]";

export default function PoliticaDatos() {
  return (
    <main className="contenedor max-w-3xl pt-[max(3rem,env(safe-area-inset-top))] pb-[max(3rem,env(safe-area-inset-bottom))] sm:py-20">
      <Link href="/" className="rotulo -ml-1 inline-flex min-h-11 items-center px-1 text-ink/60 hover:text-ink">
        ← Volver
      </Link>
      {process.env.NODE_ENV !== "production" && (
        <p className="mt-6 border border-signal p-3 text-sm text-ink">
          Borrador: texto base pendiente de revisión legal. Este aviso solo se ve en desarrollo.
        </p>
      )}
      <h1 className="display t-h2 mt-6 text-ink">Política de tratamiento de datos personales</h1>

      <div className="mt-10 space-y-8 text-[0.98rem] leading-relaxed text-ink/80 [overflow-wrap:anywhere] [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
        <section>
          <h2>1. Responsable del tratamiento</h2>
          <p>
            {NEGOCIO.razonSocial}, NIT {NIT}, con domicilio en Cl. 50 #56B-22, La Candelaria, Medellín (Antioquia), y sede
            en Cra. 35 #29B-42, Barranquilla (Atlántico). Correo: {NEGOCIO.correo}. Teléfono / WhatsApp:{" "}
            {NEGOCIO.whatsapp.visible}.
          </p>
        </section>

        <section>
          <h2>2. Datos que recolectamos</h2>
          <p>
            A través de este sitio recolectamos: nombre, correo electrónico, número de celular, perfil profesional, ciudad y,
            de forma opcional, empresa, etapa del proyecto, metros cuadrados estimados y categorías de interés. También
            registramos el origen de la visita (parámetros de campaña) y, si los aceptas en tu navegador, identificadores
            de cookies de medición de Meta y Google.
          </p>
        </section>

        <section>
          <h2>3. Finalidades</h2>
          <ul>
            <li>Enviarte información comercial: tendencias, disponibilidad de inventario, llegadas de producto, precios y fichas técnicas.</li>
            <li>Contactarte por correo, teléfono o WhatsApp para atender cotizaciones y solicitudes.</li>
            <li>Segmentar la información según tu perfil, ciudad y tipo de proyecto.</li>
            <li>Medir el desempeño de nuestras campañas publicitarias.</li>
            <li>Cumplir obligaciones legales y contractuales.</li>
          </ul>
        </section>

        <section>
          <h2>4. Derechos del titular</h2>
          <p>Como titular de los datos tienes derecho a:</p>
          <ul>
            <li>Conocer, actualizar y rectificar tus datos personales.</li>
            <li>Solicitar prueba de la autorización otorgada.</li>
            <li>Ser informado sobre el uso que se ha dado a tus datos.</li>
            <li>Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la ley.</li>
            <li>Revocar la autorización y/o solicitar la supresión de tus datos cuando no exista un deber legal o contractual de conservarlos.</li>
            <li>Acceder de forma gratuita a tus datos personales.</li>
          </ul>
        </section>

        <section>
          <h2>5. Consultas y reclamos</h2>
          <p>
            Puedes ejercer tus derechos escribiendo a {NEGOCIO.correo} con el asunto “Datos personales”, indicando tu nombre,
            documento de identidad, la solicitud y un medio de respuesta. Las consultas se atienden en un máximo de diez
            (10) días hábiles, prorrogables por cinco (5) días hábiles más. Los reclamos se atienden en un máximo de quince
            (15) días hábiles, prorrogables por ocho (8) días hábiles más, según los artículos 14 y 15 de la Ley 1581 de 2012.
          </p>
          <p className="mt-2">
            Cada correo comercial incluye un enlace para darte de baja de forma inmediata.
          </p>
        </section>

        <section>
          <h2>6. Encargados y transferencia de datos</h2>
          <p>
            Para el envío de correos usamos la plataforma Brevo (Sendinblue SAS, Francia), que actúa como encargado del
            tratamiento. Para la medición de campañas usamos herramientas de Meta Platforms y Google. Estos proveedores
            pueden almacenar información fuera de Colombia, bajo medidas de seguridad y confidencialidad adecuadas.
          </p>
        </section>

        <section>
          <h2>7. Seguridad</h2>
          <p>
            Aplicamos medidas técnicas y administrativas razonables para proteger tus datos contra acceso no autorizado,
            pérdida o alteración.
          </p>
        </section>

        <section>
          <h2>8. Vigencia</h2>
          <p>
            Esta política rige desde {VIGENCIA}. Los datos se conservarán mientras exista la relación comercial o
            mientras no solicites su supresión. Cualquier cambio sustancial será informado por este medio.
          </p>
        </section>
      </div>
    </main>
  );
}

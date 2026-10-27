// Datos fijos del negocio. Si algo cambia (dirección, horario), se edita aquí.

// Número de WhatsApp de todos los botones y mensajes prellenados, formato 573128019754.
// Se define en NEXT_PUBLIC_WHATSAPP (se incrusta en el build: cambiarlo requiere redeploy).
// Ojo: en las plantillas de emails/ el número está escrito en el HTML; si cambia, actualizarlo allá también.
const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP || "573128019754").replace(/\D/g, "");

function formatearWhatsapp(n: string) {
  const m = n.match(/^57(\d{3})(\d{3})(\d{4})$/);
  return m ? `+57 ${m[1]} ${m[2]} ${m[3]}` : `+${n}`;
}

export const NEGOCIO = {
  razonSocial: "Decortiles Cerámica S.A.S.",
  marca: "DECORTILES",
  anios: "13",
  referencias: "90",
  correo: "contacto@decorcolombiatiles.com",
  horario: "L–V 8:00–18:00 · Sáb 9:00–17:00",
  redes: "@decortilesceramica",
  whatsapp: { numero: WHATSAPP, visible: formatearWhatsapp(WHATSAPP) },
  sedes: [
    { ciudad: "Medellín", direcciones: ["Cl. 50 #56B-22, La Candelaria"] },
    { ciudad: "Barranquilla", direcciones: ["Cra. 35 #29B-42", "Cra. 30 #24-58"] },
  ],
} as const;

export function whatsappUrl(mensaje: string) {
  return `https://wa.me/${NEGOCIO.whatsapp.numero}?text=${encodeURIComponent(mensaje)}`;
}

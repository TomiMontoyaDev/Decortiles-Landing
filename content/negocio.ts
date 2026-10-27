// Datos fijos del negocio. Si algo cambia (teléfono, dirección, horario), se edita aquí.

export const NEGOCIO = {
  razonSocial: "Decortiles Cerámica S.A.S.",
  marca: "DECORTILES",
  anios: "13",
  referencias: "90",
  correo: "contacto@decorcolombiatiles.com",
  horario: "L–V 8:00–18:00 · Sáb 9:00–17:00",
  redes: "@decortilesceramica",
  // TODO cliente: confirmar qué línea atiende proyectos y si cada una corresponde a una sede.
  whatsapp: [
    { numero: "573128019754", visible: "+57 312 801 9754" },
    { numero: "573013310178", visible: "+57 301 331 0178" },
  ],
  sedes: [
    { ciudad: "Medellín", direcciones: ["Cl. 50 #56B-22, La Candelaria"] },
    { ciudad: "Barranquilla", direcciones: ["Cra. 35 #29B-42", "Cra. 30 #24-58"] },
  ],
} as const;

export function whatsappUrl(mensaje: string, numero: string = NEGOCIO.whatsapp[0].numero) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

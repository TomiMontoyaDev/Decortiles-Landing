// Productos de la sección "Lo que se está especificando ahora".
// Datos técnicos tomados de decorcolombiatiles.com (oct. 2026).
// `acabado: null` = el sitio no lo especifica → TODO cliente: completar.

export type Uso = "Piso" | "Pared" | "Piso / Pared" | "Pared / Decoración";

export interface Producto {
  slug: string;
  nombre: string;
  categoria: string;
  formato: string;
  m2Caja: string;
  kgCaja: string;
  piezasCaja: string;
  acabado: string | null;
  uso: Uso;
  imagen: string;
  alt: string;
}

export const PRODUCTOS: Producto[] = [
  {
    slug: "black-gold",
    nombre: "Black Gold",
    categoria: "Porcelanato",
    formato: "60×120",
    m2Caja: "1,44",
    kgCaja: "27",
    piezasCaja: "2",
    acabado: "Brillante",
    uso: "Piso / Pared",
    imagen: "/images/productos/black-gold.jpg",
    alt: "Porcelanato Black Gold 60×120, mármol negro con vetas doradas, acabado brillante",
  },
  {
    slug: "black-empire",
    nombre: "Black Empire",
    categoria: "Porcelanato",
    formato: "60×120",
    m2Caja: "1,44",
    kgCaja: "27",
    piezasCaja: "2",
    acabado: null,
    uso: "Piso / Pared",
    imagen: "/images/productos/black-empire.jpg",
    alt: "Porcelanato Black Empire 60×120, fondo blanco con vetas doradas y negras",
  },
  {
    slug: "venzo-natural-hg",
    nombre: "Venzo Natural HG",
    categoria: "Porcelanato",
    formato: "60×120",
    m2Caja: "1,44",
    kgCaja: "27",
    piezasCaja: "2",
    acabado: "Brillante (HG)",
    uso: "Piso / Pared",
    imagen: "/images/productos/venzo-natural-hg.jpg",
    alt: "Porcelanato Venzo Natural HG 60×120, blanco con vetas negras finas",
  },
  {
    slug: "vibren-sky",
    nombre: "Vibren Sky",
    categoria: "Porcelanato",
    formato: "60×120",
    m2Caja: "1,44",
    kgCaja: "27",
    piezasCaja: "2",
    acabado: null,
    uso: "Piso / Pared",
    imagen: "/images/productos/vibren-sky.jpg",
    alt: "Porcelanato Vibren Sky 60×120, efecto ónix en tonos azul verdoso y arena",
  },
  {
    slug: "fachada-chennai",
    nombre: "Fachada Chennai",
    categoria: "Revestimiento",
    formato: "30×60",
    m2Caja: "0,90",
    kgCaja: "32",
    piezasCaja: "5",
    acabado: null,
    uso: "Pared",
    imagen: "/images/productos/fachada-chennai.jpg",
    alt: "Revestimiento Fachada Chennai 30×60, piedra laja en tonos ocre y gris",
  },
  {
    slug: "cristanac-opal-blue",
    nombre: "Cristanac Opal Blue",
    categoria: "Malla",
    formato: "30×30",
    m2Caja: "1,00",
    kgCaja: "12",
    piezasCaja: "11",
    acabado: null,
    uso: "Pared / Decoración",
    imagen: "/images/productos/cristanac-opal-blue.jpg",
    alt: "Malla Cristanac Opal Blue 30×30, mosaico de patrones en azul y gris",
  },
  {
    slug: "piedra-gris",
    nombre: "Piedra Gris",
    categoria: "Piso",
    formato: "60×60",
    m2Caja: "1,80",
    kgCaja: "32",
    piezasCaja: "5",
    acabado: "Mate",
    uso: "Piso",
    imagen: "/images/productos/piedra-gris.jpg",
    alt: "Piso Piedra Gris 60×60, textura de piedra granulada, acabado mate",
  },
];

// Fotos de ambientes para "Proyectos instalados". Los pies de foto describen
// lo que se ve; no nombran proyectos ni clientes.
export const AMBIENTES = [
  { src: "/images/ambientes/showroom.jpg", alt: "Zona social con piso porcelanato claro gran formato", pie: "Zona común · porcelanato gran formato" },
  { src: "/images/ambientes/ceramica_pared.jpg", alt: "Corredor con muro en porcelanato efecto mármol e iluminación lineal", pie: "Corredor · muro efecto mármol" },
  { src: "/images/ambientes/ceramica_madera.jpg", alt: "Lobby con piso cerámico efecto madera", pie: "Lobby · piso efecto madera" },
  { src: "/images/ambientes/interior3.jpg", alt: "Zona de estar con muro en cerámica efecto madera en espiga", pie: "Zona de estar · muro en espiga" },
  { src: "/images/ambientes/interior4.jpg", alt: "Sala de espera con muro en listones efecto madera", pie: "Sala de espera · muro efecto madera" },
  { src: "/images/ambientes/mosaicos_premium.jpg", alt: "Hall con muro texturizado y piso porcelanato", pie: "Hall · muro texturizado" },
  // TODO cliente: confirmar que esta foto es un proyecto real; parece render/stock.
  { src: "/images/ambientes/interior.jpg", alt: "Sala con piso efecto madera y ventanales", pie: "Sala · piso efecto madera" },
] as const;

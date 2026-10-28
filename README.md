# DECORTILES · Landing de proyectos (B2B)

Landing de un solo objetivo para campañas pagadas (Meta Ads y Google Ads) dirigidas a constructoras, arquitectos, diseñadores de interiores y contratistas. Captura el lead, lo envía a Brevo con su perfil y origen de campaña, y deja listas las plantillas de email marketing.

- **Producción:** `https://proyectos.decorcolombiatiles.com`
- **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind 4 + zod, exportado como **sitio estático** (HTML puro) a GitHub Pages o Render Static Site. Carga al instante: no hay servidor que se duerma.
- **Dónde quedan los leads:** en **Supabase** (Postgres gratis). Una Edge Function guarda cada lead, lo crea en **Brevo** (lista + atributos) y avisa a ventas. El equipo los ve en el dashboard **`/admin/`** (ícono de persona en la barra superior), con login. Ver sección 4.
- **Sin indexar:** `noindex` en metadata y cabecera `X-Robots-Tag`. Es solo para pauta.

---

## 1. Instalación

```bash
npm install
cp .env.example .env.local   # completar variables (ver sección 2)
npm run dev                  # http://localhost:3000
npm run build:static         # sitio estático en out/ (lo que se publica)
npx serve out                # probarlo localmente
```

En `npm run dev` el formulario usa la `/api/lead` local: si Brevo no está configurado, responde OK y muestra el lead en consola, así se prueba el flujo sin enviar nada. Para probar contra Supabase (formulario y dashboard), define `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env.local`.

## 2. Variables de entorno

**Versión estática (la que se publica).** Solo hacen falta variables públicas, que se incrustan en el build:

| Variable | Obligatoria | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | sí | `https://xxxx.supabase.co` (sección 4.1). El formulario envía a `<url>/functions/v1/lead`. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | sí | Clave **publishable** de Supabase (`sb_publishable_…`; en proyectos antiguos, la **anon** en `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Es pública por diseño; la protege RLS. La usa el login del dashboard. |
| `NEXT_PUBLIC_LEAD_ENDPOINT` | no | Solo si el formulario debe enviar a otra URL. |
| `NEXT_PUBLIC_SITE_URL` | sí | `https://proyectos.decorcolombiatiles.com` (OG image). |
| `NEXT_PUBLIC_WHATSAPP` | sí | Ver tabla de abajo. |
| `NEXT_PUBLIC_BASE_PATH` | no | Subruta. En GitHub Pages la pone sola el workflow; vacía con dominio propio. |
| `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GADS_CONVERSION` | no | Tracking (sección 6). |

Las claves de Brevo **no van en el sitio estático** (quedarían públicas): van en los *Secrets* de la Edge Function (sección 4.1).

**Referencia completa** (las de servidor solo aplican al modo con servidor, sección 12):

| Variable | Dónde | Obligatoria | Descripción |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | público | sí | `https://proyectos.decorcolombiatiles.com`. Se usa en la URL absoluta de la OG image y en el redirect del double opt-in. |
| `NEXT_PUBLIC_WHATSAPP` | público | sí | `573128019754`, solo dígitos y con el 57. Lo usan todos los botones de WhatsApp y los mensajes prellenados por perfil. Si falta, se usa ese mismo número. **En las plantillas de `emails/` el número está escrito en el HTML: si cambia, hay que actualizarlo allá también** (enlaces `wa.me/…` y pie de cada correo). |
| `BREVO_API_KEY` | servidor | sí | API key v3 (Brevo → SMTP & API → API Keys). |
| `BREVO_LIST_ID` | servidor | sí | Id numérico de la lista "Landing Proyectos". |
| `BREVO_DOI_TEMPLATE_ID` | servidor | no | Si se define, se activa el double opt-in con esa plantilla. |
| `LEAD_NOTIFY_EMAIL` | servidor | no | Correo de ventas que recibe cada lead. |
| `BREVO_SENDER_EMAIL` | servidor | con notificación | `contacto@decorcolombiatiles.com`. Debe ser un remitente verificado. |
| `BREVO_SENDER_NAME` | servidor | no | `DECORTILES` |
| `LEAD_TOKEN_SECRET` | servidor | no | Firma el token del paso 2. Si no se define, se usa `BREVO_API_KEY`. |
| `NEXT_PUBLIC_META_PIXEL_ID` | público | no | Id del Pixel de Meta. Vacío = no se carga. |
| `NEXT_PUBLIC_GA_ID` | público | no | `G-XXXXXXX` (GA4). Vacío = no se carga. |
| `NEXT_PUBLIC_GADS_CONVERSION` | público | no | `AW-123456789/AbCdEf…` (id/etiqueta de la conversión de Google Ads). |
| `META_CAPI_TOKEN` | servidor | no | TODO opcional: activa la Conversions API de Meta. |
| `META_CAPI_TEST_CODE` | servidor | no | Código de prueba del Events Manager. Dejarlo vacío en producción. |

Las `NEXT_PUBLIC_*` se incrustan durante el build: si las cambias (en GitHub, Render o Vercel), hay que volver a desplegar.

## 3. Segmentación por pauta

Cada anuncio apunta a la misma URL con un `perfil` distinto:

| Perfil | URL de ejemplo |
|---|---|
| General | `https://proyectos.decorcolombiatiles.com/?utm_source=meta&utm_medium=paid&utm_campaign=…` |
| Constructora | `…/?perfil=constructora&utm_source=meta&utm_medium=paid&utm_campaign=constructoras-oct` |
| Arquitecto | `…/?perfil=arquitecto&utm_source=google&utm_medium=cpc&utm_campaign=arquitectos-oct` |
| Diseñador | `…/?perfil=disenador&…` (también acepta `diseñador`) |
| Contratista | `…/?perfil=contratista&…` |

- El copy de cada perfil (H1, subtítulo, beneficios, CTA, cierre y mensaje de WhatsApp) está en **`content/perfiles.ts`**. Se edita sin tocar componentes.
- Los productos y sus datos técnicos están en `content/productos.ts`. La landing muestra solo los 4 de `DESTACADOS` y las 4 fotos de `AMBIENTES_LANDING`; para cambiarlos se edita esa lista. Los datos del negocio (sedes, WhatsApp, horario) están en `content/negocio.ts`.
- **Versión corta** (pedida por gerencia, 28/10/2026): hero con formulario, barra de prueba, 3 frases de por qué, 4 productos, 4 fotos y cierre. Los textos de "beneficios" por perfil siguen en `perfiles.ts` aunque ya no se muestran.
- En el sitio estático, un script al inicio de `/` redirige `/?perfil=x` a `/p/x/` conservando las UTMs (con servidor lo hace `middleware.api.ts` sin cambiar la URL).
- Se capturan `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid` y `fbclid`. Se guardan en `sessionStorage` y viajan con el lead.

## 4. Formulario, base de datos y dashboard

```
Navegador (sitio estático) ──POST──▶ Supabase Edge Function `lead` ──▶ Tabla `leads` (Postgres)
                                                                    ├─▶ Brevo: contacto + lista (+ doble opt-in)
                                                                    └─▶ Correo a ventas (Brevo transaccional)

/admin/ (mismo sitio estático) ──login──▶ Supabase Auth ──▶ lee `leads` (solo correos de la tabla `admins`)
```

- **Base de datos: Supabase** (Postgres, plan gratis: 500 MB, 50.000 usuarios de login y 500.000 llamadas a funciones al mes; sobra para esta landing). Cada lead queda en la tabla `leads` aunque Brevo falle (la columna `brevo` dice `ok` o el error).
- **Dashboard:** `https://…/admin/`, con el ícono de persona en la barra superior de la landing. Muestra totales, reparto por perfil, ciudad y campaña, filtros, búsqueda, el detalle de cada lead, un **estado** comercial (nuevo, contactado, cotizado, ganado, descartado) y la descarga en CSV para Excel.
- **Seguridad:** la clave `anon` de Supabase es pública por diseño. Row Level Security (`supabase/schema.sql`) impide leer los leads sin sesión, y solo los correos de la tabla `admins` los ven. Desde el dashboard solo se puede cambiar el estado. Los leads los inserta la Edge Function, con la service role key, que nunca sale de Supabase.
- **Paso 1** (obligatorio): nombre, correo, celular colombiano (se normaliza a `+57…`), perfil, ciudad y autorización (Ley 1581). Se guarda el lead, se sincroniza con Brevo y se disparan las conversiones.
- **Paso 2** (opcional, en la pantalla de gracias): empresa, etapa, m² e intereses. Completa el mismo registro con un token que solo sirve 2 horas.
- **Anti-spam:** honeypot (`sitio_web`; si llega lleno se responde OK sin guardar), tiempo mínimo de llenado de 2,5 s y máximo 3 envíos del mismo correo cada 10 minutos.
- **Validación:** zod en el navegador (`lib/lead-schema.ts`) y de nuevo en la función.
- El formulario envía el JSON como `text/plain`, así el navegador no hace una petición previa de CORS y el envío es más rápido.
- La Meta Conversions API (`lib/meta-capi.ts`) solo funciona en el modo con servidor; en el estático queda solo el Pixel.
- El plan gratis **pausa el proyecto tras 7 días sin ninguna actividad**. Con pauta corriendo no pasa; si se pausa, se reactiva con un clic en el panel de Supabase y no se pierde nada.

### 4.1 Configurar Supabase (una sola vez, ~15 minutos)

1. **Crear el proyecto:** [supabase.com](https://supabase.com) → *Start your project* (con GitHub o correo) → **New project**. Nombre `decortiles-landing`, *Generate a password* (guárdala) y región **Americas**. En *Security*: **Enable Data API** activado (lo usa el dashboard), **Automatically expose new tables** desactivado (`schema.sql` da los permisos exactos) y **Enable automatic RLS** activado. No hace falta conectar GitHub. Plan **Free**.
2. **Crear las tablas:** **SQL Editor → New query** → pega todo [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
3. **Usuarios del dashboard:**
   - **Authentication → Sign In / Providers → Email:** desactiva **Allow new users to sign up**, para que nadie más pueda crearse una cuenta.
   - **Authentication → Users → Add user → Create new user:** correo y contraseña de cada persona del equipo, con **Auto Confirm User** marcado.
   - **SQL Editor:** autoriza esos correos (en minúscula):
     ```sql
     insert into public.admins (email) values ('ventas@decorcolombiatiles.com'), ('otra.persona@…');
     ```
   - Para quitarle el acceso a alguien: `delete from public.admins where email = '…';`. Para cambiar una contraseña: Authentication → Users → ⋯ → *Send password recovery* o borrar y crear de nuevo.
4. **Edge Function `lead`** (elige una forma):
   - **Desde el panel:** **Edge Functions → Deploy a new function → Via Editor** → nombre `lead` → pega [`supabase/functions/lead/index.ts`](supabase/functions/lead/index.ts) → **Deploy**. Luego, en la función → **Details**, desactiva **Enforce JWT verification** y guarda. Si queda activado, el formulario recibe un error 401.
   - Si la función quedó con otro nombre (Supabase propone uno al azar, p. ej. `swift-task`), no hace falta recrearla: pon su URL completa en `LEAD_ENDPOINT` (GitHub) o `NEXT_PUBLIC_LEAD_ENDPOINT` (Render y `.env.local`).
   - **Con la terminal:** `npx supabase login`, luego `npx supabase functions deploy lead --project-ref <id-del-proyecto>`. Lee `supabase/config.toml`, que ya desactiva la verificación JWT.
5. **Secrets de la función:** **Edge Functions → Secrets → Add new secret**:

   | Secret | Obligatorio | Valor |
   |---|---|---|
   | `BREVO_API_KEY` | sí, para Brevo | API key v3 (Brevo → SMTP & API → API Keys). Sin ella, los leads igual se guardan en la base. |
   | `BREVO_LIST_ID` | sí, para Brevo | Id numérico de la lista "Landing Proyectos". |
   | `BREVO_DOI_TEMPLATE_ID` | no | Activa el double opt-in (sección 5.3). |
   | `LEAD_NOTIFY_EMAIL` | no | Correo de ventas que recibe cada lead. |
   | `BREVO_SENDER_EMAIL` | con notificación | Remitente verificado en Brevo (`contacto@decorcolombiatiles.com`). |
   | `BREVO_SENDER_NAME` | no | `DECORTILES` |
   | `SITE_URL` | no | `https://proyectos.decorcolombiatiles.com` (destino tras confirmar el double opt-in). |
   | `LEAD_ALLOWED_ORIGINS` | no | Dominios que pueden enviar el formulario, separados por coma, p. ej. `https://proyectos.decorcolombiatiles.com,https://tomimontoyadev.github.io`. Vacío = cualquiera. |

   `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya vienen puestos por Supabase.
6. **Datos para el sitio:** botón **Connect** (o Project Settings → API Keys): copia la **URL** (`https://xxxx.supabase.co`) y la clave **publishable** (`sb_publishable_…`). Ignora el código de ejemplo de esa pantalla (`@supabase/ssr`, middleware): es para Next con servidor y no aplica aquí. Van en `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` en GitHub (sección 7) o como `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en Render. Vuelve a desplegar.
7. **Probar:** abre `https://<proyecto>.supabase.co/functions/v1/lead` en el navegador; debe responder `{"ok":true,"servicio":"leads-decortiles"}`. Llena el formulario de la landing y entra a `/admin/`: el lead tiene que aparecer.

> Nunca pongas la **service_role key** en el sitio ni en GitHub: da acceso total a la base.

## 5. Configuración de Brevo

### 5.1 Lista
Contacts → Lists → **Create a list**, con el nombre "Landing Proyectos". El id numérico va en `BREVO_LIST_ID`.

### 5.2 Atributos
Contacts → Settings → **Contact attributes**. Crea todos como tipo **Texto**:

| Atributo | Valores |
|---|---|
| `NOMBRE` | En cuentas en español suele existir por defecto. Si ya existe, se usa ese. |
| `CELULAR` | `+573001234567` |
| `PERFIL` | `constructora` · `arquitecto` · `disenador` · `contratista` |
| `CIUDAD` | `medellin` · `barranquilla` · `bogota` · `cali` · `otra` |
| `EMPRESA` | texto libre (paso 2) |
| `ETAPA` | `diseno` · `licitacion` · `obra-gris` · `acabados` |
| `M2_RANGO` | `<200` · `200-1000` · `1000-5000` · `>5000` |
| `INTERESES` | separados por coma: `porcelanato-gran-formato,pisos-alto-transito,revestimientos-mallas,fachadas,sanitarios-lavamanos` |
| `UTM_SOURCE` | origen de campaña |
| `UTM_CAMPAIGN` | nombre de campaña |
| `FUENTE` | siempre `landing-proyectos` |

> Los nombres tienen que coincidir exactamente: la API manda esas claves.

### 5.3 Double opt-in (opcional, recomendado)
1. Templates → **New template**. Se puede partir de "Default template for double opt-in confirmation". El botón de confirmar debe apuntar a `{{ doubleoptin }}`.
2. Remitente: `contacto@decorcolombiatiles.com`. Asunto sugerido: **"Confirma y te mandamos lo que hay en bodega"**.
3. El id de la plantilla va en `BREVO_DOI_TEMPLATE_ID`.
4. Al confirmar, Brevo agrega el contacto a la lista y lo redirige a `/confirmado`.

Con DOI activo, el contacto se crea con sus atributos pero **entra a la lista solo cuando confirma**. Sin DOI, entra directo.

### 5.4 Remitente y autenticación del dominio (SPF, DKIM y DMARC)

Sin esto, los correos de marketing caen en spam. Gmail y Yahoo exigen SPF, DKIM y DMARC a quien envía masivo.

**En Brevo:** Senders, Domains & Dedicated IPs → **Domains** → *Add a domain* → `decorcolombiatiles.com` → elige "Authenticate the domain yourself". Brevo muestra los registros exactos; **copia los valores de Brevo, no los de abajo**, que son solo de referencia.

**En cPanel:** Dominios → **Zone Editor** → `decorcolombiatiles.com` → **Manage** → *+ Add Record*.

| Tipo | Nombre | Valor (referencia) | Nota |
|---|---|---|---|
| TXT | `decorcolombiatiles.com.` | `brevo-code:xxxxxxxxxxxxxxxx` | Verificación de propiedad. |
| CNAME | `brevo1._domainkey` | `b1.decorcolombiatiles-com.dkim.brevo.com.` | DKIM 1. |
| CNAME | `brevo2._domainkey` | `b2.decorcolombiatiles-com.dkim.brevo.com.` | DKIM 2. En cuentas antiguas Brevo puede dar un solo TXT `mail._domainkey`. |
| TXT | `decorcolombiatiles.com.` | `v=spf1 +a +mx include:spf.brevo.com ~all` | **SPF: debe haber un solo registro.** Ver la nota de abajo. |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` | Empieza en `p=none`. Ver la nota de abajo. |

- **SPF:** cPanel casi siempre ya trae un registro `v=spf1 …` para el correo del hosting. **No crees uno nuevo:** edita el existente y agrega `include:spf.brevo.com` antes del `~all`. Dos registros SPF invalidan ambos.
- **DMARC:** si ya existe `_dmarc`, edítalo en vez de duplicarlo. Tras 2–4 semanas sin problemas en los reportes, sube a `p=quarantine`.
- La propagación tarda de minutos a 24 h. Después, en Brevo → Domains, pulsa **Authenticate** hasta que todo quede en verde.
- Verifica también el remitente `contacto@decorcolombiatiles.com` en Senders.
- Si el DNS del dominio no está en cPanel (por ejemplo, en Cloudflare), estos registros se crean allí.

### 5.5 Plantillas de email
Las cuatro están en `emails/`: HTML con tablas, estilos inline y 600 px de ancho. Para importarlas: Campaigns → Templates → **New template** → *Paste your code*.

| Archivo | Asunto | Uso |
|---|---|---|
| `01-bienvenida.html` | Estás dentro. Esto es lo que te va a llegar. | Día 0 |
| `02-tendencias.html` | Lo que se está especificando este mes | Día 3 y mensual |
| `03-stock-disponible.html` | En bodega esta semana | Día 7, día 14 y quincenal |
| `04-reactivacion.html` | ¿Sigues con obra? | Sin aperturas en 30 días |

- Variables: `{{ contact.NOMBRE }}` y `{{ contact.PERFIL }}`. Cada plantilla tiene bloques `{% if contact.PERFIL == "…" %}` con copy distinto por perfil.
- Las imágenes cargan desde `https://proyectos.decorcolombiatiles.com/images/…`, así que **la landing tiene que estar desplegada antes de enviar**.
- `02` y `03` tienen bloques marcados para **editar en cada envío** (tendencias del mes, tabla de stock con `[000]` y `[fecha]`).
- El WhatsApp (`573128019754`) está **escrito en el HTML** de las cuatro plantillas: los enlaces `wa.me/…` y el pie. No lee `NEXT_PUBLIC_WHATSAPP`, así que si el número cambia hay que buscarlo y reemplazarlo en `emails/` y volver a importar las plantillas en Brevo.
- **Responsive:** por debajo de 600 px, las filas de producto pasan a una columna y los botones ocupan todo el ancho. En la tabla de stock (03) se oculta la columna "Formato" y el formato aparece bajo el nombre del producto. Los clientes que no aceptan media queries muestran la versión de 600 px escalada, que también se lee bien.
- Antes de enviar, usa *Send a test* con un contacto de prueba de cada perfil.

### 5.6 Secuencia sugerida (Automations)
Automation → *Contact added to a list* (Landing Proyectos):

| Día | Correo | Condición |
|---|---|---|
| 0 | 01 Bienvenida | Todos |
| 3 | 02 Tendencias | Todos |
| 7 | 03 Stock disponible | Todos (la tabla puede filtrarse por `CIUDAD`) |
| 14 | 03 Stock (versión actualizada) | Solo si no hizo clic en el 03 del día 7 |
| Mensual | 02 Tendencias (1.ª semana) + 03 Stock (quincenal) | Como campañas regulares a la lista |
| — | 04 Reactivación | Automation aparte: entra al segmento "Inactivos 30 días" |

### 5.7 Segmentos a crear (Contacts → Segments)
- **Por perfil:** `PERFIL` = constructora / arquitecto / disenador / contratista (4 segmentos).
- **Por sede:** `CIUDAD` = medellin · `CIUDAD` = barranquilla · resto. Sirven para el correo de stock por sede.
- **Leads calientes:** `ETAPA` ∈ {obra-gris, acabados} **o** `M2_RANGO` ∈ {1000-5000, >5000}. Conviene que ventas los llame.
- **Perfil incompleto:** `EMPRESA` vacío. Candidatos a pedirles el paso 2.
- **Por interés:** `INTERESES` contiene `fachadas`, `sanitarios-lavamanos`, etc.
- **Inactivos 30 días:** no abrió ninguna campaña en los últimos 30 días. Dispara el 04.
- **Por campaña:** `UTM_CAMPAIGN` = … Sirve para medir la calidad del lead por anuncio.

## 6. Tracking

| Evento | Meta Pixel | GA4 / Google Ads |
|---|---|---|
| Carga | `PageView` + `ViewContent` (`content_category` = perfil) | `view_item` |
| Lead enviado | `Lead` (`content_category` = perfil, `eventID`) | `generate_lead` (`perfil`) + `conversion` (`send_to` = `NEXT_PUBLIC_GADS_CONVERSION`) |
| Clic en WhatsApp | `Contact` | `contact` |

- Si una variable no está definida, ese script no se carga.
- Las librerías cargan con `lazyOnload` para no penalizar Lighthouse. Los eventos quedan en cola hasta que cargan.
- **Meta Conversions API (TODO opcional):** `lib/meta-capi.ts` ya envía el `Lead` desde el servidor con correo y celular hasheados, `fbc` y `fbp`, y con el mismo `eventID` que el Pixel para que Meta deduplique. Está apagado hasta definir `META_CAPI_TOKEN`. Pruébalo primero con `META_CAPI_TEST_CODE` en el Events Manager.

## 7. Deploy (sitio estático)

Elige **una** de las dos. Ambas son gratis, sin servidor y sin tiempo de arranque.

### Opción A: GitHub Pages (ya configurado en `.github/workflows/pages.yml`)

1. Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**. ⚠️ Este es el origen del 404: si queda en *Deploy from a branch*, Pages publica la raíz del repo, que no tiene `index.html`, y pisa lo que publica el workflow.
2. **Settings → Secrets and variables → Actions → pestaña Variables → New repository variable**:
   - `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` (sección 4.1, paso 6).
   - Opcionales: `WHATSAPP`, `META_PIXEL_ID`, `GA_ID`, `GADS_CONVERSION`.
3. **Actions → GitHub Pages → Run workflow** (o cualquier push a `main`). Queda en `https://tomimontoyadev.github.io/Decortiles-Landing/`.
4. Dominio propio: **Settings → Pages → Custom domain** → `proyectos.decorcolombiatiles.com` → *Save*, y crea el CNAME de la sección 8. Marca **Enforce HTTPS** cuando aparezca. Vuelve a correr el workflow: con dominio propio el sitio pasa a la raíz y el `basePath` queda vacío solo.

### Opción B: Render Static Site

- **Blueprint:** New → **Blueprint** → este repo (usa `render.yaml`, que ya es Static Site). Pide `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y el tracking.
- **Manual:** New → **Static Site** → este repo, con:
  - Build Command: `npm ci --include=dev && npm run build:static`
  - Publish Directory: `out` ⚠️ si queda vacío o en `public`, todo da 404.
  - Variables: `NODE_VERSION=22`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP` y el tracking.
  - No pongas `NEXT_PUBLIC_BASE_PATH` (Render sirve en la raíz).
- Si antes creaste un Web Service, bórralo: ya no hace falta.
- Dominio: Settings → **Custom Domains** → `proyectos.decorcolombiatiles.com`; Render muestra el CNAME (sección 8).

**Cómo funciona el modo estático:** `npm run build:static` (`STATIC_EXPORT=1`) genera HTML puro en `out/`. La API y el middleware (`*.api.ts`) se excluyen con `pageExtensions`, `?perfil=` redirige a `/p/<perfil>/` conservando las UTMs, y las imágenes se sirven sin optimizar. El `.nojekyll` evita que Jekyll procese las etiquetas `{% if %}` de Brevo y la carpeta `_next/`.

## 8. Subdominio en cPanel (CNAME)

En el cPanel de `decorcolombiatiles.com` → **Zone Editor** → **Manage** → *+ Add Record*:

| Tipo | Nombre | Valor | TTL |
|---|---|---|---|
| CNAME | `proyectos` | GitHub Pages: `tomimontoyadev.github.io.` · Render: el que muestre Render (`<servicio>.onrender.com.`) | 300 mientras se prueba, luego 3600 |

- Si ya existe un registro `A` o `CNAME` llamado `proyectos` (cPanel a veces lo crea al dar de alta un subdominio), **bórralo primero**: no pueden coexistir.
- Si la zona tiene registros **CAA**, agrega `0 issue "letsencrypt.org"`. Si no, no se puede emitir el certificado SSL.
- Cuando propague, la plataforma emite el SSL sola. Para verificar: `nslookup proyectos.decorcolombiatiles.com`.
- El sitio principal no se ve afectado: solo se agrega el subdominio.

## 9. Imágenes

Todas las imágenes pedidas se descargaron bien de decorcolombiatiles.com; **no hubo placeholders**.

- `public/images/productos/*.jpg`: 7 productos, más `sanitario-zt-904.jpg` (por si se quiere usar).
- `public/images/ambientes/*.jpg`: 7 fotos de ambientes.
- `public/images/logo-card.png`, `logo.png` y `marca.png`. `marca.png` es el rombo de baldosas recortado del logo, para el header oscuro.

Los originales (PNG de 4–5 MB) se redujeron con `npm run optimize-images` a JPG de 1.200–1.600 px, unos 2,9 MB en total. Las copias originales quedan en `public/images/_originales/`, que no se sube al repo. Para agregar una foto nueva: ponla en `productos/` o `ambientes/` y corre el script.

## 10. Responsive

Mobile-first, verificado en 320, 360, 375, 390, 414, 768, 1024, 1280, 1440 y 1920 px, en vertical y en horizontal. No hay scroll horizontal en ningún ancho.

- **Tipografía fluida** con `clamp()` (`.t-h1`, `.t-h2`, `.t-h3`, `.t-num` y `.t-lead` en `app/globals.css`). El H1 también se limita por alto (`14dvh`) para teléfonos en horizontal. Las palabras del display nunca se parten.
- **Hero:**
  - Móvil: H1, luego formulario y luego subtítulo.
  - Tablet (768–1023): H1 a todo el ancho y, debajo, texto y formulario en dos columnas.
  - Desktop: dos columnas, con el formulario fijo a la derecha.
- **Formulario:**
  - Inputs de 16 px, para que iOS no haga zoom.
  - Áreas táctiles de al menos 44×44 px.
  - Teclados correctos: `type="email"`, `type="tel"` e `inputmode`.
  - `autocomplete` y `name` en cada campo.
  - Los intereses son chips de 44 px en grilla, para tocar con el dedo.
- **Productos:** 4 destacados; 1 columna en móvil (tarjeta horizontal), 2 en tablet y 4 en desktop.
- **Galería:** 4 fotos; carrusel con scroll-snap en móvil, 2 columnas en tablet y 4 en desktop.
- **WhatsApp flotante** (solo móvil): se oculta mientras hay un formulario o el footer en pantalla, así que nunca tapa el botón de enviar. Respeta `env(safe-area-inset-*)`, gracias a `viewport-fit=cover`. El contenedor también respeta el notch en horizontal.
- `100dvh` en las secciones de alto completo (`/confirmado`). Hay `sizes` en cada `next/image`: en un móvil de 375 px a 2× los productos bajan a 384 px y la galería a 640 px.
- Se respeta `prefers-reduced-motion`: se desactivan las animaciones, las transiciones y el scroll suave.

## 11. Rendimiento y accesibilidad

Lighthouse móvil sobre el build local, sin Pixel ni GA cargados:

| Página | Performance | Accesibilidad | Best practices |
|---|---|---|---|
| general | 94 | 100 | 100 |
| constructora | 96 | 100 | 100 |
| arquitecto | 96 | 100 | 100 |
| disenador | 96 | 100 | 100 |
| contratista | 96 | 100 | 100 |
| /politica-de-datos | 99 | 100 | — |

Hay que repetir la medición con los IDs reales de Pixel y GA y en el dominio final.

## 12. Alternativa con servidor (no recomendada)

El código de servidor sigue en el repo por si algún día se necesita (por ejemplo, para la Meta Conversions API): `app/api/lead/route.api.ts` envía a Brevo y avisa a ventas, pero no guarda en Supabase (el dashboard quedaría vacío), y `middleware.api.ts` sirve `?perfil=` sin redirigir.

- Se activa con `npm run build && npm start` en Vercel (proyecto Next.js, plan Pro para uso comercial) o en un **Render Web Service**, con las variables de servidor de la sección 2.
- El plan gratis de Render Web Service se duerme tras 15 minutos sin tráfico y la primera visita tarda 30–50 s. Por eso la landing se publica estática.

## 13. TODO que dependen del cliente

**Antes de lanzar pauta:**
- [ ] Confirmar la promesa **"un solo lote para toda la torre"** y **"separamos el metraje completo del mismo lote"** (`content/perfiles.ts`, hero de constructora y bloque 2 de Problema → Solución; también aparece en los emails 02 y 03).
- [ ] Confirmar **precios por volumen**: si existen y desde qué metraje aplican (beneficio "Precios por volumen", hero de contratista, email 01).
- [ ] Confirmar el alcance del **acompañamiento en especificación**: si incluye visita a obra o es solo asesoría.
- [ ] Confirmar las condiciones de **despacho** desde Medellín y Barranquilla (hero de contratista).
- [ ] Completar el **acabado** de Black Empire, Vibren Sky, Fachada Chennai y Cristanac Opal Blue. El sitio no lo especifica y hoy aparece "Consultar" (`content/productos.ts`).
- [ ] Confirmar que `ambientes/interior.jpg` es un **proyecto real**. Parece un render o foto de stock y está en "Proyectos instalados".
- [ ] Confirmar la **línea de WhatsApp** de proyectos. Hoy es +57 312 801 9754 (`NEXT_PUBLIC_WHATSAPP`); la línea +57 301 331 0178 ya no aparece en la landing ni en los correos.
- [ ] **Revisión legal** de `/politica-de-datos`: completar el NIT y la fecha de vigencia y validar con un abogado.
- [ ] Llenar las tablas de stock (`[000]`, `[fecha]`) y revisar las tendencias del mes en los emails 02 y 03 antes de cada envío.

**Configuración:**
- [ ] Cuenta de Brevo: lista, atributos, plantilla DOI, dominio autenticado y remitente verificado.
- [ ] IDs de Meta Pixel, GA4 y la conversión de Google Ads.
- [ ] Proyecto de Supabase con tablas, Edge Function, secrets y usuarios del equipo (sección 4.1); `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` cargados en GitHub o Render.
- [ ] GitHub Pages con *Source: GitHub Actions* (o Render Static Site) y el CNAME en cPanel.
- [ ] Probar un envío real de cada perfil: aparece en `/admin/`, contacto en Brevo y correo a ventas.

## 14. Estructura

```
app/
  layout.tsx              fuentes (Anton + Inter, display swap), metadata, noindex
  page.tsx                versión general
  p/[perfil]/page.tsx     versiones por perfil (estáticas)
  api/lead/route.api.ts   backend alternativo (solo modo servidor, sección 12)
  politica-de-datos/      texto base Ley 1581 (revisión legal pendiente)
  confirmado/             destino del double opt-in
  admin/                  dashboard de leads (login con Supabase)
  opengraph-image.tsx     OG image 1200×630 generada en build
components/               Landing (secciones), LeadForm (2 pasos), WhatsAppFab, WhatsAppLink, Analytics…
content/                  perfiles.ts · productos.ts · negocio.ts   ← todo el copy editable
lib/                      lead-schema (zod) · brevo · tracking · utm · rate-limit · token · meta-capi
emails/                   01–04 plantillas HTML para Brevo
supabase/schema.sql       tablas leads y admins, con Row Level Security
supabase/functions/lead/  Edge Function del formulario: guarda, Brevo y aviso a ventas
middleware.api.ts         ?perfil= → /p/[perfil] (solo modo servidor)
render.yaml               Blueprint de Render (Static Site)
.github/workflows/        pages.yml: export estático a GitHub Pages
assets/fonts/             Anton (OFL) para la OG image
scripts/optimize-images.mjs
```

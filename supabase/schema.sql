-- Base de datos de la landing (Supabase, plan gratis).
-- Supabase → SQL Editor → New query → pegar todo este archivo → Run. Se puede volver a correr.
--
-- Seguridad (Row Level Security):
-- - Nadie puede leer ni escribir `leads` con la clave pública (anon).
-- - Los leads los inserta solo la Edge Function `lead`, con la service role key.
-- - El dashboard /admin/ lee y cambia el estado solo si el usuario logueado está en `admins`.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  nombre text not null,
  email text not null,
  celular text not null,
  perfil text not null,
  ciudad text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  fbclid text,
  pagina text,
  -- Paso 2 (opcional)
  empresa text,
  etapa text,
  m2 text,
  intereses text[],
  -- Seguimiento comercial desde el dashboard
  estado text not null default 'nuevo' check (estado in ('nuevo', 'contactado', 'cotizado', 'ganado', 'descartado')),
  -- Resultado de la sincronización con Brevo ("ok", "sin configurar" o el error)
  brevo text,
  -- Secreto para que el paso 2 actualice solo su propia fila
  token uuid not null default gen_random_uuid()
);

create index if not exists leads_creado_idx on public.leads (creado desc);
create index if not exists leads_email_idx on public.leads (email);

-- Correos del equipo que pueden entrar al dashboard.
create table if not exists public.admins (
  email text primary key
);

alter table public.leads enable row level security;
alter table public.admins enable row level security;

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where email = lower(auth.jwt() ->> 'email'));
$$;

grant execute on function public.es_admin() to authenticated;

drop policy if exists "admins leen leads" on public.leads;
create policy "admins leen leads" on public.leads
  for select to authenticated using (public.es_admin());

drop policy if exists "admins actualizan leads" on public.leads;
create policy "admins actualizan leads" on public.leads
  for update to authenticated using (public.es_admin()) with check (public.es_admin());

-- Permisos explícitos: funcionan con "Automatically expose new tables" activado o no.
-- - anon (visitantes): nada.
-- - authenticated (equipo logueado): leer leads y cambiar solo el estado; RLS limita a `admins`.
-- - service_role (Edge Function `lead`): todo.
revoke all on public.leads, public.admins from anon, authenticated;
grant select on public.leads to authenticated;
grant update (estado) on public.leads to authenticated;
grant all on public.leads, public.admins to service_role;

-- Agrega aquí los correos del equipo (los mismos con los que se crean los usuarios en
-- Authentication → Users). Repite la línea para cada persona.
-- insert into public.admins (email) values ('ventas@decorcolombiatiles.com') on conflict do nothing;

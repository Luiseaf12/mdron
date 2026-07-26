create extension if not exists "uuid-ossp";

create type application_status as enum ('programado', 'en_proceso', 'completado', 'cancelado');

create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contact_name text,
  phone text,
  email text,
  ranch text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  brand text,
  active_ingredient text,
  unit text not null default 'L/ha',
  created_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.clients(id) on delete restrict,
  service_date date not null default current_date,
  hectares numeric(12,2) not null check (hectares > 0),
  price_per_hectare numeric(12,2) not null check (price_per_hectare >= 0),
  total numeric(14,2) generated always as (hectares * price_per_hectare) stored,
  crop text not null,
  field_name text,
  status application_status not null default 'programado',
  notes text,
  created_at timestamptz not null default now()
);

create table public.application_products (
  application_id uuid not null references public.applications(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  dose numeric(10,2) not null default 0 check (dose >= 0),
  primary key (application_id, product_id)
);

create index applications_client_idx on public.applications(client_id);
create index applications_service_date_idx on public.applications(service_date desc);
create index applications_status_idx on public.applications(status);

alter table public.clients enable row level security;
alter table public.products enable row level security;
alter table public.applications enable row level security;
alter table public.application_products enable row level security;

-- Políticas abiertas sólo para desarrollo local. Sustituir por auth.uid() antes de publicar.
create policy "local access clients" on public.clients for all using (true) with check (true);
create policy "local access products" on public.products for all using (true) with check (true);
create policy "local access applications" on public.applications for all using (true) with check (true);
create policy "local access application products" on public.application_products for all using (true) with check (true);


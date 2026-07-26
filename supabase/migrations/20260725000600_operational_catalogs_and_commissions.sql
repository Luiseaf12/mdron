create table public.crops (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.active_ingredients (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text,
  can_operate_drone boolean not null default false,
  can_sell boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (can_operate_drone or can_sell)
);

create table public.app_settings (
  id boolean primary key default true check (id),
  drone_commission_rate numeric(6,3) not null default 10 check (drone_commission_rate between 0 and 100),
  salesperson_commission_rate numeric(6,3) not null default 5 check (salesperson_commission_rate between 0 and 100),
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id) values (true);

insert into public.crops (name)
select distinct crop from public.applications where nullif(trim(crop), '') is not null
on conflict (name) do nothing;

insert into public.crops (name) values ('Maíz'), ('Nogal'), ('Algodón'), ('Chile')
on conflict (name) do nothing;

insert into public.active_ingredients (name)
select distinct active_ingredient from public.products where nullif(trim(active_ingredient), '') is not null
on conflict (name) do nothing;

insert into public.users (id, name, email, can_operate_drone, can_sell) values
('50000000-0000-0000-0000-000000000001', 'Ernesto Administrador', 'ernesto@aerocampo.local', true, true),
('50000000-0000-0000-0000-000000000002', 'Dronero Operativo', 'dronero@aerocampo.local', true, false),
('50000000-0000-0000-0000-000000000003', 'Vendedor Comercial', 'ventas@aerocampo.local', false, true);

alter table public.products add column active_ingredient_id uuid references public.active_ingredients(id) on delete restrict;
update public.products p set active_ingredient_id = i.id
from public.active_ingredients i where i.name = p.active_ingredient;

alter table public.applications
  add column crop_id uuid references public.crops(id) on delete restrict,
  add column drone_operator_id uuid references public.users(id) on delete restrict,
  add column salesperson_id uuid references public.users(id) on delete restrict,
  add column drone_commission_rate numeric(6,3) not null default 0 check (drone_commission_rate between 0 and 100),
  add column salesperson_commission_rate numeric(6,3) not null default 0 check (salesperson_commission_rate between 0 and 100),
  add column drone_commission numeric(14,2) generated always as (round(hectares * price_per_hectare * drone_commission_rate / 100, 2)) stored,
  add column salesperson_commission numeric(14,2) generated always as (round(hectares * price_per_hectare * salesperson_commission_rate / 100, 2)) stored;

update public.applications a set
  crop_id = c.id,
  drone_operator_id = '50000000-0000-0000-0000-000000000001',
  salesperson_id = '50000000-0000-0000-0000-000000000001',
  drone_commission_rate = s.drone_commission_rate,
  salesperson_commission_rate = s.salesperson_commission_rate
from public.crops c, public.app_settings s
where c.name = a.crop;

alter table public.applications
  alter column crop_id set not null,
  alter column drone_operator_id set not null,
  alter column salesperson_id set not null;

create or replace function public.validate_application_team()
returns trigger language plpgsql as $$
begin
  if not exists (select 1 from public.users where id = new.drone_operator_id and active and can_operate_drone) then
    raise exception 'El dronero seleccionado está inactivo o no tiene el perfil requerido';
  end if;
  if not exists (select 1 from public.users where id = new.salesperson_id and active and can_sell) then
    raise exception 'El vendedor seleccionado está inactivo o no tiene el perfil requerido';
  end if;
  if not exists (select 1 from public.crops where id = new.crop_id and active) then
    raise exception 'El cultivo seleccionado está inactivo';
  end if;
  return new;
end;
$$;

create trigger applications_active_team
before insert or update of drone_operator_id, salesperson_id, crop_id on public.applications
for each row execute function public.validate_application_team();

alter table public.crops enable row level security;
alter table public.active_ingredients enable row level security;
alter table public.users enable row level security;
alter table public.app_settings enable row level security;

create policy "local access crops" on public.crops for all using (true) with check (true);
create policy "local access active ingredients" on public.active_ingredients for all using (true) with check (true);
create policy "local access users" on public.users for all using (true) with check (true);
create policy "local access app settings" on public.app_settings for all using (true) with check (true);

grant select, insert, update, delete on public.crops, public.active_ingredients, public.users to anon, authenticated;
grant select, update on public.app_settings to anon, authenticated;

create index applications_crop_idx on public.applications(crop_id);
create index applications_drone_operator_idx on public.applications(drone_operator_id);
create index applications_salesperson_idx on public.applications(salesperson_id);
create index products_active_ingredient_idx on public.products(active_ingredient_id);

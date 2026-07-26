alter table public.clients add column active boolean not null default true;
alter table public.products add column active boolean not null default true;

create index clients_active_idx on public.clients(active);
create index products_active_idx on public.products(active);

comment on column public.clients.active is
  'Los clientes inactivos conservan su historial pero no pueden usarse en registros nuevos.';
comment on column public.products.active is
  'Los productos inactivos conservan su historial pero no pueden usarse en registros nuevos.';

create or replace function public.validate_active_client()
returns trigger language plpgsql as $$
begin
  if not exists (select 1 from public.clients where id = new.client_id and active) then
    raise exception 'El cliente seleccionado está inactivo';
  end if;
  return new;
end;
$$;

create or replace function public.validate_active_product()
returns trigger language plpgsql as $$
begin
  if not exists (select 1 from public.products where id = new.product_id and active) then
    raise exception 'El producto seleccionado está inactivo';
  end if;
  return new;
end;
$$;

create or replace function public.validate_active_family()
returns trigger language plpgsql as $$
begin
  if new.family_id is not null and not exists (
    select 1 from public.product_families where id = new.family_id and active
  ) then
    raise exception 'La familia seleccionada está inactiva';
  end if;
  return new;
end;
$$;

create trigger applications_active_client
before insert or update of client_id on public.applications
for each row execute function public.validate_active_client();

create trigger application_products_active_product
before insert or update of product_id on public.application_products
for each row execute function public.validate_active_product();

create trigger products_active_family
before insert or update of family_id on public.products
for each row execute function public.validate_active_family();

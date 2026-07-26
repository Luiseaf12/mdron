create table public.product_families (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.product_families enable row level security;
create policy "local access product families"
  on public.product_families for all using (true) with check (true);

grant select, insert, update, delete on table public.product_families to anon, authenticated;

insert into public.product_families (id, name) values
('40000000-0000-0000-0000-000000000001', 'Insecticida'),
('40000000-0000-0000-0000-000000000002', 'Fungicida'),
('40000000-0000-0000-0000-000000000003', 'Herbicida'),
('40000000-0000-0000-0000-000000000004', 'Bactericida'),
('40000000-0000-0000-0000-000000000005', 'Fertilizante foliar');

alter table public.products
  add column family_id uuid references public.product_families(id) on delete restrict;

update public.products
set family_id = case
  when name ilike '%herbicida%' then '40000000-0000-0000-0000-000000000003'::uuid
  when name ilike '%fungicida%' then '40000000-0000-0000-0000-000000000002'::uuid
  else '40000000-0000-0000-0000-000000000005'::uuid
end;

create index products_family_idx on public.products(family_id);

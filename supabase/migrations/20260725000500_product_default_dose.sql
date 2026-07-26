alter table public.products
  add column default_dose numeric(10,2) not null default 0
  check (default_dose >= 0);

update public.products
set default_dose = case
  when name ilike '%herbicida%' then 1.20
  when name ilike '%fungicida%' then 0.80
  else 1.00
end;

comment on column public.products.default_dose is
  'Dosis sugerida al agregar el producto a una aplicación; puede modificarse en cada aplicación.';

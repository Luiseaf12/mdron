alter table public.app_settings
  add column default_price_per_hectare numeric(12,2) not null default 400
  check (default_price_per_hectare >= 0);

comment on column public.app_settings.default_price_per_hectare is
  'Precio sugerido al crear una aplicación; puede modificarse en cada documento.';

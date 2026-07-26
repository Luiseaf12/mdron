-- Permisos requeridos por PostgREST para los roles usados desde el frontend.
-- Las políticas RLS siguen determinando qué filas puede consultar o modificar cada rol.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.clients to anon, authenticated;
grant select, insert, update, delete on table public.products to anon, authenticated;
grant select, insert, update, delete on table public.applications to anon, authenticated;
grant select, insert, update, delete on table public.application_products to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

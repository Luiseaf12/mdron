create or replace function public.validate_active_client()
returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' and new.client_id = old.client_id then
    return new;
  end if;
  if not exists (select 1 from public.clients where id = new.client_id and active) then
    raise exception 'El cliente seleccionado está inactivo';
  end if;
  return new;
end;
$$;

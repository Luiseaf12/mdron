create or replace function public.validate_application_team()
returns trigger language plpgsql as $$
begin
  if not (tg_op = 'UPDATE' and new.drone_operator_id = old.drone_operator_id)
     and not exists (select 1 from public.users where id = new.drone_operator_id and active and can_operate_drone) then
    raise exception 'El dronero seleccionado está inactivo o no tiene el perfil requerido';
  end if;
  if not (tg_op = 'UPDATE' and new.salesperson_id = old.salesperson_id)
     and not exists (select 1 from public.users where id = new.salesperson_id and active and can_sell) then
    raise exception 'El vendedor seleccionado está inactivo o no tiene el perfil requerido';
  end if;
  if not (tg_op = 'UPDATE' and new.crop_id = old.crop_id)
     and not exists (select 1 from public.crops where id = new.crop_id and active) then
    raise exception 'El cultivo seleccionado está inactivo';
  end if;
  return new;
end;
$$;

create or replace function public.validate_active_ingredient()
returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' and new.active_ingredient_id = old.active_ingredient_id then
    return new;
  end if;
  if new.active_ingredient_id is not null and not exists (
    select 1 from public.active_ingredients where id = new.active_ingredient_id and active
  ) then
    raise exception 'El ingrediente activo seleccionado está inactivo';
  end if;
  return new;
end;
$$;

create trigger products_active_ingredient
before insert or update of active_ingredient_id on public.products
for each row execute function public.validate_active_ingredient();

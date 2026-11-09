do $$
begin
  if to_regclass('public.items') is not null then
    alter table public.items
      add column if not exists crafting_duration_hours numeric;

    comment on column public.items.crafting_duration_hours is
      'Crafting duration in hours for crafted items. Null for items without crafting time.';
  end if;
end
$$;

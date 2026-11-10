-- Sidequest : sorts et inventaire homebrew (lots 5b et 5c, voir docs/conception-homebrew.md §10.3 et §10.5).

-- Sorts : champs que le MJ peut cocher en plus de ceux de D&D.
alter table public.spells
  add column if not exists school text,
  add column if not exists cost text,
  add column if not exists condition text;

-- Inventaire : en homebrew, items.category contient l'id d'une catégorie définie par le MJ.
-- On retire toute contrainte CHECK qui limiterait cette colonne aux catégories D&D.
do $$
declare
  c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'items'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%category%'
  loop
    execute format('alter table public.items drop constraint %I', c.conname);
  end loop;
end $$;

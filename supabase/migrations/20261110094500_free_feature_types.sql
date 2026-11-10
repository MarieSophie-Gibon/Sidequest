-- Sidequest : types de capacités libres (homebrew).
-- En homebrew, features.type contient l'id d'un type défini par le MJ (et plus seulement
-- 'classe' / 'espece' / 'don'). On retire toute contrainte CHECK qui limiterait cette colonne.

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
      and rel.relname = 'features'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%type%'
      and pg_get_constraintdef(con.oid) not ilike '%recharge%'
  loop
    execute format('alter table public.features drop constraint %I', c.conname);
  end loop;
end $$;

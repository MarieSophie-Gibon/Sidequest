-- Sidequest : support multi-systèmes (D&D 5e, Pathfinder 1e…)
-- Les personnages existants passent automatiquement en 'dnd5e' : aucune régression.

alter table characters
  add column if not exists system text not null default 'dnd5e',
  add column if not exists system_data jsonb not null default '{}'::jsonb,
  add column if not exists house_rules text[] not null default '{}';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'characters_system_check'
  ) then
    alter table characters
      add constraint characters_system_check check (system in ('dnd5e', 'pf1e'));
  end if;
end $$;

-- Les policies RLS existantes sur "characters" couvrent ces nouvelles colonnes.

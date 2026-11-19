-- Sidequest : champs de sort Pathfinder 1e (temps d'incantation, cible / effet, résistance à la magie).
-- L'école réutilise la colonne school ajoutée pour le homebrew.
alter table public.spells
  add column if not exists casting_time text,
  add column if not exists target text,
  add column if not exists spell_resistance text;

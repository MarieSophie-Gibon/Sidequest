-- Sidequest : ressources homebrew (lot 5a, voir docs/conception-homebrew.md §10.2).
-- display     : null = compteur −/+ (D&D, PF1) ; 'bullets' = puces à cocher ; 'valued' = puces avec une valeur chacune.
-- bullets     : puces avec valeur, [{ "value": "d8", "used": false }, …] (display = 'valued').
-- rest_id     : id d'un repos du système homebrew qui recharge la ressource (null = aucun).
-- rest_amount : utilisations récupérées si le repos n'est pas automatique (null = toutes).

alter table public.resources
  add column if not exists display text,
  add column if not exists bullets jsonb,
  add column if not exists rest_id text,
  add column if not exists rest_amount integer;

-- Sidequest : fiches homebrew (lot 2, voir docs/conception-homebrew.md).
-- Une fiche homebrew garde une COPIE de la structure dans system_data ;
-- game_system_id sert à retrouver le modèle (et plus tard ses aides de jeu, liées).

alter table public.characters drop constraint if exists characters_system_check;
alter table public.characters
  add constraint characters_system_check check (system in ('dnd5e', 'pf1e', 'homebrew'));

alter table public.characters
  add column if not exists game_system_id uuid references public.game_systems(id) on delete set null;
create index if not exists characters_game_system_id_idx on public.characters(game_system_id);

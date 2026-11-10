-- Sidequest : systèmes homebrew des MJ (lot 1, voir docs/conception-homebrew.md).
-- Pour l'instant, un système n'est visible et modifiable que par son MJ.
-- La lecture par les joueurs (nom, aides de jeu) arrivera avec les lots 3 et 4.

create table if not exists public.game_systems (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 80),
  description text check (description is null or char_length(description) <= 2000),
  base        text not null check (base in ('dnd5e', 'pf1e', 'libre')),
  structure   jsonb not null,
  -- Lien de distribution (lot 4) ; régénérable pour révoquer l'ancien.
  share_token uuid not null unique default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists game_systems_owner_id_idx on public.game_systems(owner_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists game_systems_touch_updated_at on public.game_systems;
create trigger game_systems_touch_updated_at
  before update on public.game_systems
  for each row execute function public.touch_updated_at();

alter table public.game_systems enable row level security;
drop policy if exists "Owners manage their game systems" on public.game_systems;
create policy "Owners manage their game systems" on public.game_systems
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

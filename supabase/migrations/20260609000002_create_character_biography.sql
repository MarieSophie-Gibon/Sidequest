-- ============================================================
-- Table : character_biography
-- Description biographique/personnalité d'un personnage
-- ============================================================

create table if not exists public.character_biography (
  character_id   uuid primary key references public.characters(id) on delete cascade,
  ideaux         text,
  alignement     text,
  liens          text,
  description_physique text,
  traits_principaux    text,
  defauts        text,
  backstory      text,
  updated_at     timestamptz not null default now()
);

-- Mise à jour automatique de updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_character_biography_updated_at
  before update on public.character_biography
  for each row execute procedure public.set_updated_at();

-- Row Level Security
alter table public.character_biography enable row level security;

create policy "Users can manage their own biography"
  on public.character_biography
  for all
  using (
    character_id in (
      select id from public.characters where user_id = auth.uid()
    )
  )
  with check (
    character_id in (
      select id from public.characters where user_id = auth.uid()
    )
  );

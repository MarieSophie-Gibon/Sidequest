-- Sidequest : campagnes du MJ, pour ranger les fiches qu'on lui a partagées.
-- Les campagnes sont privées au MJ : les joueurs ne les voient pas.
-- Une fiche partagée est rangée dans au plus une campagne par MJ (colonne character_viewers.campaign_id).

create table if not exists public.campaigns (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 1 and 80),
  created_at timestamptz not null default now()
);
create index if not exists campaigns_owner_id_idx on public.campaigns(owner_id);

alter table public.campaigns enable row level security;
drop policy if exists "Owners manage their campaigns" on public.campaigns;
create policy "Owners manage their campaigns" on public.campaigns
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Rangement : campagne choisie par le MJ pour une fiche qu'il suit.
alter table public.character_viewers
  add column if not exists campaign_id uuid references public.campaigns(id) on delete set null;
create index if not exists character_viewers_campaign_id_idx on public.character_viewers(campaign_id);

-- Le MJ ne peut modifier QUE campaign_id, et seulement sur ses propres accès,
-- vers une de ses campagnes (ou aucune).
revoke update on public.character_viewers from authenticated, anon;
grant update (campaign_id) on public.character_viewers to authenticated;

drop policy if exists "Viewers file shared characters into their campaigns" on public.character_viewers;
create policy "Viewers file shared characters into their campaigns" on public.character_viewers
  for update
  using (viewer_id = auth.uid())
  with check (
    viewer_id = auth.uid()
    and (campaign_id is null or exists (
      select 1 from public.campaigns c where c.id = campaign_id and c.owner_id = auth.uid()
    ))
  );

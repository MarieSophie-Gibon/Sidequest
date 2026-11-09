-- Sidequest : partage d'une fiche en lecture seule avec un MJ (compte requis).
--
-- 1. Le propriétaire crée une invitation (lien à durée limitée).
-- 2. Le MJ, connecté, ouvre le lien → accept_share() l'ajoute à character_viewers.
-- 3. Les policies « lecture » ci-dessous donnent au MJ un accès SELECT à la fiche et à ses
--    tables liées, sauf character_notes (privées). Aucun droit d'écriture n'est ajouté.
-- 4. Les tables de la fiche sont publiées en temps réel (Supabase Realtime respecte la RLS).

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists public.share_invites (
  token        uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  created_by   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '7 days'
);
create index if not exists share_invites_character_id_idx on public.share_invites(character_id);

create table if not exists public.character_viewers (
  character_id uuid not null references public.characters(id) on delete cascade,
  viewer_id    uuid not null references auth.users(id) on delete cascade,
  viewer_name  text,
  owner_name   text,
  created_at   timestamptz not null default now(),
  primary key (character_id, viewer_id)
);
create index if not exists character_viewers_viewer_id_idx on public.character_viewers(viewer_id);

-- ── Fonctions d'aide (security definer : évitent la récursion entre policies) ──

create or replace function public.owns_character(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.characters c where c.id = cid and c.user_id = auth.uid());
$$;

create or replace function public.can_view_character(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.character_viewers v where v.character_id = cid and v.viewer_id = auth.uid());
$$;

-- ── RLS des nouvelles tables ────────────────────────────────────────────────

alter table public.share_invites enable row level security;
drop policy if exists "Owners manage invites of their characters" on public.share_invites;
create policy "Owners manage invites of their characters" on public.share_invites
  for all
  using (created_by = auth.uid() and public.owns_character(character_id))
  with check (created_by = auth.uid() and public.owns_character(character_id));

alter table public.character_viewers enable row level security;
-- Le propriétaire voit et révoque les accès à ses fiches ; le MJ voit et quitte ses propres accès.
-- Pas de policy INSERT : l'ajout passe uniquement par accept_share().
drop policy if exists "Owners and viewers read access rows" on public.character_viewers;
create policy "Owners and viewers read access rows" on public.character_viewers
  for select using (viewer_id = auth.uid() or public.owns_character(character_id));
drop policy if exists "Owners and viewers delete access rows" on public.character_viewers;
create policy "Owners and viewers delete access rows" on public.character_viewers
  for delete using (viewer_id = auth.uid() or public.owns_character(character_id));

-- ── Lecture seule pour les MJ (policies SELECT ajoutées aux policies existantes) ──

drop policy if exists "Viewers read shared characters" on public.characters;
create policy "Viewers read shared characters" on public.characters
  for select using (public.can_view_character(id));

do $$
declare t text;
begin
  -- character_notes volontairement absente : les notes restent privées.
  foreach t in array array['resources', 'features', 'spells', 'items', 'familiars',
                           'character_skills', 'spell_slots', 'character_biography'] loop
    execute format('drop policy if exists "Viewers read shared %1$s" on public.%1$I', t);
    execute format('create policy "Viewers read shared %1$s" on public.%1$I for select using (public.can_view_character(character_id))', t);
  end loop;
end $$;

-- ── Acceptation d'une invitation ────────────────────────────────────────────

create or replace function public.accept_share(p_token uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_invite public.share_invites%rowtype;
  v_owner  uuid;
  v_owner_name text;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise.';
  end if;

  select * into v_invite from public.share_invites where token = p_token and expires_at > now();
  if not found then
    raise exception 'Ce lien de partage est invalide ou a expiré.';
  end if;

  select user_id into v_owner from public.characters where id = v_invite.character_id;
  if v_owner = auth.uid() then
    return v_invite.character_id; -- sa propre fiche : rien à partager
  end if;

  select coalesce(raw_user_meta_data->>'username', email) into v_owner_name from auth.users where id = v_owner;

  insert into public.character_viewers (character_id, viewer_id, viewer_name, owner_name)
  values (
    v_invite.character_id,
    auth.uid(),
    coalesce(auth.jwt()->'user_metadata'->>'username', auth.jwt()->>'email'),
    v_owner_name
  )
  on conflict (character_id, viewer_id) do nothing;

  return v_invite.character_id;
end $$;

revoke all on function public.accept_share(uuid) from public, anon;
grant execute on function public.accept_share(uuid) to authenticated;

-- ── Temps réel ──────────────────────────────────────────────────────────────

do $$
declare t text;
begin
  foreach t in array array['characters', 'resources', 'features', 'spells', 'items', 'familiars',
                           'character_skills', 'spell_slots', 'character_biography'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

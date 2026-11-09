-- Add silver and copper currencies for each character purse.
alter table public.characters
  add column if not exists silver integer not null default 0,
  add column if not exists copper integer not null default 0;

-- Enforce non-negative values.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'characters_silver_non_negative'
  ) then
    alter table public.characters
      add constraint characters_silver_non_negative check (silver >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'characters_copper_non_negative'
  ) then
    alter table public.characters
      add constraint characters_copper_non_negative check (copper >= 0);
  end if;
end $$;

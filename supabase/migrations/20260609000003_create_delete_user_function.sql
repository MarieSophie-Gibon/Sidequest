-- ============================================================
-- Function: public.delete_user()
-- Description: deletes the currently authenticated user account
-- ============================================================

create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Remove user-owned gameplay data first to avoid FK conflicts.
  delete from public.characters where user_id = auth.uid();

  -- Remove auth account.
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_user() from public;
grant execute on function public.delete_user() to authenticated;

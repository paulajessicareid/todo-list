-- Clear prototype rows that have no owner
delete from public.todos;

-- Add user ownership
alter table public.todos
  add column user_id uuid not null default auth.uid() references auth.users (id) on delete cascade;

-- Drop open policies
drop policy if exists "public_select" on public.todos;
drop policy if exists "public_insert" on public.todos;
drop policy if exists "public_update" on public.todos;
drop policy if exists "public_delete" on public.todos;

-- User-scoped RLS
create policy "users_select_own" on public.todos
  for select using (auth.uid() = user_id);

create policy "users_insert_own" on public.todos
  for insert with check (auth.uid() = user_id);

create policy "users_update_own" on public.todos
  for update using (auth.uid() = user_id);

create policy "users_delete_own" on public.todos
  for delete using (auth.uid() = user_id);

-- Merge anonymous todos into a permanent account on login
create or replace function public.merge_anonymous_todos(anonymous_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.todos
  set user_id = auth.uid()
  where user_id = anonymous_id
    and exists (
      select 1 from auth.users
      where id = anonymous_id
        and coalesce(raw_app_meta_data->>'provider', '') = 'anonymous'
    );
end;
$$;

grant execute on function public.merge_anonymous_todos(uuid) to authenticated;

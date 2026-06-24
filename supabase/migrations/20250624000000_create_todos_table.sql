create table public.todos (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.todos enable row level security;

create policy "public_select" on public.todos
  for select using (true);

create policy "public_insert" on public.todos
  for insert with check (true);

create policy "public_update" on public.todos
  for update using (true);

create policy "public_delete" on public.todos
  for delete using (true);

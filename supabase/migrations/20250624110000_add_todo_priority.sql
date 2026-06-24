create type public.todo_priority as enum ('low', 'medium', 'high');

alter table public.todos
  add column priority public.todo_priority not null default 'medium';

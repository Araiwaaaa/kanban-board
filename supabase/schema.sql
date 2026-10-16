-- Run manually in the Supabase SQL Editor.
drop table if exists expenses;

create table cards (
  id bigint generated always as identity primary key,
  title text not null check (length(trim(title)) > 0 and length(title) <= 100),
  status text not null default 'todo' check (status in ('todo','doing','done')),
  created_at timestamptz not null default now()
);
alter table cards enable row level security;

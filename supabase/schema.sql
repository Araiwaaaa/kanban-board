-- Run manually in the Supabase SQL Editor.
create table expenses (
  id bigint generated always as identity primary key,
  title text not null check (length(trim(title)) > 0),
  amount_baht integer not null check (amount_baht > 0),
  category text not null check (category in ('Food','Transport','Bills','Shopping','Other')),
  spent_on date not null,
  created_at timestamptz not null default now()
);
alter table expenses enable row level security;

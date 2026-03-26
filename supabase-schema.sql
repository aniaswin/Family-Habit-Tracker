create table if not exists public.members (
  id text primary key,
  name text not null,
  avatar text not null,
  color text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.habits (
  id text primary key,
  member_id text not null references public.members(id) on delete cascade,
  name text not null,
  points integer not null check (points > 0),
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.completions (
  member_id text not null references public.members(id) on delete cascade,
  habit_id text not null references public.habits(id) on delete cascade,
  date date not null,
  completed boolean not null default true,
  created_at timestamptz default now(),
  primary key (member_id, habit_id, date)
);

alter table public.members enable row level security;
alter table public.habits enable row level security;
alter table public.completions enable row level security;

drop policy if exists "No direct member access" on public.members;
drop policy if exists "No direct habit access" on public.habits;
drop policy if exists "No direct completion access" on public.completions;

create policy "No direct member access"
on public.members
for all
to anon, authenticated
using (false)
with check (false);

create policy "No direct habit access"
on public.habits
for all
to anon, authenticated
using (false)
with check (false);

create policy "No direct completion access"
on public.completions
for all
to anon, authenticated
using (false)
with check (false);

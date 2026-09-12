create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.run_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  run_key uuid not null,
  hero_id text not null check (hero_id in ('arkan', 'seria', 'kain', 'edric')),
  survived_seconds integer not null check (survived_seconds >= 0 and survived_seconds <= 604800),
  level integer not null check (level >= 1 and level <= 999),
  kills integer not null check (kills >= 0),
  gold_earned integer not null check (gold_earned >= 0),
  bosses_killed integer not null check (bosses_killed >= 0),
  ended_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, run_key)
);

alter table public.profiles enable row level security;
alter table public.run_records enable row level security;

create policy "profiles select own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles insert own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles update own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "run records select own" on public.run_records for select to authenticated using ((select auth.uid()) = user_id);
create policy "run records insert own" on public.run_records for insert to authenticated with check ((select auth.uid()) = user_id);

alter table public.run_records
  add column threat_level smallint not null default 0
  check (threat_level between 0 and 5);

create table public.leaderboard_entries (
  threat_level smallint not null check (threat_level between 0 and 5),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  hero_id text not null check (hero_id in ('arkan', 'seria', 'kain', 'edric')),
  survived_seconds integer not null check (survived_seconds >= 0 and survived_seconds <= 604800),
  level integer not null check (level >= 1 and level <= 999),
  kills integer not null check (kills >= 0),
  ended_at timestamptz not null,
  primary key (threat_level, user_id)
);

alter table public.leaderboard_entries enable row level security;
revoke all on table public.leaderboard_entries from public, anon, authenticated;

create function public.refresh_leaderboard_entry()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  resolved_display_name text;
begin
  select coalesce(nullif(trim(p.display_name), ''), '마도사 #' || substr(new.user_id::text, 1, 4))
    into resolved_display_name
    from public.profiles p
    where p.id = new.user_id;

  resolved_display_name := coalesce(resolved_display_name, '마도사 #' || substr(new.user_id::text, 1, 4));

  insert into public.leaderboard_entries (
    threat_level, user_id, display_name, hero_id, survived_seconds, level, kills, ended_at
  ) values (
    new.threat_level, new.user_id, resolved_display_name, new.hero_id, new.survived_seconds, new.level, new.kills, new.ended_at
  ) on conflict (threat_level, user_id) do update
    set display_name = excluded.display_name,
        hero_id = excluded.hero_id,
        survived_seconds = excluded.survived_seconds,
        level = excluded.level,
        kills = excluded.kills,
        ended_at = excluded.ended_at
    where excluded.survived_seconds > public.leaderboard_entries.survived_seconds
      or (excluded.survived_seconds = public.leaderboard_entries.survived_seconds and excluded.kills > public.leaderboard_entries.kills)
      or (excluded.survived_seconds = public.leaderboard_entries.survived_seconds and excluded.kills = public.leaderboard_entries.kills and excluded.level > public.leaderboard_entries.level)
      or (excluded.survived_seconds = public.leaderboard_entries.survived_seconds and excluded.kills = public.leaderboard_entries.kills and excluded.level = public.leaderboard_entries.level and excluded.ended_at < public.leaderboard_entries.ended_at);

  return new;
end;
$$;

create trigger refresh_leaderboard_after_run_record
after insert on public.run_records
for each row execute function public.refresh_leaderboard_entry();

create function public.get_leaderboard(p_threat_level smallint, p_limit integer default 20)
returns table (
  rank bigint,
  display_name text,
  hero_id text,
  survived_seconds integer,
  level integer,
  kills integer,
  threat_level smallint,
  ended_at timestamptz
)
language sql
stable
security definer set search_path = ''
as $$
  select
    row_number() over (order by e.survived_seconds desc, e.kills desc, e.level desc, e.ended_at asc) as rank,
    e.display_name,
    e.hero_id,
    e.survived_seconds,
    e.level,
    e.kills,
    e.threat_level,
    e.ended_at
  from public.leaderboard_entries e
  where e.threat_level = greatest(0, least(5, p_threat_level))
  order by e.survived_seconds desc, e.kills desc, e.level desc, e.ended_at asc
  limit greatest(1, least(20, p_limit));
$$;

revoke execute on function public.refresh_leaderboard_entry() from public, anon, authenticated;
revoke execute on function public.get_leaderboard(smallint, integer) from public;
grant execute on function public.get_leaderboard(smallint, integer) to anon, authenticated;

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const sql = readdirSync('supabase/migrations')
  .filter((file) => file.endsWith('.sql'))
  .map((file) => readFileSync(`supabase/migrations/${file}`, 'utf8'))
  .join('\n');

test('cloud history schema enables RLS and contains owner-scoped policies', () => {
  assert.match(sql, /create table public\.profiles/i);
  assert.match(sql, /create table public\.run_records/i);
  assert.match(sql, /alter table public\.profiles enable row level security/i);
  assert.match(sql, /alter table public\.run_records enable row level security/i);
  assert.match(sql, /unique \(user_id, run_key\)/i);
  assert.match(sql, /\(select auth\.uid\(\)\) = user_id/i);
});

test('leaderboard keeps storage private and exposes UUID-free ranked rows through a secured RPC', () => {
  assert.match(sql, /alter table public\.leaderboard_entries enable row level security/i);
  assert.match(sql, /threat_level smallint not null check \(threat_level between 0 and 5\)/i);
  assert.match(sql, /create function public\.get_leaderboard/i);
  assert.match(sql, /security definer set search_path = ''/i);
  assert.match(sql, /revoke execute on function public\.get_leaderboard.* from public/i);
  assert.match(sql, /grant execute on function public\.get_leaderboard.* to anon, authenticated/i);
  assert.match(sql, /create trigger.*after insert on public\.run_records/is);
});

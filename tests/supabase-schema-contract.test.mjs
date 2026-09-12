import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync('supabase/migrations/20260912144059_create_profiles_and_run_records.sql', 'utf8');

test('cloud history schema enables RLS and contains owner-scoped policies', () => {
  assert.match(sql, /create table public\.profiles/i);
  assert.match(sql, /create table public\.run_records/i);
  assert.match(sql, /alter table public\.profiles enable row level security/i);
  assert.match(sql, /alter table public\.run_records enable row level security/i);
  assert.match(sql, /unique \(user_id, run_key\)/i);
  assert.match(sql, /\(select auth\.uid\(\)\) = user_id/i);
});

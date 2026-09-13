import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('static browser shell maps the optional Supabase SDK dependency', () => {
  const index = readFileSync('index.html', 'utf8');
  assert.match(index, /type="importmap"/);
  assert.match(index, /"@supabase\/supabase-js"/);
});

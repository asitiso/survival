import test from 'node:test';
import assert from 'node:assert/strict';
import { supabaseClient, supabaseConfigured } from '../dist/cloud/supabase-client.js';

test('cloud client remains unavailable without public runtime configuration', () => {
  assert.equal(supabaseConfigured(), false);
  assert.equal(supabaseClient(), null);
});

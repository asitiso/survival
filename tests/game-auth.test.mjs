import test from 'node:test';
import assert from 'node:assert/strict';
import { GameAuth } from '../dist/cloud/game-auth.js';

test('unconfigured auth stays unavailable without an OAuth request', async () => {
  const auth = new GameAuth(() => null);
  assert.deepEqual(await auth.initialize(), { status: 'unconfigured', userId: null });
});

test('Google login uses Supabase OAuth provider and caller redirect', async () => {
  const calls = [];
  const auth = new GameAuth(() => ({
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithOAuth: async (options) => { calls.push(options); return { error: null }; },
      signOut: async () => ({ error: null }),
    },
  }));

  await auth.signInWithGoogle('https://game.example.com');
  assert.deepEqual(calls, [{ provider: 'google', options: { redirectTo: 'https://game.example.com' } }]);
});

test('session restore and sign out notify subscribers', async () => {
  const auth = new GameAuth(() => ({
    auth: {
      getSession: async () => ({ data: { session: { user: { id: 'user-a' } } }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithOAuth: async () => ({ error: null }),
      signOut: async () => ({ error: null }),
    },
  }));
  const states = [];
  auth.subscribe((state) => states.push(state));
  await auth.initialize();
  await auth.signOut();
  assert.deepEqual(states.at(-2), { status: 'authenticated', userId: 'user-a' });
  assert.deepEqual(states.at(-1), { status: 'guest', userId: null });
});

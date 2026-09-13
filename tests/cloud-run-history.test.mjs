import test from 'node:test';
import assert from 'node:assert/strict';
import { CloudRunHistory } from '../dist/cloud/run-history.js';

test('cloud run history upserts an authenticated player record with the stable user/run key', async () => {
  const calls = [];
  const history = new CloudRunHistory(() => ({
    from: (table) => ({
      upsert: async (row, options) => { calls.push({ table, row, options }); return { error: null }; },
    }),
  }));

  await history.save('user-1', {
    runKey: 'c4759d5e-04a6-4ef0-a920-c10de5401af0', heroId: 'arkan', survivedSeconds: 321,
    level: 12, kills: 345, goldEarned: 678, bossesKilled: 2,
  });

  assert.deepEqual(calls, [{
    table: 'run_records',
    row: { user_id: 'user-1', run_key: 'c4759d5e-04a6-4ef0-a920-c10de5401af0', hero_id: 'arkan', survived_seconds: 321, level: 12, kills: 345, gold_earned: 678, bosses_killed: 2 },
    options: { onConflict: 'user_id,run_key' },
  }]);
});

test('cloud run history is a no-op without Supabase configuration or a user', async () => {
  const history = new CloudRunHistory(() => null);
  await history.save(null, { runKey: 'c4759d5e-04a6-4ef0-a920-c10de5401af0', heroId: 'arkan', survivedSeconds: 1, level: 1, kills: 0, goldEarned: 0, bossesKilled: 0 });
});

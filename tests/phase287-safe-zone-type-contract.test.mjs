import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('current mythic safe-zone helper is non-null because every call site owns the mythic guard',()=>{
  assert.match(source,/private currentMythicSafeZone\([^)]*\): ReturnType<typeof mythicSafeZoneState> \{/);
  const start=source.indexOf('private currentMythicSafeZone');
  const end=source.indexOf('\n  }',start);
  const body=source.slice(start,end);
  assert.doesNotMatch(body,/return null/);
});

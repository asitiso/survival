import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 1511 Game routes hero and core critical warnings through unified combat attention arbitration',()=>{
  assert.match(source,/combatAttentionPolicy/);
  assert.match(source,/heroCritical\s*:\s*this\.dangerState\.heroCritical/);
  assert.match(source,/coreCritical\s*:\s*this\.dangerState\.coreCritical/);
  assert.match(source,/heroWarningAnimated/);
  assert.match(source,/coreWarningAnimated/);
});

test('phase 1519 boss response becomes compact but remains visible under hp critical focus',()=>{
  assert.match(source,/bossAssistCompact/);
  assert.match(source,/showBossAssistLabel/);
  assert.match(source,/actionAssist/);
});

test('phase 1527 reduced flash participates in critical-warning arbitration',()=>{
  assert.match(source,/combatAttentionPolicy\(\{[\s\S]*?reducedFlash\s*:\s*this\.presentationSettings\.reducedFlash/);
  assert.match(source,/criticalMotionAmplitude/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const enemiesSource=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8');

test('Phase 4461-4466 exposes capped effective healing accounting without changing HP math',async()=>{
  const mod=await import('../dist/game/enemies.js');
  assert.equal(typeof mod.enemyHealingAccounting,'function');
  const capped=mod.enemyHealingAccounting(90,100,25);
  assert.deepEqual(capped,{requestedHeal:25,hpRestored:10,overheal:15});
  const full=mod.enemyHealingAccounting(40,100,25);
  assert.deepEqual(full,{requestedHeal:25,hpRestored:25,overheal:0});
});

test('Phase 4461-4466 regenerating elite reports actual restored HP through presentation feedback',()=>{
  assert.match(enemiesSource,/enemyHealingAccounting\(hpBeforeRegen,\s*enemy\.maxHp,\s*requestedHeal\)/);
  assert.match(enemiesSource,/addHealingResponse\?\.\(enemy\.pos,\s*healing,\s*'regenerating'/);
  assert.match(enemiesSource,/enemy\.hp = Math\.min\(enemy\.maxHp, enemy\.hp \+ enemy\.maxHp \* \(enemy\.regenPerSecondRatio \?\? 0\) \* dt\)/);
});

test('Phase 4461-4466 shaman reports requested heal actual restored HP and overheal per target',()=>{
  assert.match(enemiesSource,/const requestedHeal = Math\.max\(SPECIALIST_COMBAT_CONTRACT\.shamanHealMinimum, ally\.maxHp \* SPECIALIST_COMBAT_CONTRACT\.shamanHealRatio\)/);
  assert.match(enemiesSource,/enemyHealingAccounting\(hpBeforeHeal,\s*ally\.maxHp,\s*requestedHeal\)/);
  assert.match(enemiesSource,/addHealingResponse\?\.\(ally\.pos,\s*healing,\s*'shaman'/);
});

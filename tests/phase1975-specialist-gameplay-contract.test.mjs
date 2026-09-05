import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIALIST_COMBAT_CONTRACT } from '../dist/game/enemy-specialists.js';

const enemiesSource=readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8');
const autoTargetSource=readFileSync(new URL('../src/game/auto-targeting.ts',import.meta.url),'utf8');

test('phase 1975 specialist gameplay constants are centralized at the existing numeric values',()=>{
  assert.deepEqual(SPECIALIST_COMBAT_CONTRACT,{
    bomberBlastRadius:82,
    shieldGuardRatio:0.45,
    assassinBlinkResetSeconds:4.2,
    assassinInitialBaseSeconds:3.2,
    assassinInitialRandomSeconds:1.5,
    shamanHealRadius:220,
    shamanHealMinimum:10,
    shamanHealRatio:0.10,
    nullifierEffectRadius:245,
    nullifierCooldownStep:0.08,
    nullifierCooldownCap:1.24,
  });
});

test('phase 1975 enemy runtime consumes the frozen specialist contract without changing formulas',()=>{
  assert.match(enemiesSource,/SPECIALIST_COMBAT_CONTRACT\.assassinBlinkResetSeconds/);
  assert.match(enemiesSource,/SPECIALIST_COMBAT_CONTRACT\.assassinInitialBaseSeconds/);
  assert.match(enemiesSource,/SPECIALIST_COMBAT_CONTRACT\.assassinInitialRandomSeconds/);
  assert.match(enemiesSource,/SPECIALIST_COMBAT_CONTRACT\.bomberBlastRadius/);
  assert.match(enemiesSource,/SPECIALIST_COMBAT_CONTRACT\.shamanHealRadius \+ ally\.radius/);
  assert.match(enemiesSource,/SPECIALIST_COMBAT_CONTRACT\.shamanHealMinimum/);
  assert.match(enemiesSource,/SPECIALIST_COMBAT_CONTRACT\.shamanHealRatio/);
  assert.match(enemiesSource,/stats\.hp \* SPECIALIST_COMBAT_CONTRACT\.shieldGuardRatio/);
  assert.match(autoTargetSource,/const AUTO_SWITCH_MARGIN=48/);
});

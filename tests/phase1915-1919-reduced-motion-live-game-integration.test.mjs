import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 1915-1919 game forwards reducedMotion through live combat motion policies',()=>{
  assert.match(game,/combatAttentionPolicy\(\{[\s\S]{0,420}?reducedMotion\s*:\s*this\.presentationSettings\.reducedMotion/);
  assert.match(game,/targetGuidanceMotionPolicy\(\{[^}]*reducedMotion\s*:\s*this\.presentationSettings\.reducedMotion/);
  assert.match(game,/objectiveMarkerMotionPolicy\(\{[^}]*reducedMotion\s*:\s*this\.presentationSettings\.reducedMotion/);
  assert.match(game,/secondaryCombatMotionPolicy\(\{[\s\S]{0,380}?reducedMotion\s*:\s*this\.presentationSettings\.reducedMotion/);
  assert.match(game,/residualCombatMotionPolicy\(\{[\s\S]{0,380}?reducedMotion\s*:\s*this\.presentationSettings\.reducedMotion/);
  assert.match(game,/actionCuePresentation\(\{[\s\S]{0,420}?reducedMotion\s*:/);
  assert.match(game,/bossPressureEnvelope\([^\n]+this\.presentationSettings\.reducedFlash\s*,\s*this\.presentationSettings\.reducedMotion\)/);
});

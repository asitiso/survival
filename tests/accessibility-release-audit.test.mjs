import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { defaultPresentationSettings, loadPresentationSettings } from '../dist/game/presentation-settings.js';
import { auditAccessibilityRelease } from '../dist/game/accessibility-release-audit.js';

test('phase 715 reduced-motion system preference defaults flash and shake to reduced without adding a setting field',()=>{
  const storage={getItem:()=>null};
  const settings=loadPresentationSettings(storage,true);
  assert.equal(settings.reducedFlash,true);
  assert.equal(settings.reducedShake,true);
  assert.deepEqual(Object.keys(settings).sort(),Object.keys(defaultPresentationSettings()).sort());
});
test('phase 716 accessibility audit verifies reduced flash shake haptics and audio mute independently',()=>{
  const audit=auditAccessibilityRelease();
  assert.equal(audit.reducedFlashSafe,true);
  assert.equal(audit.reducedShakeSafe,true);
  assert.equal(audit.hapticsCanDisable,true);
  assert.equal(audit.audioCanMute,true);
});
test('phase 717 presentation controls expose accessible names and pressed state while the canvas keeps an aria label',()=>{
  const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  const main=fs.readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
  assert.match(game,/aria-label/);
  assert.match(game,/aria-pressed/);
  assert.match(main,/Arcane Last Stand 전투 화면/);
});
test('phase 718 accessibility release audit passes without reducing critical telegraph information',()=>{
  const audit=auditAccessibilityRelease();
  assert.equal(audit.criticalTelegraphsPreserved,true);
  assert.equal(audit.actionCount,9);
  assert.equal(audit.passed,true);
});

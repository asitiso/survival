import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditVisualEffectsSafety } from '../dist/game/visual-effects-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';

test('phase 895-896 advanced visual audit covers boss camera chain and map environment samples',()=>{
  const audit=auditVisualEffectsSafety();
  assert.equal(audit.bossCinematicSamples,12);
  assert.equal(audit.cameraPressureSamples,5);
  assert.equal(audit.killChainTierSamples,3);
  assert.equal(audit.mapEnvironmentSamples,9);
  assert.equal(audit.advancedVisualEffectsPassed,true);
  assert.equal(audit.passed,true);
});

test('phase 897 release freeze inherits advanced visual effects safety through the existing visual gate',()=>{
  const freeze=auditReleaseFreeze();
  assert.equal(freeze.visualEffectsPassed,true);
  assert.equal(freeze.passed,true);
});

test('phase 898 adaptive quality load includes screen and death burst pressure without changing telegraph reserve',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  const start=source.indexOf('private updatePresentationQuality');
  const block=source.slice(start,source.indexOf('private handleSuccessfulCast',start));
  assert.match(block,/screenEffectCount/);
  assert.match(block,/deathBurstCount/);
  assert.match(block,/governor\.telegraphCap/);
});

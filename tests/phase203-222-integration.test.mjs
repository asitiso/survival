import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import { auditDefaultRasterBaselines } from '../dist/game/render-raster-baseline.js';
import { renderContract, auditRenderContract } from '../dist/game/render-contract.js';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');

test('phase 203-222 preserves nine combat actions and adds no transient snapshot fields',()=>{
  assert.equal(ACTION_BUTTONS.length,9);
  for(const token of ['arenaDodgeFinisher','safeLaneLink','mythicSafeZone','foldableDensity'])assert.equal(snapshot.includes(token),false,token);
});

test('game wires finisher safe link safe zone and foldable density into existing seams',()=>{
  for(const token of ['shouldTriggerArenaDodgeFinisher','consumeSafeLanePerfectEvade','mythicSafeZoneState','mythicSafeZoneDamageMultiplier','foldableDensityPolicy'])assert.ok(game.includes(token),token);
  assert.ok(game.includes('SAFE LINK'));
  assert.ok(game.includes('SAFE ZONE'));
});

test('five representative render contracts remain structurally valid',()=>{
  for(const [w,h] of [[1600,900],[2400,1080],[1200,900],[2208,1840],[3840,1080]]){
    const audit=auditRenderContract(renderContract(w,h));
    assert.equal(audit.ok,true,`${w}x${h}: ${audit.issues.join(',')}`);
  }
});

test('default raster baseline gate passes all five landscape classes',()=>{
  const audit=auditDefaultRasterBaselines();
  assert.equal(audit.ok,true,audit.issues.join(','));
  assert.equal(audit.entries.length,5);
});

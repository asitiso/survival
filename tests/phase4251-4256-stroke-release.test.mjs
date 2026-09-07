import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  projectileFinalReadabilitySettlePresentation,
  impactFinalReadabilitySettlePresentation,
  hazardFinalReadabilitySettlePresentation,
  safeLaneFinalReadabilitySettlePresentation,
} from '../dist/game/threat-impact-final-readability-settle-rendering.js';

const src=(path)=>fs.readFileSync(new URL(`../src/game/${path}`,import.meta.url),'utf8');

test('secondary stroke width releases monotonically with reacquisition',()=>{
  const samples=[0,.25,.5,.75,1].map(reacquire=>impactFinalReadabilitySettlePresentation({primaryFloor:.3,reacquire,stress:1,critical:false}));
  for(let i=1;i<samples.length;i++) assert.ok(samples[i].strokeWidthScale>=samples[i-1].strokeWidthScale);
  assert.ok(samples[0].strokeWidthScale<samples.at(-1).strokeWidthScale);
  assert.equal(samples.at(-1).strokeWidthScale,1);
});

test('critical release is no weaker than normal release while safe lane stays canonical',()=>{
  const normal=hazardFinalReadabilitySettlePresentation({primaryFloor:.3,reacquire:.25,stress:1,critical:false});
  const critical=hazardFinalReadabilitySettlePresentation({primaryFloor:.3,reacquire:.25,stress:1,critical:true});
  const lane=safeLaneFinalReadabilitySettlePresentation({primaryFloor:.3,reacquire:0,stress:1,critical:true,confidence:1});
  assert.ok(critical.strokeWidthScale>=normal.strokeWidthScale);
  assert.equal(lane.strokeWidthScale,1);
});

test('live secondary strokes consume release scale without weakening protected owners',()=>{
  const enemies=src('enemies.ts'),spells=src('spells.ts'),game=src('game.ts');
  assert.match(enemies,/projectileFinalSettle\.strokeWidthScale/);
  assert.match(enemies,/projectile\.bossArchetype\?1:projectileFinalSettle\.strokeWidthScale/);
  assert.match(spells,/impactFinalSettle\.strokeWidthScale/);
  assert.match(game,/hazard\.telegraph\s*>\s*0\s*\?\s*1\s*:\s*hazardFinalSettle\.strokeWidthScale/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import { renderContract, auditRenderContract } from '../dist/game/render-contract.js';
import { rasterizeRenderContract, rasterContractSignature, rasterSimilarity } from '../dist/game/render-raster-contract.js';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');

test('phase 183-202 keeps the combat surface at nine actions and adds no snapshot schema fields',()=>{
  assert.equal(ACTION_BUTTONS.length,9);
  assert.ok(!snapshot.includes('arenaDodgeChain'));
  assert.ok(!snapshot.includes('safeLane'));
  assert.ok(!snapshot.includes('flowLink'));
});

test('game integrates evade chain, safe lane, flow link and foldable status panel',()=>{
  for(const token of ['recordArenaDodgeChain','mythicSafeLaneHint','finalFormFlowLink','safeArea.statusPanel'])assert.ok(game.includes(token),token);
  assert.ok(game.includes('PERFECT EVADE')||game.includes('dodgeStep.reward.label'));
  assert.ok(game.includes('streak:3'));
});

test('representative render contracts remain valid across five landscape classes',()=>{
  for(const [w,h] of [[1600,900],[2400,1080],[1200,900],[2208,1840],[3840,1080]]){
    const c=renderContract(w,h),audit=auditRenderContract(c);
    assert.equal(audit.ok,true,`${w}x${h}: ${audit.issues.join(',')}`);
    const r=rasterizeRenderContract(c);
    assert.match(rasterContractSignature(r),/^RR-[0-9A-F]{8}$/);
    assert.equal(rasterSimilarity(r,r),1);
  }
});

test('foldable render contract keeps critical panels on opposite sides of the hinge',()=>{
  const c=renderContract(2208,1840),hinge=c.safeArea.hingeExclusion;
  assert.ok(hinge);
  const frame=c.frames[0];
  const hero=frame.primitives.find((p)=>p.id==='hero-hud');
  const status=frame.primitives.find((p)=>p.id==='status-hud');
  assert.ok(hero&&status&&hero.kind==='rect'&&status.kind==='rect');
  assert.ok(hero.x+hero.width<=hinge.x);
  assert.ok(status.x>=hinge.x+hinge.width);
});

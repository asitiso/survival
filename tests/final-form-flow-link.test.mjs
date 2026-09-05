import test from 'node:test';
import assert from 'node:assert/strict';
import { finalFormFlowLink } from '../dist/game/endless/final-form-flow-link.js';

test('flow link is inactive below max flow and activates at five',()=>{
  assert.equal(finalFormFlowLink('solar-sovereign',4),null);
  const link=finalFormFlowLink('solar-sovereign',5);
  assert.ok(link);
  assert.equal(link.label,'FLOW LINK');
});

test('mobility families create distinct bounded signature links',()=>{
  const surge=finalFormFlowLink('solar-sovereign',5);
  const flow=finalFormFlowLink('tempest-runner',5);
  const drift=finalFormFlowLink('storm-oracle',5);
  const anchor=finalFormFlowLink('oath-guardian',5);
  assert.ok(surge.damageMultiplier>flow.damageMultiplier);
  assert.ok(flow.chainBonus>=2);
  assert.ok(drift.radiusMultiplier>1);
  assert.ok(anchor.pushMultiplier>1);
  for(const x of [surge,flow,drift,anchor]){
    assert.ok(x.damageMultiplier<=1.22);
    assert.ok(x.radiusMultiplier<=1.18);
    assert.ok(x.pushMultiplier<=1.25);
    assert.ok(x.chainBonus<=4);
  }
});

test('invalid form id never creates a link',()=>{
  assert.equal(finalFormFlowLink('unknown-form',5),null);
});

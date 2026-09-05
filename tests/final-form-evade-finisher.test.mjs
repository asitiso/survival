import test from 'node:test';
import assert from 'node:assert/strict';
import { finalFormCatalog } from '../dist/game/endless/final-form.js';
import { arenaDodgeFinisherProfile } from '../dist/game/endless/arena-dodge-finisher.js';
import { finalFormEvadeFinisher } from '../dist/game/endless/final-form-evade-finisher.js';

const ids=['arkan','seria','kain','edric'].flatMap((hero)=>finalFormCatalog(hero).map((form)=>form.id));

test('all twelve final forms receive deterministic evade finisher identity',()=>{
  assert.equal(ids.length,12);
  const base=arenaDodgeFinisherProfile();
  const profiles=ids.map((id)=>finalFormEvadeFinisher(id,base));
  assert.equal(new Set(profiles.map((p)=>p.family)).size,4);
  assert.equal(new Set(profiles.map((p)=>`${p.family}:${p.accent}`)).size>=4,true);
  for(let i=0;i<ids.length;i++)assert.deepEqual(finalFormEvadeFinisher(ids[i],base),profiles[i]);
});

test('final form evade finishers stay inside mobile-safe combat caps',()=>{
  const base=arenaDodgeFinisherProfile();
  for(const id of ids){
    const p=finalFormEvadeFinisher(id,base);
    assert.ok(p.radius>=145&&p.radius<=230,`${id}: radius ${p.radius}`);
    assert.ok(p.damageMultiplier>=.7&&p.damageMultiplier<=1.24,`${id}: damage ${p.damageMultiplier}`);
    assert.ok(p.pushDistance>=18&&p.pushDistance<=82,`${id}: push ${p.pushDistance}`);
    assert.ok(p.chainTargets>=0&&p.chainTargets<=8,`${id}: chains ${p.chainTargets}`);
    assert.ok(p.coreHealPercent>=0&&p.coreHealPercent<=.018,`${id}: core heal ${p.coreHealPercent}`);
    assert.ok(p.signatureChargeBonus>=2.5&&p.signatureChargeBonus<=5.2,`${id}: signature ${p.signatureChargeBonus}`);
  }
});

test('finisher identity meaningfully separates execution chain control and bulwark',()=>{
  const base=arenaDodgeFinisherProfile();
  const execution=finalFormEvadeFinisher('solar-sovereign',base);
  const chain=finalFormEvadeFinisher('tempest-runner',base);
  const control=finalFormEvadeFinisher('absolute-empress',base);
  const bulwark=finalFormEvadeFinisher('oath-guardian',base);
  assert.equal(execution.family,'execution');
  assert.ok(execution.damageMultiplier>control.damageMultiplier);
  assert.equal(chain.family,'chain');
  assert.ok(chain.chainTargets>=4);
  assert.equal(control.family,'control');
  assert.ok(control.slowFactor<.7&&control.slowDuration>1);
  assert.equal(bulwark.family,'bulwark');
  assert.ok(bulwark.coreHealPercent>0&&bulwark.pushDistance>execution.pushDistance);
});

import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('game upgrades the existing x5 finisher seam with final form identity',()=>{
  assert.ok(gameSource.includes("finalFormEvadeFinisher"));
  assert.ok(gameSource.includes("finisher.chainTargets"));
  assert.ok(gameSource.includes("finisher.coreHealPercent"));
  assert.ok(gameSource.includes("finisher.accent"));
});

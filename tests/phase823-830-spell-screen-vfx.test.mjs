import test from 'node:test';
import assert from 'node:assert/strict';
import { spellVfxDescriptor } from '../dist/game/spell-vfx.js';

const spells=['fireBolt','chainLightning','frostNova','flameField','meteorStorm','blackHole'];

test('phase 823-826 six spell slots have six distinct screen silhouettes',()=>{
  const descriptors=spells.map((spell)=>spellVfxDescriptor('arkan',spell,10));
  assert.equal(new Set(descriptors.map((d)=>d.shape)).size,6);
});

test('phase 827-828 level evolution increases bounded wave and ray structure',()=>{
  for(const spell of spells){
    const one=spellVfxDescriptor('seria',spell,1);
    const five=spellVfxDescriptor('seria',spell,5);
    const ten=spellVfxDescriptor('seria',spell,10);
    assert.ok(five.waveCount>=one.waveCount);
    assert.ok(ten.waveCount>=five.waveCount);
    assert.ok(five.rayCount>=one.rayCount);
    assert.ok(ten.rayCount>=five.rayCount);
    assert.ok(ten.waveCount<=4);
    assert.ok(ten.rayCount<=16);
  }
});

test('phase 829-830 ultimate screen pulse is stronger while flash remains accessibility-bounded',()=>{
  const normal=spellVfxDescriptor('kain','chainLightning',10);
  const meteor=spellVfxDescriptor('kain','meteorStorm',10);
  const blackHole=spellVfxDescriptor('kain','blackHole',10);
  assert.ok(meteor.screenPulse>normal.screenPulse);
  assert.ok(blackHole.screenPulse>normal.screenPulse);
  assert.ok(meteor.flashAlpha<=0.44);
  assert.ok(blackHole.flashAlpha<=0.44);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as readability from '../dist/game/freeze-status-readability.js';

function cue(source,reducedFlash=false){
  assert.equal(typeof readability.slowSourceCuePresentation,'function','semantic slow cue presentation must exist');
  return readability.slowSourceCuePresentation({source,enemyClass:'regular',slowFactor:.55,slowTimer:1,reducedFlash});
}

test('Phase 4431-4436 frost alone owns the freeze atlas semantic',()=>{
  const frost=cue('frost');
  const gravity=cue('gravity');
  const terrain=cue('terrain');
  assert.equal(frost.renderMode,'freezeAtlas');
  assert.equal(frost.useFreezeAtlas,true);
  assert.equal(gravity.useFreezeAtlas,false);
  assert.equal(terrain.useFreezeAtlas,false);
});

test('Phase 4431-4436 gravity terrain impact and generic slows have distinct Canvas grammars',()=>{
  const gravity=cue('gravity');
  const terrain=cue('terrain');
  const impact=cue('impact');
  const generic=cue('generic');
  assert.equal(gravity.renderMode,'gravityOrbit');
  assert.equal(terrain.renderMode,'terrainGround');
  assert.equal(impact.renderMode,'impactResistance');
  assert.equal(generic.renderMode,'genericResistance');
  assert.ok(gravity.segmentCount>=3);
  assert.ok(terrain.groundOffsetRatio>0);
  assert.ok(impact.alpha<gravity.alpha);
  assert.ok(generic.alpha<=impact.alpha);
});

test('Phase 4431-4436 Reduced Flash lowers semantic cue intensity without changing source identity',()=>{
  for(const source of ['frost','gravity','terrain','impact','generic']){
    const normal=cue(source,false), reduced=cue(source,true);
    assert.equal(reduced.renderMode,normal.renderMode);
    assert.ok(reduced.alpha<normal.alpha);
    assert.ok(reduced.alpha>0);
  }
});

test('Phase 4431-4436 live renderer reserves freeze atlas drawImage for frost and draws non-frost cues on Canvas',()=>{
  const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(game,/slowSourceCuePresentation/);
  assert.match(game,/source===['"]frost['"]/);
  assert.match(game,/renderMode===['"]gravityOrbit['"]/);
  assert.match(game,/renderMode===['"]terrainGround['"]/);
  assert.match(game,/renderMode===['"]impactResistance['"]/);
  assert.match(game,/renderMode===['"]genericResistance['"]/);
});

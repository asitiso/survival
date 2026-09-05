import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const enemies=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8');
const terrain=fs.readFileSync(new URL('../src/game/terrain.ts',import.meta.url),'utf8');
const spells=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8');
const presentation=fs.readFileSync(new URL('../src/game/presentation-runtime.ts',import.meta.url),'utf8');

const base={
  combatPrimary:'normal',reducedFlash:false,secondaryOwner:'none',
  hasBlackHole:true,hasTerrainCrystal:true,hasGoldenEnemy:true,hasBomber:true,finalFormFlowActive:true,
};

test('phase 1895 residual motion has a single owner behind primary and secondary attention',async()=>{
  const mod=await import('../dist/game/combat-cue-priority.js');
  assert.equal(typeof mod.residualCombatMotionPolicy,'function');
  const p=mod.residualCombatMotionPolicy(base);
  assert.equal(p.owner,'black-hole-vortex');
  assert.deepEqual([
    p.blackHoleMotionAmplitude,p.terrainCrystalMotionAmplitude,p.goldenEnemyMotionAmplitude,
    p.bomberBodyMotionAmplitude,p.finalFormFlowMotionAmplitude,
  ].filter((v)=>v>0).length,1);
});

test('phase 1895 higher attention, secondary motion, and reduced flash suppress residual motion',async()=>{
  const {residualCombatMotionPolicy}=await import('../dist/game/combat-cue-priority.js');
  for(const input of [
    {...base,combatPrimary:'hero-critical'},
    {...base,combatPrimary:'boss-response'},
    {...base,combatPrimary:'boss-countdown'},
    {...base,reducedFlash:true},
    {...base,secondaryOwner:'field-node'},
  ]){
    const p=residualCombatMotionPolicy(input);
    assert.equal(p.owner,'none');
    assert.deepEqual([
      p.blackHoleMotionAmplitude,p.terrainCrystalMotionAmplitude,p.goldenEnemyMotionAmplitude,
      p.bomberBodyMotionAmplitude,p.finalFormFlowMotionAmplitude,
    ],[0,0,0,0,0]);
  }
});

test('phase 1896 golden and bomber body rings consume residual policy instead of independent pulse',()=>{
  assert.match(game,/this\.enemies\.renderEnemies\([\s\S]*?residualMotion/);
  assert.match(enemies,/goldenEnemyMotionAmplitude/);
  assert.match(enemies,/bomberBodyMotionAmplitude/);
});

test('phase 1897 terrain crystal pulse consumes residual policy and avoids performance.now animation',()=>{
  assert.match(game,/this\.terrain\.render\(ctx,\s*residualMotion\)/);
  assert.match(terrain,/terrainCrystalMotionAmplitude/);
  assert.doesNotMatch(terrain,/performance\.now\(\)\s*\/\s*300/);
});

test('phase 1898 final form flow aura consumes residual motion ownership',()=>{
  assert.match(game,/drawHero\(ctx,\s*residualMotion\)/);
  assert.match(game,/finalFormFlowMotionAmplitude/);
});

test('phase 1899 black hole vortex consumes residual policy while keeping static identity when steady',()=>{
  assert.match(game,/this\.spells\.render\(ctx,\s*residualMotion\)/);
  assert.match(spells,/blackHoleMotionAmplitude/);
  assert.match(spells,/orbitMotionScale/);
});

test('phase 1900 reduced flash removes screen-effect radial expansion but preserves effect rendering',async()=>{
  const mod=await import('../dist/game/presentation-runtime.js');
  assert.equal(typeof mod.screenEffectScale,'function');
  assert.equal(mod.screenEffectScale('shockwave',0.75,true),1);
  assert.equal(mod.screenEffectScale('pulse',0.75,true),1);
  assert.equal(mod.screenEffectScale('glow',0.75,true),1);
  assert.notEqual(mod.screenEffectScale('shockwave',0.75,false),1);
  assert.match(presentation,/screenEffectScale/);
});

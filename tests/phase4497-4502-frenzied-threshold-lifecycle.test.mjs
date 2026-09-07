import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const identity = await import('../dist/game/elite-affix-identity-assets.js');
const { EnemyManager, enemyStats } = await import('../dist/game/enemies.js');

function elite(overrides={}) {
  const s=enemyStats('elite',1);
  return {...s,id:9001,type:'elite',pos:{x:520,y:420},maxHp:100,hp:50,target:'hero',attackTimer:99,slowFactor:1,slowTimer:0,alive:true,hitFlash:0,damageTakenMultiplier:1,regenPerSecondRatio:0,lowHpDamageMultiplier:1.55,commandAuraMultiplier:1,manaShield:0,maxManaShield:0,eliteAffixes:['frenzied'],...overrides};
}
function ctx(){return {hero:{pos:{x:1200,y:420},radius:18},core:{pos:{x:1400,y:420},radius:28},elapsed:10,onHeroDamage:()=>{},onCoreDamage:()=>{},enemySpeedMultiplier:1};}

test('phase 4497 exposes deterministic frenzied threshold lifecycle with release and re-entry',()=>{
  assert.equal(typeof identity.advanceFrenziedThresholdLifecycle,'function');
  let state=identity.advanceFrenziedThresholdLifecycle(undefined,0.60,0.016);
  assert.equal(state.phase,'inactive');
  state=identity.advanceFrenziedThresholdLifecycle(state,0.42,0.016);
  assert.equal(state.phase,'entered');
  assert.equal(state.active,true);
  state=identity.advanceFrenziedThresholdLifecycle(state,0.30,0.12);
  assert.equal(state.phase,'active');
  state=identity.advanceFrenziedThresholdLifecycle(state,0.55,0.016);
  assert.equal(state.phase,'released');
  assert.equal(state.active,false);
  state=identity.advanceFrenziedThresholdLifecycle(state,0.38,0.016);
  assert.equal(state.phase,'entered');
  assert.equal(state.active,true);
});

test('phase 4498 frenzied lifecycle presentation respects reduced motion and reduced flash',()=>{
  assert.equal(typeof identity.frenziedThresholdPresentation,'function');
  const state=identity.advanceFrenziedThresholdLifecycle(undefined,0.30,0.016);
  const full=identity.frenziedThresholdPresentation(state,false,false);
  const reducedMotion=identity.frenziedThresholdPresentation(state,true,false);
  const reducedFlash=identity.frenziedThresholdPresentation(state,false,true);
  assert.ok(full.alpha>0.2);
  assert.ok(full.pulse>0);
  assert.equal(reducedMotion.pulse,0);
  assert.ok(reducedFlash.alpha<full.alpha);
});

test('phase 4499 enemy damage records frenzied entry while healing above threshold releases it',()=>{
  const manager=new EnemyManager();
  const enemy=elite();
  manager.enemies=[enemy];
  manager.damage(enemy,9);
  assert.equal(enemy.frenziedPresentation?.phase,'entered');
  enemy.hp=60;
  manager.update(0.016,ctx());
  assert.equal(enemy.frenziedPresentation?.phase,'released');
});

test('phase 4500 preserves frenzied gameplay threshold and 1.55 multiplier contract',async()=>{
  const source=await readFile(new URL('../src/game/enemies.ts',import.meta.url),'utf8');
  const affixes=await readFile(new URL('../src/game/elite-affixes.ts',import.meta.url),'utf8');
  assert.match(source,/enemy\.hp \/ Math\.max\(1, enemy\.maxHp\) <= 0\.42 \? \(enemy\.lowHpDamageMultiplier \?\? 1\) : 1/);
  assert.match(affixes,/frenzied'\) out\.lowHpDamageMultiplier \*= 1\.55/);
});

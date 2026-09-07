import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EnemyManager } from '../dist/game/enemies.js';

const spells=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8');
const terrain=fs.readFileSync(new URL('../src/game/terrain.ts',import.meta.url),'utf8');
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('Phase 4425-4430 stronger slow owns presentation provenance while weaker duration refresh does not steal it',()=>{
  const manager=new EnemyManager();
  const id=manager.spawnEventEnemy('grunt',1,'hero',{x:300,y:300});
  const enemy=manager.enemies.find(entry=>entry.id===id);
  assert.ok(enemy);
  manager.applySlow(enemy,.62,1.0,'frost');
  assert.equal(enemy.slowSource,'frost');
  assert.equal(enemy.slowFactor,.62);
  manager.applySlow(enemy,.8,2.0,'terrain');
  assert.equal(enemy.slowSource,'frost','weaker slow may extend the existing timer but must not relabel the stronger active effect');
  assert.equal(enemy.slowFactor,.62);
  assert.equal(enemy.slowTimer,2.0);
  manager.applySlow(enemy,.4,.5,'gravity');
  assert.equal(enemy.slowSource,'gravity');
  assert.equal(enemy.slowFactor,.4);
});

test('Phase 4425-4430 slow provenance clears when the existing slow state resets without changing death wasSlowed semantics',()=>{
  const manager=new EnemyManager();
  const id=manager.spawnEventEnemy('grunt',1,'hero',{x:300,y:300});
  const enemy=manager.enemies.find(entry=>entry.id===id);
  assert.ok(enemy);
  manager.applySlow(enemy,.55,.05,'impact');
  manager.update(.06,{hero:{pos:{x:1400,y:800},radius:23},core:{pos:{x:800,y:450},radius:48},elapsed:1,onHeroDamage(){},onCoreDamage(){}});
  manager.update(.01,{hero:{pos:{x:1400,y:800},radius:23},core:{pos:{x:800,y:450},radius:48},elapsed:1.1,onHeroDamage(){},onCoreDamage(){}});
  assert.equal(enemy.slowFactor,1);
  assert.equal(enemy.slowSource,undefined);

  manager.applySlow(enemy,.6,1,'terrain');
  manager.damage(enemy,enemy.hp+1);
  const [death]=manager.drainDeaths();
  assert.equal(death.wasSlowed,true);
  assert.equal(death.slowSource,'terrain');
});

test('Phase 4425-4430 primary slow producers label presentation provenance explicitly',()=>{
  assert.match(spells,/applySlow\(enemy,\s*hole\.slowFactor,\s*hole\.slowDuration,\s*'gravity'\)/);
  assert.match(spells,/applySlow\(enemy,\s*meteor\.slowFactor,\s*meteor\.slowDuration,\s*'impact'\)/);
  assert.match(spells,/applySlow\(enemy,\s*Math\.max\(0\.20,\s*\(seria \? 0\.42 : 0\.53\)[\s\S]*?,\s*'frost'\)/);
  assert.match(terrain,/applySlow\(enemy,\s*pool\.slowFactor,\s*0\.18,\s*'terrain'\)/);
  assert.match(game,/applySlow\(enemy,\s*0\.38,\s*1\.4,\s*'frost'\)/);
});

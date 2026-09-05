import test from 'node:test';
import assert from 'node:assert/strict';
import { SpellSystem } from '../dist/game/spells.js';
import { createHero } from '../dist/game/entities.js';

const target=(id,type,x,y)=>({id,type,pos:{x,y},target:'hero',hp:100,maxHp:100,alive:true,radius:18});

test('phase 1207 a manual cast can carry the remembered target id into SpellSystem',()=>{
  const spells=new SpellSystem();
  const hero=createHero('arkan');
  hero.pos={x:0,y:0};
  hero.facing={x:1,y:0};
  const remembered=target(1,'grunt',200,0);
  const elite=target(2,'elite',0,200);
  const enemies={enemies:[remembered,elite]};
  assert.equal(spells.tryCast('spell1',{hero,enemies,autoAim:false,preferredManualTargetId:1}),true);
  const projectile=spells.projectiles[0];
  assert.ok(projectile.vel.x>600,'remembered target should keep the projectile aimed to the right');
  assert.ok(Math.abs(projectile.vel.y)<10,'manual remembered target should override the otherwise higher-priority elite');
});

import test from 'node:test';import assert from 'node:assert/strict';
import {purchaseOffer} from '../dist/domain/economy.js';
const empty={coins:100000,weapon:null,armor:null,accessory:null,healingPotions:1,inventory:[],discoveredRecipes:[]};
const charm={id:'sage-amulet',kind:'accessory',name:'현자의 부적',power:.08,price:180};
test('accessory duplicates enter storage and survive another slot purchase',()=>{
 const first=purchaseOffer(empty,charm).state;
 const second=purchaseOffer(first,charm).state;
 assert.equal(second.accessory.rank,1); assert.equal(second.inventory[0].id,'sage-amulet');
 const third=purchaseOffer(second,{id:'iron-robe',kind:'armor',name:'철갑 로브',power:.10,price:200}).state;
 assert.deepEqual(third.accessory,second.accessory);assert.equal(third.armor.rank,1);
});
import {equipmentCatalog,generateShopOffers,ensureEquippedOffers,priceShopOffers,equipmentBonuses} from '../dist/game/shop-data.js';
import {equipmentSetStates,EQUIPMENT_SETS} from '../dist/game/equipment-sets.js';
import {equipmentUnlockSeconds,equipmentEnemyPressure} from '../dist/domain/equipment-progression.js';
import {safeQuickPurchase,shopGuidanceForOffers} from '../dist/game/shop-guidance.js';
import {projectShopPurchase} from '../dist/game/shop-purchase-projection.js';
import {enemyStats,EnemyManager} from '../dist/game/enemies.js';
const item=(id,rank)=>({...equipmentCatalog().find(o=>o.id===id),rank,legendary:rank>=5});
const setState=(set,rank)=>({...empty,weapon:item(set.items[0],rank),armor:item(set.items[1],rank),accessory:item(set.items[2],rank)});
test('two and three piece sets unlock at high and rare quality and multiply once',()=>{
 for(const set of EQUIPMENT_SETS){
  const normal=equipmentSetStates(setState(set,1)).find(s=>s.id===set.id);assert.equal(normal.twoActive,false);assert.equal(normal.threeActive,false);
  const high=equipmentSetStates(setState(set,2)).find(s=>s.id===set.id);assert.equal(high.twoActive,true);assert.equal(high.threeActive,false);
  const rare=equipmentSetStates(setState(set,3)).find(s=>s.id===set.id);assert.equal(rare.threeActive,true);
  const worn=setState(set,3),full=equipmentBonuses(worn);
  const separate=[worn.weapon,worn.armor,worn.accessory].map(i=>equipmentBonuses({...empty,[i.kind]:i}));
  for(const stat of Object.keys(full)){
   const expected=separate.reduce((n,b)=>n*b[stat],1)*(set.two[stat]??1)*(set.three[stat]??1);
   assert.ok(Math.abs(full[stat]-expected)<1e-9,`${set.id}/${stat}`);
  }
 }
});
test('shop guarantees each equipped slot upgrade with one potion and set-compatible empty accessory',()=>{
 for(const set of EQUIPMENT_SETS){
  const worn=setState(set,3);const offers=ensureEquippedOffers(generateShopOffers(()=>.8),worn);
  assert.equal(offers.length,6);for(const i of [worn.weapon,worn.armor,worn.accessory])assert.ok(offers.some(o=>o.id===i.id));
  const partial={...worn,accessory:null};assert.ok(ensureEquippedOffers(generateShopOffers(()=>.8),partial).some(o=>o.id===set.items[2]));
 }
});
test('shop equipment purchases have no time gate',()=>{
 for(let rank=2;rank<=9;rank++){
  const state={...empty,coins:1e9,accessory:item('sage-amulet',rank-1)};
  const offer=priceShopOffers([charm],state,equipmentUnlockSeconds(rank)-1)[0];
  assert.equal(purchaseOffer(state,offer,0).ok,true);
 }
});
test('accessory replacement previews set loss and quick buy protects developed gear',()=>{
 const state=setState(EQUIPMENT_SETS[0],3),replacement=equipmentCatalog().find(o=>o.id==='storm-ring');
 assert.match(projectShopPurchase(state,replacement).summary,/보관함 저장/);
 assert.equal(safeQuickPurchase(replacement,[replacement],state),false);
 const result=purchaseOffer(state,replacement);assert.equal(result.ok,true);assert.equal(result.state.weapon.id,state.weapon.id);assert.equal(equipmentSetStates(result.state)[0].threeActive,true);
});
test('difficulty has no milestone damage cliffs, stops scaling after thirty minutes and rewards actual gear',()=>{
 for(let s=1;s<=2000;s++){
  const a=equipmentEnemyPressure(s-1),b=equipmentEnemyPressure(s);
  assert.ok(b.damage>=a.damage&&b.damage-a.damage<.005);assert.ok(b.health>=a.health&&b.health-a.health<.005);
 }
 assert.deepEqual(equipmentEnemyPressure(3600),equipmentEnemyPressure(1800));
 assert.ok(enemyStats('grunt',1,0).damage<enemyStats('grunt',1).damage);
 const late=enemyStats('grunt',10,720);assert.ok(late.damage>enemyStats('grunt',10).damage*1.8);
 const geared=equipmentBonuses(setState(EQUIPMENT_SETS[0],5));assert.ok(geared.damageTakenMultiplier<.4);assert.ok(geared.spellPowerMultiplier>2.5);
});

test('players can deliberately switch accessories without rerolls or losing the other slots',()=>{
 const state=setState(EQUIPMENT_SETS[0],3);
 const offers=ensureEquippedOffers(generateShopOffers(()=>.4),state,'storm-ring');
 assert.equal(offers.filter(o=>o.kind==='accessory').length,1);assert.ok(offers.some(o=>o.id==='storm-ring'));
 assert.ok(offers.some(o=>o.id===state.weapon.id));assert.ok(offers.some(o=>o.id===state.armor.id));
});
test('quick buy cannot silently break an active two-piece set even at rank two',()=>{
 const state={...setState(EQUIPMENT_SETS[0],2),accessory:null};const replacement=equipmentCatalog().find(o=>o.id==='rapid-wand');
 assert.equal(safeQuickPurchase(replacement,[replacement],state),false);
 assert.match(projectShopPurchase(state,replacement).summary,/보관함 저장/);
});
test('quick buy rejects a distinct purchase when inventory is full',()=>{
 const state={...empty,weapon:item('arcane-staff',1),inventory:Array.from({length:6},(_,i)=>({...item(`item-${i}`,1),count:1}))};
 const offer={...equipmentCatalog().find(o=>o.id==='rapid-wand')};
 assert.equal(safeQuickPurchase(offer,[offer],state),false);
});
test('purchase projection reports storage when an existing stack increments',()=>{
 const state={...empty,weapon:item('arcane-staff',1),inventory:[{...item('arcane-staff',1),count:2}]};
 const offer={...equipmentCatalog().find(o=>o.id==='arcane-staff')};
 assert.match(projectShopPurchase(state,offer).summary,/보관함 저장/);
});
test('purchase projection reports full inventory for a distinct equipment purchase',()=>{
 const state={...empty,weapon:item('arcane-staff',1),inventory:Array.from({length:6},(_,i)=>({...item(`item-${i}`,1),count:1}))};
 const offer={...equipmentCatalog().find(o=>o.id==='rapid-wand')};
 const projection=projectShopPurchase(state,offer);
 assert.match(projection.summary,/보관함이 가득 찼습니다/);
});

test('regular, event, boss and summoned enemies share the live elapsed-time pressure',()=>{
 const manager=new EnemyManager();
 manager.update(0,{hero:{pos:{x:400,y:400},radius:23},core:{pos:{x:800,y:450},radius:48},elapsed:720,onHeroDamage(){},onCoreDamage(){}});
 for(const e of manager.enemies.filter(e=>e.type!=='elite'&&e.type!=='boss'))assert.equal(e.damage,enemyStats(e.type,10,720).damage);
 const id=manager.spawnEventEnemy('grunt',10,'hero',{x:0,y:0});assert.equal(manager.enemies.find(e=>e.id===id).damage,enemyStats('grunt',10,720).damage);
 const bossId=manager.spawnEventEnemy('boss',10,'hero',{x:0,y:0}),boss=manager.enemies.find(e=>e.id===bossId);assert.equal(boss.damage,enemyStats('boss',10,720).damage);
 const before=manager.enemies.length;manager.summonBossAdds(boss,3,10,320,'inferno');
 assert.equal(manager.enemies.length,before+3);for(const e of manager.enemies.slice(before))assert.equal(e.damage,enemyStats(e.type,9,720).damage);
 manager.reset();const fresh=manager.spawnEventEnemy('grunt',1);assert.equal(manager.enemies.find(e=>e.id===fresh).damage,enemyStats('grunt',1,0).damage);
});

test('accessory recommendations describe equipment benefits rather than potion stock',()=>{
 const offer=equipmentCatalog().find(o=>o.id==='sage-amulet');const guidance=shopGuidanceForOffers([offer],{heroId:'arkan',archetype:'burst',state:empty})[0];
 assert.equal(guidance.best,true);assert.match(guidance.reason,/현자의 서약/);assert.doesNotMatch(guidance.reason,/물약|회복 보충/);
});

test('ordinary shop offers stay limited to the twelve base equipment items and potion',()=>{
 const crafted=new Set(['arcane-accelerator','alchemical-blast-staff','wind-iron-armor','gravity-guardian-armor','thunder-wisdom-seal','golden-bastion-talisman','celestial-fusion-staff','world-tree-armor','fate-core']);
 const offers=Array.from({length:20},(_,seed)=>generateShopOffers(()=>seed/20)).flat();
 assert.equal(offers.some(offer=>crafted.has(offer.id)),false);
 assert.equal(new Set(offers.filter(offer=>offer.kind!=='potion').map(offer=>offer.id)).size,12);
});

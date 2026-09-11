import test from 'node:test';
import assert from 'node:assert/strict';
import { generateShopOffers, equipmentBonuses } from '../dist/game/shop-data.js';
const empty={coins:0,weapon:null,armor:null,healingPotions:0};
const specs=[['arcane-staff','weapon',.20,'spellPowerMultiplier'],['rapid-wand','weapon',.09,'cooldownMultiplier'],['blast-rod','weapon',.12,'areaMultiplier'],['golden-wand','weapon',.18,'goldMultiplier'],['iron-robe','armor',.10,'damageTakenMultiplier'],['gale-cloak','armor',.10,'moveSpeedMultiplier'],['magnet-cloak','armor',.22,'pickupMultiplier'],['guardian-plate','armor',.09,'coreDamageTakenMultiplier']];
const offers=new Map(Array.from({length:20},(_,i)=>generateShopOffers(()=>i/20)).flat().map(o=>[o.id,o]));
test('all eight shop equipment items offer stronger base effects',()=>{
 for(const [id,kind,power] of specs){assert.equal(offers.get(id).power,power,id);assert.match(offers.get(id).description,new RegExp(`${Math.round(power*100)}%`));}
});
test('legendary +1 gives a noticeable improvement for every equipment family',()=>{
 for(const [id,kind,power,stat] of specs){
  const item={id,kind,power,rank:5,legendary:true,name:id};
  const before=equipmentBonuses({...empty,[kind]:item})[stat];
  const after=equipmentBonuses({...empty,[kind]:{...item,rank:6}})[stat];
  const lower=stat.includes('Taken')||stat==='cooldownMultiplier';
  assert.ok(lower ? (before-after)/before>=.03 : after-before>=.079,id);
 }
});
test('high-rank defense and cooldown retain bounded nonzero multipliers',()=>{
 for(const [id,kind,power,stat] of specs.filter(x=>x[3].includes('Taken')||x[3]==='cooldownMultiplier')){
  const value=equipmentBonuses({...empty,[kind]:{id,kind,power,rank:10000,legendary:true,name:id}})[stat];
  assert.ok(value>=.2&&value<.4,id);
 }
});


test('resumed equipment receives new catalog power without losing upgrades',async()=>{
 const { refreshEquipmentPowers }=await import('../dist/game/shop-data.js');
 const old={...empty,weapon:{id:'arcane-staff',kind:'weapon',name:'대마도사의 심장',rank:8,power:.15,legendary:true}};
 const updated=refreshEquipmentPowers(old);
 assert.equal(updated.weapon.power,.20);assert.equal(updated.weapon.rank,8);assert.equal(updated.weapon.legendary,true);assert.equal(old.weapon.power,.15);
});

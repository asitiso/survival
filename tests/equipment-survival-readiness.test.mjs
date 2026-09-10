import test from 'node:test';
import assert from 'node:assert/strict';
import { equipmentReadiness, equipmentSurvivalDelta, projectEquipmentSurvival } from '../dist/game/equipment-survival-readiness.js';
import { equipmentCatalog, equipmentBonuses } from '../dist/game/shop-data.js';
import { enemyStats } from '../dist/game/enemies.js';
import { directorSnapshot } from '../dist/domain/director.js';
import { projectShopPurchase } from '../dist/game/shop-purchase-projection.js';
const empty={coins:10000,weapon:null,armor:null,accessory:null,inventory:[],discoveredRecipes:[],healingPotions:0};
const item=(id,rank)=>({...equipmentCatalog().find(x=>x.id===id),rank,legendary:rank>=5});
const rare={...empty,weapon:item('arcane-staff',3),armor:item('iron-robe',3),accessory:item('sage-amulet',3)};
const context=(state=empty,elapsedSeconds=480,heroMaxHp=333)=>({state,elapsedSeconds,heroMaxHp});
test('unarmed eight-minute hero is over 20% behind survival and firepower recommendations',()=>{
 const out=equipmentReadiness(context());
 assert.equal(out.label,'준비 부족');
 assert.ok(out.heroSurvivalHits<out.recommended.heroSurvivalHits*.8);
 assert.ok(out.firepowerIndex<out.recommended.firepowerIndex*.8);
});
test('rare defensive build at eight minutes is survivable using actual contact damage',()=>{
 const out=equipmentReadiness(context(rare));
 assert.equal(out.label,'생존 가능');
 const b=equipmentBonuses(rare),damage=enemyStats('grunt',directorSnapshot(480).danger,480).damage;
 assert.equal(out.heroSurvivalHits,333/(damage*b.damageTakenMultiplier));
 assert.equal(out.coreDamageMultiplier,b.coreDamageTakenMultiplier);
 assert.equal(out.firepowerIndex,b.spellPowerMultiplier/b.cooldownMultiplier*b.areaMultiplier);
 assert.equal(out.spellPowerMultiplier,b.spellPowerMultiplier);
 assert.equal(out.cooldownMultiplier,b.cooldownMultiplier);
 assert.equal(out.areaMultiplier,b.areaMultiplier);
});
test('readiness interpolates anchors and requires both metrics plus core for stable status',()=>{
 const a=equipmentReadiness(context(rare,300)),b=equipmentReadiness(context(rare,480));
 const mid=equipmentReadiness(context(rare,390));
 assert.equal(mid.recommended.heroSurvivalHits,(a.recommended.heroSurvivalHits+b.recommended.heroSurvivalHits)/2);
 const strong={...empty,weapon:item('arcane-staff',5),armor:item('iron-robe',5),accessory:item('sage-amulet',5)};
 assert.equal(equipmentReadiness(context(strong)).label,'안정');
 assert.equal(equipmentReadiness(context({...rare,armor:null},480,10000)).label,'생존 가능');
});
test('projection reports hero hits core and firepower independently without mutating either state',()=>{
 const before=JSON.stringify(empty),after=JSON.stringify(rare);
 const out=projectEquipmentSurvival(context(),rare);
 assert.match(out.summary,/생존 .*타/);assert.match(out.summary,/수호핵/);assert.match(out.summary,/화력/);
 assert.equal(out.summary,equipmentSurvivalDelta(out.before,out.after));
 assert.ok(out.after.heroSurvivalHits>out.before.heroSurvivalHits);
 assert.equal(JSON.stringify(empty),before);assert.equal(JSON.stringify(rare),after);
});
test('purchase projection shows actual equipped gain and no gain for stored purchases',()=>{
 const offer=equipmentCatalog().find(x=>x.id==='iron-robe');
 const out=projectShopPurchase(empty,offer,{elapsedSeconds:480,heroMaxHp:333});
 assert.match(out.summary,/생존 .*타.*수호핵.*화력/);
 const stored=projectShopPurchase(rare,offer,{elapsedSeconds:480,heroMaxHp:333});
 assert.match(stored.summary,/보관함/);assert.match(stored.summary,/현재 장착 효과 유지/);
 assert.equal(stored.deltas.length,0);
});
test('both cumulative gold routes reach explicit defensive milestones through real transactions',async()=>{
 const {equipmentBalanceRows}=await import('../scripts/equipment-balance-report.mjs');
 const rows=equipmentBalanceRows();assert.equal(rows.length,10);
 const expectedLabels=new Map([[300,'생존 가능'],[480,'생존 가능'],[720,'생존 가능'],[900,'생존 가능'],[1200,'생존 가능']]);
 for(const seconds of [300,480,720,900,1200]){
  const low=rows.find(r=>r.elapsedSeconds===seconds&&r.recovery===.25);
  const high=rows.find(r=>r.elapsedSeconds===seconds&&r.recovery===.45);
  assert.equal(low.passed,true,JSON.stringify(low));
  assert.equal(low.readiness.label,expectedLabels.get(seconds));
  assert.equal(high.readiness.label,seconds===1200?'안정':expectedLabels.get(seconds));
  assert.ok(low.spend<=low.earnedGold+low.resaleGold);assert.ok(high.spend<=high.earnedGold+high.resaleGold);
  assert.match(low.milestone,/희귀|조합|히든/);
  assert.match(high.routeAddition,/금화|영웅|조합|히든|추가 강화/);
  assert.ok(high.optionalSpend>0);assert.ok(high.inventoryUsage<=6);assert.equal(high.passed,true,JSON.stringify(high));
 }
});

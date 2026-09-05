import test from 'node:test';
import assert from 'node:assert/strict';
import { activeSynergies,synergyModifiers } from '../dist/game/synergies.js';
import { LegendaryEffectController } from '../dist/game/legendary-effects.js';
const close=(a,b)=>Math.abs(a-b)<1e-9;
const item=(id,kind)=>({id,kind,name:id,rank:5,power:.1,legendary:true});
const equip=(weapon=null,armor=null)=>({coins:0,weapon,armor,healingPotions:1});
test('phase 2102-2108 synergy and legendary gameplay contracts remain unchanged',()=>{
  const forbiddenBuild={heroId:'arkan',traitId:null,relicId:'abyss-eye',equipment:equip(item('arcane-staff','weapon'),null)};
  assert.deepEqual(activeSynergies(forbiddenBuild).map(v=>v.id),['forbidden-arcana']);const sm=synergyModifiers(forbiddenBuild);assert.ok(close(sm.spellPowerMultiplier,1.16));assert.ok(close(sm.heroDamageTakenMultiplier,1.05));
  const arc=new LegendaryEffectController(),arcEq=equip(item('arcane-staff','weapon'),null);for(let i=0;i<20;i++)arc.onKill('normal',arcEq);assert.ok(close(arc.modifiers.spellPowerMultiplier,1.3));arc.update(4,arcEq,{heroHpRatio:1,coreHpRatio:1,moving:false});assert.ok(close(arc.modifiers.spellPowerMultiplier,1));
  const rapid=new LegendaryEffectController(),rapidEq=equip(item('rapid-wand','weapon'),null);for(let i=0;i<35;i++)rapid.onKill('normal',rapidEq);assert.ok(close(rapid.modifiers.cooldownMultiplier,.78));
  const blast=new LegendaryEffectController(),blastEq=equip(item('blast-rod','weapon'),null);let nova=[];for(let i=0;i<19;i++)nova=blast.onKill('normal',blastEq);assert.deepEqual(nova,[{type:'nova',radius:170}]);
  const gold=new LegendaryEffectController(),goldEq=equip(item('golden-wand','weapon'),null);assert.deepEqual(gold.onKill('elite',goldEq),[{type:'bonusGold',amount:90}]);assert.deepEqual(gold.onKill('boss',goldEq),[{type:'bonusGold',amount:280}]);
  const iron=new LegendaryEffectController(),ironEq=equip(null,item('iron-robe','armor'));iron.update(.1,ironEq,{heroHpRatio:.35,coreHpRatio:1,moving:false});assert.ok(close(iron.modifiers.heroDamageTakenMultiplier,.65));
  const gale=new LegendaryEffectController(),galeEq=equip(null,item('gale-cloak','armor'));gale.update(3,galeEq,{heroHpRatio:1,coreHpRatio:1,moving:true});assert.ok(close(gale.modifiers.moveSpeedMultiplier,1.18));assert.ok(close(gale.modifiers.cooldownMultiplier,.88));
  const magnet=new LegendaryEffectController(),magnetEq=equip(null,item('magnet-cloak','armor'));assert.deepEqual(magnet.update(22,magnetEq,{heroHpRatio:1,coreHpRatio:1,moving:false}),[{type:'magnet',duration:3}]);
  const wall=new LegendaryEffectController(),wallEq=equip(null,item('guardian-plate','armor'));assert.deepEqual(wall.update(.1,wallEq,{heroHpRatio:1,coreHpRatio:.49,moving:false}),[{type:'coreHeal',fraction:.1}]);assert.ok(close(wall.modifiers.coreDamageTakenMultiplier,.75));
});

import type { HeroId } from './hero-profiles.js';
import { relicDefinition, relicModifiers, type RelicId, type RelicModifiers } from './relics.js';
import type { FusionId } from './spell-fusions.js';
import { projectFusionSelection, fusionProjectionHint } from './fusion-selection-projection.js';
import { projectSpellEvolutionSelection, spellEvolutionProjectionHint } from './spell-evolution-selection-projection.js';
import type { SpellId } from './spells.js';
import type { BossRewardChoice } from './upgrades.js';
import type { BossRewardImpactRoleId } from './boss-reward-impact-role-identity-assets.js';
import { bossRewardImpactRoleIdentityIcon } from './boss-reward-impact-role-identity-assets.js';

export interface BossRewardImpactContext{heroId:HeroId;activeRelic:RelicId|null;activeFusions:readonly FusionId[];spellLevels:Readonly<Record<SpellId,number>>;}
export interface BossRewardImpactProjection{roleId:BossRewardImpactRoleId;roleLabel:string;summary:string;}
const fmt=(value:number)=>{const rounded=Math.round(value*10)/10;return Number.isInteger(rounded)?String(Math.trunc(rounded)):rounded.toFixed(1);};
const signed=(value:number,suffix='%')=>`${value>=0?'+':'-'}${fmt(Math.abs(value))}${suffix}`;
const ratioDelta=(before:number,after:number)=>(after/Math.max(.0001,before)-1)*100;
const reductionDelta=(before:number,after:number)=>(1-after/Math.max(.0001,before))*100;

type Delta={label:string;text:string;salience:number};
function relicDeltas(before:RelicModifiers,after:RelicModifiers):Delta[]{
  const deltas:Delta[]=[];
  const addRatio=(label:string,a:number,b:number,reduction=false)=>{const value=reduction?reductionDelta(a,b):ratioDelta(a,b);if(Math.abs(value)>.05)deltas.push({label,text:`${label} ${reduction?signed(-value):signed(value)}`,salience:Math.abs(value)});};
  addRatio('마법 피해',before.spellPowerMultiplier,after.spellPowerMultiplier);
  addRatio('범위',before.areaMultiplier,after.areaMultiplier);
  addRatio('쿨타임',before.cooldownMultiplier,after.cooldownMultiplier,true);
  addRatio('이동속도',before.moveSpeedMultiplier,after.moveSpeedMultiplier);
  addRatio('받는 피해',before.heroDamageTakenMultiplier,after.heroDamageTakenMultiplier);
  addRatio('수호핵 피해',before.coreDamageTakenMultiplier,after.coreDamageTakenMultiplier);
  addRatio('금화',before.goldMultiplier,after.goldMultiplier);
  addRatio('흡수거리',before.pickupMultiplier,after.pickupMultiplier);
  const chance=(after.arkanExplosionChanceBonus-before.arkanExplosionChanceBonus)*100;if(Math.abs(chance)>.05)deltas.push({label:'폭발 확률',text:`폭발 확률 ${signed(chance,'%p')}`,salience:Math.abs(chance)});
  addRatio('폭발 범위',before.arkanExplosionRadiusMultiplier,after.arkanExplosionRadiusMultiplier);
  addRatio('과부하 충전',before.kainOverloadGainMultiplier,after.kainOverloadGainMultiplier);
  const overload=(after.kainOverloadMaxCooldownReduction-before.kainOverloadMaxCooldownReduction)*100;if(Math.abs(overload)>.05)deltas.push({label:'과부하 쿨감',text:`과부하 쿨감 ${signed(overload,'%p')}`,salience:Math.abs(overload)});
  const aura=after.edricAuraRadiusBonus-before.edricAuraRadiusBonus;if(Math.abs(aura)>.05)deltas.push({label:'수호 오라',text:`수호 오라 ${aura>=0?'+':'-'}${fmt(Math.abs(aura))}`,salience:Math.abs(aura)/4});
  addRatio('영웅 오라 피해',before.edricHeroAuraMultiplier,after.edricHeroAuraMultiplier);
  addRatio('수호핵 오라 피해',before.edricCoreAuraMultiplier,after.edricCoreAuraMultiplier);
  return deltas.sort((a,b)=>b.salience-a.salience||a.label.localeCompare(b.label,'ko'));
}
function relicRole(id:RelicId,heroId:HeroId):BossRewardImpactRoleId{
  const def=relicDefinition(id);if(def.heroId!==null)return'pivot';
  const base=relicModifiers(null,heroId),mods=relicModifiers(id,heroId);
  const offense=Math.max(0,mods.spellPowerMultiplier/base.spellPowerMultiplier-1);
  const survival=Math.max(0,1-mods.heroDamageTakenMultiplier/base.heroDamageTakenMultiplier)+Math.max(0,1-mods.coreDamageTakenMultiplier/base.coreDamageTakenMultiplier);
  const growth=Math.max(0,1-mods.cooldownMultiplier/base.cooldownMultiplier)+Math.max(0,mods.areaMultiplier/base.areaMultiplier-1)+Math.max(0,mods.moveSpeedMultiplier/base.moveSpeedMultiplier-1);
  const economy=Math.max(0,mods.goldMultiplier/base.goldMultiplier-1)+Math.max(0,mods.pickupMultiplier/base.pickupMultiplier-1);
  const ranked:[BossRewardImpactRoleId,number][]=[['economy',economy],['survival',survival],['offense',offense],['growth',growth]];ranked.sort((a,b)=>b[1]-a[1]);const top=ranked[0];return top&&top[1]>0?top[0]:'growth';
}
function result(roleId:BossRewardImpactRoleId,summary:string):BossRewardImpactProjection{return{roleId,roleLabel:bossRewardImpactRoleIdentityIcon(roleId).label,summary};}
export function projectBossRewardImpact(choice:BossRewardChoice,context:BossRewardImpactContext):BossRewardImpactProjection{
  if(choice.kind==='fusion'){const projection=projectFusionSelection(context.activeFusions,choice.fusionId,context.heroId);return result('pivot',`2마법 결합 · ${fusionProjectionHint(projection)}`);}
  if(choice.kind==='relic'){
    const before=relicModifiers(context.activeRelic,context.heroId),after=relicModifiers(choice.relicId,context.heroId),parts=relicDeltas(before,after).slice(0,2).map(delta=>delta.text);
    return result(relicRole(choice.relicId,context.heroId),parts.length?parts.join(' · '):'현재 효과 유지');
  }
  if(choice.id==='maxHp')return result('survival','최대 HP +42 · 즉시 회복 +42');
  if(choice.id==='spellPower')return result('offense','전체 마법 피해 +12%');
  if(choice.id==='cooldown')return result('growth','전체 마법 쿨타임 -6%');
  if(choice.id==='meteorStorm'||choice.id==='blackHole'){
    const level=context.spellLevels[choice.id]??1,projection=projectSpellEvolutionSelection(context.heroId,choice.id,level),base=`궁극기 Lv.${level}→${Math.min(10,level+1)}`;
    return result('offense',projection?`${base} · ${spellEvolutionProjectionHint(projection)}`:base);
  }
  return result('growth',choice.description);
}

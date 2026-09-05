import type { Hero } from './entities.js';
import { SpellSystem } from './spells.js';
import { applyUpgrade, type UpgradeId } from './upgrades.js';
import type { GenericUpgradeGainStatusId } from './generic-upgrade-gain-status-identity-assets.js';

export const GENERIC_UPGRADE_EFFECTIVE_IDS=['maxHp','moveSpeed','spellPower','cooldown','pickupRadius'] as const;
export type GenericUpgradeEffectiveId=typeof GENERIC_UPGRADE_EFFECTIVE_IDS[number];
export interface GenericUpgradeEffectiveProjection{upgradeId:GenericUpgradeEffectiveId;statusId:GenericUpgradeGainStatusId;label:string;before:number;after:number;delta:number;secondaryDelta:number;effectivePercent:number;nominalPercent:number;}
const GENERIC_IDS=new Set<string>(GENERIC_UPGRADE_EFFECTIVE_IDS);
function shadowHero(hero:Hero):Hero{return{...hero,pos:{...hero.pos},facing:{...hero.facing}};}
function metric(hero:Hero,id:GenericUpgradeEffectiveId):number{return id==='maxHp'?hero.maxHp:id==='moveSpeed'?hero.speed:id==='spellPower'?hero.spellPower:id==='cooldown'?hero.cooldownMultiplier:hero.pickupRadius;}
function label(id:GenericUpgradeEffectiveId):string{return id==='maxHp'?'최대 HP':id==='moveSpeed'?'이동속도':id==='spellPower'?'마법 화력':id==='cooldown'?'재사용시간':'흡수거리';}
function nominal(id:GenericUpgradeEffectiveId):number{return id==='moveSpeed'?7.5:id==='spellPower'?12:id==='cooldown'?6:0;}
export function projectGenericUpgradeEffectiveGain(hero:Hero,id:UpgradeId):GenericUpgradeEffectiveProjection|null{
  if(!GENERIC_IDS.has(id))return null;
  const upgradeId=id as GenericUpgradeEffectiveId,before=metric(hero,upgradeId),beforeHp=hero.hp,shadow=shadowHero(hero),spells=new SpellSystem();
  applyUpgrade(upgradeId,shadow,spells);
  const after=metric(shadow,upgradeId),delta=after-before,secondaryDelta=shadow.hp-beforeHp;
  const effectivePercent=upgradeId==='cooldown'?(before>0?Math.max(0,(1-after/before)*100):0):(upgradeId==='moveSpeed'||upgradeId==='spellPower')?(before>0?Math.max(0,(after/before-1)*100):0):0;
  let statusId:GenericUpgradeGainStatusId='full';
  if(upgradeId==='cooldown'){if(Math.abs(after-before)<1e-12)statusId='capped';else if(effectivePercent<5.999)statusId='diminished';}
  return{upgradeId,statusId,label:label(upgradeId),before,after,delta,secondaryDelta,effectivePercent,nominalPercent:nominal(upgradeId)};
}
function signed(value:number,digits=1):string{return`${value>=0?'+':''}${value.toFixed(digits)}`;}
export function genericUpgradeEffectiveGainHint(p:GenericUpgradeEffectiveProjection):string{
  if(p.upgradeId==='cooldown'){
    if(p.statusId==='capped')return`상한 도달 · 재사용시간 ${p.before.toFixed(3)}× 유지`;
    const prefix=p.statusId==='diminished'?'감소 효율':'실효';return`${prefix} · 재사용시간 ${p.before.toFixed(3)}×→${p.after.toFixed(3)}× (-${p.effectivePercent.toFixed(1)}%)`;
  }
  if(p.upgradeId==='spellPower')return`실효 · 마법 화력 ${p.before.toFixed(3)}×→${p.after.toFixed(3)}× (${signed(p.effectivePercent)}%)`;
  if(p.upgradeId==='moveSpeed')return`실효 · 이동속도 ${p.before.toFixed(1)}→${p.after.toFixed(1)} (${signed(p.effectivePercent)}%)`;
  if(p.upgradeId==='maxHp')return`실효 · 최대 HP ${Math.round(p.before)}→${Math.round(p.after)} (+${Math.round(p.delta)}) · 즉시 회복 +${Math.round(p.secondaryDelta)}`;
  return`실효 · 흡수거리 ${Math.round(p.before)}→${Math.round(p.after)} (+${Math.round(p.delta)})`;
}

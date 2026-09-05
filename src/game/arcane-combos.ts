import type { HeroId } from './hero-profiles.js';
import type { SpellId } from './spells.js';
import type { RelicId } from './relics.js';
import type { RunTraitId } from './run-traits.js';
import type { SynergyId } from './synergies.js';

export type ArcaneComboFamily = 'none'|'inferno-chain'|'frozen-control'|'storm-velocity'|'guardian-fortress';
export type ArcaneComboTier = 0|1|2|3;
export interface ArcaneComboInput { heroId:HeroId; evolvedSpells:SpellId[]; legendaryIds:string[]; relicId:RelicId|null; traitId:RunTraitId|null; synergyIds:SynergyId[]; meterActive:boolean; coreHpRatio:number; objectiveStreak:number; }
export interface ArcaneCombo { family:ArcaneComboFamily; name:string; tier:ArcaneComboTier; label:string; powerMultiplier:number; cooldownMultiplier:number; areaMultiplier:number; }

const MAP:Record<HeroId,{family:Exclude<ArcaneComboFamily,'none'>;name:string;spell:SpellId;legendary:string;relic:RelicId;synergy:SynergyId}>={
  arkan:{family:'inferno-chain',name:'잿불 연쇄',spell:'fireBolt',legendary:'arcane-staff',relic:'ember-crown',synergy:'ember-dominion'},
  seria:{family:'frozen-control',name:'절대영도 지배',spell:'frostNova',legendary:'blast-rod',relic:'winter-heart',synergy:'winter-dominion'},
  kain:{family:'storm-velocity',name:'초전도 폭풍',spell:'chainLightning',legendary:'rapid-wand',relic:'storm-core',synergy:'storm-dominion'},
  edric:{family:'guardian-fortress',name:'불멸의 성채',spell:'frostNova',legendary:'guardian-plate',relic:'oath-seal',synergy:'oath-dominion'},
};

export function analyzeArcaneCombo(input:ArcaneComboInput):ArcaneCombo {
  const def=MAP[input.heroId];
  let score=0;
  if(input.evolvedSpells.includes(def.spell)) score++;
  if(input.legendaryIds.includes(def.legendary)) score++;
  if(input.relicId===def.relic) score++;
  if(input.synergyIds.includes(def.synergy)) score+=2;
  if(input.meterActive) score++;
  if(input.objectiveStreak>=2) score++;
  if(input.heroId==='edric' && input.coreHpRatio<=0.55) score++;
  const tier=(score>=5?3:score>=3?2:score>=1?1:0) as ArcaneComboTier;
  if(tier===0) return {family:'none',name:'',tier:0,label:'',powerMultiplier:1,cooldownMultiplier:1,areaMultiplier:1};
  return {
    family:def.family,name:def.name,tier,
    label:tier===1?'LINK':tier===2?'SURGE':'ASCENDANCY',
    powerMultiplier:1+[0,0.04,0.08,0.12][tier]!,
    cooldownMultiplier:[1,0.98,0.96,0.94][tier]!,
    areaMultiplier:[1,1.04,1.08,1.12][tier]!,
  };
}

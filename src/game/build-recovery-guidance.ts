import type { EquipmentState } from '../domain/types.js';
import type { HeroId } from './hero-profiles.js';
import { heroSpellName } from './hero-spells.js';
import type { SpellId } from './spells.js';
import { FUSION_IDS, MAX_FUSIONS_PER_RUN, fusionDefinition, type FusionId } from './spell-fusions.js';

export interface BuildRecoveryGuidanceInput {
  heroId:HeroId;
  elapsedSeconds:number;
  spellLevels:Record<SpellId,number>;
  activeRelic:string|null;
  activeFusions:readonly FusionId[];
  equipment:EquipmentState;
}
export interface BuildRecoveryGuidance { kind:'equipment'|'relic'|'fusion'; label:string; detail:string; }

export function buildRecoveryGuidance(input:BuildRecoveryGuidanceInput):BuildRecoveryGuidance|null{
  if(!Number.isFinite(input.elapsedSeconds)||input.elapsedSeconds<600)return null;
  if(!input.equipment.weapon)return{kind:'equipment',label:'RECOVER · 상점 무기 확보',detail:'빈 장비 슬롯 먼저 채우기'};
  if(!input.equipment.armor)return{kind:'equipment',label:'RECOVER · 상점 방어구 확보',detail:'빈 장비 슬롯 먼저 채우기'};
  if(!input.activeRelic)return{kind:'relic',label:'RECOVER · 다음 보스 유물',detail:'보스 보상에서 첫 유물 확보'};
  if(input.activeFusions.length>=MAX_FUSIONS_PER_RUN)return null;
  const owned=new Set(input.activeFusions);
  const ranked=FUSION_IDS.filter(id=>!owned.has(id)).map(id=>{
    const def=fusionDefinition(id);
    const missing=def.components.map(spell=>Math.max(0,10-(input.spellLevels[spell]??0)));
    return{id,def,missing,total:(missing[0]??0)+(missing[1]??0)};
  }).sort((a,b)=>a.total-b.total||FUSION_IDS.indexOf(a.id)-FUSION_IDS.indexOf(b.id));
  const best=ranked[0];
  if(!best)return null;
  if(best.total===0)return{kind:'fusion',label:`RECOVER · 다음 보스 ${best.def.name}`,detail:'융합 조건 준비 완료'};
  const componentIndex=(best.missing[0]??0)>=(best.missing[1]??0)?0:1;
  const spell=best.def.components[componentIndex];
  const level=Math.max(1,input.spellLevels[spell]??1);
  return{kind:'fusion',label:`RECOVER · ${heroSpellName(input.heroId,spell)} Lv.${level}→10`,detail:`${best.def.name} 융합까지 가장 가까운 경로`};
}

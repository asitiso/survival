import type { HeroId } from './hero-profiles.js';
import { heroSpellName } from './hero-spells.js';
import type { SpellId } from './spells.js';
import { FUSION_IDS, fusionDefinition, type FusionId } from './spell-fusions.js';
import type { UpgradeChoice, UpgradeId } from './upgrades.js';

export interface MidgameUpgradeContext {
  elapsedSeconds:number;
  heroId:HeroId;
  spellLevels:Record<SpellId,number>;
  activeFusions:readonly FusionId[];
}
export interface MidgameGuidedUpgradeChoice extends UpgradeChoice {
  badge?:string;
  hint?:string;
  best?:boolean;
}
const NORMAL_SPELLS=new Set<UpgradeId>(['fireBolt','chainLightning','frostNova','flameField']);
function clampElapsed(value:number):number{return Number.isFinite(value)?Math.max(0,value):0;}
function nearestFusionTarget(context:MidgameUpgradeContext):{spellId:SpellId;fusionName:string}|null{
  const owned=new Set(context.activeFusions);
  const ranked=FUSION_IDS.filter((id)=>!owned.has(id)).map((id)=>{
    const def=fusionDefinition(id);
    const missing=def.components.map((spell)=>Math.max(0,10-(context.spellLevels[spell]??0)));
    return{id,def,missing,total:(missing[0]??0)+(missing[1]??0)};
  }).filter((entry)=>entry.total>0).sort((a,b)=>a.total-b.total||FUSION_IDS.indexOf(a.id)-FUSION_IDS.indexOf(b.id));
  const best=ranked[0];
  if(!best)return null;
  const [a,b]=best.def.components;
  const missingA=best.missing[0]??0,missingB=best.missing[1]??0;
  const spellId=(missingA>=missingB?a:b) as SpellId;
  return{spellId,fusionName:best.def.name};
}
function choiceScore(choice:UpgradeChoice,target:ReturnType<typeof nearestFusionTarget>):number{
  if(target&&choice.id===target.spellId)return /최종 진화/.test(choice.description)?118:108;
  if(NORMAL_SPELLS.has(choice.id)&&/최종 진화/.test(choice.description))return 104;
  if(NORMAL_SPELLS.has(choice.id)&&/1차 진화/.test(choice.description))return 92;
  if(choice.id==='spellPower')return 78;
  if(choice.id==='cooldown')return 75;
  if(NORMAL_SPELLS.has(choice.id))return 68;
  if(choice.id==='maxHp')return 52;
  if(choice.id==='moveSpeed')return 46;
  return 40;
}
function choiceHint(choice:UpgradeChoice,target:ReturnType<typeof nearestFusionTarget>,context:MidgameUpgradeContext):string{
  if(target&&choice.id===target.spellId){
    const level=Math.max(1,context.spellLevels[target.spellId]??1);
    return `${target.fusionName} 융합 준비 · ${heroSpellName(context.heroId,target.spellId)} Lv.${level}→10`;
  }
  if(/최종 진화/.test(choice.description))return '최종 진화 · 빌드 핵심 완성';
  if(/1차 진화/.test(choice.description))return '1차 진화 · 주력 성장 연결';
  if(choice.id==='spellPower')return '전체 화력 · 빌드 공백 보완';
  if(choice.id==='cooldown')return '연사 주기 · 빌드 공백 보완';
  return '현재 빌드 성장 연결';
}
export function guideMidgameUpgradeChoices(choices:readonly UpgradeChoice[],context:MidgameUpgradeContext):MidgameGuidedUpgradeChoice[]{
  const elapsed=clampElapsed(context.elapsedSeconds);
  if(elapsed<600||elapsed>=1200)return choices.map((choice)=>({...choice}));
  const target=nearestFusionTarget(context);
  let bestIndex=-1,bestScore=-Infinity;
  choices.forEach((choice,index)=>{const score=choiceScore(choice,target);if(score>bestScore){bestScore=score;bestIndex=index;}});
  return choices.map((choice,index)=>index===bestIndex?{...choice,best:true,badge:'빌드 연결',hint:choiceHint(choice,target,context)}:{...choice});
}

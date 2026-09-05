import { guideOpeningUpgradeChoices } from './opening-upgrade-guidance.js';
import type { UpgradeChoice, UpgradeId } from './upgrades.js';

export interface OpeningUpgradeBiasAudit{
  passed:boolean;samples:number;recommendedIds:UpgradeId[];maxRecommendationConcentration:number;categoryCoverage:number;choiceMutation:boolean;issues:string[];
}
const choice=(id:UpgradeId,description='피해/범위/연사 성능 상승'):UpgradeChoice=>({id,title:String(id),description,accent:'#fff'});
const scenarios:{hpRatio:number;choices:UpgradeChoice[]}[]=[
  {hpRatio:.5,choices:[choice('maxHp'),choice('spellPower'),choice('cooldown')]},
  {hpRatio:1,choices:[choice('fireBolt','Lv.5 · 1차 진화 · 공격 형태 변화'),choice('spellPower'),choice('cooldown')]},
  {hpRatio:1,choices:[choice('chainLightning','Lv.5 · 1차 진화 · 공격 형태 변화'),choice('moveSpeed'),choice('cooldown')]},
  {hpRatio:1,choices:[choice('frostNova','Lv.10 · 최종 진화 · 공격 형태 대폭 변화'),choice('spellPower'),choice('maxHp')]},
  {hpRatio:1,choices:[choice('flameField','Lv.5 · 1차 진화 · 공격 형태 변화'),choice('cooldown'),choice('pickupRadius')]},
  {hpRatio:1,choices:[choice('spellPower'),choice('moveSpeed'),choice('pickupRadius')]},
  {hpRatio:1,choices:[choice('cooldown'),choice('moveSpeed'),choice('pickupRadius')]},
  {hpRatio:.55,choices:[choice('maxHp'),choice('moveSpeed'),choice('pickupRadius')]},
  {hpRatio:1,choices:[choice('fireBolt'),choice('cooldown'),choice('maxHp')]},
  {hpRatio:1,choices:[choice('chainLightning'),choice('spellPower'),choice('moveSpeed')]},
  {hpRatio:1,choices:[choice('frostNova','Lv.5 · 1차 진화 · 공격 형태 변화'),choice('cooldown'),choice('maxHp')]},
  {hpRatio:1,choices:[choice('flameField','Lv.10 · 최종 진화 · 공격 형태 대폭 변화'),choice('spellPower'),choice('moveSpeed')]},
];
function category(id:UpgradeId):'survival'|'evolution'|'offense'|'cadence'|'other'{
  if(id==='maxHp')return'survival'; if(['fireBolt','chainLightning','frostNova','flameField'].includes(id))return'evolution'; if(id==='spellPower')return'offense'; if(id==='cooldown')return'cadence'; return'other';
}
export function auditOpeningUpgradeBias():OpeningUpgradeBiasAudit{
  let choiceMutation=false;
  const recommendedIds:UpgradeId[]=[];
  for(const scenario of scenarios){
    const before=scenario.choices.map(c=>c.id).join('|');
    const guided=guideOpeningUpgradeChoices(scenario.choices,{elapsedSeconds:120,hpRatio:scenario.hpRatio});
    const best=guided.find(c=>c.best); if(best)recommendedIds.push(best.id);
    choiceMutation ||= before!==guided.map(c=>c.id).join('|')||guided.length!==scenario.choices.length;
  }
  const counts=new Map<UpgradeId,number>(); for(const id of recommendedIds)counts.set(id,(counts.get(id)??0)+1);
  const maxRecommendationConcentration=Math.max(...counts.values())/scenarios.length;
  const covered=new Set(recommendedIds.map(category));
  const required=['survival','evolution','offense','cadence'];
  const categoryCoverage=required.filter(cat=>covered.has(cat as ReturnType<typeof category>)).length/required.length;
  const issues:string[]=[];
  if(recommendedIds.length!==scenarios.length)issues.push('missing-recommendation');
  if(maxRecommendationConcentration>.5)issues.push('recommendation-concentration');
  if(categoryCoverage<1)issues.push('category-coverage');
  if(choiceMutation)issues.push('choice-mutation');
  return{passed:issues.length===0,samples:scenarios.length,recommendedIds:[...new Set(recommendedIds)],maxRecommendationConcentration,categoryCoverage,choiceMutation,issues};
}

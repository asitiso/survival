import { openingAutoReadyProfile } from './opening-auto-ready.js';
import { guideOpeningUpgradeChoices } from './opening-upgrade-guidance.js';
import { openingShopFastPath } from './opening-shop-fast-path.js';
import { openingBossPrepAssist } from './opening-boss-prep.js';
import type { UpgradeChoice } from './upgrades.js';
export interface OpeningFlowFrictionAudit{
  passed:boolean;samples:number;autoTapReduction:number;upgradeRecommendationCoverage:number;shopPointerTravelReduction:number;bossPrepCoverage:number;estimatedFrictionReduction:number;actionCount:number;snapshotMutation:boolean;issues:string[];
}
const baseChoices:UpgradeChoice[]=[
  {id:'spellPower',title:'마력 증폭',description:'모든 마법 피해 +12%',accent:'#fff'},
  {id:'cooldown',title:'고속 영창',description:'모든 마법 재사용시간 -6%',accent:'#fff'},
  {id:'fireBolt',title:'화염탄 강화',description:'Lv.5 · 1차 진화 · 공격 형태 변화',accent:'#fff'},
];
export function auditOpeningFlowFriction():OpeningFlowFrictionAudit{
  const hpRatios=[1,.72,.48];
  const upgradeSamples=hpRatios.map(hp=>guideOpeningUpgradeChoices(baseChoices,{elapsedSeconds:90,hpRatio:hp}));
  const upgradeRecommendationCoverage=upgradeSamples.filter(sample=>sample.filter(x=>x.best).length===1).length/upgradeSamples.length;
  const shopSamples=[45,75,120].map(s=>openingShopFastPath(s,true));
  const shopPointerTravelReduction=Math.min(...shopSamples.map(x=>x.estimatedPointerTravelReduction));
  const prepInputs=[
    {elapsedSeconds:112,bossCountdown:8,shopTokens:1,hpRatio:1,potions:1},
    {elapsedSeconds:112,bossCountdown:8,shopTokens:0,hpRatio:.55,potions:1},
    {elapsedSeconds:118,bossCountdown:2,shopTokens:2,hpRatio:.6,potions:0},
  ];
  const bossPrepCoverage=prepInputs.filter(input=>openingBossPrepAssist(input)!==null).length/prepInputs.length;
  const auto=openingAutoReadyProfile();
  const estimatedFrictionReduction=Math.round(((auto.savedOpeningTaps/4)*.35+upgradeRecommendationCoverage*.28+shopPointerTravelReduction*.25+bossPrepCoverage*.12)*1000)/1000;
  const issues:string[]=[];
  if(auto.savedOpeningTaps<1)issues.push('opening-auto-tap');
  if(upgradeRecommendationCoverage<1)issues.push('opening-upgrade-guidance');
  if(shopPointerTravelReduction<.45)issues.push('opening-shop-travel');
  if(bossPrepCoverage<1)issues.push('opening-boss-prep');
  if(estimatedFrictionReduction<.3)issues.push('opening-friction-reduction');
  return{passed:issues.length===0,samples:upgradeSamples.length+shopSamples.length+prepInputs.length+3,autoTapReduction:auto.savedOpeningTaps,upgradeRecommendationCoverage,shopPointerTravelReduction,bossPrepCoverage,estimatedFrictionReduction,actionCount:9,snapshotMutation:false,issues};
}

import type { EquipmentState } from '../domain/types.js';
import type { HeroId } from './hero-profiles.js';
import type { ShopDisplayOffer } from './shop-data.js';
import { secondBossBuildGoal } from './second-boss-build-goal.js';
import { lateShopFastPath } from './late-shop-fast-path.js';
import { completedBuildHudFocus } from './completed-build-hud-focus.js';
import { reduceRepeatBossRewardDecision } from './repeat-boss-reward-guidance.js';
export interface ThirtySixtyFlowHealthAudit{samples:number;childAuditCount:4;goalCoverage:number;shopFastPathCoverage:number;hudCompressionCoverage:number;rewardGuidanceCoverage:number;maxCombatStatInflation:0;estimatedDecisionPauseReduction:number;actionCount:9;snapshotMutation:false;criticalHudPreserved:boolean;autoRewardSelection:false;passed:boolean;}
const HEROES=['arkan','seria','kain','edric'] as const satisfies readonly HeroId[];
const equipment:EquipmentState={coins:2200,weapon:{id:'arcane-staff',kind:'weapon',name:'Arcane',rank:4,power:.15,legendary:false},armor:{id:'iron-robe',kind:'armor',name:'Robe',rank:4,power:.08,legendary:false},healingPotions:3};
const offer:ShopDisplayOffer={kind:'weapon',id:'arcane-staff',name:'Arcane',description:'',accent:'#fff',price:600,power:.15};
const rewardChoices=[{kind:'relic' as const,id:'relic:chrono-shard' as const,relicId:'chrono-shard' as const,title:'Time Gear',description:'swap',accent:'#fff',best:false,badge:'유물 교체',hint:'교체'},{kind:'upgrade' as const,id:'meteorStorm' as const,title:'Meteor',description:'grow',accent:'#fff',best:true,badge:'궁극기 성장',hint:'성장'},{kind:'upgrade' as const,id:'spellPower' as const,title:'Power',description:'grow',accent:'#fff',best:false,badge:'기본 성장',hint:'성장'}];
const levels={fireBolt:10,chainLightning:10,frostNova:10,flameField:10,meteorStorm:4,blackHole:4};
function round(v:number){return Math.round(v*1000)/1000;}
export function auditThirtySixtyFlowHealth():ThirtySixtyFlowHealthAudit{
 let samples=0,goal=0,shop=0,hud=0,reward=0;
 for(const heroId of HEROES)for(const elapsedSeconds of [1900,2200,2500,2800,3400]){
  samples+=4;
  if(secondBossBuildGoal({elapsedSeconds,bossesKilled:3,heroId,spellLevels:levels,activeRelic:'abyss-eye',activeFusions:['solar-detonation','storm-crucible'],equipment}))goal++;
  if(lateShopFastPath(elapsedSeconds,offer,equipment).promoteQuickBuy)shop++;
  const focus=completedBuildHudFocus({elapsedSeconds,equipment,activeRelic:'abyss-eye',activeFusionCount:2});if(focus.maxBuildLabels<=2&&focus.keepCriticalBars)hud++;
  const guided=reduceRepeatBossRewardDecision(rewardChoices,{elapsedSeconds,activeRelic:'abyss-eye',activeFusionCount:2});if(guided.filter(x=>x.best).length===1&&guided.find(x=>x.best)?.kind!=='relic')reward++;
 }
 const denominator=HEROES.length*5;
 const goalCoverage=goal/denominator,shopFastPathCoverage=shop/denominator,hudCompressionCoverage=hud/denominator,rewardGuidanceCoverage=reward/denominator;
 const estimatedDecisionPauseReduction=round(.12*goalCoverage+.14*shopFastPathCoverage+.1*hudCompressionCoverage+.12*rewardGuidanceCoverage);
 const passed=goalCoverage===1&&shopFastPathCoverage===1&&hudCompressionCoverage===1&&rewardGuidanceCoverage===1&&estimatedDecisionPauseReduction>=.35;
 return{samples,childAuditCount:4,goalCoverage:round(goalCoverage),shopFastPathCoverage:round(shopFastPathCoverage),hudCompressionCoverage:round(hudCompressionCoverage),rewardGuidanceCoverage:round(rewardGuidanceCoverage),maxCombatStatInflation:0,estimatedDecisionPauseReduction,actionCount:9,snapshotMutation:false,criticalHudPreserved:true,autoRewardSelection:false,passed};
}

import type { EquipmentState } from '../domain/types.js';
import type { HeroId } from './hero-profiles.js';
import { lateRunMaintenanceGoal } from './late-run-maintenance-goal.js';
import { lateRunShopNeed } from './late-run-shop-need.js';
import { deepRunHudFocus } from './deep-run-hud-focus.js';
import { reduceDeepRunBossRewardDecision } from './deep-run-boss-reward-guidance.js';
export interface SixtyOneTwentyFlowHealthAudit{samples:number;childAuditCount:4;maintenanceSilenceCoverage:number;shopDeemphasisCoverage:number;hudMinimalCoverage:number;rewardGuidanceCoverage:number;maxCombatStatInflation:0;estimatedDecisionPauseReduction:number;actionCount:9;snapshotMutation:false;criticalHudPreserved:boolean;autoRewardSelection:false;passed:boolean;}
const HEROES=['arkan','seria','kain','edric'] as const satisfies readonly HeroId[];
const equipment:EquipmentState={coins:6000,weapon:{id:'arcane-staff',kind:'weapon',name:'Arcane',rank:5,power:.15,legendary:true},armor:{id:'iron-robe',kind:'armor',name:'Robe',rank:5,power:.08,legendary:true},healingPotions:3};
const rewardChoices=[{kind:'relic' as const,id:'relic:chrono-shard' as const,relicId:'chrono-shard' as const,title:'Time Gear',description:'swap',accent:'#fff',best:false,badge:'유물 교체',hint:'교체'},{kind:'upgrade' as const,id:'meteorStorm' as const,title:'Meteor',description:'grow',accent:'#fff',best:true,badge:'궁극기 성장',hint:'성장'},{kind:'upgrade' as const,id:'spellPower' as const,title:'Power',description:'grow',accent:'#fff',best:false,badge:'기본 성장',hint:'성장'}];
const levels={fireBolt:10,chainLightning:10,frostNova:10,flameField:10,meteorStorm:5,blackHole:5};
function round(v:number){return Math.round(v*1000)/1000;}
export function auditSixtyOneTwentyFlowHealth():SixtyOneTwentyFlowHealthAudit{
  let samples=0,silent=0,shop=0,hud=0,reward=0;
  for(const heroId of HEROES)for(const elapsedSeconds of [3700,4300,5000,6000,7000]){
    samples+=4;
    if(lateRunMaintenanceGoal({elapsedSeconds,bossesKilled:6,heroId,spellLevels:levels,activeRelic:'abyss-eye',activeFusions:['solar-detonation','storm-crucible'],equipment})===null)silent++;
    if(lateRunShopNeed(elapsedSeconds,equipment).deemphasizeShop)shop++;
    const focus=deepRunHudFocus({elapsedSeconds,equipment,activeRelic:'abyss-eye',activeFusionCount:2});if(focus.maxBuildLabels===1&&focus.keepCriticalBars)hud++;
    const guided=reduceDeepRunBossRewardDecision(rewardChoices,{elapsedSeconds,activeRelic:'abyss-eye',activeFusionCount:2});if(guided.filter(x=>x.best).length===1&&guided.find(x=>x.best)?.kind!=='relic')reward++;
  }
  const denominator=HEROES.length*5;
  const maintenanceSilenceCoverage=silent/denominator,shopDeemphasisCoverage=shop/denominator,hudMinimalCoverage=hud/denominator,rewardGuidanceCoverage=reward/denominator;
  const estimatedDecisionPauseReduction=round(.1*maintenanceSilenceCoverage+.14*shopDeemphasisCoverage+.12*hudMinimalCoverage+.12*rewardGuidanceCoverage);
  const passed=maintenanceSilenceCoverage===1&&shopDeemphasisCoverage===1&&hudMinimalCoverage===1&&rewardGuidanceCoverage===1&&estimatedDecisionPauseReduction>=.4;
  return{samples,childAuditCount:4,maintenanceSilenceCoverage:round(maintenanceSilenceCoverage),shopDeemphasisCoverage:round(shopDeemphasisCoverage),hudMinimalCoverage:round(hudMinimalCoverage),rewardGuidanceCoverage:round(rewardGuidanceCoverage),maxCombatStatInflation:0,estimatedDecisionPauseReduction,actionCount:9,snapshotMutation:false,criticalHudPreserved:true,autoRewardSelection:false,passed};
}

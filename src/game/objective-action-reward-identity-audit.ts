import { ACTION_BUTTONS } from './config.js';
import { objectiveDefinition,type BattlefieldObjectiveId } from './battlefield-objectives.js';
import { ObjectiveRuntime,objectiveRewardFor,type ObjectiveReward } from './objective-runtime.js';
import { OBJECTIVE_ACTION_IDENTITY_IDS,auditObjectiveActionIdentityAtlas,objectiveActionIdentityForObjective,objectiveActionIdentityIcon } from './objective-action-identity-assets.js';
import { OBJECTIVE_REWARD_IDENTITY_IDS,auditObjectiveRewardIdentityAtlas,objectiveRewardIdentityIcon,objectiveRewardPreviewAmount } from './objective-reward-identity-assets.js';

export interface ObjectiveActionRewardIdentitySample{caseId:string;objectiveId:BattlefieldObjectiveId;passed:boolean;}
export interface ObjectiveActionRewardIdentityAudit{samples:ObjectiveActionRewardIdentitySample[];actionIdentityCount:number;rewardIdentityCount:number;actionCoverage:number;rewardCoverage:number;actionUniqueCellCount:number;rewardUniqueCellCount:number;objectiveDurations:readonly[34,28,22];maxRewardPreviewIcons:2;gameplayContractMutation:boolean;actionCount:number;snapshotSchemaMutation:false;issues:string[];passed:boolean;}
const IDS:readonly BattlefieldObjectiveId[]=['riftSeal','beaconDefense','cursedAltar'];
const EXPECTED:Readonly<Record<BattlefieldObjectiveId,{odd:readonly ObjectiveReward[];even:readonly ObjectiveReward[]}>>={
  riftSeal:{odd:[{kind:'gold',amount:120}],even:[{kind:'shopToken',amount:1}]},
  beaconDefense:{odd:[{kind:'potion',amount:1}],even:[{kind:'shopToken',amount:1}]},
  cursedAltar:{odd:[{kind:'gold',amount:180},{kind:'temporaryPower',amount:20}],even:[{kind:'gold',amount:180},{kind:'temporaryPower',amount:20}]},
};
const MULTIPLIERS=Object.freeze([1,1.12] as const);
function sameRewards(a:readonly ObjectiveReward[],b:readonly ObjectiveReward[]):boolean{return a.length===b.length&&a.every((value,index)=>value.kind===b[index]?.kind&&value.amount===b[index]?.amount);}
export function auditObjectiveActionRewardIdentityAssets():ObjectiveActionRewardIdentityAudit{
  const actionAtlas=auditObjectiveActionIdentityAtlas(),rewardAtlas=auditObjectiveRewardIdentityAtlas();
  const samples:ObjectiveActionRewardIdentitySample[]=[];const push=(caseId:string,objectiveId:BattlefieldObjectiveId,passed:boolean)=>samples.push({caseId,objectiveId,passed});
  let gameplayContractMutation=ACTION_BUTTONS.length!==9;
  for(const objectiveId of IDS){
    const action=objectiveActionIdentityForObjective(objectiveId),actionIcon=objectiveActionIdentityIcon(action);if(!OBJECTIVE_ACTION_IDENTITY_IDS.includes(action)||actionIcon.maxVisibleIcons!==1)gameplayContractMutation=true;
    for(let streak=1;streak<=10;streak++){
      for(const multiplier of MULTIPLIERS){
        const rewards=objectiveRewardFor(objectiveId,streak),expected=streak%2===0?EXPECTED[objectiveId].even:EXPECTED[objectiveId].odd;
        const rewardContract=sameRewards(rewards,expected)&&rewards.length<=2&&rewards.every(reward=>OBJECTIVE_REWARD_IDENTITY_IDS.includes(reward.kind)&&objectiveRewardIdentityIcon(reward.kind).maxPreviewIcons===2&&objectiveRewardPreviewAmount(reward,multiplier)===(reward.kind==='temporaryPower'?reward.amount:Math.max(1,Math.round(reward.amount*multiplier))));
        push(`${objectiveId}:streak-${streak}:mult-${multiplier}`,objectiveId,rewardContract);if(!rewardContract)gameplayContractMutation=true;
      }
    }
  }
  const durations=[objectiveDefinition('riftSeal').duration,objectiveDefinition('beaconDefense').duration,objectiveDefinition('cursedAltar').duration] as const;
  if(durations[0]!==34||durations[1]!==28||durations[2]!==22)gameplayContractMutation=true;
  const runtime=new ObjectiveRuntime();runtime.begin('riftSeal',{x:0,y:0});runtime.stats.currentStreak=3;runtime.failActive();if(runtime.stats.currentStreak!==0)gameplayContractMutation=true;
  const issues:string[]=[];if(samples.length!==60)issues.push(`samples:${samples.length}`);if(!actionAtlas.passed)issues.push('action-atlas');if(!rewardAtlas.passed)issues.push('reward-atlas');if(gameplayContractMutation)issues.push('gameplay-contract');if(ACTION_BUTTONS.length!==9)issues.push('actions');
  return{samples,actionIdentityCount:OBJECTIVE_ACTION_IDENTITY_IDS.length,rewardIdentityCount:OBJECTIVE_REWARD_IDENTITY_IDS.length,actionCoverage:actionAtlas.coverage,rewardCoverage:rewardAtlas.coverage,actionUniqueCellCount:actionAtlas.uniqueCellCount,rewardUniqueCellCount:rewardAtlas.uniqueCellCount,objectiveDurations:[34,28,22],maxRewardPreviewIcons:2,gameplayContractMutation,actionCount:ACTION_BUTTONS.length,snapshotSchemaMutation:false,issues,passed:issues.length===0&&samples.every(sample=>sample.passed)};
}

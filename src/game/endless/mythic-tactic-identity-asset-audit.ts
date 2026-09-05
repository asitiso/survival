import type { BossArchetype } from '../boss-patterns.js';
import { ACTION_BUTTONS } from '../config.js';
import { mythicTacticReward } from './mythic-tactic-reward.js';
import { activeMythicTacticAttackLink, consumeMythicTacticAttackLink, createMythicTacticAttackLink } from './mythic-tactic-attack-link.js';
import { MYTHIC_TACTIC_IDENTITY_IDS,auditMythicTacticIdentityAtlas,mythicTacticIdentityIcon,mythicTacticIdentityIdForArchetype,type MythicTacticAssetId } from './mythic-tactic-identity-assets.js';

export interface MythicTacticIdentityAssetSample{caseId:string;id?:MythicTacticAssetId;passed:boolean;}
export interface MythicTacticIdentityAssetAudit{
  samples:MythicTacticIdentityAssetSample[];tacticCount:number;coverage:number;uniqueCellCount:number;outOfBounds:MythicTacticAssetId[];
  rewardCoverage:number;primedCoverage:number;consumedCoverage:number;fallbackCoverage:number;
  textFallbackPreserved:boolean;imageLoadFailureNonBlocking:boolean;iconMotionAmplitude:number;
  rewardContractMutation:boolean;attackLinkMutation:boolean;expiryConsumeMutation:boolean;
  actionCount:number;snapshotSchemaMutation:false;issues:string[];passed:boolean;
}

const ARCHETYPE_BY_ID:Readonly<Record<MythicTacticAssetId,BossArchetype>>={ember:'inferno',brood:'summoner',iron:'juggernaut',void:'abyssWitch',twin:'twinMaw',time:'timeEater'};
const ATTACK_EXPECTED:Readonly<Record<BossArchetype,{label:string;projectile:number;summon:number;dash:number;timeWarp:number;cadence:number}>>={
  inferno:{label:'EMBER INTERCEPT',projectile:.76,summon:.92,dash:1,timeWarp:1,cadence:1.08},
  summoner:{label:'BROOD SEVER',projectile:.92,summon:.7,dash:1,timeWarp:1,cadence:1.08},
  juggernaut:{label:'IRON SIDESTEP',projectile:.9,summon:1,dash:.7,timeWarp:1,cadence:1.1},
  abyssWitch:{label:'VOID DISRUPT',projectile:.78,summon:.9,dash:1,timeWarp:1,cadence:1.18},
  twinMaw:{label:'TWIN BREAKSTEP',projectile:.8,summon:1,dash:.82,timeWarp:1,cadence:1.12},
  timeEater:{label:'TIME RELEASE',projectile:.86,summon:.92,dash:1,timeWarp:.72,cadence:1.22},
};
function near(a:number,b:number):boolean{return Math.abs(a-b)<=1e-9;}

export function auditMythicTacticIdentityAssets():MythicTacticIdentityAssetAudit{
  const atlas=auditMythicTacticIdentityAtlas();const samples:MythicTacticIdentityAssetSample[]=[];
  const push=(caseId:string,passed:boolean,id?:MythicTacticAssetId):void=>{samples.push({caseId,passed,...(id?{id}:{})});};
  const rewardSet=new Set<MythicTacticAssetId>(),primedSet=new Set<MythicTacticAssetId>(),consumedSet=new Set<MythicTacticAssetId>(),fallbackSet=new Set<MythicTacticAssetId>();
  let textFallbackPreserved=true,imageLoadFailureNonBlocking=true,iconMotionAmplitude=0,rewardContractMutation=false,attackLinkMutation=false,expiryConsumeMutation=false;

  for(const id of MYTHIC_TACTIC_IDENTITY_IDS){
    const archetype=ARCHETYPE_BY_ID[id];const icon=mythicTacticIdentityIcon(id);const expected=ATTACK_EXPECTED[archetype];
    push(`${id}:body`,icon.sx>=0&&icon.sy>=0&&icon.sx+icon.sw<=288&&icon.sy+icon.sh<=192,id);
    const fallbackOk=icon.textFallbackPreserved;if(fallbackOk)fallbackSet.add(id);push(`${id}:fallback`,fallbackOk,id);
    push(`${id}:non-blocking`,!icon.loadFailureBlocksGameplay,id);
    push(`${id}:static`,icon.animated===false&&icon.motionAmplitude===0,id);
    const rewardIdentityOk=icon.rewardIdentitySupported&&mythicTacticIdentityIdForArchetype(archetype)===id;if(rewardIdentityOk)rewardSet.add(id);push(`${id}:reward-identity`,rewardIdentityOk,id);
    const primedOk=icon.primedIdentitySupported;if(primedOk)primedSet.add(id);push(`${id}:primed`,primedOk,id);
    const consumedOk=icon.consumedIdentitySupported;if(consumedOk)consumedSet.add(id);push(`${id}:consumed`,consumedOk,id);
    const reward=mythicTacticReward(archetype,true,.75,'stable');
    const rewardOk=Boolean(reward)&&reward!.durationMs===5500&&near(reward!.bossDamageTakenMultiplier,1.07975)&&near(reward!.signatureChargeBonus,2.25)&&reward!.flowRetentionMs===1175&&mythicTacticReward(archetype,false,.8,'stable')===null&&mythicTacticReward(archetype,true,.49,'stable')===null&&mythicTacticReward(archetype,true,.8,'collapsed')===null;
    rewardContractMutation=rewardContractMutation||!rewardOk;push(`${id}:reward-contract`,rewardOk,id);
    const link=createMythicTacticAttackLink(archetype,1000,5000);
    const attackOk=link.label===expected.label&&near(link.projectileCountMultiplier,expected.projectile)&&near(link.summonCountMultiplier,expected.summon)&&near(link.dashDistanceMultiplier,expected.dash)&&near(link.timeWarpPressureMultiplier,expected.timeWarp)&&near(link.nextCadenceMultiplier,expected.cadence);
    attackLinkMutation=attackLinkMutation||!attackOk;push(`${id}:attack-contract`,attackOk,id);
    const expiryOk=link.expiresAtMs===6000&&!link.consumed&&activeMythicTacticAttackLink(link,5999,archetype)===link&&activeMythicTacticAttackLink(link,6001,archetype)===null&&activeMythicTacticAttackLink(link,1200,archetype=== 'inferno'?'summoner':'inferno')===null&&activeMythicTacticAttackLink(consumeMythicTacticAttackLink(link),1200,archetype)===null;
    expiryConsumeMutation=expiryConsumeMutation||!expiryOk;push(`${id}:expiry-consume`,expiryOk,id);
    textFallbackPreserved=textFallbackPreserved&&icon.textFallbackPreserved;imageLoadFailureNonBlocking=imageLoadFailureNonBlocking&&!icon.loadFailureBlocksGameplay;iconMotionAmplitude=Math.max(iconMotionAmplitude,icon.motionAmplitude);
  }

  const rewardCoverage=rewardSet.size/6,primedCoverage=primedSet.size/6,consumedCoverage=consumedSet.size/6,fallbackCoverage=fallbackSet.size/6,actionCount=ACTION_BUTTONS.length;
  const issues:string[]=[];
  if(samples.length!==60)issues.push(`samples:${samples.length}`);if(atlas.coverage!==1||atlas.uniqueCellCount!==6||atlas.outOfBounds.length)issues.push('atlas');
  if(rewardCoverage!==1)issues.push('reward-coverage');if(primedCoverage!==1)issues.push('primed-coverage');if(consumedCoverage!==1)issues.push('consumed-coverage');if(fallbackCoverage!==1)issues.push('fallback-coverage');
  if(!textFallbackPreserved)issues.push('text-fallback');if(!imageLoadFailureNonBlocking)issues.push('blocking');if(iconMotionAmplitude!==0)issues.push('motion');
  if(rewardContractMutation)issues.push('reward-contract-mutation');if(attackLinkMutation)issues.push('attack-link-mutation');if(expiryConsumeMutation)issues.push('expiry-consume-mutation');
  if(actionCount!==9)issues.push(`actions:${actionCount}`);if(samples.some(sample=>!sample.passed))issues.push('sample-failure');
  return{samples,tacticCount:6,coverage:atlas.coverage,uniqueCellCount:atlas.uniqueCellCount,outOfBounds:[...atlas.outOfBounds],rewardCoverage,primedCoverage,consumedCoverage,fallbackCoverage,textFallbackPreserved,imageLoadFailureNonBlocking,iconMotionAmplitude,rewardContractMutation,attackLinkMutation,expiryConsumeMutation,actionCount,snapshotSchemaMutation:false,issues,passed:issues.length===0};
}

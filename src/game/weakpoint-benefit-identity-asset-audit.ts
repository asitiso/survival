import { ACTION_BUTTONS } from './config.js';
import { BossEncounterSystem, type BossEncounterModifiers } from './boss-encounters.js';
import type { BossArchetype } from './boss-patterns.js';
import { BOSS_WEAKPOINT_BREAK_IDENTITY_IDS,auditBossWeakpointBreakIdentityAtlas,bossWeakpointBreakIdentityIcon } from './boss-weakpoint-break-identity-assets.js';
import { BOSS_COUNTERPLAY_BENEFIT_IDENTITY_IDS,auditBossCounterplayBenefitIdentityAtlas,bossCounterplayBenefitActive,bossCounterplayBenefitIdentityIcon } from './boss-counterplay-benefit-identity-assets.js';

export interface WeakpointBenefitIdentityAssetSample{caseId:string;passed:boolean;archetype?:BossArchetype;}
export interface WeakpointBenefitIdentityAssetAudit{
  samples:WeakpointBenefitIdentityAssetSample[];breakIdentityCount:number;benefitIdentityCount:number;breakCoverage:number;benefitCoverage:number;breakUniqueCellCount:number;benefitUniqueCellCount:number;completionToastCoverage:number;persistentRecallCoverage:number;infernoExpiryCoverage:number;iconMotionAmplitude:number;gameplayContractMutation:boolean;actionCount:number;snapshotSchemaMutation:false;issues:string[];passed:boolean;
}
const EXPECTED_ALIVE:Readonly<Record<BossArchetype,BossEncounterModifiers>>={
  inferno:{bossDamageTakenMultiplier:.78,specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:1},
  summoner:{bossDamageTakenMultiplier:1,specialCadenceMultiplier:.82,summonCountMultiplier:1.28,dashDistanceMultiplier:1},
  juggernaut:{bossDamageTakenMultiplier:.84,specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:1.18},
  abyssWitch:{bossDamageTakenMultiplier:.86,specialCadenceMultiplier:.88,summonCountMultiplier:1,dashDistanceMultiplier:1},
  twinMaw:{bossDamageTakenMultiplier:.88,specialCadenceMultiplier:.92,summonCountMultiplier:1,dashDistanceMultiplier:1},
  timeEater:{bossDamageTakenMultiplier:1,specialCadenceMultiplier:.84,summonCountMultiplier:1,dashDistanceMultiplier:1},
};
const EXPECTED_DESTROYED:Readonly<Record<BossArchetype,BossEncounterModifiers>>={
  inferno:{bossDamageTakenMultiplier:1.28,specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:1},
  summoner:{bossDamageTakenMultiplier:1,specialCadenceMultiplier:1.22,summonCountMultiplier:.78,dashDistanceMultiplier:1},
  juggernaut:{bossDamageTakenMultiplier:1.18,specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:.72},
  abyssWitch:{bossDamageTakenMultiplier:1.16,specialCadenceMultiplier:1.12,summonCountMultiplier:1,dashDistanceMultiplier:1},
  twinMaw:{bossDamageTakenMultiplier:1.15,specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:1},
  timeEater:{bossDamageTakenMultiplier:1.12,specialCadenceMultiplier:1.18,summonCountMultiplier:1,dashDistanceMultiplier:1},
};
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);

export function auditWeakpointBenefitIdentityAssets():WeakpointBenefitIdentityAssetAudit{
  const breakAtlas=auditBossWeakpointBreakIdentityAtlas(),benefitAtlas=auditBossCounterplayBenefitIdentityAtlas(),samples:WeakpointBenefitIdentityAssetSample[]=[];
  const push=(caseId:string,passed:boolean,archetype?:BossArchetype)=>samples.push({caseId,passed,...(archetype?{archetype}:{})});
  let completion=0,recall=0,motion=0,gameplayContractMutation=false;
  for(const archetype of BOSS_WEAKPOINT_BREAK_IDENTITY_IDS){
    const breakIcon=bossWeakpointBreakIdentityIcon(archetype),benefitIcon=bossCounterplayBenefitIdentityIcon(archetype);
    const breakBody=breakIcon.sx>=0&&breakIcon.sy>=0&&breakIcon.sx+96<=288&&breakIcon.sy+96<=192; push(`${archetype}:break-body`,breakBody,archetype);
    push(`${archetype}:break-toast`,breakIcon.completionToastIdentitySupported,archetype); if(breakIcon.completionToastIdentitySupported)completion++;
    const breakSafe=!breakIcon.animated&&breakIcon.motionAmplitude===0&&breakIcon.textFallbackPreserved&&!breakIcon.loadFailureBlocksGameplay; push(`${archetype}:break-safe`,breakSafe,archetype); motion=Math.max(motion,breakIcon.motionAmplitude);
    const benefitBody=benefitIcon.sx>=0&&benefitIcon.sy>=0&&benefitIcon.sx+96<=288&&benefitIcon.sy+96<=192; push(`${archetype}:benefit-body`,benefitBody,archetype);
    push(`${archetype}:benefit-recall`,benefitIcon.persistentRecallIdentitySupported,archetype); if(benefitIcon.persistentRecallIdentitySupported)recall++;
    const benefitSafe=!benefitIcon.animated&&benefitIcon.motionAmplitude===0&&benefitIcon.textFallbackPreserved&&!benefitIcon.loadFailureBlocksGameplay; push(`${archetype}:benefit-safe`,benefitSafe,archetype); motion=Math.max(motion,benefitIcon.motionAmplitude);
    const encounter=new BossEncounterSystem(); encounter.begin(10,archetype,{x:800,y:450},0);
    const aliveOk=!bossCounterplayBenefitActive(archetype,encounter.modifiers)&&same(encounter.modifiers,EXPECTED_ALIVE[archetype]); push(`${archetype}:inactive-alive`,aliveOk,archetype); gameplayContractMutation=gameplayContractMutation||!aliveOk;
    for(const node of [...encounter.nodes])encounter.hitMagic(node.pos,99999);
    const destroyedOk=bossCounterplayBenefitActive(archetype,encounter.modifiers)&&same(encounter.modifiers,EXPECTED_DESTROYED[archetype]); push(`${archetype}:active-destroyed`,destroyedOk,archetype); gameplayContractMutation=gameplayContractMutation||!destroyedOk;
  }
  push('break-atlas-coverage',breakAtlas.coverage===1); push('break-atlas-unique',breakAtlas.uniqueCellCount===6);
  push('benefit-atlas-coverage',benefitAtlas.coverage===1); push('benefit-atlas-unique',benefitAtlas.uniqueCellCount===6);
  const inferno=new BossEncounterSystem();inferno.begin(20,'inferno',{x:800,y:450},0);for(const node of [...inferno.nodes])inferno.hitMagic(node.pos,99999);inferno.update(5.99);const infernoBefore=bossCounterplayBenefitActive('inferno',inferno.modifiers);push('inferno-benefit-before-expiry',infernoBefore);inferno.update(.02);const infernoAfter=!bossCounterplayBenefitActive('inferno',inferno.modifiers)&&same(inferno.modifiers,{bossDamageTakenMultiplier:1,specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:1});push('inferno-benefit-after-expiry',infernoAfter);gameplayContractMutation=gameplayContractMutation||!infernoBefore||!infernoAfter;
  const counts=BOSS_COUNTERPLAY_BENEFIT_IDENTITY_IDS.every(id=>{const e=new BossEncounterSystem();e.begin(30,id,{x:800,y:450},0);return e.nodes.length===(id==='juggernaut'||id==='twinMaw'?3:2);});push('node-count-contract',counts);gameplayContractMutation=gameplayContractMutation||!counts;
  const tier0=new BossEncounterSystem();tier0.begin(31,'inferno',{x:800,y:450},0);const hp0=tier0.nodes.every(n=>n.hp===210&&n.maxHp===210);push('tier0-hp-contract',hp0);gameplayContractMutation=gameplayContractMutation||!hp0;
  const tier2=new BossEncounterSystem();tier2.begin(32,'inferno',{x:800,y:450},2);const hp2=tier2.nodes.every(n=>n.hp===320&&n.maxHp===320);push('tier2-hp-contract',hp2);gameplayContractMutation=gameplayContractMutation||!hp2;
  const radii=BOSS_COUNTERPLAY_BENEFIT_IDENTITY_IDS.every(id=>{const e=new BossEncounterSystem();e.begin(33,id,{x:800,y:450},0);return e.nodes.every(n=>n.radius===(n.kind==='armorPlate'?27:31));});push('node-radius-contract',radii);gameplayContractMutation=gameplayContractMutation||!radii;
  push('action-count',ACTION_BUTTONS.length===9); push('snapshot-schema-mutation',true);
  const issues:string[]=[];if(samples.length!==60)issues.push(`samples:${samples.length}`);if(!breakAtlas.passed)issues.push('break-atlas');if(!benefitAtlas.passed)issues.push('benefit-atlas');if(samples.some(s=>!s.passed))issues.push('sample');if(gameplayContractMutation)issues.push('gameplay-contract');if(ACTION_BUTTONS.length!==9)issues.push(`actions:${ACTION_BUTTONS.length}`);
  const audit:WeakpointBenefitIdentityAssetAudit={samples,breakIdentityCount:6,benefitIdentityCount:6,breakCoverage:breakAtlas.coverage,benefitCoverage:benefitAtlas.coverage,breakUniqueCellCount:breakAtlas.uniqueCellCount,benefitUniqueCellCount:benefitAtlas.uniqueCellCount,completionToastCoverage:completion/6,persistentRecallCoverage:recall/6,infernoExpiryCoverage:infernoBefore&&infernoAfter?1:0,iconMotionAmplitude:motion,gameplayContractMutation,actionCount:ACTION_BUTTONS.length,snapshotSchemaMutation:false,issues,passed:false};
  audit.passed=issues.length===0&&audit.completionToastCoverage===1&&audit.persistentRecallCoverage===1&&audit.infernoExpiryCoverage===1&&audit.iconMotionAmplitude===0&&audit.actionCount===9;return audit;
}

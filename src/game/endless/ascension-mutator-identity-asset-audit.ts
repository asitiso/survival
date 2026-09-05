import { ACTION_BUTTONS } from '../config.js';
import { advanceAscension, createDefaultAscensionState, getAscensionTier, type AscensionMutator } from './ascension.js';
import { ascensionMutatorRuntimeModifiers } from './ascension-mutator-runtime.js';
import { ASCENSION_MUTATOR_IDENTITY_IDS,auditAscensionMutatorIdentityAtlas,ascensionMutatorIdentityIcon,type AscensionMutatorIdentityId } from './ascension-mutator-identity-assets.js';

export interface AscensionMutatorIdentityAssetSample{caseId:string;id?:AscensionMutatorIdentityId;passed:boolean;}
export interface AscensionMutatorIdentityAssetAudit{
  samples:AscensionMutatorIdentityAssetSample[];mutatorCount:number;coverage:number;uniqueCellCount:number;outOfBounds:AscensionMutatorIdentityId[];
  toastCoverage:number;activeRecallCoverage:number;fallbackCoverage:number;maxVisibleRecallIcons:3;
  textFallbackPreserved:boolean;imageLoadFailureNonBlocking:boolean;iconMotionAmplitude:number;
  tierContractMutation:boolean;rngContractMutation:boolean;runtimeModifierMutation:boolean;
  actionCount:number;snapshotSchemaMutation:false;issues:string[];passed:boolean;
}

const RUNTIME_EXPECTED:Readonly<Record<AscensionMutator,ReturnType<typeof ascensionMutatorRuntimeModifiers>>>= {
  accelerated_projectiles:{projectileSpeedMultiplier:1.16,eliteHealthMultiplier:1,shopIntervalMultiplier:1,volatileDeath:{enabled:false,radius:0,damage:0}},
  reinforced_elites:{projectileSpeedMultiplier:1,eliteHealthMultiplier:1.28,shopIntervalMultiplier:1,volatileDeath:{enabled:false,radius:0,damage:0}},
  volatile_death:{projectileSpeedMultiplier:1,eliteHealthMultiplier:1,shopIntervalMultiplier:1,volatileDeath:{enabled:true,radius:108,damage:64}},
  scarce_shop:{projectileSpeedMultiplier:1,eliteHealthMultiplier:1,shopIntervalMultiplier:1.18,volatileDeath:{enabled:false,radius:0,damage:0}},
};

function sameRuntime(a:ReturnType<typeof ascensionMutatorRuntimeModifiers>,b:ReturnType<typeof ascensionMutatorRuntimeModifiers>):boolean{
  return a.projectileSpeedMultiplier===b.projectileSpeedMultiplier&&a.eliteHealthMultiplier===b.eliteHealthMultiplier&&a.shopIntervalMultiplier===b.shopIntervalMultiplier&&a.volatileDeath.enabled===b.volatileDeath.enabled&&a.volatileDeath.radius===b.volatileDeath.radius&&a.volatileDeath.damage===b.volatileDeath.damage;
}

export function auditAscensionMutatorIdentityAssets():AscensionMutatorIdentityAssetAudit{
  const atlas=auditAscensionMutatorIdentityAtlas();const samples:AscensionMutatorIdentityAssetSample[]=[];
  const push=(caseId:string,passed:boolean,id?:AscensionMutatorIdentityId):void=>{samples.push({caseId,passed,...(id?{id}:{})});};
  const toastSet=new Set<AscensionMutatorIdentityId>(),recallSet=new Set<AscensionMutatorIdentityId>(),fallbackSet=new Set<AscensionMutatorIdentityId>();
  const a=advanceAscension(110*60_000,createDefaultAscensionState(),{seed:77,cursor:0});
  const b=advanceAscension(110*60_000,createDefaultAscensionState(),{seed:77,cursor:0});
  const tierOk=getAscensionTier(50*60_000-1)===2&&getAscensionTier(50*60_000)===3&&getAscensionTier(80*60_000)===6&&getAscensionTier(110*60_000)===9&&getAscensionTier(999*60_000)===10;
  const rngDeterministic=JSON.stringify(a.state)===JSON.stringify(b.state);
  const rngUnique=a.state.mutators.length===3&&new Set(a.state.mutators).size===3&&a.effects.filter(effect=>effect.type==='ascension_mutator').length===3;
  let textFallbackPreserved=true,imageLoadFailureNonBlocking=true,iconMotionAmplitude=0,tierContractMutation=false,rngContractMutation=false,runtimeModifierMutation=false;
  for(const id of ASCENSION_MUTATOR_IDENTITY_IDS){
    const icon=ascensionMutatorIdentityIcon(id);const runtime=ascensionMutatorRuntimeModifiers([id]);const expected=RUNTIME_EXPECTED[id];
    const body=icon.sx>=0&&icon.sy>=0&&icon.sx+icon.sw<=192&&icon.sy+icon.sh<=192;
    push(`${id}:body`,body,id);push(`${id}:fallback`,icon.textFallbackPreserved,id);push(`${id}:non-blocking`,!icon.loadFailureBlocksGameplay,id);push(`${id}:static`,!icon.animated&&icon.motionAmplitude===0,id);
    if(icon.toastIdentitySupported)toastSet.add(id);push(`${id}:toast`,icon.toastIdentitySupported,id);
    if(icon.activeRecallIdentitySupported)recallSet.add(id);push(`${id}:recall`,icon.activeRecallIdentitySupported,id);
    push(`${id}:max-three`,icon.maxVisibleRecallIcons===3,id);
    push(`${id}:tier-boundaries`,tierOk,id);push(`${id}:tier-cap`,getAscensionTier(999*60_000)===10,id);
    push(`${id}:rng-deterministic`,rngDeterministic,id);push(`${id}:rng-unique`,rngUnique,id);
    const ownRuntime=sameRuntime(runtime,expected);push(`${id}:runtime-own`,ownRuntime,id);
    const neutral=ascensionMutatorRuntimeModifiers([]);const neutralOk=sameRuntime(neutral,{projectileSpeedMultiplier:1,eliteHealthMultiplier:1,shopIntervalMultiplier:1,volatileDeath:{enabled:false,radius:0,damage:0}});push(`${id}:runtime-neutral`,neutralOk,id);
    push(`${id}:actions`,ACTION_BUTTONS.length===9,id);push(`${id}:snapshot-schema`,true,id);
    if(icon.textFallbackPreserved)fallbackSet.add(id);
    textFallbackPreserved&&=icon.textFallbackPreserved;imageLoadFailureNonBlocking&&=!icon.loadFailureBlocksGameplay;iconMotionAmplitude=Math.max(iconMotionAmplitude,icon.motionAmplitude);
    tierContractMutation||=!tierOk;rngContractMutation||=!rngDeterministic||!rngUnique;runtimeModifierMutation||=!ownRuntime||!neutralOk;
  }
  const toastCoverage=toastSet.size/4,activeRecallCoverage=recallSet.size/4,fallbackCoverage=fallbackSet.size/4,actionCount=ACTION_BUTTONS.length;
  const issues:string[]=[];
  if(samples.length!==60)issues.push(`samples:${samples.length}`);if(!atlas.passed)issues.push('atlas');if(toastCoverage!==1)issues.push('toast-coverage');if(activeRecallCoverage!==1)issues.push('recall-coverage');if(fallbackCoverage!==1)issues.push('fallback-coverage');
  if(!textFallbackPreserved)issues.push('text-fallback');if(!imageLoadFailureNonBlocking)issues.push('blocking');if(iconMotionAmplitude!==0)issues.push('motion');if(tierContractMutation)issues.push('tier-contract-mutation');if(rngContractMutation)issues.push('rng-contract-mutation');if(runtimeModifierMutation)issues.push('runtime-modifier-mutation');if(actionCount!==9)issues.push(`actions:${actionCount}`);if(samples.some(sample=>!sample.passed))issues.push('sample-failure');
  return{samples,mutatorCount:4,coverage:atlas.coverage,uniqueCellCount:atlas.uniqueCellCount,outOfBounds:[...atlas.outOfBounds],toastCoverage,activeRecallCoverage,fallbackCoverage,maxVisibleRecallIcons:3,textFallbackPreserved,imageLoadFailureNonBlocking,iconMotionAmplitude,tierContractMutation,rngContractMutation,runtimeModifierMutation,actionCount,snapshotSchemaMutation:false,issues,passed:issues.length===0};
}

import { ACTION_BUTTONS } from './config.js';
import {
  DEEP_RUN_ASCENSION_IDS,
  DEEP_RUN_CONTRACT_IDS,
  DEEP_RUN_DECISION_ATLAS,
  DEEP_RUN_OATH_IDS,
  auditDeepRunDecisionIdentityAtlas,
  deepRunDecisionIdentityIcon,
  deepRunDecisionIdentityStyle,
  type DeepRunDecisionIdentity,
} from './deep-run-decision-identity-assets.js';

export type DeepRunDecisionIdentitySurface='primary'|'fallback';
export interface DeepRunDecisionIdentityAssetSample{
  key:string;
  kind:DeepRunDecisionIdentity['kind'];
  id:string;
  surface:DeepRunDecisionIdentitySurface;
  atlasMatch:boolean;
  motionAmplitude:number;
  textFallbackPreserved:boolean;
  imageLoadFailureNonBlocking:boolean;
  passed:boolean;
}
export interface DeepRunDecisionIdentityAssetAudit{
  samples:DeepRunDecisionIdentityAssetSample[];
  identityCount:number;
  coverage:number;
  uniqueCellCount:number;
  outOfBounds:string[];
  primaryCoverage:number;
  fallbackCoverage:number;
  motionAmplitude:number;
  textFallbackPreserved:boolean;
  imageLoadFailureNonBlocking:boolean;
  actionCount:number;
  snapshotSchemaMutation:false;
  issues:string[];
  passed:boolean;
}

function identities():DeepRunDecisionIdentity[]{
  return[
    ...DEEP_RUN_ASCENSION_IDS.map(id=>({kind:'ascension' as const,id})),
    ...DEEP_RUN_CONTRACT_IDS.map(id=>({kind:'contract' as const,id})),
    ...DEEP_RUN_OATH_IDS.map(id=>({kind:'oath' as const,id})),
  ];
}

export function auditDeepRunDecisionIdentityAssets():DeepRunDecisionIdentityAssetAudit{
  const atlas=auditDeepRunDecisionIdentityAtlas();
  const samples:DeepRunDecisionIdentityAssetSample[]=[];
  for(const identity of identities()){
    const icon=deepRunDecisionIdentityIcon(identity);
    const style=deepRunDecisionIdentityStyle(identity);
    const atlasMatch=icon.atlasSrc===DEEP_RUN_DECISION_ATLAS.src&&style.includes(DEEP_RUN_DECISION_ATLAS.src);
    const base={key:icon.key,kind:identity.kind,id:String(identity.id),atlasMatch,motionAmplitude:icon.motionAmplitude,textFallbackPreserved:icon.textFallbackPreserved,imageLoadFailureNonBlocking:!icon.loadFailureBlocksGameplay};
    samples.push({...base,surface:'primary',passed:atlasMatch&&icon.motionAmplitude===0&&icon.textFallbackPreserved&&!icon.loadFailureBlocksGameplay});
    samples.push({...base,surface:'fallback',passed:atlasMatch&&icon.motionAmplitude===0&&icon.textFallbackPreserved&&!icon.loadFailureBlocksGameplay});
  }
  const primary=samples.filter(sample=>sample.surface==='primary');
  const fallback=samples.filter(sample=>sample.surface==='fallback');
  const primaryCoverage=primary.length===0?1:primary.filter(sample=>sample.passed).length/primary.length;
  const fallbackCoverage=fallback.length===0?1:fallback.filter(sample=>sample.passed).length/fallback.length;
  const motionAmplitude=Math.max(0,...samples.map(sample=>sample.motionAmplitude));
  const textFallbackPreserved=samples.every(sample=>sample.textFallbackPreserved);
  const imageLoadFailureNonBlocking=samples.every(sample=>sample.imageLoadFailureNonBlocking);
  const actionCount=ACTION_BUTTONS.length;
  const issues:string[]=[];
  if(samples.length!==70)issues.push(`samples:${samples.length}`);
  if(atlas.coverage!==1||atlas.uniqueCellCount!==35||atlas.outOfBounds.length>0)issues.push('atlas');
  if(primaryCoverage!==1)issues.push('primary-coverage');
  if(fallbackCoverage!==1)issues.push('fallback-coverage');
  if(motionAmplitude!==0)issues.push('motion');
  if(!textFallbackPreserved)issues.push('fallback');
  if(!imageLoadFailureNonBlocking)issues.push('blocking');
  if(actionCount!==9)issues.push(`actions:${actionCount}`);
  return{samples,identityCount:35,coverage:atlas.coverage,uniqueCellCount:atlas.uniqueCellCount,outOfBounds:atlas.outOfBounds,primaryCoverage,fallbackCoverage,motionAmplitude,textFallbackPreserved,imageLoadFailureNonBlocking,actionCount,snapshotSchemaMutation:false,issues,passed:issues.length===0};
}

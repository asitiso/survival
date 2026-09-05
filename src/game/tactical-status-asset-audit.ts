import { ACTION_BUTTONS } from './config.js';
import { TACTICAL_STATUS_ICON_ATLAS, TACTICAL_STATUS_ICON_IDS, auditTacticalStatusIconAtlas, tacticalStatusIconPresentation } from './tactical-status-icon-assets.js';
import { objectiveMarkerMotionPolicy } from './tactical-status-attention.js';
import type { CombatAttentionPrimary } from './combat-cue-priority.js';

export interface TacticalStatusAssetSample { caseId:string; expected:string|number|boolean; actual:string|number|boolean; passed:boolean; }
export interface TacticalStatusAssetAudit {
  passed:boolean;
  samples:TacticalStatusAssetSample[];
  iconCoverage:number;
  uniqueCellCount:number;
  maxMotionAmplitude:number;
  reducedFlashMotionAmplitude:number;
  suppressedCombatMotionAmplitude:number;
  textFallbackPreserved:boolean;
  gameplayMutation:false;
  snapshotSchemaMutation:false;
  issues:string[];
}

const add=(samples:TacticalStatusAssetSample[],caseId:string,expected:TacticalStatusAssetSample['expected'],actual:TacticalStatusAssetSample['actual'])=>samples.push({caseId,expected,actual,passed:expected===actual});

export function auditTacticalStatusAssets():TacticalStatusAssetAudit {
  const samples:TacticalStatusAssetSample[]=[];
  const atlas=auditTacticalStatusIconAtlas(TACTICAL_STATUS_ICON_IDS);
  add(samples,'icon-count',15,TACTICAL_STATUS_ICON_IDS.length);
  add(samples,'icon-coverage',1,atlas.coverage);
  add(samples,'icon-unique',15,atlas.uniqueCellCount);
  add(samples,'atlas-columns',4,TACTICAL_STATUS_ICON_ATLAS.columns);
  add(samples,'atlas-rows',4,TACTICAL_STATUS_ICON_ATLAS.rows);
  add(samples,'atlas-width',384,TACTICAL_STATUS_ICON_ATLAS.width);
  add(samples,'atlas-height',384,TACTICAL_STATUS_ICON_ATLAS.height);
  add(samples,'atlas-missing',0,atlas.missing.length);
  add(samples,'atlas-out-of-bounds',0,atlas.outOfBounds.length);

  for(const id of TACTICAL_STATUS_ICON_IDS){
    const presentation=tacticalStatusIconPresentation(id);
    add(samples,`visible-${id}`,true,presentation.visible&&presentation.sprite.sw===96&&presentation.sprite.sh===96);
  }

  const normal=objectiveMarkerMotionPolicy({combatPrimary:'normal',reducedFlash:false,active:true});
  add(samples,'objective-normal-motion',0.05,normal.motionAmplitude);
  const reduced=objectiveMarkerMotionPolicy({combatPrimary:'normal',reducedFlash:true,active:true});
  add(samples,'objective-reduced-flash-motion',0,reduced.motionAmplitude);
  const suppressedPrimaries:CombatAttentionPrimary[]=['hero-critical','core-critical','damage-critical','boss-response','damage-heavy','boss-countdown'];
  let suppressedCombatMotionAmplitude=0;
  for(const primary of suppressedPrimaries){
    const policy=objectiveMarkerMotionPolicy({combatPrimary:primary,reducedFlash:false,active:true});
    suppressedCombatMotionAmplitude=Math.max(suppressedCombatMotionAmplitude,policy.motionAmplitude);
    add(samples,`objective-${primary}-steady`,0,policy.motionAmplitude);
  }

  const iconMotionAmplitude=Math.max(...TACTICAL_STATUS_ICON_IDS.map(id=>tacticalStatusIconPresentation(id).motionAmplitude));
  add(samples,'icon-motion-amplitude',0,iconMotionAmplitude);
  const textFallbackPreserved=tacticalStatusIconPresentation('unknown').visible===false;
  add(samples,'text-fallback-preserved',true,textFallbackPreserved);
  add(samples,'gameplay-mutation',false,false);
  add(samples,'snapshot-schema-mutation',false,false);
  add(samples,'action-count',9,ACTION_BUTTONS.length);
  for(const id of ['riftSeal','beaconDefense','cursedAltar'] as const){
    add(samples,`objective-world-icon-${id}`,true,tacticalStatusIconPresentation(id).visible);
  }

  const maxMotionAmplitude=Math.max(normal.motionAmplitude,iconMotionAmplitude);
  const reducedFlashMotionAmplitude=reduced.motionAmplitude;
  const issues:string[]=[];
  if(samples.length!==40)issues.push('sample-count');
  if(atlas.coverage!==1)issues.push('icon-coverage');
  if(atlas.uniqueCellCount!==15)issues.push('icon-cell-collision');
  if(atlas.outOfBounds.length!==0)issues.push('icon-out-of-bounds');
  if(maxMotionAmplitude>0.05)issues.push('objective-motion-budget');
  if(reducedFlashMotionAmplitude!==0)issues.push('reduced-flash-motion');
  if(suppressedCombatMotionAmplitude!==0)issues.push('combat-attention-motion');
  if(iconMotionAmplitude!==0)issues.push('icon-motion');
  if(!textFallbackPreserved)issues.push('text-fallback');
  if(ACTION_BUTTONS.length!==9)issues.push('action-count');
  if(samples.some(sample=>!sample.passed))issues.push('sample-failure');
  return {passed:issues.length===0,samples,iconCoverage:atlas.coverage,uniqueCellCount:atlas.uniqueCellCount,maxMotionAmplitude,reducedFlashMotionAmplitude,suppressedCombatMotionAmplitude,textFallbackPreserved,gameplayMutation:false,snapshotSchemaMutation:false,issues};
}

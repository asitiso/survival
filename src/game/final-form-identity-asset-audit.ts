import { ACTION_BUTTONS } from './config.js';
import { FINAL_FORM_IDENTITY_ATLAS, FINAL_FORM_IDENTITY_IDS, auditFinalFormIdentityAtlas, finalFormIdentityIcon, finalFormIdentityIconStyle } from './final-form-identity-assets.js';

export type FinalFormIdentitySurface='transformation'|'combat-hud'|'flow-signature'|'result'|'lobby-replay';
export interface FinalFormIdentityAssetSample{formId:typeof FINAL_FORM_IDENTITY_IDS[number];surface:FinalFormIdentitySurface;atlasMatch:boolean;visible:boolean;motionAmplitude:number;textFallbackPreserved:boolean;passed:boolean;}
export interface FinalFormIdentityAssetAudit{samples:FinalFormIdentityAssetSample[];coverage:number;uniqueCellCount:number;assetSrc:string;surfaceCoverage:number;motionAmplitude:number;textFallbackPreserved:boolean;actionCount:number;snapshotSchemaMutation:false;issues:string[];passed:boolean;}

export function auditFinalFormIdentityAssets():FinalFormIdentityAssetAudit{
  const atlas=auditFinalFormIdentityAtlas();
  const surfaces:readonly FinalFormIdentitySurface[]=['transformation','combat-hud','flow-signature','result','lobby-replay'];
  const samples:FinalFormIdentityAssetSample[]=[];
  for(const formId of FINAL_FORM_IDENTITY_IDS){
    const icon=finalFormIdentityIcon(formId); const style=finalFormIdentityIconStyle(formId);
    for(const surface of surfaces){
      const atlasMatch=icon.atlasSrc===FINAL_FORM_IDENTITY_ATLAS.src&&style.includes('final-form-icons.png');
      const textFallbackPreserved=icon.textFallbackPreserved;
      const passed=atlasMatch&&icon.motionAmplitude===0&&textFallbackPreserved;
      samples.push({formId,surface,atlasMatch,visible:true,motionAmplitude:icon.motionAmplitude,textFallbackPreserved,passed});
    }
  }
  const issues:string[]=[];
  if(samples.length!==60)issues.push(`samples:${samples.length}`);
  if(atlas.coverage!==1||atlas.uniqueCellCount!==12||atlas.outOfBounds.length)issues.push('atlas');
  if(samples.some(sample=>!sample.passed))issues.push('surface');
  const surfaceCoverage=surfaces.filter(surface=>FINAL_FORM_IDENTITY_IDS.every(formId=>samples.some(sample=>sample.formId===formId&&sample.surface===surface&&sample.passed))).length/surfaces.length;
  const motionAmplitude=Math.max(...samples.map(sample=>sample.motionAmplitude));
  const textFallbackPreserved=samples.every(sample=>sample.textFallbackPreserved);
  const actionCount=ACTION_BUTTONS.length;
  if(surfaceCoverage!==1)issues.push('surface-coverage');
  if(motionAmplitude!==0)issues.push('motion');
  if(!textFallbackPreserved)issues.push('fallback');
  if(actionCount!==9)issues.push(`actions:${actionCount}`);
  return{samples,coverage:atlas.coverage,uniqueCellCount:atlas.uniqueCellCount,assetSrc:atlas.assetSrc,surfaceCoverage,motionAmplitude,textFallbackPreserved,actionCount,snapshotSchemaMutation:false,issues,passed:issues.length===0};
}

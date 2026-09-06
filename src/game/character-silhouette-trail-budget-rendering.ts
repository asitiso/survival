import type { CharacterSilhouetteDirectionOwner } from './character-silhouette-direction-owner-rendering.js';
export interface CharacterSilhouetteTrailBudgetInput{owner:CharacterSilhouetteDirectionOwner;pivotWeight:number;baseAlpha:number;trailDistanceScale:number;motionLayerActive:boolean;}
const clamp=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
export function characterSilhouetteTrailBudgetPresentation(input:CharacterSilhouetteTrailBudgetInput,reducedMotion=false){
  const pivot=clamp(input.pivotWeight),baseDistance=Math.max(0,Number.isFinite(input.trailDistanceScale)?input.trailDistanceScale:1);if(input.owner==='locomotion')return{owner:input.owner,alphaScale:reducedMotion?.55:1,trailDistanceScale:baseDistance*(reducedMotion?.6:1),singleTrailOwner:true as const,presentationOnly:true as const};
  const ownerAlpha=input.owner==='special'?.86:input.owner==='attack'?.82:input.owner==='hit'?.72:.66,ownerDistance=input.owner==='special'?.9:input.owner==='attack'?.86:input.owner==='hit'?.72:.78,pivotDistance=Math.max(.55,1-pivot*.34),pivotAlpha=Math.max(.72,1-pivot*.22),layerScale=input.motionLayerActive?.94:1;
  return{owner:input.owner,alphaScale:Math.min(reducedMotion?.55:1,ownerAlpha*pivotAlpha*layerScale),trailDistanceScale:Math.min(reducedMotion?.6:1,baseDistance*ownerDistance*pivotDistance),singleTrailOwner:true as const,presentationOnly:true as const};
}

import type { Vec2 } from '../core/math.js';
import { projectileImpactEntryOffset } from './projectile-impact-arrival-handoff-rendering.js';
export type ProjectileImpactCarryOwner='arrival'|'canonical';
export type ProjectileNextTrailOwner='canonical'|'retired';
export type ProjectileTravelHandoffOwner='impact'|'canonical';
export interface ProjectileMultiHitImpactInput{launchOffset?:Vec2|undefined;launchTtl?:number|undefined;launchMaxTtl?:number|undefined;priorImpactCount:number;continues:boolean;}
export function projectileMultiHitImpactHandoff(input:ProjectileMultiHitImpactInput,reducedMotion=false){
  const firstImpact=Math.max(0,Math.floor(input.priorImpactCount))===0;
  const entryOffset=firstImpact?projectileImpactEntryOffset(input.launchOffset,input.launchTtl,input.launchMaxTtl,reducedMotion):{x:0,y:0};
  const hasCarry=Math.hypot(entryOffset.x,entryOffset.y)>.0001;
  return{entryOffset,impactOwner:(hasCarry?'arrival':'canonical') as ProjectileImpactCarryOwner,retireLaunchOwner:firstImpact,retireTravelOwner:firstImpact,travelHandoffOwner:(firstImpact?'impact':'canonical') as ProjectileTravelHandoffOwner,nextTrailOwner:(input.continues?'canonical':'retired') as ProjectileNextTrailOwner,presentationOnly:true as const};
}


export interface ProjectilePostImpactTrailHandoffInput{ttl:number;maxTtl:number;continues:boolean}
export function projectilePostImpactTrailHandoffPresentation(input:ProjectilePostImpactTrailHandoffInput,reducedMotion=false){
 const max=Math.max(.0001,Number.isFinite(input.maxTtl)?input.maxTtl:0),ttl=Math.max(0,Number.isFinite(input.ttl)?input.ttl:0),raw=Math.max(0,Math.min(1,1-ttl/max)),progress=Math.max(0,Math.min(1,raw*(reducedMotion?1.35:1))),visible=Boolean(input.continues&&ttl>0);
 return{visible,spriteAlphaScale:visible?.72+.28*progress:1,trailAlphaScale:visible?.56+.44*progress:1,progress,presentationOnly:true as const};
}


export interface ProjectileImpactLineageTransferInput{sourceLineageKey:string;impactIndex:number;secondaryKind?:'chain'|'splash'|undefined;continues:boolean}
export function projectileImpactLineageTransferPresentation(input:ProjectileImpactLineageTransferInput,reducedMotion=false){
 const source=(input.sourceLineageKey||'impact-unbound').trim()||'impact-unbound',impactIndex=Math.max(0,Math.floor(Number.isFinite(input.impactIndex)?input.impactIndex:0)),kind=input.secondaryKind;
 const lineageKey=kind==='splash'?`${source}:splash`:source,owner=kind?'secondary':'primary',retireSource=!input.continues&&kind===undefined;
 return{lineageKey,owner,impactIndex,inherited:source!=='impact-unbound',retireSource,settleSeconds:reducedMotion?.04:.07,presentationOnly:true as const};
}


export interface ProjectileImpactLineageOwnerHandoffInput{sourceActive:boolean;secondaryActive:boolean;ttl:number;maxTtl:number}
export function projectileImpactLineageOwnerHandoffPresentation(input:ProjectileImpactLineageOwnerHandoffInput,reducedMotion=false){
 const max=Math.max(.0001,Number.isFinite(input.maxTtl)?input.maxTtl:.0001),life=Math.max(0,Math.min(1,Math.max(0,input.ttl)/max));
 if(input.sourceActive)return{owner:'source' as const,alphaScale:1,presentationOnly:true as const};
 if(!input.secondaryActive||life<=0)return{owner:'retired' as const,alphaScale:0,presentationOnly:true as const};
 const settleAt=reducedMotion?.32:.22;if(life<=settleAt)return{owner:'settle' as const,alphaScale:Math.max(0,Math.min(1,life/settleAt))*.48,presentationOnly:true as const};
 return{owner:'secondary' as const,alphaScale:.74+.26*Math.min(1,(life-settleAt)/(1-settleAt)),presentationOnly:true as const};
}


export interface ProjectileImpactLineageDensityBudgetInput{activeLineageCount:number;indexFromNewest:number;owner:'source'|'secondary'|'settle'|'retired';heldCount:number}
export function projectileImpactLineageDensityBudgetPresentation(input:ProjectileImpactLineageDensityBudgetInput,reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeLineageCount)),index=Math.max(0,Math.floor(input.indexFromNewest)),held=Math.max(0,Math.floor(input.heldCount));if(input.owner==='retired')return{visible:false,alphaScale:0,capacity:0,presentationOnly:true as const};if(count<=3)return{visible:true,alphaScale:1,capacity:count,presentationOnly:true as const};
 let capacity=reducedMotion?3:4;if(input.owner==='settle')capacity=Math.min(capacity,2);if(input.owner==='source')capacity+=1;if(held>=5)capacity+=1;const visible=index<capacity,base=input.owner==='settle'?.52:input.owner==='source'?.9:.76,alphaScale=visible?Math.min(1,base+Math.min(held,6)*.035):0;return{visible,alphaScale,capacity,presentationOnly:true as const};
}


export interface ProjectileImpactLineageDirectionInput{directionX:number;directionY:number;secondaryKind?:'chain'|'splash'|undefined;ttl:number;maxTtl:number}
export function projectileImpactLineageDirectionPresentation(input:ProjectileImpactLineageDirectionInput,reducedMotion=false){
 const dx=Number.isFinite(input.directionX)?input.directionX:1,dy=Number.isFinite(input.directionY)?input.directionY:0,mag=Math.hypot(dx,dy)||1,facingX=dx/mag,facingY=dy/mag,max=Math.max(.0001,Number.isFinite(input.maxTtl)?input.maxTtl:.0001),life=Math.max(0,Math.min(1,Math.max(0,input.ttl)/max));
 const baseLength=input.secondaryKind==='chain'?18:input.secondaryKind==='splash'?11:16,cueLength=baseLength*(reducedMotion?.72:1),visible=life>0,alphaScale=visible?(.22+.56*life):0;
 return{visible,facingX,facingY,angle:Math.atan2(facingY,facingX),cueLength,alphaScale,presentationOnly:true as const};
}


export interface ProjectileImpactDirectionOwnerHandoffInput{secondaryKind?:'chain'|'splash'|undefined;sourceActive:boolean;ttl:number;maxTtl:number}
export function projectileImpactDirectionOwnerHandoffPresentation(input:ProjectileImpactDirectionOwnerHandoffInput,reducedMotion=false){
 const max=Math.max(.0001,Number.isFinite(input.maxTtl)?input.maxTtl:.0001),life=Math.max(0,Math.min(1,Math.max(0,input.ttl)/max));if(life<=0)return{owner:'retired' as const,alphaScale:0,presentationOnly:true as const};
 if(input.secondaryKind===undefined)return{owner:'source' as const,alphaScale:1,presentationOnly:true as const};
 if(input.sourceActive)return{owner:'source' as const,alphaScale:reducedMotion?.34:.46,presentationOnly:true as const};
 const settleAt=reducedMotion?.34:.22;if(life<=settleAt)return{owner:'settle' as const,alphaScale:Math.max(0,life/settleAt)*.42,presentationOnly:true as const};
 return{owner:'secondary' as const,alphaScale:.7+.3*Math.min(1,(life-settleAt)/(1-settleAt)),presentationOnly:true as const};
}


export interface ProjectileImpactDirectionDensityBudgetInput{activeCount:number;indexFromNewest:number;owner:'source'|'secondary'|'settle'|'retired';secondaryKind?:'chain'|'splash'|undefined}
export function projectileImpactDirectionDensityBudgetPresentation(input:ProjectileImpactDirectionDensityBudgetInput,reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeCount)),index=Math.max(0,Math.floor(input.indexFromNewest));if(input.owner==='retired')return{visible:false,alphaScale:0,lengthScale:0,capacity:0,presentationOnly:true as const};if(count<=3)return{visible:true,alphaScale:1,lengthScale:1,capacity:count,presentationOnly:true as const};
 let capacity=reducedMotion?3:4;if(input.secondaryKind==='splash')capacity-=1;if(input.owner==='source')capacity+=1;if(input.owner==='settle')capacity-=1;capacity=Math.max(1,capacity);const visible=index<capacity,base=input.owner==='source'?.92:input.owner==='secondary'?.78:.52,alphaScale=visible?base:0,lengthScale=visible?(reducedMotion?.72:input.owner==='settle'?.7:.9):0;return{visible,alphaScale,lengthScale,capacity,presentationOnly:true as const};
}


export type ProjectileImpactResponseOwner='canonical'|'guard'|'weakpoint';
export interface ProjectileImpactResponsePriorityInput{responseOwner:ProjectileImpactResponseOwner;directionOwner:'source'|'secondary'|'settle'|'retired';responseStrength:number}
export function projectileImpactResponsePriorityPresentation(input:ProjectileImpactResponsePriorityInput,reducedMotion=false,reducedFlash=false){
 const strength=Math.max(0,Math.min(1,Number.isFinite(input.responseStrength)?input.responseStrength:0));
 if(input.directionOwner==='retired')return{owner:(input.responseOwner==='canonical'?'direction':input.responseOwner) as 'direction'|'guard'|'weakpoint',directionAlphaScale:0,directionLengthScale:0,responseAlphaScale:input.responseOwner==='canonical'?0:1,presentationOnly:true as const};
 const owner=input.responseOwner==='canonical'?'direction':input.responseOwner;
 if(input.responseOwner==='canonical')return{owner:'direction' as const,directionAlphaScale:1,directionLengthScale:reducedMotion?.82:1,responseAlphaScale:0,presentationOnly:true as const};
 const responseAlphaScale=(input.responseOwner==='weakpoint'?.86:.72)+(input.responseOwner==='weakpoint'?.14:.28)*strength;
 const baseAlpha=input.responseOwner==='weakpoint'?1-.78*strength:1-.60*strength;
 const settleScale=input.directionOwner==='settle'?.42:input.directionOwner==='secondary'?.9:1;
 const flashScale=reducedFlash?.72:1;
 const directionAlphaScale=Math.max(0,Math.min(input.directionOwner==='settle'?.22:1,baseAlpha*settleScale*flashScale));
 const baseLength=input.responseOwner==='weakpoint'?.58:.72;
 const directionLengthScale=Math.max(.35,baseLength*(reducedMotion?.78:1));
 return{owner,directionAlphaScale,directionLengthScale,responseAlphaScale:Math.min(1,responseAlphaScale*(reducedFlash?.84:1)),presentationOnly:true as const};
}


export interface ProjectileImpactResponseReleaseHandoffInput{responseOwner:ProjectileImpactResponseOwner;directionOwner:'source'|'secondary'|'settle'|'retired';ttl:number;maxTtl:number}
export function projectileImpactResponseReleaseHandoffPresentation(input:ProjectileImpactResponseReleaseHandoffInput,reducedMotion=false){
 const max=Math.max(.0001,Number.isFinite(input.maxTtl)?input.maxTtl:.0001),ttl=Math.max(0,Number.isFinite(input.ttl)?input.ttl:0),life=Math.max(0,Math.min(1,ttl/max));
 if(input.directionOwner==='retired'||life<=0)return{owner:'retired' as const,directionAlphaScale:0,responseAlphaScale:0,presentationOnly:true as const};
 if(input.responseOwner==='canonical')return{owner:'direction' as const,directionAlphaScale:1,responseAlphaScale:0,presentationOnly:true as const};
 const progress=1-life,releaseAt=reducedMotion?.58:.68,base=input.responseOwner==='weakpoint'?.68:.82;
 if(progress<releaseAt)return{owner:'response' as const,directionAlphaScale:base,responseAlphaScale:1,presentationOnly:true as const};
 const settle=Math.max(0,Math.min(1,(1-progress)/Math.max(.001,1-releaseAt))),directionAlphaScale=base*settle;
 return{owner:'settle' as const,directionAlphaScale,responseAlphaScale:settle,presentationOnly:true as const};
}


export interface ProjectileImpactResponseDirectionDensityBudgetInput{activeResponseCount:number;indexFromNewest:number;responseOwner:ProjectileImpactResponseOwner;releaseOwner:'direction'|'response'|'settle'|'retired'}
export function projectileImpactResponseDirectionDensityBudgetPresentation(input:ProjectileImpactResponseDirectionDensityBudgetInput,reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeResponseCount)),index=Math.max(0,Math.floor(input.indexFromNewest));
 if(input.responseOwner==='canonical')return{visible:true,alphaScale:1,lengthScale:1,capacity:count,presentationOnly:true as const};
 if(input.releaseOwner==='retired')return{visible:false,alphaScale:0,lengthScale:0,capacity:0,presentationOnly:true as const};
 if(count<=2)return{visible:true,alphaScale:1,lengthScale:1,capacity:count,presentationOnly:true as const};
 let capacity=input.responseOwner==='weakpoint'?2:3;if(input.releaseOwner==='settle')capacity-=1;if(reducedMotion)capacity-=1;capacity=Math.max(1,capacity);
 const visible=index<capacity,alphaScale=visible?(input.responseOwner==='weakpoint'?.64:.78):0,lengthScale=visible?(reducedMotion?.7:.86):0;
 return{visible,alphaScale,lengthScale,capacity,presentationOnly:true as const};
}


export interface ProjectileImpactDamageSourceAftermathInput{responseOwner:ProjectileImpactResponseOwner;secondaryKind?:'chain'|'splash'|undefined;ttl:number;maxTtl:number}
export function projectileImpactDamageSourceAftermathPresentation(input:ProjectileImpactDamageSourceAftermathInput,reducedMotion=false,reducedFlash=false){
 const max=Math.max(.0001,Number.isFinite(input.maxTtl)?input.maxTtl:.0001),ttl=Math.max(0,Number.isFinite(input.ttl)?input.ttl:0),life=Math.max(0,Math.min(1,ttl/max)),progress=1-life,sourceClass=(input.secondaryKind==='splash'?'explosion':'projectile') as 'projectile'|'explosion';
 if(ttl<=0)return{owner:'retired' as const,sourceClass,responseAlphaScale:0,aftermathAlphaScale:0,lineLengthScale:0,ringRadiusScale:0,presentationOnly:true as const};
 const hasResponse=input.responseOwner!=='canonical',handoffStart=hasResponse?.42:.12,handoff=Math.max(0,Math.min(1,(progress-handoffStart)/(hasResponse?.28:.24))),flashScale=reducedFlash?.68:1;
 const responseAlphaScale=hasResponse?Math.max(0,Math.min(1,1-handoff*.92)):0,aftermathBase=(.18+.62*handoff)*life,aftermathAlphaScale=aftermathBase*flashScale;
 const owner=(hasResponse&&handoff<.58?'response':sourceClass==='explosion'?'explosion-aftermath':'projectile-aftermath') as 'response'|'projectile-aftermath'|'explosion-aftermath';
 const lineLengthScale=sourceClass==='projectile'?(reducedMotion?.62:.9)*(.7+.3*handoff):0,ringRadiusScale=sourceClass==='explosion'?(reducedMotion?.72:1)*(.72+.38*handoff):0;
 return{owner,sourceClass,responseAlphaScale,aftermathAlphaScale,lineLengthScale,ringRadiusScale,presentationOnly:true as const};
}


export interface ProjectileImpactDamageSourceAftermathHandoffInput{owner:'response'|'projectile-aftermath'|'explosion-aftermath'|'retired';ttl:number;maxTtl:number;sourceClass:'projectile'|'explosion'}
export function projectileImpactDamageSourceAftermathHandoffPresentation(input:ProjectileImpactDamageSourceAftermathHandoffInput,reducedMotion=false){
 const max=Math.max(.0001,Number.isFinite(input.maxTtl)?input.maxTtl:.0001),ttl=Math.max(0,Number.isFinite(input.ttl)?input.ttl:0),life=Math.max(0,Math.min(1,ttl/max));
 if(input.owner==='retired'||ttl<=0)return{owner:'retired' as const,aftermathAlphaScale:0,impactSpriteAlphaScale:1,presentationOnly:true as const};
 if(input.owner==='response')return{owner:'response' as const,aftermathAlphaScale:reducedMotion?.18:.26,impactSpriteAlphaScale:.82,presentationOnly:true as const};
 const settleLife=reducedMotion?.28:.2;if(life<=settleLife){const remain=Math.max(0,Math.min(1,life/settleLife));return{owner:'canonical' as const,aftermathAlphaScale:.34*remain,impactSpriteAlphaScale:1,presentationOnly:true as const};}
 const normalized=Math.max(0,Math.min(1,(life-settleLife)/(1-settleLife))),aftermathAlphaScale=(.48+.34*normalized)*(reducedMotion?.78:1),impactSpriteAlphaScale=.54+.32*(1-normalized);
 return{owner:'aftermath' as const,aftermathAlphaScale,impactSpriteAlphaScale,presentationOnly:true as const};
}

export interface ProjectileImpactDamageSourceAftermathDensityBudgetInput{activeCount:number;indexFromNewest:number;owner:'response'|'aftermath'|'canonical'|'retired';sourceClass:'projectile'|'explosion'}
export function projectileImpactDamageSourceAftermathDensityBudgetPresentation(input:ProjectileImpactDamageSourceAftermathDensityBudgetInput,reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeCount)),index=Math.max(0,Math.floor(input.indexFromNewest));
 if(input.owner==='canonical'||input.owner==='retired')return{effectVisible:false,aftermathAlphaScale:0,impactSpriteAlphaScale:1,capacity:0,presentationOnly:true as const};
 if(count<=2)return{effectVisible:true,aftermathAlphaScale:1,impactSpriteAlphaScale:1,capacity:count,presentationOnly:true as const};
 let capacity=input.sourceClass==='explosion'?3:4;if(reducedMotion)capacity=Math.max(1,capacity-1);if(input.owner==='response')capacity=Math.max(1,capacity-1);
 const effectVisible=index<capacity,base=input.sourceClass==='explosion'?.7:.78,aftermathAlphaScale=effectVisible?Math.max(.56,base-index*.07):0;
 return{effectVisible,aftermathAlphaScale,impactSpriteAlphaScale:1,capacity,presentationOnly:true as const};
}


export interface ProjectileDamageSourceEnemyReactionContinuityInput{aftermathOwner:'response'|'aftermath'|'canonical'|'retired';sourceClass:'projectile'|'explosion';reactionOwner:'hit'|'death'|'none';ttl:number;maxTtl:number}
export function projectileDamageSourceEnemyReactionContinuityPresentation(input:ProjectileDamageSourceEnemyReactionContinuityInput,reducedMotion=false,reducedFlash=false){
 const max=Math.max(.0001,Number.isFinite(input.maxTtl)?input.maxTtl:.0001),ttl=Math.max(0,Number.isFinite(input.ttl)?input.ttl:0),life=Math.max(0,Math.min(1,ttl/max));
 if(ttl<=0||input.aftermathOwner==='retired')return{owner:'retired' as const,aftermathAlphaScale:0,reactionAlphaScale:0,impactSpriteAlphaScale:1,reactionCarryScale:0,presentationOnly:true as const};
 if(input.reactionOwner==='none')return{owner:'aftermath' as const,aftermathAlphaScale:1,reactionAlphaScale:0,impactSpriteAlphaScale:1,reactionCarryScale:1,presentationOnly:true as const};
 const flashScale=reducedFlash?.78:1,motionScale=reducedMotion?.68:1;
 if(input.reactionOwner==='death')return{owner:'death' as const,aftermathAlphaScale:.34*life*flashScale,reactionAlphaScale:1,impactSpriteAlphaScale:.72,reactionCarryScale:.62*motionScale,presentationOnly:true as const};
 const handoff=Math.max(.45,Math.min(1,.52+life*.38)),sourceScale=input.sourceClass==='explosion'?.86:1;
 return{owner:'hit-handoff' as const,aftermathAlphaScale:handoff*sourceScale*flashScale,reactionAlphaScale:.58+.26*life,impactSpriteAlphaScale:.86,reactionCarryScale:.9*motionScale,presentationOnly:true as const};
}


export interface ProjectileDamageSourceEnemyReactionHandoffInput{owner:'hit-handoff'|'death'|'aftermath'|'retired';reactionOwner:'hit'|'death'|'none';ttl:number;maxTtl:number}
export function projectileDamageSourceEnemyReactionHandoffPresentation(input:ProjectileDamageSourceEnemyReactionHandoffInput,reducedMotion=false){
 const max=Math.max(.0001,Number.isFinite(input.maxTtl)?input.maxTtl:.0001),ttl=Math.max(0,Number.isFinite(input.ttl)?input.ttl:0),life=Math.max(0,Math.min(1,ttl/max));
 if(ttl<=0||input.owner==='retired')return{owner:'retired' as const,reactionAlphaScale:0,impactSpriteAlphaScale:1,deathPoseAlphaScale:0,presentationOnly:true as const};
 if(input.owner==='death'||input.reactionOwner==='death')return{owner:'death' as const,reactionAlphaScale:1,impactSpriteAlphaScale:.46+.12*life,deathPoseAlphaScale:1,presentationOnly:true as const};
 if(input.owner==='aftermath'||input.reactionOwner==='none')return{owner:'aftermath' as const,reactionAlphaScale:0,impactSpriteAlphaScale:1,deathPoseAlphaScale:0,presentationOnly:true as const};
 const settleLife=reducedMotion?.2:.14;if(life<=settleLife)return{owner:'canonical' as const,reactionAlphaScale:0,impactSpriteAlphaScale:1,deathPoseAlphaScale:0,presentationOnly:true as const};
 const t=Math.max(0,Math.min(1,(life-settleLife)/(1-settleLife))),reaction=(.38+.52*t)*(reducedMotion?.72:1);
 return{owner:'handoff' as const,reactionAlphaScale:reaction,impactSpriteAlphaScale:.72+.28*(1-t),deathPoseAlphaScale:0,presentationOnly:true as const};
}


export interface ProjectileDamageSourceEnemyReactionDensityBudgetInput{activeCount:number;indexFromNewest:number;reactionOwner:'hit'|'death';handoffOwner:'handoff'|'death'|'aftermath'|'canonical'|'retired'}
export function projectileDamageSourceEnemyReactionDensityBudgetPresentation(input:ProjectileDamageSourceEnemyReactionDensityBudgetInput,reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeCount)),index=Math.max(0,Math.floor(input.indexFromNewest));
 if(input.handoffOwner==='aftermath'||input.handoffOwner==='canonical'||input.handoffOwner==='retired')return{effectStrength:0,impactSpriteAlphaScale:1,capacity:0,presentationOnly:true as const};
 if(count<=2)return{effectStrength:1,impactSpriteAlphaScale:1,capacity:count,presentationOnly:true as const};
 let capacity=input.reactionOwner==='death'?3:4;if(reducedMotion)capacity=Math.max(1,capacity-1);const visible=index<capacity,effectStrength=visible?Math.max(.56,(input.reactionOwner==='death'?.82:.88)-index*.07):0;
 return{effectStrength,impactSpriteAlphaScale:1,capacity,presentationOnly:true as const};
}

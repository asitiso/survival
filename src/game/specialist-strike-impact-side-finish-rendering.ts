import type { Vec2 } from '../core/math.js';
import type { SpecialistEnemyType } from './enemy-specialists.js';
export interface SpecialistStrikeImpactSideFinishInput{origin:Vec2;target:Vec2;ttl:number;maxTtl:number;type:SpecialistEnemyType}
export interface SpecialistStrikeImpactSideFinishPresentation{visible:boolean;start:Vec2;end:Vec2;length:number;alpha:number;roleBlend:number}
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function specialistStrikeImpactSideFinishPresentation(input:SpecialistStrikeImpactSideFinishInput,reducedMotion=false,reducedFlash=false):SpecialistStrikeImpactSideFinishPresentation{
 const max=Math.max(.0001,input.maxTtl),life=clamp(input.ttl/max,0,1),progress=1-life,dx=input.target.x-input.origin.x,dy=input.target.y-input.origin.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d,tx=-uy,ty=ux,visible=progress>.68,len=(input.type==='siegeGolem'?18:input.type==='assassin'?15:13)*(reducedMotion?.72:1),start={x:input.target.x+ux*1.5,y:input.target.y+uy*1.5},roleBlend=clamp((progress-.68)/.12,0,1);
 const targetRoleX=input.type==='assassin'?ux*.3+tx*.95:input.type==='nullifier'?ux*.55-tx*.7:input.type==='shieldbearer'?ux*.92+tx*.18:ux,targetRoleY=input.type==='assassin'?uy*.3+ty*.95:input.type==='nullifier'?uy*.55-ty*.7:input.type==='shieldbearer'?uy*.92+ty*.18:uy,targetRoleMag=Math.hypot(targetRoleX,targetRoleY)||1,roleX=ux*(1-roleBlend)+targetRoleX/targetRoleMag*roleBlend,roleY=uy*(1-roleBlend)+targetRoleY/targetRoleMag*roleBlend,roleMag=Math.hypot(roleX,roleY)||1,end={x:start.x+roleX/roleMag*len,y:start.y+roleY/roleMag*len};
 return{visible,start,end,length:len,alpha:visible?(.18+.46*clamp((progress-.68)/.32,0,1))*(reducedFlash?.58:1):0,roleBlend};
}


export interface SpecialistImpactFinishLocomotionRecoveryInput{start:Vec2;end:Vec2;locomotionFacingX:number;locomotionFacingY:number;ttl:number;maxTtl:number;type:SpecialistEnemyType}
export function specialistImpactFinishLocomotionRecoveryPresentation(input:SpecialistImpactFinishLocomotionRecoveryInput,reducedMotion=false){
 const max=Math.max(.0001,Number.isFinite(input.maxTtl)?input.maxTtl:.0001),progress=clamp(1-Math.max(0,input.ttl)/max,0,1),startAt=reducedMotion?.76:.82,recoveryBlend=clamp((progress-startAt)/Math.max(.001,1-startAt),0,1);
 const fx=input.end.x-input.start.x,fy=input.end.y-input.start.y,fl=Math.hypot(fx,fy)||1,lx=Number.isFinite(input.locomotionFacingX)?input.locomotionFacingX:fx,ly=Number.isFinite(input.locomotionFacingY)?input.locomotionFacingY:fy,ll=Math.hypot(lx,ly)||1;
 const bx=fx/fl*(1-recoveryBlend)+lx/ll*recoveryBlend,by=fy/fl*(1-recoveryBlend)+ly/ll*recoveryBlend,bl=Math.hypot(bx,by)||1,baseLength=fl,length=baseLength*(1-.58*recoveryBlend),end={x:input.start.x+bx/bl*length,y:input.start.y+by/bl*length};
 return{owner:(recoveryBlend>=.92?'locomotion':recoveryBlend>0?'handoff':'finish') as 'finish'|'handoff'|'locomotion',start:{...input.start},end,length,recoveryBlend,alphaScale:1-.5*recoveryBlend,presentationOnly:true as const};
}


export interface SpecialistImpactRecoveryFacingHandoffInput{storedFacingX:number;storedFacingY:number;currentFacingX:number;currentFacingY:number;recoveryBlend:number;enemyAlive:boolean}
export function specialistImpactRecoveryFacingHandoffPresentation(input:SpecialistImpactRecoveryFacingHandoffInput,reducedMotion=false){
 const sx=Number.isFinite(input.storedFacingX)?input.storedFacingX:1,sy=Number.isFinite(input.storedFacingY)?input.storedFacingY:0,sl=Math.hypot(sx,sy)||1,cx=Number.isFinite(input.currentFacingX)?input.currentFacingX:sx,cy=Number.isFinite(input.currentFacingY)?input.currentFacingY:sy,cl=Math.hypot(cx,cy)||1;
 if(!input.enemyAlive)return{owner:'stored' as const,facingX:sx/sl,facingY:sy/sl,blend:0,presentationOnly:true as const};
 const raw=clamp(input.recoveryBlend,0,1),blend=clamp(raw*(reducedMotion?1.12:1),0,1),bx=sx/sl*(1-blend)+cx/cl*blend,by=sy/sl*(1-blend)+cy/cl*blend,bl=Math.hypot(bx,by)||1;
 return{owner:(blend>.7?'current':blend>0?'handoff':'stored') as 'stored'|'handoff'|'current',facingX:bx/bl,facingY:by/bl,blend,presentationOnly:true as const};
}


export interface SpecialistImpactRecoveryDensityBudgetInput{activeCount:number;indexFromNewest:number;owner:'finish'|'handoff'|'locomotion';type:SpecialistEnemyType;recoveryBlend:number}
export function specialistImpactRecoveryDensityBudgetPresentation(input:SpecialistImpactRecoveryDensityBudgetInput,reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeCount)),index=Math.max(0,Math.floor(input.indexFromNewest));if(count<=2)return{visible:true,alphaScale:1,lengthScale:1,capacity:count,presentationOnly:true as const};let capacity=input.type==='siegeGolem'?4:3;if(input.owner==='locomotion')capacity-=1;if(reducedMotion)capacity-=1;capacity=Math.max(1,capacity);const visible=index<capacity,alphaScale=visible?(input.owner==='finish'?.9:input.owner==='handoff'?.72:.46):0,lengthScale=visible?(reducedMotion?.72:input.owner==='locomotion'?.68:.88):0;return{visible,alphaScale,lengthScale,capacity,presentationOnly:true as const};
}


export interface SpecialistNextAttackAnticipationInput{recoveryBlend:number;attackTimer:number;attackInterval:number;inAttackRange:boolean;facingX:number;facingY:number;type:SpecialistEnemyType}
export function specialistNextAttackAnticipationPresentation(input:SpecialistNextAttackAnticipationInput,reducedMotion=false,reducedFlash=false){
 const fx=Number.isFinite(input.facingX)?input.facingX:1,fy=Number.isFinite(input.facingY)?input.facingY:0,fl=Math.hypot(fx,fy)||1,facingX=fx/fl,facingY=fy/fl,interval=Math.max(.001,Number.isFinite(input.attackInterval)?input.attackInterval:.001),timer=Math.max(0,Number.isFinite(input.attackTimer)?input.attackTimer:interval),ratio=clamp(timer/interval,0,1),recovered=clamp(input.recoveryBlend,0,1)>=.82,window=input.type==='siegeGolem'?.28:input.type==='assassin'?.22:.24,visible=Boolean(input.inAttackRange&&recovered&&timer>0&&ratio<=window),urgency=visible?clamp(1-ratio/window,0,1):0,baseReach=input.type==='siegeGolem'?28:input.type==='assassin'?20:input.type==='nullifier'?24:22,reach=baseReach*(reducedMotion?.76:1),alpha=visible?(.2+.34*urgency)*(reducedFlash?.58:1):0;
 return{visible,facingX,facingY,reach,alpha,urgency,owner:(visible?'anticipation':'locomotion') as 'anticipation'|'locomotion',presentationOnly:true as const};
}


export interface SpecialistNextAttackAnticipationHandoffInput{anticipationVisible:boolean;urgency:number;pullback:number;lunge:number;resolve:number}
export function specialistNextAttackAnticipationHandoffPresentation(input:SpecialistNextAttackAnticipationHandoffInput,reducedMotion=false){
 if(!input.anticipationVisible)return{owner:(Math.max(input.pullback,input.lunge)>0?'attack':'locomotion') as 'attack'|'locomotion',alphaScale:0,presentationOnly:true as const};
 const pullback=clamp(input.pullback,0,1),lunge=clamp(input.lunge,0,1),attack=Math.max(pullback,lunge),urgency=clamp(input.urgency,0,1);if(lunge>=.68)return{owner:'attack' as const,alphaScale:0,presentationOnly:true as const};
 if(attack>0){const fade=clamp(1-pullback*1.28-lunge*1.5,0,1)*(reducedMotion?.72:1);return{owner:'attack' as const,alphaScale:fade,presentationOnly:true as const};}
 return{owner:'anticipation' as const,alphaScale:reducedMotion?.9:1,presentationOnly:true as const};
}


export interface SpecialistNextAttackAnticipationDensityBudgetInput{activeCount:number;indexFromNewest:number;type:SpecialistEnemyType;urgency:number}
export function specialistNextAttackAnticipationDensityBudgetPresentation(input:SpecialistNextAttackAnticipationDensityBudgetInput,reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeCount)),index=Math.max(0,Math.floor(input.indexFromNewest)),urgency=clamp(input.urgency,0,1);if(count<=2)return{visible:true,alphaScale:1,reachScale:1,capacity:count,presentationOnly:true as const};
 let capacity=input.type==='siegeGolem'?4:input.type==='assassin'?2:3;if(urgency>=.85)capacity+=1;if(reducedMotion)capacity-=1;capacity=Math.max(1,capacity);const visible=index<capacity,alphaScale=visible?Math.min(1,.62+.38*urgency):0,reachScale=visible?(reducedMotion?.72:.88):0;return{visible,alphaScale,reachScale,capacity,presentationOnly:true as const};
}


export interface SpecialistAnticipationSilhouettePoseContinuityInput{type:SpecialistEnemyType;anticipationVisible:boolean;urgency:number;pullback:number;lunge:number;resolve:number}
export function specialistAnticipationSilhouettePoseContinuityPresentation(input:SpecialistAnticipationSilhouettePoseContinuityInput,reducedMotion=false){
 const urgency=clamp(input.urgency,0,1),pullback=clamp(input.pullback,0,1),lunge=clamp(input.lunge,0,1),resolve=clamp(input.resolve,0,1),attack=Math.max(pullback,lunge);
 if(lunge>=.08)return{owner:'strike' as const,anticipationAlphaScale:0,poseWeight:0,widthScale:1,heightScale:1,lateralOffset:0,silhouetteAlphaScale:1,presentationOnly:true as const};
 if(pullback>=.08){const handoff=clamp(1-pullback*1.45,0,1),poseWeight=handoff*(reducedMotion?.55:1),target=input.type==='assassin'?{w:1.07,h:.96,l:2.2}:input.type==='siegeGolem'?{w:1.03,h:1.055,l:.35}:input.type==='nullifier'?{w:.985,h:1.035,l:-1.15}:{w:1.045,h:1.025,l:.25};return{owner:'windup' as const,anticipationAlphaScale:handoff,poseWeight,widthScale:1+(target.w-1)*poseWeight,heightScale:1+(target.h-1)*poseWeight,lateralOffset:target.l*poseWeight,silhouetteAlphaScale:1,presentationOnly:true as const};}
 if(resolve>.08||!input.anticipationVisible)return{owner:(resolve>.08?'resolve':'locomotion') as 'resolve'|'locomotion',anticipationAlphaScale:0,poseWeight:0,widthScale:1,heightScale:1,lateralOffset:0,silhouetteAlphaScale:1,presentationOnly:true as const};
 const poseWeight=urgency*(reducedMotion?.45:.72),type=input.type;
 const target=type==='assassin'?{w:1.07,h:.96,l:2.2}:type==='siegeGolem'?{w:1.03,h:1.055,l:.35}:type==='nullifier'?{w:.985,h:1.035,l:-1.15}:{w:1.045,h:1.025,l:.25};
 return{owner:'anticipation' as const,anticipationAlphaScale:1,poseWeight,widthScale:1+(target.w-1)*poseWeight,heightScale:1+(target.h-1)*poseWeight,lateralOffset:target.l*poseWeight,silhouetteAlphaScale:.94+.06*urgency,presentationOnly:true as const};
}


export interface SpecialistAnticipationSilhouetteHandoffInput{anticipationVisible:boolean;pullback:number;lunge:number;resolve:number}
export function specialistAnticipationSilhouetteHandoffPresentation(input:SpecialistAnticipationSilhouetteHandoffInput,reducedMotion=false){
 const pullback=clamp(input.pullback,0,1),lunge=clamp(input.lunge,0,1),resolve=clamp(input.resolve,0,1);
 if(lunge>=.08)return{owner:'attack' as const,previewShapeScale:0,attackShapeScale:1,cueAlphaScale:0,presentationOnly:true as const};
 if(pullback>0){const blend=clamp(pullback/(reducedMotion?.42:.72),0,1);return{owner:'handoff' as const,previewShapeScale:1-blend,attackShapeScale:blend,cueAlphaScale:1-blend*.82,presentationOnly:true as const};}
 if(input.anticipationVisible)return{owner:'preview' as const,previewShapeScale:1,attackShapeScale:0,cueAlphaScale:1,presentationOnly:true as const};
 return{owner:(resolve>0?'resolve':'locomotion') as 'resolve'|'locomotion',previewShapeScale:0,attackShapeScale:1,cueAlphaScale:0,presentationOnly:true as const};
}


export interface SpecialistAnticipationSilhouetteDensityBudgetInput{activeCount:number;indexFromNewest:number;type:SpecialistEnemyType;owner:'anticipation'|'windup'|'strike'|'resolve'|'locomotion';urgency:number}
export function specialistAnticipationSilhouetteDensityBudgetPresentation(input:SpecialistAnticipationSilhouetteDensityBudgetInput,reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeCount)),index=Math.max(0,Math.floor(input.indexFromNewest)),urgency=clamp(input.urgency,0,1);
 if(input.owner==='strike'||input.owner==='resolve'||input.owner==='locomotion')return{previewEffectStrength:0,cueAlphaScale:input.owner==='strike'?0:1,bodyAlphaScale:1,capacity:0,presentationOnly:true as const};
 if(count<=2)return{previewEffectStrength:1,cueAlphaScale:1,bodyAlphaScale:1,capacity:count,presentationOnly:true as const};
 let capacity=input.type==='siegeGolem'?4:input.type==='assassin'?2:3;if(urgency>=.88)capacity+=1;if(input.owner==='windup')capacity+=1;if(reducedMotion)capacity-=1;capacity=Math.max(1,capacity);
 const visible=index<capacity,strength=visible?Math.min(1,.58+.42*urgency):0,cueAlphaScale=visible?Math.min(1,.64+.36*urgency):0;
 return{previewEffectStrength:strength,cueAlphaScale,bodyAlphaScale:1,capacity,presentationOnly:true as const};
}


export interface SpecialistAttackSilhouetteRecoveryTrailInput{type:SpecialistEnemyType;attackFacingX:number;attackFacingY:number;recoveryFacingX:number;recoveryFacingY:number;lunge:number;resolve:number;recoveryBlend:number}
export function specialistAttackSilhouetteRecoveryTrailPresentation(input:SpecialistAttackSilhouetteRecoveryTrailInput,reducedMotion=false){
 const ax=Number.isFinite(input.attackFacingX)?input.attackFacingX:1,ay=Number.isFinite(input.attackFacingY)?input.attackFacingY:0,al=Math.hypot(ax,ay)||1,rx=Number.isFinite(input.recoveryFacingX)?input.recoveryFacingX:ax,ry=Number.isFinite(input.recoveryFacingY)?input.recoveryFacingY:ay,rl=Math.hypot(rx,ry)||1,lunge=clamp(input.lunge,0,1),resolve=clamp(input.resolve,0,1),rawBlend=clamp(Math.max(input.recoveryBlend,resolve*.82),0,1),blend=clamp(rawBlend*(reducedMotion?1.08:1),0,1);
 if(lunge>.08)return{owner:'attack' as const,facingX:ax/al,facingY:ay/al,trailAlphaScale:1,trailDistanceScale:1,recoveryBlend:0,presentationOnly:true as const};
 if(blend<=.04)return{owner:'locomotion' as const,facingX:rx/rl,facingY:ry/rl,trailAlphaScale:1,trailDistanceScale:1,recoveryBlend:0,presentationOnly:true as const};
 const bx=ax/al*(1-blend)+rx/rl*blend,by=ay/al*(1-blend)+ry/rl*blend,bl=Math.hypot(bx,by)||1,owner=(blend>=.9?'recovery':'handoff') as 'handoff'|'recovery',roleDistance=input.type==='siegeGolem'?.9:input.type==='assassin'?.78:.84,trailDistanceScale=Math.max(.42,1-blend*(1-roleDistance))*(reducedMotion?.78:1),trailAlphaScale=Math.max(.42,1-blend*.46);
 return{owner,facingX:bx/bl,facingY:by/bl,trailAlphaScale,trailDistanceScale,recoveryBlend:blend,presentationOnly:true as const};
}


export interface SpecialistRecoveryTrailSilhouetteHandoffInput{trailOwner:'attack'|'handoff'|'recovery'|'locomotion';recoveryBlend:number;silhouetteOwner:'attack'|'recovery'|'locomotion'|'hit'|'special'}
export function specialistRecoveryTrailSilhouetteHandoffPresentation(input:SpecialistRecoveryTrailSilhouetteHandoffInput,reducedMotion=false){
 const blend=clamp(input.recoveryBlend,0,1);if(input.trailOwner==='attack')return{owner:'attack' as const,recoveryTrailAlphaScale:1,locomotionTrailAlphaScale:0,presentationOnly:true as const};
 if(input.trailOwner==='locomotion'||input.trailOwner==='recovery'&&blend>=.9||input.silhouetteOwner==='locomotion'&&blend>=.88)return{owner:'locomotion' as const,recoveryTrailAlphaScale:Math.max(0,.22*(1-blend)),locomotionTrailAlphaScale:1,presentationOnly:true as const};
 const recoveryBase=(.74*(1-blend)+.12)*(reducedMotion?.72:1),locomotionBase=.2+.72*blend,total=recoveryBase+locomotionBase,scale=total>1.18?1.18/total:1;
 return{owner:'handoff' as const,recoveryTrailAlphaScale:recoveryBase*scale,locomotionTrailAlphaScale:locomotionBase*scale,presentationOnly:true as const};
}

export interface SpecialistRecoveryTrailDensityBudgetInput{activeCount:number;indexFromNewest:number;type:SpecialistEnemyType;owner:'attack'|'handoff'|'locomotion';recoveryBlend:number}
export function specialistRecoveryTrailDensityBudgetPresentation(input:SpecialistRecoveryTrailDensityBudgetInput,reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeCount)),index=Math.max(0,Math.floor(input.indexFromNewest));
 if(input.owner==='locomotion')return{effectStrength:0,bodyAlphaScale:1,capacity:0,presentationOnly:true as const};
 if(count<=2)return{effectStrength:1,bodyAlphaScale:1,capacity:count,presentationOnly:true as const};
 const baseCapacity=input.type==='siegeGolem'?4:input.type==='assassin'?2:3,capacity=Math.max(1,baseCapacity-(reducedMotion?1:0)),visible=index<capacity;
 const blend=clamp(input.recoveryBlend,0,1),base=input.owner==='attack'?.9:.82-.18*blend,effectStrength=visible?Math.max(.58,base-index*.08):0;
 return{effectStrength,bodyAlphaScale:1,capacity,presentationOnly:true as const};
}


export interface SpecialistRecoveryTrailLocomotionCadenceInput{trailOwner:'attack'|'recovery'|'handoff'|'locomotion';recoveryBlend:number;motionBlend:number;signatureStrength:number}
export function specialistRecoveryTrailLocomotionCadencePresentation(input:SpecialistRecoveryTrailLocomotionCadenceInput,reducedMotion=false){
 const blend=clamp(input.recoveryBlend,0,1),motion=clamp(input.motionBlend,0,1),signature=clamp(input.signatureStrength,0,1);
 if(input.trailOwner==='attack')return{owner:'recovery' as const,recoveryTrailAlphaScale:1,locomotionCadenceScale:0,presentationOnly:true as const};
 if(input.trailOwner==='locomotion'||blend>=.9)return{owner:'locomotion' as const,recoveryTrailAlphaScale:.12*(1-blend),locomotionCadenceScale:1,presentationOnly:true as const};
 if(input.trailOwner==='recovery'&&blend<.48){const cadence=clamp(blend*.62*motion*(.72+.28*signature),0,.42);return{owner:'recovery' as const,recoveryTrailAlphaScale:(reducedMotion?.72:.92),locomotionCadenceScale:cadence,presentationOnly:true as const};}
 const t=clamp((blend-.38)/.48,0,1),overlapScale=reducedMotion?.72:1,recovery=(1-t)*.78*overlapScale,cadence=clamp((.28+.72*t)*(.82+.18*motion)*(.88+.12*signature),0,1);
 return{owner:'handoff' as const,recoveryTrailAlphaScale:recovery,locomotionCadenceScale:cadence,presentationOnly:true as const};
}


export interface SpecialistRecoveryLocomotionCadenceHandoffInput{owner:'recovery'|'handoff'|'locomotion';recoveryBlend:number;motionBlend:number;cadenceScale:number}
export function specialistRecoveryLocomotionCadenceHandoffPresentation(input:SpecialistRecoveryLocomotionCadenceHandoffInput,reducedMotion=false){
 const blend=clamp(input.recoveryBlend,0,1),motion=clamp(input.motionBlend,0,1),cadence=clamp(input.cadenceScale,0,1);
 if(input.owner==='locomotion'||blend>=.9)return{owner:'locomotion' as const,trailAlphaScale:1,signatureAlphaScale:1,cadenceScale:1,presentationOnly:true as const};
 if(input.owner==='recovery'&&blend<.48)return{owner:'recovery' as const,trailAlphaScale:reducedMotion?.76:1,signatureAlphaScale:Math.min(.42,cadence*.6),cadenceScale:Math.min(.48,cadence),presentationOnly:true as const};
 const t=clamp((blend-.4)/.46,0,1),overlap=reducedMotion?.74:1,trail=(.72*(1-t)+.28)*overlap,signature=clamp(.28+.72*t,0,1),nextCadence=clamp(Math.max(cadence,.34+.66*t)*(.88+.12*motion),0,1);
 return{owner:'handoff' as const,trailAlphaScale:trail,signatureAlphaScale:signature,cadenceScale:nextCadence,presentationOnly:true as const};
}


export interface SpecialistRecoveryLocomotionCadenceDensityBudgetInput{activeCount:number;indexFromNewest:number;type:SpecialistEnemyType;owner:'recovery'|'handoff'|'locomotion'}
export function specialistRecoveryLocomotionCadenceDensityBudgetPresentation(input:SpecialistRecoveryLocomotionCadenceDensityBudgetInput,reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeCount)),index=Math.max(0,Math.floor(input.indexFromNewest));
 if(input.owner==='locomotion')return{effectStrength:0,bodyAlphaScale:1,canonicalCadenceScale:1,capacity:0,presentationOnly:true as const};
 if(count<=2)return{effectStrength:1,bodyAlphaScale:1,canonicalCadenceScale:1,capacity:count,presentationOnly:true as const};
 let capacity=input.type==='siegeGolem'?4:input.type==='assassin'?2:3;if(input.owner==='recovery')capacity+=1;if(reducedMotion)capacity=Math.max(1,capacity-1);const visible=index<capacity,effectStrength=visible?Math.max(.58,.84-index*.07):0;
 return{effectStrength,bodyAlphaScale:1,canonicalCadenceScale:1,capacity,presentationOnly:true as const};
}


export interface SpecialistLocomotionTurnStopReattackRhythmInput{type:SpecialistEnemyType;motionBlend:number;turn:number;recovery:number;attackReadiness:number}
export function specialistLocomotionTurnStopReattackRhythmPresentation(input:SpecialistLocomotionTurnStopReattackRhythmInput,reducedMotion=false){
 const motion=clamp(input.motionBlend,0,1),turn=Math.abs(clamp(input.turn,-1,1)),recovery=clamp(input.recovery,0,1),readiness=clamp(input.attackReadiness,0,1),motionScale=reducedMotion?.78:1;
 if(readiness>=.72&&recovery<.58)return{owner:'reattack' as const,cadenceScale:clamp(.68+.32*readiness,0,1),turnEmphasis:turn*.28,stopEmphasis:0,reattackScale:clamp(.66+.34*readiness,0,1),trailDistanceScale:.86+.14*readiness,presentationOnly:true as const};
 if(recovery>=.64||motion<=.16){const stop=clamp(Math.max(recovery,1-motion),0,1);return{owner:'stop' as const,cadenceScale:clamp(.18+.34*motion,0,.56),turnEmphasis:turn*.34,stopEmphasis:stop,reattackScale:0,trailDistanceScale:(.62+.18*(1-stop))*motionScale,presentationOnly:true as const};}
 if(turn>=.58){return{owner:'turn' as const,cadenceScale:clamp((1-turn*.52)*(.78+.22*motion),.34,.74),turnEmphasis:turn,stopEmphasis:recovery*.28,reattackScale:readiness*.36,trailDistanceScale:(.72+.2*(1-turn))*motionScale,presentationOnly:true as const};}
 return{owner:'locomotion' as const,cadenceScale:clamp(.86+.14*motion,0,1),turnEmphasis:turn*.24,stopEmphasis:recovery*.18,reattackScale:readiness*.4,trailDistanceScale:1,presentationOnly:true as const};
}


export interface SpecialistTurnStopReattackHandoffInput{owner:'locomotion'|'turn'|'stop'|'reattack';cadenceScale:number;reattackScale:number;motionBlend:number}
export function specialistTurnStopReattackHandoffPresentation(input:SpecialistTurnStopReattackHandoffInput,reducedMotion=false){
 const cadence=clamp(input.cadenceScale,0,1),reattack=clamp(input.reattackScale,0,1),motion=clamp(input.motionBlend,0,1);
 if(input.owner==='locomotion')return{owner:'locomotion' as const,cadenceScale:1,turnStopScale:0,reattackScale:0,bodyAlphaScale:1,presentationOnly:true as const};
 if(input.owner==='turn'||input.owner==='stop')return{owner:input.owner,cadenceScale:cadence,turnStopScale:(reducedMotion?.74:1),reattackScale:reattack*.32,bodyAlphaScale:1,presentationOnly:true as const};
 if(motion>=.84)return{owner:'locomotion' as const,cadenceScale:1,turnStopScale:0,reattackScale:reattack,bodyAlphaScale:1,presentationOnly:true as const};
 const t=clamp(.35+.65*Math.max(motion,reattack),0,1),turnStop=(1-t*.76)*(reducedMotion?.68:1);return{owner:'handoff' as const,cadenceScale:clamp(Math.max(cadence,.48+.52*t),0,1),turnStopScale:turnStop,reattackScale:clamp(reattack,0,1),bodyAlphaScale:1,presentationOnly:true as const};
}


export interface SpecialistTurnStopReattackDensityBudgetInput{activeCount:number;indexFromNewest:number;type:SpecialistEnemyType;owner:'locomotion'|'turn'|'stop'|'handoff'}
export function specialistTurnStopReattackDensityBudgetPresentation(input:SpecialistTurnStopReattackDensityBudgetInput,reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeCount)),index=Math.max(0,Math.floor(input.indexFromNewest));if(input.owner==='locomotion')return{effectStrength:0,bodyAlphaScale:1,canonicalCadenceScale:1,capacity:0,presentationOnly:true as const};if(count<=2)return{effectStrength:1,bodyAlphaScale:1,canonicalCadenceScale:1,capacity:count,presentationOnly:true as const};
 let capacity=input.type==='siegeGolem'?4:input.type==='assassin'?2:3;if(input.owner==='turn'||input.owner==='stop')capacity+=1;if(reducedMotion)capacity=Math.max(1,capacity-1);const visible=index<capacity,effectStrength=visible?Math.max(.56,.84-index*.07):0;return{effectStrength,bodyAlphaScale:1,canonicalCadenceScale:1,capacity,presentationOnly:true as const};
}

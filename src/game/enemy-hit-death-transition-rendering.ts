export type EnemyHitDeathTier='normal'|'heavy'|'critical';
export type EnemyHitDeathType='grunt'|'hound'|'brute'|'archer'|'bomber'|'shaman'|'shieldbearer'|'assassin'|'siegeGolem'|'nullifier'|'golden'|'elite';
export interface EnemyMotionLike{motionBlend:number;stride:number;facingX:number;facingY:number;turn:number;recovery:number;}
export interface EnemyDeathPose{
  radius:number;
  facingX:number;
  facingY:number;
  motionBlend:number;
  turn:number;
  impactX:number;
  impactY:number;
  tier:EnemyHitDeathTier;
}
export interface EnemyHitStaggerPresentation{stagger:number;offsetX:number;offsetY:number;rotation:number;scaleX:number;scaleY:number;}
export interface EnemyDeathTransitionPresentation{role:'agile'|'light'|'medium'|'heavy';carry:number;alpha:number;offsetX:number;offsetY:number;rotation:number;scaleX:number;scaleY:number;}
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const TIER:Record<EnemyHitDeathTier,number>={normal:.46,heavy:.74,critical:1};
const profile=(type:EnemyHitDeathType)=>{
  if(type==='assassin'||type==='hound'||type==='golden')return{role:'agile' as const,kick:1.05,tumble:1.18,settle:.62,collapse:.58};
  if(type==='siegeGolem'||type==='shieldbearer'||type==='brute')return{role:'heavy' as const,kick:.72,tumble:.28,settle:1.38,collapse:1.3};
  if(type==='archer'||type==='shaman'||type==='nullifier')return{role:'light' as const,kick:.9,tumble:.72,settle:.82,collapse:.76};
  return{role:'medium' as const,kick:.82,tumble:.56,settle:1,collapse:.92};
};
const unit=(x:number,y:number,fx=1,fy=0)=>{const len=Math.hypot(x,y);return len>.001?{x:x/len,y:y/len}:{x:fx,y:fy};};

export function enemyHitStaggerPresentation(type:EnemyHitDeathType,hitFlash:number,tier:EnemyHitDeathTier,impactX:number,impactY:number,motion:EnemyMotionLike|undefined,reducedMotion=false):EnemyHitStaggerPresentation{
  const p=profile(type),strength=clamp(hitFlash/.1,0,1)*TIER[tier];
  const dir=unit(impactX,impactY,-(motion?.facingX??1),-(motion?.facingY??0));
  const motionScale=reducedMotion?.38:1;
  const kick=(2.15+3.25*strength)*p.kick*strength*motionScale;
  const offsetX=dir.x*kick,offsetY=dir.y*kick+strength*p.settle*.42*motionScale;
  const turn=motion?.turn??0;
  const rotation=clamp((dir.y-dir.x*.22+turn*.18)*.115*p.tumble*strength*motionScale,-.18,.18);
  const scaleX=clamp(1+strength*.025*p.kick*motionScale,.93,1.07);
  const scaleY=clamp(1-strength*.035*p.collapse*motionScale,.91,1.05);
  return{stagger:strength,offsetX,offsetY,rotation,scaleX,scaleY};
}

export function enemyDeathTransitionPresentation(type:EnemyHitDeathType,snapshot:EnemyDeathPose,progress:number,reducedMotion=false):EnemyDeathTransitionPresentation{
  const p=profile(type),t=clamp(progress,0,1),tier=TIER[snapshot.tier];
  const dir=unit(snapshot.impactX,snapshot.impactY,-snapshot.facingX,-snapshot.facingY);
  const carry=clamp(snapshot.motionBlend*.52+tier*.54,0,1);
  const motionScale=reducedMotion?.38:1;
  const impactKick=(2.15+3.25*tier)*p.kick*tier*(1-t*.74);
  const travel=(snapshot.motionBlend*(1-t)*2.5+carry*t*1.25)*motionScale;
  const offsetX=(dir.x*impactKick+snapshot.facingX*travel)*motionScale;
  const offsetY=(dir.y*impactKick+snapshot.facingY*travel+t*t*6.2*p.settle)*motionScale;
  const rotation=clamp(((dir.y-dir.x*.22)*.115*p.tumble*tier+snapshot.turn*.035)*(1-t*.2)+t*.15*p.tumble*Math.sign(snapshot.turn||dir.x||1),-.32,.32)*motionScale;
  const scaleX=clamp(1+t*.035*p.tumble*motionScale,.88,1.1);
  const scaleY=clamp(1-t*.12*p.collapse*motionScale,.78,1.05);
  const alpha=clamp(1-t*.96,0,.98);
  return{role:p.role,carry,alpha,offsetX,offsetY,rotation,scaleX,scaleY};
}


export interface EnemyFinisherDeathAfterglowContinuityInput{deathProgress:number;finisherProgress:number;tier:EnemyHitDeathTier}
export function enemyFinisherDeathAfterglowContinuityPresentation(input:EnemyFinisherDeathAfterglowContinuityInput,reducedMotion=false,reducedFlash=false){
  const death=clamp(input.deathProgress,0,1),finisher=clamp(input.finisherProgress,0,1),tier=TIER[input.tier],flashScale=reducedFlash?.72:1,motionScale=reducedMotion?.82:1;
  if(death<.34){const body=clamp(1-death*.34,0,1);return{owner:'reaction' as const,bodyAlphaScale:body,finisherAlphaScale:(.64+.22*tier)*motionScale,afterglowAlphaScale:(.12+.16*finisher)*flashScale,presentationOnly:true as const};}
  if(death<.78){const t=clamp((death-.34)/.44,0,1),body=clamp(.88-.7*t,0,1),after=clamp((.42+.46*t)*(.82+.18*tier)*flashScale,0,1);return{owner:'afterglow' as const,bodyAlphaScale:body,finisherAlphaScale:clamp(.76-.28*t,0,1),afterglowAlphaScale:after,presentationOnly:true as const};}
  const tail=clamp((1-death)/.22,0,1);return{owner:'afterglow' as const,bodyAlphaScale:.18*tail,finisherAlphaScale:.24*tail,afterglowAlphaScale:clamp((.26+.26*(1-finisher))*flashScale,0,1),presentationOnly:true as const};
}


export interface EnemyFinisherDeathAfterglowHandoffInput{owner:'reaction'|'afterglow';deathProgress:number;afterglowAlpha:number}
export function enemyFinisherDeathAfterglowHandoffPresentation(input:EnemyFinisherDeathAfterglowHandoffInput,reducedMotion=false){
 const progress=clamp(input.deathProgress,0,1),after=clamp(input.afterglowAlpha,0,1);
 if(input.owner==='reaction'||progress<.34)return{owner:'reaction' as const,bodyScale:1,finisherScale:1,afterglowScale:Math.min(.32,after),presentationOnly:true as const};
 if(progress>=.8)return{owner:'afterglow' as const,bodyScale:.12*clamp((1-progress)/.2,0,1),finisherScale:.34,afterglowScale:Math.max(.46,after),presentationOnly:true as const};
 const t=clamp((progress-.34)/.46,0,1),overlap=reducedMotion?.72:1,body=(.72*(1-t)+.08)*overlap,glow=.3+.62*t,finisher=.72-.24*t,total=body+glow,scale=total>1.35?1.35/total:1;
 return{owner:'handoff' as const,bodyScale:body*scale,finisherScale:finisher,afterglowScale:glow*scale,presentationOnly:true as const};
}


export interface EnemyFinisherDeathAfterglowDensityBudgetInput{activeCount:number;indexFromNewest:number;tier:EnemyHitDeathTier;owner:'reaction'|'handoff'|'afterglow'}
export function enemyFinisherDeathAfterglowDensityBudgetPresentation(input:EnemyFinisherDeathAfterglowDensityBudgetInput,reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeCount)),index=Math.max(0,Math.floor(input.indexFromNewest));
 if(input.owner==='reaction')return{effectStrength:0,bodyAlphaScale:1,afterglowAlphaScale:1,capacity:0,presentationOnly:true as const};
 if(count<=2)return{effectStrength:1,bodyAlphaScale:1,afterglowAlphaScale:1,capacity:count,presentationOnly:true as const};
 let capacity=input.tier==='critical'?4:input.tier==='heavy'?3:2;if(input.owner==='handoff')capacity+=1;if(reducedMotion)capacity=Math.max(1,capacity-1);const visible=index<capacity,effectStrength=visible?Math.max(.56,.88-index*.08):0;return{effectStrength,bodyAlphaScale:1,afterglowAlphaScale:effectStrength,capacity,presentationOnly:true as const};
}

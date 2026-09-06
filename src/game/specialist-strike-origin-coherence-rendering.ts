import type { SpecialistEnemyType } from './enemy-specialists.js';
export interface SpecialistStrikeOriginCoherenceInput{type:SpecialistEnemyType;radius:number;facingX:number;facingY:number;pullback:number;lunge:number;resolve:number;silhouetteForward:number;silhouetteLateral:number}
export interface SpecialistStrikeOriginCoherencePresentation{owner:'strike'|'resolve'|'pose';originOffsetX:number;originOffsetY:number;forwardFollow:number;lateralFollow:number;convergeSeconds:number;presentationOnly:true}
const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,Number.isFinite(v)?v:0));
const bound=(x:number,y:number,max:number)=>{const m=Math.hypot(x,y);if(m<=max||m<=.0001)return{x,y};const s=max/m;return{x:x*s,y:y*s};};
export function specialistStrikeOriginCoherencePresentation(input:SpecialistStrikeOriginCoherenceInput,reducedMotion=false):SpecialistStrikeOriginCoherencePresentation{
 const m=Math.hypot(input.facingX,input.facingY)||1,fx=(Number.isFinite(input.facingX)?input.facingX:1)/m,fy=(Number.isFinite(input.facingY)?input.facingY:0)/m,px=-fy,py=fx;
 const pull=clamp(input.pullback),lunge=clamp(input.lunge),resolve=clamp(input.resolve),strike=Math.max(lunge,pull*.45),motion=reducedMotion?.6:1,radius=clamp(input.radius,12,38);
 const typeWeight=input.type==='assassin'?1.18:input.type==='siegeGolem'?1.02:input.type==='shieldbearer'?.78:.9;
 const forwardFollow=(radius*.54+Math.max(0,Number.isFinite(input.silhouetteForward)?input.silhouetteForward:0)*.55)*(0.58+strike*.55)*(1-resolve*.28)*typeWeight*motion;
 const lateralFollow=Math.max(-8,Math.min(8,(Number.isFinite(input.silhouetteLateral)?input.silhouetteLateral:0)*(0.55+strike*.35)*motion));
 const o=bound(fx*forwardFollow+px*lateralFollow,fy*forwardFollow+py*lateralFollow,reducedMotion?23:36);
 return{owner:lunge>.38?'strike':resolve>.35?'resolve':'pose',originOffsetX:o.x,originOffsetY:o.y,forwardFollow,lateralFollow,convergeSeconds:.11*(reducedMotion?.6:1),presentationOnly:true};
}

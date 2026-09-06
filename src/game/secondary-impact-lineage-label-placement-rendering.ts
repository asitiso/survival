import type { Vec2 } from '../core/math.js';
export const SECONDARY_IMPACT_LABEL_PRIMARY_CLEARANCE=30;
export const SECONDARY_IMPACT_LABEL_SECONDARY_CLEARANCE=32;
export const SECONDARY_IMPACT_LABEL_SCREEN_INSET=18;
const OFFSETS:readonly Vec2[]=[{x:0,y:-30},{x:34,y:-14},{x:-34,y:-14},{x:0,y:32},{x:36,y:20},{x:-36,y:20}];
const distance=(a:Vec2,b:Vec2)=>Math.hypot(a.x-b.x,a.y-b.y),clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function secondaryImpactLineageLabelPlacement(input:{anchor:Vec2;blockers:readonly Vec2[];occupied:readonly Vec2[];width:number;height:number}){
  const width=Math.max(SECONDARY_IMPACT_LABEL_SCREEN_INSET*2+1,input.width),height=Math.max(SECONDARY_IMPACT_LABEL_SCREEN_INSET*2+1,input.height);let best:Vec2|null=null,bestScore=-Infinity;
  for(const offset of OFFSETS){const candidate={x:clamp(input.anchor.x+offset.x,SECONDARY_IMPACT_LABEL_SCREEN_INSET,width-SECONDARY_IMPACT_LABEL_SCREEN_INSET),y:clamp(input.anchor.y+offset.y,SECONDARY_IMPACT_LABEL_SCREEN_INSET,height-SECONDARY_IMPACT_LABEL_SCREEN_INSET)};const primaryMin=input.blockers.length?Math.min(...input.blockers.map(b=>distance(candidate,b))):Infinity,secondaryMin=input.occupied.length?Math.min(...input.occupied.map(b=>distance(candidate,b))):Infinity;if(primaryMin<SECONDARY_IMPACT_LABEL_PRIMARY_CLEARANCE||secondaryMin<SECONDARY_IMPACT_LABEL_SECONDARY_CLEARANCE)continue;const score=Math.min(primaryMin,90)+Math.min(secondaryMin,90)-distance(candidate,input.anchor)*.08;if(score>bestScore){best=candidate;bestScore=score;}}
  return best?{visible:true,pos:best,presentationOnly:true as const}:{visible:false,pos:{...input.anchor},presentationOnly:true as const};
}

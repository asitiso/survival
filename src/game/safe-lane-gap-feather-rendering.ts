import type { Vec2 } from '../core/math.js';
export interface SafeLaneGapFeatherSegment{from:Vec2;to:Vec2;side:'start'|'end';alphaScale:number;}
const clamp=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
const lerp=(a:Vec2,b:Vec2,t:number):Vec2=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
export function safeLaneGapFeatherPresentation(input:{from:Vec2;to:Vec2;gap:{start:number;end:number}|null},reducedFlash=false){
  if(!input.gap)return{gapApplied:false,bodySegments:[{from:{...input.from},to:{...input.to}}],featherSegments:[] as SafeLaneGapFeatherSegment[],locatorVisible:true,presentationOnly:true as const};
  const start=clamp(Math.min(input.gap.start,input.gap.end)),end=clamp(Math.max(input.gap.start,input.gap.end)),width=Math.min(.045,Math.max(.018,(end-start)*.16)),leftBodyEnd=clamp(start-width),rightBodyStart=clamp(end+width),bodySegments:{from:Vec2;to:Vec2}[]=[];
  if(leftBodyEnd>.012)bodySegments.push({from:{...input.from},to:lerp(input.from,input.to,leftBodyEnd)});if(rightBodyStart<.988)bodySegments.push({from:lerp(input.from,input.to,rightBodyStart),to:{...input.to}});if(bodySegments.length===0)bodySegments.push({from:{...input.from},to:lerp(input.from,input.to,Math.min(.025,Math.max(.012,start*.5)))});
  const midLeft=clamp(start-width*.48),midRight=clamp(end+width*.48),outer=reducedFlash?.42:.62,inner=reducedFlash?.18:.28;
  const featherSegments:SafeLaneGapFeatherSegment[]=[];
  if(start>0){featherSegments.push({from:lerp(input.from,input.to,leftBodyEnd),to:lerp(input.from,input.to,midLeft),side:'start',alphaScale:outer},{from:lerp(input.from,input.to,midLeft),to:lerp(input.from,input.to,start),side:'start',alphaScale:inner});}
  if(end<1){featherSegments.push({from:lerp(input.from,input.to,end),to:lerp(input.from,input.to,midRight),side:'end',alphaScale:inner},{from:lerp(input.from,input.to,midRight),to:lerp(input.from,input.to,rightBodyStart),side:'end',alphaScale:outer});}
  return{gapApplied:true,bodySegments,featherSegments,locatorVisible:true,gap:{start,end},presentationOnly:true as const};
}

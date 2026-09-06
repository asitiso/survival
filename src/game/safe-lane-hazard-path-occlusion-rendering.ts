import type { Vec2 } from '../core/math.js';
export interface SafeLaneHazardPathOcclusionHazard{pos:Vec2;radius:number;telegraph:number;}
const clamp01=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
function pointSegmentDistance(point:Vec2,a:Vec2,b:Vec2):number{const dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy;if(len2<=.0001)return Math.hypot(point.x-a.x,point.y-a.y);const t=clamp01(((point.x-a.x)*dx+(point.y-a.y)*dy)/len2),x=a.x+dx*t,y=a.y+dy*t;return Math.hypot(point.x-x,point.y-y);}
export function safeLaneHazardPathOcclusionPresentation(input:{from:Vec2;to:Vec2;hazards:readonly SafeLaneHazardPathOcclusionHazard[]},reducedFlash=false){
  const overlapping=input.hazards.filter(h=>Number.isFinite(h.telegraph)&&h.telegraph>0&&pointSegmentDistance(h.pos,input.from,input.to)<=Math.max(0,h.radius)+24);
  if(overlapping.length===0)return{overlap:false,imminence:'none' as const,pathAlphaScale:1,locatorAlphaScale:1,arrivalAlphaScale:1,bridgeAlphaScale:1,presentationOnly:true as const};
  const soonest=Math.min(...overlapping.map(h=>h.telegraph));let imminence:'critical'|'move'|'prepare'|'hold'=soonest<=.22?'critical':soonest<=.52?'move':soonest<=1.1?'prepare':'hold';
  let pathAlphaScale=imminence==='critical'?.44:imminence==='move'?.58:imminence==='prepare'?.76:.9,arrivalAlphaScale=imminence==='critical'?.88:imminence==='move'?.92:.96,bridgeAlphaScale=imminence==='critical'?.42:imminence==='move'?.58:imminence==='prepare'?.76:.9;
  if(reducedFlash){pathAlphaScale=Math.max(.36,pathAlphaScale*.9);arrivalAlphaScale=Math.max(.82,arrivalAlphaScale*.94);bridgeAlphaScale=Math.max(.34,bridgeAlphaScale*.9);}
  return{overlap:true,imminence,pathAlphaScale,locatorAlphaScale:1,arrivalAlphaScale,bridgeAlphaScale,presentationOnly:true as const};
}

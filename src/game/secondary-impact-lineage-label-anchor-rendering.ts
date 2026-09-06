import type { Vec2 } from '../core/math.js';
function clamp01(value:number):number{return Math.max(0,Math.min(1,Number.isFinite(value)?value:0));}
export interface SecondaryImpactLineageLabelInput{lineageKey:string;anchor?:Vec2|undefined;heldCount:number;ttl:number;maxTtl:number;budgetVisible:boolean;}
export function secondaryImpactLineageLabelPresentation(input:SecondaryImpactLineageLabelInput,reducedFlash=false){
  const ttl=Math.max(0,Number.isFinite(input.ttl)?input.ttl:0),maxTtl=Math.max(.001,Number.isFinite(input.maxTtl)?input.maxTtl:.001),life=clamp01(ttl/maxTtl),heldCount=Math.max(0,Math.floor(Number.isFinite(input.heldCount)?input.heldCount:0)),bound=Boolean(input.anchor)&&!input.lineageKey.startsWith('unbound:');
  const visible=Boolean(input.budgetVisible)&&bound&&heldCount>1&&life>0;
  const pos=input.anchor?{x:input.anchor.x,y:input.anchor.y-28}:undefined;
  const baseAlpha=Math.min(.62,.36+Math.min(6,heldCount)*.045)*life;
  return{visible,text:visible?`×${heldCount}`:'',pos,alpha:visible?baseAlpha*(reducedFlash?.62:1):0,lineageKey:input.lineageKey,heldCount,presentationOnly:true as const};
}

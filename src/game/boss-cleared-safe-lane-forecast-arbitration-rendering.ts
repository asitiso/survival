import type { Vec2 } from '../core/math.js';
function clamp01(value:number):number{return Math.max(0,Math.min(1,Number.isFinite(value)?value:0));}
export type BossClearedSafeLaneForecastOwner='none'|'current'|'forecast';
export interface BossClearedSafeLaneForecastInput{currentTarget?:Vec2|undefined;currentConfidence?:number|undefined;nextTarget?:Vec2|undefined;forecastUrgency?:number|undefined;transitionMs?:number|undefined;}
export function bossClearedSafeLaneForecastTarget(input:BossClearedSafeLaneForecastInput,_reducedFlash=false){
  const current=input.currentTarget,forecast=input.nextTarget,urgency=clamp01(input.forecastUrgency??0),transitionMs=Math.max(0,Number.isFinite(input.transitionMs)?input.transitionMs??0:0),imminent=Boolean(forecast)&&urgency>=.65&&transitionMs<=1800;
  if(imminent&&forecast)return{owner:'forecast' as BossClearedSafeLaneForecastOwner,target:{...forecast},confidence:Math.max(clamp01(input.currentConfidence??0),clamp01(.58+urgency*.34)),presentationOnly:true as const};
  if(current)return{owner:'current' as BossClearedSafeLaneForecastOwner,target:{...current},confidence:clamp01(input.currentConfidence??0),presentationOnly:true as const};
  if(forecast&&urgency>=.82)return{owner:'forecast' as BossClearedSafeLaneForecastOwner,target:{...forecast},confidence:clamp01(.58+urgency*.34),presentationOnly:true as const};
  return{owner:'none' as BossClearedSafeLaneForecastOwner,target:undefined,confidence:0,presentationOnly:true as const};
}

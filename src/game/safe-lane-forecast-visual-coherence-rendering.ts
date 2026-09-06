import type { Vec2 } from '../core/math.js';
import { bossClearedSafeLaneForecastTarget } from './boss-cleared-safe-lane-forecast-arbitration-rendering.js';
export interface SafeLaneForecastVisualCoherenceInput{currentTarget:Vec2;currentConfidence:number;nextTarget?:Vec2|undefined;forecastUrgency?:number|undefined;transitionMs?:number|undefined;promotionOwner?:'current'|'forecast'|undefined;}
export function safeLaneForecastVisualCoherencePresentation(input:SafeLaneForecastVisualCoherenceInput,reducedFlash=false){
  const raw=bossClearedSafeLaneForecastTarget({currentTarget:input.currentTarget,currentConfidence:input.currentConfidence,nextTarget:input.nextTarget,forecastUrgency:input.forecastUrgency,transitionMs:input.transitionMs},reducedFlash);
  const targetDistance=input.nextTarget?Math.hypot(input.nextTarget.x-input.currentTarget.x,input.nextTarget.y-input.currentTarget.y):Infinity,handoffSettled=Boolean(input.nextTarget)&&targetDistance<=8;
  const forcedForecast=input.promotionOwner==='forecast'&&Boolean(input.nextTarget)&&!handoffSettled,forcedCurrent=input.promotionOwner==='current';
  const owner=forcedForecast?'forecast':forcedCurrent?'current':raw.owner,target=forcedForecast?input.nextTarget!:forcedCurrent?input.currentTarget:raw.target??input.currentTarget,confidence=forcedForecast?Math.max(raw.confidence,.72):forcedCurrent?input.currentConfidence:raw.confidence,forecastPromoted=owner==='forecast',bridgeVisible=Boolean(input.nextTarget)&&!handoffSettled,forecastDetailVisible=Boolean(input.nextTarget)&&!handoffSettled,directionVisible=forecastDetailVisible&&targetDistance>8,arrivalAlphaScale=(handoffSettled?.58:1)*(reducedFlash?.82:1);
  return{owner,target:{...target},confidence,forecastPromoted,handoffSettled,bridgeVisible,forecastDetailVisible,directionVisible,arrivalAlphaScale,primaryAlphaScale:reducedFlash?.82:1,bridgeAlphaScale:bridgeVisible?(forecastPromoted?.42:1)*(reducedFlash?.62:1):0,presentationOnly:true as const};
}

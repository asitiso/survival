import { clamp } from '../../core/math.js';
import type { BossArenaHazard } from '../boss-arena.js';
import { mythicArenaHazardContact } from './mythic-arena-collision.js';
import type { SafeLaneForecast } from './safe-lane-forecast.js';

export type SafeTelegraphStage='hold'|'prepare'|'move'|'critical';
export interface SafeTelegraphTimeline {
  label:'SAFE TIMELINE';
  safeTransitionMs:number;
  hazardActivationMs:number|null;
  decisionWindowMs:number;
  urgency:number;
  stage:SafeTelegraphStage;
  autoMove:false;
}

function threatens(h:BossArenaHazard,forecast:SafeLaneForecast,heroRadius:number):boolean{
  return mythicArenaHazardContact(h,forecast.currentTarget,heroRadius).hit||mythicArenaHazardContact(h,forecast.nextTarget,heroRadius).hit;
}
function stageFor(ms:number,urgency:number):SafeTelegraphStage{
  if(ms<=220||urgency>=.94)return'critical';
  if(ms<=520||urgency>=.7)return'move';
  if(ms<=1100||urgency>=.45)return'prepare';
  return'hold';
}
export function safeTelegraphTimeline(forecast:SafeLaneForecast|null,hazards:readonly BossArenaHazard[],heroRadius:number):SafeTelegraphTimeline|null{
  if(!forecast)return null;
  const upcoming=hazards.filter((h)=>h.telegraph>0&&threatens(h,forecast,heroRadius)).map((h)=>Math.round(h.telegraph*1000));
  const hazardActivationMs=upcoming.length?Math.max(0,Math.min(...upcoming)):null;
  const safeTransitionMs=Math.max(0,Math.round(forecast.transitionMs));
  const decisionWindowMs=hazardActivationMs===null?safeTransitionMs:Math.min(safeTransitionMs,hazardActivationMs);
  const urgency=clamp(Math.max(forecast.urgency,decisionWindowMs<=220?.98:decisionWindowMs<=520?.82:decisionWindowMs<=1100?.58:.25),0,1);
  return{label:'SAFE TIMELINE',safeTransitionMs,hazardActivationMs,decisionWindowMs,urgency,stage:stageFor(decisionWindowMs,urgency),autoMove:false};
}

import { clamp } from '../../core/math.js';
import type { SafeTelegraphTimeline, SafeTelegraphStage } from './safe-telegraph-timeline.js';

export type LastLawTimelineStage='none'|'warning'|'active';
export interface LastLawTimelineIdentity { active:boolean; label:string; accent:string; }
export interface LastLawSafeTimeline extends Omit<SafeTelegraphTimeline,'label'> {
  label:string;
  lawStage:LastLawTimelineStage;
  lawHpRatio:number;
  lawUrgency:number;
  accent:string;
}

export function lastLawSafeTimeline(
  safe:SafeTelegraphTimeline,
  isMythic:boolean,
  hpRatio:number,
  identity:LastLawTimelineIdentity|null,
):LastLawSafeTimeline{
  const hp=clamp(Number.isFinite(hpRatio)?hpRatio:1,0,1);
  const active=Boolean(isMythic&&identity?.active);
  const warning=Boolean(isMythic&&!active&&hp<=.22);
  const lawStage:LastLawTimelineStage=active?'active':warning?'warning':'none';
  const lawUrgency=active?1:warning?clamp((.22-hp)/.07,.15,.92):0;
  const urgency=clamp(Math.max(safe.urgency,lawUrgency),0,1);
  const stage:SafeTelegraphStage=active?'critical':warning&&urgency>=.7?'move':safe.stage;
  const label=active?(identity?.label??'MYTHIC LAST LAW'):warning?'LAST LAW · PREPARE':safe.label;
  const accent=active?(identity?.accent??'#ff6f7f'):warning?'#ffd36f':'#8fffd3';
  return{...safe,label,stage,urgency,lawStage,lawHpRatio:hp,lawUrgency,accent,autoMove:false};
}

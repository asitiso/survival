import type { CombatAttentionPrimary } from './combat-cue-priority.js';
import type { PresentationQuality } from './presentation-budget.js';

export const WORLD_VFX_PRIORITIES=['critical','tactical','informational','decorative'] as const;
export type WorldVfxPriority=typeof WORLD_VFX_PRIORITIES[number];
export interface WorldVfxPriorityPolicy{
  primary:CombatAttentionPrimary;
  quality:PresentationQuality;
  alpha:Record<WorldVfxPriority,number>;
  maxLowPriorityLayers:0|1|2|3;
}

export function worldVfxPriorityPolicy(primary:CombatAttentionPrimary,quality:PresentationQuality):WorldVfxPriorityPolicy{
  if(primary==='hero-critical'||primary==='core-critical'||primary==='damage-critical')return{primary,quality,alpha:{critical:1,tactical:.62,informational:.25,decorative:0},maxLowPriorityLayers:0};
  if(primary==='boss-response')return{primary,quality,alpha:{critical:1,tactical:.88,informational:.52,decorative:.18},maxLowPriorityLayers:1};
  if(primary==='damage-heavy')return{primary,quality,alpha:{critical:1,tactical:.82,informational:.48,decorative:.20},maxLowPriorityLayers:1};
  if(primary==='boss-countdown')return{primary,quality,alpha:{critical:1,tactical:.80,informational:.42,decorative:.15},maxLowPriorityLayers:1};
  if(quality==='low')return{primary,quality,alpha:{critical:1,tactical:.92,informational:.68,decorative:.38},maxLowPriorityLayers:1};
  if(quality==='medium')return{primary,quality,alpha:{critical:1,tactical:1,informational:.85,decorative:.68},maxLowPriorityLayers:2};
  return{primary,quality,alpha:{critical:1,tactical:1,informational:1,decorative:1},maxLowPriorityLayers:3};
}

export function worldVfxPriorityAlpha(policy:WorldVfxPriorityPolicy,priority:WorldVfxPriority):number{return policy.alpha[priority];}

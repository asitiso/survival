import type { CombatAttentionPrimary } from './combat-cue-priority.js';
import type { PresentationQuality } from './presentation-budget.js';
import type { WorldVfxPriority } from './world-vfx-priority-arbitration.js';
export type WorldVfxOccupancyId='objective-activation'|'objective-completion'|'objective-failure'|'field-event-lifecycle'|'boss-arena-transition'|'map-evolution-aftermath'|'boss-hazard-aftermath'|'elite-pack-approach'|'enemy-spawn-lane';
export interface WorldVfxOccupancyCandidate{id:WorldVfxOccupancyId|string;priority:Exclude<WorldVfxPriority,'critical'>;area:number;}
export interface WorldVfxOccupancyLimits{maxCoverage:number;maxLargeAreaEffects:number;}
export interface WorldVfxOccupancyResult extends WorldVfxOccupancyLimits{allowedIds:string[];coverage:number;candidateCount:number;}
const WEIGHT:Record<Exclude<WorldVfxPriority,'critical'>,number>={tactical:0,informational:1,decorative:2};
export function worldVfxOccupancyLimits(quality:PresentationQuality,combatPrimary:CombatAttentionPrimary):WorldVfxOccupancyLimits{
  const base=quality==='high'?{maxCoverage:.34,maxLargeAreaEffects:4}:quality==='medium'?{maxCoverage:.28,maxLargeAreaEffects:3}:{maxCoverage:.22,maxLargeAreaEffects:2};
  if(combatPrimary==='hero-critical'||combatPrimary==='core-critical'||combatPrimary==='damage-critical')return{maxCoverage:base.maxCoverage*.55,maxLargeAreaEffects:Math.min(2,base.maxLargeAreaEffects)};
  if(combatPrimary==='boss-response'||combatPrimary==='damage-heavy'||combatPrimary==='boss-countdown')return{maxCoverage:base.maxCoverage*.72,maxLargeAreaEffects:Math.min(3,base.maxLargeAreaEffects)};
  return base;
}
export function resolveWorldVfxOccupancy(input:{quality:PresentationQuality;combatPrimary:CombatAttentionPrimary;viewportArea:number;candidates:readonly WorldVfxOccupancyCandidate[]}):WorldVfxOccupancyResult{
  const limits=worldVfxOccupancyLimits(input.quality,input.combatPrimary),viewportArea=Math.max(1,input.viewportArea);
  const candidates=[...input.candidates].filter(c=>Number.isFinite(c.area)&&c.area>0).sort((a,b)=>WEIGHT[a.priority]-WEIGHT[b.priority]||a.id.localeCompare(b.id));
  const allowedIds:string[]=[];let coverage=0;
  for(const candidate of candidates){
    if(allowedIds.length>=limits.maxLargeAreaEffects)break;
    const ratio=Math.max(0,candidate.area)/viewportArea;
    if(coverage+ratio>limits.maxCoverage+1e-9)continue;
    allowedIds.push(candidate.id);coverage+=ratio;
  }
  return{...limits,allowedIds,coverage,candidateCount:candidates.length};
}

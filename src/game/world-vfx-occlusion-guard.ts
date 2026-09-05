import type { WorldVfxPriority } from './world-vfx-priority-arbitration.js';
export interface WorldVfxProtectedAnchor{x:number;y:number;radius:number;}
export interface WorldVfxCueBounds{x:number;y:number;radius:number;}
export interface WorldVfxOcclusionInput{priority:WorldVfxPriority;cue:WorldVfxCueBounds;protectedAnchors:readonly WorldVfxProtectedAnchor[];}
export function worldVfxOcclusionScale(input:WorldVfxOcclusionInput):number{
  if(input.priority==='critical'||input.protectedAnchors.length===0)return 1;
  const overlaps=input.protectedAnchors.some(anchor=>Math.hypot(input.cue.x-anchor.x,input.cue.y-anchor.y)<input.cue.radius+anchor.radius);
  if(!overlaps)return 1;
  if(input.priority==='tactical')return .58;
  if(input.priority==='informational')return .28;
  return 0;
}

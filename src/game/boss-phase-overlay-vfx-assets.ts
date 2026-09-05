import type { BossArchetype } from './boss-patterns.js';

export const BOSS_PHASE_OVERLAY_VFX_ATLAS = {
  src: './assets/bosses/boss-phase-overlays.png',
  columns: 3,
  rows: 4,
  cellSize: 128,
  width: 384,
  height: 512,
} as const;

export const BOSS_PHASE_OVERLAY_ARCHETYPES: readonly BossArchetype[] = ['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'] as const;
export type BossOverlayPhase = 2|3;
export interface BossPhaseOverlayVfxRect { sx:number; sy:number; sw:number; sh:number; }

export function bossPhaseOverlayVfxSprite(archetype:BossArchetype,phase:BossOverlayPhase):BossPhaseOverlayVfxRect{
  const index=BOSS_PHASE_OVERLAY_ARCHETYPES.indexOf(archetype),column=index%3,row=Math.floor(index/3)+(phase===2?0:2),size=BOSS_PHASE_OVERLAY_VFX_ATLAS.cellSize;
  return {sx:column*size,sy:row*size,sw:size,sh:size};
}

export function auditBossPhaseOverlayVfxAtlas(){
  const cells=new Set<string>(),outOfBounds:string[]=[];
  for(const archetype of BOSS_PHASE_OVERLAY_ARCHETYPES)for(const phase of [2,3] as const){
    const r=bossPhaseOverlayVfxSprite(archetype,phase);cells.add(`${r.sx}:${r.sy}`);
    if(r.sx<0||r.sy<0||r.sx+r.sw>BOSS_PHASE_OVERLAY_VFX_ATLAS.width||r.sy+r.sh>BOSS_PHASE_OVERLAY_VFX_ATLAS.height)outOfBounds.push(`${archetype}:${phase}`);
  }
  return {archetypeCount:BOSS_PHASE_OVERLAY_ARCHETYPES.length,phaseCount:2,itemCount:12,coverage:cells.size/12,uniqueCellCount:cells.size,outOfBounds,passed:cells.size===12&&outOfBounds.length===0};
}

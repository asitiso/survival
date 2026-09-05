import type { EnemyTarget } from './enemies.js';
export const ELITE_PACK_APPROACH_FORMATION_VFX_TARGETS=['hero','core'] as const satisfies readonly EnemyTarget[];
export const ELITE_PACK_APPROACH_FORMATION_VFX_STATES=['approach','formation','focus'] as const;
export type ElitePackApproachFormationVfxState=typeof ELITE_PACK_APPROACH_FORMATION_VFX_STATES[number];
export const ELITE_PACK_APPROACH_FORMATION_VFX_ATLAS={src:'./assets/enemies/elite-pack-approach-formation-vfx.png',columns:2,rows:3,cellSize:128,width:256,height:384} as const;
const COL:Readonly<Record<EnemyTarget,number>>={hero:0,core:1};
const ROW:Readonly<Record<ElitePackApproachFormationVfxState,number>>={approach:0,formation:1,focus:2};
export function elitePackApproachFormationVfxSprite(target:EnemyTarget,state:ElitePackApproachFormationVfxState){return{sx:COL[target]*128,sy:ROW[state]*128,sw:128 as const,sh:128 as const,presentationOnly:true as const,loadFailureBlocksGameplay:false as const};}
export function auditElitePackApproachFormationVfxAtlas(){const cells=new Set<string>(),outOfBounds:string[]=[];for(const target of ELITE_PACK_APPROACH_FORMATION_VFX_TARGETS)for(const state of ELITE_PACK_APPROACH_FORMATION_VFX_STATES){const r=elitePackApproachFormationVfxSprite(target,state);cells.add(`${r.sx}:${r.sy}`);if(r.sx<0||r.sy<0||r.sx+r.sw>ELITE_PACK_APPROACH_FORMATION_VFX_ATLAS.width||r.sy+r.sh>ELITE_PACK_APPROACH_FORMATION_VFX_ATLAS.height)outOfBounds.push(`${target}:${state}`);}return{targetCount:2,stateCount:3,itemCount:6,uniqueCellCount:cells.size,outOfBounds,passed:cells.size===6&&outOfBounds.length===0};}

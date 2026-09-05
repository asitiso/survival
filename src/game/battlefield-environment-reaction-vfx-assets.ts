import type { MapId } from './map-layouts.js';
export const BATTLEFIELD_ENVIRONMENT_REACTION_VFX_ATLAS={src:'./assets/arena/battlefield-environment-reaction-vfx.png',columns:4,rows:2,cellSize:128,width:512,height:256} as const;
export type BattlefieldEnvironmentReactionKind='crystalBlast'|'evolutionCollapse';
export type ArcherReactionVfxId='archerProjectile'|'archerImpact';
const CELLS:Record<string,readonly[number,number]>={
 'ruinedGate:crystalBlast':[0,0],'ruinedGate:evolutionCollapse':[1,0],
 'frozenFen:crystalBlast':[2,0],'frozenFen:evolutionCollapse':[3,0],
 'crystalQuarry:crystalBlast':[0,1],'crystalQuarry:evolutionCollapse':[1,1],
 archerProjectile:[2,1],archerImpact:[3,1],
};
function rect(c:readonly[number,number]){return{sx:c[0]*128,sy:c[1]*128,sw:128,sh:128};}
export function battlefieldEnvironmentReactionVfxSprite(id:ArcherReactionVfxId):ReturnType<typeof rect>;
export function battlefieldEnvironmentReactionVfxSprite(mapId:MapId,kind:BattlefieldEnvironmentReactionKind):ReturnType<typeof rect>;
export function battlefieldEnvironmentReactionVfxSprite(a:MapId|ArcherReactionVfxId,b?:BattlefieldEnvironmentReactionKind){const key=b?`${a}:${b}`:a;const cell=CELLS[key];if(!cell)throw new Error(`Unknown battlefield reaction: ${key}`);return rect(cell);}
export function auditBattlefieldEnvironmentReactionVfxAtlas(){const keys=Object.keys(CELLS),seen=new Set<string>(),outOfBounds:string[]=[];for(const key of keys){const c=CELLS[key]!;const r=rect(c);seen.add(`${r.sx}:${r.sy}`);if(r.sx<0||r.sy<0||r.sx+r.sw>512||r.sy+r.sh>256)outOfBounds.push(key);}return{itemCount:8,uniqueCellCount:seen.size,terrainReactionCount:6,archerCueCount:2,outOfBounds,passed:seen.size===8&&outOfBounds.length===0};}

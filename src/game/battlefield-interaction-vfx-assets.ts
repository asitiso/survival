import type { BattlefieldObjectiveId } from './battlefield-objectives.js';
import type { FieldNodeKind } from './endless/world-evolution.js';
import type { PickupKind } from './pickups.js';

export type BattlefieldCoreVisualState = 'normal' | 'warning' | 'critical';
export type BattlefieldSpawnPortalKind = 'regular' | 'elite';
export type BattlefieldInteractionGroup = 'core' | 'pickup' | 'supply' | 'objective' | 'field-node' | 'spawn-portal';
export type BattlefieldInteractionId = BattlefieldCoreVisualState | PickupKind | 'crate' | BattlefieldObjectiveId | FieldNodeKind | BattlefieldSpawnPortalKind;

export const BATTLEFIELD_INTERACTION_VFX_ATLAS = {
  src: './assets/arena/battlefield-interaction-vfx.png',
  columns: 4,
  rows: 4,
  cellSize: 128,
  width: 512,
  height: 512,
} as const;

const CELL_BY_KEY = {
  'core:normal': [0,0],
  'core:warning': [1,0],
  'core:critical': [2,0],
  'pickup:xp': [3,0],
  'pickup:coin': [0,1],
  'supply:crate': [1,1],
  'objective:riftSeal': [2,1],
  'objective:beaconDefense': [3,1],
  'objective:cursedAltar': [0,2],
  'field-node:mana_well': [1,2],
  'field-node:sanctuary_zone': [2,2],
  'field-node:barricade': [3,2],
  'field-node:safe_corridor': [0,3],
  'field-node:volatile_zone': [1,3],
  'spawn-portal:regular': [2,3],
  'spawn-portal:elite': [3,3],
} as const satisfies Readonly<Record<string, readonly [number, number]>>;

export interface BattlefieldInteractionSprite { sx:number; sy:number; sw:128; sh:128; }

export function battlefieldCoreVisualState(hpRatio:number):BattlefieldCoreVisualState {
  const ratio = Number.isFinite(hpRatio) ? Math.max(0, Math.min(1, hpRatio)) : 1;
  return ratio <= 0.30 ? 'critical' : ratio <= 0.60 ? 'warning' : 'normal';
}

export function battlefieldInteractionSprite(group:BattlefieldInteractionGroup,id:BattlefieldInteractionId):BattlefieldInteractionSprite {
  const key=`${group}:${id}` as keyof typeof CELL_BY_KEY;
  const cell=CELL_BY_KEY[key] ?? CELL_BY_KEY['core:normal'];
  return {sx:cell[0]*128,sy:cell[1]*128,sw:128,sh:128};
}

export function auditBattlefieldInteractionVfxAtlas(){
  const keys=Object.keys(CELL_BY_KEY) as Array<keyof typeof CELL_BY_KEY>;
  const cells=new Set<string>(); const outOfBounds:string[]=[];
  for(const key of keys){const [c,r]=CELL_BY_KEY[key];cells.add(`${c}:${r}`);if(c<0||r<0||c>=4||r>=4)outOfBounds.push(key);}
  const itemCount=keys.length,coverage=itemCount/16,uniqueCellCount=cells.size;
  return {itemCount,coverage,uniqueCellCount,outOfBounds,assetSrc:BATTLEFIELD_INTERACTION_VFX_ATLAS.src,textFallbackPreserved:true,loadFailureBlocksGameplay:false,passed:itemCount===16&&coverage===1&&uniqueCellCount===16&&outOfBounds.length===0};
}

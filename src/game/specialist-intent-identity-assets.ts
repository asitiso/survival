import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './config.js';

export const SPECIALIST_INTENT_TYPES = ['bomber','shaman','shieldbearer','assassin','siegeGolem','nullifier'] as const;
export type SpecialistIntentType = typeof SPECIALIST_INTENT_TYPES[number];

export const SPECIALIST_INTENT_ATLAS = {
  src: './assets/enemies/specialist-intent-icons.png',
  columns: 3,
  rows: 2,
  cellSize: 96,
  width: 288,
  height: 192,
} as const;

const CELL_BY_TYPE: Readonly<Record<SpecialistIntentType, readonly [column:number,row:number]>> = {
  bomber:[0,0], shaman:[1,0], shieldbearer:[2,0],
  assassin:[0,1], siegeGolem:[1,1], nullifier:[2,1],
};

export interface SpecialistIntentIcon {
  type: SpecialistIntentType;
  sx:number; sy:number; sw:number; sh:number;
  animated:false;
  motionAmplitude:0;
  legacyFallbackPreserved:true;
  loadFailureBlocksGameplay:false;
}

export interface SpecialistIntentOnBodyLayout {
  iconSize:number;
  worldCenterX:number;
  worldCenterY:number;
  localCenterX:number;
  localCenterY:number;
}

export interface SpecialistIntentState {
  guardHp:number;
  specialistTimer:number;
  target:'hero'|'core';
  heroInsideNullifier:boolean;
}

export function isSpecialistIntentType(type:string): type is SpecialistIntentType {
  return (SPECIALIST_INTENT_TYPES as readonly string[]).includes(type);
}

export function specialistIntentIcon(type:SpecialistIntentType): SpecialistIntentIcon {
  const [column,row]=CELL_BY_TYPE[type];
  return {
    type,
    sx:column*SPECIALIST_INTENT_ATLAS.cellSize,
    sy:row*SPECIALIST_INTENT_ATLAS.cellSize,
    sw:SPECIALIST_INTENT_ATLAS.cellSize,
    sh:SPECIALIST_INTENT_ATLAS.cellSize,
    animated:false,
    motionAmplitude:0,
    legacyFallbackPreserved:true,
    loadFailureBlocksGameplay:false,
  };
}

const clamp=(value:number,min:number,max:number):number=>Math.max(min,Math.min(max,value));

export function specialistIntentOnBodyLayout(radius:number,world:{x:number;y:number}):SpecialistIntentOnBodyLayout {
  const safeRadius=Number.isFinite(radius)?radius:22;
  const iconSize=clamp(Math.round(safeRadius*.72),16,18);
  const sourceX=Number.isFinite(world.x)?world.x:LOGICAL_WIDTH/2;
  const sourceY=Number.isFinite(world.y)?world.y:LOGICAL_HEIGHT/2;
  const desiredY=sourceY+safeRadius+16;
  const worldCenterX=clamp(sourceX,iconSize/2,LOGICAL_WIDTH-iconSize/2);
  const worldCenterY=clamp(desiredY,iconSize/2,LOGICAL_HEIGHT-iconSize/2);
  return {
    iconSize,
    worldCenterX,
    worldCenterY,
    localCenterX:worldCenterX-sourceX,
    localCenterY:worldCenterY-sourceY,
  };
}

export function specialistIntentEmphasis(type:SpecialistIntentType,state:SpecialistIntentState):0|1 {
  if(type==='bomber'||type==='shaman')return 1;
  if(type==='shieldbearer')return state.guardHp>0?1:0;
  if(type==='assassin')return state.specialistTimer<=1.2?1:0;
  if(type==='siegeGolem')return state.target==='core'?1:0;
  return state.heroInsideNullifier?1:0;
}

export interface SpecialistIntentAtlasAudit {
  itemCount:number;
  coverage:number;
  uniqueCellCount:number;
  outOfBounds:SpecialistIntentType[];
  passed:boolean;
}

export function auditSpecialistIntentAtlas():SpecialistIntentAtlasAudit {
  const cells=new Set<string>();
  const outOfBounds:SpecialistIntentType[]=[];
  for(const type of SPECIALIST_INTENT_TYPES){
    const [column,row]=CELL_BY_TYPE[type];
    cells.add(`${column}:${row}`);
    if(column<0||row<0||column>=SPECIALIST_INTENT_ATLAS.columns||row>=SPECIALIST_INTENT_ATLAS.rows)outOfBounds.push(type);
  }
  const coverage=SPECIALIST_INTENT_TYPES.length===6?1:SPECIALIST_INTENT_TYPES.length/6;
  return {itemCount:SPECIALIST_INTENT_TYPES.length,coverage,uniqueCellCount:cells.size,outOfBounds,passed:coverage===1&&cells.size===6&&outOfBounds.length===0};
}

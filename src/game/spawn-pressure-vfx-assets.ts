export const SPAWN_PRESSURE_VFX_KINDS = ['regular','specialist','elite','boss'] as const;
export type SpawnPressureKind = typeof SPAWN_PRESSURE_VFX_KINDS[number];
export const SPAWN_PRESSURE_VFX_STATES = ['portal','arrival'] as const;
export type SpawnPressureVfxState = typeof SPAWN_PRESSURE_VFX_STATES[number];

export const SPAWN_PRESSURE_VFX_ATLAS = {
  src: './assets/arena/spawn-pressure-vfx.png',
  columns: 4,
  rows: 2,
  cellSize: 128,
  width: 512,
  height: 256,
} as const;

const CELL_BY_KEY = {
  'regular:portal':[0,0], 'specialist:portal':[1,0], 'elite:portal':[2,0], 'boss:portal':[3,0],
  'regular:arrival':[0,1], 'specialist:arrival':[1,1], 'elite:arrival':[2,1], 'boss:arrival':[3,1],
} as const satisfies Readonly<Record<`${SpawnPressureKind}:${SpawnPressureVfxState}`,readonly [number,number]>>;

export interface SpawnPressureVfxSprite { sx:number; sy:number; sw:128; sh:128; }
export function spawnPressureVfxSprite(kind:SpawnPressureKind,state:SpawnPressureVfxState):SpawnPressureVfxSprite {
  const [c,r]=CELL_BY_KEY[`${kind}:${state}`];
  return {sx:c*128,sy:r*128,sw:128,sh:128};
}
export function auditSpawnPressureVfxAtlas(){
  const keys=Object.keys(CELL_BY_KEY) as Array<keyof typeof CELL_BY_KEY>; const cells=new Set<string>(); const outOfBounds:string[]=[];
  for(const key of keys){const [c,r]=CELL_BY_KEY[key];cells.add(`${c}:${r}`);if(c<0||r<0||c>=4||r>=2)outOfBounds.push(key);}
  const kindCount=SPAWN_PRESSURE_VFX_KINDS.length,stateCount=SPAWN_PRESSURE_VFX_STATES.length,itemCount=keys.length,uniqueCellCount=cells.size,coverage=itemCount/(kindCount*stateCount);
  return {kindCount,stateCount,itemCount,uniqueCellCount,coverage,outOfBounds,assetSrc:SPAWN_PRESSURE_VFX_ATLAS.src,interactionFallbackPreserved:true,loadFailureBlocksGameplay:false,passed:itemCount===8&&uniqueCellCount===8&&coverage===1&&outOfBounds.length===0};
}

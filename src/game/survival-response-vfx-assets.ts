export const SURVIVAL_RESPONSE_VFX_ATLAS = {
  src: './assets/arena/survival-response-vfx.png',
  columns: 3,
  rows: 2,
  cellSize: 128,
  width: 384,
  height: 256,
} as const;

export const SURVIVAL_RESPONSE_VFX_KINDS = ['heroPotion','heroPotionBoost','heroGuard','coreHit','coreRecover','coreGuard'] as const;
export type SurvivalResponseVfxKind = typeof SURVIVAL_RESPONSE_VFX_KINDS[number];

const CELL: Readonly<Record<SurvivalResponseVfxKind, readonly [number,number]>> = {
  heroPotion:[0,0], heroPotionBoost:[1,0], heroGuard:[2,0],
  coreHit:[0,1], coreRecover:[1,1], coreGuard:[2,1],
} as const;

export interface SurvivalResponseVfxSprite { sx:number; sy:number; sw:128; sh:128; }

export function survivalResponseVfxSprite(kind:SurvivalResponseVfxKind):SurvivalResponseVfxSprite {
  const [column,row]=CELL[kind],size=SURVIVAL_RESPONSE_VFX_ATLAS.cellSize;
  return {sx:column*size,sy:row*size,sw:size,sh:size};
}

export function auditSurvivalResponseVfxAtlas(){
  const cells=new Set<string>(),outOfBounds:string[]=[];
  for(const kind of SURVIVAL_RESPONSE_VFX_KINDS){
    const r=survivalResponseVfxSprite(kind);cells.add(`${r.sx}:${r.sy}`);
    if(r.sx<0||r.sy<0||r.sx+r.sw>SURVIVAL_RESPONSE_VFX_ATLAS.width||r.sy+r.sh>SURVIVAL_RESPONSE_VFX_ATLAS.height)outOfBounds.push(kind);
  }
  return {itemCount:SURVIVAL_RESPONSE_VFX_KINDS.length,uniqueCellCount:cells.size,coverage:cells.size/SURVIVAL_RESPONSE_VFX_KINDS.length,outOfBounds,passed:cells.size===SURVIVAL_RESPONSE_VFX_KINDS.length&&outOfBounds.length===0};
}

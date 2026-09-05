export const FREEZE_CONTROL_VFX_ATLAS = {
  src: './assets/enemies/freeze-control-vfx.png',
  columns: 4,
  rows: 2,
  cellSize: 128,
  width: 512,
  height: 256,
} as const;

export const FREEZE_CONTROL_VFX_CLASSES = ['regular','specialist','elite','boss'] as const;
export type FreezeControlVfxClass = typeof FREEZE_CONTROL_VFX_CLASSES[number];
export const FREEZE_CONTROL_VFX_STATES = ['active','shatter'] as const;
export type FreezeControlVfxState = typeof FREEZE_CONTROL_VFX_STATES[number];

export function freezeControlVfxClassForEnemyType(type:string):FreezeControlVfxClass {
  if(type==='boss')return'boss';
  if(type==='elite')return'elite';
  if(type==='shieldbearer'||type==='assassin'||type==='siegeGolem'||type==='nullifier')return'specialist';
  return'regular';
}

export interface FreezeControlVfxSprite { sx:number;sy:number;sw:128;sh:128; }
export function freezeControlVfxSprite(enemyClass:FreezeControlVfxClass,state:FreezeControlVfxState):FreezeControlVfxSprite {
  const column=FREEZE_CONTROL_VFX_CLASSES.indexOf(enemyClass),row=state==='active'?0:1,size=FREEZE_CONTROL_VFX_ATLAS.cellSize;
  return {sx:column*size,sy:row*size,sw:size,sh:size};
}

export function auditFreezeControlVfxAtlas(){
  const cells=new Set<string>(),outOfBounds:string[]=[];
  for(const enemyClass of FREEZE_CONTROL_VFX_CLASSES)for(const state of FREEZE_CONTROL_VFX_STATES){
    const r=freezeControlVfxSprite(enemyClass,state);cells.add(`${r.sx}:${r.sy}`);
    if(r.sx<0||r.sy<0||r.sx+r.sw>FREEZE_CONTROL_VFX_ATLAS.width||r.sy+r.sh>FREEZE_CONTROL_VFX_ATLAS.height)outOfBounds.push(`${enemyClass}:${state}`);
  }
  const itemCount=FREEZE_CONTROL_VFX_CLASSES.length*FREEZE_CONTROL_VFX_STATES.length;
  return {classCount:FREEZE_CONTROL_VFX_CLASSES.length,stateCount:FREEZE_CONTROL_VFX_STATES.length,itemCount,uniqueCellCount:cells.size,coverage:cells.size/itemCount,outOfBounds,passed:cells.size===itemCount&&outOfBounds.length===0};
}

import type { EnemyTarget, EnemyType } from './enemies.js';

export const ENEMY_TARGET_PRESSURE_VFX_CLASSES = ['regular','specialist','elite','boss'] as const;
export type EnemyTargetPressureVfxClass = typeof ENEMY_TARGET_PRESSURE_VFX_CLASSES[number];
export const ENEMY_TARGET_PRESSURE_VFX_TARGETS = ['hero','core'] as const;

export const ENEMY_TARGET_PRESSURE_VFX_ATLAS = {
  src: './assets/enemies/enemy-target-pressure-vfx.png',
  columns: 4,
  rows: 2,
  cellSize: 128,
  width: 512,
  height: 256,
} as const;

export function enemyTargetPressureClassForEnemyType(type:EnemyType):EnemyTargetPressureVfxClass{
  if(type==='boss')return'boss';
  if(type==='elite')return'elite';
  if(type==='shieldbearer'||type==='assassin'||type==='siegeGolem'||type==='nullifier')return'specialist';
  return'regular';
}

export function enemyTargetPressureVisible(type:EnemyType,target:EnemyTarget):boolean{
  if(target==='core')return true;
  return type==='archer'||type==='bomber'||type==='shaman'||type==='shieldbearer'||type==='assassin'||type==='siegeGolem'||type==='nullifier'||type==='elite'||type==='boss';
}

export function enemyTargetPressureVfxSprite(enemyClass:EnemyTargetPressureVfxClass,target:EnemyTarget){
  const column=ENEMY_TARGET_PRESSURE_VFX_CLASSES.indexOf(enemyClass);
  const row=ENEMY_TARGET_PRESSURE_VFX_TARGETS.indexOf(target);
  if(column<0||row<0)throw new Error(`Unknown enemy target pressure VFX: ${enemyClass}:${target}`);
  const size=ENEMY_TARGET_PRESSURE_VFX_ATLAS.cellSize;
  return {sx:column*size,sy:row*size,sw:size,sh:size,presentationOnly:true as const,loadFailureBlocksGameplay:false as const};
}

export function auditEnemyTargetPressureVfxAtlas(){
  const cells=new Set<string>(),outOfBounds:string[]=[];
  for(const enemyClass of ENEMY_TARGET_PRESSURE_VFX_CLASSES)for(const target of ENEMY_TARGET_PRESSURE_VFX_TARGETS){
    const r=enemyTargetPressureVfxSprite(enemyClass,target);cells.add(`${r.sx}:${r.sy}`);
    if(r.sx<0||r.sy<0||r.sx+r.sw>ENEMY_TARGET_PRESSURE_VFX_ATLAS.width||r.sy+r.sh>ENEMY_TARGET_PRESSURE_VFX_ATLAS.height)outOfBounds.push(`${enemyClass}:${target}`);
  }
  const itemCount=ENEMY_TARGET_PRESSURE_VFX_CLASSES.length*ENEMY_TARGET_PRESSURE_VFX_TARGETS.length;
  return {classCount:ENEMY_TARGET_PRESSURE_VFX_CLASSES.length,targetCount:ENEMY_TARGET_PRESSURE_VFX_TARGETS.length,itemCount,coverage:cells.size/itemCount,uniqueCellCount:cells.size,outOfBounds,passed:itemCount===8&&cells.size===itemCount&&outOfBounds.length===0};
}

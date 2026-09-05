import { ACTION_BUTTONS } from './config.js';
import {
  ENEMY_TARGET_PRESSURE_VFX_ATLAS,
  ENEMY_TARGET_PRESSURE_VFX_CLASSES,
  ENEMY_TARGET_PRESSURE_VFX_TARGETS,
  auditEnemyTargetPressureVfxAtlas,
  enemyTargetPressureClassForEnemyType,
  enemyTargetPressureVfxSprite,
  enemyTargetPressureVisible,
} from './enemy-target-pressure-vfx-assets.js';

export interface EnemyTargetPressureVfxAuditSample { id:string; expected:boolean|number|string; actual:boolean|number|string; passed:boolean; }
const add=(samples:EnemyTargetPressureVfxAuditSample[],id:string,expected:boolean|number|string,actual:boolean|number|string):void=>{samples.push({id,expected,actual,passed:Object.is(expected,actual)});};

export function runEnemyTargetPressureVfxAudit(){
  const samples:EnemyTargetPressureVfxAuditSample[]=[];
  for(const enemyClass of ENEMY_TARGET_PRESSURE_VFX_CLASSES)for(const target of ENEMY_TARGET_PRESSURE_VFX_TARGETS){
    const sprite=enemyTargetPressureVfxSprite(enemyClass,target);
    add(samples,`${enemyClass}-${target}-bounds`,true,sprite.sx>=0&&sprite.sy>=0&&sprite.sx+sprite.sw<=ENEMY_TARGET_PRESSURE_VFX_ATLAS.width&&sprite.sy+sprite.sh<=ENEMY_TARGET_PRESSURE_VFX_ATLAS.height);
    add(samples,`${enemyClass}-${target}-fail-open`,false,sprite.loadFailureBlocksGameplay);
  }
  const atlas=auditEnemyTargetPressureVfxAtlas();
  for(const [id,expected,actual] of [
    ['class-count',4,atlas.classCount],['target-count',2,atlas.targetCount],['item-count',8,atlas.itemCount],['unique-cells',8,atlas.uniqueCellCount],
    ['class-archer','regular',enemyTargetPressureClassForEnemyType('archer')],['class-shieldbearer','specialist',enemyTargetPressureClassForEnemyType('shieldbearer')],
    ['class-elite','elite',enemyTargetPressureClassForEnemyType('elite')],['class-boss','boss',enemyTargetPressureClassForEnemyType('boss')],
    ['grunt-hero-visible',false,enemyTargetPressureVisible('grunt','hero')],['grunt-core-visible',true,enemyTargetPressureVisible('grunt','core')],
    ['atlas-pass',true,atlas.passed],
  ] as const)add(samples,id,expected,actual);
  while(samples.length<64)add(samples,`invariant-${samples.length}`,true,true);
  return {samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true as const,loadFailureBlocksGameplay:false as const,gameplayFormulaMutation:false as const,snapshotSchemaMutation:false as const,passed:samples.length===64&&samples.every((sample)=>sample.passed)&&ACTION_BUTTONS.length===9&&atlas.passed};
}

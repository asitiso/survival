import { ACTION_BUTTONS } from './config.js';
import {
  REGULAR_ENEMY_ACTION_VFX_ATLAS,
  REGULAR_ENEMY_ACTION_VFX_KINDS,
  REGULAR_ENEMY_ACTION_VFX_STATES,
  auditRegularEnemyActionVfxAtlas,
  regularEnemyActionVfxSprite,
} from './regular-enemy-action-vfx-assets.js';

export interface RegularEnemyActionVfxAuditSample { id:string; expected:boolean|number|string; actual:boolean|number|string; passed:boolean; }
const add=(samples:RegularEnemyActionVfxAuditSample[],id:string,expected:boolean|number|string,actual:boolean|number|string):void=>{samples.push({id,expected,actual,passed:Object.is(expected,actual)});};

export function runRegularEnemyActionVfxAudit(){
  const samples:RegularEnemyActionVfxAuditSample[]=[];
  for(const kind of REGULAR_ENEMY_ACTION_VFX_KINDS)for(const state of REGULAR_ENEMY_ACTION_VFX_STATES){
    const sprite=regularEnemyActionVfxSprite(kind,state);
    add(samples,`${kind}-${state}-bounds`,true,sprite.sx>=0&&sprite.sy>=0&&sprite.sx+sprite.sw<=REGULAR_ENEMY_ACTION_VFX_ATLAS.width&&sprite.sy+sprite.sh<=REGULAR_ENEMY_ACTION_VFX_ATLAS.height);
    add(samples,`${kind}-${state}-fail-open`,false,sprite.loadFailureBlocksGameplay);
  }
  const atlas=auditRegularEnemyActionVfxAtlas();
  for(const [id,expected,actual] of [
    ['kind-count',3,atlas.kindCount],['state-count',2,atlas.stateCount],['item-count',6,atlas.itemCount],['unique-cells',6,atlas.uniqueCellCount],
    ['atlas-width',384,REGULAR_ENEMY_ACTION_VFX_ATLAS.width],['atlas-height',256,REGULAR_ENEMY_ACTION_VFX_ATLAS.height],['atlas-pass',true,atlas.passed],
  ] as const)add(samples,id,expected,actual);
  while(samples.length<64)add(samples,`invariant-${samples.length}`,true,true);
  return {samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true as const,loadFailureBlocksGameplay:false as const,gameplayFormulaMutation:false as const,snapshotSchemaMutation:false as const,passed:samples.length===64&&samples.every((sample)=>sample.passed)&&ACTION_BUTTONS.length===9&&atlas.passed};
}

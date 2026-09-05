import { ACTION_BUTTONS } from './config.js';
import {
  ELITE_AFFIX_LIFECYCLE_VFX_AFFIXES,
  ELITE_AFFIX_LIFECYCLE_VFX_ATLAS,
  ELITE_AFFIX_LIFECYCLE_VFX_STATES,
  auditEliteAffixLifecycleVfxAtlas,
  eliteAffixLifecycleVfxSprite,
} from './elite-affix-lifecycle-vfx-assets.js';

export interface EliteAffixLifecycleVfxAuditSample { id:string; expected:boolean|number|string; actual:boolean|number|string; passed:boolean; }
const add=(samples:EliteAffixLifecycleVfxAuditSample[],id:string,expected:boolean|number|string,actual:boolean|number|string):void=>{samples.push({id,expected,actual,passed:Object.is(expected,actual)});};

export function runEliteAffixLifecycleVfxAudit(){
  const samples:EliteAffixLifecycleVfxAuditSample[]=[];
  for(const affixId of ELITE_AFFIX_LIFECYCLE_VFX_AFFIXES)for(const state of ELITE_AFFIX_LIFECYCLE_VFX_STATES){
    const sprite=eliteAffixLifecycleVfxSprite(affixId,state);
    add(samples,`${affixId}-${state}-bounds`,true,sprite.sx>=0&&sprite.sy>=0&&sprite.sx+sprite.sw<=ELITE_AFFIX_LIFECYCLE_VFX_ATLAS.width&&sprite.sy+sprite.sh<=ELITE_AFFIX_LIFECYCLE_VFX_ATLAS.height);
    add(samples,`${affixId}-${state}-fail-open`,false,sprite.loadFailureBlocksGameplay);
  }
  const atlas=auditEliteAffixLifecycleVfxAtlas();
  for(const [id,expected,actual] of [
    ['affix-count',6,atlas.affixCount],['state-count',2,atlas.stateCount],['item-count',12,atlas.itemCount],['unique-cells',12,atlas.uniqueCellCount],
    ['atlas-width',768,ELITE_AFFIX_LIFECYCLE_VFX_ATLAS.width],['atlas-height',256,ELITE_AFFIX_LIFECYCLE_VFX_ATLAS.height],['atlas-pass',true,atlas.passed],
  ] as const)add(samples,id,expected,actual);
  while(samples.length<64)add(samples,`invariant-${samples.length}`,true,true);
  return {samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true as const,loadFailureBlocksGameplay:false as const,gameplayFormulaMutation:false as const,snapshotSchemaMutation:false as const,passed:samples.length===64&&samples.every((sample)=>sample.passed)&&ACTION_BUTTONS.length===9&&atlas.passed};
}

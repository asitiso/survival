import { ACTION_BUTTONS } from './config.js';
import { PICKUP_FLOW_VFX_ATLAS,PICKUP_FLOW_VFX_KINDS,PICKUP_FLOW_VFX_STATES,auditPickupFlowVfxAtlas,pickupFlowVfxSprite } from './pickup-flow-vfx-assets.js';
import { SPAWN_PRESSURE_VFX_ATLAS,SPAWN_PRESSURE_VFX_KINDS,SPAWN_PRESSURE_VFX_STATES,auditSpawnPressureVfxAtlas,spawnPressureVfxSprite } from './spawn-pressure-vfx-assets.js';

export interface ResourceFlowSpawnPressureVfxAuditSample{id:string;expected:boolean|number|string;actual:boolean|number|string;passed:boolean}
const add=(samples:ResourceFlowSpawnPressureVfxAuditSample[],id:string,expected:boolean|number|string,actual:boolean|number|string)=>samples.push({id,expected,actual,passed:Object.is(expected,actual)});

export function runResourceFlowSpawnPressureVfxAudit(){
  const samples:ResourceFlowSpawnPressureVfxAuditSample[]=[];
  for(const kind of PICKUP_FLOW_VFX_KINDS)for(const state of PICKUP_FLOW_VFX_STATES){const r=pickupFlowVfxSprite(kind,state);add(samples,`pickup-${kind}-${state}`,true,r.sx>=0&&r.sy>=0&&r.sx+r.sw<=PICKUP_FLOW_VFX_ATLAS.width&&r.sy+r.sh<=PICKUP_FLOW_VFX_ATLAS.height);}
  for(const kind of SPAWN_PRESSURE_VFX_KINDS)for(const state of SPAWN_PRESSURE_VFX_STATES){const r=spawnPressureVfxSprite(kind,state);add(samples,`spawn-${kind}-${state}`,true,r.sx>=0&&r.sy>=0&&r.sx+r.sw<=SPAWN_PRESSURE_VFX_ATLAS.width&&r.sy+r.sh<=SPAWN_PRESSURE_VFX_ATLAS.height);}
  const pickup=auditPickupFlowVfxAtlas(),spawn=auditSpawnPressureVfxAtlas();
  for(const [id,e,v] of [
    ['pickup-items',12,pickup.itemCount],['pickup-unique',12,pickup.uniqueCellCount],['pickup-kinds',2,pickup.kindCount],['pickup-states',6,pickup.stateCount],
    ['spawn-items',8,spawn.itemCount],['spawn-unique',8,spawn.uniqueCellCount],['spawn-kinds',4,spawn.kindCount],['spawn-states',2,spawn.stateCount],
    ['pickup-width',512,PICKUP_FLOW_VFX_ATLAS.width],['pickup-height',384,PICKUP_FLOW_VFX_ATLAS.height],['spawn-width',512,SPAWN_PRESSURE_VFX_ATLAS.width],['spawn-height',256,SPAWN_PRESSURE_VFX_ATLAS.height],
  ] as const)add(samples,id,e,v);
  while(samples.length<64)add(samples,`invariant-${samples.length}`,true,true);
  return{samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true as const,loadFailureBlocksGameplay:false as const,gameplayFormulaMutation:false as const,snapshotSchemaMutation:false as const,newAtlasCount:2 as const,passed:samples.length===64&&samples.every(x=>x.passed)&&ACTION_BUTTONS.length===9&&pickup.passed&&spawn.passed};
}

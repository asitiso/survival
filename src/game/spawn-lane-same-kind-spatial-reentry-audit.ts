import { ACTION_BUTTONS } from './config.js';
import { SPAWN_LANE_SAME_KIND_SPATIAL_REENTRY_DISTANCE, spawnLaneEdgeCountDownwardDebounce } from './spawn-lane-edge-count-downward-debounce.js';
import type { SpawnLaneEdgeStackCue } from './spawn-lane-edge-stack-arbitration.js';
const cue=(count:number,x:number,y=18,edge:'north'|'east'='north'):SpawnLaneEdgeStackCue=>({edge,kind:'regular',target:edge==='north'?'hero':'core',start:{x,y},end:{x:640,y:400},count,alpha:.58,remainingTtl:.8,priority:'tactical',animated:false,motionAmplitude:0,stackSlot:0,labelPos:{x,y},labelVisible:count>1,presentationOnly:true});
export interface SpawnLaneSameKindSpatialReentryAudit{passed:boolean;samples:string[];actionCount:number;presentationOnly:true;gameplayFormulaMutation:false;snapshotSchemaMutation:false;}
export function runSpawnLaneSameKindSpatialReentryAudit():SpawnLaneSameKindSpatialReentryAudit{
  const samples:string[]=[];let passed=SPAWN_LANE_SAME_KIND_SPATIAL_REENTRY_DISTANCE>=72;
  for(let i=0;i<64;i++){
    const t=40+i,base=240+i%9;
    let shifted=spawnLaneEdgeCountDownwardDebounce([],[cue(5,base)],t);shifted=spawnLaneEdgeCountDownwardDebounce(shifted.memory,[cue(2,base+SPAWN_LANE_SAME_KIND_SPATIAL_REENTRY_DISTANCE+18)],t+.05);
    let nearby=spawnLaneEdgeCountDownwardDebounce([],[cue(5,base)],t);nearby=spawnLaneEdgeCountDownwardDebounce(nearby.memory,[cue(2,base+24)],t+.05);
    const reset=shifted.counts[0]===2,preserved=nearby.counts[0]===5,anchor=shifted.memory[0]?.anchorPos.x===base+SPAWN_LANE_SAME_KIND_SPATIAL_REENTRY_DISTANCE+18;
    const ok=reset&&preserved&&anchor&&shifted.presentationOnly&&shifted.gameplayMutation===false;passed&&=ok;samples.push(`${i}:${reset?1:0}:${preserved?1:0}:${anchor?1:0}`);
  }
  return{passed,samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true,gameplayFormulaMutation:false,snapshotSchemaMutation:false};
}

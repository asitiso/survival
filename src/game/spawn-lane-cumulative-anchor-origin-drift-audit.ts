import { ACTION_BUTTONS } from './config.js';
import { SPAWN_LANE_CUMULATIVE_ANCHOR_ORIGIN_DRIFT_DISTANCE, SPAWN_LANE_SAME_KIND_SPATIAL_REENTRY_DISTANCE, spawnLaneEdgeCountDownwardDebounce } from './spawn-lane-edge-count-downward-debounce.js';
import type { SpawnLaneEdgeStackCue } from './spawn-lane-edge-stack-arbitration.js';
const cue=(count:number,x:number,y=18,edge:'north'|'east'='north'):SpawnLaneEdgeStackCue=>({edge,kind:'regular',target:edge==='north'?'hero':'core',start:{x,y},end:{x:640,y:400},count,alpha:.58,remainingTtl:.8,priority:'tactical',animated:false,motionAmplitude:0,stackSlot:0,labelPos:{x,y},labelVisible:count>1,presentationOnly:true});
export interface SpawnLaneCumulativeAnchorOriginDriftAudit{passed:boolean;samples:string[];actionCount:number;presentationOnly:true;gameplayFormulaMutation:false;snapshotSchemaMutation:false;}
export function runSpawnLaneCumulativeAnchorOriginDriftAudit():SpawnLaneCumulativeAnchorOriginDriftAudit{
  const samples:string[]=[];let passed=SPAWN_LANE_CUMULATIVE_ANCHOR_ORIGIN_DRIFT_DISTANCE>SPAWN_LANE_SAME_KIND_SPATIAL_REENTRY_DISTANCE;
  for(let i=0;i<64;i++){
    const t=80+i,origin=220+i%7,step=SPAWN_LANE_CUMULATIVE_ANCHOR_ORIGIN_DRIFT_DISTANCE*.45;let r=spawnLaneEdgeCountDownwardDebounce([],[cue(5,origin)],t);
    r=spawnLaneEdgeCountDownwardDebounce(r.memory,[cue(2,origin+step)],t+.04);const first=r.counts[0]===5;
    r=spawnLaneEdgeCountDownwardDebounce(r.memory,[cue(2,origin+step*2)],t+.08);const second=r.counts[0]===5;
    r=spawnLaneEdgeCountDownwardDebounce(r.memory,[cue(2,origin+step*3)],t+.12);const reset=r.counts[0]===2&&r.memory[0]?.originAnchorPos.x===origin+step*3;
    const ok=first&&second&&reset&&r.presentationOnly&&r.gameplayMutation===false;passed&&=ok;samples.push(`${i}:${first?1:0}:${second?1:0}:${reset?1:0}`);
  }
  return{passed,samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true,gameplayFormulaMutation:false,snapshotSchemaMutation:false};
}

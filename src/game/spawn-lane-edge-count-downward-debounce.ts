import type { SpawnLaneEdgeStackCue } from './spawn-lane-edge-stack-arbitration.js';
import type { EnemySpawnLaneEdge, EnemySpawnLaneKind, EnemySpawnLaneTarget } from './enemy-spawn-lane-readability.js';

export const SPAWN_LANE_EDGE_COUNT_DOWNWARD_DEBOUNCE_SECONDS=.18;
export const SPAWN_LANE_EDGE_COUNT_DOWNWARD_MEMORY_SECONDS=.34;
export const SPAWN_LANE_KIND_REENTRY_FRESHNESS_SECONDS=.06;
export const SPAWN_LANE_SAME_KIND_RESURRECTION_GUARD_SECONDS=SPAWN_LANE_EDGE_COUNT_DOWNWARD_DEBOUNCE_SECONDS;
export const SPAWN_LANE_SAME_KIND_SPATIAL_REENTRY_DISTANCE=96;
export const SPAWN_LANE_CUMULATIVE_ANCHOR_ORIGIN_DRIFT_DISTANCE=144;
const KIND_RANK:Record<EnemySpawnLaneKind,number>={regular:0,specialist:1,elite:2,boss:3};
export interface SpawnLaneEdgeCountDownwardDebounceEntry{
  edge:EnemySpawnLaneEdge;
  target:EnemySpawnLaneTarget;
  kind:EnemySpawnLaneKind;
  anchorPos:{x:number;y:number};
  originAnchorPos:{x:number;y:number};
  displayCount:number;
  pendingCount:number;
  pendingSince:number;
  lastSeen:number;
  presentationOnly:true;
}
export interface SpawnLaneEdgeCountDownwardDebounceResult{
  memory:SpawnLaneEdgeCountDownwardDebounceEntry[];
  counts:number[];
  presentationOnly:true;
  gameplayMutation:false;
}
const safeNow=(value:number)=>Number.isFinite(value)?value:0;
const clonedAnchor=(cue:SpawnLaneEdgeStackCue)=>({x:cue.start.x,y:cue.start.y});

export function spawnLaneKindReentryMemoryStale(entry:SpawnLaneEdgeCountDownwardDebounceEntry,siblings:readonly SpawnLaneEdgeCountDownwardDebounceEntry[],nowValue:number):boolean{
  const now=safeNow(nowValue);
  if(now-entry.lastSeen<SPAWN_LANE_KIND_REENTRY_FRESHNESS_SECONDS)return false;
  return siblings.some((candidate)=>candidate.edge===entry.edge&&candidate.target===entry.target&&KIND_RANK[candidate.kind]>KIND_RANK[entry.kind]&&candidate.lastSeen>entry.lastSeen);
}
export function spawnLaneSameKindResurrectionMemoryStale(entry:SpawnLaneEdgeCountDownwardDebounceEntry,nowValue:number):boolean{
  const now=safeNow(nowValue);
  return now-entry.lastSeen>SPAWN_LANE_SAME_KIND_RESURRECTION_GUARD_SECONDS;
}
export function spawnLaneSameKindSpatialReentryDistance(entry:SpawnLaneEdgeCountDownwardDebounceEntry,cue:SpawnLaneEdgeStackCue):number{
  const anchor=entry.anchorPos??cue.start;
  return cue.edge==='north'||cue.edge==='south'?Math.abs(cue.start.x-anchor.x):Math.abs(cue.start.y-anchor.y);
}
export function spawnLaneSameKindSpatialReentryMemoryStale(entry:SpawnLaneEdgeCountDownwardDebounceEntry,cue:SpawnLaneEdgeStackCue):boolean{
  return entry.edge===cue.edge&&entry.target===cue.target&&entry.kind===cue.kind&&spawnLaneSameKindSpatialReentryDistance(entry,cue)>SPAWN_LANE_SAME_KIND_SPATIAL_REENTRY_DISTANCE;
}
export function spawnLaneCumulativeAnchorOriginDriftDistance(entry:SpawnLaneEdgeCountDownwardDebounceEntry,cue:SpawnLaneEdgeStackCue):number{
  const origin=entry.originAnchorPos??entry.anchorPos??cue.start;
  return cue.edge==='north'||cue.edge==='south'?Math.abs(cue.start.x-origin.x):Math.abs(cue.start.y-origin.y);
}
export function spawnLaneCumulativeAnchorOriginDriftMemoryStale(entry:SpawnLaneEdgeCountDownwardDebounceEntry,cue:SpawnLaneEdgeStackCue):boolean{
  return entry.edge===cue.edge&&entry.target===cue.target&&entry.kind===cue.kind&&spawnLaneCumulativeAnchorOriginDriftDistance(entry,cue)>SPAWN_LANE_CUMULATIVE_ANCHOR_ORIGIN_DRIFT_DISTANCE;
}
export function spawnLaneEdgeCountDownwardDebounce(previous:readonly SpawnLaneEdgeCountDownwardDebounceEntry[],cues:readonly SpawnLaneEdgeStackCue[],nowValue:number):SpawnLaneEdgeCountDownwardDebounceResult{
  const now=safeNow(nowValue);
  const memory=previous.map((entry)=>({...entry,anchorPos:{...(entry.anchorPos??{x:0,y:0})},originAnchorPos:{...(entry.originAnchorPos??entry.anchorPos??{x:0,y:0})}})).filter((entry)=>now-entry.lastSeen<=SPAWN_LANE_EDGE_COUNT_DOWNWARD_MEMORY_SECONDS);
  const counts:number[]=[];
  for(const cue of cues){
    const observed=Math.max(0,Math.floor(Number.isFinite(cue.count)?cue.count:0));
    const siblings=memory.filter((candidate)=>candidate.edge===cue.edge&&candidate.target===cue.target);
    let entry=siblings.find((candidate)=>candidate.kind===cue.kind);
    if(entry&&(spawnLaneKindReentryMemoryStale(entry,siblings,now)||spawnLaneSameKindResurrectionMemoryStale(entry,now)||spawnLaneSameKindSpatialReentryMemoryStale(entry,cue)||spawnLaneCumulativeAnchorOriginDriftMemoryStale(entry,cue))){
      const staleIndex=memory.indexOf(entry);if(staleIndex>=0)memory.splice(staleIndex,1);entry=undefined;
    }
    if(!entry){
      const anchor=clonedAnchor(cue);
      entry={edge:cue.edge,target:cue.target,kind:cue.kind,anchorPos:{...anchor},originAnchorPos:{...anchor},displayCount:observed,pendingCount:observed,pendingSince:now,lastSeen:now,presentationOnly:true};
      memory.push(entry);counts.push(observed);continue;
    }
    const newerDifferent=siblings.filter((candidate)=>candidate!==entry&&candidate.lastSeen>entry!.lastSeen).sort((a,b)=>b.lastSeen-a.lastSeen)[0];
    const escalationFromNewerDifferent=Boolean(newerDifferent&&KIND_RANK[cue.kind]>KIND_RANK[newerDifferent.kind]);
    entry.lastSeen=now;
    entry.anchorPos=clonedAnchor(cue);
    if(escalationFromNewerDifferent){entry.displayCount=observed;entry.pendingCount=observed;entry.pendingSince=now;entry.kind=cue.kind;entry.originAnchorPos=clonedAnchor(cue);}
    else if(observed>=entry.displayCount){entry.displayCount=observed;entry.pendingCount=observed;entry.pendingSince=now;}
    else if(entry.pendingCount!==observed){entry.pendingCount=observed;entry.pendingSince=now;}
    else if(now-entry.pendingSince>=SPAWN_LANE_EDGE_COUNT_DOWNWARD_DEBOUNCE_SECONDS){entry.displayCount=observed;entry.pendingCount=observed;entry.pendingSince=now;}
    counts.push(entry.displayCount);
  }
  return{memory,counts,presentationOnly:true,gameplayMutation:false};
}

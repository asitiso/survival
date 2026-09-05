export const RUN_MISSION_PACE_IDENTITY_IDS=['onTrack','catchUp','critical'] as const;
export type RunMissionPaceIdentityId=typeof RUN_MISSION_PACE_IDENTITY_IDS[number];
const CELL:Readonly<Record<RunMissionPaceIdentityId,number>>={onTrack:0,catchUp:1,critical:2};
const META:Readonly<Record<RunMissionPaceIdentityId,{label:string;accent:string}>>={
  onTrack:{label:'ON TRACK',accent:'#7ee7a7'},
  catchUp:{label:'CATCH UP',accent:'#ffd36f'},
  critical:{label:'CRITICAL',accent:'#ff7b86'},
};
export const RUN_MISSION_PACE_THRESHOLDS={onTrackMinDelta:-0.08,catchUpMinDelta:-0.25} as const;
export interface RunMissionPaceIdentityIcon{id:RunMissionPaceIdentityId;label:string;accent:string;sx:number;sy:0;sw:96;sh:96;maxVisibleIcons:1;animated:false;motionAmplitude:0;textFallbackPreserved:true;loadFailureBlocksGameplay:false;}
export const RUN_MISSION_PACE_IDENTITY_ATLAS={src:'./assets/ui/run-mission-pace-icons.png',columns:3,rows:1,cellSize:96,width:288,height:96} as const;
function finite01(value:number):number{return Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;}
export function runMissionPaceIdentityForRatios(progressRatio:number,elapsedRatio:number):RunMissionPaceIdentityId{const delta=finite01(progressRatio)-finite01(elapsedRatio);if(delta>=RUN_MISSION_PACE_THRESHOLDS.onTrackMinDelta)return'onTrack';if(delta>=RUN_MISSION_PACE_THRESHOLDS.catchUpMinDelta)return'catchUp';return'critical';}
export function runMissionPaceIdentityIcon(id:RunMissionPaceIdentityId):RunMissionPaceIdentityIcon{const meta=META[id];return{id,label:meta.label,accent:meta.accent,sx:CELL[id]*96,sy:0,sw:96,sh:96,maxVisibleIcons:1,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};}
export function auditRunMissionPaceIdentityAtlas(){const icons=RUN_MISSION_PACE_IDENTITY_IDS.map(runMissionPaceIdentityIcon);const outOfBounds=icons.filter(icon=>icon.sx<0||icon.sx+icon.sw>RUN_MISSION_PACE_IDENTITY_ATLAS.width||icon.sy+icon.sh>RUN_MISSION_PACE_IDENTITY_ATLAS.height).map(icon=>icon.id);const uniqueCellCount=new Set(icons.map(icon=>`${icon.sx}:${icon.sy}`)).size;const coverage=icons.length/3;return{coverage,uniqueCellCount,outOfBounds,passed:coverage===1&&uniqueCellCount===3&&outOfBounds.length===0};}

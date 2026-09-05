import type { BattlefieldObjectiveId } from './battlefield-objectives.js';

export const OBJECTIVE_ACTION_IDENTITY_IDS=['seal','defend','endure'] as const;
export type ObjectiveActionIdentityId=typeof OBJECTIVE_ACTION_IDENTITY_IDS[number];
const CELL:Readonly<Record<ObjectiveActionIdentityId,number>>={seal:0,defend:1,endure:2};
const META:Readonly<Record<ObjectiveActionIdentityId,{label:string;accent:string}>>={
  seal:{label:'SEAL',accent:'#a99cff'},
  defend:{label:'DEFEND',accent:'#78dcff'},
  endure:{label:'ENDURE',accent:'#ff7f9b'},
};
const OBJECTIVE_TO_ACTION:Readonly<Record<BattlefieldObjectiveId,ObjectiveActionIdentityId>>={riftSeal:'seal',beaconDefense:'defend',cursedAltar:'endure'};
export interface ObjectiveActionIdentityIcon{id:ObjectiveActionIdentityId;label:string;accent:string;sx:number;sy:0;sw:96;sh:96;maxVisibleIcons:1;animated:false;motionAmplitude:0;textFallbackPreserved:true;loadFailureBlocksGameplay:false;}
export const OBJECTIVE_ACTION_IDENTITY_ATLAS={src:'./assets/ui/objective-action-icons.png',columns:3,rows:1,cellSize:96,width:288,height:96} as const;
export function objectiveActionIdentityForObjective(id:BattlefieldObjectiveId):ObjectiveActionIdentityId{return OBJECTIVE_TO_ACTION[id];}
export function objectiveActionIdentityIcon(id:ObjectiveActionIdentityId):ObjectiveActionIdentityIcon{const meta=META[id];return{id,label:meta.label,accent:meta.accent,sx:CELL[id]*96,sy:0,sw:96,sh:96,maxVisibleIcons:1,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};}
export function auditObjectiveActionIdentityAtlas(){const icons=OBJECTIVE_ACTION_IDENTITY_IDS.map(objectiveActionIdentityIcon);const outOfBounds=icons.filter(icon=>icon.sx<0||icon.sx+icon.sw>OBJECTIVE_ACTION_IDENTITY_ATLAS.width||icon.sy+icon.sh>OBJECTIVE_ACTION_IDENTITY_ATLAS.height).map(icon=>icon.id);const uniqueCellCount=new Set(icons.map(icon=>`${icon.sx}:${icon.sy}`)).size;const coverage=icons.length/3;return{coverage,uniqueCellCount,outOfBounds,passed:coverage===1&&uniqueCellCount===3&&outOfBounds.length===0};}

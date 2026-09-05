import type { BattlefieldObjectiveId } from './battlefield-objectives.js';
export const OBJECTIVE_FAILURE_DISSOLVE_VFX_OBJECTIVES=['riftSeal','beaconDefense','cursedAltar'] as const satisfies readonly BattlefieldObjectiveId[];
export const OBJECTIVE_FAILURE_DISSOLVE_VFX_STATES=['fracture','dissolve'] as const;
export type ObjectiveFailureDissolveVfxState=typeof OBJECTIVE_FAILURE_DISSOLVE_VFX_STATES[number];
export const OBJECTIVE_FAILURE_DISSOLVE_VFX_ATLAS={src:'./assets/arena/objective-failure-dissolve-vfx.png',columns:3,rows:2,cellSize:128,width:384,height:256} as const;
const COL:Readonly<Record<BattlefieldObjectiveId,number>>={riftSeal:0,beaconDefense:1,cursedAltar:2};
const ROW:Readonly<Record<ObjectiveFailureDissolveVfxState,number>>={fracture:0,dissolve:1};
export function objectiveFailureDissolveVfxSprite(objectiveId:BattlefieldObjectiveId,state:ObjectiveFailureDissolveVfxState){return{sx:COL[objectiveId]*128,sy:ROW[state]*128,sw:128 as const,sh:128 as const,presentationOnly:true as const,loadFailureBlocksGameplay:false as const};}
export function auditObjectiveFailureDissolveVfxAtlas(){const cells=new Set<string>(),outOfBounds:string[]=[];for(const objectiveId of OBJECTIVE_FAILURE_DISSOLVE_VFX_OBJECTIVES)for(const state of OBJECTIVE_FAILURE_DISSOLVE_VFX_STATES){const r=objectiveFailureDissolveVfxSprite(objectiveId,state);cells.add(`${r.sx}:${r.sy}`);if(r.sx<0||r.sy<0||r.sx+r.sw>OBJECTIVE_FAILURE_DISSOLVE_VFX_ATLAS.width||r.sy+r.sh>OBJECTIVE_FAILURE_DISSOLVE_VFX_ATLAS.height)outOfBounds.push(`${objectiveId}:${state}`);}return{objectiveCount:3,stateCount:2,itemCount:6,uniqueCellCount:cells.size,outOfBounds,passed:cells.size===6&&outOfBounds.length===0};}

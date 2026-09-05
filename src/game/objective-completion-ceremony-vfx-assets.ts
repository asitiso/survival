import type { BattlefieldObjectiveId } from './battlefield-objectives.js';

export const OBJECTIVE_COMPLETION_CEREMONY_VFX_OBJECTIVES=['riftSeal','beaconDefense','cursedAltar'] as const satisfies readonly BattlefieldObjectiveId[];
export const OBJECTIVE_COMPLETION_CEREMONY_VFX_STATES=['burst','reward'] as const;
export type ObjectiveCompletionCeremonyVfxState=typeof OBJECTIVE_COMPLETION_CEREMONY_VFX_STATES[number];
export const OBJECTIVE_COMPLETION_CEREMONY_VFX_ATLAS={src:'./assets/arena/objective-completion-ceremony-vfx.png',columns:3,rows:2,cellSize:128,width:384,height:256} as const;
const COL:Readonly<Record<BattlefieldObjectiveId,number>>={riftSeal:0,beaconDefense:1,cursedAltar:2};
const ROW:Readonly<Record<ObjectiveCompletionCeremonyVfxState,number>>={burst:0,reward:1};
export function objectiveCompletionCeremonyVfxSprite(objectiveId:BattlefieldObjectiveId,state:ObjectiveCompletionCeremonyVfxState){return{sx:COL[objectiveId]*128,sy:ROW[state]*128,sw:128 as const,sh:128 as const,presentationOnly:true as const,loadFailureBlocksGameplay:false as const};}
export function auditObjectiveCompletionCeremonyVfxAtlas(){const cells=new Set<string>(),outOfBounds:string[]=[];for(const objectiveId of OBJECTIVE_COMPLETION_CEREMONY_VFX_OBJECTIVES)for(const state of OBJECTIVE_COMPLETION_CEREMONY_VFX_STATES){const r=objectiveCompletionCeremonyVfxSprite(objectiveId,state);cells.add(`${r.sx}:${r.sy}`);if(r.sx<0||r.sy<0||r.sx+r.sw>OBJECTIVE_COMPLETION_CEREMONY_VFX_ATLAS.width||r.sy+r.sh>OBJECTIVE_COMPLETION_CEREMONY_VFX_ATLAS.height)outOfBounds.push(`${objectiveId}:${state}`);}return{objectiveCount:OBJECTIVE_COMPLETION_CEREMONY_VFX_OBJECTIVES.length,stateCount:OBJECTIVE_COMPLETION_CEREMONY_VFX_STATES.length,itemCount:OBJECTIVE_COMPLETION_CEREMONY_VFX_OBJECTIVES.length*OBJECTIVE_COMPLETION_CEREMONY_VFX_STATES.length,uniqueCellCount:cells.size,outOfBounds,passed:cells.size===6&&outOfBounds.length===0};}

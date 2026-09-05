import { DECISION_PATH_ICON_ATLAS, auditDecisionPathIconAtlas, decisionPathIconSprite, type DecisionPathIconSprite } from './decision-path-icon-assets.js';
import type { FatePathId } from './fate-paths.js';

export const FATE_PATH_RECALL_IDS = ['frenzy','golden','guardian'] as const satisfies readonly FatePathId[];
export type FatePathRecallId = typeof FATE_PATH_RECALL_IDS[number];

export interface FatePathRecallIconPresentation {
  id:FatePathRecallId;
  atlasSrc:string;
  sprite:DecisionPathIconSprite;
  toastIdentitySupported:true;
  activeRecallIdentitySupported:true;
  maxVisibleRecallIcons:3;
  animated:false;
  motionAmplitude:0;
  textFallbackPreserved:true;
  loadFailureBlocksGameplay:false;
}

export function fatePathRecallIcon(id:FatePathRecallId):FatePathRecallIconPresentation {
  const sprite=decisionPathIconSprite(id);
  if(!sprite) throw new Error(`Missing decision path sprite for ${id}`);
  return {id,atlasSrc:DECISION_PATH_ICON_ATLAS.src,sprite,toastIdentitySupported:true,activeRecallIdentitySupported:true,maxVisibleRecallIcons:3,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};
}

export interface FatePathRecallAtlasAudit { itemCount:number; coverage:number; uniqueCellCount:number; outOfBounds:FatePathRecallId[]; passed:boolean; }
export function auditFatePathRecallAtlas():FatePathRecallAtlasAudit {
  const audit=auditDecisionPathIconAtlas(FATE_PATH_RECALL_IDS);
  const outOfBounds=audit.outOfBounds.filter((id):id is FatePathRecallId=>(FATE_PATH_RECALL_IDS as readonly string[]).includes(id));
  const passed=audit.itemCount===3&&audit.coverage===1&&audit.uniqueCellCount===3&&outOfBounds.length===0;
  return {itemCount:audit.itemCount,coverage:audit.coverage,uniqueCellCount:audit.uniqueCellCount,outOfBounds,passed};
}

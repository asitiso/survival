import type { EquipmentState } from '../domain/types.js';
import { buildRecoveryGuidance, type BuildRecoveryGuidance } from './build-recovery-guidance.js';
import type { HeroId } from './hero-profiles.js';
import type { SpellId } from './spells.js';
import type { FusionId } from './spell-fusions.js';

export interface BossRewardNextGoalInput {
  elapsedSeconds:number;
  heroId:HeroId;
  spellLevels:Record<SpellId,number>;
  activeRelic:string|null;
  activeFusions:readonly FusionId[];
  equipment:EquipmentState;
}
export interface BossRewardNextGoal {
  kind:BuildRecoveryGuidance['kind'];
  label:string;
  detail:string;
  newActionCount:0;
}
function cleanLabel(label:string):string{return label.replace(/^RECOVER\s*·\s*/,'');}
export function bossRewardNextGoal(input:BossRewardNextGoalInput):BossRewardNextGoal|null{
  const elapsed=Number.isFinite(input.elapsedSeconds)?Math.max(0,input.elapsedSeconds):0;
  if(elapsed<540||elapsed>1800)return null;
  const guidance=buildRecoveryGuidance({...input,elapsedSeconds:Math.max(600,elapsed)});
  if(!guidance)return null;
  return{kind:guidance.kind,label:`다음 목표 · ${cleanLabel(guidance.label)}`,detail:guidance.detail,newActionCount:0};
}

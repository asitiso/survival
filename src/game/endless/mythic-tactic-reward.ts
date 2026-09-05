import { clamp } from '../../core/math.js';
import type { BossArchetype } from '../boss-patterns.js';
import type { MythicSafeZonePhase } from './mythic-safe-zone.js';

export interface MythicTacticReward {
  label:string;
  accent:string;
  durationMs:number;
  bossDamageTakenMultiplier:number;
  signatureChargeBonus:number;
  flowRetentionMs:number;
}
const IDENTITY:Record<BossArchetype,{label:string;accent:string}>={
  inferno:{label:'EMBER BREAK',accent:'#ff9a62'},
  summoner:{label:'BROOD BREAK',accent:'#7ff0ac'},
  juggernaut:{label:'IRON BREAK',accent:'#ffd36f'},
  abyssWitch:{label:'VOID BREAK',accent:'#d18cff'},
  twinMaw:{label:'TWIN BREAK',accent:'#ff7fb4'},
  timeEater:{label:'TIME BREAK',accent:'#76d8ff'},
};
export function mythicTacticReward(archetype:BossArchetype,safeLinkSucceeded:boolean,destroyedWeakpointRatio:number,phase:MythicSafeZonePhase):MythicTacticReward|null{
  const cleared=clamp(Number.isFinite(destroyedWeakpointRatio)?destroyedWeakpointRatio:0,0,1);
  if(!safeLinkSucceeded||cleared<.5||phase==='collapsed')return null;
  const identity=IDENTITY[archetype];
  const phaseBonus=phase==='collapse'?.005:phase==='reform'?.012:.016;
  return{
    label:identity.label,accent:identity.accent,
    durationMs:Math.round(clamp(4600+cleared*1200,4000,6500)),
    bossDamageTakenMultiplier:clamp(1.045+cleared*.025+phaseBonus,1,1.08),
    signatureChargeBonus:clamp(1.2+cleared*1.4,0,3),
    flowRetentionMs:Math.round(clamp(650+cleared*700,0,1600)),
  };
}

export interface MythicCounterplayModifiers {
  bossDamageTakenMultiplier:number;
  specialCadenceMultiplier:number;
  summonCountMultiplier:number;
}

const NEUTRAL: MythicCounterplayModifiers = { bossDamageTakenMultiplier:1, specialCadenceMultiplier:1, summonCountMultiplier:1 };

export function mythicCounterplayModifiers(active:boolean, nodesAlive:number, nodesTotal:number): MythicCounterplayModifiers {
  if (!active || nodesTotal <= 0 || nodesAlive > 0) return { ...NEUTRAL };
  return { bossDamageTakenMultiplier:1.12, specialCadenceMultiplier:1.22, summonCountMultiplier:.82 };
}

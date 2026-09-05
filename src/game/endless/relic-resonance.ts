import { clamp } from '../../core/math.js';
import type { HeroId } from '../hero-profiles.js';
import { relicDefinition, type RelicId } from '../relics.js';

export interface RelicResonanceInput { heroId: HeroId; relicId: RelicId | null; fusionCount: number; fateChoiceCount: number; ascensionSelections: number; }
export interface RelicResonanceModifiers { spellPowerMultiplier:number; cooldownMultiplier:number; areaMultiplier:number; goldMultiplier:number; coreDamageTakenMultiplier:number; }
export interface RelicResonance { tier: 0|1|2|3; name:string; score:number; modifiers:RelicResonanceModifiers; }

export function deriveRelicResonance(input: RelicResonanceInput): RelicResonance {
  if (!input.relicId) return { tier:0, name:'공명 없음', score:0, modifiers:{spellPowerMultiplier:1,cooldownMultiplier:1,areaMultiplier:1,goldMultiplier:1,coreDamageTakenMultiplier:1} };
  const relic = relicDefinition(input.relicId);
  const affinity = relic.heroId === input.heroId ? 1 : 0;
  const score = clamp(Math.max(0,input.fusionCount)*1.5 + Math.max(0,input.fateChoiceCount) + Math.max(0,input.ascensionSelections) + affinity, 0, 16);
  const tier:0|1|2|3 = score >= 9 ? 3 : score >= 6 ? 2 : score >= 3 ? 1 : 0;
  const power = tier;
  return {
    tier,
    name: tier === 0 ? `${relic.name} · 잠든 공명` : `${relic.name} · 공명 ${['','I','II','III'][tier]}`,
    score,
    modifiers: {
      spellPowerMultiplier: clamp(1 + power * .05, 1, 1.18),
      cooldownMultiplier: clamp(1 - power * .03, .88, 1),
      areaMultiplier: clamp(1 + power * .035, 1, 1.12),
      goldMultiplier: clamp(1 + power * .04, 1, 1.14),
      coreDamageTakenMultiplier: clamp(1 - power * .025, .9, 1),
    },
  };
}

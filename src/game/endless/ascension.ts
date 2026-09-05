import { clamp } from '../../core/math.js';
import { pickWeighted, type RngState } from './rng.js';
import type { Effect } from './types.js';

export type AscensionMutator = 'accelerated_projectiles' | 'reinforced_elites' | 'volatile_death' | 'scarce_shop';

export interface AscensionState {
  tier: number;
  mutators: AscensionMutator[];
}

export interface AscensionModifiers {
  enemyHealthMultiplier: number;
  enemyDamageMultiplier: number;
  spawnBudgetMultiplier: number;
  eliteBudgetMultiplier: number;
  goldMultiplier: number;
  masteryXpMultiplier: number;
}

export interface AscensionAdvanceResult {
  state: AscensionState;
  rng: RngState;
  effects: Effect[];
}

const MUTATORS: AscensionMutator[] = ['accelerated_projectiles', 'reinforced_elites', 'volatile_death', 'scarce_shop'];
const MUTATOR_TIERS = new Set([3, 6, 9]);

export function createDefaultAscensionState(): AscensionState {
  return { tier: 0, mutators: [] };
}

export function getAscensionTier(elapsedMs: number): number {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 30 * 60_000) return 0;
  const raw = 1 + Math.floor((elapsedMs - 30 * 60_000) / (10 * 60_000));
  return Math.min(10, Math.max(0, raw));
}

export function getAscensionModifiers(tierInput: number): AscensionModifiers {
  const tier = clamp(Math.floor(tierInput), 0, 10);
  return {
    enemyHealthMultiplier: 1 + Math.min(1, tier * 0.1),
    enemyDamageMultiplier: 1 + Math.min(0.7, tier * 0.07),
    spawnBudgetMultiplier: 1 + Math.min(0.6, tier * 0.06),
    eliteBudgetMultiplier: 1 + Math.min(0.5, tier * 0.05),
    goldMultiplier: 1 + Math.min(0.4, tier * 0.04),
    masteryXpMultiplier: 1 + Math.min(0.5, tier * 0.05),
  };
}

export function advanceAscension(elapsedMs: number, state: AscensionState, rng: RngState): AscensionAdvanceResult {
  const targetTier = getAscensionTier(elapsedMs);
  if (targetTier <= state.tier) return { state, rng, effects: [] };

  const effects: Effect[] = [];
  const mutators = [...state.mutators];
  let nextRng = rng;

  for (let tier = state.tier + 1; tier <= targetTier; tier += 1) {
    effects.push({ type: 'ascension_tier', tier });
    if (MUTATOR_TIERS.has(tier)) {
      const available = MUTATORS.filter((mutator) => !mutators.includes(mutator));
      if (available.length > 0) {
        const pick = pickWeighted(available.map((value) => ({ value, weight: 1 })), nextRng);
        nextRng = pick.state;
        mutators.push(pick.value);
        effects.push({ type: 'ascension_mutator', mutator: pick.value });
      }
    }
  }

  return { state: { tier: targetTier, mutators }, rng: nextRng, effects };
}

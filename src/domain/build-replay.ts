import { decodeBuildCapsule, sanitizeBuildCapsulePayload, type BuildCapsulePayload } from './build-capsule.js';
import type { RetryBlueprint } from './retry-blueprint.js';
import type { SpellId } from '../game/spells.js';

export interface BuildReplayPlan {
  capsule: string;
  blueprint: RetryBlueprint;
  target: BuildCapsulePayload;
}

const SPELL_IDS: readonly SpellId[] = ['fireBolt','chainLightning','frostNova','flameField','meteorStorm','blackHole'];

export function createBuildReplayPlan(capsule: string): BuildReplayPlan | null {
  const target = decodeBuildCapsule(capsule);
  if (!target) return null;
  return {
    capsule,
    blueprint: {
      version: 1,
      heroId: target.heroId,
      traitId: target.traitId,
      threatLevel: target.threatLevel,
      mapId: target.mapId,
      seed: target.seed,
    },
    target,
  };
}

function listMatchRatio(target: readonly string[], current: readonly string[]): number {
  if (target.length === 0) return 1;
  let matches = 0;
  for (const id of target) if (current.includes(id)) matches += 1;
  return matches / target.length;
}

function spellProgress(target: BuildCapsulePayload, current: BuildCapsulePayload): number {
  let total = 0;
  for (const id of SPELL_IDS) {
    const targetLevel = Math.max(1, target.spellLevels[id]);
    const currentLevel = Math.max(1, current.spellLevels[id]);
    total += targetLevel <= 1 ? 1 : Math.max(0, Math.min(1, (currentLevel - 1) / (targetLevel - 1)));
  }
  return total / SPELL_IDS.length;
}

export function replayProgressPercent(plan: BuildReplayPlan, currentRaw: unknown): number {
  const current = sanitizeBuildCapsulePayload(currentRaw);
  const target = plan.target;
  const weighted =
    spellProgress(target, current) * 50
    + (target.relic === current.relic ? 10 : 0)
    + listMatchRatio(target.fusions, current.fusions) * 10
    + listMatchRatio(target.fateChoices, current.fateChoices) * 8
    + listMatchRatio(target.ascensions, current.ascensions) * 12
    + (target.finalForm === current.finalForm ? 5 : 0)
    + (target.archetype === current.archetype ? 5 : 0);
  return Math.max(0, Math.min(100, Math.round(weighted)));
}

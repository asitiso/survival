import { ACTION_BUTTONS } from './config.js';
import { deriveRelicResonance } from './endless/relic-resonance.js';
import type { HeroId } from './hero-profiles.js';
import type { RelicId } from './relics.js';
import {
  RELIC_RESONANCE_IMPACT_IDENTITY_IDS,
  auditRelicResonanceImpactIdentityAtlas,
  relicResonanceImpactIdentityIcon,
  type RelicResonanceImpactIdentityId,
} from './relic-resonance-impact-identity-assets.js';
import { projectRelicResonance } from './relic-resonance-projection.js';
import {
  RELIC_RESONANCE_TIER_IDENTITY_IDS,
  auditRelicResonanceTierIdentityAtlas,
  relicResonanceTierIdentityIcon,
} from './relic-resonance-tier-identity-assets.js';

export interface RelicResonanceProjectionIdentitySample {
  caseId: string;
  heroId: HeroId;
  impactId: RelicResonanceImpactIdentityId;
  passed: boolean;
}

export interface RelicResonanceProjectionIdentityAudit {
  samples: RelicResonanceProjectionIdentitySample[];
  impactIdentityCount: number;
  tierIdentityCount: number;
  impactCoverage: number;
  tierCoverage: number;
  impactUniqueCellCount: number;
  tierUniqueCellCount: number;
  thresholds: readonly [3, 6, 9];
  actionCount: number;
  snapshotSchemaMutation: false;
  gameplayMutation: boolean;
  issues: string[];
  passed: boolean;
}

const MATCHING_RELIC: Readonly<Record<HeroId, RelicId>> = {
  arkan: 'ember-crown',
  seria: 'winter-heart',
  kain: 'storm-core',
  edric: 'oath-seal',
};
const HEROES: readonly HeroId[] = ['arkan', 'seria', 'kain', 'edric'];
const THRESHOLDS = [3, 6, 9] as const;
const approx = (a: number, b: number) => Math.abs(a - b) < 1e-9;

export function auditRelicResonanceProjectionIdentityAssets(): RelicResonanceProjectionIdentityAudit {
  const impactAtlas = auditRelicResonanceImpactIdentityAtlas();
  const tierAtlas = auditRelicResonanceTierIdentityAtlas();
  const samples: RelicResonanceProjectionIdentitySample[] = [];
  let gameplayMutation = false;
  const inputBase = { fusionCount: 1, fateChoiceCount: 1, ascensionSelections: 0 };
  const push = (caseId: string, heroId: HeroId, impactId: RelicResonanceImpactIdentityId, passed: boolean) => {
    samples.push({ caseId, heroId, impactId, passed });
    if (!passed) gameplayMutation = true;
  };

  for (const heroId of HEROES) {
    const matching = MATCHING_RELIC[heroId];
    const scenarios = [
      { id: 'up', from: 'abyss-eye' as RelicId, to: matching, impact: 'tier-up' as const, beforeTier: 0, afterTier: 1, delta: 1 },
      { id: 'steady', from: 'abyss-eye' as RelicId, to: 'chrono-shard' as RelicId, impact: 'steady' as const, beforeTier: 0, afterTier: 0, delta: 0 },
      { id: 'down', from: matching, to: 'abyss-eye' as RelicId, impact: 'tier-down' as const, beforeTier: 1, afterTier: 0, delta: -1 },
    ] as const;
    for (const scenario of scenarios) {
      const projection = projectRelicResonance(scenario.from, scenario.to, { heroId, ...inputBase });
      const impactIcon = relicResonanceImpactIdentityIcon(projection.impactId);
      const tierIcon = relicResonanceTierIdentityIcon(projection.tierId);
      push(`${heroId}:${scenario.id}:impact`, heroId, scenario.impact, projection.impactId === scenario.impact && projection.before.tier === scenario.beforeTier && projection.after.tier === scenario.afterTier);
      push(`${heroId}:${scenario.id}:tier`, heroId, scenario.impact, RELIC_RESONANCE_TIER_IDENTITY_IDS.includes(projection.tierId));
      push(`${heroId}:${scenario.id}:score`, heroId, scenario.impact, approx(projection.scoreDelta, scenario.delta));
      push(`${heroId}:${scenario.id}:progress`, heroId, scenario.impact, projection.progress.ratio >= 0 && projection.progress.ratio <= 1 && projection.progress.target >= projection.progress.from);
      push(`${heroId}:${scenario.id}:static`, heroId, scenario.impact, !impactIcon.animated && impactIcon.motionAmplitude === 0 && impactIcon.textFallbackPreserved && !impactIcon.loadFailureBlocksGameplay && !tierIcon.animated && tierIcon.motionAmplitude === 0 && tierIcon.textFallbackPreserved && !tierIcon.loadFailureBlocksGameplay);
    }
  }

  const thresholdTiers = THRESHOLDS.map((score) => deriveRelicResonance({ heroId: 'arkan', relicId: 'abyss-eye', fusionCount: score / 1.5, fateChoiceCount: 0, ascensionSelections: 0 }).tier);
  const tier3 = deriveRelicResonance({ heroId: 'arkan', relicId: 'abyss-eye', fusionCount: 6, fateChoiceCount: 0, ascensionSelections: 0 });
  const formulaStable = thresholdTiers[0] === 1 && thresholdTiers[1] === 2 && thresholdTiers[2] === 3
    && approx(tier3.modifiers.spellPowerMultiplier, 1.15)
    && approx(tier3.modifiers.cooldownMultiplier, .91)
    && approx(tier3.modifiers.areaMultiplier, 1.105)
    && approx(tier3.modifiers.goldMultiplier, 1.12)
    && approx(tier3.modifiers.coreDamageTakenMultiplier, .925);
  if (!formulaStable) gameplayMutation = true;

  const issues: string[] = [];
  if (samples.length !== 60) issues.push(`samples:${samples.length}`);
  if (!impactAtlas.passed) issues.push('impact-atlas');
  if (!tierAtlas.passed) issues.push('tier-atlas');
  if (!formulaStable) issues.push('resonance-formula');
  if (gameplayMutation) issues.push('gameplay');
  if (ACTION_BUTTONS.length !== 9) issues.push('actions');

  return {
    samples,
    impactIdentityCount: RELIC_RESONANCE_IMPACT_IDENTITY_IDS.length,
    tierIdentityCount: RELIC_RESONANCE_TIER_IDENTITY_IDS.length,
    impactCoverage: impactAtlas.coverage,
    tierCoverage: tierAtlas.coverage,
    impactUniqueCellCount: impactAtlas.uniqueCellCount,
    tierUniqueCellCount: tierAtlas.uniqueCellCount,
    thresholds: THRESHOLDS,
    actionCount: ACTION_BUTTONS.length,
    snapshotSchemaMutation: false,
    gameplayMutation,
    issues,
    passed: issues.length === 0 && samples.every((sample) => sample.passed),
  };
}

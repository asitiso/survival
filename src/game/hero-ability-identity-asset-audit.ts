import { ACTION_ICON_ATLAS } from './action-icon-assets.js';
import { ACTION_BUTTONS } from './config.js';
import { growthChoiceIcon } from './growth-choice-icon-assets.js';
import {
  HERO_ABILITY_ACTIONS,
  HERO_ABILITY_HERO_IDS,
  HERO_ABILITY_IDENTITY_ATLAS,
  auditHeroAbilityIdentityAtlas,
  heroAbilityIdentityIcon,
} from './hero-ability-identity-assets.js';
import type { SpellId } from './spells.js';

export type HeroAbilityIdentitySurface = 'combat' | 'decision-fallback';

export interface HeroAbilityIdentityAssetSample {
  key: string;
  heroId: string;
  actionId: string;
  surface: HeroAbilityIdentitySurface;
  atlasMatch: boolean;
  heroActionMatch: boolean;
  motionAmplitude: number;
  textFallbackPreserved: boolean;
  legacyFallbackPreserved: boolean;
  imageLoadFailureNonBlocking: boolean;
  passed: boolean;
}

export interface HeroAbilityIdentityAssetAudit {
  samples: HeroAbilityIdentityAssetSample[];
  identityCount: number;
  coverage: number;
  uniqueCellCount: number;
  outOfBounds: string[];
  heroActionMismatch: string[];
  combatCoverage: number;
  decisionFallbackCoverage: number;
  motionAmplitude: number;
  textFallbackPreserved: boolean;
  legacyFallbackPreserved: boolean;
  imageLoadFailureNonBlocking: boolean;
  actionCount: number;
  snapshotSchemaMutation: false;
  issues: string[];
  passed: boolean;
}

const SPELLS: readonly SpellId[] = ['fireBolt','chainLightning','frostNova','flameField','meteorStorm','blackHole'] as const;

export function auditHeroAbilityIdentityAssets(): HeroAbilityIdentityAssetAudit {
  const atlas = auditHeroAbilityIdentityAtlas();
  const samples: HeroAbilityIdentityAssetSample[] = [];
  const heroActionMismatch: string[] = [];

  for (const heroId of HERO_ABILITY_HERO_IDS) {
    for (let index = 0; index < HERO_ABILITY_ACTIONS.length; index += 1) {
      const actionId = HERO_ABILITY_ACTIONS[index]!;
      const spellId = SPELLS[index]!;
      const icon = heroAbilityIdentityIcon(heroId, actionId);
      const key = `${heroId}:${actionId}`;
      const heroActionMatch = icon.heroId === heroId && icon.actionId === actionId && icon.key === key;
      if (!heroActionMatch) heroActionMismatch.push(key);
      const atlasMatch = icon.atlasSrc === HERO_ABILITY_IDENTITY_ATLAS.src;
      const common = {
        key,
        heroId,
        actionId,
        atlasMatch,
        heroActionMatch,
        motionAmplitude: icon.motionAmplitude,
        textFallbackPreserved: icon.textFallbackPreserved,
        legacyFallbackPreserved: icon.legacyFallbackPreserved,
        imageLoadFailureNonBlocking: !icon.loadFailureBlocksGameplay,
      };
      const combatPassed = atlasMatch && heroActionMatch && icon.motionAmplitude === 0 && icon.textFallbackPreserved && icon.legacyFallbackPreserved && !icon.loadFailureBlocksGameplay;
      samples.push({ ...common, surface: 'combat', passed: combatPassed });

      const heroChoice = growthChoiceIcon(spellId, undefined, heroId);
      const legacyChoice = growthChoiceIcon(spellId);
      const decisionAtlasMatch = heroChoice?.atlasSrc === HERO_ABILITY_IDENTITY_ATLAS.src;
      const legacyMatch = legacyChoice?.atlasSrc === ACTION_ICON_ATLAS.src;
      samples.push({
        ...common,
        surface: 'decision-fallback',
        atlasMatch: decisionAtlasMatch,
        legacyFallbackPreserved: icon.legacyFallbackPreserved && legacyMatch,
        passed: Boolean(decisionAtlasMatch && heroActionMatch && legacyMatch && icon.motionAmplitude === 0 && icon.textFallbackPreserved && !icon.loadFailureBlocksGameplay),
      });
    }
  }

  const combat = samples.filter((sample) => sample.surface === 'combat');
  const fallback = samples.filter((sample) => sample.surface === 'decision-fallback');
  const combatCoverage = combat.length === 0 ? 1 : combat.filter((sample) => sample.passed).length / combat.length;
  const decisionFallbackCoverage = fallback.length === 0 ? 1 : fallback.filter((sample) => sample.passed).length / fallback.length;
  const motionAmplitude = Math.max(0, ...samples.map((sample) => sample.motionAmplitude));
  const textFallbackPreserved = samples.every((sample) => sample.textFallbackPreserved);
  const legacyFallbackPreserved = samples.every((sample) => sample.legacyFallbackPreserved);
  const imageLoadFailureNonBlocking = samples.every((sample) => sample.imageLoadFailureNonBlocking);
  const actionCount = ACTION_BUTTONS.length;
  const issues: string[] = [];
  if (samples.length !== 48) issues.push(`samples:${samples.length}`);
  if (atlas.coverage !== 1 || atlas.uniqueCellCount !== 24 || atlas.outOfBounds.length > 0) issues.push('atlas');
  if (heroActionMismatch.length > 0) issues.push('hero-action-mismatch');
  if (combatCoverage !== 1) issues.push('combat-coverage');
  if (decisionFallbackCoverage !== 1) issues.push('decision-fallback-coverage');
  if (motionAmplitude !== 0) issues.push('motion');
  if (!textFallbackPreserved) issues.push('text-fallback');
  if (!legacyFallbackPreserved) issues.push('legacy-fallback');
  if (!imageLoadFailureNonBlocking) issues.push('blocking');
  if (actionCount !== 9) issues.push(`actions:${actionCount}`);

  return {
    samples,
    identityCount: 24,
    coverage: atlas.coverage,
    uniqueCellCount: atlas.uniqueCellCount,
    outOfBounds: atlas.outOfBounds,
    heroActionMismatch,
    combatCoverage,
    decisionFallbackCoverage,
    motionAmplitude,
    textFallbackPreserved,
    legacyFallbackPreserved,
    imageLoadFailureNonBlocking,
    actionCount,
    snapshotSchemaMutation: false,
    issues,
    passed: issues.length === 0,
  };
}

import { clamp } from '../../core/math.js';
import type { FatePathId } from '../fate-paths.js';
import type { PresentationQuality } from '../presentation-budget.js';
import type { ContractOption } from './contracts.js';
import { deepRunDecisionIdentityStyle } from '../deep-run-decision-identity-assets.js';
import { runContractRequirementIdentityStyle } from '../run-contract-requirement-identity-assets.js';
import { runContractBoonEffectIdentityStyle } from '../run-contract-boon-effect-identity-assets.js';
import { getAscensionModifiers } from './ascension.js';
import { getWorldModifiers } from './world-evolution.js';
import type { ExtensionSnapshotV2 } from './snapshot.js';
import type { DeviceClass, LegacyRunView } from './types.js';

export interface Phase22RunAdapterInput {
  heroId: string;
  elapsedSeconds: number;
  level: number;
  threat: number;
  kills: number;
  bossesDefeated: number;
  elitesDefeated: number;
  gold: number;
  xp: number;
  guardianCoreHp: number;
  guardianCoreMaxHp: number;
  fateChoices: readonly FatePathId[];
  spellFusionCount: number;
  mapEvolutionRank: number;
  masteryLevel: number;
  presentationQuality: PresentationQuality;
}

function fateFromChoices(choices: readonly FatePathId[]): LegacyRunView['fate'] {
  const latest = choices.at(-1);
  if (latest === 'golden') return 'gold';
  if (latest === 'frenzy' || latest === 'guardian') return latest;
  return 'none';
}

function deviceClass(quality: PresentationQuality): DeviceClass {
  return quality === 'low' ? 'low' : quality === 'medium' ? 'mid' : 'high';
}

export function buildLegacyRunView(input: Phase22RunAdapterInput): LegacyRunView {
  return {
    heroId: input.heroId,
    elapsedMs: Math.max(0, input.elapsedSeconds) * 1000,
    level: Math.max(1, input.level),
    threat: clamp(input.threat, 0, 5),
    kills: Math.max(0, input.kills),
    bossesDefeated: Math.max(0, input.bossesDefeated),
    elitesDefeated: Math.max(0, input.elitesDefeated),
    gold: Math.max(0, input.gold),
    xp: Math.max(0, input.xp),
    guardianCoreHp: Math.max(0, input.guardianCoreHp),
    guardianCoreMaxHp: Math.max(1, input.guardianCoreMaxHp),
    fate: fateFromChoices(input.fateChoices),
    spellFusionCount: Math.max(0, input.spellFusionCount),
    mapEvolutionRank: Math.max(0, input.mapEvolutionRank),
    masteryLevel: Math.max(1, input.masteryLevel),
    deviceClass: deviceClass(input.presentationQuality),
  };
}

const CONTRACT_ACCENTS: Record<ContractOption['family'], string> = {
  slayer: '#ff7f6d',
  warden: '#7edcff',
  arcane: '#b996ff',
  hunter: '#ffd66e',
  survivor: '#7fe0a2',
};

export interface ContractChoiceCard {
  optionId: string;
  family: ContractOption['family'];
  title: string;
  description: string;
  accent: string;
  identityIconStyle: string;
  secondaryIdentityStyles: readonly string[];
}

export function contractChoiceCards(options: readonly ContractOption[]): ContractChoiceCard[] {
  return options.slice(0, 3).map((option) => ({
    optionId: option.optionId,
    family: option.family,
    title: option.title,
    description: option.description,
    accent: CONTRACT_ACCENTS[option.family],
    identityIconStyle: deepRunDecisionIdentityStyle({kind:'contract',id:option.family}),
    secondaryIdentityStyles:[runContractRequirementIdentityStyle(option.family),runContractBoonEffectIdentityStyle(option.family)],
  }));
}

export interface EndlessHostModifiers {
  spawnPressureMultiplier: number;
  eliteIntervalMultiplier: number;
  goldMultiplier: number;
  masteryXpMultiplier: number;
  enemyHealthMultiplier: number;
  enemyDamageMultiplier: number;
  projectilePressureMultiplier: number;
  coreRecoveryMultiplier: number;
}

export function composeEndlessHostModifiers(state: ExtensionSnapshotV2, threat: number): EndlessHostModifiers {
  const world = getWorldModifiers(state.world.current, threat);
  const ascension = getAscensionModifiers(state.ascension.tier);
  return {
    spawnPressureMultiplier: clamp(world.spawnMultiplier * ascension.spawnBudgetMultiplier, 0.75, 2.1),
    eliteIntervalMultiplier: clamp(1 / Math.max(0.1, world.eliteMultiplier * ascension.eliteBudgetMultiplier), 0.55, 1.1),
    goldMultiplier: clamp(world.goldMultiplier * ascension.goldMultiplier, 0.8, 2),
    masteryXpMultiplier: clamp(world.masteryMultiplier * ascension.masteryXpMultiplier, 0.8, 2),
    enemyHealthMultiplier: ascension.enemyHealthMultiplier,
    enemyDamageMultiplier: ascension.enemyDamageMultiplier,
    projectilePressureMultiplier: clamp(world.projectileMultiplier, 0.8, 1.35),
    coreRecoveryMultiplier: world.coreRecoveryMultiplier,
  };
}

import type { EliteAffixId } from './elite-affixes.js';

export type EliteAffixResponseCrossAffixHandoffRole = 'none' | 'incoming' | 'outgoing';

export interface EliteAffixResponseCrossAffixHandoffState {
  ownerAffixId: EliteAffixId;
  ownerImportant: boolean;
  fromAffixId: EliteAffixId | null;
  progress: number;
  lastOwnerTtl: number;
}

const CROSS_AFFIX_HANDOFF_SECONDS = 0.08;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function safeTtl(value: number, fallback: number): number {
  if (Number.isFinite(value) && value >= 0) return value;
  return Math.max(0, Number.isFinite(fallback) ? fallback : 0);
}

export function advanceEliteAffixResponseCrossAffixHandoff(
  previous: EliteAffixResponseCrossAffixHandoffState | undefined,
  ownerAffixId: EliteAffixId,
  ownerImportant: boolean,
  ownerTtl: number,
): EliteAffixResponseCrossAffixHandoffState {
  if (!previous) {
    return {
      ownerAffixId,
      ownerImportant,
      fromAffixId: null,
      progress: 1,
      lastOwnerTtl: safeTtl(ownerTtl, 0),
    };
  }

  if (previous.ownerAffixId !== ownerAffixId) {
    return {
      ownerAffixId,
      ownerImportant,
      fromAffixId: previous.ownerAffixId,
      progress: 0,
      lastOwnerTtl: safeTtl(ownerTtl, previous.lastOwnerTtl),
    };
  }

  const currentTtl = safeTtl(ownerTtl, previous.lastOwnerTtl);
  const previousTtl = safeTtl(previous.lastOwnerTtl, currentTtl);
  const elapsed = Math.max(0, previousTtl - currentTtl);
  const progress = clamp01(previous.progress + elapsed / CROSS_AFFIX_HANDOFF_SECONDS);

  return {
    ownerAffixId,
    ownerImportant,
    fromAffixId: progress >= 1 ? null : previous.fromAffixId,
    progress,
    lastOwnerTtl: currentTtl,
  };
}

export function eliteAffixResponseCrossAffixHandoffRole(
  state: EliteAffixResponseCrossAffixHandoffState | undefined,
  affixId: EliteAffixId,
  primary: boolean,
): EliteAffixResponseCrossAffixHandoffRole {
  if (!state || state.progress >= 1 || !state.fromAffixId) return 'none';
  if (primary && affixId === state.ownerAffixId) return 'incoming';
  if (!primary && affixId === state.fromAffixId) return 'outgoing';
  return 'none';
}

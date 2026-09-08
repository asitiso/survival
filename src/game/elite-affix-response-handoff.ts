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

function activeHandoff(state: EliteAffixResponseCrossAffixHandoffState | undefined): boolean {
  return Boolean(
    state &&
    state.fromAffixId &&
    Number.isFinite(state.progress) &&
    state.progress >= 0 &&
    state.progress < 1,
  );
}

export function eliteAffixResponseCrossAffixRetargetProgress(
  state: EliteAffixResponseCrossAffixHandoffState | undefined,
): number {
  if (!state || !activeHandoff(state)) return 0;
  return clamp01(state.progress);
}

export function eliteAffixResponseCrossAffixReentrantFrom(
  state: EliteAffixResponseCrossAffixHandoffState | undefined,
  activeAffixIds: readonly EliteAffixId[],
): EliteAffixId | null {
  if (!state) return null;
  if (!activeHandoff(state)) return state.ownerAffixId;
  if (activeAffixIds.includes(state.ownerAffixId)) return state.ownerAffixId;
  if (state.fromAffixId && activeAffixIds.includes(state.fromAffixId)) return state.fromAffixId;
  return state.ownerAffixId;
}

export function advanceEliteAffixResponseCrossAffixHandoff(
  previous: EliteAffixResponseCrossAffixHandoffState | undefined,
  ownerAffixId: EliteAffixId,
  ownerImportant: boolean,
  ownerTtl: number,
  activeAffixIds: readonly EliteAffixId[] = [],
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
      fromAffixId: eliteAffixResponseCrossAffixReentrantFrom(previous, activeAffixIds) ?? previous.ownerAffixId,
      progress: eliteAffixResponseCrossAffixRetargetProgress(previous),
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

export function eliteAffixResponseCrossAffixHandoffHoldActive(
  state: EliteAffixResponseCrossAffixHandoffState | undefined,
  currentOwnerActive: boolean,
): boolean {
  return Boolean(
    state &&
    currentOwnerActive &&
    state.fromAffixId &&
    Number.isFinite(state.progress) &&
    state.progress >= 0 &&
    state.progress < 1,
  );
}

export function eliteAffixResponseCrossAffixOutgoingPresent(
  state: EliteAffixResponseCrossAffixHandoffState | undefined,
  activeAffixIds: readonly EliteAffixId[],
): boolean {
  if (
    !state ||
    !state.fromAffixId ||
    !Number.isFinite(state.progress) ||
    state.progress < 0 ||
    state.progress >= 1
  ) {
    return false;
  }
  return activeAffixIds.includes(state.fromAffixId);
}

export function eliteAffixResponseCrossAffixIncomingStart(
  importantEvent: boolean,
  outgoingPresent: boolean,
): number {
  if (importantEvent) return outgoingPresent ? 0.90 : 0.96;
  return outgoingPresent ? 0.68 : 0.82;
}

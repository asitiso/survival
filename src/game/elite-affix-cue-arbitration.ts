import type { EliteAffixId } from './elite-affixes.js';
import type { FrenziedThresholdPhase, SwiftCadencePhase } from './elite-affix-identity-assets.js';

export type EliteAffixCueEventKind = 'response' | 'strike' | 'shieldBreak' | 'thresholdEntry';

export interface EliteAffixCueEvent {
  affixId: EliteAffixId;
  kind: EliteAffixCueEventKind;
}

export interface EliteAffixCueOwnershipState {
  owner: EliteAffixId | null;
  holdTtl: number;
  releaseTtl: number;
  eventPriority: 0 | 1 | 2 | 3;
}

export interface EliteAffixCueOwnershipInput {
  affixes: readonly EliteAffixId[];
  dt: number;
  event?: EliteAffixCueEvent | null;
  swiftPhase?: SwiftCadencePhase | null | undefined;
  frenziedPhase?: FrenziedThresholdPhase | null | undefined;
  manaShieldActive?: boolean;
  regeneratingActive?: boolean;
  commanderActive?: boolean;
  armoredActive?: boolean;
}

export interface EliteAffixCueLayerInput {
  activeEliteCount: number;
  indexFromPriority: number;
  priorityTarget: boolean;
  activeAttack: boolean;
  higherPriorityCue: boolean;
  battlefieldStress: number;
  reducedMotion: boolean;
  reducedFlash: boolean;
}

export interface EliteAffixCueLayerPresentation {
  visible: boolean;
  primary: boolean;
  alphaScale: number;
  motionScale: number;
  responseAlphaScale: number;
}

const IMPORTANT_HOLD_SECONDS = 0.16;
const IMPORTANT_RELEASE_SECONDS = 0.10;
const RESPONSE_HOLD_SECONDS = 0.08;
const RESPONSE_RELEASE_SECONDS = 0.06;
const PASSIVE_HOLD_SECONDS = 0.08;
const PASSIVE_RELEASE_SECONDS = 0.06;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function eventPriority(kind: EliteAffixCueEventKind): 2 | 3 {
  return kind === 'strike' || kind === 'shieldBreak' || kind === 'thresholdEntry' ? 3 : 2;
}

function candidateScore(id: EliteAffixId, input: EliteAffixCueOwnershipInput): number {
  if (id === 'swift') {
    if (input.swiftPhase === 'strike') return 2.9;
    if (input.swiftPhase === 'ready') return 2.4;
    if (input.swiftPhase === 'recovery') return 1.5;
    return 1.1;
  }
  if (id === 'frenzied') {
    if (input.frenziedPhase === 'entered') return 2.8;
    if (input.frenziedPhase === 'active') return 2.0;
    if (input.frenziedPhase === 'released') return 1.1;
    return 0.6;
  }
  if (id === 'manaShield') return input.manaShieldActive ? 1.7 : 0.8;
  if (id === 'regenerating') return input.regeneratingActive ? 1.4 : 0.8;
  if (id === 'commander') return input.commanderActive ? 1.35 : 0.85;
  if (id === 'armored') return input.armoredActive ? 1.2 : 0.75;
  return 0.5;
}

function preferredOwner(input: EliteAffixCueOwnershipInput): EliteAffixId | null {
  const affixes = input.affixes.slice(0, 2);
  let owner: EliteAffixId | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const affixId of affixes) {
    const score = candidateScore(affixId, input);
    if (score > bestScore) {
      owner = affixId;
      bestScore = score;
    }
  }
  return owner;
}

function progressHeldState(previous: EliteAffixCueOwnershipState, dt: number): EliteAffixCueOwnershipState {
  const step = Math.max(0, Number.isFinite(dt) ? dt : 0);
  const holdConsumed = Math.min(previous.holdTtl, step);
  const holdTtl = Math.max(0, previous.holdTtl - holdConsumed);
  const releaseStep = Math.max(0, step - holdConsumed);
  const releaseTtl = Math.max(0, previous.releaseTtl - releaseStep);
  return { ...previous, holdTtl, releaseTtl };
}

export function advanceEliteAffixCueOwnership(
  previous: EliteAffixCueOwnershipState | undefined,
  input: EliteAffixCueOwnershipInput,
): EliteAffixCueOwnershipState {
  const affixes = input.affixes.slice(0, 2);
  if (affixes.length === 0) return { owner: null, holdTtl: 0, releaseTtl: 0, eventPriority: 0 };

  const event = input.event && affixes.includes(input.event.affixId) ? input.event : null;
  if (event) {
    const priority = eventPriority(event.kind);
    const heldImportant = Boolean(previous?.owner) && previous?.eventPriority === 3 && ((previous?.holdTtl ?? 0) > 0 || (previous?.releaseTtl ?? 0) > 0);
    if (priority < 3 && heldImportant) return previous!;
    return {
      owner: event.affixId,
      holdTtl: priority === 3 ? IMPORTANT_HOLD_SECONDS : RESPONSE_HOLD_SECONDS,
      releaseTtl: priority === 3 ? IMPORTANT_RELEASE_SECONDS : RESPONSE_RELEASE_SECONDS,
      eventPriority: priority,
    };
  }

  if (previous?.owner && affixes.includes(previous.owner)) {
    const progressed = progressHeldState(previous, input.dt);
    if (progressed.holdTtl > 0 || progressed.releaseTtl > 0) return progressed;
  }

  const owner = preferredOwner(input);
  if (!owner) return { owner: null, holdTtl: 0, releaseTtl: 0, eventPriority: 0 };
  if (previous?.owner === owner) return { owner, holdTtl: 0, releaseTtl: 0, eventPriority: 1 };
  return { owner, holdTtl: PASSIVE_HOLD_SECONDS, releaseTtl: PASSIVE_RELEASE_SECONDS, eventPriority: 1 };
}

export function eliteAffixCueLayerPresentation(
  state: EliteAffixCueOwnershipState | undefined,
  affixId: EliteAffixId,
  input: EliteAffixCueLayerInput,
): EliteAffixCueLayerPresentation {
  const primary = state?.owner === affixId;
  const stress = clamp01(input.battlefieldStress);
  const importantOwner = primary && state?.eventPriority === 3 && ((state.holdTtl ?? 0) > 0 || (state.releaseTtl ?? 0) > 0);
  const activeCount = Math.max(1, Math.floor(Number.isFinite(input.activeEliteCount) ? input.activeEliteCount : 1));
  const priorityIndex = Math.max(0, Math.floor(Number.isFinite(input.indexFromPriority) ? input.indexFromPriority : activeCount));
  const visibleSlots = Math.max(1, Math.round(4 - stress * 3));
  const distantPassive = activeCount >= 4 && stress >= 0.68 && !input.priorityTarget && !input.activeAttack && priorityIndex >= visibleSlots;
  const routineYield = input.higherPriorityCue && !importantOwner;
  const visible = importantOwner || (!routineYield && !distantPassive);

  let alphaScale: number;
  if (!visible) {
    alphaScale = primary ? 0.14 : 0.08;
  } else if (importantOwner) {
    alphaScale = Math.max(0.58, 1 - stress * 0.22);
    if (input.higherPriorityCue) alphaScale = Math.min(alphaScale, 0.50);
  } else if (primary && (input.priorityTarget || input.activeAttack)) {
    alphaScale = Math.max(0.52, 1 - stress * 0.44);
  } else if (primary) {
    alphaScale = Math.max(0.38, 0.76 - stress * 0.30);
  } else {
    alphaScale = Math.max(0.20, 0.42 - stress * 0.18);
  }

  if (input.reducedFlash) alphaScale *= 0.72;
  const motionScale = input.reducedMotion || !visible
    ? 0
    : primary
      ? importantOwner ? 0.86 : 0.72 + (input.activeAttack ? 0.28 : 0)
      : Math.max(0.12, 0.36 - stress * 0.18);

  return {
    visible,
    primary,
    alphaScale,
    motionScale,
    responseAlphaScale: alphaScale,
  };
}

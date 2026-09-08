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
  swiftPhase?: SwiftCadencePhase | null;
  frenziedPhase?: FrenziedThresholdPhase | null;
  manaShieldActive?: boolean;
  regeneratingActive?: boolean;
  commanderActive?: boolean;
  armoredActive?: boolean;
}

const IMPORTANT_HOLD_SECONDS = 0.16;
const IMPORTANT_RELEASE_SECONDS = 0.10;
const RESPONSE_HOLD_SECONDS = 0.08;
const RESPONSE_RELEASE_SECONDS = 0.06;
const PASSIVE_HOLD_SECONDS = 0.08;
const PASSIVE_RELEASE_SECONDS = 0.06;

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

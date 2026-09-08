import type { EliteAffixId } from './elite-affixes.js';
import {
  eliteAffixResponseCrossAffixIncomingStart,
  type EliteAffixResponseCrossAffixHandoffRole,
} from './elite-affix-response-handoff.js';

export interface EliteAffixResponseCrossAffixCandidate {
  affixId: EliteAffixId;
  importantEvent: boolean;
  ttl: number;
  maxTtl: number;
  livePrimary?: boolean | undefined;
}

export interface EliteAffixResponseCrossAffixOwnership {
  primaryIndex: number;
  primaryAffixId: EliteAffixId | null;
  primaryImportant: boolean;
}

export interface EliteAffixResponseCrossAffixPresentationInput {
  primary: boolean;
  importantEvent: boolean;
  primaryImportant: boolean;
  baseVisible: boolean;
  baseAlphaScale: number;
  battlefieldStress: number;
  higherPriorityCue: boolean;
  reducedFlash: boolean;
  handoffRole?: EliteAffixResponseCrossAffixHandoffRole;
  handoffProgress?: number;
  handoffHasOutgoing?: boolean;
}

export interface EliteAffixResponseCrossAffixPresentation {
  visible: boolean;
  alphaScale: number;
}

const DEFAULT_RESPONSE_LIFETIME = 0.42;

function clamp01(value: number, fallback = 0): number {
  const finite = Number.isFinite(value) ? value : fallback;
  return Math.max(0, Math.min(1, finite));
}

function active(candidate: EliteAffixResponseCrossAffixCandidate | undefined): candidate is EliteAffixResponseCrossAffixCandidate {
  return Boolean(candidate && Number.isFinite(candidate.ttl) && candidate.ttl > 0);
}

function lifeRatio(candidate: EliteAffixResponseCrossAffixCandidate): number {
  const maxTtl = Number.isFinite(candidate.maxTtl) && candidate.maxTtl > 0
    ? candidate.maxTtl
    : DEFAULT_RESPONSE_LIFETIME;
  return clamp01(candidate.ttl / maxTtl);
}

function priority(candidate: EliteAffixResponseCrossAffixCandidate): number {
  if (candidate.importantEvent) return 2;
  if (candidate.livePrimary) return 1;
  return 0;
}

function preferredIndex(candidates: readonly EliteAffixResponseCrossAffixCandidate[]): number {
  let bestIndex = -1;
  let bestPriority = Number.NEGATIVE_INFINITY;
  let bestLife = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    if (!active(candidate)) continue;
    const candidatePriority = priority(candidate);
    const candidateLife = lifeRatio(candidate);
    if (
      candidatePriority > bestPriority ||
      (candidatePriority === bestPriority && candidateLife > bestLife) ||
      (candidatePriority === bestPriority && candidateLife === bestLife && index > bestIndex)
    ) {
      bestIndex = index;
      bestPriority = candidatePriority;
      bestLife = candidateLife;
    }
  }

  return bestIndex;
}

function tertiaryHandoffScale(
  importantEvent: boolean,
  progress: number,
  outgoingPresent = true,
): number {
  const start = outgoingPresent
    ? (importantEvent ? 0.35 : 0.15)
    : (importantEvent ? 0.52 : 0.30);
  return start + (1 - start) * clamp01(progress);
}

export function eliteAffixResponseCrossAffixOwnership(
  candidates: readonly EliteAffixResponseCrossAffixCandidate[],
  previousOwnerAffixId: EliteAffixId | null = null,
  previousOwnerHoldActive = false,
): EliteAffixResponseCrossAffixOwnership {
  const preferred = preferredIndex(candidates);
  if (preferred < 0) {
    return { primaryIndex: -1, primaryAffixId: null, primaryImportant: false };
  }

  let primaryIndex = preferred;
  if (previousOwnerAffixId && previousOwnerHoldActive) {
    let previousIndex = -1;
    for (let index = candidates.length - 1; index >= 0; index -= 1) {
      const candidate = candidates[index];
      if (active(candidate) && candidate.affixId === previousOwnerAffixId) {
        previousIndex = index;
        break;
      }
    }
    if (previousIndex >= 0) {
      const previous = candidates[previousIndex]!;
      const challenger = candidates[preferred]!;
      const importantBypass = challenger.importantEvent && !previous.importantEvent;
      if (!importantBypass) primaryIndex = previousIndex;
    }
  }

  const primary = candidates[primaryIndex]!;
  return {
    primaryIndex,
    primaryAffixId: primary.affixId,
    primaryImportant: Boolean(primary.importantEvent),
  };
}

export function eliteAffixResponseCrossAffixPresentation(
  input: EliteAffixResponseCrossAffixPresentationInput,
): EliteAffixResponseCrossAffixPresentation {
  const baseAlpha = clamp01(input.baseAlphaScale);
  if (!input.baseVisible) return { visible: false, alphaScale: 0 };

  const handoffProgress = clamp01(input.handoffProgress ?? 1, 1);
  const handoffRole = input.handoffRole ?? 'none';

  if (input.primary) {
    const primaryBase = input.reducedFlash ? Math.min(0.72, baseAlpha) : baseAlpha;
    if (handoffRole === 'incoming' && handoffProgress < 1) {
      const start = eliteAffixResponseCrossAffixIncomingStart(
        input.importantEvent,
        input.handoffHasOutgoing ?? true,
      );
      const handoffScale = start + (1 - start) * handoffProgress;
      return { visible: true, alphaScale: clamp01(primaryBase * handoffScale) };
    }
    return { visible: true, alphaScale: primaryBase };
  }

  const stress = clamp01(input.battlefieldStress);
  let visible = true;
  let alphaScale: number;

  if (input.importantEvent) {
    let multiplier = Math.max(0.38, 0.62 - stress * 0.18);
    if (input.higherPriorityCue) multiplier *= 0.84;
    alphaScale = Math.min(baseAlpha, Math.max(0.30, baseAlpha * multiplier));
  } else {
    if (input.higherPriorityCue || stress >= 0.82) {
      visible = false;
      alphaScale = 0;
    } else {
      const multiplier = input.primaryImportant
        ? Math.max(0.16, 0.28 - stress * 0.08)
        : Math.max(0.24, 0.46 - stress * 0.18);
      alphaScale = baseAlpha * multiplier;
    }
  }

  if (handoffRole === 'outgoing' && handoffProgress < 1) {
    const outgoingMultiplier = (input.importantEvent ? 0.45 : 0.32) * (1 - handoffProgress);
    const outgoingAlpha = baseAlpha * outgoingMultiplier;
    if (outgoingAlpha > alphaScale) {
      visible = true;
      alphaScale = outgoingAlpha;
    }
  } else if (handoffRole === 'none' && handoffProgress < 1) {
    alphaScale *= tertiaryHandoffScale(
      input.importantEvent,
      handoffProgress,
      input.handoffHasOutgoing ?? true,
    );
  }

  if (input.reducedFlash) alphaScale = Math.min(0.72, alphaScale);
  return { visible, alphaScale: clamp01(alphaScale) };
}

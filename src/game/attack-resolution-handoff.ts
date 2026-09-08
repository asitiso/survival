import type { AttackOutcomeMetadata } from './attack-outcome-linkage.js';

export interface AttackResolutionHandoffEntry {
  key: string;
  resolvedAt: number;
  expiresAt: number;
}

export interface AttackResolutionHandoffState {
  entries: AttackResolutionHandoffEntry[];
}

export interface AttackResolutionHandoffPresentation {
  resolved: boolean;
  alphaScale: number;
  sizeScale: number;
}

const HANDOFF_SECONDS = 0.18;
const MAX_HANDOFFS = 8;
const IDLE_PRESENTATION: AttackResolutionHandoffPresentation = { resolved: false, alphaScale: 1, sizeScale: 1 };

export function createAttackResolutionHandoffState(): AttackResolutionHandoffState {
  return { entries: [] };
}

export function recordAttackResolutionHandoff(
  state: AttackResolutionHandoffState,
  outcome: AttackOutcomeMetadata | null,
  now: number,
): AttackResolutionHandoffState {
  const active = state.entries.filter((entry) => entry.expiresAt > now);
  if (!outcome) return { entries: active };
  const next = active.filter((entry) => entry.key !== outcome.key);
  next.push({ key: outcome.key, resolvedAt: now, expiresAt: now + HANDOFF_SECONDS });
  next.sort((a, b) => b.resolvedAt - a.resolvedAt || a.key.localeCompare(b.key));
  return { entries: next.slice(0, MAX_HANDOFFS) };
}

export function attackResolutionHandoffPresentation(
  state: AttackResolutionHandoffState,
  key: string,
  now: number,
  reducedMotion: boolean,
  reducedFlash: boolean,
): AttackResolutionHandoffPresentation {
  const entry = state.entries.find((candidate) => candidate.key === key && candidate.expiresAt > now);
  if (!entry) return IDLE_PRESENTATION;
  const progress = Math.max(0, Math.min(1, (now - entry.resolvedAt) / HANDOFF_SECONDS));
  const alphaStart = reducedFlash ? 0.54 : 0.64;
  const alphaEnd = reducedFlash ? 0.12 : 0.10;
  const alphaScale = alphaStart + (alphaEnd - alphaStart) * progress;
  const sizeStart = reducedMotion ? 0.94 : 0.90;
  const sizeEnd = reducedMotion ? 0.84 : 0.70;
  const sizeScale = sizeStart + (sizeEnd - sizeStart) * progress;
  return { resolved: true, alphaScale, sizeScale };
}

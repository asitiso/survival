export type CombatHapticIntent = 'heroCritical' | 'coreCritical' | 'bossPhase3' | 'bossPhase' | 'bossCountdown';
export type CombatHapticKind = CombatHapticIntent | 'dualCritical';

export interface CombatHapticDecision {
  kind: CombatHapticKind | null;
  pattern: number | number[] | null;
  dispatchCount: 0 | 1;
  acknowledged: CombatHapticIntent[];
}

const PATTERNS: Record<CombatHapticKind, number | number[]> = {
  heroCritical: 45,
  coreCritical: [45, 30, 75],
  dualCritical: [45, 30, 75, 30, 45],
  bossPhase3: [35, 25, 70],
  bossPhase: 45,
  bossCountdown: [25, 25, 60],
};

export function arbitrateCombatHaptics(intents: readonly CombatHapticIntent[], enabled = true): CombatHapticDecision {
  if (!enabled || intents.length === 0) return { kind: null, pattern: null, dispatchCount: 0, acknowledged: [] };
  const set = new Set(intents);
  if (set.has('heroCritical') && set.has('coreCritical')) {
    return { kind: 'dualCritical', pattern: PATTERNS.dualCritical, dispatchCount: 1, acknowledged: ['heroCritical', 'coreCritical'] };
  }
  const priority: CombatHapticIntent[] = ['heroCritical', 'coreCritical', 'bossPhase3', 'bossPhase', 'bossCountdown'];
  const kind = priority.find((candidate) => set.has(candidate)) ?? null;
  if (!kind) return { kind: null, pattern: null, dispatchCount: 0, acknowledged: [] };
  return { kind, pattern: PATTERNS[kind], dispatchCount: 1, acknowledged: [kind] };
}

export class CombatHapticArbiter {
  private readonly intents: CombatHapticIntent[] = [];
  get pendingCount(): number { return this.intents.length; }
  queue(intent: CombatHapticIntent): void { this.intents.push(intent); }
  clear(): void { this.intents.length = 0; }
  resolve(enabled = true): CombatHapticDecision {
    const decision = arbitrateCombatHaptics(this.intents, enabled);
    this.clear();
    return decision;
  }
}

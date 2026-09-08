export type AttackOutcomeTarget = 'hero' | 'core';
export type AttackOutcomeSource = 'contact' | 'projectile' | 'explosion' | 'arena' | 'strain' | string;

export interface AttackIntentIdentity {
  enemyId: number;
  enemyType: string;
  target: AttackOutcomeTarget;
  source: AttackOutcomeSource;
}

export interface AttackIntentInput extends AttackIntentIdentity {
  now: number;
  ttl: number;
}

export interface AttackIntentRecord extends AttackIntentIdentity {
  key: string;
  expiresAt: number;
}

export interface AttackOutcomeMetadata extends AttackIntentIdentity {
  key: string;
}

export interface AttackOutcomeLinkageState {
  intents: AttackIntentRecord[];
}

export interface AttackOutcomeLookup {
  enemyId: number;
  target: AttackOutcomeTarget;
  source: AttackOutcomeSource;
  now: number;
}

const MAX_ATTACK_INTENTS = 24;

export function attackIntentKey(intent: AttackIntentIdentity): string {
  return `${intent.enemyId}:${intent.enemyType}:${intent.target}:${intent.source}`;
}

export function createAttackOutcomeLinkageState(): AttackOutcomeLinkageState {
  return { intents: [] };
}

function activeIntents(state: AttackOutcomeLinkageState, now: number): AttackIntentRecord[] {
  return state.intents.filter((intent) => intent.expiresAt > now);
}

export function rememberAttackIntent(
  state: AttackOutcomeLinkageState,
  input: AttackIntentInput,
): AttackOutcomeLinkageState {
  const key = attackIntentKey(input);
  const remembered: AttackIntentRecord = {
    key,
    enemyId: input.enemyId,
    enemyType: input.enemyType,
    target: input.target,
    source: input.source,
    expiresAt: input.now + Math.max(0, input.ttl),
  };
  const next = activeIntents(state, input.now).filter((intent) => intent.key !== key);
  next.push(remembered);
  next.sort((a, b) => b.expiresAt - a.expiresAt || a.key.localeCompare(b.key));
  return { intents: next.slice(0, MAX_ATTACK_INTENTS) };
}

export function consumeAttackOutcome(
  state: AttackOutcomeLinkageState,
  lookup: AttackOutcomeLookup,
): { state: AttackOutcomeLinkageState; outcome: AttackOutcomeMetadata | null } {
  const intents = activeIntents(state, lookup.now);
  const index = intents.findIndex((intent) =>
    intent.enemyId === lookup.enemyId
    && intent.target === lookup.target
    && intent.source === lookup.source,
  );
  if (index < 0) return { state: { intents }, outcome: null };
  const [matched] = intents.splice(index, 1);
  return {
    state: { intents },
    outcome: {
      key: matched.key,
      enemyId: matched.enemyId,
      enemyType: matched.enemyType,
      target: matched.target,
      source: matched.source,
    },
  };
}

let renderedAttackIntents: AttackOutcomeMetadata[] = [];

export function replaceRenderedAttackIntents(intents: readonly AttackOutcomeMetadata[]): void {
  const unique = new Map<string, AttackOutcomeMetadata>();
  for (const intent of intents) {
    if (!unique.has(intent.key)) unique.set(intent.key, intent);
    if (unique.size >= MAX_ATTACK_INTENTS) break;
  }
  renderedAttackIntents = [...unique.values()];
}

export function consumeRenderedAttackOutcome(
  target: AttackOutcomeTarget,
  source: AttackOutcomeSource,
): AttackOutcomeMetadata | null {
  const matches = renderedAttackIntents.filter((intent) => intent.target === target && intent.source === source);
  if (matches.length !== 1) return null;
  const matched = matches[0];
  renderedAttackIntents = renderedAttackIntents.filter((intent) => intent.key !== matched.key);
  return matched;
}

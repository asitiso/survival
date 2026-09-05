import type { ActionId } from './config.js';

export const CAST_INTENT_BUFFER_WINDOW_SECONDS = 0.20;

export const COMBAT_CAST_ACTIONS = [
  'spell1',
  'spell2',
  'spell3',
  'spell4',
  'ultimate1',
  'ultimate2',
] as const satisfies readonly ActionId[];

export type CombatCastAction = typeof COMBAT_CAST_ACTIONS[number];
export type CastIntentRequestResult = 'ready' | 'queued' | 'rejected';

export class CastIntentBuffer {
  private readonly queued = new Set<CombatCastAction>();

  get size(): number {
    return this.queued.size;
  }

  request(action: CombatCastAction, cooldownRemaining: number): CastIntentRequestResult {
    if (cooldownRemaining <= 0) return 'ready';
    if (!Number.isFinite(cooldownRemaining) || cooldownRemaining > CAST_INTENT_BUFFER_WINDOW_SECONDS) return 'rejected';
    this.queued.add(action);
    return 'queued';
  }

  isQueued(action: CombatCastAction): boolean {
    return this.queued.has(action);
  }

  consumeIfReady(action: CombatCastAction, cooldownRemaining: number): boolean {
    if (cooldownRemaining > 0 || !this.queued.has(action)) return false;
    this.queued.delete(action);
    return true;
  }

  clear(): void {
    this.queued.clear();
  }
}

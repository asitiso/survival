import { distance, type Vec2 } from '../core/math.js';
import { chooseSpellTarget, type SpellTargetCandidate } from './auto-targeting.js';

export const MANUAL_TARGET_MEMORY_SECONDS = 0.75;
export const MANUAL_TARGET_RETENTION_RANGE = 720;

function manualPriorityTier(enemy: SpellTargetCandidate, heroPos: Vec2): number {
  const d = distance(heroPos, enemy.pos);
  if (enemy.target === 'core' && d < 620) return 0;
  if ((enemy.type === 'elite' || enemy.type === 'boss') && d < 650) return 1;
  return 2;
}

export class ManualTargetMemory {
  private targetId: number | null = null;
  private expiresAt = 0;
  private targetTier: number | null = null;

  select<T extends SpellTargetCandidate>(enemies: readonly T[], heroPos: Vec2, corePos: Vec2 | null, nowSeconds: number): T | null {
    const fallback = chooseSpellTarget(enemies, heroPos, corePos, false);
    let selected = fallback;
    if (this.targetId !== null && nowSeconds < this.expiresAt && fallback) {
      const preferred = enemies.find((enemy) => enemy.id === this.targetId && enemy.alive && distance(heroPos, enemy.pos) <= MANUAL_TARGET_RETENTION_RANGE) ?? null;
      const preferredTier = preferred ? manualPriorityTier(preferred, heroPos) : null;
      if (preferred && preferredTier === this.targetTier && preferredTier === manualPriorityTier(fallback, heroPos)) selected = preferred;
    }
    this.targetId = selected?.id ?? null;
    this.targetTier = selected ? manualPriorityTier(selected, heroPos) : null;
    this.expiresAt = selected ? nowSeconds + MANUAL_TARGET_MEMORY_SECONDS : 0;
    return selected;
  }

  clear(): void {
    this.targetId = null;
    this.expiresAt = 0;
    this.targetTier = null;
  }

  currentTargetId(): number | null {
    return this.targetId;
  }
}

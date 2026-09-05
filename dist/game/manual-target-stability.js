import { distance } from '../core/math.js';
import { chooseSpellTarget } from './auto-targeting.js';
export const MANUAL_TARGET_MEMORY_SECONDS = 0.75;
export const MANUAL_TARGET_RETENTION_RANGE = 720;
function manualPriorityTier(enemy, heroPos) {
    const d = distance(heroPos, enemy.pos);
    if (enemy.target === 'core' && d < 620)
        return 0;
    if ((enemy.type === 'elite' || enemy.type === 'boss') && d < 650)
        return 1;
    return 2;
}
export class ManualTargetMemory {
    targetId = null;
    expiresAt = 0;
    targetTier = null;
    select(enemies, heroPos, corePos, nowSeconds) {
        const fallback = chooseSpellTarget(enemies, heroPos, corePos, false);
        let selected = fallback;
        if (this.targetId !== null && nowSeconds < this.expiresAt && fallback) {
            const preferred = enemies.find((enemy) => enemy.id === this.targetId && enemy.alive && distance(heroPos, enemy.pos) <= MANUAL_TARGET_RETENTION_RANGE) ?? null;
            const preferredTier = preferred ? manualPriorityTier(preferred, heroPos) : null;
            if (preferred && preferredTier === this.targetTier && preferredTier === manualPriorityTier(fallback, heroPos))
                selected = preferred;
        }
        this.targetId = selected?.id ?? null;
        this.targetTier = selected ? manualPriorityTier(selected, heroPos) : null;
        this.expiresAt = selected ? nowSeconds + MANUAL_TARGET_MEMORY_SECONDS : 0;
        return selected;
    }
    clear() {
        this.targetId = null;
        this.expiresAt = 0;
        this.targetTier = null;
    }
    currentTargetId() {
        return this.targetId;
    }
}

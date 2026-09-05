import type { Vec2 } from '../core/math.js';

export interface DangerUiState {
  heroCritical: boolean;
  coreCritical: boolean;
  vignetteAlpha: number;
  heroWarning: string;
  coreWarning: string;
}

export interface PriorityThreatLike {
  id: number;
  type: string;
  pos: Vec2;
  alive: boolean;
}

export type CriticalHapticEvent = 'hero' | 'core';

export function dangerUiState(heroHpRatio: number, coreHpRatio: number, previous?: DangerUiState): DangerUiState {
  const heroRatio = Math.max(0, Math.min(1, heroHpRatio));
  const coreRatio = Math.max(0, Math.min(1, coreHpRatio));
  const heroCritical = previous?.heroCritical ? heroRatio <= 0.33 : heroRatio <= 0.30;
  const coreCritical = previous?.coreCritical ? coreRatio <= 0.38 : coreRatio <= 0.35;
  const vignetteAlpha = heroCritical
    ? Math.min(0.48, Math.max(0.18, 0.18 + ((0.30 - heroRatio) / 0.30) * 0.30))
    : 0;
  return {
    heroCritical,
    coreCritical,
    vignetteAlpha,
    heroWarning: heroCritical ? 'HP 위험' : '',
    coreWarning: coreCritical ? '수호핵 위험' : '',
  };
}

export function priorityThreatIds(enemies: readonly PriorityThreatLike[], heroPos: Vec2, limit = 2): number[] {
  const bossIds = enemies.filter((enemy) => enemy.alive && enemy.type === 'boss').map((enemy) => enemy.id);
  const tactical = enemies
    .filter((enemy) => enemy.alive && (enemy.type === 'bomber' || enemy.type === 'shaman'))
    .map((enemy) => ({ id: enemy.id, distance: Math.hypot(enemy.pos.x - heroPos.x, enemy.pos.y - heroPos.y) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, Math.max(0, Math.floor(limit)))
    .map((entry) => entry.id);
  return [...bossIds, ...tactical];
}

export function criticalHapticEvents(previous: DangerUiState, next: DangerUiState): CriticalHapticEvent[] {
  const events: CriticalHapticEvent[] = [];
  if (!previous.heroCritical && next.heroCritical) events.push('hero');
  if (!previous.coreCritical && next.coreCritical) events.push('core');
  return events;
}

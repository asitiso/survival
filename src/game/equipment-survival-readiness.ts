import { directorSnapshot } from '../domain/director.js';
import type { EquipmentState } from '../domain/types.js';
import { enemyStats } from './enemies.js';
import { equipmentBonuses } from './shop-data.js';

export interface EquipmentReadinessContext {
  elapsedSeconds: number;
  heroMaxHp: number;
  state: EquipmentState;
}
export interface EquipmentRecommendation {
  heroSurvivalHits: number;
  coreDamageMultiplier: number;
  firepowerIndex: number;
}
export interface EquipmentReadinessResult extends EquipmentRecommendation {
  label: '준비 부족' | '생존 가능' | '안정';
  recommended: EquipmentRecommendation;
  weakestMetric: 'hero' | 'core' | 'firepower';
  contactDamage: number;
  spellPowerMultiplier: number;
  cooldownMultiplier: number;
  areaMultiplier: number;
}
export interface EquipmentSurvivalProjection {
  before: EquipmentReadinessResult;
  after: EquipmentReadinessResult;
  summary: string;
}

// Reference HP 333. 5m: rare armor; 8m: rare defensive set;
// 12m: rare armor + crafted weapon; 15m: hidden accessory; 20m: hidden armor.
// Targets describe attainable builds, never change combat or scale with owned gear.
const ANCHORS = [
  { seconds: 0, heroSurvivalHits: 333 / 8.5, coreDamageMultiplier: 1, firepowerIndex: 1 },
  { seconds: 300, heroSurvivalHits: 30, coreDamageMultiplier: 1, firepowerIndex: 1.4 },
  { seconds: 480, heroSurvivalHits: 26, coreDamageMultiplier: .85, firepowerIndex: 2.28 },
  { seconds: 720, heroSurvivalHits: 16, coreDamageMultiplier: 1, firepowerIndex: 2.4 },
  { seconds: 900, heroSurvivalHits: 17.6, coreDamageMultiplier: 1, firepowerIndex: 4 },
  { seconds: 1200, heroSurvivalHits: 17, coreDamageMultiplier: .60, firepowerIndex: 4.8 },
] as const;
function recommendations(seconds: number): EquipmentRecommendation {
  for (let i = 1; i < ANCHORS.length; i += 1) {
    const a = ANCHORS[i - 1]!, b = ANCHORS[i]!;
    if (seconds <= b.seconds) {
      const t = (seconds - a.seconds) / (b.seconds - a.seconds);
      return {
        heroSurvivalHits: a.heroSurvivalHits + (b.heroSurvivalHits - a.heroSurvivalHits) * t,
        coreDamageMultiplier: a.coreDamageMultiplier + (b.coreDamageMultiplier - a.coreDamageMultiplier) * t,
        firepowerIndex: a.firepowerIndex + (b.firepowerIndex - a.firepowerIndex) * t,
      };
    }
  }
  const last = ANCHORS[ANCHORS.length - 1]!;
  return { heroSurvivalHits: last.heroSurvivalHits, coreDamageMultiplier: last.coreDamageMultiplier, firepowerIndex: last.firepowerIndex };
}
export function equipmentReadiness(context: EquipmentReadinessContext): EquipmentReadinessResult {
  const seconds = Number.isFinite(context.elapsedSeconds) ? Math.max(0, context.elapsedSeconds) : 0;
  const hp = Number.isFinite(context.heroMaxHp) ? Math.max(0, context.heroMaxHp) : 0;
  const bonuses = equipmentBonuses(context.state);
  const contactDamage = enemyStats('grunt', directorSnapshot(seconds).danger, seconds).damage;
  const heroSurvivalHits = hp / (contactDamage * bonuses.damageTakenMultiplier);
  const coreDamageMultiplier = bonuses.coreDamageTakenMultiplier;
  // Area is a linear coverage proxy, not an assertion that every enemy is hit.
  const { spellPowerMultiplier, cooldownMultiplier, areaMultiplier } = bonuses;
  const firepowerIndex = spellPowerMultiplier / cooldownMultiplier * areaMultiplier;
  const recommended = recommendations(seconds);
  const heroRatio = heroSurvivalHits / recommended.heroSurvivalHits;
  const fireRatio = firepowerIndex / recommended.firepowerIndex;
  const coreRatio = recommended.coreDamageMultiplier / coreDamageMultiplier;
  const weakestMetric = heroRatio <= fireRatio && heroRatio <= coreRatio ? 'hero' : fireRatio <= coreRatio ? 'firepower' : 'core';
  const label = heroRatio < .8 || fireRatio < .8 ? '준비 부족'
    : heroRatio >= 1.2 && fireRatio >= 1.2 && coreRatio >= 1 ? '안정' : '생존 가능';
  return { label, heroSurvivalHits, coreDamageMultiplier, firepowerIndex, recommended, weakestMetric,
    contactDamage, spellPowerMultiplier, cooldownMultiplier, areaMultiplier };
}
export function equipmentSurvivalDelta(before: EquipmentReadinessResult, after: EquipmentReadinessResult): string {
  return `생존 ${before.heroSurvivalHits.toFixed(1)}→${after.heroSurvivalHits.toFixed(1)}타 · 수호핵 ${before.coreDamageMultiplier.toFixed(2)}→${after.coreDamageMultiplier.toFixed(2)}× · 화력 ${before.firepowerIndex.toFixed(2)}→${after.firepowerIndex.toFixed(2)}×`;
}
export function projectEquipmentSurvival(context: EquipmentReadinessContext, candidateState: EquipmentState): EquipmentSurvivalProjection {
  const before = equipmentReadiness(context);
  const after = equipmentReadiness({ ...context, state: candidateState });
  return { before, after, summary: equipmentSurvivalDelta(before, after) };
}

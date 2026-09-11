import type { EquipmentState, ShopOffer } from './types.js';

/** Rank gates keep jackpots from completing a run's equipment in the opening. */
export function equipmentUnlockSeconds(rank: number): number {
  const r = Math.max(1, Math.floor(rank));
  return [0, 0, 90, 240, 480, 720][r] ?? 900 + (r - 6) * 120;
}

export function nextEquipmentRank(state: EquipmentState, offer: ShopOffer): number {
  if (offer.kind === 'potion') return 0;
  const current = state[offer.kind];
  return current?.id === offer.id ? current.rank + 1 : 1;
}

export function equipmentPurchaseUnlock(state: EquipmentState, offer: ShopOffer): number {
  return equipmentUnlockSeconds(nextEquipmentRank(state, offer));
}

export function equipmentPriceMultiplier(rank: number): number {
  return [1, 2, 4, 8, 18][Math.max(0, rank)] ?? 28 * Math.pow(1.32, Math.min(90, rank - 5));
}

export function equipmentStageHint(seconds: number): string {
  if (seconds < 180) return '준비 · 무기·방어구·장신구 3슬롯 확보';
  if (seconds < 300) return '성장 · 고급 2부위로 세트 효과 준비';
  if (seconds < 480) return '생존 · 희귀 장비와 3세트 준비';
  if (seconds < 720) return '격전 · 영웅 장비 강화 권장';
  if (seconds < 900) return '심화 · 전설 장비와 세트 완성 권장';
  return '장기전 · 전설 추가 강화로 생존력 보강';
}

/** Additional pressure, independent of owned gear; smoothly interpolated and capped. */
export function equipmentEnemyPressure(seconds: number): { health: number; damage: number } {
  const s = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const checkpoints = [
    [0, 1, .85], [120, 1, 1], [300, 1.20, 1.20],
    [480, 1.45, 1.45], [720, 1.85, 1.85],
    [900, 2.10, 2.10], [1200, 2.40, 2.35], [1800, 2.65, 2.55],
  ] as const;
  for (let i = 1; i < checkpoints.length; i++) {
    const a = checkpoints[i - 1]!, b = checkpoints[i]!;
    if (s <= b[0]) {
      const t = (s - a[0]) / (b[0] - a[0]);
      return { health: a[1] + (b[1] - a[1]) * t, damage: a[2] + (b[2] - a[2]) * t };
    }
  }
  return { health: 2.65, damage: 2.55 };
}

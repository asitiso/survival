export type ThreatDirectiveId = 'swarmFront' | 'ironMarch' | 'artilleryLine' | 'hexConvoy';
export type RegularEnemyType = 'grunt' | 'hound' | 'brute' | 'archer' | 'bomber' | 'shaman';
export type RegularEnemyWeights = Readonly<Record<RegularEnemyType, number>>;

export interface ThreatDirective {
  id: ThreatDirectiveId;
  name: string;
  description: string;
  accent: string;
}

export interface ThreatDirectiveModifiers {
  spawnPressureMultiplier: number;
  enemySpeedMultiplier: number;
  eliteIntervalMultiplier: number;
  regularWeights: RegularEnemyWeights;
}

const ROTATION: readonly ThreatDirective[] = [
  { id: 'swarmFront', name: '군집 전선', description: '사냥개와 잡병이 빠르게 밀려옵니다.', accent: '#ff8a6f' },
  { id: 'ironMarch', name: '철갑 행군', description: '중갑병과 정예가 전선을 압박합니다.', accent: '#d0a66c' },
  { id: 'artilleryLine', name: '포격 전선', description: '궁수와 자폭병 비율이 크게 증가합니다.', accent: '#d58cff' },
  { id: 'hexConvoy', name: '주술 호위대', description: '주술사가 중갑병 뒤에서 전선을 회복합니다.', accent: '#72dda2' },
] as const;

const NEUTRAL_WEIGHTS: RegularEnemyWeights = {
  grunt: 1, hound: 1, brute: 1, archer: 1, bomber: 1, shaman: 1,
};

export function threatDirectiveAt(seconds: number): ThreatDirective | null {
  if (seconds < 480) return null;
  const index = Math.floor((seconds - 480) / 120) % ROTATION.length;
  return ROTATION[index] ?? null;
}

export function threatDirectiveModifiers(directive: ThreatDirective | null): ThreatDirectiveModifiers {
  if (!directive) {
    return { spawnPressureMultiplier: 1, enemySpeedMultiplier: 1, eliteIntervalMultiplier: 1, regularWeights: NEUTRAL_WEIGHTS };
  }
  if (directive.id === 'swarmFront') {
    return {
      spawnPressureMultiplier: 1.18, enemySpeedMultiplier: 1.06, eliteIntervalMultiplier: 1.10,
      regularWeights: { grunt: 1.35, hound: 2.10, brute: 0.55, archer: 0.75, bomber: 0.75, shaman: 0.55 },
    };
  }
  if (directive.id === 'ironMarch') {
    return {
      spawnPressureMultiplier: 1.12, enemySpeedMultiplier: 0.94, eliteIntervalMultiplier: 0.72,
      regularWeights: { grunt: 1.10, hound: 0.45, brute: 2.30, archer: 0.70, bomber: 0.65, shaman: 0.80 },
    };
  }
  if (directive.id === 'artilleryLine') {
    return {
      spawnPressureMultiplier: 1.10, enemySpeedMultiplier: 1, eliteIntervalMultiplier: 1,
      regularWeights: { grunt: 0.75, hound: 0.70, brute: 0.75, archer: 2.20, bomber: 2.00, shaman: 0.80 },
    };
  }
  return {
    spawnPressureMultiplier: 1.08, enemySpeedMultiplier: 0.98, eliteIntervalMultiplier: 0.90,
    regularWeights: { grunt: 0.70, hound: 0.55, brute: 1.40, archer: 1.10, bomber: 0.85, shaman: 3.00 },
  };
}

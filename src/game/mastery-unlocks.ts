import type { HeroId } from './hero-profiles.js';
import type { RunTraitId } from './run-traits.js';
import type { RelicId } from './relics.js';

export type MasteryUnlockKind = 'evolution' | 'trait' | 'fusion' | 'relic' | 'title';

export interface MasteryMilestone {
  level: 3 | 6 | 10 | 15 | 20;
  kind: MasteryUnlockKind;
  name: string;
  description: string;
}

const TRAITS: Record<HeroId, RunTraitId> = {
  arkan: 'infernalPact',
  seria: 'glacialFocus',
  kain: 'stormPursuit',
  edric: 'bastionVow',
};

const RELICS: Record<HeroId, RelicId> = {
  arkan: 'phoenix-brand',
  seria: 'zero-crystal',
  kain: 'storm-crown',
  edric: 'citadel-sigil',
};

const HERO_LABELS: Record<HeroId, readonly [string, string, string, string, string]> = {
  arkan: ['분열 화염 진화', '지옥의 계약', '태양왕 융합식', '불사조의 낙인', '칭호 · 화염군주'],
  seria: ['빙정 파쇄 진화', '빙정 집중', '절대영도 융합식', '영점 결정', '칭호 · 설원의 여왕'],
  kain: ['초전도 진화', '폭풍 추격', '뇌신 융합식', '폭풍 왕관', '칭호 · 천뢰 추적자'],
  edric: ['성벽 심판 진화', '성채의 서약', '영겁 융합식', '성채의 문장', '칭호 · 최후의 수호자'],
};

export function masteryTraitId(heroId: HeroId): RunTraitId { return TRAITS[heroId]; }
export function masteryRelicId(heroId: HeroId): RelicId { return RELICS[heroId]; }

export function masteryMilestones(heroId: HeroId): readonly MasteryMilestone[] {
  const names = HERO_LABELS[heroId];
  return [
    { level: 3, kind: 'evolution', name: names[0], description: 'Lv.5/Lv.10 진화 선택 폭이 확장됩니다.' },
    { level: 6, kind: 'trait', name: names[1], description: '영웅 전용 시작 특성이 해금됩니다.' },
    { level: 10, kind: 'fusion', name: names[2], description: '융합 마법의 영웅 전용 변형이 강화됩니다.' },
    { level: 15, kind: 'relic', name: names[3], description: '보스 보상에 전용 숙련 유물이 등장합니다.' },
    { level: 20, kind: 'title', name: names[4], description: '최종 숙련 칭호와 프레임이 해금됩니다.' },
  ];
}

export function masteryUnlockSummary(heroId: HeroId, level: number): MasteryMilestone[] {
  const safe = Math.max(1, Math.min(20, Math.floor(Number.isFinite(level) ? level : 1)));
  return masteryMilestones(heroId).filter((entry) => entry.level <= safe);
}

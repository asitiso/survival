import { clamp } from '../../core/math.js';
import type { HeroId } from '../hero-profiles.js';
import type { HeroAscensionId } from './hero-ascension.js';

export type HeroFinalFormId =
  | 'solar-sovereign' | 'phoenix-lord' | 'volcanic-archon'
  | 'absolute-empress' | 'winter-warden' | 'crystal-oracle'
  | 'thunder-tyrant' | 'tempest-runner' | 'storm-oracle'
  | 'radiant-king' | 'oath-guardian' | 'light-pilgrim';

export interface HeroFinalForm {
  id: HeroFinalFormId;
  heroId: HeroId;
  name: string;
  description: string;
  affinity: readonly HeroAscensionId[];
}

export interface HeroFinalFormModifiers {
  spellPowerMultiplier: number;
  cooldownMultiplier: number;
  areaMultiplier: number;
  moveSpeedMultiplier: number;
  heroDamageTakenMultiplier: number;
  coreDamageTakenMultiplier: number;
  fusionPowerMultiplier: number;
  bossDamageMultiplier: number;
}

const FORMS: Record<HeroId, readonly HeroFinalForm[]> = {
  arkan: [
    { id:'solar-sovereign', heroId:'arkan', name:'태양 군주', description:'화염과 보스 파괴력을 극대화합니다.', affinity:['wildfire-doctrine','solar-collapse'] },
    { id:'phoenix-lord', heroId:'arkan', name:'불사조 군주', description:'생존과 순환 영창을 강화합니다.', affinity:['ash-step','phoenix-cycle'] },
    { id:'volcanic-archon', heroId:'arkan', name:'화산 집정관', description:'범위와 융합 연쇄를 강화합니다.', affinity:['cinder-heart','eruption-chain'] },
  ],
  seria: [
    { id:'absolute-empress', heroId:'seria', name:'절대영도 여제', description:'광역 제압과 보스 동결 압박을 강화합니다.', affinity:['absolute-zero','whiteout'] },
    { id:'winter-warden', heroId:'seria', name:'겨울 수호자', description:'수호핵 방어와 영창 순환을 강화합니다.', affinity:['frozen-time','winter-covenant'] },
    { id:'crystal-oracle', heroId:'seria', name:'결정 예언자', description:'융합과 기동 제어를 강화합니다.', affinity:['crystal-echo','glacier-step'] },
  ],
  kain: [
    { id:'thunder-tyrant', heroId:'kain', name:'뇌제', description:'폭발적인 보스 피해와 마법 출력을 강화합니다.', affinity:['overcharge','sky-breaker'] },
    { id:'tempest-runner', heroId:'kain', name:'폭풍 질주자', description:'기동과 초고속 영창 순환을 강화합니다.', affinity:['thunder-step','tempest-loop'] },
    { id:'storm-oracle', heroId:'kain', name:'폭풍 예언자', description:'융합 순환과 생존 안정성을 강화합니다.', affinity:['storm-circuit','static-shell'] },
  ],
  edric: [
    { id:'radiant-king', heroId:'edric', name:'광휘왕', description:'심판과 보스 압박을 강화합니다.', affinity:['judgment-bell','last-oath'] },
    { id:'oath-guardian', heroId:'edric', name:'서약 수호왕', description:'영웅과 수호핵의 방어를 강화합니다.', affinity:['holy-bastion','vow-of-light'] },
    { id:'light-pilgrim', heroId:'edric', name:'빛의 순례자', description:'기동과 광역 방어를 강화합니다.', affinity:['pilgrim-step','radiant-wall'] },
  ],
};

function scoreForm(form: HeroFinalForm, selected: readonly HeroAscensionId[]): number {
  let score = 0;
  selected.forEach((id, index) => {
    if (form.affinity.includes(id)) score += index === selected.length - 1 ? 3 : 2;
  });
  return score;
}

export function deriveHeroFinalForm(heroId: HeroId, selected: readonly HeroAscensionId[], elapsedMs: number): HeroFinalForm | null {
  if (elapsedMs < 80 * 60_000 || selected.length < 3) return null;
  const forms = FORMS[heroId];
  let best = forms[0]!;
  let bestScore = scoreForm(best, selected);
  for (const form of forms.slice(1)) {
    const score = scoreForm(form, selected);
    if (score > bestScore) { best = form; bestScore = score; }
  }
  return best;
}

export function finalFormModifiers(form: HeroFinalForm | null): HeroFinalFormModifiers {
  const out: HeroFinalFormModifiers = {
    spellPowerMultiplier:1, cooldownMultiplier:1, areaMultiplier:1, moveSpeedMultiplier:1,
    heroDamageTakenMultiplier:1, coreDamageTakenMultiplier:1, fusionPowerMultiplier:1, bossDamageMultiplier:1,
  };
  if (!form) return out;
  switch (form.id) {
    case 'solar-sovereign': out.spellPowerMultiplier=1.18; out.bossDamageMultiplier=1.18; out.fusionPowerMultiplier=1.08; break;
    case 'phoenix-lord': out.cooldownMultiplier=.88; out.heroDamageTakenMultiplier=.88; out.moveSpeedMultiplier=1.08; break;
    case 'volcanic-archon': out.areaMultiplier=1.18; out.fusionPowerMultiplier=1.18; out.spellPowerMultiplier=1.08; break;
    case 'absolute-empress': out.areaMultiplier=1.2; out.spellPowerMultiplier=1.15; out.bossDamageMultiplier=1.1; break;
    case 'winter-warden': out.cooldownMultiplier=.86; out.coreDamageTakenMultiplier=.82; out.heroDamageTakenMultiplier=.92; break;
    case 'crystal-oracle': out.fusionPowerMultiplier=1.18; out.areaMultiplier=1.12; out.moveSpeedMultiplier=1.06; break;
    case 'thunder-tyrant': out.spellPowerMultiplier=1.18; out.bossDamageMultiplier=1.2; break;
    case 'tempest-runner': out.cooldownMultiplier=.84; out.moveSpeedMultiplier=1.12; out.areaMultiplier=1.06; break;
    case 'storm-oracle': out.fusionPowerMultiplier=1.16; out.cooldownMultiplier=.9; out.heroDamageTakenMultiplier=.9; break;
    case 'radiant-king': out.bossDamageMultiplier=1.18; out.spellPowerMultiplier=1.12; out.areaMultiplier=1.08; break;
    case 'oath-guardian': out.heroDamageTakenMultiplier=.84; out.coreDamageTakenMultiplier=.8; out.fusionPowerMultiplier=1.06; break;
    case 'light-pilgrim': out.moveSpeedMultiplier=1.1; out.areaMultiplier=1.16; out.heroDamageTakenMultiplier=.9; break;
  }
  return {
    spellPowerMultiplier: clamp(out.spellPowerMultiplier,1,1.22),
    cooldownMultiplier: clamp(out.cooldownMultiplier,.84,1),
    areaMultiplier: clamp(out.areaMultiplier,1,1.2),
    moveSpeedMultiplier: clamp(out.moveSpeedMultiplier,1,1.14),
    heroDamageTakenMultiplier: clamp(out.heroDamageTakenMultiplier,.82,1),
    coreDamageTakenMultiplier: clamp(out.coreDamageTakenMultiplier,.8,1),
    fusionPowerMultiplier: clamp(out.fusionPowerMultiplier,1,1.2),
    bossDamageMultiplier: clamp(out.bossDamageMultiplier,1,1.2),
  };
}

export function finalFormCatalog(heroId: HeroId): readonly HeroFinalForm[] { return FORMS[heroId]; }

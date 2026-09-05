import type { HeroFinalFormId } from './final-form.js';

export type FinalFormPatternKind = 'nova' | 'chain' | 'shockwave' | 'domain';

export interface FinalFormAttackPattern {
  formId: HeroFinalFormId;
  kind: FinalFormPatternKind;
  radius: number;
  damageMultiplier: number;
  pushDistance: number;
  coreHealPercent: number;
  chainTargets: number;
  slowFactor: number;
  slowDuration: number;
}

const PATTERNS: Record<HeroFinalFormId, FinalFormAttackPattern> = {
  'solar-sovereign': { formId:'solar-sovereign', kind:'nova', radius:310, damageMultiplier:1.42, pushDistance:38, coreHealPercent:0, chainTargets:0, slowFactor:1, slowDuration:0 },
  'phoenix-lord': { formId:'phoenix-lord', kind:'chain', radius:260, damageMultiplier:1.18, pushDistance:24, coreHealPercent:.01, chainTargets:8, slowFactor:1, slowDuration:0 },
  'volcanic-archon': { formId:'volcanic-archon', kind:'domain', radius:360, damageMultiplier:.98, pushDistance:34, coreHealPercent:0, chainTargets:0, slowFactor:.78, slowDuration:1.6 },
  'absolute-empress': { formId:'absolute-empress', kind:'domain', radius:345, damageMultiplier:.92, pushDistance:22, coreHealPercent:0, chainTargets:0, slowFactor:.42, slowDuration:2.8 },
  'winter-warden': { formId:'winter-warden', kind:'shockwave', radius:300, damageMultiplier:.72, pushDistance:118, coreHealPercent:.02, chainTargets:0, slowFactor:.62, slowDuration:2.1 },
  'crystal-oracle': { formId:'crystal-oracle', kind:'chain', radius:275, damageMultiplier:1.04, pushDistance:16, coreHealPercent:0, chainTargets:10, slowFactor:.7, slowDuration:1.4 },
  'thunder-tyrant': { formId:'thunder-tyrant', kind:'chain', radius:290, damageMultiplier:1.36, pushDistance:20, coreHealPercent:0, chainTargets:12, slowFactor:1, slowDuration:0 },
  'tempest-runner': { formId:'tempest-runner', kind:'shockwave', radius:280, damageMultiplier:.84, pushDistance:124, coreHealPercent:0, chainTargets:0, slowFactor:.82, slowDuration:.8 },
  'storm-oracle': { formId:'storm-oracle', kind:'domain', radius:370, damageMultiplier:1.02, pushDistance:18, coreHealPercent:0, chainTargets:0, slowFactor:.72, slowDuration:1.2 },
  'radiant-king': { formId:'radiant-king', kind:'nova', radius:325, damageMultiplier:1.32, pushDistance:62, coreHealPercent:.012, chainTargets:0, slowFactor:1, slowDuration:0 },
  'oath-guardian': { formId:'oath-guardian', kind:'shockwave', radius:335, damageMultiplier:.68, pushDistance:128, coreHealPercent:.035, chainTargets:0, slowFactor:.74, slowDuration:1.4 },
  'light-pilgrim': { formId:'light-pilgrim', kind:'domain', radius:355, damageMultiplier:.88, pushDistance:48, coreHealPercent:.025, chainTargets:0, slowFactor:.68, slowDuration:1.8 },
};

export const FINAL_FORM_PATTERN_IDS = new Set<HeroFinalFormId>(Object.keys(PATTERNS) as HeroFinalFormId[]);

export function finalFormAttackPattern(formId: string): FinalFormAttackPattern | null {
  return FINAL_FORM_PATTERN_IDS.has(formId as HeroFinalFormId) ? PATTERNS[formId as HeroFinalFormId] : null;
}

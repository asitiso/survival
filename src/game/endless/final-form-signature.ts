import { clamp } from '../../core/math.js';
import type { GameplayEvent } from './types.js';
import type { HeroFinalForm, HeroFinalFormId } from './final-form.js';
import type { BuildArchetype } from './build-overdrive.js';

export interface FinalFormSignatureProfile {
  formId: HeroFinalFormId;
  name: string;
  family: BuildArchetype;
  color: string;
  durationMs: number;
  cooldownMs: number;
}

export interface FinalFormSignatureState {
  charge: number;
  activeUntilMs: number;
  cooldownUntilMs: number;
  activations: number;
  formId: HeroFinalFormId | null;
}

export interface FinalFormSignatureModifiers {
  active: boolean;
  spellPowerMultiplier: number;
  cooldownMultiplier: number;
  areaMultiplier: number;
  moveSpeedMultiplier: number;
  heroDamageTakenMultiplier: number;
  coreDamageTakenMultiplier: number;
  bossDamageMultiplier: number;
  fusionPowerMultiplier: number;
}

const PROFILES: Record<HeroFinalFormId, FinalFormSignatureProfile> = {
  'solar-sovereign': { formId:'solar-sovereign', name:'태양 폭군의 일식', family:'burst', color:'#ff9b52', durationMs:9000, cooldownMs:10000 },
  'phoenix-lord': { formId:'phoenix-lord', name:'불사조 재점화', family:'cycle', color:'#ff6559', durationMs:10000, cooldownMs:9000 },
  'volcanic-archon': { formId:'volcanic-archon', name:'화산권역 붕괴', family:'domain', color:'#f8bb50', durationMs:9500, cooldownMs:10500 },
  'absolute-empress': { formId:'absolute-empress', name:'절대영도 왕좌', family:'domain', color:'#8bdcff', durationMs:10000, cooldownMs:10000 },
  'winter-warden': { formId:'winter-warden', name:'빙결 서약', family:'fortress', color:'#b7e8ff', durationMs:11000, cooldownMs:9000 },
  'crystal-oracle': { formId:'crystal-oracle', name:'결정 공명 예언', family:'cycle', color:'#c9b5ff', durationMs:9000, cooldownMs:11000 },
  'thunder-tyrant': { formId:'thunder-tyrant', name:'천뢰 처형', family:'burst', color:'#ffe86f', durationMs:8000, cooldownMs:12000 },
  'tempest-runner': { formId:'tempest-runner', name:'폭풍 초월질주', family:'cycle', color:'#77f2ff', durationMs:9000, cooldownMs:9000 },
  'storm-oracle': { formId:'storm-oracle', name:'뇌운 회로 폭주', family:'domain', color:'#78a7ff', durationMs:10000, cooldownMs:10000 },
  'radiant-king': { formId:'radiant-king', name:'광휘 심판식', family:'burst', color:'#fff0a6', durationMs:9000, cooldownMs:11000 },
  'oath-guardian': { formId:'oath-guardian', name:'불멸 서약진', family:'fortress', color:'#9ff7c8', durationMs:11000, cooldownMs:8000 },
  'light-pilgrim': { formId:'light-pilgrim', name:'순례광역 성휘', family:'domain', color:'#f6d7ff', durationMs:10000, cooldownMs:10000 },
};

export const FINAL_FORM_SIGNATURE_IDS = new Set<HeroFinalFormId>(Object.keys(PROFILES) as HeroFinalFormId[]);

export function createDefaultFinalFormSignatureState(): FinalFormSignatureState {
  return { charge:0, activeUntilMs:0, cooldownUntilMs:0, activations:0, formId:null };
}

export function finalFormSignatureProfile(form: HeroFinalForm): FinalFormSignatureProfile {
  return PROFILES[form.id];
}

function eventCharge(event: GameplayEvent, family: BuildArchetype): number {
  if (event.type === 'spell_cast') return event.fusion ? (family === 'domain' ? 8 : 7) : (family === 'cycle' ? 5 : 4);
  if (event.type === 'enemy_killed') return event.elite ? 7 : 2;
  if (event.type === 'boss_defeated') return 28;
  if (event.type === 'hero_damaged') return family === 'fortress' ? 5 : 1;
  if (event.type === 'core_damaged') return family === 'fortress' ? 7 : 1;
  return 0;
}

export function advanceFinalFormSignature(
  state: FinalFormSignatureState,
  form: HeroFinalForm | null,
  events: readonly GameplayEvent[],
  elapsedMs: number,
): { state: FinalFormSignatureState; activated: boolean } {
  const now = Math.max(0, elapsedMs);
  if (!form) return { state:createDefaultFinalFormSignatureState(), activated:false };
  const profile = finalFormSignatureProfile(form);
  const changedForm = state.formId !== form.id;
  let charge = changedForm ? 0 : clamp(state.charge, 0, 100);
  const activeUntilMs = changedForm ? 0 : Math.max(0, state.activeUntilMs);
  const cooldownUntilMs = changedForm ? 0 : Math.max(0, state.cooldownUntilMs);
  const activations = Math.max(0, Math.floor(state.activations));

  for (const event of events) charge = clamp(charge + eventCharge(event, profile.family), 0, 100);
  const canActivate = charge >= 100 && now >= activeUntilMs && now >= cooldownUntilMs;
  if (canActivate) {
    return {
      state: {
        charge: Math.max(0, charge - 100),
        activeUntilMs: now + profile.durationMs,
        cooldownUntilMs: now + profile.durationMs + profile.cooldownMs,
        activations: activations + 1,
        formId: form.id,
      },
      activated:true,
    };
  }
  return { state:{ charge, activeUntilMs, cooldownUntilMs, activations, formId:form.id }, activated:false };
}

export function finalFormSignatureModifiers(
  state: FinalFormSignatureState,
  form: HeroFinalForm | null,
  elapsedMs: number,
): FinalFormSignatureModifiers {
  const active = Boolean(form && state.formId === form.id && state.activeUntilMs > Math.max(0, elapsedMs));
  const out: FinalFormSignatureModifiers = {
    active,
    spellPowerMultiplier:1,
    cooldownMultiplier:1,
    areaMultiplier:1,
    moveSpeedMultiplier:1,
    heroDamageTakenMultiplier:1,
    coreDamageTakenMultiplier:1,
    bossDamageMultiplier:1,
    fusionPowerMultiplier:1,
  };
  if (!active || !form) return out;
  const family = finalFormSignatureProfile(form).family;
  if (family === 'burst') {
    out.spellPowerMultiplier = 1.15;
    out.bossDamageMultiplier = 1.14;
    out.fusionPowerMultiplier = 1.08;
  } else if (family === 'cycle') {
    out.cooldownMultiplier = 0.81;
    out.moveSpeedMultiplier = 1.09;
    out.fusionPowerMultiplier = 1.08;
  } else if (family === 'domain') {
    out.areaMultiplier = 1.19;
    out.spellPowerMultiplier = 1.09;
    out.fusionPowerMultiplier = 1.12;
  } else {
    out.heroDamageTakenMultiplier = 0.76;
    out.coreDamageTakenMultiplier = 0.74;
    out.spellPowerMultiplier = 1.05;
  }
  return {
    active:true,
    spellPowerMultiplier:clamp(out.spellPowerMultiplier,1,1.16),
    cooldownMultiplier:clamp(out.cooldownMultiplier,.8,1),
    areaMultiplier:clamp(out.areaMultiplier,1,1.2),
    moveSpeedMultiplier:clamp(out.moveSpeedMultiplier,1,1.1),
    heroDamageTakenMultiplier:clamp(out.heroDamageTakenMultiplier,.74,1),
    coreDamageTakenMultiplier:clamp(out.coreDamageTakenMultiplier,.72,1),
    bossDamageMultiplier:clamp(out.bossDamageMultiplier,1,1.15),
    fusionPowerMultiplier:clamp(out.fusionPowerMultiplier,1,1.12),
  };
}

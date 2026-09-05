import type { BuildCapsulePayload } from './build-capsule.js';
import { sanitizeBuildCapsulePayload } from './build-capsule.js';
import { replayProgressPercent, type BuildReplayPlan } from './build-replay.js';
import type { SpellId } from '../game/spells.js';
import { finalFormIdentityIconStyle } from '../game/final-form-identity-assets.js';
import { battlefieldEnvironmentIconStyle } from '../game/battlefield-environment-assets.js';

export type ReplayGuidanceCategory = 'complete' | 'relic' | 'spell' | 'fusion' | 'ascension' | 'fate' | 'final-form' | 'archetype';

export interface ReplayGuidance {
  progress: number;
  category: ReplayGuidanceCategory;
  label: string;
}

interface Candidate {
  category: Exclude<ReplayGuidanceCategory, 'complete'>;
  score: number;
  order: number;
  label: string;
}

const SPELLS: readonly SpellId[] = ['fireBolt','chainLightning','frostNova','flameField','meteorStorm','blackHole'];
const SPELL_LABEL: Record<SpellId,string> = {
  fireBolt:'화염', chainLightning:'연쇄', frostNova:'서리', flameField:'장판', meteorStorm:'메테오', blackHole:'블랙홀',
};
const RELIC_LABEL: Record<string,string> = {
  'abyss-eye':'심연의 눈','chrono-shard':'시간 파편','guardian-heart':'수호자의 심장','ember-crown':'잿불 왕관','winter-heart':'겨울 심장','storm-core':'폭풍 핵','oath-seal':'서약 인장',
  'inferno-heart':'화염 심장','summoner-sigil':'소환 인장','juggernaut-core':'거신 핵','phoenix-brand':'불사조 문장','zero-crystal':'제로 결정','storm-crown':'폭풍 왕관','citadel-sigil':'성채 인장',
};
const FUSION_LABEL: Record<string,string> = {
  'solar-detonation':'태양 폭발','storm-crucible':'폭풍 도가니','frostfire-cataclysm':'빙염 대재앙','thunder-singularity':'뇌전 특이점','glacial-conduit':'빙하 도관','cataclysmic-domain':'파멸 영역',
};
const ASCENSION_LABEL: Record<string,string> = {
  'wildfire-doctrine':'들불 교리','ash-step':'잿빛 걸음','solar-collapse':'태양 붕괴','cinder-heart':'불씨 심장','eruption-chain':'분화 연쇄','phoenix-cycle':'불사조 순환',
  'absolute-zero':'절대 영도','frozen-time':'빙결 시간','crystal-echo':'수정 메아리','glacier-step':'빙하 걸음','whiteout':'화이트아웃','winter-covenant':'겨울 맹약',
  'storm-circuit':'폭풍 회로','thunder-step':'뇌전 걸음','overcharge':'과충전','sky-breaker':'천공 파쇄','static-shell':'정전기 갑주','tempest-loop':'폭풍 순환',
  'holy-bastion':'성스러운 성채','vow-of-light':'빛의 서약','judgment-bell':'심판의 종','pilgrim-step':'순례 걸음','radiant-wall':'광휘 장벽','last-oath':'최후의 서약',
};
const FATE_LABEL: Record<string,string> = { frenzy:'광란', golden:'황금', guardian:'수호' };
const FORM_LABEL: Record<string,string> = {
  'solar-sovereign':'태양 군주','phoenix-lord':'불사조 군주','volcanic-archon':'화산 집정관','absolute-empress':'절대 여제','winter-warden':'겨울 수호자','crystal-oracle':'수정 예언자',
  'thunder-tyrant':'뇌전 폭군','tempest-runner':'폭풍 질주자','storm-oracle':'폭풍 예언자','radiant-king':'광휘 왕','oath-guardian':'서약 수호자','light-pilgrim':'빛의 순례자',
};
const ARCHETYPE_LABEL: Record<string,string> = { burst:'폭발', cycle:'순환', domain:'영역', fortress:'수호' };

function short(value: string | null, labels: Record<string,string>, fallback: string): string {
  return value === null ? fallback : labels[value] ?? value.slice(0, 16);
}

function addListCandidates(
  out: Candidate[],
  target: readonly string[],
  current: readonly string[],
  totalScore: number,
  category: 'fusion'|'ascension'|'fate',
  labels: Record<string,string>,
  prefix: string,
  order: number,
): void {
  if (target.length === 0) return;
  const score = totalScore / target.length;
  for (const id of target) {
    if (current.includes(id)) continue;
    out.push({ category, score, order, label:`${prefix} · ${short(id,labels,id)}` });
  }
}

function spellCandidates(target: BuildCapsulePayload, current: BuildCapsulePayload): Candidate[] {
  const out: Candidate[] = [];
  for (let i=0;i<SPELLS.length;i+=1) {
    const id = SPELLS[i]!;
    const targetLevel = Math.max(1,target.spellLevels[id]);
    const currentLevel = Math.max(1,current.spellLevels[id]);
    if (currentLevel >= targetLevel) continue;
    const remaining = targetLevel <= 1 ? 0 : 1 - Math.max(0,Math.min(1,(currentLevel-1)/(targetLevel-1)));
    out.push({ category:'spell', score:(50/SPELLS.length)*remaining, order:10 + (10-targetLevel)*10 + i, label:`마법 · ${SPELL_LABEL[id]} Lv.${targetLevel}` });
  }
  return out;
}

export function replayGuidance(plan: BuildReplayPlan, currentRaw: unknown): ReplayGuidance {
  const current = sanitizeBuildCapsulePayload(currentRaw);
  const target = plan.target;
  const progress = replayProgressPercent(plan,current);
  if (progress >= 100) return { progress:100, category:'complete', label:'빌드 재현 완료' };

  const candidates: Candidate[] = [];
  if (target.relic !== current.relic) candidates.push({ category:'relic', score:10, order:0, label:`유물 · ${short(target.relic,RELIC_LABEL,'미장착')}` });
  candidates.push(...spellCandidates(target,current));
  addListCandidates(candidates,target.fusions,current.fusions,10,'fusion',FUSION_LABEL,'융합',30);
  addListCandidates(candidates,target.ascensions,current.ascensions,12,'ascension',ASCENSION_LABEL,'승천',40);
  addListCandidates(candidates,target.fateChoices,current.fateChoices,8,'fate',FATE_LABEL,'운명',50);
  if (target.finalForm !== current.finalForm) candidates.push({ category:'final-form', score:5, order:60, label:`최종형 · ${short(target.finalForm,FORM_LABEL,'미해금')}` });
  if (target.archetype !== current.archetype) candidates.push({ category:'archetype', score:5, order:70, label:`빌드 · ${ARCHETYPE_LABEL[target.archetype] ?? target.archetype}` });

  candidates.sort((a,b)=>b.score-a.score || a.order-b.order || a.label.localeCompare(b.label));
  const best = candidates[0];
  return best ? { progress, category:best.category, label:best.label.slice(0,36) } : { progress, category:'complete', label:'빌드 재현 완료' };
}

export function replayGuidanceFinalFormIconStyle(plan:BuildReplayPlan):string|null{return plan.target.finalForm?finalFormIdentityIconStyle(plan.target.finalForm):null;}

export function replayGuidanceMapIconStyle(plan:BuildReplayPlan):string{return battlefieldEnvironmentIconStyle(plan.target.mapId,0);}

import type { HeroId } from '../game/hero-profiles.js';
import type { RelicId } from '../game/relics.js';
import type { FusionId } from '../game/spell-fusions.js';
import { buildIdentityIconStyle } from '../game/build-identity-assets.js';
import type { HeroFinalFormId } from '../game/endless/final-form.js';
import { finalFormIdentityIconStyle } from '../game/final-form-identity-assets.js';
import { identityIconStyle, resultHeroIdentity, resultStatIdentity } from '../game/lobby-result-identity-assets.js';
import type { MapId } from '../game/map-layouts.js';
import type { MapEvolutionStage } from '../game/map-evolution.js';
import { battlefieldEnvironmentIconStyle } from '../game/battlefield-environment-assets.js';
export interface RunResult {
  heroId?: HeroId;
  survival: string;
  kills: number;
  level: number;
  gold: number;
  bosses: number;
  shardsEarned: number;
  shardsTotal: number;
  relic: string;
  relicId?: RelicId | null;
  fusionIds?: readonly FusionId[];
  finalFormId?: HeroFinalFormId | null;
  score?: number;
  newRecord?: boolean;
  threat?: string;
  map?: string;
  mapId?: MapId;
  mapEvolutionStage?: MapEvolutionStage;
  unlockedThreat?: number | null;
  tacticalRecap?: string[] | undefined;
  masteryLevel?: number;
  masteryXpEarned?: number;
  buildSummary?: string[];
  runCode?: string;
  buildCapsule?: string;
  comparisonLines?: string[];
}

export interface ResultsHandlers {
  onRetrySameHero: () => void;
  onLobby: () => void;
}

export class ResultsOverlay {
  private readonly root: HTMLDivElement;
  isOpen = false;
  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'modal-overlay results-overlay';
    this.root.hidden = true;
    parent.append(this.root);
  }

  open(result: RunResult, handlers: ResultsHandlers): void {
    this.isOpen = true;
    this.root.hidden = false;
    this.root.innerHTML = `
      <section class="modal-panel results-panel">
        <div class="eyebrow">RUN COMPLETE</div>
        <h2>수호선 붕괴</h2>
        ${result.heroId ? `<div class="result-hero-identity"><span style="${identityIconStyle(resultHeroIdentity(result.heroId))}" aria-hidden="true"></span></div>` : ''}
        ${result.newRecord ? '<div class="result-record">NEW RECORD</div>' : ''}
        <div class="result-main">${result.survival}</div>
        <div class="result-grid">
          <span><i class="result-stat-icon" style="${identityIconStyle(resultStatIdentity('kills'))}" aria-hidden="true"></i>처치 <b>${result.kills.toLocaleString()}</b></span>
          <span><i class="result-stat-icon" style="${identityIconStyle(resultStatIdentity('level'))}" aria-hidden="true"></i>도달 레벨 <b>LV.${result.level}</b></span>
          <span><i class="result-stat-icon" style="${identityIconStyle(resultStatIdentity('gold'))}" aria-hidden="true"></i>획득 금화 <b>${result.gold.toLocaleString()}</b></span>
          <span><i class="result-stat-icon" style="${identityIconStyle(resultStatIdentity('bosses'))}" aria-hidden="true"></i>보스 처치 <b>${result.bosses}</b></span>
          <span class="result-shards"><i class="result-stat-icon" style="${identityIconStyle(resultStatIdentity('shards'))}" aria-hidden="true"></i>이번 마력석 <b>◆ ${result.shardsEarned.toLocaleString()}</b></span>
          <span class="result-shards"><i class="result-stat-icon" style="${identityIconStyle(resultStatIdentity('shards'))}" aria-hidden="true"></i>보유 마력석 <b>◆ ${result.shardsTotal.toLocaleString()}</b></span>
          <span><i class="result-stat-icon" style="${identityIconStyle(resultStatIdentity('relic'))}" aria-hidden="true"></i>장착 유물 <b>${result.relic}</b></span>
          ${result.score !== undefined ? `<span>점수 <b>${result.score.toLocaleString()}</b></span>` : ''}
          ${result.threat ? `<span>위협 단계 <b>${result.threat}</b></span>` : ''}
          ${result.map ? `<span>${result.mapId?`<i class="battlefield-identity-icon" style="${battlefieldEnvironmentIconStyle(result.mapId,result.mapEvolutionStage ?? 0)}" aria-hidden="true"></i>`:''}전장 <b>${result.map}</b></span>` : ''}
          ${result.unlockedThreat !== undefined && result.unlockedThreat !== null ? `<span class="result-unlock">NEW THREAT <b>T${result.unlockedThreat}</b></span>` : ''}
          ${result.masteryLevel !== undefined ? `<span class="result-mastery"><i class="result-stat-icon" style="${identityIconStyle(resultStatIdentity('mastery'))}" aria-hidden="true"></i>영웅 숙련 <b>Mastery ${result.masteryLevel}</b></span>` : ''}
          ${result.masteryXpEarned !== undefined ? `<span class="result-mastery">숙련 XP <b>+${result.masteryXpEarned}</b></span>` : ''}
          ${result.runCode ? `<span class="result-run-code">RUN CODE <b>${result.runCode}</b></span>` : ''}
          ${result.buildCapsule ? `<span class="result-build-capsule">BUILD CAPSULE <b>${result.buildCapsule}</b></span>` : ''}
        </div>
        ${result.finalFormId ? `<div class="result-final-form-identity"><span class="final-form-identity-icon" style="${finalFormIdentityIconStyle(result.finalFormId)}" aria-hidden="true"></span><b>최종형</b></div>` : ''}
        ${(result.relicId || result.fusionIds?.length) ? `<div class="result-build-identities">${result.relicId ? `<span class="build-identity-icon" style="${buildIdentityIconStyle(result.relicId)}" title="유물" aria-hidden="true"></span>` : ''}${(result.fusionIds ?? []).map((id)=>`<span class="build-identity-icon" style="${buildIdentityIconStyle(id)}" title="융합" aria-hidden="true"></span>`).join('')}</div>` : ''}
        ${result.tacticalRecap?.length ? `<div class="result-recap">${result.tacticalRecap.map((line) => `<div>${line}</div>`).join('')}</div>` : ''}
        ${result.comparisonLines?.length ? `<div class="result-comparison">${result.comparisonLines.map((line) => `<div>${line}</div>`).join('')}</div>` : ''}
        ${result.buildSummary?.length ? `<div class="result-build-summary"><b>FINAL BUILD</b>${result.buildSummary.map((line) => `<span>${line}</span>`).join('')}</div>` : ''}
        <div class="results-actions">
          <button class="primary-btn result-retry">같은 조건으로 재도전</button>
          <button class="secondary-btn result-lobby">로비로 돌아가기</button>
        </div>
      </section>`;
    this.root.querySelector<HTMLButtonElement>('.result-retry')?.addEventListener('click', handlers.onRetrySameHero, { once: true });
    this.root.querySelector<HTMLButtonElement>('.result-lobby')?.addEventListener('click', handlers.onLobby, { once: true });
  }

  hide(): void { this.isOpen = false; this.root.hidden = true; this.root.replaceChildren(); }
}

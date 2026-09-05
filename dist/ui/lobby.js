import { metaUpgradeCost } from '../domain/meta-profile.js';
import { masteryXpNeeded } from '../domain/mastery-profile.js';
import { heroProfile } from '../game/hero-profiles.js';
import { threatLevelName } from '../domain/threat-level.js';
import { identityIconStyle, lobbyHeroIdentity, metaUpgradeIdentity } from '../game/lobby-result-identity-assets.js';
import { decodeBuildCapsule } from '../domain/build-capsule.js';
import { buildIdentityIconStyle } from '../game/build-identity-assets.js';
import { finalFormIdentityIconStyle } from '../game/final-form-identity-assets.js';
import { deriveHeroFinalForm } from '../game/endless/final-form.js';
import { restoreExtension } from '../game/endless/snapshot.js';
import { battlefieldEnvironmentIconStyle } from '../game/battlefield-environment-assets.js';
import { mapEvolutionStage } from '../game/map-evolution.js';
export function lobbyThreatChoices(profile) {
    return [0, 1, 2, 3, 4, 5].map((level) => ({ level, name: `T${level} · ${threatLevelName(level)}`, selected: profile.selected === level, locked: level > profile.unlocked }));
}
export function lobbyMasteryCards(profile) {
    return ['arkan', 'seria', 'kain', 'edric'].map((heroId) => {
        const state = profile.heroes[heroId];
        const xpNext = state.level >= 20 ? 0 : masteryXpNeeded(state.level);
        return {
            heroId,
            name: heroProfile(heroId).name,
            level: state.level,
            xp: state.xp,
            xpNext,
            progress: state.level >= 20 ? 1 : Math.max(0, Math.min(1, state.xp / Math.max(1, xpNext))),
            maxed: state.level >= 20,
        };
    });
}
const UPGRADE_COPY = [
    { id: 'vitality', name: '생명 각인', description: '시작 최대 HP +3% / 단계', accent: '#ff7a8a', maxLevel: 5 },
    { id: 'power', name: '마력 각인', description: '모든 마법 피해 +2% / 단계', accent: '#d99cff', maxLevel: 5 },
    { id: 'bankroll', name: '전투 자금', description: '시작 금화 +50G / 단계', accent: '#f0ce67', maxLevel: 5 },
    { id: 'magnet', name: '마력 자석', description: '경험치·금화 흡수범위 +8% / 단계', accent: '#68d7ff', maxLevel: 4 },
];
export function lobbyUpgradeCards(profile) {
    return UPGRADE_COPY.map((copy) => {
        const level = profile.upgrades[copy.id];
        const cost = metaUpgradeCost(copy.id, level);
        return {
            ...copy,
            level,
            cost,
            canBuy: cost !== null && profile.shards >= cost,
        };
    });
}
export class LobbyOverlay {
    root;
    handlers = null;
    threatProfile = null;
    masteryProfile = null;
    resumeSnapshot = null;
    recentRuns = [];
    isOpen = false;
    constructor(parent) {
        this.root = document.createElement('div');
        this.root.className = 'modal-overlay lobby-overlay';
        this.root.hidden = true;
        parent.append(this.root);
    }
    open(profile, handlers, threatProfile, masteryProfile, resumeSnapshot, recentRuns = []) {
        this.handlers = handlers;
        this.threatProfile = threatProfile ?? null;
        this.masteryProfile = masteryProfile ?? null;
        this.resumeSnapshot = resumeSnapshot ?? null;
        this.recentRuns = recentRuns.slice(0, 5);
        this.isOpen = true;
        this.root.hidden = false;
        this.render(profile);
    }
    refresh(profile) {
        if (!this.isOpen)
            return;
        this.render(profile);
    }
    hide() {
        this.isOpen = false;
        this.handlers = null;
        this.threatProfile = null;
        this.masteryProfile = null;
        this.resumeSnapshot = null;
        this.recentRuns = [];
        this.root.hidden = true;
        this.root.replaceChildren();
    }
    render(profile) {
        this.root.replaceChildren();
        const panel = document.createElement('section');
        panel.className = 'modal-panel lobby-panel';
        panel.innerHTML = `
      <div class="lobby-heading">
        <div><div class="eyebrow">ARCANE SANCTUM</div><h1>마력 성소</h1><p class="modal-subtitle">마력석은 작게 강해지고, 다음 판의 선택지를 넓히는 데만 사용합니다</p></div>
        <div class="shard-wallet"><span>보유 마력석</span><strong>◆ ${profile.shards.toLocaleString()}</strong></div>
      </div>`;
        const grid = document.createElement('div');
        grid.className = 'lobby-grid';
        for (const card of lobbyUpgradeCards(profile)) {
            const button = document.createElement('button');
            button.className = 'lobby-upgrade-card';
            button.style.setProperty('--accent', card.accent);
            button.disabled = !card.canBuy;
            const levelPips = `${'●'.repeat(card.level)}${'○'.repeat(card.maxLevel - card.level)}`;
            const priceText = card.cost === null ? '최대 단계' : `◆ ${card.cost}`;
            const upgradeIcon = metaUpgradeIdentity(card.id);
            button.innerHTML = `
        <span class="lobby-upgrade-icon" style="${identityIconStyle(upgradeIcon)}" aria-hidden="true"></span>
        <span class="lobby-upgrade-name">${card.name}</span>
        <strong>Lv.${card.level}/${card.maxLevel}</strong>
        <span class="lobby-upgrade-pips">${levelPips}</span>
        <span class="lobby-upgrade-desc">${card.description}</span>
        <b class="lobby-upgrade-price">${priceText}</b>`;
            button.addEventListener('click', () => {
                if (!this.handlers)
                    return;
                const next = this.handlers.onPurchase(card.id);
                this.render(next);
            });
            grid.append(button);
        }
        panel.append(grid);
        if (this.masteryProfile) {
            const masteryWrap = document.createElement('div');
            masteryWrap.className = 'lobby-mastery-wrap';
            masteryWrap.innerHTML = `<div class="lobby-threat-title">영웅 숙련도 · Mastery Lv.1~20</div>`;
            const row = document.createElement('div');
            row.className = 'lobby-mastery-row';
            for (const card of lobbyMasteryCards(this.masteryProfile)) {
                const hero = document.createElement('div');
                hero.className = 'lobby-mastery-card';
                const portrait = lobbyHeroIdentity(card.heroId);
                hero.innerHTML = `<span class="lobby-mastery-portrait" style="${identityIconStyle(portrait)}" aria-hidden="true"></span><b>${card.name}</b><span>M${card.level}${card.maxed ? ' · MAX' : ` · ${card.xp}/${card.xpNext}`}</span><i style="--progress:${Math.round(card.progress * 100)}%"></i>`;
                row.append(hero);
            }
            masteryWrap.append(row);
            panel.append(masteryWrap);
        }
        if (this.threatProfile) {
            const threatWrap = document.createElement('div');
            threatWrap.className = 'lobby-threat-wrap';
            const title = document.createElement('div');
            title.className = 'lobby-threat-title';
            title.textContent = `위협 단계 · 해금 T${this.threatProfile.unlocked}`;
            threatWrap.append(title);
            const row = document.createElement('div');
            row.className = 'lobby-threat-row';
            for (const choice of lobbyThreatChoices(this.threatProfile)) {
                const button = document.createElement('button');
                button.className = `lobby-threat-btn${choice.selected ? ' selected' : ''}`;
                button.disabled = choice.locked;
                button.textContent = choice.locked ? `🔒 T${choice.level}` : choice.name;
                button.addEventListener('click', () => {
                    if (!this.handlers?.onThreatChange)
                        return;
                    this.threatProfile = this.handlers.onThreatChange(choice.level);
                    this.render(profile);
                });
                row.append(button);
            }
            threatWrap.append(row);
            panel.append(threatWrap);
        }
        if (this.recentRuns.length > 0) {
            const history = document.createElement('div');
            history.className = 'lobby-recent-runs';
            const newest = this.recentRuns[0];
            const hero = heroProfile(newest.heroId).name;
            const mins = Math.floor(newest.seconds / 60);
            const recentPortrait = lobbyHeroIdentity(newest.heroId);
            const recentBuild = newest.buildCapsule ? decodeBuildCapsule(newest.buildCapsule) : null;
            const recentBuildIcons = recentBuild ? [...(recentBuild.relic ? [recentBuild.relic] : []), ...recentBuild.fusions].slice(0, 3) : [];
            const recentFinalForm = newest.finalForm ?? recentBuild?.finalForm ?? null;
            const recentMapIcon = newest.mapId ? `<i class="battlefield-identity-icon lobby-battlefield-icon" style="${battlefieldEnvironmentIconStyle(newest.mapId, mapEvolutionStage(newest.seconds))}" aria-hidden="true"></i>` : '';
            history.innerHTML = `${recentMapIcon}${recentFinalForm ? `<i class="final-form-identity-icon lobby-final-form-icon" style="${finalFormIdentityIconStyle(recentFinalForm)}" aria-hidden="true"></i>` : ''}<span class="lobby-recent-portrait" style="${identityIconStyle(recentPortrait)}" aria-hidden="true"></span><span>최근 기록</span><b>${hero} · T${newest.threat} · ${mins}분 · ${newest.runCode}</b>${recentBuildIcons.length ? `<span class="lobby-build-identities">${recentBuildIcons.map((id) => `<i class="build-identity-icon" style="${buildIdentityIconStyle(id)}" aria-hidden="true"></i>`).join('')}</span>` : ''}<small>${newest.buildCapsule ? `BUILD ${newest.buildCapsule}` : `최근 ${this.recentRuns.length}런 저장`}</small>`;
            panel.append(history);
        }
        if (this.resumeSnapshot && this.handlers?.onResume) {
            const resume = document.createElement('button');
            resume.className = 'primary-btn lobby-resume';
            const hero = heroProfile(this.resumeSnapshot.heroId).name;
            const mins = Math.floor(this.resumeSnapshot.elapsed / 60);
            const secs = Math.floor(this.resumeSnapshot.elapsed % 60).toString().padStart(2, '0');
            const resumePortrait = lobbyHeroIdentity(this.resumeSnapshot.heroId);
            const resumeBuildIds = [...(this.resumeSnapshot.relic ? [this.resumeSnapshot.relic] : []), ...this.resumeSnapshot.fusions].slice(0, 3);
            const resumeExtension = this.resumeSnapshot.endless ? restoreExtension(this.resumeSnapshot.endless) : null;
            const resumeFinalForm = resumeExtension ? deriveHeroFinalForm(this.resumeSnapshot.heroId, resumeExtension.heroAscension.selected, this.resumeSnapshot.elapsed * 1000) : null;
            const resumeMapIcon = `<i class="battlefield-identity-icon lobby-battlefield-icon" style="${battlefieldEnvironmentIconStyle(this.resumeSnapshot.map.id, this.resumeSnapshot.map.evolutionStage)}" aria-hidden="true"></i>`;
            resume.innerHTML = `${resumeMapIcon}${resumeFinalForm ? `<i class="final-form-identity-icon lobby-final-form-icon" style="${finalFormIdentityIconStyle(resumeFinalForm.id)}" aria-hidden="true"></i>` : ''}<span class="lobby-resume-portrait" style="${identityIconStyle(resumePortrait)}" aria-hidden="true"></span><span>이어하기 · ${hero} · ${mins}:${secs}</span>${resumeBuildIds.length ? `<span class="lobby-build-identities">${resumeBuildIds.map((id) => `<i class="build-identity-icon" style="${buildIdentityIconStyle(id)}" aria-hidden="true"></i>`).join('')}</span>` : ''}`;
            resume.addEventListener('click', () => this.handlers?.onResume?.());
            panel.append(resume);
        }
        const footer = document.createElement('div');
        footer.className = 'lobby-footer';
        footer.innerHTML = `<span>영구 강화는 모든 영웅에게 적용됩니다</span>`;
        const start = document.createElement('button');
        start.className = 'primary-btn lobby-start';
        start.textContent = '전투 준비';
        start.addEventListener('click', () => this.handlers?.onContinue());
        footer.append(start);
        panel.append(footer);
        this.root.append(panel);
    }
}

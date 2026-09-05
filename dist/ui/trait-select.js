import { MASTERY_RUN_TRAITS, RUN_TRAITS } from '../game/run-traits.js';
import { masteryTraitId } from '../game/mastery-unlocks.js';
import { heroProfile } from '../game/hero-profiles.js';
import { decisionPathIconStyle } from '../game/decision-path-icon-assets.js';
export function traitChoiceCards(heroId, masteryLevel = 1) {
    if (!heroId || masteryLevel < 6)
        return RUN_TRAITS;
    const masteryId = masteryTraitId(heroId);
    const extra = MASTERY_RUN_TRAITS.find((trait) => trait.id === masteryId);
    return extra ? [...RUN_TRAITS, extra] : RUN_TRAITS;
}
export class TraitSelectOverlay {
    root;
    isOpen = false;
    constructor(parent) {
        this.root = document.createElement('div');
        this.root.className = 'modal-overlay trait-select-overlay';
        this.root.hidden = true;
        parent.append(this.root);
    }
    open(heroId, onSelect, masteryLevel = 1) {
        this.isOpen = true;
        this.root.hidden = false;
        this.root.replaceChildren();
        const hero = heroProfile(heroId);
        const panel = document.createElement('section');
        panel.className = 'modal-panel trait-panel';
        panel.innerHTML = `
      <div class="eyebrow">RUN TRAIT</div>
      <h2>${hero.name}의 전투 성향</h2>
      <p class="modal-subtitle">이번 판에만 적용 · 하나를 고르면 바로 전투가 시작됩니다</p>`;
        const grid = document.createElement('div');
        grid.className = 'trait-grid';
        for (const trait of traitChoiceCards(heroId, masteryLevel)) {
            const button = document.createElement('button');
            button.className = 'trait-card';
            button.style.setProperty('--accent', trait.accent);
            button.innerHTML = `
        <span class="trait-mark decision-path-icon" style="${decisionPathIconStyle(trait.id)}"></span>
        <strong>${trait.name}</strong>
        <span>${trait.description}</span>`;
            button.addEventListener('click', () => {
                this.hide();
                onSelect(trait.id);
            }, { once: true });
            grid.append(button);
        }
        panel.append(grid);
        this.root.append(panel);
    }
    hide() {
        this.isOpen = false;
        this.root.hidden = true;
        this.root.replaceChildren();
    }
}

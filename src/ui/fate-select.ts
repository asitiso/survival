import { allFatePaths, type FatePathId } from '../game/fate-paths.js';
import { decisionPathIconStyle } from '../game/decision-path-icon-assets.js';
import { fateChoiceImpact } from '../game/fate-tradeoff-identity.js';
import { fateBenefitVectorStyle } from '../game/fate-benefit-vector-identity-assets.js';
import { fateCostVectorStyle } from '../game/fate-cost-vector-identity-assets.js';

export class FateSelectOverlay {
  private readonly root: HTMLDivElement;
  isOpen = false;

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'modal-overlay fate-select-overlay';
    this.root.hidden = true;
    parent.append(this.root);
  }

  open(checkpoint: number, currentChoices: readonly FatePathId[], onSelect: (id: FatePathId) => void): void {
    this.isOpen = true;
    this.root.hidden = false;
    this.root.replaceChildren();
    const panel = document.createElement('section');
    panel.className = 'modal-panel trait-panel';
    panel.innerHTML = `<div class="eyebrow">FATE PATH ${checkpoint + 1}/3</div><h2>이번 런의 운명을 고르세요</h2><p class="modal-subtitle">선택은 누적되며 18분까지 총 세 번만 등장합니다</p>`;
    const grid = document.createElement('div');
    grid.className = 'trait-grid';
    for (const path of allFatePaths()) {
      const button = document.createElement('button');
      button.className = 'trait-card';
      button.style.setProperty('--accent', path.accent);
      const impact=fateChoiceImpact(currentChoices,path.id);
      button.innerHTML = `<span class="trait-mark decision-path-icon" style="${decisionPathIconStyle(path.id)}"></span><strong>${path.name}</strong><span>${path.description}</span><span class="fate-tradeoff-identities"><i class="fate-vector-icon fate-benefit-vector-icon" style="${fateBenefitVectorStyle(impact.benefitId)}" title="${impact.benefitId}"></i><i class="fate-vector-icon fate-cost-vector-icon" style="${fateCostVectorStyle(impact.costId)}" title="${impact.costId}"></i></span>`;
      button.addEventListener('click', () => { if (!this.isOpen) return; onSelect(path.id); });
      grid.append(button);
    }
    panel.append(grid);
    this.root.append(panel);
  }

  hide(): void {
    this.isOpen = false;
    this.root.hidden = true;
    this.root.replaceChildren();
  }
}

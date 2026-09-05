import type { HeroId, HeroProfile } from '../game/hero-profiles.js';
import { heroPortraitPresentation } from '../game/hero-portrait-assets.js';

export class HeroSelectOverlay {
  private readonly root: HTMLDivElement;
  isOpen = false;

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'modal-overlay hero-select-overlay';
    this.root.hidden = true;
    parent.append(this.root);
  }

  open(profiles: readonly HeroProfile[], onSelect: (id: HeroId) => void): void {
    this.isOpen = true;
    this.root.hidden = false;
    this.root.replaceChildren();
    const panel = document.createElement('section');
    panel.className = 'modal-panel hero-select-panel';
    panel.innerHTML = `<div class="eyebrow">CHOOSE YOUR HERO</div><h1>수호자를 선택하세요</h1><p class="modal-subtitle">영웅마다 생존 방식과 마법 운용 감각이 다릅니다</p>`;
    const grid = document.createElement('div');
    grid.className = 'hero-grid';
    for (const profile of profiles) {
      const button = document.createElement('button');
      button.className = 'hero-card';
      button.style.setProperty('--hero', profile.color);
      const portrait = heroPortraitPresentation(profile.id, true);
      button.style.setProperty('--hero-portrait-x', portrait.backgroundX);
      button.style.setProperty('--hero-portrait-y', portrait.backgroundY);
      button.innerHTML = `
        <span class="hero-orb hero-portrait" aria-hidden="true"></span>
        <span class="hero-title">${profile.title}</span>
        <strong>${profile.name}</strong>
        <span class="hero-passive">${profile.passive}</span>
        <span class="hero-desc">${profile.description}</span>
        <span class="hero-stats">HP ${profile.baseHp} · 이동 ${profile.baseSpeed} · 영창 ${Math.round(profile.cooldownMultiplier * 100)}%</span>`;
      button.addEventListener('click', () => { this.hide(); onSelect(profile.id); }, { once: true });
      grid.append(button);
    }
    panel.append(grid);
    this.root.append(panel);
  }

  hide(): void { this.isOpen = false; this.root.hidden = true; this.root.replaceChildren(); }
}

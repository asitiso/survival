import { growthChoiceIconStyle } from '../game/growth-choice-icon-assets.js';
export interface ChoiceCard {
  title: string;
  description: string;
  accent: string;
  badge?: string;
  hint?: string;
  best?: boolean;
  id?: string;
  kind?: string;
  identityIconStyle?: string;
  evolutionCrestStyle?: string | undefined;
  impactRoleStyle?: string;
  impactRoleLabel?: string;
  secondaryIdentityStyles?: readonly string[];
  secondaryIdentityLimit?: number;
}

export class LevelUpOverlay {
  private readonly root: HTMLDivElement;
  private readonly cards: HTMLDivElement;
  isOpen = false;

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'modal-overlay levelup-overlay';
    this.root.hidden = true;
    this.root.innerHTML = `
      <section class="modal-panel levelup-panel" role="dialog" aria-modal="true" aria-labelledby="growth-choice-title">
        <div class="levelup-celebration" aria-hidden="true"><span>✦</span><div class="levelup-starlight"></div></div>
        <div class="eyebrow">LEVEL UP</div>
        <h2 id="growth-choice-title">더 강해질 시간!</h2>
        <p class="modal-subtitle">세 가지 중 하나만 강화됩니다</p>
        <div class="levelup-bonus" hidden></div>
        <div class="upgrade-cards"></div>
      </section>`;
    const cards = this.root.querySelector<HTMLDivElement>('.upgrade-cards');
    if (!cards) throw new Error('upgrade cards root missing');
    this.cards = cards;
    parent.append(this.root);
  }

  open<T extends ChoiceCard>(choices: T[], onPick: (choice: T) => void, copy?: { eyebrow: string; title: string; subtitle: string; celebration?: boolean; bonus?: string; reducedMotion?: boolean }): void {
    const celebrating = copy?.celebration ?? !copy;
    this.root.classList.toggle('levelup-celebrating', celebrating);
    this.root.classList.toggle('levelup-reduced-motion', copy?.reducedMotion ?? false);
    const bonus = this.root.querySelector<HTMLElement>('.levelup-bonus');
    if (bonus) { bonus.textContent = copy?.bonus ?? ''; bonus.hidden = !celebrating || !copy?.bonus; }
    const starlight = this.root.querySelector<HTMLElement>('.levelup-starlight');
    if (starlight) {
      starlight.replaceChildren();
      if (celebrating && !copy?.reducedMotion) for (let i = 0; i < 12; i++) {
        const star = document.createElement('i');
        const angle = Math.PI * 2 * i / 12;
        star.textContent = i % 3 === 0 ? '✦' : '•';
        star.style.setProperty('--dx', `${Math.cos(angle) * (65 + i % 3 * 18)}px`);
        star.style.setProperty('--dy', `${Math.sin(angle) * (65 + i % 3 * 18)}px`);
        starlight.append(star);
      }
    }
    const eyebrow = this.root.querySelector<HTMLElement>('.eyebrow');
    const title = this.root.querySelector<HTMLElement>('h2');
    const subtitle = this.root.querySelector<HTMLElement>('.modal-subtitle');
    if (eyebrow) eyebrow.textContent = copy?.eyebrow ?? 'LEVEL UP';
    if (title) title.textContent = copy?.title ?? '더 강해질 시간!';
    if (subtitle) subtitle.textContent = copy?.subtitle ?? '원하는 힘을 하나 고르세요 · 선택 즉시 전투 재개';
    this.isOpen = true;
    this.root.hidden = false;
    this.cards.replaceChildren();
    for (const choice of choices) {
      const button = document.createElement('button');
      button.className = `upgrade-card${choice.best ? ' upgrade-card-best' : ''}`;
      button.style.setProperty('--accent', choice.accent);
      const iconStyle = choice.identityIconStyle ?? growthChoiceIconStyle(String(choice.id ?? ''), choice.kind);
      const secondaryIdentityLimit=choice.secondaryIdentityLimit??3;
      const secondaryIdentityStyles=choice.secondaryIdentityStyles??[];
      const visibleSecondaryIdentityStyles=choice.secondaryIdentityLimit===undefined?secondaryIdentityStyles.slice(0,3):secondaryIdentityStyles.slice(0,secondaryIdentityLimit);
      const secondaryIdentityMarkup=visibleSecondaryIdentityStyles.length?`<span class="upgrade-secondary-identities" aria-hidden="true">${visibleSecondaryIdentityStyles.map(style=>`<i class="upgrade-secondary-identity" style="${style}"></i>`).join('')}</span>`:'';
      const impactRoleMarkup=choice.impactRoleStyle?`<i class="upgrade-impact-role" style="${choice.impactRoleStyle}" role="img" aria-label="${choice.impactRoleLabel??'보상 역할'}"></i>`:'';
      const badgeMarkup=choice.badge?`<span class="upgrade-badge">${choice.best ? '추천 · ' : ''}${choice.badge}</span>`:'';
      const roleBadgeMarkup=impactRoleMarkup||badgeMarkup?`<span class="upgrade-role-badge-row">${impactRoleMarkup}${badgeMarkup}</span>`:'';
      button.innerHTML = `<span class="upgrade-icon growth-choice-icon" style="${iconStyle}">${choice.evolutionCrestStyle ? `<i class="spell-evolution-crest-preview" style="${choice.evolutionCrestStyle}" aria-hidden="true"></i>` : ''}</span>${secondaryIdentityMarkup}${roleBadgeMarkup}<strong>${choice.title}</strong><span>${choice.description}</span>${choice.hint ? `<small class="upgrade-hint">${choice.hint}</small>` : ''}`;
      button.addEventListener('click', () => {
        if (!this.isOpen) return;
        onPick(choice);
      });
      this.cards.append(button);
    }
  }

  close(): void {
    this.isOpen = false;
    this.root.hidden = true;
  }
}

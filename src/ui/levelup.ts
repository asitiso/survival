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
      <section class="modal-panel levelup-panel" aria-label="레벨업 선택">
        <div class="eyebrow">LEVEL UP</div>
        <h2>마력을 선택하세요</h2>
        <p class="modal-subtitle">세 가지 중 하나만 강화됩니다</p>
        <div class="upgrade-cards"></div>
      </section>`;
    const cards = this.root.querySelector<HTMLDivElement>('.upgrade-cards');
    if (!cards) throw new Error('upgrade cards root missing');
    this.cards = cards;
    parent.append(this.root);
  }

  open<T extends ChoiceCard>(choices: T[], onPick: (choice: T) => void, copy?: { eyebrow: string; title: string; subtitle: string }): void {
    const eyebrow = this.root.querySelector<HTMLElement>('.eyebrow');
    const title = this.root.querySelector<HTMLElement>('h2');
    const subtitle = this.root.querySelector<HTMLElement>('.modal-subtitle');
    if (eyebrow) eyebrow.textContent = copy?.eyebrow ?? 'LEVEL UP';
    if (title) title.textContent = copy?.title ?? '마력을 선택하세요';
    if (subtitle) subtitle.textContent = copy?.subtitle ?? '세 가지 중 하나만 강화됩니다';
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

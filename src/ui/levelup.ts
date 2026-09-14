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

  private playCelebrationImpact(reducedMotion: boolean): void {
    if (reducedMotion) return;

    const flash = document.createElement('div');
    flash.setAttribute('aria-hidden', 'true');
    Object.assign(flash.style, {
      position: 'absolute',
      inset: '0',
      zIndex: '30',
      pointerEvents: 'none',
      opacity: '0',
      background: 'radial-gradient(circle at 50% 42%, rgba(255,238,166,.48) 0%, rgba(255,204,89,.2) 22%, rgba(255,204,89,0) 60%)',
    });
    this.root.append(flash);
    const flashAnimation = flash.animate(
      [
        { opacity: 0 },
        { opacity: 0.78, offset: 0.16 },
        { opacity: 0.18, offset: 0.5 },
        { opacity: 0 },
      ],
      { duration: 680, easing: 'ease-out' },
    );
    flashAnimation.onfinish = () => flash.remove();

    const panel = this.root.querySelector<HTMLElement>('.levelup-panel');
    panel?.animate(
      [
        { filter: 'brightness(1.28) saturate(1.16)' },
        { filter: 'brightness(1.08) saturate(1.08)', offset: 0.42 },
        { filter: 'brightness(1) saturate(1)' },
      ],
      { duration: 620, easing: 'cubic-bezier(.16,1,.3,1)' },
    );

    const title = this.root.querySelector<HTMLElement>('h2');
    title?.animate(
      [
        { transform: 'scale(.92)', letterSpacing: '-.02em', filter: 'brightness(1.6)' },
        { transform: 'scale(1.07)', letterSpacing: '.015em', filter: 'brightness(1.2)', offset: 0.48 },
        { transform: 'scale(1)', letterSpacing: '0', filter: 'brightness(1)' },
      ],
      { duration: 560, easing: 'cubic-bezier(.16,1,.3,1)' },
    );
  }

  open<T extends ChoiceCard>(choices: T[], onPick: (choice: T) => void, copy?: { eyebrow: string; title: string; subtitle: string; celebration?: boolean; bonus?: string; reducedMotion?: boolean }): void {
    const celebrating = copy?.celebration ?? !copy;
    const reducedMotion = copy?.reducedMotion ?? false;
    this.root.classList.toggle('levelup-celebrating', celebrating);
    this.root.classList.toggle('levelup-reduced-motion', reducedMotion);
    const bonus = this.root.querySelector<HTMLElement>('.levelup-bonus');
    if (bonus) { bonus.textContent = copy?.bonus ?? ''; bonus.hidden = !celebrating || !copy?.bonus; }
    const starlight = this.root.querySelector<HTMLElement>('.levelup-starlight');
    if (starlight) {
      starlight.replaceChildren();
      if (celebrating && !reducedMotion) {
        for (let i = 0; i < 20; i++) {
          const star = document.createElement('i');
          const angle = Math.PI * 2 * i / 20;
          const distance = 68 + (i % 5) * 13 + (i >= 10 ? 18 : 0);
          star.textContent = i % 5 === 0 ? '✦' : i % 2 === 0 ? '✧' : '•';
          star.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
          star.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
          star.style.animationDelay = `${(i % 5) * 16}ms`;
          starlight.append(star);
        }
        for (let i = 0; i < 2; i++) {
          const ring = document.createElement('b');
          Object.assign(ring.style, {
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            border: i === 0 ? '2px solid rgba(255,231,157,.88)' : '1px solid rgba(255,205,95,.72)',
            boxShadow: '0 0 18px rgba(255,215,113,.32)',
            pointerEvents: 'none',
          });
          starlight.append(ring);
          ring.animate(
            [
              { opacity: 0.9, transform: 'translate(-50%,-50%) scale(.55)' },
              { opacity: 0.42, offset: 0.48 },
              { opacity: 0, transform: `translate(-50%,-50%) scale(${i === 0 ? 2.7 : 3.5})` },
            ],
            { duration: 760, delay: 70 + i * 90, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' },
          );
        }
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
    const prefersReducedMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (celebrating) this.playCelebrationImpact(reducedMotion || prefersReducedMotion);
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

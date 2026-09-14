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

export interface LevelUpCelebrationPlan {
  sparkCount: number;
  ringCount: number;
  flash: boolean;
  durationMs: number;
}

export function levelUpCelebrationPlan(reducedMotion: boolean): LevelUpCelebrationPlan {
  if (reducedMotion) return { sparkCount: 0, ringCount: 0, flash: false, durationMs: 0 };
  return { sparkCount: 24, ringCount: 2, flash: true, durationMs: 720 };
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

  private playCelebrationEffects(reducedMotion: boolean): void {
    this.root.querySelectorAll<HTMLElement>('[data-levelup-burst]').forEach((node) => node.remove());
    const plan = levelUpCelebrationPlan(reducedMotion);
    if (!plan.flash) return;

    const layer = document.createElement('div');
    layer.dataset.levelupBurst = 'true';
    Object.assign(layer.style, {
      position: 'absolute',
      inset: '0',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: '0',
    });
    this.root.prepend(layer);

    const flash = document.createElement('div');
    Object.assign(flash.style, {
      position: 'absolute',
      inset: '0',
      background: 'radial-gradient(circle at 50% 42%, rgba(255,238,157,.32) 0%, rgba(151,235,200,.13) 24%, rgba(255,255,255,0) 58%)',
      opacity: '0',
    });
    layer.append(flash);
    flash.animate([
      { opacity: 0 },
      { offset: 0.18, opacity: 1 },
      { opacity: 0 },
    ], { duration: Math.round(plan.durationMs * 0.72), easing: 'ease-out', fill: 'forwards' });

    for (let i = 0; i < plan.ringCount; i++) {
      const ring = document.createElement('i');
      Object.assign(ring.style, {
        position: 'absolute',
        left: '50%',
        top: '42%',
        width: '92px',
        height: '92px',
        borderRadius: '50%',
        border: `${3 - i}px solid ${i === 0 ? 'rgba(255,229,154,.90)' : 'rgba(151,235,200,.78)'}`,
        boxShadow: `0 0 ${18 + i * 8}px ${i === 0 ? 'rgba(255,229,154,.42)' : 'rgba(151,235,200,.30)'}`,
        opacity: '0',
      });
      layer.append(ring);
      ring.animate([
        { transform: 'translate(-50%, -50%) scale(.45)', opacity: 0 },
        { offset: 0.16, opacity: 0.95 - i * 0.14 },
        { transform: `translate(-50%, -50%) scale(${2.25 + i * 0.7})`, opacity: 0 },
      ], { duration: plan.durationMs - i * 45, delay: i * 70, easing: 'cubic-bezier(.16,.78,.24,1)', fill: 'forwards' });
    }

    for (let i = 0; i < plan.sparkCount; i++) {
      const spark = document.createElement('i');
      const angle = Math.PI * 2 * i / plan.sparkCount;
      const travel = 92 + (i % 4) * 24;
      const dx = Math.cos(angle) * travel;
      const dy = Math.sin(angle) * travel * 0.72;
      const size = 3 + (i % 3) * 1.5;
      Object.assign(spark.style, {
        position: 'absolute',
        left: '50%',
        top: '42%',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: i % 2 === 0 ? '#ffe59a' : '#97ebc8',
        boxShadow: `0 0 ${8 + (i % 3) * 3}px currentColor`,
        opacity: '0',
      });
      layer.append(spark);
      spark.animate([
        { transform: 'translate(-50%, -50%) translate(0, 0) scale(.35)', opacity: 0 },
        { offset: 0.14, opacity: 0.95 },
        { transform: `translate(-50%, -50%) translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(.12)`, opacity: 0 },
      ], { duration: plan.durationMs - 70 + (i % 3) * 35, delay: (i % 4) * 18, easing: 'cubic-bezier(.16,.70,.28,1)', fill: 'forwards' });
    }

    const title = this.root.querySelector<HTMLElement>('#growth-choice-title');
    title?.animate([
      { transform: 'scale(.88)', opacity: 0.35 },
      { offset: 0.48, transform: 'scale(1.075)', opacity: 1 },
      { transform: 'scale(1)', opacity: 1 },
    ], { duration: Math.round(plan.durationMs * 0.78), easing: 'cubic-bezier(.18,.76,.24,1)' });

    window.setTimeout(() => layer.remove(), plan.durationMs + 120);
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
    if (celebrating) this.playCelebrationEffects(copy?.reducedMotion ?? false);
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
    this.root.querySelectorAll<HTMLElement>('[data-levelup-burst]').forEach((node) => node.remove());
  }
}

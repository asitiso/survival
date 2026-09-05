import type { EquipmentState } from '../domain/types.js';
import type { ShopDisplayOffer } from '../game/shop-data.js';
import type { ShopOfferGuidance } from '../game/shop-guidance.js';
import type { OpeningShopFastPathProfile } from '../game/opening-shop-fast-path.js';
import { shopItemIconBackgroundPosition, shopItemIconPresentation } from '../game/shop-item-assets.js';
import { projectShopPurchase } from '../game/shop-purchase-projection.js';
import { shopPurchaseActionIdentityStyle } from '../game/shop-purchase-action-identity-assets.js';

export interface ShopViewModel {
  state: EquipmentState;
  offers: ShopDisplayOffer[];
  rerollPrice: number;
  guidance?: ShopOfferGuidance[];
  impactMessage?: string;
  quickOffer?: ShopDisplayOffer | null;
  fastPath?: OpeningShopFastPathProfile;
}

export interface ShopHandlers {
  onPurchase: (offer: ShopDisplayOffer) => void;
  onQuickPurchase: (offer: ShopDisplayOffer) => void;
  onReroll: () => void;
  onClose: () => void;
}

export class ShopOverlay {
  private readonly root: HTMLDivElement;
  private handlers: ShopHandlers | null = null;
  isOpen = false;

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'modal-overlay shop-overlay';
    this.root.hidden = true;
    parent.append(this.root);
  }

  open(model: ShopViewModel, handlers: ShopHandlers): void {
    this.isOpen = true;
    this.handlers = handlers;
    this.root.hidden = false;
    this.render(model);
  }

  refresh(model: ShopViewModel): void {
    if (!this.isOpen) return;
    this.render(model);
  }

  hide(): void {
    this.isOpen = false;
    this.handlers = null;
    this.root.hidden = true;
    this.root.replaceChildren();
  }

  private render(model: ShopViewModel): void {
    this.root.replaceChildren();
    const panel = document.createElement('section');
    panel.className = 'modal-panel shop-panel';
    const header = document.createElement('div');
    header.className = 'shop-header';
    header.innerHTML = `
      <div><div class="eyebrow">ARCANE SUPPLY</div><h2>전투 상점</h2></div>
      <div class="shop-wallet"><span>보유 금화</span><strong>🪙 ${model.state.coins.toLocaleString()}</strong></div>`;
    panel.append(header);

    const equipped = document.createElement('div');
    equipped.className = 'equipped-row';
    equipped.innerHTML = `
      <span>무기 <b>${model.state.weapon ? `${model.state.weapon.legendary ? '전설 · ' : ''}${model.state.weapon.name} ${'★'.repeat(model.state.weapon.rank)}` : '없음'}</b></span>
      <span>방어구 <b>${model.state.armor ? `${model.state.armor.legendary ? '전설 · ' : ''}${model.state.armor.name} ${'★'.repeat(model.state.armor.rank)}` : '없음'}</b></span>
      <span>물약 <b>${model.state.healingPotions}개</b></span>`;
    panel.append(equipped);
    if (model.impactMessage) {
      const impact = document.createElement('div');
      impact.className = 'shop-impact-feedback';
      impact.textContent = `구매 효과 · ${model.impactMessage}`;
      panel.append(impact);
    }

    if (model.quickOffer && model.fastPath?.promoteQuickBuy) {
      const quick = document.createElement('button');
      quick.className = 'primary-btn shop-quick-buy shop-quick-buy-promoted';
      quick.textContent = `추천 바로 구매 · ${model.quickOffer.name} · 🪙 ${model.quickOffer.price.toLocaleString()}`;
      quick.addEventListener('click', () => { quick.disabled=true; this.handlers?.onQuickPurchase(model.quickOffer!); });
      panel.append(quick);
    }

    const grid = document.createElement('div');
    grid.className = 'shop-grid';
    for (const [offerIndex, offer] of model.offers.entries()) {
      const card = document.createElement('button');
      const guidance = model.guidance?.[offerIndex];
      const projection = projectShopPurchase(model.state,offer);
      card.className = `shop-card${guidance?.best ? ' shop-card-recommended' : ''}`;
      card.style.setProperty('--accent', offer.accent);
      const current = offer.kind === 'weapon' ? model.state.weapon : offer.kind === 'armor' ? model.state.armor : null;
      card.disabled = offer.price > model.state.coins || (current?.id === offer.id && current.rank >= 5);
      const rankText = current?.id === offer.id
        ? current.rank >= 5 ? '전설 완성' : current.rank === 4 ? '현재 4단계 → 전설 진화' : `현재 ${current.rank}단계 → ${current.rank + 1}단계`
        : offer.kind === 'potion' ? '즉시 보관' : '즉시 장착';
      const iconPresentation = shopItemIconPresentation(offer.id);
      const iconStyle = iconPresentation.visible ? ` style="--shop-item-position:${shopItemIconBackgroundPosition(offer.id)}"` : '';
      const purchaseActionStyle = shopPurchaseActionIdentityStyle(projection.actionId);
      card.innerHTML = `
        ${guidance?.label ? `<span class="shop-recommendation">${guidance.best ? '추천 · ' : ''}${guidance.label}</span>` : ''}
        <span class="shop-item-heading">
          <span class="shop-item-icon${iconPresentation.visible ? '' : ' shop-item-icon-fallback'}"${iconStyle} aria-hidden="true"></span>
          <span class="shop-item-copy"><span class="shop-kind">${offer.kind === 'weapon' ? '무기' : offer.kind === 'armor' ? '방어구' : '소모품'}</span><strong>${offer.name}</strong></span>
        </span>
        <span class="shop-desc">${offer.description}</span>
        <span class="shop-rank-row"><span class="shop-purchase-action" style="${purchaseActionStyle}" aria-hidden="true"></span><span class="shop-rank">${rankText} · ${projection.actionLabel}</span></span>
        <small class="shop-purchase-delta">${projection.summary}</small>
        ${guidance?.best ? `<small class="shop-reason">${guidance.reason}</small>` : ''}
        <b class="shop-price">🪙 ${offer.price.toLocaleString()}</b>`;
      card.addEventListener('click', () => this.handlers?.onPurchase(offer));
      grid.append(card);
    }
    panel.append(grid);

    const footer = document.createElement('div');
    footer.className = 'shop-footer';
    if (model.quickOffer && !model.fastPath?.promoteQuickBuy) {
      const quick = document.createElement('button');
      quick.className = 'primary-btn shop-quick-buy';
      quick.textContent = `추천 바로 구매 · ${model.quickOffer.name} · 🪙 ${model.quickOffer.price.toLocaleString()}`;
      quick.addEventListener('click', () => { quick.disabled=true; this.handlers?.onQuickPurchase(model.quickOffer!); });
      footer.append(quick);
    }
    const reroll = document.createElement('button');
    reroll.className = 'secondary-btn';
    reroll.disabled = model.state.coins < model.rerollPrice;
    reroll.textContent = `상품 새로고침 · 🪙 ${model.rerollPrice}`;
    reroll.addEventListener('click', () => this.handlers?.onReroll());
    const close = document.createElement('button');
    close.className = 'primary-btn';
    close.textContent = '전투 복귀';
    close.addEventListener('click', () => this.handlers?.onClose());
    footer.append(reroll, close);
    panel.append(footer);
    this.root.append(panel);
  }
}

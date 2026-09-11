import { equipmentCatalog, equipmentDefinition, equipmentBonuses } from '../game/shop-data.js';
import { equipmentStageHint } from '../domain/equipment-progression.js';
import { equipmentSetForItem, equipmentSetStates } from '../game/equipment-sets.js';
import { equipmentGrade, purchaseOffer } from '../domain/economy.js';
import type { EquipmentState, EquippedItem } from '../domain/types.js';
import { equipInventoryStack, inventoryStackKey } from '../domain/equipment-inventory.js';
import { combineEquipment, strengthenEquipment, strengthenRequirement, type EquipmentTarget } from '../domain/equipment-forge.js';
import type { EquipmentRecipePresentation } from '../game/equipment-recipes.js';
import { projectEquipmentSurvival, type EquipmentReadinessResult } from '../game/equipment-survival-readiness.js';
import type { ShopDisplayOffer } from '../game/shop-data.js';
import type { ShopOfferGuidance } from '../game/shop-guidance.js';
import type { OpeningShopFastPathProfile } from '../game/opening-shop-fast-path.js';
import { equipmentIconPresentation, shopItemIconBackgroundPosition, shopItemIconPresentation } from '../game/shop-item-assets.js';
import { projectShopPurchase } from '../game/shop-purchase-projection.js';
import { shopPurchaseActionIdentityStyle } from '../game/shop-purchase-action-identity-assets.js';

export type ShopTab = 'purchase' | 'forge';

export interface ShopViewModel {
  activeTab: ShopTab;
  selectedStackKey: string | null;
  elapsedSeconds: number;
  heroMaxHp: number;
  permanentRecipeDiscoveries: readonly string[];
  recipes: EquipmentRecipePresentation[];
  readiness: EquipmentReadinessResult;
  state: EquipmentState;
  offers: ShopDisplayOffer[];
  rerollPrice: number;
  guidance?: ShopOfferGuidance[];
  topRecommendations?: ShopOfferGuidance[];
  impactMessage?: string;
  quickOffer?: ShopDisplayOffer | null;
  fastPath?: OpeningShopFastPathProfile;
}

export interface ShopHandlers {
  onTabChange: (tab: ShopTab) => void;
  onSelectStack: (stackKey: string) => void;
  onEquip: (stackKey: string) => void;
  onStrengthen: (target: EquipmentTarget) => void;
  onCombine: (recipeId: string) => void;
  onSell: (stackKey: string) => void;
  onAccessoryChange?: (id: string) => void;
  onPurchase: (offer: ShopDisplayOffer) => void;
  onQuickPurchase: (offer: ShopDisplayOffer) => void;
  onReroll: () => void;
  onClose: () => void;
}

type ShopContext = Pick<ShopViewModel, 'state' | 'elapsedSeconds' | 'heroMaxHp' | 'permanentRecipeDiscoveries'>;
const kindNames = { weapon: '무기', armor: '방어구', accessory: '장신구' } as const;
const timeLabel = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
const survivalSummary = (model: ShopContext, state: EquipmentState): string => projectEquipmentSurvival(model, state).summary;

export function shopSetSummary(state: EquipmentState): string[] {
  return equipmentSetStates(state).filter(set => set.count > 0).map(set => set.id === 'genesis-legacy'
    ? `${set.name} ${set.count}/3 · ${set.threeActive ? '✓' : '○'} 3부위: ${set.threeText}`
    : `${set.name} ${set.count}/3 · ${set.twoActive ? '✓' : '○'} 고급 2부위: ${set.twoText} · ${set.threeActive ? '✓' : '○'} 희귀 3부위: ${set.threeText}`);
}

export function shopPurchaseView(model: ShopContext, offer: ShopDisplayOffer) {
  const result = purchaseOffer(model.state, offer, model.elapsedSeconds);
  const count = model.state.inventory?.find(stack => stack.id === offer.id && stack.rank === 1)?.count ?? 0;
  const placement = offer.kind === 'potion' ? '물약 · 즉시 보관'
    : model.state[offer.kind] ? `보관함 · 현재 ${count}개` : '빈 슬롯 · 즉시 장착';
  const projection = projectShopPurchase(model.state, offer, { elapsedSeconds: model.elapsedSeconds, heroMaxHp: model.heroMaxHp });
  return { disabled: !result.ok, reason: result.ok ? '' : result.message, placement,
    projection: { ...projection, summary: result.ok ? projection.summary : '', actionLabel: offer.kind === 'potion' ? '물약' : model.state[offer.kind] ? '보관' : '장착' } };
}

function equipmentEffectText(item: EquippedItem): string {
  const empty: EquipmentState = { coins: 0, weapon: null, armor: null, accessory: null, healingPotions: 0, inventory: [], discoveredRecipes: [] };
  const bonuses = equipmentBonuses({ ...empty, [item.kind]: item });
  const labels = { spellPowerMultiplier: '마법 피해', cooldownMultiplier: '쿨타임', areaMultiplier: '광역 범위', damageTakenMultiplier: '영웅 받는 피해', coreDamageTakenMultiplier: '수호핵 받는 피해', moveSpeedMultiplier: '이동속도', goldMultiplier: '금화 획득', pickupMultiplier: '수집 범위' };
  return Object.entries(labels).filter(([key]) => bonuses[key as keyof typeof bonuses] !== 1)
    .map(([key, label]) => `${label} ${bonuses[key as keyof typeof bonuses].toFixed(2)}×`).join(' · ') || '기본 효과';
}

export function shopSelectionView(model: ShopContext, key: string | null) {
  const kind = key?.startsWith('equipped:') ? key.slice(9) : null;
  const equippedKind = kind === 'weapon' || kind === 'armor' || kind === 'accessory' ? kind : null;
  const item = equippedKind ? model.state[equippedKind] : model.state.inventory?.find(stack => inventoryStackKey(stack.id, stack.rank) === key);
  if (!item || !key) return null;
  const target: EquipmentTarget = equippedKind ? { place: 'equipped', kind: equippedKind } : { place: 'inventory', stackKey: key };
  const requirement = strengthenRequirement(item.rank);
  const available = model.state.inventory.filter(stack => stack.id === item.id && stack.rank <= item.rank)
    .reduce((sum, stack) => sum + stack.count, 0) - (equippedKind ? 0 : 1);
  const strengthened = strengthenEquipment(model.state, target, model.elapsedSeconds);
  const equip = equippedKind ? null : equipInventoryStack(model.state, key);
  const definition = equipmentDefinition(item.id);
  const reason = model.elapsedSeconds < requirement.unlockAtSeconds
    ? `${timeLabel(requirement.unlockAtSeconds)} 이후 강화 가능` : strengthened.ok ? '' : strengthened.message;
  return { item, target, title: `${item.name} · ${equipmentGrade(item.rank)} · ${kindNames[item.kind]}`,
    effects: equipmentEffectText(item),
    requirements: `강화 재료 · 같은 장비 일반~${equipmentGrade(item.rank)} ${requirement.materialCount}개 (보유 ${available}개) · 🪙 ${requirement.goldCost.toLocaleString()} · ${timeLabel(requirement.unlockAtSeconds)} 해금`,
    strengthen: { disabled: !strengthened.ok, reason, projection: strengthened.ok ? survivalSummary(model, strengthened.state) : '' },
    equip: { disabled: !equip?.ok, reason: equippedKind ? '이미 장착 중입니다.' : equip?.ok ? '' : '기존 장비를 보관할 빈 칸이 필요합니다.', projection: equip?.ok ? survivalSummary(model, equip.state) : '' },
    sell: { disabled: Boolean(equippedKind) || !definition, reason: equippedKind ? '보관 장비만 판매할 수 있습니다.' : definition ? '' : '알 수 없는 장비입니다.', refund: Math.floor((definition?.basePrice ?? definition?.price ?? 0) * 35 / 100) },
  };
}

export function shopRecipeView(model: ShopContext, recipe: EquipmentRecipePresentation) {
  if (recipe.visibility === 'hidden') return null;
  // Never resolve secret definitions, effects or projections for undiscovered cards.
  const secret = recipe.hidden && !model.permanentRecipeDiscoveries.includes(recipe.id);
  if (secret) {
    const hintOnly = recipe.visibility === 'hint';
    const result = hintOnly ? null : combineEquipment(model.state, recipe.id);
    return { title: '???', details: `${recipe.hint}${recipe.goldCost === undefined ? '' : ` · 🪙 ${recipe.goldCost.toLocaleString()}`}`,
      iconId: undefined, projection: '', disabled: !result?.ok, reason: hintOnly ? '희귀 조합 재료를 보관함에 모으세요.' : result?.ok ? '' : result?.message ?? '재료가 부족합니다.' };
  }
  const result = combineEquipment(model.state, recipe.id);
  const ingredients = recipe.ingredientIds?.map(id => `${equipmentDefinition(id)?.name ?? '알 수 없는 재료'} ${equipmentGrade(recipe.minimumIngredientRank ?? 1)} 이상 1개`).join(' + ') ?? '';
  const candidate = recipe.result ? { ...model.state, [recipe.result.kind]: recipe.result } : model.state;
  return { title: recipe.name,
    iconId: recipe.result?.id,
    details: `${ingredients} · 🪙 ${recipe.goldCost?.toLocaleString()} · 결과 ${equipmentGrade(recipe.result?.rank ?? 1)} · ${recipe.description} ${recipe.result ? equipmentEffectText(recipe.result) : ''}`,
    projection: `결과 장착 시 · ${survivalSummary(model, candidate)}`,
    disabled: !result.ok, reason: result.ok ? (recipe.result && model.state[recipe.result.kind] ? '제작 후 보관함에 저장 · 선택해서 장착' : '빈 슬롯에 즉시 장착') : result.message };
}

export class ShopOverlay {
  private readonly root: HTMLDivElement;
  private handlers: ShopHandlers | null = null;
  private previousFocus: HTMLElement | null = null;
  isOpen = false;

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'modal-overlay shop-overlay';
    this.root.hidden = true;
    this.root.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.handlers?.onClose();
      }
      if (event.key === 'Tab') {
        const controls = [...this.root.querySelectorAll<HTMLElement>('button:not(:disabled), select, [tabindex="0"]')]
          .filter(control => control.tabIndex >= 0);
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    });
    parent.append(this.root);
  }

  open(model: ShopViewModel, handlers: ShopHandlers): void {
    this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.isOpen = true;
    this.handlers = handlers;
    this.root.hidden = false;
    this.render(model);
  }

  refresh(model: ShopViewModel, handlers?: ShopHandlers): void {
    if (!this.isOpen) return;
    if (handlers) this.handlers = handlers;
    this.render(model);
  }

  hide(): void {
    this.isOpen = false;
    this.handlers = null;
    this.root.hidden = true;
    this.root.replaceChildren();
    this.previousFocus?.focus({ preventScroll: true });
    this.previousFocus = null;
  }

  private render(model: ShopViewModel): void {
    const focusedKey = this.root.contains(document.activeElement) ? (document.activeElement as HTMLElement)?.dataset.shopFocus : undefined;
    const scrollTop = this.root.querySelector('.shop-content')?.scrollTop ?? 0;
    const sameTab = this.root.dataset.tab === model.activeTab;
    this.root.dataset.tab = model.activeTab;
    this.root.replaceChildren();
    const panel = document.createElement('section');
    panel.className = 'modal-panel shop-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', '전투 상점');
    const header = document.createElement('div');
    header.className = 'shop-header';
    header.innerHTML = `
      <div><div class="eyebrow">ARCANE SUPPLY</div><h2>전투 상점</h2></div>
      <div class="shop-wallet"><span>보유 금화 · 물약 ${model.state.healingPotions}개</span><strong>🪙 ${model.state.coins.toLocaleString()}</strong></div>`;
    panel.append(header);

    const tabs = document.createElement('div');
    tabs.className = 'shop-tabs';
    tabs.innerHTML = '<div role="tablist" aria-label="상점 메뉴"></div>';
    for (const [tab, label] of [['purchase', '구매'], ['forge', '대장간']] as const) {
      const button = document.createElement('button');
      button.type = 'button';
      button.id = `shop-tab-${tab}`;
      button.dataset.shopFocus = `tab-${tab}`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(model.activeTab === tab));
      button.setAttribute('aria-controls', 'shop-content');
      button.tabIndex = model.activeTab === tab ? 0 : -1;
      button.textContent = label;
      button.addEventListener('click', () => this.handlers?.onTabChange(tab));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 'purchase' : event.key === 'End' ? 'forge' : tab === 'purchase' ? 'forge' : 'purchase';
        this.handlers?.onTabChange(next);
        this.root.querySelector<HTMLButtonElement>(`#shop-tab-${next}`)?.focus();
      });
      tabs.firstElementChild!.append(button);
    }
    panel.append(tabs);
    const body = document.createElement('div');
    body.className = 'shop-content';
    body.id = 'shop-content';
    body.setAttribute('role', 'tabpanel');
    body.setAttribute('aria-labelledby', `shop-tab-${model.activeTab}`);
    body.tabIndex = 0;
    const readiness = document.createElement('div');
    readiness.className = 'shop-readiness';
    const metrics = model.readiness;
    const weakest = { hero: '영웅 생존', core: '수호핵', firepower: '화력' }[metrics.weakestMetric];
    readiness.textContent = `${metrics.label} · 영웅 생존 ${metrics.heroSurvivalHits.toFixed(1)}타 · 수호핵 ${metrics.coreDamageMultiplier.toFixed(2)}× · 화력 ${metrics.firepowerIndex.toFixed(2)}×`;
    body.append(readiness);
    const recommendation = document.createElement('p');
    recommendation.className = 'shop-readiness-recommendation';
    recommendation.textContent = model.topRecommendations?.[0]?.reason ?? model.guidance?.find(entry => entry.best)?.reason ?? `${weakest} 보완을 우선하세요.`;
    body.append(recommendation);

    const equipped = document.createElement('div');
    equipped.className = 'equipped-row';
    equipped.innerHTML = `
      <span>무기 <b>${model.state.weapon ? `${model.state.weapon.name} ${equipmentGrade(model.state.weapon.rank)}` : '없음'}</b></span>
      <span>방어구 <b>${model.state.armor ? `${model.state.armor.name} ${equipmentGrade(model.state.armor.rank)}` : '없음'}</b></span>
      <span>장신구 <b>${model.state.accessory ? `${model.state.accessory.name} ${equipmentGrade(model.state.accessory.rank)}` : '없음'}</b></span>
      `;
    if (model.activeTab === 'purchase') body.append(equipped);
    const stage = document.createElement('p');
    stage.className = 'shop-stage-hint';
    stage.textContent = equipmentStageHint(model.elapsedSeconds ?? 0);
    if (model.activeTab === 'forge') body.append(stage);
    const sets = document.createElement('div');
    sets.className = 'shop-set-summary';
    for (const summary of shopSetSummary(model.state)) {
      const row = document.createElement('div');
      row.textContent = summary;
      sets.append(row);
    }
    if (sets.childElementCount) body.append(sets);
    if (model.impactMessage) {
      const impact = document.createElement('div');
      impact.className = 'shop-impact-feedback';
      impact.setAttribute('role', 'status');
      impact.setAttribute('aria-live', 'polite');
      impact.textContent = model.impactMessage;
      body.append(impact);
    }

    if (model.state.inventory.length >= 6) {
      const full = document.createElement('p');
      full.className = 'shop-disabled-reason';
      full.textContent = '보관함이 가득 찼습니다 · 장비 판매 또는 조합 필요 · 같은 ID·등급은 계속 쌓을 수 있습니다.';
      body.append(full);
    }

    if (model.activeTab === 'forge') this.renderForge(body, model);
    else {

    if (model.quickOffer && model.fastPath?.promoteQuickBuy) {
      const quick = document.createElement('button');
      quick.className = 'primary-btn shop-quick-buy shop-quick-buy-promoted';
      quick.dataset.shopFocus = 'quick-buy';
      quick.textContent = `추천 바로 구매 · ${model.quickOffer.name} · 🪙 ${model.quickOffer.price.toLocaleString()}`;
      quick.addEventListener('click', () => { quick.disabled=true; this.handlers?.onQuickPurchase(model.quickOffer!); });
      body.append(quick);
    }

    const accessoryPicker = document.createElement('label');
    accessoryPicker.className = 'shop-accessory-picker';
    accessoryPicker.textContent = '장신구 보기 · ';
    const select = document.createElement('select');
    select.setAttribute('aria-label', '장신구 상품 선택');
    select.dataset.shopFocus = 'accessory-picker';
    for (const accessory of equipmentCatalog().filter(offer => offer.kind === 'accessory')) {
      const option = document.createElement('option');
      option.value = accessory.id;
      option.textContent = `${accessory.name} · ${equipmentSetForItem(accessory.id)?.name ?? ''}`;
      option.selected = model.offers.some(offer => offer.id === accessory.id);
      select.append(option);
    }
    select.addEventListener('change', () => this.handlers?.onAccessoryChange?.(select.value));
    accessoryPicker.append(select);
    body.append(accessoryPicker);
    const grid = document.createElement('div');
    grid.className = 'shop-grid';
    for (const [offerIndex, offer] of model.offers.entries()) {
      const card = document.createElement('button');
      const guidance = model.guidance?.[offerIndex];
      const purchaseView = shopPurchaseView(model, offer);
      const projection = purchaseView.projection;
      card.className = `shop-card${guidance?.best ? ' shop-card-recommended' : ''}`;
      card.style.setProperty('--accent', offer.accent);
      const set = equipmentSetForItem(offer.id);
      card.disabled = purchaseView.disabled;
      card.dataset.shopFocus = `purchase-${offer.id}`;
      const rankText = purchaseView.placement;
      const iconPresentation = shopItemIconPresentation(offer.id);
      const iconVisible = offer.kind !== 'accessory' && iconPresentation.visible;
      const iconStyle = iconVisible ? ` style="--shop-item-position:${shopItemIconBackgroundPosition(offer.id)}"` : '';
      const purchaseActionStyle = shopPurchaseActionIdentityStyle(projection.actionId);
      card.innerHTML = `
        ${guidance?.label ? `<span class="shop-recommendation">${guidance.best ? '추천 · ' : ''}${guidance.label}</span>` : ''}
        <span class="shop-item-heading">
          <span class="shop-item-icon${iconVisible ? '' : ' shop-item-icon-fallback'}"${iconStyle} aria-hidden="true"></span>
          <span class="shop-item-copy"><span class="shop-kind">${offer.kind === 'weapon' ? '무기' : offer.kind === 'armor' ? '방어구' : offer.kind === 'accessory' ? '장신구' : '소모품'}</span><strong>${offer.name}</strong></span>
        </span>
        ${set ? `<small class="shop-set-name" style="color:${set.accent}">${set.name} 세트</small>` : ''}
        <span class="shop-desc">${offer.description}</span>
        <span class="shop-rank-row"><span class="shop-purchase-action" style="${purchaseActionStyle}" aria-hidden="true"></span><span class="shop-rank">${rankText} · ${projection.actionLabel}</span></span>
        <small class="shop-purchase-delta">${projection.summary}</small>
        ${guidance?.best ? `<small class="shop-reason">${guidance.reason}</small>` : ''}
        ${purchaseView.reason ? `<small class="shop-disabled-reason">${purchaseView.reason}</small>` : ''}
        <b class="shop-price">🪙 ${offer.price.toLocaleString()}</b>`;
      card.addEventListener('click', () => this.handlers?.onPurchase(offer));
      grid.append(card);
    }
    body.append(grid);
    }
    panel.append(body);

    const footer = document.createElement('div');
    footer.className = 'shop-footer';
    if (model.activeTab === 'purchase' && model.quickOffer && !model.fastPath?.promoteQuickBuy) {
      const quick = document.createElement('button');
      quick.className = 'primary-btn shop-quick-buy';
      quick.dataset.shopFocus = 'quick-buy';
      quick.textContent = `추천 바로 구매 · ${model.quickOffer.name} · 🪙 ${model.quickOffer.price.toLocaleString()}`;
      quick.addEventListener('click', () => { quick.disabled=true; this.handlers?.onQuickPurchase(model.quickOffer!); });
      footer.append(quick);
    }
    const reroll = document.createElement('button');
    reroll.className = 'secondary-btn';
    reroll.dataset.shopFocus = 'reroll';
    reroll.disabled = model.state.coins < model.rerollPrice;
    reroll.textContent = `상품 새로고침 · 🪙 ${model.rerollPrice}${reroll.disabled ? ' · 금화 부족' : ''}`;
    reroll.addEventListener('click', () => this.handlers?.onReroll());
    const close = document.createElement('button');
    close.className = 'primary-btn';
    close.dataset.shopFocus = 'close';
    close.textContent = '전투 복귀';
    close.addEventListener('click', () => this.handlers?.onClose());
    if (model.activeTab === 'purchase') footer.append(reroll);
    footer.append(close);
    panel.append(footer);
    this.root.append(panel);
    body.scrollTop = sameTab ? scrollTop : 0;
    const focusable = [...this.root.querySelectorAll<HTMLElement>('[data-shop-focus]')];
    const previous = focusable.find(element => element.dataset.shopFocus === focusedKey && !(element as HTMLButtonElement).disabled);
    (previous ?? this.root.querySelector<HTMLButtonElement>(`#shop-tab-${model.activeTab}`))?.focus({ preventScroll: true });
  }

  private renderForge(body: HTMLElement, model: ShopViewModel): void {
    const equipped = document.createElement('div');
    equipped.className = 'shop-equipped-grid';
    for (const kind of ['weapon', 'armor', 'accessory'] as const) {
      const item = model.state[kind];
      equipped.append(this.itemButton(item ?? null, `equipped:${kind}`, model, 'shop-equipped-slot', `${kindNames[kind]} · 빈 슬롯`));
    }
    body.append(equipped);
    const inventoryLabel = document.createElement('h3');
    inventoryLabel.textContent = '보관함 · 장착 중인 장비는 재료로 소비하지 않습니다';
    body.append(inventoryLabel);
    const inventory = document.createElement('div');
    inventory.className = 'shop-inventory-grid';
    for (const index of Array.from({ length: 6 }, (_, index) => index)) {
      const stack = model.state.inventory[index];
      inventory.append(this.itemButton(stack ?? null, stack ? inventoryStackKey(stack.id, stack.rank) : `empty-${index}`, model, 'shop-inventory-slot', `빈 칸 ${index + 1}`, stack?.count));
    }
    body.append(inventory);
    const selected = shopSelectionView(model, model.selectedStackKey);
    const actions = document.createElement('section');
    actions.className = 'shop-item-actions';
    if (!selected) actions.textContent = '장착 장비 또는 보관 장비를 클릭하면 장착·강화·판매 조건을 확인할 수 있습니다.';
    else {
      const title = document.createElement('h3');
      title.className = 'shop-selected-equipment-title';
      title.append(this.equipmentIcon(selected.item, 'shop-selected-equipment-icon'), document.createTextNode(selected.title));
      actions.append(title);
      for (const text of [selected.effects, selected.requirements]) {
        const line = document.createElement('p');
        line.textContent = text;
        actions.append(line);
      }
      this.actionButton(actions, '장착', 'equip', selected.equip, () => this.handlers?.onEquip(model.selectedStackKey!));
      this.actionButton(actions, '강화', 'strengthen', selected.strengthen, () => this.handlers?.onStrengthen(selected.target));
      this.actionButton(actions, `판매 · +${selected.sell.refund}G (기본가 35%)`, 'sell', selected.sell, () => this.handlers?.onSell(model.selectedStackKey!));
    }
    body.append(actions);
    const heading = document.createElement('h3');
    heading.textContent = '조합식 · 보관함 재료만 사용';
    body.append(heading);
    const recipes = document.createElement('div');
    recipes.className = 'shop-recipe-grid';
    for (const recipe of model.recipes) {
      const view = shopRecipeView(model, recipe);
      if (!view) continue;
      const card = document.createElement('article');
      card.className = 'shop-recipe-card';
      const title = document.createElement('h4');
      title.className = 'shop-recipe-title';
      if (view.iconId) title.append(this.equipmentIcon({ id: view.iconId }, 'shop-recipe-result-icon'));
      title.append(document.createTextNode(view.title));
      const details = document.createElement('p');
      details.textContent = view.details;
      card.append(title, details);
      // Identity stays in the event closure; inaccessible recipes never expose it as DOM metadata.
      this.actionButton(card, '조합', `recipe-${recipes.childElementCount}`, view, () => this.handlers?.onCombine(recipe.id));
      recipes.append(card);
    }
    body.append(recipes);
  }

  private itemButton(item: EquippedItem | null, key: string, model: ShopViewModel, className: string, emptyText: string, count?: number): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = className;
    button.type = 'button';
    button.disabled = !item;
    button.dataset.shopFocus = `select-${key}`;
    button.setAttribute('aria-pressed', String(model.selectedStackKey === key));
    if (!item) button.textContent = emptyText;
    else {
      const heading = document.createElement('span');
      heading.className = 'forge-item-heading';
      const title = document.createElement('strong');
      title.textContent = `${kindNames[item.kind]} · ${item.name} · ${equipmentGrade(item.rank)}${count === undefined ? '' : ` ×${count}`}`;
      const effect = document.createElement('small');
      effect.textContent = equipmentEffectText(item);
      heading.append(this.equipmentIcon(item, 'forge-equipment-icon'));
      const copy = document.createElement('span');
      copy.append(title);
      if (count !== undefined) {
        const badge = document.createElement('b');
        badge.className = 'forge-item-count';
        badge.textContent = `×${count}`;
        copy.append(badge);
      }
      heading.append(copy);
      button.append(heading, effect);
      button.addEventListener('click', () => this.handlers?.onSelectStack(key));
    }
    return button;
  }

  private equipmentIcon(item: Pick<EquippedItem, 'id'>, className: string): HTMLSpanElement {
    const icon = equipmentIconPresentation(item.id);
    const element = document.createElement('span');
    element.className = `${className}${icon.visible ? '' : ' forge-equipment-icon-fallback'}`;
    element.setAttribute('aria-hidden', 'true');
    if (icon.visible) {
      element.style.setProperty('--forge-item-image', `url('${icon.source}')`);
      element.style.setProperty('--forge-item-position', icon.position);
    }
    return element;
  }

  private actionButton(parent: HTMLElement, label: string, key: string, view: { disabled: boolean; reason: string; projection?: string }, action: () => void): void {
    const row = document.createElement('div');
    row.className = 'shop-forge-action';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary-btn';
    button.dataset.shopFocus = key;
    button.textContent = label;
    button.disabled = view.disabled;
    const reason = document.createElement('span');
    reason.id = `shop-reason-${key}`;
    reason.className = view.disabled ? 'shop-disabled-reason' : 'shop-purchase-delta';
    reason.textContent = [view.reason, view.projection].filter(Boolean).join(' · ');
    button.setAttribute('aria-describedby', reason.id);
    button.addEventListener('click', () => { button.disabled = true; action(); });
    row.append(button, reason);
    parent.append(row);
  }
}

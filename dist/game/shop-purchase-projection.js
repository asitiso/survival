import { equipmentSetChange } from './equipment-sets.js';
import { purchaseOffer } from '../domain/economy.js';
import { equipmentBonuses } from './shop-data.js';
import { projectEquipmentSurvival } from './equipment-survival-readiness.js';
const ACTION_LABEL = { equip: '신규', upgrade: '강화', legendary: '전설', replace: '교체', potion: '물약' };
const LOWER_IS_BETTER = new Set(['cooldownMultiplier', 'damageTakenMultiplier', 'coreDamageTakenMultiplier']);
const DELTA_LABEL = {
    spellPowerMultiplier: '마법 화력', cooldownMultiplier: '쿨타임', moveSpeedMultiplier: '이동 속도', damageTakenMultiplier: '받는 피해', areaMultiplier: '광역 범위', goldMultiplier: '금화 수급', pickupMultiplier: '자원 회수', coreDamageTakenMultiplier: '수호핵 피해',
};
const DELTA_ORDER = ['spellPowerMultiplier', 'cooldownMultiplier', 'areaMultiplier', 'damageTakenMultiplier', 'coreDamageTakenMultiplier', 'moveSpeedMultiplier', 'goldMultiplier', 'pickupMultiplier'];
const format = (value) => `${value.toFixed(2)}×`;
function currentItem(state, offer) { return offer.kind === 'potion' ? null : state[offer.kind]; }
function actionFor(before, after, offer) {
    if (offer.kind === 'potion')
        return 'potion';
    const prior = currentItem(before, offer), next = currentItem(after, offer);
    if (!prior)
        return 'equip';
    if (prior.id !== offer.id)
        return 'replace';
    if (next?.legendary && !prior.legendary)
        return 'legendary';
    return 'upgrade';
}
function deltasFor(before, after) {
    const a = equipmentBonuses(before), b = equipmentBonuses(after);
    return DELTA_ORDER.map(id => { const from = a[id], to = b[id], lower = LOWER_IS_BETTER.has(id), benefit = (lower ? from - to : to - from) / Math.max(.0001, Math.abs(from)); return { id, label: DELTA_LABEL[id], before: from, after: to, benefit }; }).filter(delta => Math.abs(delta.after - delta.before) > 1e-9).sort((x, y) => Math.abs(y.benefit) - Math.abs(x.benefit) || DELTA_ORDER.indexOf(x.id) - DELTA_ORDER.indexOf(y.id)).slice(0, 2);
}
export function shopPurchaseProjectionFromStates(before, after, offer, context) {
    const affordable = before.coins >= offer.price;
    if (offer.kind === 'potion') {
        return { actionId: 'potion', actionLabel: ACTION_LABEL.potion, summary: `물약 ${before.healingPotions}→${after.healingPotions}개 · 최대 HP ${Math.round(offer.power * 100)}% 회복 1회 추가`, deltas: [], affordable };
    }
    const actionId = actionFor(before, after, offer), deltas = deltasFor(before, after);
    const statSummary = deltas.length > 0 ? deltas.map(delta => `${delta.label} ${format(delta.before)}→${format(delta.after)}`).join(' · ') : '전설 완성';
    const setChange = equipmentSetChange(before, after);
    const survival = context ? projectEquipmentSurvival({ ...context, state: before }, after).summary : '';
    const summary = [survival, statSummary, setChange].filter(Boolean).join(' · ');
    return { actionId, actionLabel: ACTION_LABEL[actionId], summary, deltas, affordable };
}
export function projectShopPurchase(state, offer, context) {
    const current = currentItem(state, offer);
    const simulated = { ...state, coins: Math.max(state.coins, offer.price) };
    const result = purchaseOffer(simulated, offer);
    if (!result.ok)
        return { actionId: offer.kind === 'potion' ? 'potion' : current ? 'upgrade' : 'equip', actionLabel: offer.kind === 'potion' ? ACTION_LABEL.potion : current ? ACTION_LABEL.upgrade : ACTION_LABEL.equip, summary: result.message, deltas: [], affordable: state.coins >= offer.price };
    const beforeStack = offer.kind === 'potion' ? undefined : state.inventory?.find(item => item.id === offer.id && item.rank === 1);
    const afterStack = offer.kind === 'potion' ? undefined : result.state.inventory?.find(item => item.id === offer.id && item.rank === 1);
    if (offer.kind !== 'potion' && result.state[offer.kind]?.id === current?.id
        && afterStack && (!beforeStack || afterStack.count > beforeStack.count)) {
        const survival = context ? ` · ${projectEquipmentSurvival({ ...context, state }, result.state).summary}` : '';
        return { actionId: 'upgrade', actionLabel: '보관', summary: `${result.message} · 현재 장착 효과 유지${survival}`, deltas: [], affordable: state.coins >= offer.price };
    }
    return shopPurchaseProjectionFromStates(state, { ...result.state, coins: state.coins - offer.price }, offer, context);
}

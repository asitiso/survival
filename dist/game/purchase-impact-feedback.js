import { shopPurchaseProjectionFromStates } from './shop-purchase-projection.js';
function equipped(state, offer) { return offer.kind === 'weapon' ? state.weapon : offer.kind === 'armor' ? state.armor : null; }
export function purchaseImpactFeedback(before, after, offer) {
    const projection = shopPurchaseProjectionFromStates(before, after, offer);
    if (offer.kind === 'potion')
        return { kind: 'potion', message: projection.summary };
    const prior = equipped(before, offer), next = equipped(after, offer);
    const kind = projection.actionId === 'equip' ? 'new' : projection.actionId;
    const rank = next?.rank ?? 1;
    const legacyTerm = offer.id === 'rapid-wand' ? '재사용 대기시간 · ' : '';
    return { kind, message: `${legacyTerm}${projection.summary} · ${rank}단계${next?.legendary ? ' 전설' : ''}` };
}

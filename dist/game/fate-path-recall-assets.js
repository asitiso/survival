import { DECISION_PATH_ICON_ATLAS, auditDecisionPathIconAtlas, decisionPathIconSprite } from './decision-path-icon-assets.js';
export const FATE_PATH_RECALL_IDS = ['frenzy', 'golden', 'guardian'];
export function fatePathRecallIcon(id) {
    const sprite = decisionPathIconSprite(id);
    if (!sprite)
        throw new Error(`Missing decision path sprite for ${id}`);
    return { id, atlasSrc: DECISION_PATH_ICON_ATLAS.src, sprite, toastIdentitySupported: true, activeRecallIdentitySupported: true, maxVisibleRecallIcons: 3, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false };
}
export function auditFatePathRecallAtlas() {
    const audit = auditDecisionPathIconAtlas(FATE_PATH_RECALL_IDS);
    const outOfBounds = audit.outOfBounds.filter((id) => FATE_PATH_RECALL_IDS.includes(id));
    const passed = audit.itemCount === 3 && audit.coverage === 1 && audit.uniqueCellCount === 3 && outOfBounds.length === 0;
    return { itemCount: audit.itemCount, coverage: audit.coverage, uniqueCellCount: audit.uniqueCellCount, outOfBounds, passed };
}

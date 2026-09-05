import { DEEP_RUN_DECISION_ATLAS, DEEP_RUN_OATH_IDS, deepRunDecisionIdentityIcon } from './deep-run-decision-identity-assets.js';
export const LONG_RUN_OATH_RECALL_IDS = DEEP_RUN_OATH_IDS;
const TITLES = {
    slayer: '소탕 서약',
    elite_hunt: '정예 사냥 서약',
    boss_hunt: '군주 사냥 서약',
    arcane_flow: '영창 서약',
    core_guard: '수호 서약',
    endure: '불굴 서약',
};
export function longRunOathTitle(id) { return TITLES[id]; }
export function longRunOathKindFromTitle(title) {
    for (const id of LONG_RUN_OATH_RECALL_IDS)
        if (TITLES[id] === title)
            return id;
    return null;
}
export function longRunOathRecallIcon(id) {
    const icon = deepRunDecisionIdentityIcon({ kind: 'oath', id });
    return {
        id, atlasSrc: DEEP_RUN_DECISION_ATLAS.src,
        sx: icon.sx, sy: icon.sy, sw: icon.sw, sh: icon.sh,
        startToastIdentitySupported: true, activeRecallIdentitySupported: true, outcomeToastIdentitySupported: true, maxVisibleRecallIcons: 1,
        animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false,
    };
}
export function auditLongRunOathRecallAtlas() {
    const cells = new Set();
    const outOfBounds = [];
    for (const id of LONG_RUN_OATH_RECALL_IDS) {
        const icon = longRunOathRecallIcon(id);
        cells.add(`${icon.sx}:${icon.sy}`);
        if (icon.sx < 0 || icon.sy < 0 || icon.sx + icon.sw > DEEP_RUN_DECISION_ATLAS.width || icon.sy + icon.sh > DEEP_RUN_DECISION_ATLAS.height)
            outOfBounds.push(id);
    }
    const itemCount = LONG_RUN_OATH_RECALL_IDS.length, coverage = itemCount / 6, uniqueCellCount = cells.size;
    return { itemCount, coverage, uniqueCellCount, outOfBounds, passed: itemCount === 6 && coverage === 1 && uniqueCellCount === 6 && outOfBounds.length === 0 };
}

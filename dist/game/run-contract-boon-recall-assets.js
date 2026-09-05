import { DEEP_RUN_DECISION_ATLAS, deepRunDecisionIdentityIcon } from './deep-run-decision-identity-assets.js';
export const RUN_CONTRACT_RECALL_IDS = ['slayer', 'warden', 'arcane', 'hunter', 'survivor'];
export function runContractRecallIcon(family) {
    const icon = deepRunDecisionIdentityIcon({ kind: 'contract', id: family });
    return { family, atlasSrc: icon.atlasSrc, sx: icon.sx, sy: icon.sy, sw: icon.sw, sh: icon.sh, acceptToastIdentitySupported: true, outcomeToastIdentitySupported: true, activeBoonIdentitySupported: true, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false };
}
export function activeRunContractBoonRecall(boons, elapsedMs) {
    let active;
    for (const boon of boons) {
        if (boon.expiresAtMs <= elapsedMs)
            continue;
        if (!active || boon.expiresAtMs > active.expiresAtMs)
            active = boon;
    }
    if (!active)
        return null;
    return { family: active.family, remainingSeconds: Math.max(1, Math.ceil((active.expiresAtMs - elapsedMs) / 1000)), icon: runContractRecallIcon(active.family) };
}
export function auditRunContractBoonRecallAtlas() {
    const cells = new Set();
    const outOfBounds = [];
    for (const family of RUN_CONTRACT_RECALL_IDS) {
        const icon = runContractRecallIcon(family);
        cells.add(`${icon.sx}:${icon.sy}`);
        if (icon.sx < 0 || icon.sy < 0 || icon.sx + icon.sw > DEEP_RUN_DECISION_ATLAS.width || icon.sy + icon.sh > DEEP_RUN_DECISION_ATLAS.height)
            outOfBounds.push(family);
    }
    return { contractCount: RUN_CONTRACT_RECALL_IDS.length, coverage: RUN_CONTRACT_RECALL_IDS.length / 5, uniqueCellCount: cells.size, outOfBounds, assetSrc: DEEP_RUN_DECISION_ATLAS.src, passed: RUN_CONTRACT_RECALL_IDS.length === 5 && cells.size === 5 && outOfBounds.length === 0 };
}

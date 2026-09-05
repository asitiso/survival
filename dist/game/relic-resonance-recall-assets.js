import { BUILD_IDENTITY_ATLAS, buildIdentityIcon } from './build-identity-assets.js';
export const RELIC_RESONANCE_RECALL_IDS = [
    'abyss-eye', 'chrono-shard', 'guardian-heart', 'ember-crown', 'winter-heart', 'storm-core', 'oath-seal',
    'inferno-heart', 'summoner-sigil', 'juggernaut-core', 'phoenix-brand', 'zero-crystal', 'storm-crown', 'citadel-sigil',
];
export function relicResonanceRecallIcon(relicId) {
    const icon = buildIdentityIcon(relicId);
    return { relicId, atlasSrc: icon.atlasSrc, sx: icon.sx, sy: icon.sy, sw: icon.sw, sh: icon.sh, toastIdentitySupported: true, stripBadgeSupported: true, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false };
}
export function relicResonanceTierBadge(tier) {
    if (tier === 0)
        return null;
    return { tier, label: tier === 1 ? 'I' : tier === 2 ? 'II' : 'III' };
}
export function relicResonanceRecallPresentation(relicId, tier) {
    if (!relicId)
        return null;
    const badge = relicResonanceTierBadge(tier);
    if (!badge)
        return null;
    return { relicId, tier: badge.tier, icon: relicResonanceRecallIcon(relicId), badge };
}
export function auditRelicResonanceRecallAtlas() {
    const cells = new Set();
    const outOfBounds = [];
    for (const relicId of RELIC_RESONANCE_RECALL_IDS) {
        const icon = relicResonanceRecallIcon(relicId);
        cells.add(`${icon.sx}:${icon.sy}`);
        if (icon.sx < 0 || icon.sy < 0 || icon.sx + icon.sw > BUILD_IDENTITY_ATLAS.width || icon.sy + icon.sh > BUILD_IDENTITY_ATLAS.height)
            outOfBounds.push(relicId);
    }
    return { relicCount: RELIC_RESONANCE_RECALL_IDS.length, coverage: RELIC_RESONANCE_RECALL_IDS.length / 14, uniqueCellCount: cells.size, outOfBounds, assetSrc: BUILD_IDENTITY_ATLAS.src, passed: RELIC_RESONANCE_RECALL_IDS.length === 14 && cells.size === 14 && outOfBounds.length === 0 };
}

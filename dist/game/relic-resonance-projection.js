import { deriveRelicResonance } from './endless/relic-resonance.js';
import { relicResonanceTierIdentityForTier } from './relic-resonance-tier-identity-assets.js';
export function relicResonanceImpactForTiers(before, after) { return after > before ? 'tier-up' : after < before ? 'tier-down' : 'steady'; }
export function relicResonanceNextTierProgress(resonance) {
    const score = Math.max(0, Number.isFinite(resonance.score) ? resonance.score : 0), tier = resonance.tier;
    if (tier >= 3)
        return { tier: 3, from: 9, target: 9, score, ratio: 1, complete: true };
    const from = tier === 0 ? 0 : tier === 1 ? 3 : 6, target = tier === 0 ? 3 : tier === 1 ? 6 : 9;
    return { tier, from, target, score, ratio: Math.max(0, Math.min(1, (score - from) / Math.max(1, target - from))), complete: false };
}
export function projectRelicResonance(currentRelic, candidateRelic, input) {
    const before = deriveRelicResonance({ ...input, relicId: currentRelic }), after = deriveRelicResonance({ ...input, relicId: candidateRelic });
    return { before, after, impactId: relicResonanceImpactForTiers(before.tier, after.tier), tierId: relicResonanceTierIdentityForTier(after.tier), scoreDelta: after.score - before.score, progress: relicResonanceNextTierProgress(after) };
}

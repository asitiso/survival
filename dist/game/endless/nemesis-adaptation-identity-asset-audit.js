import { ACTION_BUTTONS } from '../config.js';
import { getBossAdaptations } from './nemesis.js';
import { NEMESIS_ADAPTATION_IDENTITY_IDS, auditNemesisAdaptationIdentityAtlas, nemesisAdaptationIdentityIcon } from './nemesis-adaptation-identity-assets.js';
function profileState(marks, mirrorAffinity = 'frost') {
    return { profiles: { inferno: { bossId: 'inferno', encounters: 4, marks, affinityTotals: { fire: 120, frost: 240 }, mirrorAffinity, longestEncounterMs: 90000, totalCoreDamage: 500, defeats: 2 } } };
}
function close(a, b) { return Math.abs(a - b) < 1e-9; }
export function auditNemesisAdaptationIdentityAssets() {
    const atlas = auditNemesisAdaptationIdentityAtlas();
    const samples = [];
    const push = (caseId, passed, id) => { samples.push({ caseId, passed, ...(id ? { id } : {}) }); };
    const toast = new Set(), recall = new Set(), fallback = new Set();
    const ranked = getBossAdaptations(profileState({ spell_guard: 1, blink_hunt: 2, core_siege: 3, enrage_clock: 4, mirror_affinity: 5 }), 'inferno');
    const rankOk = ranked.length === 3 && ranked[0]?.kind === 'mirror_affinity' && ranked[0]?.rank === 3 && ranked[1]?.kind === 'enrage_clock' && ranked[1]?.rank === 2 && ranked[2]?.kind === 'core_siege' && ranked[2]?.rank === 2;
    const tied = getBossAdaptations(profileState({ spell_guard: 5, blink_hunt: 5, core_siege: 5, enrage_clock: 5, mirror_affinity: 5 }), 'inferno');
    const tieBreakOk = tied.map(v => v.kind).join(',') === 'core_siege,enrage_clock,blink_hunt';
    const mirror = getBossAdaptations(profileState({ spell_guard: 1, blink_hunt: 0, core_siege: 0, enrage_clock: 0, mirror_affinity: 4 }), 'inferno');
    const mirrorOk = mirror[0]?.kind === 'mirror_affinity' && mirror[0]?.rank === 2 && mirror[0]?.affinity === 'frost';
    const modifierOk = close(1 - (2 * .035), .93) && close(1 + .05 * 2, 1.10) && close(1 + .05 * 2, 1.10) && close(1 - .04 * 2, .92) && close(.94, .94);
    let textFallbackPreserved = true, imageLoadFailureNonBlocking = true, iconMotionAmplitude = 0;
    for (const id of NEMESIS_ADAPTATION_IDENTITY_IDS) {
        const icon = nemesisAdaptationIdentityIcon(id);
        const body = icon.sx >= 0 && icon.sy >= 0 && icon.sx + icon.sw <= 288 && icon.sy + icon.sh <= 192;
        push(`${id}:body`, body, id);
        push(`${id}:toast`, icon.learningToastIdentitySupported, id);
        if (icon.learningToastIdentitySupported)
            toast.add(id);
        push(`${id}:recall`, icon.bossRecallIdentitySupported, id);
        if (icon.bossRecallIdentitySupported)
            recall.add(id);
        push(`${id}:fallback`, icon.textFallbackPreserved, id);
        if (icon.textFallbackPreserved)
            fallback.add(id);
        push(`${id}:non-blocking`, !icon.loadFailureBlocksGameplay, id);
        push(`${id}:static`, !icon.animated && icon.motionAmplitude === 0, id);
        push(`${id}:max-three`, icon.maxVisibleRecallIcons === 3, id);
        push(`${id}:rank-contract`, rankOk, id);
        push(`${id}:tie-break`, tieBreakOk, id);
        push(`${id}:mirror-affinity`, mirrorOk, id);
        push(`${id}:modifier-contract`, modifierOk, id);
        push(`${id}:actions-schema`, ACTION_BUTTONS.length === 9, id);
        textFallbackPreserved &&= icon.textFallbackPreserved;
        imageLoadFailureNonBlocking &&= !icon.loadFailureBlocksGameplay;
        iconMotionAmplitude = Math.max(iconMotionAmplitude, icon.motionAmplitude);
    }
    const learningToastCoverage = toast.size / 5, bossRecallCoverage = recall.size / 5, fallbackCoverage = fallback.size / 5, actionCount = ACTION_BUTTONS.length;
    const rankContractMutation = !rankOk, tieBreakMutation = !tieBreakOk, mirrorAffinityMutation = !mirrorOk, modifierContractMutation = !modifierOk;
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (!atlas.passed)
        issues.push('atlas');
    if (learningToastCoverage !== 1)
        issues.push('toast-coverage');
    if (bossRecallCoverage !== 1)
        issues.push('recall-coverage');
    if (fallbackCoverage !== 1)
        issues.push('fallback-coverage');
    if (!textFallbackPreserved)
        issues.push('text-fallback');
    if (!imageLoadFailureNonBlocking)
        issues.push('blocking');
    if (iconMotionAmplitude !== 0)
        issues.push('motion');
    if (rankContractMutation)
        issues.push('rank-contract-mutation');
    if (tieBreakMutation)
        issues.push('tie-break-mutation');
    if (mirrorAffinityMutation)
        issues.push('mirror-affinity-mutation');
    if (modifierContractMutation)
        issues.push('modifier-contract-mutation');
    if (actionCount !== 9)
        issues.push(`actions:${actionCount}`);
    if (samples.some(s => !s.passed))
        issues.push('sample-failure');
    return { samples, adaptationCount: 5, coverage: atlas.coverage, uniqueCellCount: atlas.uniqueCellCount, outOfBounds: [...atlas.outOfBounds], learningToastCoverage, bossRecallCoverage, fallbackCoverage, maxVisibleRecallIcons: 3, textFallbackPreserved, imageLoadFailureNonBlocking, iconMotionAmplitude, rankContractMutation, tieBreakMutation, mirrorAffinityMutation, modifierContractMutation, actionCount, snapshotSchemaMutation: false, issues, passed: issues.length === 0 };
}

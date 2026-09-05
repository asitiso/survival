import { ACTION_BUTTONS } from './config.js';
import { bossArchetypeTuning } from './boss-patterns.js';
import { BOSS_PHASE2_ESCALATION_IDS, auditBossPhase2EscalationAtlas, bossPhase2EscalationIcon } from './boss-phase2-escalation-identity-assets.js';
import { BOSS_PHASE3_ENRAGE_IDS, auditBossPhase3EnrageAtlas, bossPhase3EnrageIcon } from './boss-phase3-enrage-identity-assets.js';
export function auditBossPhaseEscalationIdentityAssets() {
    const p2 = auditBossPhase2EscalationAtlas(), p3 = auditBossPhase3EnrageAtlas(), samples = [];
    const push = (caseId, passed, archetype) => samples.push({ caseId, passed, archetype });
    let center = 0, recall = 0, mutation = false;
    for (const archetype of BOSS_PHASE2_ESCALATION_IDS) {
        const a = bossPhase2EscalationIcon(archetype), b = bossPhase3EnrageIcon(archetype), t1 = bossArchetypeTuning(archetype, 1), t2 = bossArchetypeTuning(archetype, 2), t3 = bossArchetypeTuning(archetype, 3);
        push(`${archetype}:p2-body`, a.sx >= 0 && a.sy >= 0 && a.sx + 96 <= 288 && a.sy + 96 <= 192, archetype);
        push(`${archetype}:p2-cue`, a.centerCueIdentitySupported, archetype);
        push(`${archetype}:p2-recall`, a.persistentRecallIdentitySupported, archetype);
        push(`${archetype}:p3-body`, b.sx >= 0 && b.sy >= 0 && b.sx + 96 <= 288 && b.sy + 96 <= 192, archetype);
        push(`${archetype}:p3-cue`, b.centerCueIdentitySupported, archetype);
        push(`${archetype}:p3-recall`, b.persistentRecallIdentitySupported, archetype);
        push(`${archetype}:p1-p2-change`, JSON.stringify(t1) !== JSON.stringify(t2), archetype);
        push(`${archetype}:p2-p3-change`, JSON.stringify(t2) !== JSON.stringify(t3), archetype);
        push(`${archetype}:static`, !a.animated && !b.animated && a.motionAmplitude === 0 && b.motionAmplitude === 0, archetype);
        push(`${archetype}:safe-fallback`, a.textFallbackPreserved && b.textFallbackPreserved && !a.loadFailureBlocksGameplay && !b.loadFailureBlocksGameplay, archetype);
        if (a.centerCueIdentitySupported && b.centerCueIdentitySupported)
            center++;
        if (a.persistentRecallIdentitySupported && b.persistentRecallIdentitySupported)
            recall++;
        if (!(t1.specialInterval >= t2.specialInterval && t2.specialInterval >= t3.specialInterval))
            mutation = true;
    }
    const issues = [];
    if (samples.length !== 60)
        issues.push('sample-count');
    if (!p2.passed)
        issues.push('phase2-atlas');
    if (!p3.passed)
        issues.push('phase3-atlas');
    if (center !== 6)
        issues.push('center-cue');
    if (recall !== 6)
        issues.push('persistent-recall');
    if (mutation)
        issues.push('gameplay-contract');
    if (ACTION_BUTTONS.length !== 9)
        issues.push('actions');
    if (samples.some(s => !s.passed))
        issues.push('samples');
    return { samples, phase2IdentityCount: BOSS_PHASE2_ESCALATION_IDS.length, phase3IdentityCount: BOSS_PHASE3_ENRAGE_IDS.length, phase2Coverage: p2.coverage, phase3Coverage: p3.coverage, phase2UniqueCellCount: p2.uniqueCellCount, phase3UniqueCellCount: p3.uniqueCellCount, centerCueCoverage: center / 6, persistentRecallCoverage: recall / 6, gameplayContractMutation: mutation, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, issues, passed: issues.length === 0 };
}

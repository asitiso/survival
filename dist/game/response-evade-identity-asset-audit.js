import { ACTION_BUTTONS } from './config.js';
import { BOSS_RESPONSE_ACK_SECONDS } from './boss-action-assist.js';
import { bossArchetypeTuning } from './boss-patterns.js';
import { BOSS_RESPONSE_ACK_IDENTITY_IDS, auditBossResponseAckIdentityAtlas, bossResponseAckIdentityIcon } from './boss-response-ack-identity-assets.js';
import { PERFECT_EVADE_STREAKS, auditPerfectEvadeIdentityAtlas, perfectEvadeIdentityIcon } from './perfect-evade-identity-assets.js';
import { arenaDodgeChainReward, createArenaDodgeChain, recordArenaDodgeChain } from './endless/arena-dodge-chain.js';
import { shouldTriggerArenaDodgeFinisher } from './endless/arena-dodge-finisher.js';
function gameplayContractOk() {
    const inferno = bossArchetypeTuning('inferno', 1), time = bossArchetypeTuning('timeEater', 2);
    const chained = recordArenaDodgeChain(recordArenaDodgeChain(recordArenaDodgeChain(recordArenaDodgeChain(recordArenaDodgeChain(createArenaDodgeChain(), 100), 200), 300), 400), 500);
    const reward = arenaDodgeChainReward(5);
    return BOSS_RESPONSE_ACK_SECONDS === .4 && ACTION_BUTTONS.length === 9 && inferno.specialInterval === 5.4 && inferno.fanProjectiles === 7 && time.specialInterval === 4.7 && chained.count === 5 && reward.signatureChargeBonus === 2.03 && shouldTriggerArenaDodgeFinisher(4, 5) && !shouldTriggerArenaDodgeFinisher(5, 5);
}
export function auditResponseEvadeIdentityAssets() {
    const responseAudit = auditBossResponseAckIdentityAtlas(), evadeAudit = auditPerfectEvadeIdentityAtlas(), samples = [];
    const push = (caseId, passed, id, streak) => samples.push({ caseId, passed, ...(id ? { id } : {}), ...(streak ? { streak } : {}) });
    let ackOnly = 0, successClaims = 0, flow = 0, finisherReuse = 0;
    for (const id of BOSS_RESPONSE_ACK_IDENTITY_IDS) {
        const icon = bossResponseAckIdentityIcon(id);
        push(`${id}:body`, icon.sx + 96 <= 288 && icon.sy + 96 <= 192, id);
        push(`${id}:ack-only`, icon.acknowledgementOnly, id);
        if (icon.acknowledgementOnly)
            ackOnly++;
        push(`${id}:no-success-claim`, !icon.successClaimed, id);
        if (icon.successClaimed)
            successClaims++;
        push(`${id}:static`, !icon.animated && icon.motionAmplitude === 0, id);
        push(`${id}:fallback`, icon.textFallbackPreserved && !icon.loadFailureBlocksGameplay, id);
    }
    for (const streak of PERFECT_EVADE_STREAKS) {
        const icon = perfectEvadeIdentityIcon(streak);
        push(`evade-${streak}:body`, icon.sx + 96 <= 480, undefined, streak);
        push(`evade-${streak}:flow`, icon.flowIdentitySupported, undefined, streak);
        if (icon.flowIdentitySupported)
            flow++;
        push(`evade-${streak}:static`, !icon.animated && icon.motionAmplitude === 0, undefined, streak);
        push(`evade-${streak}:fallback`, icon.textFallbackPreserved && !icon.loadFailureBlocksGameplay, undefined, streak);
        const reuse = icon.finisherReusesFinalFormIdentity === (streak === 5);
        push(`evade-${streak}:final-form-reuse`, reuse, undefined, streak);
        if (reuse)
            finisherReuse++;
    }
    const contractOk = gameplayContractOk();
    push('global:action-count', ACTION_BUTTONS.length === 9);
    push('global:ack-window', BOSS_RESPONSE_ACK_SECONDS === .4);
    push('global:chain-cap', recordArenaDodgeChain({ count: 5, lastEvadeAtMs: 100, expiresAtMs: 1000 }, 200).count === 5);
    push('global:finisher-threshold', shouldTriggerArenaDodgeFinisher(4, 5) && !shouldTriggerArenaDodgeFinisher(3, 4));
    push('global:gameplay-contract', contractOk);
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (!responseAudit.passed)
        issues.push('response-atlas');
    if (!evadeAudit.passed)
        issues.push('evade-atlas');
    if (samples.some(s => !s.passed))
        issues.push('sample');
    if (!contractOk)
        issues.push('gameplay-contract');
    const audit = { samples, responseIdentityCount: 6, evadeIdentityCount: 5, responseCoverage: responseAudit.coverage, evadeCoverage: evadeAudit.coverage, responseUniqueCellCount: responseAudit.uniqueCellCount, evadeUniqueCellCount: evadeAudit.uniqueCellCount, acknowledgementOnlyCoverage: ackOnly / 6, successClaimRate: successClaims / 6, flowIdentityCoverage: flow / 5, finisherFinalFormReuseCoverage: finisherReuse / 5, iconMotionAmplitude: 0, gameplayContractMutation: !contractOk, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, issues, passed: false };
    audit.passed = issues.length === 0 && audit.acknowledgementOnlyCoverage === 1 && audit.successClaimRate === 0 && audit.flowIdentityCoverage === 1 && audit.finisherFinalFormReuseCoverage === 1 && audit.actionCount === 9;
    return audit;
}

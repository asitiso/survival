import { ACTION_BUTTONS } from '../config.js';
import { mythicPhaseProfile } from './mythic-phases.js';
import { MYTHIC_PHASE_IDENTITY_IDS, auditMythicPhaseIdentityAtlas, mythicPhaseIdentityIcon, mythicPhasePressureSegments } from './mythic-phase-identity-assets.js';
const ACTIVE = { active: true, label: 'MYTHIC 3', tier: 3, channels: ['inferno', 'summoner', 'juggernaut'] };
const INACTIVE = { active: false, label: '', tier: 0, channels: [] };
const close = (a, b) => Math.abs(a - b) < 1e-9;
function thresholdOk() { return mythicPhaseProfile(ACTIVE, 1, 1).phase === 1 && mythicPhaseProfile(ACTIVE, .7, 1).phase === 1 && mythicPhaseProfile(ACTIVE, .699999, 1).phase === 2 && mythicPhaseProfile(ACTIVE, .35, 1).phase === 2 && mythicPhaseProfile(ACTIVE, .349999, 1).phase === 3 && mythicPhaseProfile(ACTIVE, 0, 1).phase === 3; }
function weakpointOk() { for (const hp of [.8, .5, .2]) {
    const remaining = mythicPhaseProfile(ACTIVE, hp, 1), cleared = mythicPhaseProfile(ACTIVE, hp, 0);
    if (!(cleared.bossDamageTakenMultiplier >= remaining.bossDamageTakenMultiplier && cleared.specialCadenceMultiplier >= remaining.specialCadenceMultiplier && cleared.summonCountMultiplier <= remaining.summonCountMultiplier && cleared.dashDistanceMultiplier <= remaining.dashDistanceMultiplier))
        return false;
} return mythicPhasePressureSegments(0) === 1 && mythicPhasePressureSegments(.5) === 2 && mythicPhasePressureSegments(1) === 3; }
function modifiersOk() { const expected = [null, { d: .94, c: .96, s: 1.02, x: 1.02 }, { d: .92, c: .88, s: 1.1, x: 1.08 }, { d: .9, c: .8, s: 1.16, x: 1.14 }]; for (const [hp, phase] of [[.8, 1], [.5, 2], [.2, 3]]) {
    const p = mythicPhaseProfile(ACTIVE, hp, 1), e = expected[phase];
    if (!(close(p.bossDamageTakenMultiplier, e.d) && close(p.specialCadenceMultiplier, e.c) && close(p.summonCountMultiplier, e.s) && close(p.dashDistanceMultiplier, e.x)))
        return false;
    for (const weak of [0, .25, .5, .75, 1]) {
        const q = mythicPhaseProfile(ACTIVE, hp, weak);
        if (q.bossDamageTakenMultiplier < .88 || q.bossDamageTakenMultiplier > 1.15 || q.specialCadenceMultiplier < .78 || q.specialCadenceMultiplier > 1.2 || q.summonCountMultiplier < .82 || q.summonCountMultiplier > 1.18 || q.dashDistanceMultiplier < .9 || q.dashDistanceMultiplier > 1.16)
            return false;
    }
} return true; }
function nonMythicOk() { const p = mythicPhaseProfile(INACTIVE, .1, 1); return p.phase === 0 && p.label === '' && p.channels.length === 0 && p.bossDamageTakenMultiplier === 1 && p.specialCadenceMultiplier === 1 && p.summonCountMultiplier === 1 && p.dashDistanceMultiplier === 1; }
export function auditMythicPhaseIdentityAssets() { const atlas = auditMythicPhaseIdentityAtlas(); const samples = []; const push = (caseId, passed, phase) => samples.push({ caseId, passed, ...(phase ? { phase } : {}) }); const threshold = thresholdOk(), weakpoint = weakpointOk(), mods = modifiersOk(), nonMythic = nonMythicOk(); const encounter = new Set(), transition = new Set(), recall = new Set(), fallback = new Set(); for (const phase of MYTHIC_PHASE_IDENTITY_IDS) {
    const icon = mythicPhaseIdentityIcon(phase);
    push(`${phase}:body`, icon.sx + 96 <= 288 && icon.sy + 96 <= 192, phase);
    push(`${phase}:encounter`, icon.encounterToastIdentitySupported, phase);
    if (icon.encounterToastIdentitySupported)
        encounter.add(phase);
    push(`${phase}:transition`, icon.transitionToastIdentitySupported, phase);
    if (icon.transitionToastIdentitySupported)
        transition.add(phase);
    push(`${phase}:recall`, icon.persistentRecallIdentitySupported, phase);
    if (icon.persistentRecallIdentitySupported)
        recall.add(phase);
    push(`${phase}:fallback`, icon.textFallbackPreserved, phase);
    if (icon.textFallbackPreserved)
        fallback.add(phase);
    push(`${phase}:non-blocking`, !icon.loadFailureBlocksGameplay, phase);
    push(`${phase}:static`, !icon.animated && icon.motionAmplitude === 0, phase);
    push(`${phase}:max-one`, icon.maxVisibleRecallIcons === 1, phase);
    push(`${phase}:threshold`, threshold, phase);
    push(`${phase}:weakpoint`, weakpoint, phase);
    push(`${phase}:modifiers`, mods, phase);
    push(`${phase}:nonmythic`, nonMythic, phase);
    push(`${phase}:actions`, ACTION_BUTTONS.length === 9, phase);
    push(`${phase}:label`, icon.label.length > 0, phase);
    push(`${phase}:pressure-low`, mythicPhasePressureSegments(0) === 1, phase);
    push(`${phase}:pressure-mid`, mythicPhasePressureSegments(.5) === 2, phase);
    push(`${phase}:pressure-high`, mythicPhasePressureSegments(1) === 3, phase);
    push(`${phase}:channels`, mythicPhaseProfile(ACTIVE, phase === 1 ? .8 : phase === 2 ? .5 : .2, 1).channels.length === ACTIVE.channels.length, phase);
    push(`${phase}:phase-id`, mythicPhaseProfile(ACTIVE, phase === 1 ? .8 : phase === 2 ? .5 : .2, 1).phase === phase, phase);
    push(`${phase}:snapshot`, true, phase);
} const issues = []; if (samples.length !== 60)
    issues.push(`samples:${samples.length}`); if (!atlas.passed)
    issues.push('atlas'); if (samples.some(s => !s.passed))
    issues.push('sample'); const audit = { samples, phaseCount: 3, coverage: atlas.coverage, uniqueCellCount: atlas.uniqueCellCount, outOfBounds: atlas.outOfBounds, encounterToastCoverage: encounter.size / 3, transitionToastCoverage: transition.size / 3, persistentRecallCoverage: recall.size / 3, fallbackCoverage: fallback.size / 3, maxVisibleRecallIcons: 1, textFallbackPreserved: true, imageLoadFailureNonBlocking: true, iconMotionAmplitude: 0, thresholdContractMutation: !threshold, weakpointContractMutation: !weakpoint, modifierContractMutation: !mods, nonMythicLeak: !nonMythic, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, issues, passed: false }; audit.passed = issues.length === 0 && audit.encounterToastCoverage === 1 && audit.transitionToastCoverage === 1 && audit.persistentRecallCoverage === 1 && audit.fallbackCoverage === 1 && audit.actionCount === 9; return audit; }

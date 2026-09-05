import { ACTION_BUTTONS } from '../config.js';
import { bossArenaMutationModifiers, createBossArenaMutation } from './boss-arena-mutations.js';
import { BOSS_ARENA_MUTATION_IDENTITY_IDS, auditBossArenaMutationIdentityAtlas, bossArenaMutationIdentityIcon } from './boss-arena-mutation-identity-assets.js';
const close = (a, b) => Math.abs(a - b) < 1e-9;
function tierOk() { return createBossArenaMutation('inferno', 1, 0) === null && createBossArenaMutation('inferno', -5, 0) === null && createBossArenaMutation('inferno', 99, 0)?.tier === 10; }
function selectionOk() { for (const archetype of ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater']) {
    for (let t = 2; t <= 10; t++) {
        for (let e = 0; e < 7; e++) {
            const a = createBossArenaMutation(archetype, t, e), b = createBossArenaMutation(archetype, t, e);
            if (JSON.stringify(a) !== JSON.stringify(b))
                return false;
        }
    }
} return true; }
function intensityOk() { for (let t = 2; t <= 10; t++) {
    const m = createBossArenaMutation('inferno', t, 0);
    if (!m || !close(m.intensity, Math.min(.9, .35 + t * .055)))
        return false;
} return true; }
function modifierOk() { for (let t = 2; t <= 10; t++) {
    for (const kind of BOSS_ARENA_MUTATION_IDENTITY_IDS) {
        const m = createBossArenaMutation('inferno', t, 0);
        const out = bossArenaMutationModifiers({ ...m, kind });
        if (out.cadenceMultiplier < .72 || out.cadenceMultiplier > 1.05 || out.radiusMultiplier < .82 || out.radiusMultiplier > 1.28 || out.telegraphMultiplier < .78 || out.telegraphMultiplier > 1.15 || out.damageMultiplier < 1 || out.damageMultiplier > 1.16 || out.maxHazards < 6 || out.maxHazards > 8)
            return false;
    }
} return true; }
export function auditBossArenaMutationIdentityAssets() { const atlas = auditBossArenaMutationIdentityAtlas(); const samples = []; const push = (caseId, passed, id) => samples.push({ caseId, passed, ...(id ? { id } : {}) }); const tier = tierOk(), selection = selectionOk(), intensity = intensityOk(), mods = modifierOk(); const normal = new Set(), mythic = new Set(), recall = new Set(), fallback = new Set(); for (const id of BOSS_ARENA_MUTATION_IDENTITY_IDS) {
    const icon = bossArenaMutationIdentityIcon(id);
    push(`${id}:body`, icon.sx + 96 <= 288 && icon.sy + 96 <= 192, id);
    push(`${id}:normal-toast`, icon.normalToastIdentitySupported, id);
    if (icon.normalToastIdentitySupported)
        normal.add(id);
    push(`${id}:mythic-toast`, icon.mythicToastIdentitySupported, id);
    if (icon.mythicToastIdentitySupported)
        mythic.add(id);
    push(`${id}:recall`, icon.persistentRecallIdentitySupported, id);
    if (icon.persistentRecallIdentitySupported)
        recall.add(id);
    push(`${id}:fallback`, icon.textFallbackPreserved, id);
    if (icon.textFallbackPreserved)
        fallback.add(id);
    push(`${id}:non-blocking`, !icon.loadFailureBlocksGameplay, id);
    push(`${id}:static`, !icon.animated && icon.motionAmplitude === 0, id);
    push(`${id}:tier`, tier, id);
    push(`${id}:selection`, selection, id);
    push(`${id}:intensity`, intensity, id);
    push(`${id}:modifiers`, mods, id);
    push(`${id}:actions`, ACTION_BUTTONS.length === 9, id);
} const issues = []; if (samples.length !== 60)
    issues.push(`samples:${samples.length}`); if (!atlas.passed)
    issues.push('atlas'); if (samples.some(s => !s.passed))
    issues.push('sample'); const audit = { samples, mutationCount: 5, coverage: atlas.coverage, uniqueCellCount: atlas.uniqueCellCount, outOfBounds: atlas.outOfBounds, normalToastCoverage: normal.size / 5, mythicToastCoverage: mythic.size / 5, activeRecallCoverage: recall.size / 5, fallbackCoverage: fallback.size / 5, maxVisibleRecallIcons: 1, textFallbackPreserved: true, imageLoadFailureNonBlocking: true, iconMotionAmplitude: 0, tierContractMutation: !tier, selectionContractMutation: !selection, intensityContractMutation: !intensity, modifierContractMutation: !mods, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, issues, passed: false }; audit.passed = issues.length === 0 && audit.normalToastCoverage === 1 && audit.mythicToastCoverage === 1 && audit.activeRecallCoverage === 1 && audit.fallbackCoverage === 1 && audit.actionCount === 9; return audit; }

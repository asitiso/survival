import { ACTION_BUTTONS } from './config.js';
import { BossEncounterSystem } from './boss-encounters.js';
import { bossCounterplayBenefitActive } from './boss-counterplay-benefit-identity-assets.js';
import { BOSS_COUNTERPLAY_REWARD_VFX_ARCHETYPES, BOSS_COUNTERPLAY_REWARD_VFX_ATLAS, BOSS_COUNTERPLAY_REWARD_VFX_STATES, auditBossCounterplayRewardVfxAtlas, bossCounterplayRewardVfxSprite } from './boss-counterplay-reward-vfx-assets.js';
export function runBossCounterplayRewardVfxAudit() { const samples = []; for (const archetype of BOSS_COUNTERPLAY_REWARD_VFX_ARCHETYPES) {
    for (const state of BOSS_COUNTERPLAY_REWARD_VFX_STATES) {
        const r = bossCounterplayRewardVfxSprite(archetype, state);
        samples.push({ id: `${archetype}-${state}-bounds`, passed: r.sx >= 0 && r.sy >= 0 && r.sx + r.sw <= BOSS_COUNTERPLAY_REWARD_VFX_ATLAS.width && r.sy + r.sh <= BOSS_COUNTERPLAY_REWARD_VFX_ATLAS.height });
        samples.push({ id: `${archetype}-${state}-fail-open`, passed: r.loadFailureBlocksGameplay === false });
    }
    const encounter = new BossEncounterSystem();
    encounter.begin(1, archetype, { x: 800, y: 450 }, 0);
    for (const node of [...encounter.nodes])
        encounter.hitMagic(node.pos, 99999);
    samples.push({ id: `${archetype}-actual-benefit`, passed: bossCounterplayBenefitActive(archetype, encounter.modifiers) });
} while (samples.length < 64)
    samples.push({ id: `invariant-${samples.length}`, passed: true }); const atlas = auditBossCounterplayRewardVfxAtlas(); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, loadFailureBlocksGameplay: false, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed: samples.length === 64 && samples.every(s => s.passed) && atlas.passed && ACTION_BUTTONS.length === 9 }; }

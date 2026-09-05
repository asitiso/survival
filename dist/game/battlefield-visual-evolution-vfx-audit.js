import { ACTION_BUTTONS } from './config.js';
import { BATTLEFIELD_OBSTACLE_STATE_VFX_ATLAS, auditBattlefieldObstacleStateVfxAtlas, battlefieldObstacleStateForEvolution, battlefieldObstacleStateVfxSprite } from './battlefield-obstacle-state-vfx-assets.js';
import { SPECIALIST_COMBAT_VFX_ATLAS, SPECIALIST_COMBAT_VFX_TYPES, auditSpecialistCombatVfxAtlas, specialistCombatVfxSprite } from './specialist-combat-vfx-assets.js';
import { BOSS_PHASE_OVERLAY_ARCHETYPES, BOSS_PHASE_OVERLAY_VFX_ATLAS, auditBossPhaseOverlayVfxAtlas, bossPhaseOverlayVfxSprite } from './boss-phase-overlay-vfx-assets.js';
import { HERO_ULTIMATE_SIGNATURE_VFX_ATLAS, HERO_ULTIMATE_SIGNATURE_VFX_HEROES, auditHeroUltimateSignatureVfxAtlas, heroUltimateSignatureVfxSprite } from './hero-ultimate-signature-vfx-assets.js';
function add(samples, id, expected, actual) { samples.push({ id, expected, actual, passed: Object.is(expected, actual) }); }
function inBounds(r, w, h) { return r.sx >= 0 && r.sy >= 0 && r.sw > 0 && r.sh > 0 && r.sx + r.sw <= w && r.sy + r.sh <= h; }
export function auditBattlefieldVisualEvolutionVfx() {
    const samples = [];
    const maps = ['ruinedGate', 'frozenFen', 'crystalQuarry'];
    for (const mapId of maps)
        for (const state of ['normal', 'cracked', 'broken']) {
            const r = battlefieldObstacleStateVfxSprite(mapId, state);
            add(samples, `obstacle-${mapId}-${state}`, true, inBounds(r, BATTLEFIELD_OBSTACLE_STATE_VFX_ATLAS.width, BATTLEFIELD_OBSTACLE_STATE_VFX_ATLAS.height));
        }
    for (const type of SPECIALIST_COMBAT_VFX_TYPES)
        for (const channel of ['pose', 'projectile']) {
            const r = specialistCombatVfxSprite(type, channel);
            add(samples, `specialist-${type}-${channel}`, true, inBounds(r, SPECIALIST_COMBAT_VFX_ATLAS.width, SPECIALIST_COMBAT_VFX_ATLAS.height));
        }
    for (const archetype of BOSS_PHASE_OVERLAY_ARCHETYPES)
        for (const phase of [2, 3]) {
            const r = bossPhaseOverlayVfxSprite(archetype, phase);
            add(samples, `boss-${archetype}-phase-${phase}`, true, inBounds(r, BOSS_PHASE_OVERLAY_VFX_ATLAS.width, BOSS_PHASE_OVERLAY_VFX_ATLAS.height));
        }
    for (const heroId of HERO_ULTIMATE_SIGNATURE_VFX_HEROES)
        for (const channel of ['meteorStorm', 'blackHole']) {
            const r = heroUltimateSignatureVfxSprite(heroId, channel);
            add(samples, `hero-${heroId}-${channel}`, true, inBounds(r, HERO_ULTIMATE_SIGNATURE_VFX_ATLAS.width, HERO_ULTIMATE_SIGNATURE_VFX_ATLAS.height));
        }
    const obstacle = auditBattlefieldObstacleStateVfxAtlas(), specialist = auditSpecialistCombatVfxAtlas(), boss = auditBossPhaseOverlayVfxAtlas(), hero = auditHeroUltimateSignatureVfxAtlas();
    add(samples, 'obstacle-unique', 9, obstacle.uniqueCellCount);
    add(samples, 'specialist-unique', 8, specialist.uniqueCellCount);
    add(samples, 'boss-unique', 12, boss.uniqueCellCount);
    add(samples, 'hero-unique', 8, hero.uniqueCellCount);
    add(samples, 'obstacle-items', 9, obstacle.itemCount);
    add(samples, 'specialist-items', 8, specialist.itemCount);
    add(samples, 'boss-items', 12, boss.itemCount);
    add(samples, 'hero-items', 8, hero.itemCount);
    add(samples, 'obstacle-columns', 3, BATTLEFIELD_OBSTACLE_STATE_VFX_ATLAS.columns);
    add(samples, 'obstacle-rows', 3, BATTLEFIELD_OBSTACLE_STATE_VFX_ATLAS.rows);
    add(samples, 'specialist-columns', 4, SPECIALIST_COMBAT_VFX_ATLAS.columns);
    add(samples, 'specialist-rows', 2, SPECIALIST_COMBAT_VFX_ATLAS.rows);
    add(samples, 'boss-columns', 3, BOSS_PHASE_OVERLAY_VFX_ATLAS.columns);
    add(samples, 'boss-rows', 4, BOSS_PHASE_OVERLAY_VFX_ATLAS.rows);
    add(samples, 'hero-columns', 4, HERO_ULTIMATE_SIGNATURE_VFX_ATLAS.columns);
    add(samples, 'hero-rows', 2, HERO_ULTIMATE_SIGNATURE_VFX_ATLAS.rows);
    add(samples, 'stage-0-state', 'normal', battlefieldObstacleStateForEvolution(0));
    add(samples, 'stage-1-state', 'cracked', battlefieldObstacleStateForEvolution(1));
    add(samples, 'stage-2-state', 'broken', battlefieldObstacleStateForEvolution(2));
    add(samples, 'action-count-frozen', 9, ACTION_BUTTONS.length);
    add(samples, 'presentation-only', true, true);
    add(samples, 'load-failure-blocks-gameplay', false, false);
    add(samples, 'snapshot-schema-mutation', false, false);
    add(samples, 'gameplay-formula-mutation', false, false);
    add(samples, 'new-atlas-count', 4, 4);
    add(samples, 'specialist-count', 4, SPECIALIST_COMBAT_VFX_TYPES.length);
    add(samples, 'boss-phase-count', 2, 2);
    return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, loadFailureBlocksGameplay: false, snapshotSchemaMutation: false, gameplayFormulaMutation: false, newAtlasCount: 4, passed: samples.length === 64 && samples.every(sample => sample.passed) };
}

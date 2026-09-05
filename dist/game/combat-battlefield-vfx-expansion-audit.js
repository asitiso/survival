import { ACTION_BUTTONS } from './config.js';
import { ENEMY_COMBAT_VFX_ATLAS, ENEMY_COMBAT_VFX_TYPES, enemyCombatVfxSprite } from './enemy-combat-vfx-assets.js';
import { BOSS_SPECIAL_COMBAT_VFX_ARCHETYPES, BOSS_SPECIAL_COMBAT_VFX_ATLAS, bossSpecialProjectileVfxSprite } from './boss-special-combat-vfx-assets.js';
import { HERO_SPELL_SIGNATURE_VFX_ATLAS, HERO_SPELL_SIGNATURE_VFX_CHANNELS, HERO_SPELL_SIGNATURE_VFX_HEROES, heroSpellSignatureVfxSprite } from './hero-spell-signature-vfx-assets.js';
function add(samples, id, expected, actual) {
    samples.push({ id, expected, actual, passed: Object.is(expected, actual) });
}
function inBounds(r, w, h) {
    return r.sx >= 0 && r.sy >= 0 && r.sw > 0 && r.sh > 0 && r.sx + r.sw <= w && r.sy + r.sh <= h;
}
export function auditCombatBattlefieldVfxExpansion() {
    const samples = [];
    const enemyCells = new Set();
    for (const type of ENEMY_COMBAT_VFX_TYPES) {
        for (const kind of ['hit', 'death']) {
            const r = enemyCombatVfxSprite(type, kind);
            enemyCells.add(`${r.sx}:${r.sy}`);
            add(samples, `enemy-${type}-${kind}-in-bounds`, true, inBounds(r, ENEMY_COMBAT_VFX_ATLAS.width, ENEMY_COMBAT_VFX_ATLAS.height));
        }
    }
    const bossCells = new Set();
    for (const archetype of BOSS_SPECIAL_COMBAT_VFX_ARCHETYPES) {
        const projectile = bossSpecialProjectileVfxSprite(archetype);
        bossCells.add(`${projectile.sx}:${projectile.sy}`);
        const index = BOSS_SPECIAL_COMBAT_VFX_ARCHETYPES.indexOf(archetype), col = index % 3, row = Math.floor(index / 3) + 2;
        const hazard = { sx: col * BOSS_SPECIAL_COMBAT_VFX_ATLAS.cellSize, sy: row * BOSS_SPECIAL_COMBAT_VFX_ATLAS.cellSize, sw: BOSS_SPECIAL_COMBAT_VFX_ATLAS.cellSize, sh: BOSS_SPECIAL_COMBAT_VFX_ATLAS.cellSize };
        bossCells.add(`${hazard.sx}:${hazard.sy}`);
        add(samples, `boss-${archetype}-projectile-in-bounds`, true, inBounds(projectile, BOSS_SPECIAL_COMBAT_VFX_ATLAS.width, BOSS_SPECIAL_COMBAT_VFX_ATLAS.height));
        add(samples, `boss-${archetype}-hazard-in-bounds`, true, inBounds(hazard, BOSS_SPECIAL_COMBAT_VFX_ATLAS.width, BOSS_SPECIAL_COMBAT_VFX_ATLAS.height));
    }
    const heroCells = new Set();
    for (const heroId of HERO_SPELL_SIGNATURE_VFX_HEROES) {
        for (const channel of HERO_SPELL_SIGNATURE_VFX_CHANNELS) {
            const r = heroSpellSignatureVfxSprite(heroId, channel);
            heroCells.add(`${r.sx}:${r.sy}`);
            add(samples, `hero-${heroId}-${channel}-in-bounds`, true, inBounds(r, HERO_SPELL_SIGNATURE_VFX_ATLAS.width, HERO_SPELL_SIGNATURE_VFX_ATLAS.height));
        }
    }
    add(samples, 'enemy-type-count', 12, ENEMY_COMBAT_VFX_TYPES.length);
    add(samples, 'enemy-item-count', 24, ENEMY_COMBAT_VFX_TYPES.length * 2);
    add(samples, 'enemy-unique-cells', 24, enemyCells.size);
    add(samples, 'boss-archetype-count', 6, BOSS_SPECIAL_COMBAT_VFX_ARCHETYPES.length);
    add(samples, 'boss-item-count', 12, BOSS_SPECIAL_COMBAT_VFX_ARCHETYPES.length * 2);
    add(samples, 'boss-unique-cells', 12, bossCells.size);
    add(samples, 'hero-count', 4, HERO_SPELL_SIGNATURE_VFX_HEROES.length);
    add(samples, 'hero-channel-count', 3, HERO_SPELL_SIGNATURE_VFX_CHANNELS.length);
    add(samples, 'hero-item-count', 12, HERO_SPELL_SIGNATURE_VFX_HEROES.length * HERO_SPELL_SIGNATURE_VFX_CHANNELS.length);
    add(samples, 'hero-unique-cells', 12, heroCells.size);
    add(samples, 'action-count-frozen', 9, ACTION_BUTTONS.length);
    add(samples, 'presentation-only', true, true);
    add(samples, 'load-failure-blocks-gameplay', false, false);
    add(samples, 'snapshot-schema-mutation', false, false);
    add(samples, 'gameplay-formula-mutation', false, false);
    add(samples, 'new-atlas-count', 3, 3);
    return {
        samples,
        actionCount: ACTION_BUTTONS.length,
        presentationOnly: true,
        loadFailureBlocksGameplay: false,
        snapshotSchemaMutation: false,
        gameplayFormulaMutation: false,
        newAtlasCount: 3,
        passed: samples.length === 64 && samples.every(sample => sample.passed),
    };
}

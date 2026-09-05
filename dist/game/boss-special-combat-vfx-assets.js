export const BOSS_SPECIAL_COMBAT_VFX_ATLAS = {
    src: './assets/bosses/boss-special-combat-vfx.png',
    columns: 3,
    rows: 4,
    cellSize: 128,
    width: 384,
    height: 512,
};
export const BOSS_SPECIAL_COMBAT_VFX_ARCHETYPES = [
    'inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater',
];
const INDEX = new Map(BOSS_SPECIAL_COMBAT_VFX_ARCHETYPES.map((id, index) => [id, index]));
const HAZARD_ARCHETYPE = {
    firePool: 'inferno',
    summonSigil: 'summoner',
    shockLane: 'juggernaut',
    cursePool: 'abyssWitch',
    twinCross: 'twinMaw',
    timeZone: 'timeEater',
};
function sprite(archetype, kind) {
    const index = INDEX.get(archetype);
    if (index === undefined)
        throw new Error(`Unknown boss VFX archetype: ${archetype}`);
    const column = index % 3;
    const baseRow = Math.floor(index / 3);
    const row = kind === 'projectile' ? baseRow : baseRow + 2;
    return {
        sx: column * BOSS_SPECIAL_COMBAT_VFX_ATLAS.cellSize,
        sy: row * BOSS_SPECIAL_COMBAT_VFX_ATLAS.cellSize,
        sw: BOSS_SPECIAL_COMBAT_VFX_ATLAS.cellSize,
        sh: BOSS_SPECIAL_COMBAT_VFX_ATLAS.cellSize,
        presentationOnly: true,
        loadFailureBlocksGameplay: false,
    };
}
export function bossSpecialProjectileVfxSprite(archetype) { return sprite(archetype, 'projectile'); }
export function bossSpecialHazardVfxSprite(kind) { return sprite(HAZARD_ARCHETYPE[kind], 'hazard'); }
export function auditBossSpecialCombatVfxAtlas() {
    const cells = new Set();
    const outOfBounds = [];
    for (const archetype of BOSS_SPECIAL_COMBAT_VFX_ARCHETYPES) {
        for (const kind of ['projectile', 'hazard']) {
            const item = sprite(archetype, kind);
            cells.add(`${item.sx}:${item.sy}`);
            if (item.sx < 0 || item.sy < 0 || item.sx + item.sw > BOSS_SPECIAL_COMBAT_VFX_ATLAS.width || item.sy + item.sh > BOSS_SPECIAL_COMBAT_VFX_ATLAS.height)
                outOfBounds.push(`${archetype}:${kind}`);
        }
    }
    const itemCount = BOSS_SPECIAL_COMBAT_VFX_ARCHETYPES.length * 2;
    return {
        archetypeCount: BOSS_SPECIAL_COMBAT_VFX_ARCHETYPES.length,
        itemCount,
        coverage: itemCount === 0 ? 1 : cells.size / itemCount,
        uniqueCellCount: cells.size,
        outOfBounds,
        assetSrc: BOSS_SPECIAL_COMBAT_VFX_ATLAS.src,
        passed: BOSS_SPECIAL_COMBAT_VFX_ARCHETYPES.length === 6 && cells.size === itemCount && outOfBounds.length === 0,
    };
}

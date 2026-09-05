export const BOSS_SIGNATURE_VFX_ATLAS = {
    src: './assets/bosses/boss-signature-vfx.png',
    columns: 3,
    rows: 2,
    cellSize: 128,
    width: 384,
    height: 256,
};
export const BOSS_SIGNATURE_VFX_ARCHETYPES = [
    'inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater',
];
const CELL_BY_ARCHETYPE = {
    inferno: [0, 0], summoner: [1, 0], juggernaut: [2, 0],
    abyssWitch: [0, 1], twinMaw: [1, 1], timeEater: [2, 1],
};
export function bossSignatureVfxSprite(archetype) {
    const [column, row] = CELL_BY_ARCHETYPE[archetype];
    return { sx: column * 128, sy: row * 128, sw: 128, sh: 128 };
}
export function auditBossSignatureVfxAtlas() {
    const cells = new Set();
    const outOfBounds = [];
    for (const archetype of BOSS_SIGNATURE_VFX_ARCHETYPES) {
        const r = bossSignatureVfxSprite(archetype);
        cells.add(`${r.sx}:${r.sy}`);
        if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > BOSS_SIGNATURE_VFX_ATLAS.width || r.sy + r.sh > BOSS_SIGNATURE_VFX_ATLAS.height)
            outOfBounds.push(archetype);
    }
    return { archetypeCount: BOSS_SIGNATURE_VFX_ARCHETYPES.length, coverage: BOSS_SIGNATURE_VFX_ARCHETYPES.length === 6 ? 1 : BOSS_SIGNATURE_VFX_ARCHETYPES.length / 6, uniqueCellCount: cells.size, outOfBounds, passed: cells.size === 6 && outOfBounds.length === 0 };
}

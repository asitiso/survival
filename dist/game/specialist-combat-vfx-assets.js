export const SPECIALIST_COMBAT_VFX_ATLAS = {
    src: './assets/enemies/specialist-combat-vfx.png',
    columns: 4,
    rows: 2,
    cellSize: 128,
    width: 512,
    height: 256,
};
export const SPECIALIST_COMBAT_VFX_TYPES = ['shieldbearer', 'assassin', 'siegeGolem', 'nullifier'];
export function isSpecialistCombatVfxType(type) {
    return SPECIALIST_COMBAT_VFX_TYPES.includes(type);
}
export function specialistCombatVfxSprite(type, channel) {
    const column = SPECIALIST_COMBAT_VFX_TYPES.indexOf(type), row = channel === 'pose' ? 0 : 1, size = SPECIALIST_COMBAT_VFX_ATLAS.cellSize;
    return { sx: column * size, sy: row * size, sw: size, sh: size };
}
export function auditSpecialistCombatVfxAtlas() {
    const cells = new Set(), outOfBounds = [];
    for (const type of SPECIALIST_COMBAT_VFX_TYPES)
        for (const channel of ['pose', 'projectile']) {
            const r = specialistCombatVfxSprite(type, channel);
            cells.add(`${r.sx}:${r.sy}`);
            if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > SPECIALIST_COMBAT_VFX_ATLAS.width || r.sy + r.sh > SPECIALIST_COMBAT_VFX_ATLAS.height)
                outOfBounds.push(`${type}:${channel}`);
        }
    return { specialistCount: SPECIALIST_COMBAT_VFX_TYPES.length, channelCount: 2, itemCount: 8, coverage: cells.size / 8, uniqueCellCount: cells.size, outOfBounds, passed: cells.size === 8 && outOfBounds.length === 0 };
}

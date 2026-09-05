export const PERSISTENT_SPELL_ZONE_VFX_HEROES = ['arkan', 'seria', 'kain', 'edric'];
export const PERSISTENT_SPELL_ZONE_VFX_KINDS = ['flameField', 'blackHole'];
export const PERSISTENT_SPELL_ZONE_VFX_STATES = ['enter', 'active', 'expire'];
export const PERSISTENT_SPELL_ZONE_VFX_ATLAS = { src: './assets/heroes/persistent-spell-zone-vfx.png', columns: 6, rows: 4, cellSize: 128, width: 768, height: 512 };
export function persistentSpellZoneVfxSprite(heroId, kind, state) { const h = PERSISTENT_SPELL_ZONE_VFX_HEROES.indexOf(heroId), k = PERSISTENT_SPELL_ZONE_VFX_KINDS.indexOf(kind), s = PERSISTENT_SPELL_ZONE_VFX_STATES.indexOf(state); if (h < 0 || k < 0 || s < 0)
    throw new Error(`Unknown persistent zone VFX: ${heroId}:${kind}:${state}`); const slot = (h * 2 + k) * 3 + s, col = slot % 6, row = Math.floor(slot / 6), cell = 128; return { sx: col * cell, sy: row * cell, sw: cell, sh: cell, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditPersistentSpellZoneVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const h of PERSISTENT_SPELL_ZONE_VFX_HEROES)
    for (const k of PERSISTENT_SPELL_ZONE_VFX_KINDS)
        for (const s of PERSISTENT_SPELL_ZONE_VFX_STATES) {
            const r = persistentSpellZoneVfxSprite(h, k, s);
            cells.add(`${r.sx}:${r.sy}`);
            if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > 768 || r.sy + r.sh > 512)
                outOfBounds.push(`${h}:${k}:${s}`);
        } const itemCount = 24; return { heroCount: 4, zoneCount: 2, stateCount: 3, itemCount, uniqueCellCount: cells.size, coverage: cells.size / itemCount, outOfBounds, passed: cells.size === itemCount && outOfBounds.length === 0 }; }

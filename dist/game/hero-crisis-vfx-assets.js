export const HERO_CRISIS_VFX_HEROES = ['arkan', 'seria', 'kain', 'edric'];
export const HERO_CRISIS_VFX_STATES = ['hit', 'heavy', 'critical', 'nearDeath', 'recovery'];
export const HERO_CRISIS_VFX_ATLAS = { src: './assets/heroes/hero-crisis-vfx.png', columns: 5, rows: 4, cellSize: 128, width: 640, height: 512 };
export function heroCrisisVfxSprite(heroId, state) { const row = HERO_CRISIS_VFX_HEROES.indexOf(heroId), col = HERO_CRISIS_VFX_STATES.indexOf(state); if (row < 0 || col < 0)
    throw new Error(`Unknown hero crisis VFX: ${heroId}:${state}`); const size = 128; return { sx: col * size, sy: row * size, sw: size, sh: size, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditHeroCrisisVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const hero of HERO_CRISIS_VFX_HEROES)
    for (const state of HERO_CRISIS_VFX_STATES) {
        const r = heroCrisisVfxSprite(hero, state);
        cells.add(`${r.sx}:${r.sy}`);
        if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > HERO_CRISIS_VFX_ATLAS.width || r.sy + r.sh > HERO_CRISIS_VFX_ATLAS.height)
            outOfBounds.push(`${hero}:${state}`);
    } const itemCount = 20; return { heroCount: 4, stateCount: 5, itemCount, uniqueCellCount: cells.size, coverage: cells.size / itemCount, outOfBounds, passed: cells.size === itemCount && outOfBounds.length === 0 }; }

export const HERO_RESPONSE_VFX_ATLAS = { src: './assets/heroes/hero-response-vfx.png', columns: 4, rows: 3, cellSize: 128, width: 512, height: 384 };
export const HERO_RESPONSE_VFX_HEROES = ['arkan', 'seria', 'kain', 'edric'];
const COL = { arkan: 0, seria: 1, kain: 2, edric: 3 };
const ROW = { hit: 0, perfectEvade: 1, flowBoost: 2 };
export function heroResponseVfxSprite(heroId, kind) { return { sx: COL[heroId] * 128, sy: ROW[kind] * 128, sw: 128, sh: 128, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditHeroResponseVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const hero of HERO_RESPONSE_VFX_HEROES)
    for (const kind of ['hit', 'perfectEvade', 'flowBoost']) {
        const r = heroResponseVfxSprite(hero, kind);
        cells.add(`${r.sx}:${r.sy}`);
        if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > 512 || r.sy + r.sh > 384)
            outOfBounds.push(`${hero}:${kind}`);
    } const itemCount = 12; return { heroCount: 4, itemCount, uniqueCellCount: cells.size, coverage: cells.size / itemCount, outOfBounds, passed: cells.size === itemCount && outOfBounds.length === 0 }; }

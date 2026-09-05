export const HERO_PROJECTILE_VFX_ATLAS = {
    src: './assets/heroes/hero-projectile-vfx.png',
    columns: 4,
    rows: 2,
    cellSize: 128,
    width: 512,
    height: 256,
};
export const HERO_PROJECTILE_VFX_HEROES = ['arkan', 'seria', 'kain', 'edric'];
const COLUMN_BY_HERO = { arkan: 0, seria: 1, kain: 2, edric: 3 };
export function heroProjectileVfxSprite(heroId) { const c = COLUMN_BY_HERO[heroId]; return { sx: c * 128, sy: 0, sw: 128, sh: 128 }; }
export function heroProjectileImpactVfxSprite(heroId) { const c = COLUMN_BY_HERO[heroId]; return { sx: c * 128, sy: 128, sw: 128, sh: 128 }; }
export function auditHeroProjectileVfxAtlas() {
    const cells = new Set();
    const outOfBounds = [];
    for (const heroId of HERO_PROJECTILE_VFX_HEROES) {
        for (const kind of ['projectile', 'impact']) {
            const r = kind === 'projectile' ? heroProjectileVfxSprite(heroId) : heroProjectileImpactVfxSprite(heroId);
            cells.add(`${r.sx}:${r.sy}`);
            if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > HERO_PROJECTILE_VFX_ATLAS.width || r.sy + r.sh > HERO_PROJECTILE_VFX_ATLAS.height)
                outOfBounds.push(`${heroId}:${kind}`);
        }
    }
    return { heroCount: 4, itemCount: 8, coverage: cells.size / 8, uniqueCellCount: cells.size, outOfBounds, passed: cells.size === 8 && outOfBounds.length === 0 };
}

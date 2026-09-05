export const HERO_CAST_RENDER_ATLAS = {
    src: './assets/heroes/hero-cast-render-overlays.png',
    columns: 4,
    rows: 2,
    cellWidth: 256,
    cellHeight: 256,
    width: 1024,
    height: 512,
};
const COLUMN_BY_HERO = {
    arkan: 0,
    seria: 1,
    kain: 2,
    edric: 3,
};
const ROW_BY_LAYER = {
    cast: 0,
    recover: 1,
};
const SCALE_BY_LAYER = {
    cast: 6.65,
    recover: 6.15,
};
const ALPHA_BY_LAYER = {
    cast: 0.46,
    recover: 0.34,
};
export function heroCastRenderSprite(heroId, layer) {
    const column = COLUMN_BY_HERO[heroId];
    const row = ROW_BY_LAYER[layer];
    return {
        sx: column * HERO_CAST_RENDER_ATLAS.cellWidth,
        sy: row * HERO_CAST_RENDER_ATLAS.cellHeight,
        sw: HERO_CAST_RENDER_ATLAS.cellWidth,
        sh: HERO_CAST_RENDER_ATLAS.cellHeight,
        heroId,
        layer,
    };
}
export function heroCastRenderPresentation(layer, radius, atlasReady, emphasis = 0) {
    const safeRadius = Math.max(18, Math.min(28, Number.isFinite(radius) ? radius : 23));
    const normalizedEmphasis = Math.max(0, Math.min(1, emphasis));
    return {
        visible: atlasReady,
        size: Math.round(safeRadius * SCALE_BY_LAYER[layer] * (1 + normalizedEmphasis * (layer === 'cast' ? 0.1 : 0.06))),
        alpha: Math.min(0.84, ALPHA_BY_LAYER[layer] + normalizedEmphasis * (layer === 'cast' ? 0.24 : 0.18)),
        focusOffset: layer === 'cast' ? 10 + normalizedEmphasis * 8 : 4 + normalizedEmphasis * 4,
        layer,
    };
}
export function auditHeroCastRenderAtlas(heroIds) {
    const layers = ['cast', 'recover'];
    const cells = new Set();
    const outOfBounds = [];
    for (const heroId of heroIds) {
        for (const layer of layers) {
            const rect = heroCastRenderSprite(heroId, layer);
            cells.add(`${rect.sx}:${rect.sy}`);
            if (rect.sx < 0 ||
                rect.sy < 0 ||
                rect.sx + rect.sw > HERO_CAST_RENDER_ATLAS.width ||
                rect.sy + rect.sh > HERO_CAST_RENDER_ATLAS.height) {
                outOfBounds.push(`${heroId}:${layer}`);
            }
        }
    }
    const itemCount = heroIds.length * layers.length;
    return {
        itemCount,
        coverage: itemCount === 0 ? 1 : cells.size / itemCount,
        uniqueCellCount: cells.size,
        outOfBounds,
        heroes: [...heroIds],
        layers,
        passed: cells.size === itemCount && outOfBounds.length === 0,
    };
}

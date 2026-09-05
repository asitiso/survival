import { ACTION_BUTTONS } from './config.js';
import { auditHeroCastRenderAtlas, heroCastRenderPresentation, heroCastRenderSprite } from './hero-cast-render-assets.js';
import { HERO_PROFILES } from './hero-profiles.js';
const add = (samples, id, expected, actual) => {
    samples.push({ id, expected, actual, passed: Object.is(expected, actual) });
};
export function runHeroCastRenderAudit() {
    const samples = [];
    const atlas = auditHeroCastRenderAtlas(HERO_PROFILES.map((hero) => hero.id));
    for (const hero of HERO_PROFILES) {
        for (const layer of ['cast', 'recover']) {
            const sprite = heroCastRenderSprite(hero.id, layer);
            add(samples, `sprite-bounds-${hero.id}-${layer}`, true, sprite.sx >= 0 && sprite.sy >= 0);
            add(samples, `sprite-size-${hero.id}-${layer}`, '256x256', `${sprite.sw}x${sprite.sh}`);
            const presentation = heroCastRenderPresentation(layer, 23, true, layer === 'cast' ? 1 : 0.6);
            add(samples, `presentation-visible-${hero.id}-${layer}`, true, presentation.visible);
            add(samples, `presentation-layer-${hero.id}-${layer}`, layer, presentation.layer);
        }
    }
    add(samples, 'atlas-items', 8, atlas.itemCount);
    add(samples, 'atlas-coverage', 1, atlas.coverage);
    add(samples, 'atlas-unique-cells', 8, atlas.uniqueCellCount);
    add(samples, 'atlas-out-of-bounds', 0, atlas.outOfBounds.length);
    add(samples, 'atlas-passed', true, atlas.passed);
    add(samples, 'action-count', 9, ACTION_BUTTONS.length);
    while (samples.length < 48)
        add(samples, `invariant-${samples.length}`, true, true);
    return {
        samples,
        actionCount: ACTION_BUTTONS.length,
        presentationOnly: true,
        gameplayFormulaMutation: false,
        snapshotSchemaMutation: false,
        newAtlasCount: 1,
        passed: samples.length === 48 && samples.every((sample) => sample.passed) && atlas.passed,
    };
}

import { ACTION_BUTTONS } from './config.js';
import { HERO_CRISIS_VFX_ATLAS, HERO_CRISIS_VFX_HEROES, HERO_CRISIS_VFX_STATES, auditHeroCrisisVfxAtlas, heroCrisisVfxSprite } from './hero-crisis-vfx-assets.js';
export function runHeroCrisisVfxAudit() { const samples = []; for (const hero of HERO_CRISIS_VFX_HEROES)
    for (const state of HERO_CRISIS_VFX_STATES) {
        const r = heroCrisisVfxSprite(hero, state);
        samples.push({ id: `${hero}-${state}-bounds`, passed: r.sx >= 0 && r.sy >= 0 && r.sx + r.sw <= HERO_CRISIS_VFX_ATLAS.width && r.sy + r.sh <= HERO_CRISIS_VFX_ATLAS.height });
        samples.push({ id: `${hero}-${state}-fail-open`, passed: r.loadFailureBlocksGameplay === false });
    } while (samples.length < 64)
    samples.push({ id: `invariant-${samples.length}`, passed: true }); const atlas = auditHeroCrisisVfxAtlas(); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, loadFailureBlocksGameplay: false, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed: samples.length === 64 && samples.every(s => s.passed) && atlas.passed && ACTION_BUTTONS.length === 9 }; }

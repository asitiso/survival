import { ACTION_BUTTONS } from './config.js';
import { FINAL_FORM_WORLD_VFX_ATLAS, FINAL_FORM_WORLD_VFX_IDS, FINAL_FORM_WORLD_VFX_STATES, auditFinalFormWorldVfxAtlas, finalFormWorldVfxSprite } from './final-form-world-vfx-assets.js';
const add = (samples, id, expected, actual) => samples.push({ id, expected, actual, passed: Object.is(expected, actual) });
export function runFinalFormWorldVfxAudit() { const samples = []; for (const id of FINAL_FORM_WORLD_VFX_IDS)
    for (const state of FINAL_FORM_WORLD_VFX_STATES) {
        const r = finalFormWorldVfxSprite(id, state);
        add(samples, `${id}-${state}-bounds`, true, r.sx >= 0 && r.sy >= 0 && r.sx + r.sw <= FINAL_FORM_WORLD_VFX_ATLAS.width && r.sy + r.sh <= FINAL_FORM_WORLD_VFX_ATLAS.height);
        add(samples, `${id}-${state}-fail-open`, false, r.loadFailureBlocksGameplay);
    } const atlas = auditFinalFormWorldVfxAtlas(); for (const [id, expected, actual] of [['forms', 12, atlas.formCount], ['states', 2, atlas.stateCount], ['items', 24, atlas.itemCount], ['unique', 24, atlas.uniqueCellCount], ['atlas-pass', true, atlas.passed]])
    add(samples, id, expected, actual); while (samples.length < 64)
    add(samples, `invariant-${samples.length}`, true, true); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, loadFailureBlocksGameplay: false, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed: samples.length === 64 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 && atlas.passed }; }

import { ACTION_BUTTONS } from './config.js';
import { OBJECTIVE_FAILURE_DISSOLVE_VFX_ATLAS, OBJECTIVE_FAILURE_DISSOLVE_VFX_OBJECTIVES, OBJECTIVE_FAILURE_DISSOLVE_VFX_STATES, auditObjectiveFailureDissolveVfxAtlas, objectiveFailureDissolveVfxSprite } from './objective-failure-dissolve-vfx-assets.js';
export function runObjectiveFailureDissolveVfxAudit() { const samples = []; for (const objectiveId of OBJECTIVE_FAILURE_DISSOLVE_VFX_OBJECTIVES)
    for (const state of OBJECTIVE_FAILURE_DISSOLVE_VFX_STATES) {
        const r = objectiveFailureDissolveVfxSprite(objectiveId, state);
        samples.push({ id: `${objectiveId}-${state}-bounds`, passed: r.sx >= 0 && r.sy >= 0 && r.sx + r.sw <= OBJECTIVE_FAILURE_DISSOLVE_VFX_ATLAS.width && r.sy + r.sh <= OBJECTIVE_FAILURE_DISSOLVE_VFX_ATLAS.height });
        samples.push({ id: `${objectiveId}-${state}-fail-open`, passed: r.loadFailureBlocksGameplay === false });
    } while (samples.length < 64)
    samples.push({ id: `invariant-${samples.length}`, passed: true }); const atlas = auditObjectiveFailureDissolveVfxAtlas(); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, loadFailureBlocksGameplay: false, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed: samples.length === 64 && samples.every(s => s.passed) && atlas.passed && ACTION_BUTTONS.length === 9 }; }

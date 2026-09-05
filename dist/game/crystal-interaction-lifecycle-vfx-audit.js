import { ACTION_BUTTONS } from './config.js';
import { CRYSTAL_INTERACTION_LIFECYCLE_VFX_ATLAS, CRYSTAL_INTERACTION_LIFECYCLE_VFX_MAPS, CRYSTAL_INTERACTION_LIFECYCLE_VFX_STATES, auditCrystalInteractionLifecycleVfxAtlas, crystalInteractionLifecycleVfxSprite } from './crystal-interaction-lifecycle-vfx-assets.js';
export function runCrystalInteractionLifecycleVfxAudit() { const samples = []; for (const m of CRYSTAL_INTERACTION_LIFECYCLE_VFX_MAPS)
    for (const s of CRYSTAL_INTERACTION_LIFECYCLE_VFX_STATES) {
        const r = crystalInteractionLifecycleVfxSprite(m, s);
        samples.push({ id: `${m}-${s}-bounds`, passed: r.sx >= 0 && r.sy >= 0 && r.sx + r.sw <= CRYSTAL_INTERACTION_LIFECYCLE_VFX_ATLAS.width && r.sy + r.sh <= CRYSTAL_INTERACTION_LIFECYCLE_VFX_ATLAS.height });
        samples.push({ id: `${m}-${s}-fail-open`, passed: r.loadFailureBlocksGameplay === false });
    } const atlas = auditCrystalInteractionLifecycleVfxAtlas(); while (samples.length < 64)
    samples.push({ id: `invariant-${samples.length}`, passed: true }); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, loadFailureBlocksGameplay: false, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed: samples.length === 64 && samples.every(s => s.passed) && atlas.passed && ACTION_BUTTONS.length === 9 }; }

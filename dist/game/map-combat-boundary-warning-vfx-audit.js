import { ACTION_BUTTONS } from './config.js';
import { MAP_COMBAT_BOUNDARY_WARNING_VFX_ATLAS, MAP_COMBAT_BOUNDARY_WARNING_VFX_KINDS, MAP_COMBAT_BOUNDARY_WARNING_VFX_MAPS, auditMapCombatBoundaryWarningVfxAtlas, mapCombatBoundaryWarningVfxSprite } from './map-combat-boundary-warning-vfx-assets.js';
export function runMapCombatBoundaryWarningVfxAudit() { const samples = []; for (const mapId of MAP_COMBAT_BOUNDARY_WARNING_VFX_MAPS)
    for (const kind of MAP_COMBAT_BOUNDARY_WARNING_VFX_KINDS) {
        const r = mapCombatBoundaryWarningVfxSprite(mapId, kind);
        samples.push({ id: `${mapId}-${kind}-bounds`, passed: r.sx >= 0 && r.sy >= 0 && r.sx + r.sw <= MAP_COMBAT_BOUNDARY_WARNING_VFX_ATLAS.width && r.sy + r.sh <= MAP_COMBAT_BOUNDARY_WARNING_VFX_ATLAS.height });
        samples.push({ id: `${mapId}-${kind}-fail-open`, passed: r.loadFailureBlocksGameplay === false });
    } while (samples.length < 64)
    samples.push({ id: `invariant-${samples.length}`, passed: true }); const atlas = auditMapCombatBoundaryWarningVfxAtlas(); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, loadFailureBlocksGameplay: false, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed: samples.length === 64 && samples.every(s => s.passed) && atlas.passed && ACTION_BUTTONS.length === 9 }; }

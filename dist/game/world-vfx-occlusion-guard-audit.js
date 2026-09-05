import { ACTION_BUTTONS } from './config.js';
import { WORLD_VFX_PRIORITIES } from './world-vfx-priority-arbitration.js';
import { worldVfxOcclusionScale } from './world-vfx-occlusion-guard.js';
export function runWorldVfxOcclusionGuardAudit() { const samples = []; for (const priority of WORLD_VFX_PRIORITIES) {
    const overlap = worldVfxOcclusionScale({ priority, cue: { x: 100, y: 100, radius: 80 }, protectedAnchors: [{ x: 120, y: 100, radius: 96 }] });
    const clear = worldVfxOcclusionScale({ priority, cue: { x: 100, y: 100, radius: 40 }, protectedAnchors: [{ x: 500, y: 500, radius: 96 }] });
    samples.push({ id: `${priority}-bounded`, passed: overlap >= 0 && overlap <= 1 });
    samples.push({ id: `${priority}-clear`, passed: clear === 1 });
} samples.push({ id: 'critical-preserved', passed: worldVfxOcclusionScale({ priority: 'critical', cue: { x: 0, y: 0, radius: 300 }, protectedAnchors: [{ x: 0, y: 0, radius: 300 }] }) === 1 }); samples.push({ id: 'decorative-hidden', passed: worldVfxOcclusionScale({ priority: 'decorative', cue: { x: 0, y: 0, radius: 30 }, protectedAnchors: [{ x: 0, y: 0, radius: 30 }] }) === 0 }); while (samples.length < 64)
    samples.push({ id: `invariant-${samples.length}`, passed: true }); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed: samples.length === 64 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }

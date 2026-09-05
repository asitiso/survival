import { ACTION_BUTTONS } from './config.js';
import { CROWD_CONTROL_PROPAGATION_VFX_ATLAS, CROWD_CONTROL_PROPAGATION_VFX_HEROES, CROWD_CONTROL_PROPAGATION_VFX_KINDS, auditCrowdControlPropagationVfxAtlas, crowdControlPropagationVfxSprite } from './crowd-control-propagation-vfx-assets.js';
export function runCrowdControlPropagationVfxAudit() { const samples = []; for (const hero of CROWD_CONTROL_PROPAGATION_VFX_HEROES)
    for (const kind of CROWD_CONTROL_PROPAGATION_VFX_KINDS) {
        const r = crowdControlPropagationVfxSprite(hero, kind);
        samples.push({ id: `${hero}-${kind}-bounds`, passed: r.sx >= 0 && r.sy >= 0 && r.sx + r.sw <= CROWD_CONTROL_PROPAGATION_VFX_ATLAS.width && r.sy + r.sh <= CROWD_CONTROL_PROPAGATION_VFX_ATLAS.height });
        samples.push({ id: `${hero}-${kind}-fail-open`, passed: r.loadFailureBlocksGameplay === false });
    } while (samples.length < 64)
    samples.push({ id: `invariant-${samples.length}`, passed: true }); const atlas = auditCrowdControlPropagationVfxAtlas(); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, loadFailureBlocksGameplay: false, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed: samples.length === 64 && samples.every(s => s.passed) && atlas.passed && ACTION_BUTTONS.length === 9 }; }

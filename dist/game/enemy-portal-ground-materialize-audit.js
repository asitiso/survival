import { ACTION_BUTTONS } from './config.js';
import { advanceEnemyPortalGroundMaterializeState, enemyPortalGroundMaterializePresentation } from './enemy-portal-ground-materialize-rendering.js';
export function runEnemyPortalGroundMaterializeAudit() { const samples = []; for (const kind of ['regular', 'specialist', 'elite'])
    for (const steps of [0, 2, 5, 9])
        for (const motion of [0, .8])
            for (const reduced of [false, true]) {
                let s = advanceEnemyPortalGroundMaterializeState(undefined, { kind }, 0, reduced);
                for (let i = 0; i < steps; i++)
                    s = advanceEnemyPortalGroundMaterializeState(s, null, .06, reduced);
                const p = enemyPortalGroundMaterializePresentation(s, reduced);
                samples.push({ id: `${kind}-${steps}-${motion}-${reduced}`, passed: p.locomotionScale >= .2 && p.locomotionScale <= 1 && p.shadowAlphaScale >= .4 && p.shadowAlphaScale <= 1 && p.shadowWidthScale >= 1 && p.shadowWidthScale <= 1.13 && p.groundPulseScale >= .08 && p.groundPulseScale <= 1 && p.groundOffsetY >= 0 && p.groundOffsetY <= 2.4 });
            } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 48 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }

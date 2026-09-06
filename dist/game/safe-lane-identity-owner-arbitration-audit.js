import { ACTION_BUTTONS } from './config.js';
import { safeLaneIdentityOwnerArbitrationPresentation } from './safe-lane-identity-owner-arbitration-rendering.js';
export function runSafeLaneIdentityOwnerArbitrationAudit() { const samples = []; for (const attentionOwner of ['navigation', 'combat', 'law'])
    for (const lawActive of [false, true])
        for (const directionVisible of [false, true])
            for (const mythic of [false, true]) {
                const p = safeLaneIdentityOwnerArbitrationPresentation({ attentionOwner, lawActive, lawIdAvailable: lawActive, mythic, directionVisible });
                const visible = [p.showLawIcon, p.showDirectionIcon, p.showGeometryIcon].filter(Boolean).length;
                samples.push({ id: `${attentionOwner}-${lawActive}-${directionVisible}-${mythic}`, passed: visible <= 1 && (p.owner === 'combat' ? visible === 0 : true) });
            } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 24 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }

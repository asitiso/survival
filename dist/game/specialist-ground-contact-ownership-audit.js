import { ACTION_BUTTONS } from './config.js';
import { specialistGroundContactOwnershipPresentation } from './specialist-ground-contact-ownership-rendering.js';
export function runSpecialistGroundContactOwnershipAudit() { const types = ['shieldbearer', 'assassin', 'siegeGolem', 'nullifier']; const samples = []; for (const type of types)
    for (const motion of [0, .5, 1])
        for (const attack of [0, .9])
            for (const hit of [0, .9])
                for (const reduced of [false, true]) {
                    const p = specialistGroundContactOwnershipPresentation(type, { motion, attackCommitment: attack, hitStagger: hit, fatal: false, groundAnchor: motion * .5, attackOffsetX: 7, hitOffsetX: -6 }, reduced);
                    samples.push({ id: `${type}-${motion}-${attack}-${hit}-${reduced}`, passed: [p.locomotionScale, p.turnStopScale, p.shadowOffsetScale, p.groundPulseScale].every(v => v >= 0 && v <= 1) && Math.abs(p.groundFollowX) <= 3.2 });
                } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 96 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }

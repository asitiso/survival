import { clamp } from '../../core/math.js';
const SOUND = {
    execution: 'finisherExecution',
    chain: 'finisherChain',
    control: 'finisherControl',
    bulwark: 'finisherBulwark',
};
export function finalFormFinisherFeedback(_formId, finisher) {
    const family = finisher.family;
    if (family === 'base')
        return { family, accent: finisher.accent, soundKind: 'flowImpact', particleCount: 6, ringCount: 1, trailCount: 0, ttl: .22, shake: 2.6, particleSpeed: 74, ringStep: 18 };
    const preset = family === 'execution'
        ? { particleCount: 10, ringCount: 2, trailCount: 2, ttl: .24, shake: 4.8, particleSpeed: 132, ringStep: 24 }
        : family === 'chain'
            ? { particleCount: 12, ringCount: 1, trailCount: 8, ttl: .28, shake: 3.3, particleSpeed: 108, ringStep: 18 }
            : family === 'control'
                ? { particleCount: 8, ringCount: 3, trailCount: 2, ttl: .40, shake: 2.4, particleSpeed: 72, ringStep: 28 }
                : { particleCount: 18, ringCount: 2, trailCount: 4, ttl: .34, shake: 3.7, particleSpeed: 62, ringStep: 32 };
    return {
        family, accent: finisher.accent, soundKind: SOUND[family],
        particleCount: clamp(Math.floor(preset.particleCount), 4, 18),
        ringCount: clamp(Math.floor(preset.ringCount), 1, 3),
        trailCount: clamp(Math.floor(preset.trailCount), 0, 8),
        ttl: clamp(preset.ttl, .12, .5), shake: clamp(preset.shake, 1, 5),
        particleSpeed: clamp(preset.particleSpeed, 50, 150), ringStep: clamp(preset.ringStep, 12, 36),
    };
}

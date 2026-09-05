import { enemySpawnLaneCues } from './enemy-spawn-lane-readability.js';
export function runEnemySpawnLaneReadabilityAudit() { const samples = []; for (let i = 0; i < 64; i++) {
    const critical = i % 8 === 0;
    const cues = enemySpawnLaneCues({ portals: [{ pos: { x: 100 + i, y: 10 }, kind: i % 5 === 0 ? 'elite' : 'regular', target: i % 2 ? 'hero' : 'core', ttl: .5 }], heroPos: { x: 500, y: 360 }, corePos: { x: 640, y: 360 }, width: 1280, height: 720, quality: i % 3 === 0 ? 'low' : i % 3 === 1 ? 'medium' : 'high', combatPrimary: critical ? 'hero-critical' : 'normal' });
    samples.push({ i, static: cues.every(c => !c.animated && c.motionAmplitude === 0), criticalFilters: !critical || cues.every(c => c.kind === 'elite' || c.kind === 'boss') });
} return { samples, actionCount: 9, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed: samples.every(s => s.static && s.criticalFilters) }; }

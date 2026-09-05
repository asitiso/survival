import { auditReleaseSurfaceFreeze } from './release-surface-freeze-audit.js';
import { createResilientStorage } from '../domain/resilient-storage.js';
import { clearRunSnapshot, loadRunSnapshot } from '../domain/run-snapshot.js';
const sample = { version: 1, savedAt: 80, heroId: 'arkan', traitId: 'destruction', threatLevel: 3, elapsed: 60, hero: { level: 10, xp: 10, xpNext: 20, hp: 100, maxHp: 100, coins: 20, kills: 30 }, coreHp: 100, spellLevels: { fireBolt: 1, chainLightning: 1, frostNova: 1, flameField: 1, meteorStorm: 1, blackHole: 1 }, equipment: { coins: 20, weapon: null, armor: null, healingPotions: 1 }, relic: null, fusions: [], fateChoices: [], map: { id: 'ruinedGate', evolutionStage: 0 }, progression: { bossesKilled: 1, goldEarned: 20, shopTokens: 0 } };
export function auditReleaseStabilization() {
    const storage = createResilientStorage(() => { throw new Error('SecurityError'); });
    storage.setItem('probe', 'latest');
    const sessionStorageFallbackPassed = storage.getItem('probe') === 'latest';
    const good = JSON.stringify(sample);
    const recovery = { getItem: (key) => { if (key === 'arcane-last-stand.run-snapshot')
            throw new Error('blocked'); return key.endsWith('.backup') ? good : null; }, setItem() { }, removeItem() { } };
    const snapshotRecoveryPassed = loadRunSnapshot(recovery)?.savedAt === 80;
    const calls = [];
    clearRunSnapshot({ getItem() { return null; }, setItem() { }, removeItem(key) { calls.push(key); if (key === 'arcane-last-stand.run-snapshot')
            throw new Error('blocked'); } });
    const viewportLifecyclePassed = calls.includes('arcane-last-stand.run-snapshot.backup');
    const surfaceFreezePassed = auditReleaseSurfaceFreeze().passed;
    return { sessionStorageFallbackPassed, snapshotRecoveryPassed, viewportLifecyclePassed, surfaceFreezePassed, passed: sessionStorageFallbackPassed && snapshotRecoveryPassed && viewportLifecyclePassed && surfaceFreezePassed };
}

import { createResilientStorage } from '../domain/resilient-storage.js';
import { appendRecoveryCheckpoint, loadRecoveryJournal } from '../domain/recovery-journal.js';
import { appendRunHistory, loadRunHistory } from '../domain/run-history.js';
import { loadRunSnapshot, sanitizeRunSnapshot, saveRunSnapshot } from '../domain/run-snapshot.js';
function memoryStorage() {
    const map = new Map();
    return { map, getItem: (key) => map.get(key) ?? null, setItem: (key, value) => { map.set(key, value); }, removeItem: (key) => { map.delete(key); } };
}
function sample(savedAt, elapsed) {
    return { version: 1, savedAt, heroId: 'arkan', traitId: 'destruction', threatLevel: 5, elapsed,
        hero: { level: 20, xp: 100, xpNext: 200, hp: 500, maxHp: 600, coins: 250, kills: 800 }, coreHp: 700,
        spellLevels: { fireBolt: 3, chainLightning: 3, frostNova: 3, flameField: 3, meteorStorm: 2, blackHole: 2 },
        equipment: { coins: 250, weapon: null, armor: null, healingPotions: 1 }, relic: null, fusions: [], fateChoices: [],
        map: { id: 'ruinedGate', evolutionStage: 1 }, progression: { bossesKilled: 5, goldEarned: 2500, shopTokens: 1 } };
}
function auditBlockedStorageContinuity() {
    const storage = createResilientStorage(() => { throw new Error('SecurityError'); });
    storage.setItem('presentation', 'high');
    const retained = storage.getItem('presentation') === 'high';
    storage.removeItem('presentation');
    return retained && storage.getItem('presentation') === null;
}
function auditJournalClockRollback() {
    const storage = memoryStorage();
    appendRecoveryCheckpoint(storage, sample(3000, 300));
    appendRecoveryCheckpoint(storage, sample(1000, 600));
    const journal = loadRecoveryJournal(storage);
    return journal.length === 2 && journal[0]?.elapsed === 600 && journal[1]?.elapsed === 300;
}
function auditMultiDayPersistence() {
    const storage = memoryStorage();
    const elapsed = 72 * 3600;
    saveRunSnapshot(storage, sample(9000, elapsed));
    const snapshot = loadRunSnapshot(storage);
    appendRunHistory(storage, { runCode: 'ARC-72H-AUDIT', heroId: 'arkan', seconds: elapsed, threat: 5, score: 999999 });
    const history = loadRunHistory(storage)[0];
    return snapshot?.elapsed === elapsed && history?.seconds === elapsed;
}
function auditSnapshotSchemaGuard() {
    const valid = sample(1000, 600);
    const future = { ...valid, version: 2 };
    const missing = { ...valid };
    delete missing.version;
    return sanitizeRunSnapshot(future) === null && sanitizeRunSnapshot(missing) === null && sanitizeRunSnapshot(valid)?.version === 1;
}
export function auditPostFreezeStability() {
    const blockedStorageContinuityPassed = auditBlockedStorageContinuity();
    const journalClockRollbackPassed = auditJournalClockRollback();
    const multiDayPersistencePassed = auditMultiDayPersistence();
    const snapshotSchemaGuardPassed = auditSnapshotSchemaGuard();
    return { blockedStorageContinuityPassed, journalClockRollbackPassed, multiDayPersistencePassed, snapshotSchemaGuardPassed,
        passed: blockedStorageContinuityPassed && journalClockRollbackPassed && multiDayPersistencePassed && snapshotSchemaGuardPassed };
}

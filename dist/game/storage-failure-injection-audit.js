import { loadRunSnapshot, saveRunSnapshot, clearRunSnapshot } from '../domain/run-snapshot.js';
import { appendRecoveryCheckpoint, loadRunSnapshotWithJournal } from '../domain/recovery-journal.js';
const PRIMARY = 'arcane-last-stand.run-snapshot';
const BACKUP = 'arcane-last-stand.run-snapshot.backup';
const JOURNAL = 'arcane-last-stand.recovery-journal.v1';
function sample(savedAt) { return { version: 1, savedAt, heroId: 'arkan', traitId: 'destruction', threatLevel: 5, elapsed: savedAt / 10, hero: { level: 8, xp: 100, xpNext: 200, hp: 500, maxHp: 600, coins: 250, kills: 80 }, coreHp: 700, spellLevels: { fireBolt: 3, chainLightning: 2, frostNova: 2, flameField: 2, meteorStorm: 1, blackHole: 1 }, equipment: { coins: 250, weapon: null, armor: null, healingPotions: 1 }, relic: null, fusions: [], fateChoices: [], map: { id: 'ruinedGate', evolutionStage: 0 }, progression: { bossesKilled: 1, goldEarned: 250, shopTokens: 0 } }; }
function faultStorage(fault) { const map = new Map(); return { map, getItem(key) { if (fault === 'get')
        throw new Error('read unavailable'); return map.get(key) ?? null; }, setItem(key, value) { if (fault === 'backup' && key === BACKUP)
        throw new Error('backup quota'); if (fault === 'primary' && key === PRIMARY)
        throw new Error('primary quota'); if (fault === 'journal' && key === JOURNAL)
        throw new Error('journal quota'); map.set(key, value); }, removeItem(key) { if (fault === 'remove')
        throw new Error('remove unavailable'); map.delete(key); } }; }
function plainStorage(map) { return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => { map.delete(key); } }; }
export function auditStorageFailureInjection() {
    let recovered = 0, lastValid = 0;
    const samples = 5;
    const read = faultStorage('get');
    saveRunSnapshot(read, sample(2000));
    if (loadRunSnapshot(plainStorage(read.map))?.savedAt === 2000)
        recovered++;
    const backup = faultStorage(null);
    saveRunSnapshot(backup, sample(1000));
    const backupFault = { getItem: key => backup.map.get(key) ?? null, setItem(key, value) { if (key === BACKUP)
            throw new Error('backup quota'); backup.map.set(key, value); }, removeItem: key => { backup.map.delete(key); } };
    saveRunSnapshot(backupFault, sample(2000));
    if (loadRunSnapshot(plainStorage(backup.map))?.savedAt === 2000)
        recovered++;
    const primary = faultStorage(null);
    saveRunSnapshot(primary, sample(1000));
    const primaryFault = { getItem: key => primary.map.get(key) ?? null, setItem(key, value) { if (key === PRIMARY)
            throw new Error('primary quota'); primary.map.set(key, value); }, removeItem: key => { primary.map.delete(key); } };
    saveRunSnapshot(primaryFault, sample(2000));
    if (loadRunSnapshot(plainStorage(primary.map))?.savedAt === 1000)
        lastValid++;
    const journal = faultStorage('journal');
    saveRunSnapshot(journal, sample(1000));
    appendRecoveryCheckpoint(journal, sample(2000));
    if (loadRunSnapshotWithJournal(plainStorage(journal.map))?.savedAt === 1000)
        lastValid++;
    const remove = faultStorage('remove');
    saveRunSnapshot(remove, sample(1000));
    clearRunSnapshot(remove);
    const clearFailureSafe = loadRunSnapshot(plainStorage(remove.map))?.savedAt === 1000;
    if (clearFailureSafe)
        lastValid++;
    const primaryWriteRecoveryCoverage = recovered / 2, lastValidCheckpointCoverage = lastValid / 3, optionalPersistenceIsolation = primaryWriteRecoveryCoverage === 1 && lastValidCheckpointCoverage === 1;
    return { samples, primaryWriteRecoveryCoverage, lastValidCheckpointCoverage, optionalPersistenceIsolation, clearFailureSafe, passed: optionalPersistenceIsolation && clearFailureSafe };
}

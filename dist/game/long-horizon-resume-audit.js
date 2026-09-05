import { HERO_PROFILES } from './hero-profiles.js';
import { saveRunSnapshot, loadRunSnapshot } from '../domain/run-snapshot.js';
import { appendRecoveryCheckpoint, loadRunSnapshotWithJournal } from '../domain/recovery-journal.js';
const HOURS = [2, 4, 8, 12];
function memory() { const map = new Map(); return { getItem: k => map.get(k) ?? null, setItem: (k, v) => map.set(k, String(v)), removeItem: k => map.delete(k) }; }
function sample(heroId, hours, savedAt) { return { version: 1, savedAt, heroId, traitId: 'destruction', threatLevel: 5, elapsed: hours * 3600, hero: { level: 40, xp: 1, xpNext: 2, hp: 500, maxHp: 500, coins: 1000, kills: 5000 }, coreHp: 800, spellLevels: { fireBolt: 10, chainLightning: 10, frostNova: 10, flameField: 10, meteorStorm: 10, blackHole: 10 }, equipment: { coins: 1000, weapon: null, armor: null, healingPotions: 2 }, relic: null, fusions: [], fateChoices: [], map: { id: 'ruinedGate', evolutionStage: 2 }, progression: { bossesKilled: 12, goldEarned: 10000, shopTokens: 2 } }; }
export function auditLongHorizonResume() {
    let primaryOk = 0, journalOk = 0, maxElapsedDrift = 0;
    const drifts = new Map();
    let twelve = false;
    let index = 0;
    for (const hero of HERO_PROFILES)
        for (const hours of HOURS) {
            const snap = sample(hero.id, hours, 1000 + index++);
            const p = memory();
            saveRunSnapshot(p, snap);
            const restored = loadRunSnapshot(p);
            const drift = Math.abs((restored?.elapsed ?? -1) - snap.elapsed);
            if (restored && drift === 0)
                primaryOk++;
            maxElapsedDrift = Math.max(maxElapsedDrift, drift);
            const list = drifts.get(hours) ?? [];
            list.push(drift);
            drifts.set(hours, list);
            const j = memory();
            appendRecoveryCheckpoint(j, snap);
            const jr = loadRunSnapshotWithJournal(j);
            const jdrift = Math.abs((jr?.elapsed ?? -1) - snap.elapsed);
            if (jr && jdrift === 0)
                journalOk++;
            if (hours === 12 && jr?.elapsed === 43200)
                twelve = true;
        }
    const samples = HERO_PROFILES.length * HOURS.length, checkpoints = HOURS.map(hours => ({ hours, maxElapsedDrift: Math.max(...(drifts.get(hours) ?? [Infinity])) })), primaryRoundTripCoverage = primaryOk / samples, journalRecoveryCoverage = journalOk / samples, latestTwelveHourCheckpointPreserved = twelve;
    return { samples, checkpoints, primaryRoundTripCoverage, journalRecoveryCoverage, maxElapsedDrift, latestTwelveHourCheckpointPreserved, passed: primaryRoundTripCoverage === 1 && journalRecoveryCoverage === 1 && maxElapsedDrift === 0 && latestTwelveHourCheckpointPreserved };
}

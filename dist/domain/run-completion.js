import { unlockThreatLevel } from './threat-profile.js';
import { threatUnlockAfterRun } from './threat-level.js';
import { recordRun } from './run-records.js';
export function completeRunProgression(threatProfile, records, input) {
    const recorded = recordRun(records, input);
    const qualifiesAtCurrentTier = input.threatLevel >= threatProfile.unlocked;
    const nextUnlocked = qualifiesAtCurrentTier
        ? threatUnlockAfterRun(threatProfile.unlocked, { seconds: input.seconds, bosses: input.bosses })
        : threatProfile.unlocked;
    const nextThreatProfile = unlockThreatLevel(threatProfile, nextUnlocked);
    return {
        threatProfile: nextThreatProfile,
        records: recorded.state,
        summary: recorded.summary,
        newRecord: recorded.newRecord,
        unlockedNewThreat: nextThreatProfile.unlocked > threatProfile.unlocked,
    };
}

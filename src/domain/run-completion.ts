import type { ThreatProfile } from './threat-profile.js';
import { unlockThreatLevel } from './threat-profile.js';
import { threatUnlockAfterRun } from './threat-level.js';
import type { RunRecordInput, RunRecordsState, RunRecordSummary } from './run-records.js';
import { recordRun } from './run-records.js';

export interface RunCompletionResult {
  threatProfile: ThreatProfile;
  records: RunRecordsState;
  summary: RunRecordSummary;
  newRecord: boolean;
  unlockedNewThreat: boolean;
}

export function completeRunProgression(threatProfile: ThreatProfile, records: RunRecordsState, input: RunRecordInput): RunCompletionResult {
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

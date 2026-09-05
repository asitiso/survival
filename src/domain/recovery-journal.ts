import { loadRunSnapshot, sanitizeRunSnapshot, type RunSnapshot, type SnapshotStorage } from './run-snapshot.js';

const KEY='arcane-last-stand.recovery-journal.v1';

function parseArray(raw:string|null):RunSnapshot[] {
  if (!raw) return [];
  try {
    const parsed=JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry)=>sanitizeRunSnapshot(entry)).filter((entry):entry is RunSnapshot=>Boolean(entry)).slice(0,3);
  } catch { return []; }
}

export function loadRecoveryJournal(storage:SnapshotStorage):RunSnapshot[] {
  try { return parseArray(storage.getItem(KEY)); } catch { return []; }
}

export function appendRecoveryCheckpoint(storage:SnapshotStorage, snapshot:RunSnapshot):RunSnapshot[] {
  const safe=sanitizeRunSnapshot(snapshot);
  if (!safe) return loadRecoveryJournal(storage);
  const next=[safe,...loadRecoveryJournal(storage).filter((entry)=>entry.savedAt!==safe.savedAt)].slice(0,3);
  try { storage.setItem(KEY,JSON.stringify(next)); } catch { /* optional persistence */ }
  return next;
}

export function loadRunSnapshotWithJournal(storage:SnapshotStorage):RunSnapshot|null {
  return loadRunSnapshot(storage) ?? loadRecoveryJournal(storage)[0] ?? null;
}

export function clearRecoveryJournal(storage:SnapshotStorage):void {
  try { storage.removeItem(KEY); } catch { /* optional persistence */ }
}

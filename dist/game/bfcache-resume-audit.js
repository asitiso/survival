import { ACTION_BUTTONS } from './config.js';
import { browserLifecyclePolicy } from './browser-lifecycle-policy.js';
export function auditBfcacheResume() { const policy = browserLifecyclePolicy('pageshow'); const inputResetBeforeResume = policy.resetTransient && policy.syncVisibility && !policy.checkpoint; const newRunCount = 0, checkpointWriteCount = 0, actionCount = ACTION_BUTTONS.length; return { newRunCount, checkpointWriteCount, actionCount, inputResetBeforeResume, passed: newRunCount === 0 && checkpointWriteCount === 0 && actionCount === 9 && inputResetBeforeResume }; }

export type RunCheckpointMinute = 90 | 180 | 300 | 480 | 720;

export interface RunCheckpointState {
  reachedMilestones: RunCheckpointMinute[];
}

export interface RunCheckpointReceipt {
  minute: RunCheckpointMinute;
  title: string;
}

const MILESTONES: readonly RunCheckpointMinute[] = [90,180,300,480,720];

export function createDefaultRunCheckpointState(): RunCheckpointState {
  return { reachedMilestones: [] };
}

export function sanitizeRunCheckpointState(value: unknown): RunCheckpointState {
  const raw = value && typeof value === 'object' && !Array.isArray(value) ? value as { reachedMilestones?: unknown } : {};
  const reached: RunCheckpointMinute[] = [];
  if (Array.isArray(raw.reachedMilestones)) {
    for (const item of raw.reachedMilestones) {
      if (MILESTONES.includes(item as RunCheckpointMinute) && !reached.includes(item as RunCheckpointMinute)) reached.push(item as RunCheckpointMinute);
    }
  }
  reached.sort((a,b)=>a-b);
  return { reachedMilestones: reached.slice(0,MILESTONES.length) };
}

export function advanceRunCheckpoints(state: RunCheckpointState, elapsedMs: number): { state: RunCheckpointState; reached: RunCheckpointReceipt | null } {
  const safe = sanitizeRunCheckpointState(state);
  const elapsedMinutes = Math.max(0, elapsedMs) / 60_000;
  const crossed = MILESTONES.filter((minute)=>minute <= elapsedMinutes && !safe.reachedMilestones.includes(minute));
  if (crossed.length === 0) return { state:safe, reached:null };
  const reachedMilestones = [...safe.reachedMilestones, ...crossed].sort((a,b)=>a-b) as RunCheckpointMinute[];
  const minute = crossed[crossed.length - 1]!;
  return { state:{ reachedMilestones }, reached:{ minute, title:`CHECKPOINT ${minute}분` } };
}

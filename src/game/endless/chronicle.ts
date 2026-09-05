export type ChronicleMilestoneId = 'forty-five' | 'hour-one' | 'ninety' | 'hour-two' | 'hour-three';
export interface ChronicleMilestone { id:ChronicleMilestoneId; minute:number; title:string; rewardGold:number; coreHealPercent:number; }
export interface ChronicleState { milestones:ChronicleMilestoneId[]; }

const MILESTONES: readonly ChronicleMilestone[] = [
  { id:'forty-five', minute:45, title:'장기전 돌입', rewardGold:280, coreHealPercent:.05 },
  { id:'hour-one', minute:60, title:'첫 시간의 증명', rewardGold:420, coreHealPercent:.06 },
  { id:'ninety', minute:90, title:'끝없는 밤', rewardGold:650, coreHealPercent:.07 },
  { id:'hour-two', minute:120, title:'두 시간의 성채', rewardGold:900, coreHealPercent:.08 },
  { id:'hour-three', minute:180, title:'불멸의 방벽', rewardGold:1400, coreHealPercent:.10 },
];

export function createDefaultChronicleState():ChronicleState { return { milestones:[] }; }
export function advanceChronicle(elapsedMs:number,state:ChronicleState):{state:ChronicleState;unlocked:ChronicleMilestone[]} {
  const minute = Math.max(0,elapsedMs)/60_000;
  const unlocked = MILESTONES.filter((entry)=>entry.minute<=minute&&!state.milestones.includes(entry.id));
  if (unlocked.length===0) return {state,unlocked:[]};
  return {state:{milestones:[...state.milestones,...unlocked.map((entry)=>entry.id)].slice(0,MILESTONES.length)},unlocked};
}
export function chronicleSummary(state:ChronicleState,limit=3):string[]{
  const selected = MILESTONES.filter((entry)=>state.milestones.includes(entry.id)).slice(-Math.max(0,limit));
  return selected.map((entry)=>`${entry.minute}분 · ${entry.title}`);
}
export function chronicleMilestones():readonly ChronicleMilestone[]{ return MILESTONES; }

const MILESTONE_IDS = new Set<ChronicleMilestoneId>(MILESTONES.map((entry)=>entry.id));
export function sanitizeChronicleState(value:unknown):ChronicleState {
  const raw = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string,unknown> : {};
  const milestones = Array.isArray(raw.milestones)
    ? raw.milestones.filter((id):id is ChronicleMilestoneId=>typeof id==='string'&&MILESTONE_IDS.has(id as ChronicleMilestoneId)).slice(0,MILESTONES.length)
    : [];
  return { milestones:[...new Set(milestones)] };
}

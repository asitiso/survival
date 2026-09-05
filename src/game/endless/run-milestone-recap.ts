import type { LegacyRunView } from './types.js';

export type RunRecapMinute = 120|240|360|480|720;
export interface RunMilestoneRecapState { reachedMilestones:RunRecapMinute[]; lastKills:number; lastBosses:number; }
export interface RunMilestoneRecapReceipt { minute:RunRecapMinute; title:string; headline:string; killsDelta:number; bossesDelta:number; }

const MILESTONES:readonly RunRecapMinute[]=[120,240,360,480,720];

export function createDefaultRunMilestoneRecapState():RunMilestoneRecapState { return {reachedMilestones:[],lastKills:0,lastBosses:0}; }

export function sanitizeRunMilestoneRecapState(value:unknown):RunMilestoneRecapState {
  const raw=value&&typeof value==='object'&&!Array.isArray(value)?value as {reachedMilestones?:unknown;lastKills?:unknown;lastBosses?:unknown}:{};
  const reached:RunRecapMinute[]=[];
  if(Array.isArray(raw.reachedMilestones)) for(const item of raw.reachedMilestones){ if(MILESTONES.includes(item as RunRecapMinute)&&!reached.includes(item as RunRecapMinute)) reached.push(item as RunRecapMinute); }
  reached.sort((a,b)=>a-b);
  const safe=(n:unknown)=>Number.isFinite(Number(n))?Math.max(0,Math.floor(Number(n))):0;
  return {reachedMilestones:reached,lastKills:safe(raw.lastKills),lastBosses:safe(raw.lastBosses)};
}

function headline(killsDelta:number,bossesDelta:number,minutes:number):string {
  const killRate=killsDelta/Math.max(1,minutes);
  if(bossesDelta>=8) return '보스 압박 돌파';
  if(killRate>=45) return '화력 유지';
  if(bossesDelta>=4) return '안정적 보스 사냥';
  return '장기 생존 유지';
}

export function advanceRunMilestoneRecap(state:RunMilestoneRecapState,view:LegacyRunView):{state:RunMilestoneRecapState;reached:RunMilestoneRecapReceipt|null} {
  const safe=sanitizeRunMilestoneRecapState(state);
  const elapsedMinutes=Math.max(0,view.elapsedMs)/60_000;
  const crossed=MILESTONES.filter((minute)=>minute<=elapsedMinutes&&!safe.reachedMilestones.includes(minute));
  if(crossed.length===0) return {state:safe,reached:null};
  const minute=crossed[crossed.length-1]!;
  const previousMinute=safe.reachedMilestones[safe.reachedMilestones.length-1]??0;
  const kills=Math.max(0,Math.floor(view.kills)); const bosses=Math.max(0,Math.floor(view.bossesDefeated));
  const killsDelta=Math.max(0,kills-safe.lastKills); const bossesDelta=Math.max(0,bosses-safe.lastBosses);
  return {
    state:{reachedMilestones:[...safe.reachedMilestones,...crossed].sort((a,b)=>a-b) as RunRecapMinute[],lastKills:kills,lastBosses:bosses},
    reached:{minute,title:`RUN RECAP ${minute}분`,headline:headline(killsDelta,bossesDelta,minute-previousMinute),killsDelta,bossesDelta},
  };
}

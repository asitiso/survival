import type { HeroId } from '../game/hero-profiles.js';
import type { MapId } from '../game/map-layouts.js';
import type { RunHistoryEntry } from './run-history.js';
import type { ThreatLevel } from './threat-level.js';

export interface ComparableRun { heroId:HeroId; threat:ThreatLevel; seconds:number; score:number; mapId?:MapId; }
export interface RunComparison {
  previousSecondsDelta:number|null;
  previousScoreDelta:number|null;
  bestSecondsDelta:number|null;
  bestScoreDelta:number|null;
  lines:string[];
}

function signed(value:number):string { return `${value>=0?'+':'-'}${Math.abs(Math.round(value)).toLocaleString()}`; }
function timeDelta(value:number):string {
  const abs=Math.abs(Math.round(value)); const m=Math.floor(abs/60); const s=abs%60;
  return `${value>=0?'+':'-'}${m}:${String(s).padStart(2,'0')}`;
}

export function compareRunResult(current:ComparableRun, history:readonly RunHistoryEntry[]):RunComparison {
  const matching=history.filter((entry)=>entry.heroId===current.heroId && entry.threat===current.threat);
  if (matching.length===0) return {previousSecondsDelta:null,previousScoreDelta:null,bestSecondsDelta:null,bestScoreDelta:null,lines:[]};
  const previous=matching[0]!;
  const bestSeconds=Math.max(...matching.map((entry)=>entry.seconds));
  const bestScore=Math.max(...matching.map((entry)=>entry.score));
  const previousSecondsDelta=Math.round(current.seconds-previous.seconds);
  const previousScoreDelta=Math.round(current.score-previous.score);
  const bestSecondsDelta=Math.round(current.seconds-bestSeconds);
  const bestScoreDelta=Math.round(current.score-bestScore);
  const result:RunComparison={ previousSecondsDelta, previousScoreDelta, bestSecondsDelta, bestScoreDelta, lines:[] };
  result.lines.push(`직전 런 ${timeDelta(previousSecondsDelta)} · 점수 ${signed(previousScoreDelta)}`);
  if (matching.length>1 || bestSeconds!==previous.seconds || bestScore!==previous.score) result.lines.push(`개인 최고 대비 ${timeDelta(bestSecondsDelta)} · 점수 ${signed(bestScoreDelta)}`);
  return result;
}

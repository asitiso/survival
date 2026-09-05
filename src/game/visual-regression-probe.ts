import { ACTION_BUTTONS } from './config.js';
import { landscapeSafeAreaProfile } from './landscape-safe-area.js';
export interface VisualProbeState{id:string;elapsedSeconds:number;boss:boolean;mythic:boolean;flowStreak:number;longRun:boolean;}
export interface VisualRegressionProbe{viewport:{width:number;height:number};safeArea:ReturnType<typeof landscapeSafeAreaProfile>;actionCount:number;states:VisualProbeState[];}
export function visualRegressionProbe(width:number,height:number):VisualRegressionProbe{
  return{viewport:{width:Math.max(1,Math.floor(width)),height:Math.max(1,Math.floor(height))},safeArea:landscapeSafeAreaProfile(width,height),actionCount:ACTION_BUTTONS.length,states:[
    {id:'opening',elapsedSeconds:30,boss:false,mythic:false,flowStreak:0,longRun:false},
    {id:'boss',elapsedSeconds:1180,boss:true,mythic:false,flowStreak:2,longRun:false},
    {id:'mythic',elapsedSeconds:3900,boss:true,mythic:true,flowStreak:4,longRun:false},
    {id:'final-flow',elapsedSeconds:5400,boss:false,mythic:false,flowStreak:5,longRun:true},
    {id:'long-run',elapsedSeconds:28800,boss:true,mythic:true,flowStreak:3,longRun:true},
  ]};
}
export function visualProbeSignature(probe:VisualRegressionProbe):string{
  const s=[probe.viewport.width,probe.viewport.height,probe.safeArea.aspectClass,probe.actionCount,...probe.states.flatMap(x=>[x.id,x.elapsedSeconds,x.boss?1:0,x.mythic?1:0,x.flowStreak,x.longRun?1:0])].join('|');
  let hash=2166136261;for(let i=0;i<s.length;i++){hash^=s.charCodeAt(i);hash=Math.imul(hash,16777619);}return`VP-${(hash>>>0).toString(16).padStart(8,'0').toUpperCase()}`;
}

import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './config.js';
import type { Vec2 } from '../core/math.js';
import type { LandscapeSafeAreaProfile } from './landscape-safe-area.js';

export interface HudRect { x:number;y:number;width:number;height:number; }
export interface LandscapeStatusInput { mapName:string; threatLevel:number; threatName:string; danger:number; disasterName?:string|undefined; kills:number; coins:number; }

const NO_TOUCH:readonly HudRect[]=[
  {x:0,y:0,width:480,height:360},
  {x:550,y:0,width:520,height:108},
  {x:1110,y:0,width:490,height:108},
];

function shortNumber(value:number):string {
  const n=Math.max(0,Math.floor(Number.isFinite(value)?value:0));
  if(n>=1_000_000)return `${(n/1_000_000).toFixed(n>=10_000_000?0:1)}m`;
  if(n>=10_000)return `${(n/1_000).toFixed(n>=100_000?0:1)}k`;
  return n.toLocaleString('en-US');
}
function crop(text:string,max:number):string { return text.length<=max?text:`${text.slice(0,Math.max(1,max-1))}…`; }

export function compactLandscapeStatusLine(input:LandscapeStatusInput,maxChars=64):string {
  const cap=Math.max(30,Math.min(96,Math.floor(Number.isFinite(maxChars)?maxChars:64)));
  const map=crop(input.mapName.trim()||'전장',Math.max(8,Math.min(20,cap-20)));
  const threat=`T${Math.max(0,Math.min(5,Math.floor(input.threatLevel)))} ${crop(input.threatName.trim(),8)}`.trim();
  const danger=`위험 ${Math.max(0,Math.floor(input.danger))}`;
  const mandatory=[map,threat,danger];
  const optional=[
    input.disasterName?.trim()?crop(input.disasterName.trim(),10):'',
    `처치 ${shortNumber(input.kills)}`,
    `🪙 ${shortNumber(input.coins)}`,
  ].filter(Boolean);
  let line=mandatory.join(' · ');
  for(const part of optional){ const next=`${line} · ${part}`; if(next.length<=cap)line=next; }
  if(line.length<=cap)return line;
  const fixed=`${threat} · ${danger}`;
  const mapCap=Math.max(6,cap-fixed.length-3);
  return `${crop(map,mapCap)} · ${fixed}`.slice(0,cap);
}

export function hudNoTouchRects():readonly HudRect[] { return NO_TOUCH.map((rect)=>({...rect})); }

export function isHudNoTouchPoint(point:Vec2):boolean {
  return NO_TOUCH.some((rect)=>point.x>=rect.x&&point.x<=rect.x+rect.width&&point.y>=rect.y&&point.y<=rect.y+rect.height);
}

export function safeJoystickOrigin(point:Vec2,profile?:LandscapeSafeAreaProfile):Vec2 {
  const x=Math.max(profile?.joystickMinX??110,Math.min(profile?.joystickMaxX??720,Number.isFinite(point.x)?point.x:170));
  const y=Math.max(profile?.joystickMinY??400,Math.min(profile?.joystickMaxY??770,Number.isFinite(point.y)?point.y:710));
  return {x,y};
}

export function shouldStartLandscapeJoystick(point:Vec2,profile?:LandscapeSafeAreaProfile):boolean {
  const minY=profile?.joystickMinY??LOGICAL_HEIGHT*.36;
  const maxX=Math.min(LOGICAL_WIDTH*.5,profile?.joystickMaxX??LOGICAL_WIDTH*.5);
  const hinge=profile?.hingeExclusion;
  const inHinge=Boolean(hinge&&point.x>=hinge.x&&point.x<=hinge.x+hinge.width&&point.y>=hinge.y&&point.y<=hinge.y+hinge.height);
  return !inHinge&&point.x>=(profile?.leftInset??0)&&point.x<maxX&&point.y>minY&&point.y<LOGICAL_HEIGHT-(profile?.bottomInset??0)&& !isHudNoTouchPoint(point);
}

export interface LandscapeBuildPriorityContext { bossActive:boolean; mythicActive:boolean; longRunTier:number; maxLabels:number; }
function buildLabelPriority(label:string):number{
  if(label.startsWith('SIGNATURE'))return 100;
  if(label.startsWith('CONTRACT'))return 84;
  if(label.startsWith('OVERDRIVE'))return 95;
  if(label.startsWith('FLOW'))return 93;
  if(label.startsWith('REPLAY'))return 90;
  if(label.startsWith('최종형'))return 86;
  if(label.startsWith('서약'))return 82;
  if(label.startsWith('RECOVER'))return 68;
  if(label.startsWith('융합'))return 62;
  if(label.startsWith('운명'))return 58;
  if(label.startsWith('시너지'))return 54;
  return 40;
}
export function prioritizeLandscapeBuildLabels(labels:readonly string[],context:LandscapeBuildPriorityContext):string[]{
  const numeric=Number.isFinite(context.maxLabels)?Math.floor(context.maxLabels):4;
  const requested=Math.max(0,Math.min(4,numeric));
  if(requested===0)return [];
  const combatCap=context.mythicActive?2:context.bossActive?3:requested;
  const comfortCap=context.longRunTier>=3?Math.min(combatCap,2):context.longRunTier>=1?Math.min(combatCap,3):combatCap;
  return labels.map((label,index)=>({label,index,priority:buildLabelPriority(label)})).sort((a,b)=>b.priority-a.priority||a.index-b.index).slice(0,comfortCap).map((entry)=>entry.label);
}

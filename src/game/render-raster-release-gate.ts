import { ACTION_BUTTONS } from './config.js';
import { defaultRasterCiDiffSummary, type RasterCiDiffSummary } from './render-raster-ci-summary.js';
import { auditVisualEffectsSafety } from './visual-effects-audit.js';

export interface RasterReleaseGateInput {
  rasterSummary?:RasterCiDiffSummary;
  actionCount?:number;
  requiredProfiles?:number;
  visualEffectsPassed?:boolean;
}
export interface RasterReleaseQualityGate {
  ok:boolean;
  status:'PASS'|'REVIEW';
  exitCode:0|2;
  signature:string;
  issues:string[];
  markdown:string;
  rasterSummary:RasterCiDiffSummary;
  actionCount:number;
  profileCount:number;
  requiredProfiles:number;
  visualEffectsPassed:boolean;
}
function fnv(text:string):string{let hash=2166136261;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}return(hash>>>0).toString(16).padStart(8,'0').toUpperCase();}
export function rasterReleaseQualityGate(input:RasterReleaseGateInput={}):RasterReleaseQualityGate{
  const rasterSummary=input.rasterSummary??defaultRasterCiDiffSummary();
  const actionCount=Math.max(0,Math.floor(Number.isFinite(input.actionCount)?Number(input.actionCount):ACTION_BUTTONS.length));
  const requiredProfiles=Math.max(1,Math.floor(Number.isFinite(input.requiredProfiles)?Number(input.requiredProfiles):5));
  const visualEffectsPassed=input.visualEffectsPassed??auditVisualEffectsSafety().passed;
  const profileCount=rasterSummary.lines.filter((line)=>/^(PASS|REVIEW)\s/.test(line)).length;
  const issues:string[]=[];
  if(!rasterSummary.ok)issues.push('raster-review-required');
  if(actionCount!==9)issues.push(`action-count:${actionCount}!=9`);
  if(profileCount!==requiredProfiles)issues.push(`profile-count:${profileCount}!=${requiredProfiles}`);
  if(!visualEffectsPassed)issues.push('visual-effects');
  const ok=issues.length===0,status=ok?'PASS' as const:'REVIEW' as const;
  const payload=[status,actionCount,profileCount,requiredProfiles,visualEffectsPassed,...rasterSummary.lines,...issues].join('|');
  const signature=`RQ-${fnv(payload)}`;
  const markdown=[
    '# Arcane Last Stand Release Quality Gate',
    '',
    `- Status | ${status}`,
    `- Signature | ${signature}`,
    `- Action invariant | ${actionCount}/9`,
    `- Raster profiles | ${profileCount}/${requiredProfiles}`,
    `- Visual effects | ${visualEffectsPassed?'PASS':'REVIEW'}`,
    '- Baseline mutation | disabled',
    '',
    '## Raster summary',
    ...rasterSummary.lines.map((line)=>`- ${line}`),
    ...(issues.length?['','## Issues',...issues.map((issue)=>`- ${issue}`)]:[]),
  ].join('\n');
  return{ok,status,exitCode:ok?0:2,signature,issues,markdown,rasterSummary,actionCount,profileCount,requiredProfiles,visualEffectsPassed};
}

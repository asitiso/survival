import { defaultRasterBaselineReport, type RasterBaselineChangeReport } from './render-raster-baseline-report.js';

export interface RasterCiDiffSummary {
  ok:boolean;
  status:'PASS'|'REVIEW';
  exitCode:0|2;
  lines:string[];
  text:string;
}
function fixed(n:number):string{return Number.isFinite(n)?n.toFixed(6):'0.000000';}
function assemble(lines:string[],ok:boolean):RasterCiDiffSummary{
  const status=ok?'PASS':'REVIEW';
  const text=['# Raster Baseline CI',...lines,'baseline auto-update: disabled'].join('\n');
  return{ok,status,exitCode:ok?0:2,lines,text};
}
export function rasterCiDiffSummary(reports:readonly RasterBaselineChangeReport[]):RasterCiDiffSummary{
  const lines=reports.map((r)=>r.status==='unchanged'
    ?`PASS ${r.id} ${r.currentSignature}`
    :`REVIEW ${r.id} ${r.baselineSignature}->${r.currentSignature} similarity=${fixed(r.similarity)} critical=${fixed(r.criticalSimilarity)} cells=${r.changedCells} criticalCells=${r.criticalChangedCells} token=${r.approvalToken}`);
  return assemble(lines,reports.every((r)=>r.status==='unchanged'));
}
export function defaultRasterCiDiffSummary():RasterCiDiffSummary{
  const report=defaultRasterBaselineReport();
  const lines=report.entries.map((e)=>e.status==='unchanged'
    ?`PASS ${e.id} ${e.currentSignature}`
    :`REVIEW ${e.id} ${e.expectedSignature}->${e.currentSignature} token=${e.approvalToken}`);
  return assemble(lines,report.ok);
}

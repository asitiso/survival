const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
export type DenseDashFamily='projectile'|'hazard'|'footprint'|'memory'|'forecast'|'residue'|'impact'|'specialist'|'safeLane'|'bossCue';
const familyRank:Record<DenseDashFamily,number>={projectile:0,hazard:1,footprint:2,specialist:3,memory:3,forecast:4,impact:5,residue:6,safeLane:-1,bossCue:-1};
export function denseDashFamilyPresentation(input:{family:DenseDashFamily;crowd:number;critical:boolean;bossProtected:boolean;safeLaneVisible:boolean;strongPatternLimit?:number},reducedMotion=false,reducedFlash=false){
  const crowd=clamp01(input.crowd),protectedPattern=input.family==='safeLane'||input.family==='bossCue'||input.bossProtected||(input.family==='projectile'&&input.critical),limit=input.strongPatternLimit??(crowd>=.76?1:crowd>=.46?2:3),strongPattern=protectedPattern||familyRank[input.family]<Math.max(1,Math.min(3,limit));
  const demoted=input.family==='residue'?1.86:input.family==='impact'?1.74:input.family==='forecast'?1.66:input.family==='memory'||input.family==='specialist'?1.58:input.family==='footprint'?1.5:input.family==='hazard'?1.42:1.34,accessibility=protectedPattern?1:(reducedMotion?1.015:1)*(reducedFlash?1.04:1);
  return{canonicalDashGapScale:1,dashGapScale:protectedPattern?1:(strongPattern?1+crowd*.08:demoted)*accessibility,protectedPattern,strongPattern,presentationOnly:true as const};
}
export function denseDashBudgetPresentation(input:{criticalCount:number;crowd:number;bossActive:boolean;safeLaneVisible:boolean},reducedMotion=false,reducedFlash=false){
  const critical=clamp01(Math.max(0,input.criticalCount)/3),crowd=clamp01(input.crowd),stress=clamp01(crowd*.78+critical*.18+(input.bossActive?.04:0)),strongPatternLimit=stress>=.76?1:stress>=.46?2:3,laneReserve=input.safeLaneVisible?.04:0,accessibility=(reducedMotion?1.015:1)*(reducedFlash?1.04:1);
  return{stress,strongPatternLimit,canonicalDashGapScale:1,secondaryDashGapScale:(1+stress*.34+laneReserve)*accessibility,safeLaneDashGapScale:1,presentationOnly:true as const};
}

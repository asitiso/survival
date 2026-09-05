export type DamageReasonSource='contact'|'projectile'|'explosion'|'arena'|'strain';
export type DamageReasonSeverity='normal'|'heavy'|'critical';
export interface DamageReasonState{source:DamageReasonSource;label:string;severity:DamageReasonSeverity;amount:number;expiresAt:number;}

const LABELS:Record<DamageReasonSource,string>={
  contact:'근접 공격',projectile:'투사체 피격',explosion:'폭발 피격',arena:'위험지대',strain:'과부하 피해',
};
const DENSITY_GUARD_SECONDS=.22;
const SEVERITY_RANK:Record<DamageReasonSeverity,number>={normal:0,heavy:1,critical:2};
function dwellSeconds(severity:DamageReasonSeverity):number{return severity==='critical'?1.15:severity==='heavy'?.95:.72;}
export function damageReasonCue(source:DamageReasonSource,amount:number,maxHp:number):Pick<DamageReasonState,'source'|'label'|'severity'> {
  const ratio=Math.max(0,amount)/Math.max(1,maxHp);
  const severity:DamageReasonSeverity=ratio>=.32?'critical':ratio>=.12?'heavy':'normal';
  return{source,label:LABELS[source],severity};
}
export function recordDamageReason(previous:DamageReasonState|null,source:DamageReasonSource,amount:number,maxHp:number,nowSeconds:number):DamageReasonState{
  const cue=damageReasonCue(source,amount,maxHp);
  const active=Boolean(previous&&previous.expiresAt>nowSeconds);
  const merge=Boolean(active&&previous?.source===source);
  if(active&&previous&&!merge){
    const shownAt=previous.expiresAt-dwellSeconds(previous.severity);
    const insideDensityGuard=nowSeconds-shownAt<DENSITY_GUARD_SECONDS;
    if(insideDensityGuard&&SEVERITY_RANK[cue.severity]<=SEVERITY_RANK[previous.severity])return previous;
  }
  const total=merge&&previous?previous.amount+Math.max(0,amount):Math.max(0,amount);
  const mergedCue=damageReasonCue(source,total,maxHp);
  return{...mergedCue,amount:total,expiresAt:nowSeconds+dwellSeconds(mergedCue.severity)};
}
export function advanceDamageReason(state:DamageReasonState|null,nowSeconds:number):DamageReasonState|null{return state&&state.expiresAt>nowSeconds?state:null;}

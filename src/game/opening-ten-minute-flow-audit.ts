import { auditOpeningAutoBalance } from './opening-auto-balance-audit.js';
import { auditOpeningUpgradeBias } from './opening-upgrade-bias-audit.js';
import { auditOpeningShopFastPathSuccess } from './opening-shop-fast-path-audit.js';
import { auditOpeningBossPrepDensity } from './opening-boss-prep-density-audit.js';
import { auditOpeningFlowFriction } from './opening-flow-friction-audit.js';
export interface OpeningTenMinuteFlowAudit{passed:boolean;samples:number;childAuditCount:number;maxCombatStatInflation:number;estimatedPauseReduction:number;actionCount:number;snapshotMutation:boolean;issues:string[];}
export function auditOpeningTenMinuteFlow():OpeningTenMinuteFlowAudit{
  const auto=auditOpeningAutoBalance(),upgrade=auditOpeningUpgradeBias(),shop=auditOpeningShopFastPathSuccess(),prep=auditOpeningBossPrepDensity(),friction=auditOpeningFlowFriction();
  const children=[auto,upgrade,shop,prep];
  const maxCombatStatInflation=Math.max(0,auto.maxDamageMultiplier-1,auto.maxCooldownBenefit-1,auto.maxSurvivalMultiplier-1);
  const estimatedPauseReduction=Math.min(1,Math.round((friction.estimatedFrictionReduction*.7+shop.estimatedSuccessfulOneTapRate*.18+prep.preparedSilenceCoverage*.12)*1000)/1000);
  const issues:string[]=[]; if(children.some(child=>!child.passed))issues.push('opening-child-audit'); if(maxCombatStatInflation>.001)issues.push('opening-stat-inflation'); if(estimatedPauseReduction<.35)issues.push('opening-pause-reduction');
  return{passed:issues.length===0,samples:auto.samples+upgrade.samples+shop.samples+prep.samples,childAuditCount:children.length,maxCombatStatInflation,estimatedPauseReduction,actionCount:9,snapshotMutation:false,issues};
}

import { distance, normalize, type Vec2 } from '../core/math.js';
import { ARENA_MARGIN, LOGICAL_HEIGHT, LOGICAL_WIDTH } from './config.js';
import type { GuardianCore, Hero } from './entities.js';
import { directorSnapshot } from '../domain/director.js';
import { impactTierForDamage, type CombatFeedbackSink, type DamageImpactTier } from './combat-feedback.js';
import { bossArchetypeForOrdinal, bossArchetypeTuning, bossArchetypeSpecial, bossPatternTuning, bossPhaseForRatio, bossVariantTierForOrdinal, bossVariantTuning, bossVariantLabel, type BossArchetype, type BossVariantTier } from './boss-patterns.js';
import type { RegularEnemyType, RegularEnemyWeights } from './threat-directives.js';
import type { BossEncounterModifiers } from './boss-encounters.js';
import { eliteAffixModifiers, selectEliteAffixes, eliteAffixLabel, type EliteAffixId } from './elite-affixes.js';
import { SPECIALIST_COMBAT_CONTRACT, assassinBlinkPosition, selectSpecialistEnemyType, specialistTarget, type SpecialistEnemyType } from './enemy-specialists.js';
import { apexBossProfile, apexPressureModifiers } from './apex-boss.js';
import { mythicBossProfile, mythicPressureModifiers } from './endless/mythic-boss.js';
import { mythicPhaseProfile } from './endless/mythic-phases.js';
import { mythicLastLawProfile } from './endless/mythic-last-law.js';
import { mythicLastLawIdentityProfile } from './endless/mythic-last-law-identity.js';
import { activeMythicTacticAttackLink, type MythicTacticAttackLink } from './endless/mythic-tactic-attack-link.js';
import type { BossDifficultyCurveProfile } from './boss-difficulty-curve.js';
import type { DamageReasonSource } from './damage-reason-feedback.js';
import { enemySpritePresentation, enemySpriteRect, isEnemySpriteType } from './enemy-sprite-assets.js';
import { bossSpritePresentation, bossSpriteRect } from './boss-sprite-assets.js';
import { eliteAffixIdentityEmphasis, eliteAffixIdentityIcon, eliteAffixIdentityRowLayout } from './elite-affix-identity-assets.js';
import { isSpecialistIntentType, specialistIntentEmphasis, specialistIntentIcon, specialistIntentOnBodyLayout } from './specialist-intent-identity-assets.js';
import type { ResidualCombatMotionPolicy } from './combat-cue-priority.js';
import type { PresentationQuality } from './presentation-budget.js';
import { projectileImpactSourceContinuity } from './projectile-impact-source-continuity.js';
import { projectileImpactClusters, type ProjectileImpactCluster } from './projectile-impact-cluster-compression.js';
import { projectileImpactLabelPlacements, type ProjectileImpactLabelPlacement } from './projectile-impact-label-placement-arbitration.js';
import { projectileImpactHeldCount, retireProjectileImpactCountHoldIdentities, updateProjectileImpactCountHold, type ProjectileImpactCountHoldEntry } from './projectile-impact-count-hold.js';
import { projectileImpactAnchoredPlacements, retireProjectileImpactLabelAnchorIdentities, updateProjectileImpactLabelAnchorHold, type ProjectileImpactLabelAnchorHoldEntry } from './projectile-impact-label-anchor-hold.js';
import { projectileImpactIdentityKeys, updateProjectileImpactIdentityCoherence, type ProjectileImpactSharedIdentityEntry } from './projectile-impact-identity-coherence.js';
import { advanceSpawnLaneMemory, rememberSpawnLanePortal, type SpawnLaneMemoryPortal } from './spawn-lane-presentation-memory.js';
import { bossSpecialProjectileVfxSprite } from './boss-special-combat-vfx-assets.js';
import { bossProjectileLifecycleVfxSprite } from './boss-projectile-lifecycle-vfx-assets.js';
import { isSpecialistCombatVfxType, specialistCombatVfxSprite } from './specialist-combat-vfx-assets.js';
import { bossPhaseOverlayVfxSprite } from './boss-phase-overlay-vfx-assets.js';
import { battlefieldInteractionSprite } from './battlefield-interaction-vfx-assets.js';
import { battlefieldEnvironmentReactionVfxSprite } from './battlefield-environment-reaction-vfx-assets.js';
import { spawnPressureVfxSprite, type SpawnPressureKind } from './spawn-pressure-vfx-assets.js';
import { regularEnemyActionVfxSprite, type RegularEnemyActionVfxKind } from './regular-enemy-action-vfx-assets.js';
import { eliteAffixLifecycleVfxSprite } from './elite-affix-lifecycle-vfx-assets.js';
import { enemyTargetPressureClassForEnemyType, enemyTargetPressureVfxSprite, enemyTargetPressureVisible } from './enemy-target-pressure-vfx-assets.js';
import { specialistReactionLifecycleVfxSprite } from './specialist-reaction-lifecycle-vfx-assets.js';
import { advanceEnemyMotionRenderState, enemyMotionRenderPresentation, type EnemyMotionRenderState } from './enemy-motion-rendering.js';
import { enemyAttackMotionPresentation } from './enemy-attack-motion-rendering.js';
import { advanceEnemyAttackResolveState, enemyAttackResolvePresentation, type EnemyAttackResolveState } from './enemy-attack-resolve-rendering.js';
import { bossLocomotionWeightPresentation } from './boss-locomotion-weight-rendering.js';
import { advanceSpecialistLocomotionSignatureState, specialistLocomotionSignaturePresentation, type SpecialistLocomotionSignatureState } from './specialist-locomotion-signature-rendering.js';
import { specialistTurnStopPresentation } from './specialist-turn-stop-rendering.js';
import { bossSpecialBodyLanguagePresentation } from './boss-special-body-language-rendering.js';
import { advanceBossSpecialRecoveryState, bossSpecialRecoveryPresentation, type BossSpecialRecoveryState } from './boss-special-recovery-rendering.js';
import { enemyHitStaggerPresentation, type EnemyDeathPose } from './enemy-hit-death-transition-rendering.js';
import { advanceBossHeavyHitStaggerState, bossHeavyHitStaggerPresentation, type BossHeavyHitStaggerState } from './boss-heavy-hit-stagger-rendering.js';
import { specialistAttackHitArbitrationPresentation } from './specialist-attack-hit-arbitration-rendering.js';
import { specialistRecoveryHitHandoffPresentation } from './specialist-recovery-hit-handoff-rendering.js';
import { bossStaggerSpecialRecoveryArbitrationPresentation } from './boss-stagger-special-recovery-arbitration-rendering.js';
import { bossRecoveryStaggerHandoffPresentation } from './boss-recovery-stagger-handoff-rendering.js';
import { specialistGroundContactOwnershipPresentation } from './specialist-ground-contact-ownership-rendering.js';
import { bossGroundCueArbitrationPresentation } from './boss-ground-cue-arbitration-rendering.js';
import { advanceBossGroundOriginRebaseState, bossGroundOriginRebasePresentation, type BossGroundOriginRebaseState } from './boss-ground-origin-rebase-rendering.js';
import { advanceBossSpecialOriginHandoffState, bossSpecialOriginHandoffPresentation, type BossSpecialOriginHandoffState } from './boss-special-origin-handoff-rendering.js';
import { advanceEnemyPortalGroundMaterializeState, enemyPortalGroundMaterializePresentation, type EnemyPortalGroundMaterializeState } from './enemy-portal-ground-materialize-rendering.js';
import { bossDisplacementAftermathOriginPresentation } from './boss-displacement-aftermath-origin-rendering.js';
import { rangedEnemyProjectileLaunchOriginPresentation, rangedEnemyVisualLaunchPosition } from './ranged-enemy-projectile-launch-origin-rendering.js';
import { projectileTrailLaunchHandoffPresentation } from './projectile-trail-launch-handoff-rendering.js';
import { projectileImpactEntryOffset, projectileImpactVisualPosition } from './projectile-impact-arrival-handoff-rendering.js';
import { projectileThreatPositionHandoff } from './projectile-threat-position-handoff-rendering.js';
import { projectileTravelThreatCarryPresentation, threatLaunchOwnershipPresentation } from './threat-impact-continuity-rendering.js';
import { continuityCrowdBudgetPresentation, projectileDirectionCarryRecoveryPresentation, silhouetteRecoveryReentryPresentation } from './threat-impact-recovery-rendering.js';
import { continuityResolutionBudgetPresentation, projectileCanonicalReclaimPresentation, silhouetteLocomotionSettlePresentation } from './threat-impact-resolution-rendering.js';
import { battlefieldThreatLayerBudgetPresentation, silhouetteThreatDeconflictionPresentation, threatCuePriorityArbitrationPresentation, threatOverlapSuppressionBudgetPresentation } from './threat-impact-priority-rendering.js';
import { bossCriticalFocusReservationPresentation, projectileSpatialSeparationPresentation, silhouetteLocalContrastPresentation } from './threat-impact-spatial-priority-rendering.js';
import { projectileFocusHoldPresentation, silhouetteContrastRecoveryPresentation, temporalThreatBudgetPresentation } from './threat-impact-temporal-focus-rendering.js';
import { battlefieldDepthBudgetPresentation, projectileBodyOcclusionPresentation, safeLaneProjectileCrossingPresentation, specialistHazardDepthPresentation } from './threat-impact-depth-priority-rendering.js';
import { depthRecoveryBudgetPresentation, projectileDepthRecoveryPresentation, safeLaneDepthRecoveryPresentation, specialistDepthRecoveryPresentation } from './threat-impact-depth-recovery-rendering.js';
import { canonicalBodyDepthReclaimPresentation, criticalDepthLatchPresentation, unifiedDepthStackBudgetPresentation } from './threat-impact-depth-stack-rendering.js';
import { projectileCorridorSeparationPresentation, specialistDirectionalSeparationPresentation, spatialThreatSeparationBudgetPresentation } from './threat-impact-spatial-separation-rendering.js';
import { projectileCorridorReleasePresentation, spatialRecoveryBudgetPresentation, specialistDirectionalReleasePresentation } from './threat-impact-spatial-recovery-rendering.js';
import { denseBattlefieldArbitrationPresentation, denseProjectileArbitrationPresentation, denseSilhouetteArbitrationPresentation } from './threat-impact-dense-arbitration-rendering.js';
import { depthPlaneBudgetPresentation, projectileDepthPlanePresentation, specialistRimDepthPresentation } from './threat-impact-depth-plane-rendering.js';
import { depthReentryBudgetPresentation, projectileDepthReentryPresentation, specialistRimReentryPresentation } from './threat-impact-depth-plane-reentry-rendering.js';
import { bossFocusCorridorBudgetPresentation, bossProjectileFocusCorridorPresentation, bossSpecialistFocusCorridorPresentation } from './threat-impact-boss-focus-corridor-rendering.js';
import { canonicalReacquisitionBudgetPresentation, projectileCanonicalReacquisitionPresentation, specialistCanonicalReacquisitionPresentation } from './threat-impact-canonical-reacquisition-rendering.js';
import { directionReacquisitionBudgetPresentation, projectileDirectionReacquisitionPresentation, specialistFacingReacquisitionPresentation } from './threat-impact-direction-reacquisition-rendering.js';
import { bossProjectileReengagementLockPresentation, criticalReengagementBudgetPresentation, specialistBossReengagementLockPresentation } from './threat-impact-critical-reengagement-rendering.js';
import { effectiveAlphaFloorBudgetPresentation, projectileEffectiveAlphaFloorPresentation, specialistEffectiveAlphaFloorPresentation } from './threat-impact-effective-alpha-floor-rendering.js';
import { projectileSecondaryCeilingPresentation, secondaryCeilingBudgetPresentation, specialistSecondaryCeilingPresentation } from './threat-impact-secondary-ceiling-rendering.js';
import { projectileReadabilityContrastPresentation, readabilityContrastBudgetPresentation, specialistReadabilityContrastPresentation } from './threat-impact-readability-contrast-rendering.js';
import { finalReadabilitySettleBudgetPresentation, projectileFinalReadabilitySettlePresentation, specialistFinalReadabilitySettlePresentation } from './threat-impact-final-readability-settle-rendering.js';
import { projectileSecondaryRecoveryGatePresentation, secondaryRecoveryGateBudgetPresentation, specialistSecondaryRecoveryGatePresentation } from './threat-impact-secondary-recovery-gate-rendering.js';
import { focusTransferCoherenceBudgetPresentation, projectileFocusTransferCoherencePresentation, specialistFocusTransferCoherencePresentation } from './threat-impact-focus-transfer-coherence-rendering.js';
import { crossFamilyPeakBudgetPresentation, projectileImpactPeakSeparationPresentation, specialistRecoveryTrailPeakPresentation } from './threat-rhythm-peak-separation-rendering.js';
import { projectileTrailRhythmRecoveryPresentation, rhythmRecoveryBudgetPresentation, specialistRhythmRecoveryPresentation } from './threat-rhythm-recovery-rendering.js';
import { canonicalBodyTemporalProtectionPresentation, secondaryRhythmTemporalRetirementPresentation } from './threat-rhythm-temporal-arbitration-rendering.js';
import { projectileGuardImpactHandoffPresentation } from './projectile-guard-impact-handoff-rendering.js';
import { coreProjectileGuardImpactHandoffPresentation } from './core-projectile-guard-impact-handoff-rendering.js';
import { coreContactGuardMemoryPresentation } from './core-contact-guard-memory-rendering.js';
import { advanceCoreMixedPressureGuardArbitration, coreMixedPressureGuardArbitrationPresentation, createCoreMixedPressureGuardArbitrationState, type CoreMixedPressureGuardArbitrationState } from './core-mixed-pressure-guard-arbitration-rendering.js';
import { bossSpecialLaunchOriginPresentation } from './boss-special-launch-origin-rendering.js';
import { characterGroundContactPresentation, characterHitRecoilPresentation } from './character-contact-recoil-rendering.js';
import { characterMotionLayerBudgetPresentation } from './character-motion-layer-budget-rendering.js';
import { characterSilhouetteDirectionOwnerPresentation } from './character-silhouette-direction-owner-rendering.js';
import { characterSilhouetteDirectionPivotPresentation } from './character-silhouette-direction-pivot-rendering.js';
import { characterSilhouetteTrailBudgetPresentation } from './character-silhouette-trail-budget-rendering.js';
import { specialistAttackSilhouetteEmphasisPresentation } from './specialist-attack-silhouette-emphasis-rendering.js';
import { bossSpecialAnticipationEmphasisPresentation } from './boss-special-anticipation-emphasis-rendering.js';
import { specialistSilhouettePhaseHandoffPresentation } from './specialist-silhouette-phase-handoff-rendering.js';
import { bossAnticipationRecoveryHandoffPresentation } from './boss-anticipation-recovery-handoff-rendering.js';
import { specialistSilhouetteCrowdBudgetPresentation } from './specialist-silhouette-crowd-budget-rendering.js';
import { bossSpecialCueBudgetPresentation } from './boss-special-cue-budget-rendering.js';
import { specialistStrikeOriginCoherencePresentation } from './specialist-strike-origin-coherence-rendering.js';
import { bossAnticipationOriginCoherencePresentation } from './boss-anticipation-origin-coherence-rendering.js';
import { specialistStrikeOriginArrivalPresentation } from './specialist-strike-origin-arrival-rendering.js';
import { specialistAttackSilhouetteRecoveryTrailPresentation, specialistRecoveryTrailDensityBudgetPresentation, specialistRecoveryTrailLocomotionCadencePresentation, specialistRecoveryLocomotionCadenceDensityBudgetPresentation, specialistRecoveryLocomotionCadenceHandoffPresentation, specialistImpactFinishLocomotionRecoveryPresentation, specialistRecoveryTrailSilhouetteHandoffPresentation, specialistImpactRecoveryDensityBudgetPresentation, specialistImpactRecoveryFacingHandoffPresentation, specialistAnticipationSilhouetteDensityBudgetPresentation, specialistAnticipationSilhouetteHandoffPresentation, specialistAnticipationSilhouettePoseContinuityPresentation, specialistNextAttackAnticipationDensityBudgetPresentation, specialistNextAttackAnticipationHandoffPresentation, specialistNextAttackAnticipationPresentation, specialistLocomotionTurnStopReattackRhythmPresentation, specialistTurnStopReattackHandoffPresentation, specialistTurnStopReattackDensityBudgetPresentation, specialistStrikeImpactSideFinishPresentation } from './specialist-strike-impact-side-finish-rendering.js';
import { bossSharedAnchorTravelContinuityPresentation } from './boss-shared-anchor-travel-continuity-rendering.js';
import { bossAnchorTravelReleasePresentation } from './boss-anchor-travel-release-rendering.js';
import { specialistImpactFinishResponseArbitrationPresentation } from './specialist-impact-finish-response-arbitration-rendering.js';
import { bossAnchorBridgeDensityBudgetPresentation } from './boss-anchor-bridge-density-budget-rendering.js';
import { specialistImpactFinishDensityBudgetPresentation } from './specialist-impact-finish-density-budget-rendering.js';
import { bossAnticipationOriginLockPresentation } from './boss-anticipation-origin-lock-rendering.js';
import { specialistStrikeCueBudgetPresentation } from './specialist-strike-cue-budget-rendering.js';
import { bossSpecialOriginAnchorPresentation } from './boss-special-origin-anchor-rendering.js';

export type EnemyType = 'grunt' | 'hound' | 'brute' | 'archer' | 'bomber' | 'shaman' | 'shieldbearer' | 'assassin' | 'siegeGolem' | 'nullifier' | 'golden' | 'elite' | 'boss';
export type EnemyTarget = 'hero' | 'core';
export type EnemyDeathVisualSource='normal'|'explosion'|'freeze'|'ultimate'|'finalForm'|'fusion';

function isSpecialistEnemyType(type:EnemyType):type is SpecialistEnemyType { return type === 'shieldbearer' || type === 'assassin' || type === 'siegeGolem' || type === 'nullifier'; }
function pointSegmentProximity(point:Vec2,a:Vec2|null,b:Vec2|null,band:number):number { if(!a||!b)return 0;const dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy,safeBand=Math.max(1,band);if(len2<=.001)return Math.max(0,1-distance(point,a)/safeBand);const t=Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/len2)),nearest={x:a.x+dx*t,y:a.y+dy*t};return Math.max(0,1-distance(point,nearest)/safeBand); }

export interface EnemyStats {
  hp: number;
  speed: number;
  radius: number;
  damage: number;
  xp: number;
  gold: number;
  attackInterval: number;
  preferredRange: number;
  color: string;
}

export interface Enemy extends EnemyStats {
  id: number;
  type: EnemyType;
  pos: Vec2;
  maxHp: number;
  target: EnemyTarget;
  attackTimer: number;
  slowFactor: number;
  slowTimer: number;
  alive: boolean;
  hitFlash: number;
  hitImpactTier?: DamageImpactTier | undefined;
  hitDirectionX?: number | undefined;
  hitDirectionY?: number | undefined;
  specialTimer?: number | undefined;
  bossCycle?: number | undefined;
  bossOrdinal?: number | undefined;
  bossArchetype?: BossArchetype | undefined;
  bossVariantTier?: BossVariantTier | undefined;
  eliteAffixes?: EliteAffixId[] | undefined;
  damageTakenMultiplier: number;
  regenPerSecondRatio: number;
  lowHpDamageMultiplier: number;
  commandAuraMultiplier: number;
  manaShield: number;
  maxManaShield: number;
  isApex?: boolean | undefined;
  apexSecondaryArchetype?: BossArchetype | undefined;
  isMythic?: boolean | undefined;
  mythicChannels?: BossArchetype[] | undefined;
  guardHp?: number | undefined;
  maxGuardHp?: number | undefined;
  specialistTimer?: number | undefined;
  renderMotion?: EnemyMotionRenderState | undefined;
  attackResolveMotion?: EnemyAttackResolveState | undefined;
  specialistLocomotionSignature?: SpecialistLocomotionSignatureState | undefined;
  bossSpecialRecovery?: BossSpecialRecoveryState | undefined;
  bossHeavyHitStagger?: BossHeavyHitStaggerState | undefined;
  bossGroundOriginRebase?: BossGroundOriginRebaseState | undefined;
  bossSpecialOriginHandoff?: BossSpecialOriginHandoffState | undefined;
  spawnGroundMaterialize?: EnemyPortalGroundMaterializeState | undefined;
}

export interface EnemyProjectileView {
  pos: Vec2;
  vel: Vec2;
  radius: number;
  damage: number;
  ttl: number;
  target: EnemyTarget;
  bossArchetype?: BossArchetype | undefined;
  sourceType?: EnemyType | undefined;
  visualLaunchOffset?: Vec2 | undefined;
  visualLaunchTtl?: number | undefined;
  visualLaunchMaxTtl?: number | undefined;
  visualLaunchWorldOrigin?: Vec2 | undefined;
  visualLaunchTravelTtl?: number | undefined;
  visualLaunchTravelMaxTtl?: number | undefined;
  visualPos?: Vec2 | undefined;
}

export interface SpawnPortalView { pos: Vec2; kind: 'regular'|'specialist'|'elite'|'boss'; target: EnemyTarget; ttl: number; }

export interface EnemyDeathEvent {
  x: number;
  y: number;
  xp: number;
  gold: number;
  type: EnemyType;
  bossArchetype?: BossArchetype | undefined;
  wasSlowed?: boolean | undefined;
  visualSource?:EnemyDeathVisualSource | undefined;
  deathPose?:EnemyDeathPose | undefined;
}


export interface EnemyUpdateContext {
  hero: Hero;
  core: GuardianCore;
  elapsed: number;
  onHeroDamage: (amount: number, source?: DamageReasonSource) => number | void;
  onCoreDamage: (amount: number, source?: DamageReasonSource, origin?: Vec2) => number | void;
  enemySpeedMultiplier?: number;
  spawnPressureMultiplier?: number;
  eliteIntervalMultiplier?: number;
  regularWeights?: RegularEnemyWeights;
  bossVariantBonus?: number;
  onTimeWarp?: ((multiplier: number, duration: number) => void) | undefined;
  apexThreatLevel?: number | undefined;
  mythicTacticAttackLink?: MythicTacticAttackLink | null | undefined;
  onMythicTacticAttackLinkConsumed?: ((archetype: BossArchetype) => void) | undefined;
  bossCurve?: ((bossOrdinal:number, elapsedSeconds:number, threatLevel:number)=>BossDifficultyCurveProfile) | undefined;
  reducedMotion?: boolean | undefined;
}

const BASE: Record<EnemyType, EnemyStats> = {
  grunt: { hp: 38, speed: 82, radius: 18, damage: 10, xp: 7, gold: 2, attackInterval: 0.92, preferredRange: 0, color: '#8d99a8' },
  hound: { hp: 24, speed: 148, radius: 15, damage: 8, xp: 7, gold: 2, attackInterval: 0.74, preferredRange: 0, color: '#d76a5b' },
  brute: { hp: 118, speed: 54, radius: 28, damage: 18, xp: 14, gold: 6, attackInterval: 1.15, preferredRange: 0, color: '#a66c45' },
  archer: { hp: 46, speed: 72, radius: 18, damage: 9, xp: 11, gold: 4, attackInterval: 1.55, preferredRange: 270, color: '#b975d6' },
  bomber: { hp: 34, speed: 116, radius: 17, damage: 34, xp: 10, gold: 4, attackInterval: 9, preferredRange: 0, color: '#ff8b45' },
  shaman: { hp: 64, speed: 61, radius: 21, damage: 0, xp: 18, gold: 8, attackInterval: 2.25, preferredRange: 245, color: '#6edb9b' },
  shieldbearer: { hp: 92, speed: 67, radius: 23, damage: 13, xp: 16, gold: 7, attackInterval: 1.05, preferredRange: 0, color: '#7f93b4' },
  assassin: { hp: 42, speed: 128, radius: 16, damage: 18, xp: 17, gold: 8, attackInterval: 0.68, preferredRange: 0, color: '#d27cff' },
  siegeGolem: { hp: 178, speed: 42, radius: 31, damage: 29, xp: 24, gold: 12, attackInterval: 1.45, preferredRange: 0, color: '#9b805e' },
  nullifier: { hp: 78, speed: 58, radius: 22, damage: 0, xp: 22, gold: 10, attackInterval: 3.2, preferredRange: 225, color: '#6fa8ff' },
  golden: { hp: 92, speed: 188, radius: 19, damage: 0, xp: 22, gold: 420, attackInterval: 99, preferredRange: 0, color: '#ffd85d' },
  elite: { hp: 380, speed: 76, radius: 34, damage: 24, xp: 60, gold: 55, attackInterval: 0.86, preferredRange: 0, color: '#e8bc55' },
  boss: { hp: 2100, speed: 46, radius: 58, damage: 36, xp: 260, gold: 320, attackInterval: 0.72, preferredRange: 0, color: '#ff4f63' },
};

export function enemyStats(type: EnemyType, danger: number): EnemyStats {
  const base = BASE[type];
  const d = Math.max(1, danger);
  const bossScale = type === 'boss' ? 1 + (d - 1) * 0.11 : 1;
  const eliteScale = type === 'elite' ? 1 + (d - 1) * 0.06 : 1;
  return {
    ...base,
    hp: Math.round(base.hp * (1 + (d - 1) * 0.14) * bossScale * eliteScale),
    damage: base.damage * (1 + (d - 1) * 0.08),
    xp: Math.round(base.xp * (1 + (d - 1) * 0.09)),
    gold: Math.max(1, Math.round(base.gold * (1 + (d - 1) * 0.06))),
  };
}

const LATE_BASE_WEIGHTS: Readonly<Record<RegularEnemyType, number>> = {
  grunt: 0.32, hound: 0.16, brute: 0.16, archer: 0.14, bomber: 0.12, shaman: 0.10,
};

export function selectRegularEnemyType(seconds: number, roll: number, weights?: RegularEnemyWeights): RegularEnemyType {
  const r = Math.max(0, Math.min(0.999999, roll));
  if (seconds < 480 || !weights) {
    if (seconds > 45 && r < 0.22) return 'hound';
    if (seconds > 90 && r < 0.32) return 'bomber';
    if (seconds > 120 && r < 0.48) return 'brute';
    if (seconds > 150 && r < 0.60) return 'archer';
    if (seconds > 210 && r < 0.68) return 'shaman';
    return 'grunt';
  }

  const order: readonly RegularEnemyType[] = ['grunt', 'hound', 'brute', 'archer', 'bomber', 'shaman'];
  let total = 0;
  for (const type of order) total += LATE_BASE_WEIGHTS[type] * Math.max(0, weights[type]);
  if (total <= 0) return 'grunt';
  let threshold = r * total;
  for (const type of order) {
    threshold -= LATE_BASE_WEIGHTS[type] * Math.max(0, weights[type]);
    if (threshold <= 0) return type;
  }
  return 'shaman';
}

export class EnemyManager {
  enemies: Enemy[] = [];
  feedback: CombatFeedbackSink | null = null;
  private projectiles: EnemyProjectileView[] = [];
  private deaths: EnemyDeathEvent[] = [];
  private spawnPortalVfx: Array<{pos:Vec2;kind:'regular'|'specialist'|'elite'|'boss';target:EnemyTarget;ttl:number}> = [];
  private spawnLaneMemory: SpawnLaneMemoryPortal[] = [];
  private archerProjectileImpactVfx: Array<{pos:Vec2;incoming:Vec2;ttl:number}> = [];
  private bossProjectileImpactVfx: Array<{pos:Vec2;archetype:BossArchetype;incoming:Vec2;ttl:number;maxTtl:number}> = [];
  private projectileGuardImpactVfx: Array<{pos:Vec2;incoming:Vec2;preventionRatio:number;ttl:number;maxTtl:number}> = [];
  private projectileCoreGuardImpactVfx: Array<{pos:Vec2;incoming:Vec2;preventionRatio:number;ttl:number;maxTtl:number}> = [];
  private coreContactGuardImpactVfx: Array<{pos:Vec2;incoming:Vec2;preventionRatio:number;ttl:number;maxTtl:number}> = [];
  private coreMixedPressureGuardArbitration: CoreMixedPressureGuardArbitrationState = createCoreMixedPressureGuardArbitrationState();
  private projectileImpactCountHold: ProjectileImpactCountHoldEntry[] = [];
  private projectileImpactLabelAnchorHold: ProjectileImpactLabelAnchorHoldEntry[] = [];
  private projectileImpactIdentityCoherence: ProjectileImpactSharedIdentityEntry[] = [];
  private regularEnemyActionVfx: Array<{pos:Vec2;kind:RegularEnemyActionVfxKind;ttl:number;maxTtl:number}> = [];
  private eliteAffixResponseVfx: Array<{pos:Vec2;enemyId:number;affixId:EliteAffixId;ttl:number;maxTtl:number}> = [];
  private specialistReactionVfx: Array<{pos:Vec2;targetPos?:Vec2;enemyId:number;type:SpecialistEnemyType;ttl:number;maxTtl:number}> = [];
  private specialistStrikeOriginVfx: Array<{pos:Vec2;origin:Vec2;target:Vec2;recoveryFacing:Vec2;enemyId:number;type:SpecialistEnemyType;ttl:number;maxTtl:number}> = [];
  private nullifierHeroInside = new Set<number>();
  private nextId = 1;
  private spawnTimer = 0;
  private eliteTimer = 30;
  private bossTimer = 120;
  private bossSpawnCount = 0;
  private bossEncounterModifiers: BossEncounterModifiers = { bossDamageTakenMultiplier: 1, specialCadenceMultiplier: 1, summonCountMultiplier: 1, dashDistanceMultiplier: 1 };
  private endlessHealthMultiplier = 1;
  private endlessDamageMultiplier = 1;
  private endlessProjectileSpeedMultiplier = 1;
  private activeReducedMotion = false;
  private endlessEliteHealthMultiplier = 1;

  get bossCountdown(): number { return Math.max(0, this.bossTimer); }
  get activeProjectileCount(): number { return this.projectiles.length; }
  projectileThreatViews(): EnemyProjectileView[] { return this.projectiles.map((p)=>{const threat=projectileThreatPositionHandoff({gameplayPos:p.pos,launchOffset:p.visualLaunchOffset,launchTtl:p.visualLaunchTtl,launchMaxTtl:p.visualLaunchMaxTtl},this.activeReducedMotion);return {...p,pos:{...p.pos},vel:{...p.vel},visualPos:{...threat.pos}};}); }
  coreWorldGuardPresentationState(): {owner:CoreMixedPressureGuardArbitrationState['owner'];strength:number} { const projectileStrength=this.projectileCoreGuardImpactVfx.reduce((best,cue)=>Math.max(best,cue.preventionRatio*Math.max(0,Math.min(1,cue.ttl/Math.max(.001,cue.maxTtl)))),0),contactStrength=this.coreContactGuardImpactVfx.reduce((best,cue)=>Math.max(best,cue.preventionRatio*Math.max(0,Math.min(1,cue.ttl/Math.max(.001,cue.maxTtl)))),0),state=advanceCoreMixedPressureGuardArbitration(this.coreMixedPressureGuardArbitration,{projectileStrength,contactStrength},0);return{owner:state.owner,strength:Math.max(projectileStrength,contactStrength)}; }
  spawnPortalViews(): SpawnPortalView[] { return this.spawnPortalVfx.map((portal)=>({...portal,pos:{...portal.pos}})); }
  spawnLanePresentationViews(): SpawnPortalView[] { return this.spawnLaneMemory.map((portal)=>({...portal,pos:{...portal.pos}})); }

  reset(): void {
    this.enemies = [];
    this.projectiles = [];
    this.deaths = [];
    this.spawnPortalVfx = [];
    this.spawnLaneMemory = [];
    this.archerProjectileImpactVfx = [];
    this.bossProjectileImpactVfx = [];
    this.projectileGuardImpactVfx = [];
    this.projectileCoreGuardImpactVfx = [];
    this.coreContactGuardImpactVfx = [];
    this.coreMixedPressureGuardArbitration = createCoreMixedPressureGuardArbitrationState();
    this.projectileImpactCountHold = [];
    this.projectileImpactLabelAnchorHold = [];
    this.projectileImpactIdentityCoherence = [];
    this.regularEnemyActionVfx = [];
    this.eliteAffixResponseVfx = [];
    this.specialistReactionVfx = [];
    this.specialistStrikeOriginVfx = [];
    this.nullifierHeroInside.clear();
    this.nextId = 1;
    this.spawnTimer = 0;
    this.eliteTimer = 30;
    this.bossTimer = 120;
    this.bossSpawnCount = 0;
    this.bossEncounterModifiers = { bossDamageTakenMultiplier: 1, specialCadenceMultiplier: 1, summonCountMultiplier: 1, dashDistanceMultiplier: 1 };
    this.endlessHealthMultiplier = 1;
    this.endlessDamageMultiplier = 1;
    this.endlessProjectileSpeedMultiplier = 1;
    this.endlessEliteHealthMultiplier = 1;
  }

  setEndlessScaling(healthMultiplier: number, damageMultiplier: number, projectileSpeedMultiplier: number, eliteHealthMultiplier = 1): void {
    this.endlessHealthMultiplier = Math.max(1, Math.min(2, Number.isFinite(healthMultiplier) ? healthMultiplier : 1));
    this.endlessDamageMultiplier = Math.max(1, Math.min(1.7, Number.isFinite(damageMultiplier) ? damageMultiplier : 1));
    this.endlessProjectileSpeedMultiplier = Math.max(0.85, Math.min(1.35, Number.isFinite(projectileSpeedMultiplier) ? projectileSpeedMultiplier : 1));
    this.endlessEliteHealthMultiplier = Math.max(1, Math.min(1.3, Number.isFinite(eliteHealthMultiplier) ? eliteHealthMultiplier : 1));
  }

  setBossEncounterModifiers(modifiers: BossEncounterModifiers): void { this.bossEncounterModifiers = { ...modifiers }; }
  getBossEncounterModifiers(): BossEncounterModifiers { return { ...this.bossEncounterModifiers }; }

  update(dt: number, ctx: EnemyUpdateContext): void {
    this.activeReducedMotion = ctx.reducedMotion ?? false;
    const director = directorSnapshot(ctx.elapsed);
    this.spawnTimer -= dt;
    this.eliteTimer -= dt;
    this.bossTimer -= dt;
    for (const portal of this.spawnPortalVfx) portal.ttl -= Math.max(0, dt);
    this.spawnPortalVfx = this.spawnPortalVfx.filter((portal) => portal.ttl > 0);
    this.spawnLaneMemory = advanceSpawnLaneMemory(this.spawnLaneMemory, dt);
    for (const cue of this.regularEnemyActionVfx) cue.ttl -= Math.max(0, dt);
    this.regularEnemyActionVfx = this.regularEnemyActionVfx.filter((cue) => cue.ttl > 0);
    for (const cue of this.eliteAffixResponseVfx) cue.ttl -= Math.max(0, dt);
    this.eliteAffixResponseVfx = this.eliteAffixResponseVfx.filter((cue) => cue.ttl > 0);
    for (const cue of this.specialistReactionVfx) cue.ttl -= Math.max(0, dt);
    for (const cue of this.specialistStrikeOriginVfx) cue.ttl -= Math.max(0, dt);
    for (const cue of this.projectileGuardImpactVfx) cue.ttl -= Math.max(0, dt);
    this.projectileGuardImpactVfx = this.projectileGuardImpactVfx.filter((cue)=>cue.ttl>0);
    for (const cue of this.projectileCoreGuardImpactVfx) cue.ttl -= Math.max(0, dt);
    this.projectileCoreGuardImpactVfx = this.projectileCoreGuardImpactVfx.filter((cue)=>cue.ttl>0);
    for (const cue of this.coreContactGuardImpactVfx) cue.ttl -= Math.max(0, dt);
    this.coreContactGuardImpactVfx = this.coreContactGuardImpactVfx.filter((cue)=>cue.ttl>0);
    const projectileCoreGuardStrength=this.projectileCoreGuardImpactVfx.reduce((best,cue)=>Math.max(best,cue.preventionRatio*Math.max(0,Math.min(1,cue.ttl/Math.max(.001,cue.maxTtl)))),0);
    const contactCoreGuardStrength=this.coreContactGuardImpactVfx.reduce((best,cue)=>Math.max(best,cue.preventionRatio*Math.max(0,Math.min(1,cue.ttl/Math.max(.001,cue.maxTtl)))),0);
    this.coreMixedPressureGuardArbitration=advanceCoreMixedPressureGuardArbitration(this.coreMixedPressureGuardArbitration,{projectileStrength:projectileCoreGuardStrength,contactStrength:contactCoreGuardStrength},dt);
    this.specialistReactionVfx = this.specialistReactionVfx.filter((cue) => cue.ttl > 0);
    this.specialistStrikeOriginVfx = this.specialistStrikeOriginVfx.filter((cue) => cue.ttl > 0);

    if (this.spawnTimer <= 0 && this.enemies.length < director.enemyBudget) {
      const burst = Math.max(1, Math.ceil(director.spawnBurst * (ctx.spawnPressureMultiplier ?? 1)));
      for (let i = 0; i < burst && this.enemies.length < director.enemyBudget; i++) this.spawnRegular(ctx.elapsed, director.danger, ctx.regularWeights);
      this.spawnTimer += director.spawnInterval;
    }
    if (this.eliteTimer <= 0 && this.enemies.length < director.enemyBudget) {
      this.spawn('elite', director.danger, Math.random() < 0.35 ? 'core' : 'hero');
      this.eliteTimer += director.eliteInterval * (ctx.eliteIntervalMultiplier ?? 1);
    }
    if (this.bossTimer <= 0 && this.enemies.length < director.enemyBudget) {
      const id = this.spawn('boss', director.danger, 'hero');
      const boss = this.enemies.find((candidate) => candidate.id === id);
      if (boss) {
        const curve = ctx.bossCurve?.(boss.bossOrdinal ?? 0, ctx.elapsed, ctx.apexThreatLevel ?? 0);
        if (curve) {
          boss.maxHp = Math.round(boss.maxHp * curve.healthMultiplier);
          boss.hp = boss.maxHp;
          boss.damage *= curve.damageMultiplier;
          boss.xp = Math.max(1, Math.round(boss.xp * curve.rewardMultiplier));
          boss.gold = Math.max(1, Math.round(boss.gold * curve.rewardMultiplier));
          boss.specialTimer = (boss.specialTimer ?? 1) * curve.initialSpecialTimerMultiplier;
        }
        const mythic = mythicBossProfile(ctx.elapsed, ctx.apexThreatLevel ?? 0, boss.bossOrdinal ?? 0);
        if (mythic.active) {
          const mod = mythicPressureModifiers(mythic);
          boss.isMythic = true;
          boss.mythicChannels = [...mythic.channels];
          boss.isApex = false;
          boss.apexSecondaryArchetype = undefined;
          boss.maxHp = Math.round(boss.maxHp * mod.healthMultiplier);
          boss.hp = boss.maxHp;
          boss.damage *= mod.damageMultiplier;
          boss.xp = Math.round(boss.xp * mod.rewardMultiplier);
          boss.gold = Math.round(boss.gold * mod.rewardMultiplier);
        } else {
          const apex = apexBossProfile(ctx.elapsed, ctx.apexThreatLevel ?? 0, boss.bossOrdinal ?? 0);
          boss.isApex = apex.active;
          boss.apexSecondaryArchetype = apex.secondaryArchetype ?? undefined;
        }
      }
      this.bossTimer += director.bossInterval;
    }

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const previousPos = { x: enemy.pos.x, y: enemy.pos.y };
      let renderMotionCommitted = false;
      let didAttackThisFrame = false;
      let attackResolveCommitted = false;
      const commitRenderMotion = () => {
        if (renderMotionCommitted) return;
        enemy.renderMotion = advanceEnemyMotionRenderState(enemy.renderMotion, enemy.pos.x - previousPos.x, enemy.pos.y - previousPos.y, dt, enemy.radius);
        if(enemy.type==='boss')enemy.bossGroundOriginRebase=advanceBossGroundOriginRebaseState(enemy.bossGroundOriginRebase,{x:enemy.pos.x,y:enemy.pos.y,phase:bossPhaseForRatio(enemy.hp/Math.max(1,enemy.maxHp)),cycle:enemy.bossCycle??0},dt,enemy.radius,false);
        renderMotionCommitted = true;
      };
      const commitAttackResolve = () => {
        if (attackResolveCommitted) return;
        enemy.attackResolveMotion = advanceEnemyAttackResolveState(enemy.attackResolveMotion, enemy.type, didAttackThisFrame, dt);
        attackResolveCommitted = true;
      };
      enemy.attackTimer -= dt;
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      enemy.bossSpecialOriginHandoff=advanceBossSpecialOriginHandoffState(enemy.bossSpecialOriginHandoff,null,dt,enemy.radius,false);
      if(enemy.spawnGroundMaterialize)enemy.spawnGroundMaterialize=advanceEnemyPortalGroundMaterializeState(enemy.spawnGroundMaterialize,null,dt,ctx.reducedMotion??false);
      if (enemy.slowTimer > 0) enemy.slowTimer -= dt;
      else enemy.slowFactor = 1;
      if (isSpecialistEnemyType(enemy.type)) enemy.specialistLocomotionSignature = advanceSpecialistLocomotionSignatureState(enemy.specialistLocomotionSignature, enemy.type, null, dt);
      if (enemy.type === 'assassin') {
        enemy.specialistTimer = (enemy.specialistTimer ?? SPECIALIST_COMBAT_CONTRACT.assassinBlinkResetSeconds) - dt;
        if ((enemy.specialistTimer ?? 0) <= 0 && distance(enemy.pos, ctx.hero.pos) > 130) {
          const blinkOrigin={...enemy.pos};
          const blink = assassinBlinkPosition(enemy.pos, ctx.hero.pos);
          enemy.pos.x = Math.max(ARENA_MARGIN + enemy.radius, Math.min(LOGICAL_WIDTH - ARENA_MARGIN - enemy.radius, blink.x));
          enemy.pos.y = Math.max(ARENA_MARGIN + 55 + enemy.radius, Math.min(LOGICAL_HEIGHT - ARENA_MARGIN - enemy.radius, blink.y));
          this.queueSpecialistReactionVfx(enemy,'assassin',blinkOrigin,{...enemy.pos},0.58);
          enemy.specialistLocomotionSignature = advanceSpecialistLocomotionSignatureState(enemy.specialistLocomotionSignature,'assassin','blink',0);
          enemy.specialistTimer = SPECIALIST_COMBAT_CONTRACT.assassinBlinkResetSeconds;
        }
      }

      if (enemy.type === 'boss') { const recoveryArchetype=enemy.bossArchetype??bossArchetypeForOrdinal(enemy.bossOrdinal??0); enemy.bossSpecialRecovery=advanceBossSpecialRecoveryState(enemy.bossSpecialRecovery,false,dt,recoveryArchetype); enemy.bossHeavyHitStagger=advanceBossHeavyHitStaggerState(enemy.bossHeavyHitStagger,null,dt); enemy.bossVariantTier = bossVariantTierForOrdinal(enemy.bossOrdinal ?? 0, ctx.bossVariantBonus ?? 0); }
      if ((enemy.regenPerSecondRatio ?? 0) > 0 && enemy.hp > 0 && enemy.hp < enemy.maxHp) {
        const hpBeforeRegen = enemy.hp;
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.maxHp * (enemy.regenPerSecondRatio ?? 0) * dt);
        if (enemy.hp > hpBeforeRegen && enemy.eliteAffixes?.includes('regenerating')) this.queueEliteAffixResponseVfx(enemy,'regenerating');
      }
      if (enemy.type === 'boss') this.updateBossSpecial(enemy, dt, ctx, director.danger, director.enemyBudget, ctx.bossVariantBonus ?? 0);

      const targetObj = enemy.target === 'core' ? ctx.core : ctx.hero;
      const toTarget = { x: targetObj.pos.x - enemy.pos.x, y: targetObj.pos.y - enemy.pos.y };
      const dist = Math.hypot(toTarget.x, toTarget.y);
      const contact = enemy.radius + targetObj.radius + 5;
      if(enemy.type==='nullifier'){const inside=distance(enemy.pos,ctx.hero.pos)<=SPECIALIST_COMBAT_CONTRACT.nullifierEffectRadius+enemy.radius;const wasInside=this.nullifierHeroInside.has(enemy.id);if(inside&&!wasInside){this.nullifierHeroInside.add(enemy.id);this.queueSpecialistReactionVfx(enemy,'nullifier',enemy.pos,ctx.hero.pos,0.64);}else if(!inside&&wasInside)this.nullifierHeroInside.delete(enemy.id);}

      if (enemy.type === 'golden') {
        const away = normalize({ x: enemy.pos.x - ctx.hero.pos.x, y: enemy.pos.y - ctx.hero.pos.y });
        const center = { x: LOGICAL_WIDTH / 2, y: LOGICAL_HEIGHT / 2 };
        const toCenter = normalize({ x: center.x - enemy.pos.x, y: center.y - enemy.pos.y });
        const edgeX = Math.min(enemy.pos.x - ARENA_MARGIN, LOGICAL_WIDTH - ARENA_MARGIN - enemy.pos.x);
        const edgeY = Math.min(enemy.pos.y - (ARENA_MARGIN + 55), LOGICAL_HEIGHT - ARENA_MARGIN - enemy.pos.y);
        const edgePull = Math.min(edgeX, edgeY) < 95 ? 0.75 : 0.16;
        const flee = normalize({ x: away.x + toCenter.x * edgePull, y: away.y + toCenter.y * edgePull });
        const speed = enemy.speed * enemy.slowFactor * (ctx.enemySpeedMultiplier ?? 1);
        enemy.pos.x = Math.max(ARENA_MARGIN + enemy.radius, Math.min(LOGICAL_WIDTH - ARENA_MARGIN - enemy.radius, enemy.pos.x + flee.x * speed * dt));
        enemy.pos.y = Math.max(ARENA_MARGIN + 55 + enemy.radius, Math.min(LOGICAL_HEIGHT - ARENA_MARGIN - enemy.radius, enemy.pos.y + flee.y * speed * dt));
        commitRenderMotion();
        commitAttackResolve();
        continue;
      }

      if (enemy.type === 'bomber' && dist <= contact + 34) {
        didAttackThisFrame = true;
        this.detonateBomber(enemy, ctx);
        commitAttackResolve();
        continue;
      }

      if (enemy.type === 'shaman' && dist <= enemy.preferredRange) {
        if (enemy.attackTimer <= 0) {
          didAttackThisFrame = true;
          this.healNearby(enemy);
          enemy.attackTimer = enemy.attackInterval;
        }
        commitRenderMotion();
        commitAttackResolve();
        continue;
      }
      if (enemy.type === 'nullifier' && dist <= enemy.preferredRange) {
        commitRenderMotion();
        commitAttackResolve();
        continue;
      }

      if (enemy.type === 'archer' && dist <= enemy.preferredRange) {
        if (enemy.attackTimer <= 0) {
          didAttackThisFrame = true;
          this.fireEnemyProjectile(enemy, targetObj.pos, ctx.reducedMotion??false);
          enemy.attackTimer = enemy.attackInterval;
        }
      } else if (dist > contact) {
        const dir = normalize(toTarget);
        const bossSpeed = enemy.type === 'boss'
          ? bossVariantTuning(bossArchetypeTuning(enemy.bossArchetype ?? bossArchetypeForOrdinal(enemy.bossOrdinal ?? 0), bossPhaseForRatio(enemy.hp / enemy.maxHp)), bossVariantTierForOrdinal(enemy.bossOrdinal ?? 0, ctx.bossVariantBonus ?? 0)).speedMultiplier
          : 1;
        const commandBoost = this.commandAuraBoost(enemy);
        const speed = enemy.speed * enemy.slowFactor * (ctx.enemySpeedMultiplier ?? 1) * bossSpeed * commandBoost;
        enemy.pos.x += dir.x * speed * dt;
        enemy.pos.y += dir.y * speed * dt;
      } else if (enemy.attackTimer <= 0) {
        didAttackThisFrame = true;
        if(isSpecialistEnemyType(enemy.type)&&enemy.type!=='nullifier'){const dir=normalize({x:targetObj.pos.x-enemy.pos.x,y:targetObj.pos.y-enemy.pos.y});const strike=specialistStrikeOriginCoherencePresentation({type:enemy.type,radius:enemy.radius,facingX:dir.x,facingY:dir.y,pullback:0,lunge:1,resolve:0,silhouetteForward:enemy.radius*.42,silhouetteLateral:0},ctx.reducedMotion??false);const maxTtl=.18;this.specialistStrikeOriginVfx.push({pos:{...enemy.pos},origin:{x:enemy.pos.x+strike.originOffsetX,y:enemy.pos.y+strike.originOffsetY},target:{...targetObj.pos},recoveryFacing:{x:enemy.renderMotion?.facingX??dir.x,y:enemy.renderMotion?.facingY??dir.y},enemyId:enemy.id,type:enemy.type,ttl:maxTtl,maxTtl});if(this.specialistStrikeOriginVfx.length>24)this.specialistStrikeOriginVfx.splice(0,this.specialistStrikeOriginVfx.length-24);}
        const frenzyDamage = enemy.hp / Math.max(1, enemy.maxHp) <= 0.42 ? (enemy.lowHpDamageMultiplier ?? 1) : 1;
        // Legacy source continuity: if (enemy.target === 'core') ctx.onCoreDamage(...)
        if (enemy.target === 'core') {
          const appliedResult=ctx.onCoreDamage(enemy.damage * frenzyDamage,'contact',enemy.pos);
          const rawDamage=enemy.damage * frenzyDamage;
          const applied=typeof appliedResult==='number'&&Number.isFinite(appliedResult)?Math.max(0,appliedResult):rawDamage;
          const preventionRatio=rawDamage>0?Math.max(0,Math.min(1,1-applied/rawDamage)):0;
          const maxTtl=.4,contactGuard=coreContactGuardMemoryPresentation({preventedRatio:preventionRatio,ttl:maxTtl,maxTtl},false);
          if(contactGuard.owner==='contact-guard'){this.coreContactGuardImpactVfx.push({pos:{...targetObj.pos},incoming:{x:targetObj.pos.x-enemy.pos.x,y:targetObj.pos.y-enemy.pos.y},preventionRatio,ttl:maxTtl,maxTtl});if(this.coreContactGuardImpactVfx.length>12)this.coreContactGuardImpactVfx.splice(0,this.coreContactGuardImpactVfx.length-12);}
        } else ctx.onHeroDamage(enemy.damage * frenzyDamage, 'contact');
        if(enemy.type === 'siegeGolem'){ this.queueSpecialistReactionVfx(enemy,'siegeGolem',enemy.pos,targetObj.pos,0.56); enemy.specialistLocomotionSignature = advanceSpecialistLocomotionSignatureState(enemy.specialistLocomotionSignature,'siegeGolem','plant',0); }
        if (enemy.eliteAffixes?.includes('swift')) this.queueEliteAffixResponseVfx(enemy,'swift');
        enemy.attackTimer = enemy.attackInterval;
      }
      commitRenderMotion();
      commitAttackResolve();
    }

    this.updateProjectiles(dt, ctx);
    const impactHoldInputs=[...this.archerProjectileImpactVfx.map((cue)=>({impact:cue.pos,incoming:cue.incoming,sourceClass:'archer' as const})),...this.bossProjectileImpactVfx.map((cue)=>({impact:cue.pos,incoming:cue.incoming,sourceClass:'boss' as const}))];
    const impactHoldClusters=projectileImpactClusters({impacts:impactHoldInputs,quality:'high',reducedFlash:false});
    const impactIdentity=updateProjectileImpactIdentityCoherence(this.projectileImpactIdentityCoherence,impactHoldClusters,dt);this.projectileImpactIdentityCoherence=impactIdentity.memory;
    if(impactIdentity.retiredIdentityIds.length){this.projectileImpactCountHold=retireProjectileImpactCountHoldIdentities(this.projectileImpactCountHold,impactIdentity.retiredIdentityIds);this.projectileImpactLabelAnchorHold=retireProjectileImpactLabelAnchorIdentities(this.projectileImpactLabelAnchorHold,impactIdentity.retiredIdentityIds);}
    this.projectileImpactCountHold=updateProjectileImpactCountHold(this.projectileImpactCountHold,impactHoldClusters,dt,impactIdentity.keys);
    const impactHoldCounts=impactHoldClusters.map((cluster,index)=>projectileImpactHeldCount(this.projectileImpactCountHold,cluster,impactIdentity.keys[index]??null));
    const impactHoldDisplayClusters=impactHoldClusters.map((cluster,index)=>({...cluster,count:impactHoldCounts[index]??cluster.count}));
    const impactHoldPlacements=projectileImpactLabelPlacements({clusters:impactHoldDisplayClusters,stamps:impactHoldInputs.map((entry)=>entry.impact),width:LOGICAL_WIDTH,height:LOGICAL_HEIGHT});
    this.projectileImpactLabelAnchorHold=updateProjectileImpactLabelAnchorHold(this.projectileImpactLabelAnchorHold,impactHoldDisplayClusters,impactHoldPlacements,dt,impactIdentity.keys);
    this.enemies = this.enemies.filter((enemy) => enemy.alive);
    const liveNullifiers=new Set(this.enemies.filter((enemy)=>enemy.type==='nullifier').map((enemy)=>enemy.id));for(const id of this.nullifierHeroInside)if(!liveNullifiers.has(id))this.nullifierHeroInside.delete(id);
  }

  damage(enemy: Enemy, amount: number, source?: Vec2, visualSource:EnemyDeathVisualSource='normal'): boolean {
    if (!enemy.alive || amount <= 0) return false;
    const hpRatioBeforeDamage = enemy.hp / Math.max(1, enemy.maxHp);
    let remaining = amount;
    if ((enemy.guardHp ?? 0) > 0) {
      const guardBefore=enemy.guardHp ?? 0;
      const blocked = Math.min(enemy.guardHp ?? 0, remaining * 0.72);
      enemy.guardHp = Math.max(0, (enemy.guardHp ?? 0) - blocked);
      const guardBroken=guardBefore>0&&(enemy.guardHp ?? 0)<=0;
      if(blocked>0&&enemy.type==='shieldbearer'){this.queueSpecialistReactionVfx(enemy,'shieldbearer',enemy.pos,undefined,guardBroken?0.66:0.44);enemy.specialistLocomotionSignature=advanceSpecialistLocomotionSignatureState(enemy.specialistLocomotionSignature,'shieldbearer','brace',0);}
      remaining -= blocked;
    }
    if ((enemy.manaShield ?? 0) > 0) {
      const absorbed = Math.min(enemy.manaShield ?? 0, remaining);
      enemy.manaShield = Math.max(0, (enemy.manaShield ?? 0) - absorbed);
      remaining -= absorbed;
      if (absorbed > 0 && enemy.eliteAffixes?.includes('manaShield')) this.queueEliteAffixResponseVfx(enemy,'manaShield');
    }
    const bossEncounterMultiplier = enemy.type === 'boss' ? this.bossEncounterModifiers.bossDamageTakenMultiplier : 1;
    enemy.hp -= remaining * (enemy.damageTakenMultiplier ?? 1) * bossEncounterMultiplier;
    if (remaining > 0 && enemy.eliteAffixes?.includes('armored')) this.queueEliteAffixResponseVfx(enemy,'armored');
    if (hpRatioBeforeDamage > 0.42 && enemy.hp / Math.max(1, enemy.maxHp) <= 0.42 && enemy.eliteAffixes?.includes('frenzied')) this.queueEliteAffixResponseVfx(enemy,'frenzied');
    enemy.hitFlash = 0.10;
    const killed = enemy.hp <= 0;
    const impactTier = impactTierForDamage(amount, enemy.maxHp);
    const fallbackDirection={x:-(enemy.renderMotion?.facingX??1),y:-(enemy.renderMotion?.facingY??0)};
    const hitVector=source?normalize({x:enemy.pos.x-source.x,y:enemy.pos.y-source.y}):fallbackDirection;
    enemy.hitImpactTier=impactTier; enemy.hitDirectionX=hitVector.x; enemy.hitDirectionY=hitVector.y;
    if(enemy.type==='boss'&&impactTier !== 'normal')enemy.bossHeavyHitStagger=advanceBossHeavyHitStaggerState(enemy.bossHeavyHitStagger,{tier:impactTier,directionX:hitVector.x,directionY:hitVector.y},0);
    this.feedback?.addHit(enemy.pos, amount, impactTier, enemy.type, source);
    if (enemy.type === 'boss' && impactTier !== 'normal') this.feedback?.addImpact(enemy.pos, 'bossHit');
    if (!killed) return false;
    enemy.alive = false;
    const mythicLastLawReward = enemy.type === 'boss' && enemy.isMythic ? 1.12 : 1;
    this.deaths.push({
      x: enemy.pos.x, y: enemy.pos.y, xp: Math.round(enemy.xp * mythicLastLawReward), gold: Math.round(enemy.gold * mythicLastLawReward), type: enemy.type,
      ...(enemy.type === 'boss' && enemy.bossArchetype ? { bossArchetype: enemy.bossArchetype } : {}),
      wasSlowed: enemy.slowTimer > 0 || enemy.slowFactor < 0.99,
      visualSource,
      ...(enemy.type!=='boss'?{deathPose:{radius:enemy.radius,facingX:enemy.renderMotion?.facingX??1,facingY:enemy.renderMotion?.facingY??0,motionBlend:enemy.renderMotion?.motionBlend??0,turn:enemy.renderMotion?.turn??0,impactX:enemy.hitDirectionX??fallbackDirection.x,impactY:enemy.hitDirectionY??fallbackDirection.y,tier:impactTier}}:{}),
    });
    return true;
  }

  applySlow(enemy: Enemy, factor: number, duration: number): void {
    enemy.slowFactor = Math.min(enemy.slowFactor, Math.max(0.25, factor));
    enemy.slowTimer = Math.max(enemy.slowTimer, duration);
  }

  pushAway(enemy: Enemy, origin: Vec2, distanceAmount: number): void {
    if (!enemy.alive || distanceAmount <= 0) return;
    const dir = normalize({ x: enemy.pos.x - origin.x, y: enemy.pos.y - origin.y });
    const resistance = enemy.type === 'boss' ? 0.18 : enemy.type === 'elite' ? 0.45 : 1;
    enemy.pos.x += dir.x * distanceAmount * resistance;
    enemy.pos.y += dir.y * distanceAmount * resistance;
  }

  markLastDeathVisualSource(source:EnemyDeathVisualSource):void {
    const death=this.deaths[this.deaths.length-1];
    if(death)death.visualSource=source;
  }

  drainDeaths(): EnemyDeathEvent[] {
    if (this.deaths.length === 0) return [];
    const out = this.deaths;
    this.deaths = [];
    return out;
  }

  spawnEventEnemy(type: EnemyType, danger: number, target: EnemyTarget = 'hero', pos?: Vec2): number {
    return this.spawn(type, danger, target, pos);
  }

  removeEnemyById(id: number): void {
    const enemy = this.enemies.find((candidate) => candidate.id === id);
    if (enemy) enemy.alive = false;
    this.enemies = this.enemies.filter((candidate) => candidate.alive);
  }

  nearestEnemy(pos: Vec2, predicate: (enemy: Enemy) => boolean = () => true): Enemy | null {
    let best: Enemy | null = null;
    let bestD = Number.POSITIVE_INFINITY;
    for (const enemy of this.enemies) {
      if (!enemy.alive || !predicate(enemy)) continue;
      const d = distance(pos, enemy.pos);
      if (d < bestD) { best = enemy; bestD = d; }
    }
    return best;
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.renderProjectiles(ctx);
    this.renderEnemies(ctx);
  }

  private drawProjectileImpactSourceContinuity(ctx:CanvasRenderingContext2D,pos:Vec2,incoming:Vec2,sourceClass:'archer'|'boss',quality:PresentationQuality,reducedFlash:boolean):void {
    const segment=projectileImpactSourceContinuity({impact:pos,incoming,sourceClass,quality,reducedFlash}); if(!segment)return;
    ctx.save();ctx.globalAlpha=segment.alpha;ctx.strokeStyle=segment.accent;ctx.lineWidth=sourceClass==='boss'?3:2;ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(segment.start.x,segment.start.y);ctx.lineTo(segment.end.x,segment.end.y);ctx.stroke();ctx.setLineDash([]);ctx.restore();
  }

  private drawProjectileImpactSourceCluster(ctx:CanvasRenderingContext2D,cluster:ProjectileImpactCluster,heldCount:number,labelPlacement?:ProjectileImpactLabelPlacement):void {
    ctx.save();ctx.globalAlpha=cluster.alpha;ctx.strokeStyle=cluster.accent;ctx.fillStyle=cluster.accent;ctx.lineWidth=cluster.sourceClass==='boss'?3:2;ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(cluster.start.x,cluster.start.y);ctx.lineTo(cluster.end.x,cluster.end.y);ctx.stroke();ctx.setLineDash([]);
    if(heldCount>1&&labelPlacement?.visible){ctx.font='700 10px system-ui';ctx.textAlign='center';ctx.fillText(`×${heldCount}`,labelPlacement.pos.x,labelPlacement.pos.y);}
    ctx.restore();
  }

  projectileImpactLabelBlockers(presentationQuality:PresentationQuality='high',reducedFlash=false):Vec2[]{
    const impactClusterInputs=[...this.archerProjectileImpactVfx.map((cue)=>({impact:cue.pos,incoming:cue.incoming,sourceClass:'archer' as const})),...this.bossProjectileImpactVfx.map((cue)=>({impact:cue.pos,incoming:cue.incoming,sourceClass:'boss' as const}))];
    const impactClusters=projectileImpactClusters({impacts:impactClusterInputs,quality:presentationQuality,reducedFlash}),identityKeys=projectileImpactIdentityKeys(this.projectileImpactIdentityCoherence,impactClusters),heldCounts=impactClusters.map((cluster,index)=>projectileImpactHeldCount(this.projectileImpactCountHold,cluster,identityKeys[index]??null)),displayClusters=impactClusters.map((cluster,index)=>({...cluster,count:heldCounts[index]??cluster.count})),fallback=projectileImpactLabelPlacements({clusters:displayClusters,stamps:impactClusterInputs.map(entry=>entry.impact),width:LOGICAL_WIDTH,height:LOGICAL_HEIGHT}),placements=projectileImpactAnchoredPlacements(this.projectileImpactLabelAnchorHold,displayClusters,fallback,identityKeys);
    return placements.filter((placement)=>placement.visible).map((placement)=>({...placement.pos}));
  }

  renderProjectiles(ctx: CanvasRenderingContext2D, bossSpecialVfxAtlasImage: CanvasImageSource | null = null, bossSpecialVfxAtlasReady = false, battlefieldEnvironmentReactionVfxAtlasImage: CanvasImageSource | null = null, battlefieldEnvironmentReactionVfxAtlasReady = false, bossProjectileLifecycleVfxAtlasImage: CanvasImageSource | null = null, bossProjectileLifecycleVfxAtlasReady = false, presentationQuality: PresentationQuality = 'high', reducedFlash = false, reducedMotion = false, safeLaneOrigin:Vec2|null=null, safeLaneTarget:Vec2|null=null): void {
    const activeBossAnchorBridges=this.projectiles.filter((p)=>Boolean(p.bossArchetype&&p.visualLaunchWorldOrigin&&(p.visualLaunchTravelTtl??0)>0));
    const bossAnchorBridgeRank=new Map(activeBossAnchorBridges.map((p,index)=>[p,Math.max(0,activeBossAnchorBridges.length-1-index)]));
    const projectileResolutionRank=new Map(this.projectiles.map((p,index)=>[p,Math.max(0,this.projectiles.length-1-index)]));
    for (const projectile of this.projectiles) {
      const visualPos=projectile.visualLaunchOffset&&projectile.visualLaunchTtl!==undefined&&projectile.visualLaunchMaxTtl?rangedEnemyVisualLaunchPosition(projectile.pos,projectile.visualLaunchOffset,projectile.visualLaunchTtl,projectile.visualLaunchMaxTtl):projectile.pos;
      const trail=projectileTrailLaunchHandoffPresentation({gameplayPos:projectile.pos,velocity:projectile.vel,launchOffset:projectile.visualLaunchOffset,launchTtl:projectile.visualLaunchTtl,launchMaxTtl:projectile.visualLaunchMaxTtl,radius:projectile.radius},reducedMotion);
      const launchLife=(projectile.visualLaunchTtl??0)/Math.max(.001,projectile.visualLaunchMaxTtl??.12),travelLife=(projectile.visualLaunchTravelTtl??0)/Math.max(.001,projectile.visualLaunchTravelMaxTtl??.15),threatOwnership=threatLaunchOwnershipPresentation({launchLife,travelLife,threat:projectile.bossArchetype?1:.72},reducedFlash),travelThreatCarry=projectileTravelThreatCarryPresentation({speed:Math.hypot(projectile.vel.x,projectile.vel.y),launchLife,travelLife,radius:projectile.radius},reducedMotion,reducedFlash),directionCarryRecovery=projectileDirectionCarryRecoveryPresentation({owner:threatOwnership.owner,speed:Math.hypot(projectile.vel.x,projectile.vel.y),life:Math.max(launchLife,travelLife)},reducedMotion,reducedFlash),projectileResolution=projectileCanonicalReclaimPresentation({owner:threatOwnership.owner,launchLife,travelLife,speed:Math.hypot(projectile.vel.x,projectile.vel.y)},reducedMotion,reducedFlash),projectileResolutionBudget=continuityResolutionBudgetPresentation({activeCount:this.projectiles.length,indexFromNewest:projectileResolutionRank.get(projectile)??this.projectiles.length,kind:'projectile'},reducedMotion);
      const projectilePriority=threatCuePriorityArbitrationPresentation({threatLevel:projectile.bossArchetype?1:.72,bossSpecial:Boolean(projectile.bossArchetype),heroCritical:false,coreCritical:false,safeLaneVisible:true},reducedFlash),projectileOverlap=threatOverlapSuppressionBudgetPresentation({activeCount:this.projectiles.length,indexFromNewest:projectileResolutionRank.get(projectile)??this.projectiles.length,kind:'projectile',critical:Boolean(projectile.bossArchetype)},reducedMotion),projectileLayerBudget=battlefieldThreatLayerBudgetPresentation({projectileCount:this.projectiles.length,impactCount:0,hazardCount:0,silhouetteCount:0,criticalCount:projectile.bossArchetype?1:0},reducedMotion,reducedFlash),projectileSpatial=projectileSpatialSeparationPresentation({neighborCount:this.projectiles.length,indexFromNewest:projectileResolutionRank.get(projectile)??this.projectiles.length,radius:projectile.radius,bossCritical:Boolean(projectile.bossArchetype)},reducedMotion),projectileSpeed=Math.max(1,Math.hypot(projectile.vel.x,projectile.vel.y)),projectileNormalX=-projectile.vel.y/projectileSpeed,projectileNormalY=projectile.vel.x/projectileSpeed,bossSpatialFocus=bossCriticalFocusReservationPresentation({bossSpecial:Boolean(projectile.bossArchetype),criticalCount:projectile.bossArchetype?1:0,pressure:projectileLayerBudget.pressure},reducedFlash);
      const projectileTemporal=projectileFocusHoldPresentation({critical:Boolean(projectile.bossArchetype),life:Math.max(launchLife,travelLife),release:projectileResolution.transitionAlphaScale,pressure:projectileLayerBudget.pressure},reducedFlash),projectileTemporalBudget=temporalThreatBudgetPresentation({churn:Math.min(1,this.projectiles.length/10),pressure:projectileLayerBudget.pressure,criticalCount:projectile.bossArchetype?1:0},reducedMotion,reducedFlash);
      const projectileBodyOverlap=this.enemies.some((enemy)=>enemy.alive&&(enemy.type==='boss'||isSpecialistEnemyType(enemy.type))&&distance(enemy.pos,visualPos)<=enemy.radius+projectile.radius+10)?1:0,projectileLaneProximity=pointSegmentProximity(visualPos,safeLaneOrigin,safeLaneTarget,Math.max(54,projectile.radius*7)),projectileDepth=projectileBodyOcclusionPresentation({bodyOcclusion:projectileBodyOverlap,density:Math.min(1,this.projectiles.length/10),bossCritical:Boolean(projectile.bossArchetype)},reducedMotion),projectileLaneDepth=safeLaneProjectileCrossingPresentation({laneProximity:projectileLaneProximity,threatLevel:projectile.bossArchetype?1:.72,critical:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash),projectileDepthBudget=battlefieldDepthBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,bossTelegraph:Boolean(projectile.bossArchetype),safeLaneVisible:projectileLaneProximity>0,projectilePressure:Math.min(1,this.projectiles.length/10),impactPressure:0,hazardPressure:0},reducedMotion,reducedFlash);
      const projectileDepthRecovery=projectileDepthRecoveryPresentation({occlusion:projectileBodyOverlap,release:1-projectileResolution.transitionAlphaScale,pressure:projectileDepthBudget.pressure,critical:Boolean(projectile.bossArchetype)},reducedMotion),safeLaneDepthRecovery=safeLaneDepthRecoveryPresentation({laneProximity:projectileLaneProximity,confidence:safeLaneTarget?1:0,release:1-projectileLaneProximity,critical:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash),projectileRecoveryBudget=depthRecoveryBudgetPresentation({recoveringCount:this.projectiles.length,pressure:projectileDepthBudget.pressure,criticalCount:projectile.bossArchetype?1:0},reducedMotion,reducedFlash);
      const projectileCriticalLatch=criticalDepthLatchPresentation({critical:Boolean(projectile.bossArchetype),release:1-projectileResolution.transitionAlphaScale,pressure:projectileDepthBudget.pressure},reducedFlash),projectileCanonicalStack=canonicalBodyDepthReclaimPresentation({release:1-projectileResolution.transitionAlphaScale,pressure:projectileDepthBudget.pressure,owner:projectile.bossArchetype?'critical':projectileResolution.owner==='canonical'?'canonical':'recovery'},reducedMotion),projectileUnifiedStack=unifiedDepthStackBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,bossTelegraphCount:projectile.bossArchetype?1:0,safeLaneVisible:projectileLaneProximity>0,secondaryCount:this.projectiles.length,pressure:projectileDepthBudget.pressure},reducedMotion,reducedFlash);
      const projectileCorridorSeparation=projectileCorridorSeparationPresentation({bodyOverlap:projectileBodyOverlap,laneProximity:projectileLaneProximity,neighborCount:this.projectiles.length,critical:Boolean(projectile.bossArchetype)},reducedMotion),projectileSpatialSeparationBudget=spatialThreatSeparationBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,safeLaneVisible:projectileLaneProximity>0,projectileCount:this.projectiles.length,impactCount:0,hazardCount:0,silhouetteCount:0},reducedMotion,reducedFlash);
      const projectileCorridorRelease=projectileCorridorReleasePresentation({pressure:projectileCorridorSeparation.pressure,release:Math.max(0,1-Math.max(projectileBodyOverlap,projectileLaneProximity)),critical:Boolean(projectile.bossArchetype)},reducedMotion),projectileSpatialRecoveryBudget=spatialRecoveryBudgetPresentation({recoveringCount:this.projectiles.length,pressure:projectileCorridorSeparation.pressure,criticalCount:projectile.bossArchetype?1:0},reducedMotion,reducedFlash);
      const projectileDenseArbitration=denseProjectileArbitrationPresentation({projectileCount:this.projectiles.length,indexFromNewest:projectileResolutionRank.get(projectile)??this.projectiles.length,critical:Boolean(projectile.bossArchetype),laneProximity:projectileLaneProximity},reducedMotion,reducedFlash),projectileDenseBattlefield=denseBattlefieldArbitrationPresentation({criticalCount:projectile.bossArchetype?1:0,hazardCount:0,projectileCount:this.projectiles.length,impactCount:0,silhouetteCount:0,safeLaneVisible:projectileLaneProximity>0},reducedMotion,reducedFlash);
      const projectileDepthPlane=projectileDepthPlanePresentation({bodyOverlap:projectileBodyOverlap,laneProximity:projectileLaneProximity,crowd:Math.min(1,this.projectiles.length/12),critical:Boolean(projectile.bossArchetype)},reducedMotion),projectileDepthPlaneBudget=depthPlaneBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,projectileCount:this.projectiles.length,impactCount:0,hazardCount:0,silhouetteCount:0,safeLaneVisible:projectileLaneProximity>0},reducedMotion,reducedFlash);
      const projectileDepthReentry=projectileDepthReentryPresentation({release:Math.max(0,1-Math.max(projectileBodyOverlap,projectileLaneProximity)),pressure:projectileDepthPlane.pressure,critical:Boolean(projectile.bossArchetype)},reducedMotion),projectileDepthReentryBudget=depthReentryBudgetPresentation({reenteringCount:this.projectiles.length,pressure:projectileDepthPlane.pressure,criticalCount:projectile.bossArchetype?1:0},reducedMotion,reducedFlash);
      const projectileBossFocus=bossProjectileFocusCorridorPresentation({critical:Boolean(projectile.bossArchetype),laneProximity:projectileLaneProximity,crowd:Math.min(1,this.projectiles.length/12)},reducedMotion,reducedFlash),projectileBossFocusBudget=bossFocusCorridorBudgetPresentation({bossActive:Boolean(projectile.bossArchetype),criticalCount:projectile.bossArchetype?1:0,projectileCount:this.projectiles.length,impactCount:0,hazardCount:0,silhouetteCount:0,safeLaneVisible:projectileLaneProximity>0},reducedMotion,reducedFlash);
      const projectileCanonicalReacquisition=projectileCanonicalReacquisitionPresentation({release:projectileDepthReentry.reclaim,pressure:Math.max(projectileDepthPlane.pressure,projectileBossFocus.focus),critical:Boolean(projectile.bossArchetype)},reducedMotion),projectileCanonicalReacquisitionBudget=canonicalReacquisitionBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,projectileCount:this.projectiles.length,impactCount:0,hazardCount:0,silhouetteCount:0,safeLaneVisible:projectileLaneProximity>0},reducedMotion,reducedFlash);
      const projectileDirectionReacquisition=projectileDirectionReacquisitionPresentation({reacquire:projectileCanonicalReacquisition.reacquire,pressure:Math.max(projectileDepthPlane.pressure,projectileBossFocus.focus),critical:Boolean(projectile.bossArchetype)},reducedMotion),projectileDirectionReacquisitionBudget=directionReacquisitionBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,projectileCount:this.projectiles.length,impactCount:0,hazardCount:0,silhouetteCount:0,safeLaneVisible:projectileLaneProximity>0},reducedMotion,reducedFlash);
      const projectileCriticalReengagement=bossProjectileReengagementLockPresentation({active:Boolean(projectile.bossArchetype),critical:Boolean(projectile.bossArchetype),reacquire:projectileCanonicalReacquisition.reacquire,laneProximity:projectileLaneProximity,crowd:Math.min(1,this.projectiles.length/12)},reducedMotion,reducedFlash),projectileCriticalReengagementBudget=criticalReengagementBudgetPresentation({bossActive:Boolean(projectile.bossArchetype),criticalCount:projectile.bossArchetype?1:0,projectileCount:this.projectiles.length,impactCount:0,hazardCount:0,silhouetteCount:0,safeLaneVisible:projectileLaneProximity>0},reducedMotion,reducedFlash);
      const projectileSecondaryCeiling=projectileSecondaryCeilingPresentation({stress:Math.max(projectileDenseBattlefield.stress,projectileCriticalReengagement.lock),critical:Boolean(projectile.bossArchetype),bossActive:Boolean(projectile.bossArchetype),reacquire:projectileCanonicalReacquisition.reacquire},reducedMotion,reducedFlash),projectileSecondaryCeilingBudget=secondaryCeilingBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,crowd:Math.min(1,this.projectiles.length/12),bossActive:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash);
      const projectileEffectiveFloor=projectileEffectiveAlphaFloorPresentation({critical:Boolean(projectile.bossArchetype),bossVisual:Boolean(projectile.bossArchetype&&bossSpecialVfxAtlasReady&&bossSpecialVfxAtlasImage),laneProximity:projectileLaneProximity,reacquire:projectileCanonicalReacquisition.reacquire,crowd:Math.min(1,this.projectiles.length/12)},reducedFlash),projectileEffectiveFloorBudget=effectiveAlphaFloorBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,crowd:Math.min(1,this.projectiles.length/12),safeLaneVisible:projectileLaneProximity>0,bossActive:Boolean(projectile.bossArchetype)},reducedFlash);
      const projectileReadabilityContrast=projectileReadabilityContrastPresentation({bodyFloor:projectileEffectiveFloor.bodyAlphaFloor,trailScale:projectileSecondaryCeiling.trailScale,critical:Boolean(projectile.bossArchetype),bossActive:Boolean(projectile.bossArchetype),crowd:Math.min(1,this.projectiles.length/12)},reducedFlash),projectileReadabilityContrastBudget=readabilityContrastBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,crowd:Math.min(1,this.projectiles.length/12),bossActive:Boolean(projectile.bossArchetype),safeLaneVisible:projectileLaneProximity>0},reducedMotion,reducedFlash);
      const projectileFinalSettle=projectileFinalReadabilitySettlePresentation({primaryFloor:projectileReadabilityContrast.bodyAlphaFloor,reacquire:projectileCanonicalReacquisition.reacquire,stress:projectileReadabilityContrastBudget.stress,critical:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash),projectileFinalSettleBudget=finalReadabilitySettleBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,stress:projectileReadabilityContrastBudget.stress,bossActive:Boolean(projectile.bossArchetype),safeLaneVisible:projectileLaneProximity>0},reducedMotion,reducedFlash);
      const projectileSecondaryRecoveryGate=projectileSecondaryRecoveryGatePresentation({release:projectileFinalSettle.settle,stress:projectileFinalSettleBudget.stress,critical:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash),projectileSecondaryRecoveryGateBudget=secondaryRecoveryGateBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,stress:projectileFinalSettleBudget.stress,release:projectileFinalSettle.settle},reducedMotion,reducedFlash);
      const projectileFocusTransfer=projectileFocusTransferCoherencePresentation({incomingFocus:projectileFinalSettle.settle,outgoingFocus:Math.max(projectileBossFocus.focus,projectileLaneProximity),stress:projectileSecondaryRecoveryGateBudget.hold,critical:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash),projectileFocusTransferBudget=focusTransferCoherenceBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,stress:projectileFinalSettleBudget.stress,incomingFocus:projectileFinalSettle.settle,outgoingFocus:Math.max(projectileBossFocus.focus,projectileLaneProximity)},reducedMotion,reducedFlash);
      const projectileRecentImpactProximity=Math.max(0,...[...this.archerProjectileImpactVfx,...this.bossProjectileImpactVfx].map((cue)=>Math.max(0,1-distance(cue.pos,visualPos)/Math.max(48,projectile.radius*6))));
      const projectilePeakSeparation=projectileImpactPeakSeparationPresentation({trailPeak:Math.max(launchLife,travelLife),impactPeak:projectileRecentImpactProximity,proximity:projectileRecentImpactProximity,critical:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash),projectilePeakBudget=crossFamilyPeakBudgetPresentation({activePeakFamilies:1+(projectileRecentImpactProximity>0?1:0)+(projectileLaneProximity>0?1:0)+(projectile.bossArchetype?1:0),crowd:Math.min(1,this.projectiles.length/12),criticalCount:projectile.bossArchetype?1:0,safeLaneVisible:projectileLaneProximity>0,bossActive:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash);
      const projectileRhythmRecovery=projectileTrailRhythmRecoveryPresentation({suppression:1-projectilePeakSeparation.trailScale,release:projectileSecondaryRecoveryGate.release,stress:Math.max(projectilePeakBudget.load,projectileSecondaryRecoveryGateBudget.hold),critical:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash),projectileRhythmRecoveryBudget=rhythmRecoveryBudgetPresentation({recoveringFamilies:1+(projectileRecentImpactProximity>0?1:0),stress:Math.max(projectilePeakBudget.load,projectileSecondaryRecoveryGateBudget.hold),criticalCount:projectile.bossArchetype?1:0,safeLaneVisible:projectileLaneProximity>0,bossActive:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash);
      const projectileTemporalBody=canonicalBodyTemporalProtectionPresentation({crowd:Math.min(1,this.projectiles.length/12),secondaryPeak:projectileRhythmRecovery.secondaryScale,critical:Boolean(projectile.bossArchetype),bossActive:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash),projectileTemporalRetirement=secondaryRhythmTemporalRetirementPresentation({life:Math.max(launchLife,travelLife),churn:Math.min(1,this.projectiles.length/12),pressure:projectileRhythmRecoveryBudget.load,critical:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash);
      const bossTravel=projectile.bossArchetype&&projectile.visualLaunchWorldOrigin&&projectile.visualLaunchTravelTtl!==undefined&&projectile.visualLaunchTravelMaxTtl?bossSharedAnchorTravelContinuityPresentation({anchor:projectile.visualLaunchWorldOrigin,projectile:visualPos,velocity:projectile.vel,ttl:projectile.visualLaunchTravelTtl,maxTtl:projectile.visualLaunchTravelMaxTtl,radius:projectile.radius},reducedMotion):null;
      const bossTravelRelease=bossTravel?.visible&&projectile.visualLaunchWorldOrigin?bossAnchorTravelReleasePresentation({anchor:projectile.visualLaunchWorldOrigin,projectile:visualPos,ttl:projectile.visualLaunchTravelTtl??0,maxTtl:projectile.visualLaunchTravelMaxTtl??.15},reducedMotion):null;
      const bossBridgeBudget=bossAnchorBridgeDensityBudgetPresentation({activeCount:activeBossAnchorBridges.length,indexFromNewest:bossAnchorBridgeRank.get(projectile)??activeBossAnchorBridges.length,life:(projectile.visualLaunchTravelTtl??0)/Math.max(.001,projectile.visualLaunchTravelMaxTtl??.15)},reducedMotion,reducedFlash);
      if(bossTravelRelease&&bossTravelRelease.visible&&bossBridgeBudget.visible){ctx.save();ctx.globalAlpha=Math.min(bossTravel?.alpha??0,bossTravelRelease.alpha)*bossBridgeBudget.alphaScale*threatOwnership.travelAlphaScale*projectilePriority.secondaryAlphaScale*projectileLayerBudget.projectileDecorationScale*projectileSpatial.trailAlphaScale*bossSpatialFocus.secondaryAlphaScale*projectileTemporal.directionAlphaScale*projectileTemporalBudget.secondaryAlphaScale*projectileDepth.trailAlphaScale*projectileLaneDepth.trailAlphaScale*projectileDepthBudget.secondaryAlphaScale*projectileDepthRecovery.trailAlphaScale*safeLaneDepthRecovery.trailAlphaScale*projectileRecoveryBudget.secondaryRecoveryScale*projectileCriticalLatch.secondaryAlphaScale*projectileCanonicalStack.trailAlphaScale*projectileUnifiedStack.secondaryAlphaScale*projectileCorridorSeparation.trailAlphaScale*projectileSpatialSeparationBudget.secondaryAlphaScale*projectileCorridorRelease.trailAlphaScale*projectileSpatialRecoveryBudget.secondaryRecoveryScale*projectileDenseArbitration.trailAlphaScale*projectileDenseBattlefield.secondaryAlphaScale*projectileDepthPlane.trailScale*projectileDepthPlaneBudget.backgroundScale*projectileDepthReentry.trailScale*projectileDepthReentryBudget.secondaryReentryScale*projectileBossFocus.trailScale*projectileBossFocusBudget.secondaryScale*projectileCanonicalReacquisition.trailScale*projectileCanonicalReacquisitionBudget.staleDecorationScale*projectileDirectionReacquisition.primaryDirectionScale*projectileDirectionReacquisitionBudget.staleDirectionScale*projectileCriticalReengagement.trailScale*projectileCriticalReengagementBudget.secondaryScale*projectileSecondaryCeiling.trailScale*projectileSecondaryCeilingBudget.secondaryScale*projectileReadabilityContrast.trailScale*projectileReadabilityContrastBudget.secondaryScale*projectileFinalSettle.secondaryScale*projectileFinalSettleBudget.secondaryScale*projectileSecondaryRecoveryGate.secondaryScale*projectileSecondaryRecoveryGateBudget.secondaryScale*projectileFocusTransfer.secondaryScale*projectileFocusTransferBudget.secondaryScale*projectilePeakSeparation.trailScale*projectilePeakBudget.secondaryScale*projectileRhythmRecovery.secondaryScale*projectileRhythmRecoveryBudget.secondaryScale*projectileTemporalBody.trailScale*projectileTemporalRetirement.secondaryScale;ctx.translate(projectileNormalX*projectileSpatial.lateralOffset,projectileNormalY*projectileSpatial.lateralOffset);ctx.strokeStyle='#ffb26f';ctx.lineWidth=Math.max(1.2,projectile.radius*.15);ctx.beginPath();ctx.moveTo(bossTravelRelease.start.x,bossTravelRelease.start.y);ctx.lineTo(bossTravelRelease.end.x,bossTravelRelease.end.y);ctx.stroke();ctx.restore();}
      if(trail.owner==='launch'&&projectileResolutionBudget.visible){ctx.save();ctx.globalAlpha=trail.alpha*threatOwnership.launchAlphaScale*directionCarryRecovery.tailAlphaScale*projectileResolution.transitionAlphaScale*projectileResolutionBudget.effectStrength*projectilePriority.secondaryAlphaScale*projectileOverlap.alphaScale*projectileLayerBudget.projectileDecorationScale*projectileSpatial.trailAlphaScale*bossSpatialFocus.secondaryAlphaScale*projectileTemporal.directionAlphaScale*projectileTemporalBudget.secondaryAlphaScale*projectileDepth.trailAlphaScale*projectileLaneDepth.trailAlphaScale*projectileDepthBudget.secondaryAlphaScale*projectileDepthRecovery.trailAlphaScale*safeLaneDepthRecovery.trailAlphaScale*projectileRecoveryBudget.secondaryRecoveryScale*projectileCriticalLatch.secondaryAlphaScale*projectileCanonicalStack.trailAlphaScale*projectileUnifiedStack.secondaryAlphaScale*projectileCorridorSeparation.trailAlphaScale*projectileSpatialSeparationBudget.secondaryAlphaScale*projectileCorridorRelease.trailAlphaScale*projectileSpatialRecoveryBudget.secondaryRecoveryScale*projectileDenseArbitration.trailAlphaScale*projectileDenseBattlefield.secondaryAlphaScale*projectileDepthPlane.trailScale*projectileDepthPlaneBudget.backgroundScale*projectileDepthReentry.trailScale*projectileDepthReentryBudget.secondaryReentryScale*projectileBossFocus.trailScale*projectileBossFocusBudget.secondaryScale*projectileCanonicalReacquisition.trailScale*projectileCanonicalReacquisitionBudget.staleDecorationScale*projectileDirectionReacquisition.primaryDirectionScale*projectileDirectionReacquisitionBudget.staleDirectionScale*projectileCriticalReengagement.trailScale*projectileCriticalReengagementBudget.secondaryScale*projectileSecondaryCeiling.trailScale*projectileSecondaryCeilingBudget.secondaryScale*projectileReadabilityContrast.trailScale*projectileReadabilityContrastBudget.secondaryScale*projectileFinalSettle.secondaryScale*projectileFinalSettleBudget.secondaryScale*projectileSecondaryRecoveryGate.secondaryScale*projectileSecondaryRecoveryGateBudget.secondaryScale*projectileFocusTransfer.secondaryScale*projectileFocusTransferBudget.secondaryScale*projectilePeakSeparation.trailScale*projectilePeakBudget.secondaryScale*projectileRhythmRecovery.secondaryScale*projectileRhythmRecoveryBudget.secondaryScale*projectileTemporalBody.trailScale*projectileTemporalRetirement.secondaryScale;ctx.translate(projectileNormalX*projectileSpatial.lateralOffset,projectileNormalY*projectileSpatial.lateralOffset);ctx.strokeStyle=projectile.bossArchetype?'#ffb26f':'#ff7c86';ctx.lineWidth=Math.max(1.3,projectile.radius*.2);ctx.beginPath();ctx.moveTo(trail.tail.x,trail.tail.y);ctx.lineTo(trail.head.x,trail.head.y);ctx.stroke();ctx.restore();}
      else if(travelThreatCarry.visible&&projectileResolutionBudget.visible){const speed=Math.hypot(projectile.vel.x,projectile.vel.y)||1,dx=projectile.vel.x/speed,dy=projectile.vel.y/speed,len=Math.max(travelThreatCarry.minLength,trail.length*travelThreatCarry.lengthScale*directionCarryRecovery.tailLengthScale*projectileResolution.trailLengthScale);ctx.save();ctx.globalAlpha=travelThreatCarry.alphaScale*threatOwnership.travelAlphaScale*directionCarryRecovery.tailAlphaScale*projectileResolution.transitionAlphaScale*projectileResolutionBudget.effectStrength*projectilePriority.secondaryAlphaScale*projectileOverlap.alphaScale*projectileLayerBudget.projectileDecorationScale*projectileSpatial.trailAlphaScale*bossSpatialFocus.secondaryAlphaScale*projectileTemporal.directionAlphaScale*projectileTemporalBudget.secondaryAlphaScale*projectileDepth.trailAlphaScale*projectileLaneDepth.trailAlphaScale*projectileDepthBudget.secondaryAlphaScale*projectileDepthRecovery.trailAlphaScale*safeLaneDepthRecovery.trailAlphaScale*projectileRecoveryBudget.secondaryRecoveryScale*projectileCriticalLatch.secondaryAlphaScale*projectileCanonicalStack.trailAlphaScale*projectileUnifiedStack.secondaryAlphaScale*projectileCorridorSeparation.trailAlphaScale*projectileSpatialSeparationBudget.secondaryAlphaScale*projectileCorridorRelease.trailAlphaScale*projectileSpatialRecoveryBudget.secondaryRecoveryScale*projectileDenseArbitration.trailAlphaScale*projectileDenseBattlefield.secondaryAlphaScale*projectileDepthPlane.trailScale*projectileDepthPlaneBudget.backgroundScale*projectileDepthReentry.trailScale*projectileDepthReentryBudget.secondaryReentryScale*projectileBossFocus.trailScale*projectileBossFocusBudget.secondaryScale*projectileCanonicalReacquisition.trailScale*projectileCanonicalReacquisitionBudget.staleDecorationScale*projectileDirectionReacquisition.primaryDirectionScale*projectileDirectionReacquisitionBudget.staleDirectionScale*projectileCriticalReengagement.trailScale*projectileCriticalReengagementBudget.secondaryScale*projectileSecondaryCeiling.trailScale*projectileSecondaryCeilingBudget.secondaryScale*projectileReadabilityContrast.trailScale*projectileReadabilityContrastBudget.secondaryScale*projectileFinalSettle.secondaryScale*projectileFinalSettleBudget.secondaryScale*projectileSecondaryRecoveryGate.secondaryScale*projectileSecondaryRecoveryGateBudget.secondaryScale*projectileFocusTransfer.secondaryScale*projectileFocusTransferBudget.secondaryScale*projectilePeakSeparation.trailScale*projectilePeakBudget.secondaryScale*projectileRhythmRecovery.secondaryScale*projectileRhythmRecoveryBudget.secondaryScale*projectileTemporalBody.trailScale*projectileTemporalRetirement.secondaryScale;ctx.translate(projectileNormalX*projectileSpatial.lateralOffset,projectileNormalY*projectileSpatial.lateralOffset);ctx.strokeStyle=projectile.bossArchetype?'#ffb26f':'#ff7c86';ctx.lineWidth=Math.max(1.1,projectile.radius*.14);ctx.beginPath();ctx.moveTo(visualPos.x-dx*len,visualPos.y-dy*len);ctx.lineTo(visualPos.x,visualPos.y);ctx.stroke();ctx.restore();}
      const hasBossVisual = Boolean(projectile.bossArchetype && bossSpecialVfxAtlasReady && bossSpecialVfxAtlasImage);
      ctx.save();
      ctx.globalAlpha =Math.max(projectileEffectiveFloor.bodyAlphaFloor*projectileEffectiveFloorBudget.canonicalFloorScale,projectileReadabilityContrast.bodyAlphaFloor*projectileReadabilityContrastBudget.primaryScale,projectileFinalSettle.primaryFloor, (hasBossVisual ? 0.28 : 1)*projectileResolution.bodyAlphaScale*projectileDepth.bodyAlphaScale*projectileLaneDepth.bodyAlphaScale*projectileDepthBudget.canonicalBodyAlphaScale*projectileDepthRecovery.bodyAlphaScale*safeLaneDepthRecovery.bodyAlphaScale*projectileRecoveryBudget.canonicalBodyAlphaScale*projectileCriticalLatch.criticalAlphaScale*projectileCanonicalStack.bodyAlphaScale*projectileUnifiedStack.canonicalBodyAlphaScale*projectileCorridorSeparation.bodyAlphaScale*projectileSpatialSeparationBudget.canonicalBodyAlphaScale*projectileCorridorRelease.bodyAlphaScale*projectileSpatialRecoveryBudget.canonicalBodyAlphaScale*projectileDenseArbitration.bodyAlphaScale*projectileDenseBattlefield.canonicalBodyAlphaScale*projectileDepthPlane.bodyScale*projectileDepthPlaneBudget.canonicalScale*projectileDepthReentry.bodyScale*projectileDepthReentryBudget.canonicalScale*projectileBossFocus.bodyScale*projectileBossFocusBudget.canonicalScale*projectileCanonicalReacquisition.bodyScale*projectileCanonicalReacquisitionBudget.canonicalScale*projectileCriticalReengagement.bodyScale*projectileCriticalReengagementBudget.canonicalScale);
      ctx.shadowColor = '#ff4457'; ctx.shadowBlur = 10;
      ctx.fillStyle = '#ff7c86';
      ctx.beginPath(); ctx.arc(visualPos.x, visualPos.y, projectile.radius, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      if (hasBossVisual && bossSpecialVfxAtlasImage && projectile.bossArchetype) {
        const sprite = bossSpecialProjectileVfxSprite(projectile.bossArchetype);
        const angle = Math.atan2(projectile.vel.y, projectile.vel.x);
        const size = Math.max(46, projectile.radius * 5.4);
        ctx.save(); ctx.translate(visualPos.x, visualPos.y); ctx.rotate(angle); ctx.globalAlpha = 0.92*projectileResolution.bodyAlphaScale*projectileDepth.bodyAlphaScale*projectileLaneDepth.bodyAlphaScale*projectileDepthBudget.canonicalBodyAlphaScale*projectileDepthRecovery.bodyAlphaScale*safeLaneDepthRecovery.bodyAlphaScale*projectileRecoveryBudget.canonicalBodyAlphaScale*projectileCriticalLatch.criticalAlphaScale*projectileCanonicalStack.bodyAlphaScale*projectileUnifiedStack.canonicalBodyAlphaScale*projectileCorridorSeparation.bodyAlphaScale*projectileSpatialSeparationBudget.canonicalBodyAlphaScale*projectileCorridorRelease.bodyAlphaScale*projectileSpatialRecoveryBudget.canonicalBodyAlphaScale*projectileDenseArbitration.bodyAlphaScale*projectileDenseBattlefield.canonicalBodyAlphaScale*projectileDepthPlane.bodyScale*projectileDepthPlaneBudget.canonicalScale*projectileDepthReentry.bodyScale*projectileDepthReentryBudget.canonicalScale*projectileBossFocus.bodyScale*projectileBossFocusBudget.canonicalScale*projectileCanonicalReacquisition.bodyScale*projectileCanonicalReacquisitionBudget.canonicalScale*projectileCriticalReengagement.bodyScale*projectileCriticalReengagementBudget.canonicalScale;
        ctx.drawImage(bossSpecialVfxAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
      if (projectile.bossArchetype && bossProjectileLifecycleVfxAtlasReady && bossProjectileLifecycleVfxAtlasImage) {
        const sprite = bossProjectileLifecycleVfxSprite(projectile.bossArchetype,'travel');
        const angle = Math.atan2(projectile.vel.y, projectile.vel.x);
        const size = Math.max(58, projectile.radius * 6.4);
        ctx.save(); ctx.translate(visualPos.x, visualPos.y); ctx.rotate(angle); ctx.globalAlpha = 0.78*projectileResolution.bodyAlphaScale*projectileDepth.bodyAlphaScale*projectileLaneDepth.bodyAlphaScale*projectileDepthBudget.canonicalBodyAlphaScale*projectileDepthRecovery.bodyAlphaScale*safeLaneDepthRecovery.bodyAlphaScale*projectileRecoveryBudget.canonicalBodyAlphaScale*projectileCriticalLatch.criticalAlphaScale*projectileCanonicalStack.bodyAlphaScale*projectileUnifiedStack.canonicalBodyAlphaScale*projectileCorridorSeparation.bodyAlphaScale*projectileSpatialSeparationBudget.canonicalBodyAlphaScale*projectileCorridorRelease.bodyAlphaScale*projectileSpatialRecoveryBudget.canonicalBodyAlphaScale*projectileDenseArbitration.bodyAlphaScale*projectileDenseBattlefield.canonicalBodyAlphaScale*projectileDepthPlane.bodyScale*projectileDepthPlaneBudget.canonicalScale*projectileDepthReentry.bodyScale*projectileDepthReentryBudget.canonicalScale*projectileBossFocus.bodyScale*projectileBossFocusBudget.canonicalScale*projectileCanonicalReacquisition.bodyScale*projectileCanonicalReacquisitionBudget.canonicalScale*projectileCriticalReengagement.bodyScale*projectileCriticalReengagementBudget.canonicalScale;
        ctx.drawImage(bossProjectileLifecycleVfxAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
      if (projectile.sourceType === 'archer' && battlefieldEnvironmentReactionVfxAtlasReady && battlefieldEnvironmentReactionVfxAtlasImage) {
        const sprite = battlefieldEnvironmentReactionVfxSprite('archerProjectile');
        const angle = Math.atan2(projectile.vel.y, projectile.vel.x); const size = 54;
        ctx.save(); ctx.translate(visualPos.x, visualPos.y); ctx.rotate(angle); ctx.globalAlpha = 0.94*projectileResolution.bodyAlphaScale*projectileDepth.bodyAlphaScale*projectileLaneDepth.bodyAlphaScale*projectileDepthBudget.canonicalBodyAlphaScale*projectileDepthRecovery.bodyAlphaScale*safeLaneDepthRecovery.bodyAlphaScale*projectileRecoveryBudget.canonicalBodyAlphaScale*projectileCriticalLatch.criticalAlphaScale*projectileCanonicalStack.bodyAlphaScale*projectileUnifiedStack.canonicalBodyAlphaScale*projectileCorridorSeparation.bodyAlphaScale*projectileSpatialSeparationBudget.canonicalBodyAlphaScale*projectileCorridorRelease.bodyAlphaScale*projectileSpatialRecoveryBudget.canonicalBodyAlphaScale*projectileDenseArbitration.bodyAlphaScale*projectileDenseBattlefield.canonicalBodyAlphaScale*projectileDepthPlane.bodyScale*projectileDepthPlaneBudget.canonicalScale*projectileDepthReentry.bodyScale*projectileDepthReentryBudget.canonicalScale*projectileBossFocus.bodyScale*projectileBossFocusBudget.canonicalScale*projectileCanonicalReacquisition.bodyScale*projectileCanonicalReacquisitionBudget.canonicalScale*projectileCriticalReengagement.bodyScale*projectileCriticalReengagementBudget.canonicalScale;
        ctx.drawImage(battlefieldEnvironmentReactionVfxAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -size / 2, -size / 2, size, size); ctx.restore();
      }
    }
    const impactClusterInputs=[
      ...this.archerProjectileImpactVfx.map((cue)=>({impact:cue.pos,incoming:cue.incoming,sourceClass:'archer' as const})),
      ...this.bossProjectileImpactVfx.map((cue)=>({impact:cue.pos,incoming:cue.incoming,sourceClass:'boss' as const})),
    ];
    const impactClusters=projectileImpactClusters({impacts:impactClusterInputs,quality:presentationQuality,reducedFlash});
    const impactIdentityKeys=projectileImpactIdentityKeys(this.projectileImpactIdentityCoherence,impactClusters);
    const heldCounts=impactClusters.map((cluster,index)=>projectileImpactHeldCount(this.projectileImpactCountHold,cluster,impactIdentityKeys[index]??null));
    const impactDisplayClusters=impactClusters.map((cluster,index)=>({...cluster,count:heldCounts[index]??cluster.count}));
    const impactLabelPlacementFallback=projectileImpactLabelPlacements({clusters:impactDisplayClusters,stamps:impactClusterInputs.map((entry)=>entry.impact),width:LOGICAL_WIDTH,height:LOGICAL_HEIGHT});
    const impactLabelPlacements=projectileImpactAnchoredPlacements(this.projectileImpactLabelAnchorHold,impactDisplayClusters,impactLabelPlacementFallback,impactIdentityKeys);
    for(let i=0;i<impactClusters.length;i++){const cluster=impactClusters[i]!,heldCount=heldCounts[i]??cluster.count,labelPlacement=impactLabelPlacements[i];this.drawProjectileImpactSourceCluster(ctx,cluster,heldCount,labelPlacement);}
    if (battlefieldEnvironmentReactionVfxAtlasReady && battlefieldEnvironmentReactionVfxAtlasImage) {
      const sprite = battlefieldEnvironmentReactionVfxSprite('archerImpact');
      for (const cue of this.archerProjectileImpactVfx) { const t=Math.max(0,Math.min(1,cue.ttl/.34)); const size=64+(1-t)*18; const impactEntryOffset=(cue as typeof cue & {entryOffset?:Vec2}).entryOffset??{x:0,y:0}; const ordinaryImpactAlphaScale=(cue as typeof cue & {ordinaryImpactAlphaScale?:number}).ordinaryImpactAlphaScale??1; const impactVisualPos=projectileImpactVisualPosition(cue.pos,impactEntryOffset,cue.ttl,.34); ctx.save();ctx.globalAlpha=t*.78*ordinaryImpactAlphaScale;ctx.drawImage(battlefieldEnvironmentReactionVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,impactVisualPos.x-size/2,impactVisualPos.y-size/2,size,size);ctx.restore(); }
    }
    for(const cue of this.projectileGuardImpactVfx){
      const guard=projectileGuardImpactHandoffPresentation({preventedRatio:cue.preventionRatio,impactTtl:cue.ttl,impactMaxTtl:cue.maxTtl},reducedFlash);if(guard.owner!=='guard'||guard.guardImpactAlpha<=0)continue;
      const mag=Math.hypot(cue.incoming.x,cue.incoming.y)||1,nx=-cue.incoming.y/mag,ny=cue.incoming.x/mag,half=guard.deflectDistance*.5;
      ctx.save();ctx.globalAlpha=guard.guardImpactAlpha;ctx.strokeStyle='#8fffd3';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cue.pos.x-nx*half,cue.pos.y-ny*half);ctx.lineTo(cue.pos.x+nx*half,cue.pos.y+ny*half);ctx.stroke();ctx.restore();
    }
    const liveProjectileCoreGuardStrength=this.projectileCoreGuardImpactVfx.reduce((best,cue)=>Math.max(best,cue.preventionRatio*Math.max(0,Math.min(1,cue.ttl/Math.max(.001,cue.maxTtl)))),0),liveContactCoreGuardStrength=this.coreContactGuardImpactVfx.reduce((best,cue)=>Math.max(best,cue.preventionRatio*Math.max(0,Math.min(1,cue.ttl/Math.max(.001,cue.maxTtl)))),0),liveMixedCoreGuardState=advanceCoreMixedPressureGuardArbitration(this.coreMixedPressureGuardArbitration,{projectileStrength:liveProjectileCoreGuardStrength,contactStrength:liveContactCoreGuardStrength},0),mixedCoreGuard=coreMixedPressureGuardArbitrationPresentation(liveMixedCoreGuardState,reducedFlash);
    for(const cue of this.projectileCoreGuardImpactVfx){
      const guard=coreProjectileGuardImpactHandoffPresentation({preventedRatio:cue.preventionRatio,impactTtl:cue.ttl,impactMaxTtl:cue.maxTtl},reducedFlash);if(guard.owner!=='core-guard'||guard.coreGuardImpactAlpha<=0)continue;
      const mag=Math.hypot(cue.incoming.x,cue.incoming.y)||1,nx=-cue.incoming.y/mag,ny=cue.incoming.x/mag,half=guard.deflectDistance*.5;
      ctx.save();ctx.globalAlpha=guard.coreGuardImpactAlpha*mixedCoreGuard.projectileAlphaScale;ctx.strokeStyle='#7fd9ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cue.pos.x,cue.pos.y,guard.arcRadius,Math.atan2(ny,nx)-.9,Math.atan2(ny,nx)+.9);ctx.stroke();ctx.beginPath();ctx.moveTo(cue.pos.x-nx*half,cue.pos.y-ny*half);ctx.lineTo(cue.pos.x+nx*half,cue.pos.y+ny*half);ctx.stroke();ctx.restore();
    }
    for(const cue of this.coreContactGuardImpactVfx){
      const guard=coreContactGuardMemoryPresentation({preventedRatio:cue.preventionRatio,ttl:cue.ttl,maxTtl:cue.maxTtl},reducedFlash);if((guard.owner!=='contact-guard'&&guard.owner!=='memory')||(guard.contactAlpha<=0&&guard.memoryAlpha<=0))continue;
      const mag=Math.hypot(cue.incoming.x,cue.incoming.y)||1,angle=Math.atan2(cue.incoming.y/mag,cue.incoming.x/mag),alpha=(guard.owner==='memory'?guard.memoryAlpha:guard.contactAlpha)*mixedCoreGuard.contactAlphaScale;
      ctx.save();ctx.translate(cue.pos.x,cue.pos.y);ctx.rotate(angle);ctx.globalAlpha=alpha;ctx.strokeStyle='#9ee7ff';ctx.lineWidth=guard.owner==='memory'?1.5:2.5;ctx.setLineDash(guard.owner==='memory'?[5,7]:[]);ctx.beginPath();ctx.ellipse(0,8,guard.braceWidth*.5,guard.braceHeight*.5,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();
    }
    if (bossProjectileLifecycleVfxAtlasReady && bossProjectileLifecycleVfxAtlasImage) {
      for (const cue of this.bossProjectileImpactVfx) {
        const sprite = bossProjectileLifecycleVfxSprite(cue.archetype,'impact');
        const t = Math.max(0, Math.min(1, cue.ttl / cue.maxTtl));
        const size = 76 + (1 - t) * 38;
        const impactEntryOffset=(cue as typeof cue & {entryOffset?:Vec2}).entryOffset??{x:0,y:0}; const impactVisualPos=projectileImpactVisualPosition(cue.pos,impactEntryOffset,cue.ttl,cue.maxTtl);
        const ordinaryImpactAlphaScale=(cue as typeof cue & {ordinaryImpactAlphaScale?:number}).ordinaryImpactAlphaScale??1;
        ctx.save(); ctx.globalAlpha = Math.min(0.82, t * 0.9)*ordinaryImpactAlphaScale;
        ctx.drawImage(bossProjectileLifecycleVfxAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, impactVisualPos.x - size / 2, impactVisualPos.y - size / 2, size, size);
        ctx.restore();
      }
    }
  }

  renderEnemies(ctx: CanvasRenderingContext2D, spriteAtlasImage: CanvasImageSource | null = null, spriteAtlasReady = false, bossSpriteAtlasImage: CanvasImageSource | null = null, bossSpriteAtlasReady = false, residualMotion?: ResidualCombatMotionPolicy, eliteAffixAtlasImage: CanvasImageSource | null = null, eliteAffixAtlasReady = false, specialistIntentAtlasImage: CanvasImageSource | null = null, specialistIntentAtlasReady = false, heroPos: Vec2 | null = null, specialistCombatVfxAtlasImage: CanvasImageSource | null = null, specialistCombatVfxAtlasReady = false, bossPhaseOverlayVfxAtlasImage: CanvasImageSource | null = null, bossPhaseOverlayVfxAtlasReady = false, interactionAtlasImage: CanvasImageSource | null = null, interactionAtlasReady = false, spawnPressureVfxAtlasImage: CanvasImageSource | null = null, spawnPressureVfxAtlasReady = false, regularEnemyActionVfxAtlasImage: CanvasImageSource | null = null, regularEnemyActionVfxAtlasReady = false, eliteAffixLifecycleVfxAtlasImage: CanvasImageSource | null = null, eliteAffixLifecycleVfxAtlasReady = false, enemyTargetPressureVfxAtlasImage: CanvasImageSource | null = null, enemyTargetPressureVfxAtlasReady = false, corePos: Vec2 | null = null, specialistReactionLifecycleVfxAtlasImage: CanvasImageSource | null = null, specialistReactionLifecycleVfxAtlasReady = false, reducedFlash = false, reducedMotion = false, hazardPressure = 0): void {
    for (const portal of this.spawnPortalVfx) {
      const alpha = Math.max(0, Math.min(0.86, portal.ttl / 0.72));
      if (spawnPressureVfxAtlasReady && spawnPressureVfxAtlasImage) {
        const state = portal.ttl > 0.36 ? 'portal' : 'arrival';
        const sprite = spawnPressureVfxSprite(portal.kind,state);
        const size = portal.kind === 'boss' ? 132 : portal.kind === 'elite' ? 104 : portal.kind === 'specialist' ? 88 : 76;
        ctx.save(); ctx.globalAlpha = alpha;
        ctx.drawImage(spawnPressureVfxAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, portal.pos.x - size / 2, portal.pos.y - size / 2, size, size);
        ctx.restore();
      } else if (interactionAtlasReady && interactionAtlasImage && (portal.kind === 'regular' || portal.kind === 'elite')) {
        const sprite = battlefieldInteractionSprite('spawn-portal', portal.kind);
        const size = portal.kind === 'elite' ? 94 : 76;
        ctx.save(); ctx.globalAlpha = alpha;
        ctx.drawImage(interactionAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, portal.pos.x - size / 2, portal.pos.y - size / 2, size, size);
        ctx.restore();
      }
    }
    const activeStrikeCueCount=this.specialistStrikeOriginVfx.length;
    const activeImpactFinishCount=this.specialistStrikeOriginVfx.filter((cue)=>cue.ttl/Math.max(.001,cue.maxTtl)<.32).length;
    for(const [strikeCueIndex,cue] of this.specialistStrikeOriginVfx.entries()){
      const strikeCueBudget=specialistStrikeCueBudgetPresentation({activeCueCount:activeStrikeCueCount,indexFromNewest:Math.max(0,activeStrikeCueCount-1-strikeCueIndex),type:cue.type,life:cue.ttl/Math.max(.001,cue.maxTtl)},reducedMotion,reducedFlash);
      if(!strikeCueBudget.visible)continue;
      const arrival=specialistStrikeOriginArrivalPresentation({body:cue.pos,origin:cue.origin,target:cue.target,ttl:cue.ttl,maxTtl:cue.maxTtl},reducedMotion);
      const impactFinish=specialistStrikeImpactSideFinishPresentation({origin:cue.origin,target:cue.target,ttl:cue.ttl,maxTtl:cue.maxTtl,type:cue.type},reducedMotion,reducedFlash);
      const initialRecovery=specialistImpactFinishLocomotionRecoveryPresentation({start:impactFinish.start,end:impactFinish.end,locomotionFacingX:cue.recoveryFacing.x,locomotionFacingY:cue.recoveryFacing.y,ttl:cue.ttl,maxTtl:cue.maxTtl,type:cue.type},reducedMotion),currentRecoveryEnemy=this.enemies.find((candidate)=>candidate.id===cue.enemyId),recoveryFacing=specialistImpactRecoveryFacingHandoffPresentation({storedFacingX:cue.recoveryFacing.x,storedFacingY:cue.recoveryFacing.y,currentFacingX:currentRecoveryEnemy?.renderMotion?.facingX??cue.recoveryFacing.x,currentFacingY:currentRecoveryEnemy?.renderMotion?.facingY??cue.recoveryFacing.y,recoveryBlend:initialRecovery.recoveryBlend,enemyAlive:Boolean(currentRecoveryEnemy?.alive)},reducedMotion);
      const impactRecovery=specialistImpactFinishLocomotionRecoveryPresentation({start:impactFinish.start,end:impactFinish.end,locomotionFacingX:recoveryFacing.facingX,locomotionFacingY:recoveryFacing.facingY,ttl:cue.ttl,maxTtl:cue.maxTtl,type:cue.type},reducedMotion);
      const life=Math.max(0,Math.min(1,cue.ttl/Math.max(.001,cue.maxTtl)));
      ctx.save();ctx.globalAlpha=(.28+.5*life)*strikeCueBudget.alphaScale;ctx.strokeStyle=cue.type==='assassin'?'#e4b5ff':cue.type==='siegeGolem'?'#ffcb7a':'#9fd7ff';ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=2.4*strikeCueBudget.lineWidthScale;ctx.beginPath();ctx.moveTo(cue.pos.x,cue.pos.y);ctx.lineTo(arrival.marker.x,arrival.marker.y);ctx.stroke();ctx.beginPath();ctx.arc(arrival.marker.x,arrival.marker.y,2.8+1.8*life,0,Math.PI*2);ctx.fill();ctx.restore();
      if(impactFinish.visible){const responseStrength=this.coreContactGuardImpactVfx.some((g)=>g.ttl>0&&distance(g.pos,cue.target)<=28)?1:0,impactResponse=specialistImpactFinishResponseArbitrationPresentation({finishAlpha:impactFinish.alpha,responseStrength},reducedFlash),impactFinishBudget=specialistImpactFinishDensityBudgetPresentation({activeCount:activeImpactFinishCount,indexFromNewest:Math.max(0,activeStrikeCueCount-1-strikeCueIndex),type:cue.type,life:life},reducedMotion,reducedFlash),recoveryDensityBudget=specialistImpactRecoveryDensityBudgetPresentation({activeCount:activeImpactFinishCount,indexFromNewest:Math.max(0,activeStrikeCueCount-1-strikeCueIndex),owner:impactRecovery.owner,type:cue.type,recoveryBlend:impactRecovery.recoveryBlend},reducedMotion);if(impactFinishBudget.visible&&recoveryDensityBudget.visible){const recoveryEnd={x:impactRecovery.start.x+(impactRecovery.end.x-impactRecovery.start.x)*recoveryDensityBudget.lengthScale,y:impactRecovery.start.y+(impactRecovery.end.y-impactRecovery.start.y)*recoveryDensityBudget.lengthScale};ctx.save();ctx.globalAlpha=impactFinish.alpha*impactRecovery.alphaScale*recoveryDensityBudget.alphaScale*strikeCueBudget.alphaScale*impactResponse.alphaScale*impactFinishBudget.alphaScale;ctx.strokeStyle=cue.type==='assassin'?'#f0cfff':cue.type==='siegeGolem'?'#ffd48f':'#b9e4ff';ctx.lineWidth=2.2*strikeCueBudget.lineWidthScale;ctx.beginPath();ctx.moveTo(impactRecovery.start.x,impactRecovery.start.y);ctx.lineTo(recoveryEnd.x,recoveryEnd.y);ctx.stroke();ctx.restore();}}
    }
    const activeSpecialists=this.enemies.filter((enemy)=>isSpecialistEnemyType(enemy.type));
    const activeSpecialistCount=activeSpecialists.length;
    const specialistAnticipationRank=new Map(activeSpecialists.map((enemy,index)=>[enemy,Math.max(0,activeSpecialists.length-1-index)]));
    for (const enemy of this.enemies) {
      ctx.save();
      ctx.translate(enemy.pos.x, enemy.pos.y);
      const targetPos = enemy.target === 'core' ? corePos : heroPos;
      const motionPresentation = enemyMotionRenderPresentation(enemy.type, enemy.radius, enemy.renderMotion, reducedMotion);
      const targetDx = targetPos ? targetPos.x - enemy.pos.x : 0;
      const targetDy = targetPos ? targetPos.y - enemy.pos.y : 0;
      const targetDistance = targetPos ? Math.hypot(targetDx, targetDy) : Number.POSITIVE_INFINITY;
      const inAttackRange = enemy.preferredRange > 0
        ? targetDistance <= enemy.preferredRange + 14
        : targetDistance <= enemy.radius + 58;
      const latestStrikeCue=isSpecialistEnemyType(enemy.type)?[...this.specialistStrikeOriginVfx].reverse().find((cue)=>cue.enemyId===enemy.id):undefined;
      const latestStrikeRecoveryBlend=latestStrikeCue?Math.max(0,Math.min(1,1-latestStrikeCue.ttl/Math.max(.001,latestStrikeCue.maxTtl))):1;
      const nextAttackAnticipation=isSpecialistEnemyType(enemy.type)?specialistNextAttackAnticipationPresentation({recoveryBlend:latestStrikeRecoveryBlend,attackTimer:enemy.attackTimer,attackInterval:enemy.attackInterval,inAttackRange,facingX:targetDistance<Number.POSITIVE_INFINITY&&targetDistance>0?targetDx/targetDistance:(enemy.renderMotion?.facingX??1),facingY:targetDistance<Number.POSITIVE_INFINITY&&targetDistance>0?targetDy/targetDistance:(enemy.renderMotion?.facingY??0),type:enemy.type},reducedMotion,reducedFlash):null;
      const attackMotion = enemyAttackMotionPresentation(enemy.type, enemy.attackTimer, enemy.attackInterval, targetDx, targetDy, inAttackRange, reducedMotion);
      const attackResolve = enemyAttackResolvePresentation(enemy.type, enemy.attackResolveMotion ?? { resolve:0, settle:0 }, targetDistance < Number.POSITIVE_INFINITY && targetDistance > 0 ? targetDx / targetDistance : 1, targetDistance < Number.POSITIVE_INFINITY && targetDistance > 0 ? targetDy / targetDistance : 0, reducedMotion);
      const anticipationHandoff=nextAttackAnticipation?specialistNextAttackAnticipationHandoffPresentation({anticipationVisible:nextAttackAnticipation.visible,urgency:nextAttackAnticipation.urgency,pullback:attackMotion.pullback,lunge:attackMotion.lunge,resolve:attackResolve.resolve},reducedMotion):null;
      const anticipationSilhouetteContinuity=isSpecialistEnemyType(enemy.type)&&nextAttackAnticipation?specialistAnticipationSilhouettePoseContinuityPresentation({type:enemy.type,anticipationVisible:nextAttackAnticipation.visible,urgency:nextAttackAnticipation.urgency,pullback:attackMotion.pullback,lunge:attackMotion.lunge,resolve:attackResolve.resolve},reducedMotion):null;
      const anticipationSilhouetteHandoff=isSpecialistEnemyType(enemy.type)&&nextAttackAnticipation?specialistAnticipationSilhouetteHandoffPresentation({anticipationVisible:nextAttackAnticipation.visible,pullback:attackMotion.pullback,lunge:attackMotion.lunge,resolve:attackResolve.resolve},reducedMotion):null;
      const anticipationSilhouetteDensityBudget=isSpecialistEnemyType(enemy.type)&&nextAttackAnticipation&&anticipationSilhouetteContinuity?specialistAnticipationSilhouetteDensityBudgetPresentation({activeCount:activeSpecialistCount,indexFromNewest:specialistAnticipationRank.get(enemy)??activeSpecialistCount,type:enemy.type,owner:anticipationSilhouetteContinuity.owner,urgency:nextAttackAnticipation.urgency},reducedMotion):null;
      const anticipationDensityBudget=isSpecialistEnemyType(enemy.type)&&nextAttackAnticipation?specialistNextAttackAnticipationDensityBudgetPresentation({activeCount:activeSpecialistCount,indexFromNewest:specialistAnticipationRank.get(enemy)??activeSpecialistCount,type:enemy.type,urgency:nextAttackAnticipation.urgency},reducedMotion):null;
      if(nextAttackAnticipation?.visible&&(anticipationHandoff?.alphaScale??0)>0&&(anticipationDensityBudget?.visible??true)){const start=Math.max(4,enemy.radius*.72),end=start+nextAttackAnticipation.reach*(anticipationDensityBudget?.reachScale??1);ctx.save();ctx.globalAlpha=nextAttackAnticipation.alpha*(anticipationHandoff?.alphaScale??1)*(anticipationSilhouetteContinuity?.anticipationAlphaScale??1)*(anticipationSilhouetteHandoff?.cueAlphaScale??1)*(anticipationSilhouetteDensityBudget?.cueAlphaScale??1)*(anticipationDensityBudget?.alphaScale??1);ctx.strokeStyle=enemy.type==='assassin'?'#e4b5ff':enemy.type==='siegeGolem'?'#ffcb7a':enemy.type==='nullifier'?'#87b8ff':'#b9e4ff';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(nextAttackAnticipation.facingX*start,nextAttackAnticipation.facingY*start);ctx.lineTo(nextAttackAnticipation.facingX*end,nextAttackAnticipation.facingY*end);ctx.stroke();ctx.restore();}
      const rangedAimRotation = attackMotion.rangedAim ? Math.sin(attackMotion.facingAngle) * 0.07 : 0;
      const attackWeightSettle = attackMotion.maxDisplacement / Math.max(1, attackMotion.weight) * 0.025;
      const recoilIntensity = enemy.hitFlash >= 0.08 ? Math.min(1.25, enemy.hitFlash / 0.10) : 0;
      const renderFacingX = enemy.renderMotion?.facingX ?? (targetDistance < Number.POSITIVE_INFINITY && targetDistance > 0 ? targetDx / targetDistance : 1);
      const renderFacingY = enemy.renderMotion?.facingY ?? (targetDistance < Number.POSITIVE_INFINITY && targetDistance > 0 ? targetDy / targetDistance : 0);
      const renderWeight = enemy.type === 'boss' ? 1.8 : enemy.type === 'elite' ? 1.5 : enemy.type === 'siegeGolem' ? 1.65 : enemy.type === 'brute' || enemy.type === 'shieldbearer' ? 1.25 : 1;
      const baseHitRecoil = characterHitRecoilPresentation(recoilIntensity, renderFacingX, renderFacingY, renderWeight, reducedMotion);
      const bossHeavyHitStagger = enemy.type==='boss' ? bossHeavyHitStaggerPresentation(enemy.bossArchetype??bossArchetypeForOrdinal(enemy.bossOrdinal??0),bossPhaseForRatio(enemy.hp/Math.max(1,enemy.maxHp)),enemy.bossHeavyHitStagger,enemy.specialTimer??99,reducedMotion) : null;
      const bossStaggerRecoveryArbitration = enemy.type==='boss' ? bossStaggerSpecialRecoveryArbitrationPresentation(enemy.bossArchetype??bossArchetypeForOrdinal(enemy.bossOrdinal??0),bossPhaseForRatio(enemy.hp/Math.max(1,enemy.maxHp)),{stagger:enemy.bossHeavyHitStagger?.stagger??0,tier:enemy.bossHeavyHitStagger?.tier??null,recovery:enemy.bossSpecialRecovery?.recovery??0,specialTimer:enemy.specialTimer??99},reducedMotion) : null;
      const genericRecoilScale=(bossHeavyHitStagger?.genericRecoilScale??1)*(bossStaggerRecoveryArbitration?.genericRecoilScale??1);
      const hitRecoil={...baseHitRecoil,intensity:baseHitRecoil.intensity*genericRecoilScale,offsetX:baseHitRecoil.offsetX*genericRecoilScale,offsetY:baseHitRecoil.offsetY*genericRecoilScale,rotation:baseHitRecoil.rotation*genericRecoilScale,maxDisplacement:baseHitRecoil.maxDisplacement*genericRecoilScale};
      const enemyHitStagger=enemy.type!=='boss'?enemyHitStaggerPresentation(enemy.type,enemy.hitFlash,enemy.hitImpactTier??'normal',enemy.hitDirectionX??-renderFacingX,enemy.hitDirectionY??-renderFacingY,enemy.renderMotion,reducedMotion):null;
      const specialistAttackHitArbitration = isSpecialistEnemyType(enemy.type) ? specialistAttackHitArbitrationPresentation(enemy.type,{pullback:attackMotion.pullback,lunge:attackMotion.lunge,resolve:attackResolve.resolve,hitStagger:enemyHitStagger?.stagger??0,tier:enemy.hitImpactTier??'normal',fatal:false},reducedMotion) : null;
      const specialistRecoveryHandoff = isSpecialistEnemyType(enemy.type) ? specialistRecoveryHitHandoffPresentation({pullback:attackMotion.pullback,lunge:attackMotion.lunge,resolve:attackResolve.resolve,hitStagger:enemyHitStagger?.stagger??0,tier:enemy.hitImpactTier??'normal'},reducedMotion) : null;
      const bossRecoveryStaggerHandoff = enemy.type==='boss' ? bossRecoveryStaggerHandoffPresentation({recovery:enemy.bossSpecialRecovery?.recovery??0,stagger:enemy.bossHeavyHitStagger?.stagger??0,tier:enemy.bossHeavyHitStagger?.tier??null,specialTimer:enemy.specialTimer??99},reducedMotion) : null;
      const motionLayerBudget=(isSpecialistEnemyType(enemy.type)||enemy.type==='boss')?characterMotionLayerBudgetPresentation(enemy.type==='boss'?'boss':'specialist',{attack:isSpecialistEnemyType(enemy.type)?Math.max(attackMotion.pullback,attackMotion.lunge):0,recovery:enemy.type==='boss'?(enemy.bossSpecialRecovery?.recovery??0):attackResolve.resolve,hit:enemy.type==='boss'?(enemy.bossHeavyHitStagger?.stagger??0):(enemyHitStagger?.stagger??0),special:enemy.type==='boss'&&Number.isFinite(enemy.specialTimer)&&((enemy.specialTimer??99)>=0)&&((enemy.specialTimer??99)<=1.2)?Math.max(0,1-(enemy.specialTimer??0)/1.2):0},reducedMotion):null;
      const attackScale=(specialistAttackHitArbitration?.attackScale??1)*(motionLayerBudget?.attackScale??1);
      const attackResolveScale=(specialistAttackHitArbitration?.attackResolveScale??1)*(specialistRecoveryHandoff?.attackResolveScale??1)*(motionLayerBudget?.recoveryScale??1);
      const baseHitStaggerScale=specialistAttackHitArbitration?.hitStaggerScale??1;
      const hitStaggerScale=(specialistRecoveryHandoff?.owner==='hit'?Math.max(baseHitStaggerScale,specialistRecoveryHandoff.hitStaggerScale):baseHitStaggerScale*(specialistRecoveryHandoff?.hitStaggerScale??1))*(motionLayerBudget?.hitScale??1);
      const baseBossStaggerScale=bossStaggerRecoveryArbitration?.staggerScale??1;
      const bossStaggerScale=(bossRecoveryStaggerHandoff?.owner==='stagger'?Math.max(baseBossStaggerScale,bossRecoveryStaggerHandoff.staggerScale):baseBossStaggerScale*(bossRecoveryStaggerHandoff?.staggerScale??1))*(motionLayerBudget?.hitScale??1);
      const recoveryScale=(bossStaggerRecoveryArbitration?.recoveryScale??1)*(bossRecoveryStaggerHandoff?.recoveryScale??1)*(motionLayerBudget?.recoveryScale??1);
      const attackPhaseScale = 1 + attackMotion.lunge * attackScale * 0.04 - attackMotion.pullback * attackScale * 0.02;
      const groundContact = characterGroundContactPresentation(enemy.radius, enemy.renderMotion?.motionBlend ?? 0, hitRecoil.intensity, renderFacingX, reducedMotion, renderWeight);
      const bossLocomotion = enemy.type === 'boss' ? bossLocomotionWeightPresentation(bossPhaseForRatio(enemy.hp / Math.max(1, enemy.maxHp)), enemy.renderMotion?.motionBlend ?? 0, enemy.renderMotion?.recovery ?? 0, enemy.renderMotion?.turn ?? 0, reducedMotion) : { phase:1 as const, turnWeight:1, settle:0, offsetY:0, rotation:0, showContactPulse:false, contactAlpha:0, contactRadius:0, shadowBoost:0 };
      const specialistLocomotionSignature = isSpecialistEnemyType(enemy.type) ? specialistLocomotionSignaturePresentation(enemy.type, enemy.specialistLocomotionSignature, enemy.renderMotion?.motionBlend ?? 0, enemy.renderMotion?.recovery ?? 0, renderFacingX, renderFacingY, reducedMotion) : null;
      const specialistTurnStop = isSpecialistEnemyType(enemy.type) ? specialistTurnStopPresentation(enemy.type, enemy.renderMotion, enemy.specialistLocomotionSignature, reducedMotion) : null;
      const specialistTurnStopRhythm=isSpecialistEnemyType(enemy.type)?specialistLocomotionTurnStopReattackRhythmPresentation({type:enemy.type,motionBlend:enemy.renderMotion?.motionBlend??0,turn:enemy.renderMotion?.turn??0,recovery:enemy.renderMotion?.recovery??0,attackReadiness:nextAttackAnticipation?.urgency??0},reducedMotion):null;
      const specialistTurnStopHandoff=specialistTurnStopRhythm?specialistTurnStopReattackHandoffPresentation({owner:specialistTurnStopRhythm.owner,cadenceScale:specialistTurnStopRhythm.cadenceScale,reattackScale:specialistTurnStopRhythm.reattackScale,motionBlend:enemy.renderMotion?.motionBlend??0},reducedMotion):null;
      const specialistTurnStopDensity=isSpecialistEnemyType(enemy.type)&&specialistTurnStopHandoff?specialistTurnStopReattackDensityBudgetPresentation({activeCount:activeSpecialistCount,indexFromNewest:specialistAnticipationRank.get(enemy)??activeSpecialistCount,type:enemy.type,owner:specialistTurnStopHandoff.owner},reducedMotion):null;
      const bossSpecialRecovery = enemy.type === 'boss' ? bossSpecialRecoveryPresentation(enemy.bossArchetype ?? bossArchetypeForOrdinal(enemy.bossOrdinal ?? 0), bossPhaseForRatio(enemy.hp / Math.max(1, enemy.maxHp)), enemy.bossSpecialRecovery, renderFacingX, renderFacingY, reducedMotion) : null;
      const specialistGroundOwnership = isSpecialistEnemyType(enemy.type) ? specialistGroundContactOwnershipPresentation(enemy.type,{motion:enemy.renderMotion?.motionBlend??0,attackCommitment:specialistAttackHitArbitration?.attackCommitment??0,hitStagger:enemyHitStagger?.stagger??0,fatal:false,groundAnchor:specialistTurnStop?.groundAnchor??0,attackOffsetX:attackMotion.offsetX*attackScale+attackResolve.offsetX*attackResolveScale,hitOffsetX:hitRecoil.offsetX+(enemyHitStagger?.offsetX??0)*hitStaggerScale},reducedMotion) : null;
      const bossGroundCue = enemy.type === 'boss' ? bossGroundCueArbitrationPresentation(bossPhaseForRatio(enemy.hp / Math.max(1, enemy.maxHp)),{motion:enemy.renderMotion?.motionBlend??0,settle:bossLocomotion.settle,recovery:enemy.bossSpecialRecovery?.recovery??0,stagger:enemy.bossHeavyHitStagger?.stagger??0,specialTimer:enemy.specialTimer??99},reducedMotion) : null;
      const bossGroundRebase=enemy.type==='boss'?bossGroundOriginRebasePresentation(enemy.bossGroundOriginRebase,reducedMotion):{groundOffsetX:0,groundOffsetY:0,contactPulseScale:1,shadowMotionScale:1,locomotionSettleScale:1};
      const bossSpecialOriginHandoff=bossSpecialOriginHandoffPresentation(enemy.bossSpecialOriginHandoff,reducedMotion);
      const spawnGroundMaterialize=enemyPortalGroundMaterializePresentation(enemy.spawnGroundMaterialize,reducedMotion);
      const bossAftermath=enemy.type==='boss'?bossDisplacementAftermathOriginPresentation({rebase:enemy.bossGroundOriginRebase?.rebase??0,groundOffsetX:bossGroundRebase.groundOffsetX,groundOffsetY:bossGroundRebase.groundOffsetY,specialStrength:enemy.bossSpecialOriginHandoff?.strength??0,settle:bossLocomotion.settle},reducedMotion):{owner:'body' as const,originOffsetX:0,originOffsetY:0,aftermathAlphaScale:1,contactPulseScale:1};
      const specialistLocomotionOwnershipScale = specialistGroundOwnership ? specialistGroundOwnership.locomotionScale : 1;
      const specialistTurnOwnershipScale = specialistGroundOwnership ? specialistGroundOwnership.turnStopScale : 1;
      const specialistShadowOffsetScale = specialistGroundOwnership ? specialistGroundOwnership.shadowOffsetScale : 1;
      const specialistGroundPulseScale = (specialistGroundOwnership ? specialistGroundOwnership.groundPulseScale : 1)*bossSpecialOriginHandoff.contactPulseScale*spawnGroundMaterialize.groundPulseScale;
      const specialistGroundFollowX = specialistGroundOwnership ? specialistGroundOwnership.groundFollowX : 0;
      const bossLocomotionOwnershipScale = bossGroundCue ? bossGroundCue.locomotionScale : 1;
      const bossShadowMotionScale = (bossGroundCue ? bossGroundCue.shadowMotionScale : 1)*bossGroundRebase.shadowMotionScale;
      const bossContactPulseScale = Math.min((bossGroundCue ? bossGroundCue.contactPulseScale : 1)*bossGroundRebase.contactPulseScale*bossSpecialOriginHandoff.contactPulseScale,bossAftermath.contactPulseScale);
      const bossRecoveryShadowBoostScale = bossGroundCue ? bossGroundCue.recoveryShadowBoostScale : 0;
      const locomotionOwnershipScale = (specialistGroundOwnership ? specialistLocomotionOwnershipScale : bossLocomotionOwnershipScale)*bossSpecialOriginHandoff.locomotionScale*spawnGroundMaterialize.locomotionScale;
      const shadowMotionScale = (specialistGroundOwnership ? specialistShadowOffsetScale : bossShadowMotionScale)*bossSpecialOriginHandoff.locomotionScale*spawnGroundMaterialize.locomotionScale;
      const bossBodyArchetype = enemy.type === 'boss' ? (enemy.bossArchetype ?? bossArchetypeForOrdinal(enemy.bossOrdinal ?? 0)) : null;
      const bossSpecialBodyLanguage = bossBodyArchetype ? bossSpecialBodyLanguagePresentation(bossBodyArchetype, bossPhaseForRatio(enemy.hp / Math.max(1, enemy.maxHp)), enemy.specialTimer ?? 99, renderFacingX, renderFacingY, reducedMotion) : null;
      const bossSpecialAnticipation = bossBodyArchetype && bossSpecialBodyLanguage ? bossSpecialAnticipationEmphasisPresentation({archetype:bossBodyArchetype,phase:bossPhaseForRatio(enemy.hp / Math.max(1, enemy.maxHp)),charge:bossSpecialBodyLanguage.charge,recovery:enemy.bossSpecialRecovery?.recovery??0,stagger:enemy.bossHeavyHitStagger?.stagger??0},reducedMotion,reducedFlash) : null;
      const bossAnticipationHandoff=bossSpecialAnticipation?bossAnticipationRecoveryHandoffPresentation({charge:bossSpecialBodyLanguage?.charge??0,recovery:enemy.bossSpecialRecovery?.recovery??0,stagger:enemy.bossHeavyHitStagger?.stagger??0,ringAlphaScale:bossSpecialAnticipation.ringAlphaScale,bodyStrength:bossSpecialAnticipation.bodyStrength},reducedMotion,reducedFlash):null;
      const bossAnticipationBodyScale=bossAnticipationHandoff?bossAnticipationHandoff.bodyScale:1;
      const bossSpecialRingAlphaScale=bossSpecialAnticipation?bossSpecialAnticipation.ringAlphaScale*(bossAnticipationHandoff?.alphaScale??1):1;
      const bossSpecialBodyScaleX=bossSpecialAnticipation?1+(bossSpecialAnticipation.bodyScaleX-1)*bossAnticipationBodyScale:1;
      const bossSpecialBodyScaleY=bossSpecialAnticipation?1+(bossSpecialAnticipation.bodyScaleY-1)*bossAnticipationBodyScale:1;
      const bossSpecialCueBudget=bossBodyArchetype?bossSpecialCueBudgetPresentation({phase:bossPhaseForRatio(enemy.hp/Math.max(1,enemy.maxHp)),charge:bossSpecialBodyLanguage?.charge??0,recovery:enemy.bossSpecialRecovery?.recovery??0,stagger:enemy.bossHeavyHitStagger?.stagger??0,phaseOverlay:bossPhaseForRatio(enemy.hp/Math.max(1,enemy.maxHp))>=2},reducedMotion,reducedFlash):null;
      const bossSpecialOriginAnchor=enemy.type==='boss'?bossSpecialOriginAnchorPresentation({bodyOffsetX:bossSpecialBodyLanguage?.offsetX??0,bodyOffsetY:bossSpecialBodyLanguage?.offsetY??0,rebaseOffsetX:bossGroundRebase.groundOffsetX+bossSpecialOriginHandoff.groundOffsetX,rebaseOffsetY:bossGroundRebase.groundOffsetY+bossSpecialOriginHandoff.groundOffsetY,handoffStrength:enemy.bossSpecialOriginHandoff?.strength??0,charge:bossSpecialBodyLanguage?.charge??0,recovery:enemy.bossSpecialRecovery?.recovery??0,stagger:enemy.bossHeavyHitStagger?.stagger??0},reducedMotion):null;
      const bossAnticipationOrigin=enemy.type==='boss'?bossAnticipationOriginCoherencePresentation({bodyOffsetX:bossSpecialBodyLanguage?.offsetX??0,bodyOffsetY:bossSpecialBodyLanguage?.offsetY??0,rebaseOffsetX:bossSpecialOriginAnchor?.anchorOffsetX??(bossGroundRebase.groundOffsetX+bossSpecialOriginHandoff.groundOffsetX),rebaseOffsetY:bossSpecialOriginAnchor?.anchorOffsetY??(bossGroundRebase.groundOffsetY+bossSpecialOriginHandoff.groundOffsetY),displacementStrength:Math.max(enemy.bossGroundOriginRebase?.rebase??0,enemy.bossSpecialOriginHandoff?.strength??0),charge:bossSpecialBodyLanguage?.charge??0,recovery:enemy.bossSpecialRecovery?.recovery??0,stagger:enemy.bossHeavyHitStagger?.stagger??0,radius:enemy.radius},reducedMotion):null;
      const bossAnticipationOriginLock=bossAnticipationOrigin?bossAnticipationOriginLockPresentation({desiredOwner:bossAnticipationOrigin.owner,desiredOffsetX:bossAnticipationOrigin.ringOffsetX,desiredOffsetY:bossAnticipationOrigin.ringOffsetY,rebaseOffsetX:bossSpecialOriginAnchor?.anchorOffsetX??(bossGroundRebase.groundOffsetX+bossSpecialOriginHandoff.groundOffsetX),rebaseOffsetY:bossSpecialOriginAnchor?.anchorOffsetY??(bossGroundRebase.groundOffsetY+bossSpecialOriginHandoff.groundOffsetY),handoffStrength:enemy.bossSpecialOriginHandoff?.strength??0,charge:bossSpecialBodyLanguage?.charge??0,recovery:enemy.bossSpecialRecovery?.recovery??0,stagger:enemy.bossHeavyHitStagger?.stagger??0},reducedMotion):null;
      if (regularEnemyActionVfxAtlasReady && regularEnemyActionVfxAtlasImage && targetPos) {
        let actionSprite: ReturnType<typeof regularEnemyActionVfxSprite> | null = null;
        let actionSize = 0;
        if (enemy.type === 'archer' && distance(enemy.pos, targetPos) <= enemy.preferredRange && enemy.attackTimer > 0 && enemy.attackTimer <= 0.38) {
          actionSprite = regularEnemyActionVfxSprite('archer','telegraph'); actionSize = 82;
        } else if (enemy.type === 'bomber' && distance(enemy.pos, targetPos) <= SPECIALIST_COMBAT_CONTRACT.bomberBlastRadius + enemy.radius + 38) {
          actionSprite = regularEnemyActionVfxSprite('bomber','telegraph'); actionSize = 94;
        } else if (enemy.type === 'shaman' && distance(enemy.pos, targetPos) <= enemy.preferredRange && enemy.attackTimer > 0 && enemy.attackTimer <= 0.46) {
          actionSprite = regularEnemyActionVfxSprite('shaman','telegraph'); actionSize = 92;
        }
        if (actionSprite) {
          ctx.save(); ctx.globalAlpha = reducedFlash ? 0.42 : 0.72;
          ctx.drawImage(regularEnemyActionVfxAtlasImage, actionSprite.sx, actionSprite.sy, actionSprite.sw, actionSprite.sh, -actionSize / 2, -actionSize / 2, actionSize, actionSize);
          ctx.restore();
        }
      }
      if (enemy.type === 'elite' || enemy.type === 'boss') {
        ctx.save();
        if(enemy.type==='boss'&&bossSpecialCueBudget)ctx.globalAlpha=bossSpecialCueBudget.baseOutlineScale*bossSpecialCueBudget.alphaScale;
        ctx.strokeStyle = enemy.type === 'boss' ? 'rgba(255,65,85,.85)' : 'rgba(255,211,95,.8)';
        ctx.lineWidth = enemy.type === 'boss' ? 7 : 4;
        ctx.beginPath(); ctx.arc(0, 0, enemy.radius + 10, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      if (enemy.type === 'boss' && (enemy.specialTimer ?? 99) <= 1.2) {
        ctx.save();
        if(bossAnticipationOriginLock)ctx.translate(bossAnticipationOriginLock.offsetX,bossAnticipationOriginLock.offsetY);else if(bossAnticipationOrigin)ctx.translate(bossAnticipationOrigin.ringOffsetX,bossAnticipationOrigin.ringOffsetY);
        const charge = bossSpecialBodyLanguage?.charge ?? (1 - Math.max(0, enemy.specialTimer ?? 0) / 1.2);
        const phase = bossPhaseForRatio(enemy.hp / enemy.maxHp);
        const archetype = enemy.bossArchetype ?? bossArchetypeForOrdinal(enemy.bossOrdinal ?? 0);
        const telegraph = bossVariantTuning(bossArchetypeTuning(archetype, phase), enemy.bossVariantTier ?? bossVariantTierForOrdinal(enemy.bossOrdinal ?? 0));
        ctx.globalAlpha = (0.45 + charge * 0.45)*bossSpecialRingAlphaScale*(bossAnticipationHandoff?bossAnticipationHandoff.ringScale:1)*(bossSpecialCueBudget?bossSpecialCueBudget.primaryRingScale:1);
        ctx.strokeStyle = telegraph.telegraphColor;
        ctx.lineWidth = (4 + charge * 5)*(bossSpecialAnticipation?.ringWidthScale??1);
        ctx.beginPath(); ctx.arc(0, 0, (enemy.radius + 22 + charge * 22 + (bossSpecialBodyLanguage?.auraRadiusBoost ?? 0))*(bossSpecialAnticipation?.ringRadiusScale??1), 0, Math.PI * 2); ctx.stroke();
        if (charge > 0.55) {
          ctx.globalAlpha = (0.35 + charge * 0.35)*(bossSpecialAnticipation?.secondaryRingAlphaScale??1)*(bossAnticipationHandoff?bossAnticipationHandoff.secondaryRingScale:1)*(bossSpecialCueBudget?bossSpecialCueBudget.secondaryRingScale:1);
          ctx.beginPath(); ctx.arc(0, 0, (enemy.radius + 42 + charge * 34)*(bossSpecialAnticipation?.ringRadiusScale??1), 0, Math.PI * 2); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
      }
      if (enemy.type === 'boss') {
        const tier = enemy.bossVariantTier ?? bossVariantTierForOrdinal(enemy.bossOrdinal ?? 0);
        ctx.fillStyle = '#ffe6a5'; ctx.font = '900 11px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(`${enemy.isMythic ? 'MYTHIC · ' : enemy.isApex ? 'APEX · ' : ''}${bossVariantLabel(tier)} BOSS`, 0, -enemy.radius - 25);
      }
      const spritePresentation = enemySpritePresentation(enemy.type, enemy.radius, spriteAtlasReady);
      const bossArchetype = enemy.type === 'boss' ? (enemy.bossArchetype ?? bossArchetypeForOrdinal(enemy.bossOrdinal ?? 0)) : null;
      const bossPresentation = bossArchetype ? bossSpritePresentation(bossArchetype, enemy.radius, bossSpriteAtlasReady) : null;
      const shadowBaseWidth=enemy.radius*1.12,shadowBaseHeight=enemy.radius*.48;
      const ownedShadowWidth=(shadowBaseWidth+(motionPresentation.shadowWidth-shadowBaseWidth)*shadowMotionScale)*spawnGroundMaterialize.shadowWidthScale;
      const ownedShadowHeight=shadowBaseHeight+(motionPresentation.shadowHeight-shadowBaseHeight)*shadowMotionScale;
      const locomotionShadowBoost=bossLocomotion.shadowBoost*(bossGroundCue ? bossGroundCue.locomotionShadowBoostScale : 1);
      const recoveryShadowBoost=(bossSpecialRecovery?.shadowBoost??0)*recoveryScale*bossRecoveryShadowBoostScale;
      ctx.save();
      const specialOriginGroundOffsetX=enemy.type==='boss'?0:bossSpecialOriginHandoff.groundOffsetX,specialOriginGroundOffsetY=enemy.type==='boss'?0:bossSpecialOriginHandoff.groundOffsetY;
      ctx.translate(groundContact.offsetX * shadowMotionScale - motionPresentation.shadowOffsetX * shadowMotionScale + specialistGroundFollowX + bossGroundRebase.groundOffsetX + specialOriginGroundOffsetX, groundContact.offsetY * 0.35 + attackWeightSettle * attackScale + bossGroundRebase.groundOffsetY + specialOriginGroundOffsetY + spawnGroundMaterialize.groundOffsetY);
      ctx.fillStyle = `rgba(8,12,18,${Math.min(0.42, (groundContact.alpha + locomotionShadowBoost + recoveryShadowBoost)*bossSpecialOriginHandoff.shadowAlphaScale*spawnGroundMaterialize.shadowAlphaScale)})`;
      ctx.beginPath();
      ctx.ellipse(motionPresentation.shadowOffsetX * shadowMotionScale, enemy.radius + 8 + motionPresentation.shadowOffsetY * shadowMotionScale, Math.max(ownedShadowWidth, groundContact.width), Math.max(ownedShadowHeight, groundContact.height), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (bossLocomotion.showContactPulse && bossContactPulseScale > .01) {
        const bossContactAlpha=bossLocomotion.contactAlpha*bossContactPulseScale;
        ctx.save();
        ctx.translate(bossAftermath.originOffsetX,bossAftermath.originOffsetY);
        ctx.globalAlpha = reducedFlash ? Math.min(0.14, bossContactAlpha*bossAftermath.aftermathAlphaScale) : bossContactAlpha*bossAftermath.aftermathAlphaScale;
        ctx.strokeStyle = 'rgba(255,198,142,.78)';
        ctx.lineWidth = reducedMotion ? 2 : 3;
        ctx.beginPath();
        ctx.ellipse(0, enemy.radius + 9, bossLocomotion.contactRadius, bossLocomotion.contactRadius * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      if (specialistLocomotionSignature && specialistLocomotionSignature.groundPulseAlpha > 0.01 && specialistGroundPulseScale > .01) {
        const specialistPulseAlpha=specialistLocomotionSignature.groundPulseAlpha*specialistGroundPulseScale;
        ctx.save();
        ctx.translate(specialistGroundFollowX,0);
        ctx.globalAlpha = reducedFlash ? Math.min(0.10, specialistPulseAlpha) : specialistPulseAlpha;
        ctx.strokeStyle = enemy.type === 'siegeGolem' ? 'rgba(220,194,150,.68)' : 'rgba(190,214,240,.58)';
        ctx.lineWidth = reducedMotion ? 1.5 : 2.5;
        ctx.beginPath();
        ctx.ellipse(0, enemy.radius + 8, specialistLocomotionSignature.groundPulseRadius, specialistLocomotionSignature.groundPulseRadius * 0.24, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      const recoverySilhouetteAlphaScale=(specialistRecoveryHandoff?.silhouetteAlphaScale??1)*(specialistRecoveryHandoff?.silhouetteReentryScale??1)*(bossRecoveryStaggerHandoff?.silhouetteAlphaScale??1)*(bossRecoveryStaggerHandoff?.silhouetteReentryScale??1);
      const silhouetteDirection=(isSpecialistEnemyType(enemy.type)||enemy.type==='boss')?characterSilhouetteDirectionOwnerPresentation({kind:enemy.type==='boss'?'boss':'specialist',locomotion:{x:renderFacingX,y:renderFacingY},target:{x:targetDx,y:targetDy},hitDirection:{x:enemy.hitDirectionX??-renderFacingX,y:enemy.hitDirectionY??-renderFacingY},attack:isSpecialistEnemyType(enemy.type)?Math.max(attackMotion.pullback,attackMotion.lunge):0,recovery:enemy.type==='boss'?(enemy.bossSpecialRecovery?.recovery??0):attackResolve.resolve,hit:enemy.type==='boss'?(enemy.bossHeavyHitStagger?.stagger??0):(enemyHitStagger?.stagger??0),special:enemy.type==='boss'&&Number.isFinite(enemy.specialTimer)&&((enemy.specialTimer??99)>=0)&&((enemy.specialTimer??99)<=1.2)?Math.max(0,1-(enemy.specialTimer??0)/1.2):0},reducedMotion):{owner:'locomotion' as const,facingX:renderFacingX,facingY:renderFacingY,trailDistanceScale:1,presentationOnly:true as const};
      const silhouettePivot=characterSilhouetteDirectionPivotPresentation({locomotion:{x:renderFacingX,y:renderFacingY},owned:silhouetteDirection,turn:Math.min(1,Math.abs(motionPresentation.rotation)*4+Math.abs(specialistTurnStop?.rotation??0)*3)},reducedMotion);
      const silhouetteTrailBudget=characterSilhouetteTrailBudgetPresentation({owner:silhouetteDirection.owner,pivotWeight:silhouettePivot.pivotWeight,baseAlpha:motionPresentation.silhouetteAlpha,trailDistanceScale:silhouettePivot.trailDistanceScale,motionLayerActive:silhouetteDirection.owner!=='locomotion'},reducedMotion);
      const silhouetteRecoveryReentry=silhouetteRecoveryReentryPresentation({owner:silhouetteDirection.owner,recovery:enemy.type==='boss'?(enemy.bossSpecialRecovery?.recovery??0):attackResolve.resolve,motionBlend:enemy.renderMotion?.motionBlend??0,turn:Math.abs(motionPresentation.rotation)},reducedMotion),silhouetteContinuityBudget=continuityCrowdBudgetPresentation({activeCount:isSpecialistEnemyType(enemy.type)?activeSpecialistCount:1,indexFromNewest:isSpecialistEnemyType(enemy.type)?specialistAnticipationRank.get(enemy)??activeSpecialistCount:0,owner:'silhouette'},reducedMotion);
      const specialistSilhouetteHandoff=isSpecialistEnemyType(enemy.type)?specialistSilhouettePhaseHandoffPresentation({pullback:attackMotion.pullback,lunge:attackMotion.lunge,resolve:attackResolve.resolve,hit:enemyHitStagger?.stagger??0},reducedMotion):null;
      const specialistCrowdBudget=isSpecialistEnemyType(enemy.type)?specialistSilhouetteCrowdBudgetPresentation({specialistCount:activeSpecialistCount,owner:specialistSilhouetteHandoff?.owner??'locomotion',hit:enemyHitStagger?.stagger??0,baseAlpha:motionPresentation.silhouetteAlpha},reducedMotion):null;
      const specialistSilhouetteEmphasis=isSpecialistEnemyType(enemy.type)?specialistAttackSilhouetteEmphasisPresentation({type:enemy.type,pullback:attackMotion.pullback,lunge:attackMotion.lunge,resolve:attackResolve.resolve,hit:enemyHitStagger?.stagger??0,rangedAim:attackMotion.rangedAim,facingX:silhouettePivot.facingX,facingY:silhouettePivot.facingY},reducedMotion):null;
      const specialistSilhouetteShapeWeight=(specialistSilhouetteHandoff?Math.max(specialistSilhouetteHandoff.strikeScale,specialistSilhouetteHandoff.strikeCarry,specialistSilhouetteHandoff.resolveScale*.55):1)*(anticipationSilhouetteHandoff?.attackShapeScale??1)*(specialistCrowdBudget?.shapeScale??1);
      const specialistSilhouetteWidthScale=(specialistSilhouetteEmphasis?1+(specialistSilhouetteEmphasis.widthScale-1)*specialistSilhouetteShapeWeight:1)*(1+((anticipationSilhouetteContinuity?.widthScale??1)-1)*(anticipationSilhouetteHandoff?.previewShapeScale??1)*(anticipationSilhouetteDensityBudget?.previewEffectStrength??1));
      const specialistSilhouetteHeightScale=(specialistSilhouetteEmphasis?1+(specialistSilhouetteEmphasis.heightScale-1)*specialistSilhouetteShapeWeight:1)*(1+((anticipationSilhouetteContinuity?.heightScale??1)-1)*(anticipationSilhouetteHandoff?.previewShapeScale??1)*(anticipationSilhouetteDensityBudget?.previewEffectStrength??1));
      const specialistSilhouetteLateralOffset=(specialistSilhouetteEmphasis?specialistSilhouetteEmphasis.lateralOffset*specialistSilhouetteShapeWeight:0)+(anticipationSilhouetteContinuity?.lateralOffset??0)*(anticipationSilhouetteHandoff?.previewShapeScale??1)*(anticipationSilhouetteDensityBudget?.previewEffectStrength??1);
      const specialistSilhouetteRecoveryTrail=isSpecialistEnemyType(enemy.type)?specialistAttackSilhouetteRecoveryTrailPresentation({type:enemy.type,attackFacingX:silhouettePivot.facingX,attackFacingY:silhouettePivot.facingY,recoveryFacingX:renderFacingX,recoveryFacingY:renderFacingY,lunge:attackMotion.lunge,resolve:attackResolve.resolve,recoveryBlend:latestStrikeCue?Math.max(attackResolve.resolve,1-latestStrikeCue.ttl/Math.max(.001,latestStrikeCue.maxTtl)):attackResolve.resolve},reducedMotion):null;
      const specialistRecoveryTrailHandoff=specialistSilhouetteRecoveryTrail?specialistRecoveryTrailSilhouetteHandoffPresentation({trailOwner:specialistSilhouetteRecoveryTrail.owner,recoveryBlend:specialistSilhouetteRecoveryTrail.recoveryBlend,silhouetteOwner:silhouetteDirection.owner},reducedMotion):null;
      const specialistRecoveryTrailDensityBudget=isSpecialistEnemyType(enemy.type)&&specialistSilhouetteRecoveryTrail&&specialistRecoveryTrailHandoff?specialistRecoveryTrailDensityBudgetPresentation({activeCount:activeSpecialistCount,indexFromNewest:specialistAnticipationRank.get(enemy)??activeSpecialistCount,type:enemy.type,owner:specialistRecoveryTrailHandoff.owner,recoveryBlend:specialistSilhouetteRecoveryTrail.recoveryBlend},reducedMotion):null;
      const specialistRecoveryLocomotionCadence=isSpecialistEnemyType(enemy.type)&&specialistSilhouetteRecoveryTrail&&specialistRecoveryTrailHandoff?specialistRecoveryTrailLocomotionCadencePresentation({trailOwner:specialistSilhouetteRecoveryTrail.owner,recoveryBlend:specialistSilhouetteRecoveryTrail.recoveryBlend,motionBlend:enemy.renderMotion?.motionBlend??0,signatureStrength:Math.max(specialistLocomotionSignature?.arrival??0,specialistLocomotionSignature?.brace??0,specialistLocomotionSignature?.plant??0)},reducedMotion):null;
      const specialistRecoveryCadenceHandoff=specialistRecoveryLocomotionCadence?specialistRecoveryLocomotionCadenceHandoffPresentation({owner:specialistRecoveryLocomotionCadence.owner,recoveryBlend:specialistSilhouetteRecoveryTrail?.recoveryBlend??1,motionBlend:enemy.renderMotion?.motionBlend??0,cadenceScale:specialistRecoveryLocomotionCadence.locomotionCadenceScale},reducedMotion):null;
      const specialistRecoveryCadenceDensity=isSpecialistEnemyType(enemy.type)&&specialistRecoveryLocomotionCadence?specialistRecoveryLocomotionCadenceDensityBudgetPresentation({activeCount:activeSpecialistCount,indexFromNewest:specialistAnticipationRank.get(enemy)??activeSpecialistCount,type:enemy.type,owner:specialistRecoveryLocomotionCadence.owner},reducedMotion):null;
      const specialistRecoveryCadenceEffect=specialistRecoveryCadenceDensity?.effectStrength??1, specialistRecoveryCadenceTrailScale=1-(1-(specialistRecoveryCadenceHandoff?.trailAlphaScale??1))*specialistRecoveryCadenceEffect, specialistRecoveryCadenceSignatureScale=1-(1-(specialistRecoveryCadenceHandoff?.signatureAlphaScale??1))*specialistRecoveryCadenceEffect, specialistRecoveryCadenceScale=1-(1-(specialistRecoveryCadenceHandoff?.cadenceScale??1))*specialistRecoveryCadenceEffect;
      const silhouetteResolution=silhouetteLocomotionSettlePresentation({owner:silhouetteDirection.owner,locomotionWeight:silhouetteRecoveryReentry.locomotionWeight,motionBlend:enemy.renderMotion?.motionBlend??0,turn:Math.abs(motionPresentation.rotation)},reducedMotion),silhouetteResolutionBudget=continuityResolutionBudgetPresentation({activeCount:isSpecialistEnemyType(enemy.type)?activeSpecialistCount:1,indexFromNewest:isSpecialistEnemyType(enemy.type)?specialistAnticipationRank.get(enemy)??activeSpecialistCount:0,kind:'silhouette'},reducedMotion);
      const silhouetteResolutionEffect=silhouetteResolutionBudget.effectStrength,silhouetteResolutionAlphaScale=1-(1-silhouetteResolution.overlayAlphaScale)*silhouetteResolutionEffect,silhouetteResolutionTrailScale=1-(1-silhouetteResolution.trailScale)*silhouetteResolutionEffect;
      const silhouettePriority=silhouetteThreatDeconflictionPresentation({owner:silhouetteDirection.owner,threatPressure:Math.min(1,(this.projectiles.length+activeSpecialistCount)/10),attackStrength:silhouetteDirection.owner==='attack'||silhouetteDirection.owner==='special'?1:.25},reducedMotion),silhouetteSpatial=silhouetteLocalContrastPresentation({threatProximity:Math.min(1,(this.projectiles.length+activeSpecialistCount)/10),owner:silhouetteDirection.owner,specialist:isSpecialistEnemyType(enemy.type)},reducedMotion),silhouetteTemporal=silhouetteContrastRecoveryPresentation({owner:silhouetteDirection.owner,recovery:silhouetteRecoveryReentry.locomotionWeight,pressure:Math.min(1,(this.projectiles.length+activeSpecialistCount)/10)},reducedMotion);
            const specialistDepth=specialistHazardDepthPresentation({owner:silhouetteDirection.owner,hazardPressure,attackStrength:silhouetteDirection.owner==='attack'||silhouetteDirection.owner==='special'?1:.25},reducedMotion),specialistDepthBudget=battlefieldDepthBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,bossTelegraph:false,safeLaneVisible:false,projectilePressure:Math.min(1,this.projectiles.length/10),impactPressure:0,hazardPressure},reducedMotion,reducedFlash);
      const specialistDepthRecovery=specialistDepthRecoveryPresentation({owner:silhouetteDirection.owner,recovery:silhouetteRecoveryReentry.locomotionWeight,hazardPressure},reducedMotion),specialistRecoveryBudget=depthRecoveryBudgetPresentation({recoveringCount:isSpecialistEnemyType(enemy.type)?activeSpecialistCount:1,pressure:Math.min(1,hazardPressure+this.projectiles.length/12),criticalCount:silhouetteDirection.owner==='special'?1:0},reducedMotion,reducedFlash);
      const specialistDepthPlane=specialistRimDepthPresentation({owner:silhouetteDirection.owner,hazardPressure,crowd:Math.min(1,(this.projectiles.length+activeSpecialistCount)/10),critical:silhouetteDirection.owner==='special'},reducedMotion),specialistDepthPlaneBudget=depthPlaneBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,projectileCount:this.projectiles.length,impactCount:0,hazardCount:Math.round(hazardPressure*4),silhouetteCount:activeSpecialistCount,safeLaneVisible:false},reducedMotion,reducedFlash);
      const specialistDepthReentry=specialistRimReentryPresentation({release:1-hazardPressure,pressure:specialistDepthPlane.pressure,owner:silhouetteDirection.owner},reducedMotion),specialistDepthReentryBudget=depthReentryBudgetPresentation({reenteringCount:activeSpecialistCount,pressure:specialistDepthPlane.pressure,criticalCount:silhouetteDirection.owner==='special'?1:0},reducedMotion,reducedFlash);
      const specialistBossProximity=Math.min(1,this.enemies.filter((boss)=>boss.alive&&boss.type==='boss').reduce((best,boss)=>Math.max(best,1-Math.min(1,distance(enemy.pos,boss.pos)/220)),0)),specialistBossFocus=bossSpecialistFocusCorridorPresentation({bossProximity:specialistBossProximity,owner:silhouetteDirection.owner,critical:silhouetteDirection.owner==='special'},reducedMotion),specialistBossFocusBudget=bossFocusCorridorBudgetPresentation({bossActive:specialistBossProximity>0,criticalCount:silhouetteDirection.owner==='special'?1:0,projectileCount:this.projectiles.length,impactCount:0,hazardCount:Math.round(hazardPressure*4),silhouetteCount:activeSpecialistCount,safeLaneVisible:false},reducedMotion,reducedFlash);
      const specialistCanonicalReacquisition=specialistCanonicalReacquisitionPresentation({owner:silhouetteDirection.owner,release:specialistDepthReentry.reclaim,pressure:Math.max(specialistDepthPlane.pressure,specialistBossFocus.focus),critical:silhouetteDirection.owner==='special'},reducedMotion),specialistCanonicalReacquisitionBudget=canonicalReacquisitionBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,projectileCount:this.projectiles.length,impactCount:0,hazardCount:Math.round(hazardPressure*4),silhouetteCount:activeSpecialistCount,safeLaneVisible:false},reducedMotion,reducedFlash);
      const specialistFacingReacquisition=specialistFacingReacquisitionPresentation({owner:silhouetteDirection.owner,reacquire:specialistCanonicalReacquisition.reacquire,pressure:Math.max(specialistDepthPlane.pressure,specialistBossFocus.focus),critical:silhouetteDirection.owner==='special'},reducedMotion),specialistDirectionReacquisitionBudget=directionReacquisitionBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,projectileCount:this.projectiles.length,impactCount:0,hazardCount:Math.round(hazardPressure*4),silhouetteCount:activeSpecialistCount,safeLaneVisible:false},reducedMotion,reducedFlash);
      const specialistCriticalReengagement=specialistBossReengagementLockPresentation({bossProximity:specialistBossProximity,owner:silhouetteDirection.owner,reacquire:specialistCanonicalReacquisition.reacquire,critical:silhouetteDirection.owner==='special'},reducedMotion),specialistCriticalReengagementBudget=criticalReengagementBudgetPresentation({bossActive:specialistBossProximity>0,criticalCount:silhouetteDirection.owner==='special'?1:0,projectileCount:this.projectiles.length,impactCount:0,hazardCount:Math.round(hazardPressure*4),silhouetteCount:activeSpecialistCount,safeLaneVisible:false},reducedMotion,reducedFlash);
      const specialistEffectiveFloor=specialistEffectiveAlphaFloorPresentation({owner:silhouetteDirection.owner,bossProximity:specialistBossProximity,reacquire:specialistCanonicalReacquisition.reacquire,critical:silhouetteDirection.owner==='special'},reducedMotion),specialistEffectiveFloorBudget=effectiveAlphaFloorBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,crowd:Math.min(1,(this.projectiles.length+activeSpecialistCount)/10),safeLaneVisible:false,bossActive:specialistBossProximity>0},reducedFlash);
      const specialistSpatialSeparation=specialistDirectionalSeparationPresentation({owner:silhouetteDirection.owner,hazardPressure,crowd:Math.min(1,(this.projectiles.length+activeSpecialistCount)/10),attackStrength:silhouetteDirection.owner==='attack'||silhouetteDirection.owner==='special'?1:.25},reducedMotion),specialistSpatialSeparationBudget=spatialThreatSeparationBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,safeLaneVisible:false,projectileCount:this.projectiles.length,impactCount:0,hazardCount:Math.round(hazardPressure*4),silhouetteCount:activeSpecialistCount},reducedMotion,reducedFlash);
      const specialistSpatialRelease=specialistDirectionalReleasePresentation({owner:silhouetteDirection.owner,hazardPressure,recovery:silhouetteRecoveryReentry.locomotionWeight},reducedMotion),specialistSpatialRecoveryBudget=spatialRecoveryBudgetPresentation({recoveringCount:activeSpecialistCount,pressure:specialistSpatialSeparation.pressure,criticalCount:silhouetteDirection.owner==='special'?1:0},reducedMotion,reducedFlash);
      const specialistDenseArbitration=denseSilhouetteArbitrationPresentation({silhouetteCount:activeSpecialistCount,indexFromNewest:specialistAnticipationRank.get(enemy)??activeSpecialistCount,owner:silhouetteDirection.owner,critical:silhouetteDirection.owner==='special'},reducedMotion),specialistDenseBattlefield=denseBattlefieldArbitrationPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,hazardCount:Math.round(hazardPressure*4),projectileCount:this.projectiles.length,impactCount:0,silhouetteCount:activeSpecialistCount,safeLaneVisible:false},reducedMotion,reducedFlash);
      const specialistSecondaryCeiling=specialistSecondaryCeilingPresentation({stress:Math.max(specialistDenseBattlefield.stress,specialistCriticalReengagement.lock),owner:silhouetteDirection.owner,critical:silhouetteDirection.owner==='special',reacquire:specialistCanonicalReacquisition.reacquire},reducedMotion),specialistSecondaryCeilingBudget=secondaryCeilingBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,crowd:Math.min(1,(this.projectiles.length+activeSpecialistCount)/10),bossActive:specialistBossProximity>0},reducedMotion,reducedFlash);
      const specialistReadabilityContrast=specialistReadabilityContrastPresentation({silhouetteFloor:specialistEffectiveFloor.silhouetteAlphaFloor,trailScale:specialistSecondaryCeiling.trailScale,owner:silhouetteDirection.owner,critical:silhouetteDirection.owner==='special',crowd:Math.min(1,(this.projectiles.length+activeSpecialistCount)/10)},reducedMotion),specialistReadabilityContrastBudget=readabilityContrastBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,crowd:Math.min(1,(this.projectiles.length+activeSpecialistCount)/10),bossActive:specialistBossProximity>0,safeLaneVisible:false},reducedMotion,reducedFlash);
      const specialistFinalSettle=specialistFinalReadabilitySettlePresentation({primaryFloor:specialistReadabilityContrast.silhouetteAlphaFloor,reacquire:specialistCanonicalReacquisition.reacquire,stress:specialistReadabilityContrastBudget.stress,critical:silhouetteDirection.owner==='special'},reducedMotion,reducedFlash),specialistFinalSettleBudget=finalReadabilitySettleBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,stress:specialistReadabilityContrastBudget.stress,bossActive:specialistBossProximity>0,safeLaneVisible:false},reducedMotion,reducedFlash);
      const specialistSecondaryRecoveryGate=specialistSecondaryRecoveryGatePresentation({release:specialistFinalSettle.settle,stress:specialistFinalSettleBudget.stress,critical:silhouetteDirection.owner==='special'},reducedMotion,reducedFlash),specialistSecondaryRecoveryGateBudget=secondaryRecoveryGateBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,stress:specialistFinalSettleBudget.stress,release:specialistFinalSettle.settle},reducedMotion,reducedFlash);
      const specialistFocusTransfer=specialistFocusTransferCoherencePresentation({incomingFocus:specialistFinalSettle.settle,outgoingFocus:specialistBossFocus.focus,stress:specialistSecondaryRecoveryGateBudget.hold,critical:silhouetteDirection.owner==='special'},reducedMotion,reducedFlash),specialistFocusTransferBudget=focusTransferCoherenceBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,stress:specialistFinalSettleBudget.stress,incomingFocus:specialistFinalSettle.settle,outgoingFocus:specialistBossFocus.focus},reducedMotion,reducedFlash);
      const specialistPeakSeparation=specialistRecoveryTrailPeakPresentation({facingPeak:specialistFocusTransfer.incomingScale,recoveryPeak:specialistSecondaryRecoveryGate.release,stress:specialistSecondaryRecoveryGateBudget.hold,critical:specialistFinalSettleBudget.stress>.72},reducedMotion,reducedFlash),specialistPeakBudget=crossFamilyPeakBudgetPresentation({activePeakFamilies:2,crowd:specialistFinalSettleBudget.stress,criticalCount:specialistFinalSettleBudget.stress>.72?1:0,safeLaneVisible:false,bossActive:specialistFinalSettleBudget.stress>.78},reducedMotion,reducedFlash);
      const specialistRhythmRecovery=specialistRhythmRecoveryPresentation({suppression:1-specialistPeakSeparation.recoveryTrailScale,release:specialistSecondaryRecoveryGate.release,stress:Math.max(specialistPeakBudget.load,specialistSecondaryRecoveryGateBudget.hold),critical:specialistFinalSettleBudget.stress>.72},reducedMotion,reducedFlash),specialistRhythmRecoveryBudget=rhythmRecoveryBudgetPresentation({recoveringFamilies:2,stress:Math.max(specialistPeakBudget.load,specialistSecondaryRecoveryGateBudget.hold),criticalCount:specialistFinalSettleBudget.stress>.72?1:0,safeLaneVisible:false,bossActive:specialistFinalSettleBudget.stress>.78},reducedMotion,reducedFlash);
      const silhouetteRecoveryEffect=silhouetteContinuityBudget.effectStrength,silhouetteRecoveryAlphaScale=(1-(1-silhouetteRecoveryReentry.alphaScale)*silhouetteRecoveryEffect)*silhouetteResolutionAlphaScale,silhouetteRecoveryTrailScale=(1-(1-silhouetteRecoveryReentry.trailDistanceScale)*silhouetteRecoveryEffect)*silhouetteResolutionTrailScale;
      const specialistSilhouetteAlphaScale=Math.max(specialistEffectiveFloor.silhouetteAlphaFloor*specialistEffectiveFloorBudget.canonicalFloorScale,specialistReadabilityContrast.silhouetteAlphaFloor*specialistReadabilityContrastBudget.primaryScale,specialistFinalSettle.primaryFloor,(specialistSilhouetteEmphasis?.alphaScale??1)*(anticipationSilhouetteContinuity?.silhouetteAlphaScale??1)*(specialistSilhouetteHandoff?specialistSilhouetteHandoff.attackAlphaScale:1)*(specialistCrowdBudget?specialistCrowdBudget.alphaScale:1)*(specialistSilhouetteRecoveryTrail?.trailAlphaScale??1)*Math.min(1,(specialistRecoveryTrailHandoff?.recoveryTrailAlphaScale??0)+(specialistRecoveryTrailHandoff?.locomotionTrailAlphaScale??1))*(specialistRecoveryTrailDensityBudget?.effectStrength??1)*Math.max(specialistRecoveryLocomotionCadence?.recoveryTrailAlphaScale??1,specialistRecoveryLocomotionCadence?.locomotionCadenceScale??0)*specialistRecoveryCadenceTrailScale*silhouetteRecoveryAlphaScale*silhouettePriority.overlayAlphaScale*silhouetteSpatial.overlayAlphaScale*silhouetteTemporal.overlayAlphaScale*specialistDepth.directionAlphaScale*specialistDepthBudget.secondaryAlphaScale*specialistDepthRecovery.directionAlphaScale*specialistRecoveryBudget.secondaryRecoveryScale*specialistSpatialSeparation.directionAlphaScale*specialistSpatialSeparation.secondaryAlphaScale*specialistSpatialSeparationBudget.secondaryAlphaScale*specialistSpatialRelease.directionAlphaScale*specialistSpatialRelease.secondaryAlphaScale*specialistSpatialRecoveryBudget.secondaryRecoveryScale*specialistDenseArbitration.directionAlphaScale*specialistDenseArbitration.secondaryAlphaScale*specialistDenseBattlefield.secondaryAlphaScale*specialistDepthPlane.rimAlphaScale*specialistDepthPlaneBudget.secondaryAlphaScale*specialistDepthReentry.rimAlphaScale*specialistDepthReentryBudget.secondaryReentryScale*specialistBossFocus.directionScale*specialistBossFocusBudget.secondaryScale*specialistCanonicalReacquisition.facingScale*specialistCanonicalReacquisitionBudget.canonicalScale*specialistFacingReacquisition.facingScale*specialistDirectionReacquisitionBudget.primaryDirectionScale*specialistCriticalReengagement.directionScale*specialistCriticalReengagementBudget.canonicalScale);
      const specialistSilhouetteTrailScale=(specialistSilhouetteEmphasis?.trailDistanceScale??1)*(specialistSilhouetteHandoff?specialistSilhouetteHandoff.trailScale:1)*(specialistCrowdBudget?.trailScale??1)*(specialistSilhouetteRecoveryTrail?.trailDistanceScale??1)*(specialistTurnStopRhythm?.trailDistanceScale??1)*(1-(1-(specialistTurnStopHandoff?.turnStopScale??1))*(specialistTurnStopDensity?.effectStrength??1))*silhouetteRecoveryTrailScale*silhouettePriority.trailScale*silhouetteSpatial.trailAlphaScale*silhouetteTemporal.trailAlphaScale*specialistDepth.trailAlphaScale*specialistDepthBudget.secondaryAlphaScale*specialistDepthRecovery.trailAlphaScale*specialistRecoveryBudget.secondaryRecoveryScale*specialistSpatialSeparation.trailAlphaScale*specialistSpatialSeparationBudget.secondaryAlphaScale*specialistSpatialRelease.trailAlphaScale*specialistSpatialRecoveryBudget.secondaryRecoveryScale*specialistDenseArbitration.trailAlphaScale*specialistDenseBattlefield.secondaryAlphaScale*specialistDepthPlane.secondaryScale*specialistDepthPlaneBudget.backgroundScale*specialistDepthReentry.secondaryScale*specialistDepthReentryBudget.secondaryReentryScale*specialistBossFocus.secondaryScale*specialistBossFocusBudget.secondaryScale*specialistCanonicalReacquisition.recoveryTrailScale*specialistCanonicalReacquisitionBudget.staleDecorationScale*specialistFacingReacquisition.trailDirectionScale*specialistDirectionReacquisitionBudget.staleDirectionScale*specialistCriticalReengagement.secondaryScale*specialistCriticalReengagementBudget.secondaryScale*specialistSecondaryCeiling.trailScale*specialistSecondaryCeilingBudget.secondaryScale*specialistReadabilityContrast.trailScale*specialistReadabilityContrastBudget.secondaryScale*specialistFinalSettle.secondaryScale*specialistFinalSettleBudget.secondaryScale*specialistSecondaryRecoveryGate.secondaryScale*specialistSecondaryRecoveryGateBudget.secondaryScale*specialistFocusTransfer.secondaryScale*specialistFocusTransferBudget.secondaryScale*specialistPeakSeparation.recoveryTrailScale*specialistPeakBudget.secondaryScale*specialistRhythmRecovery.trailScale*specialistRhythmRecoveryBudget.secondaryScale;
      const dynamicSilhouette = motionPresentation.silhouetteAlpha*recoverySilhouetteAlphaScale*silhouetteTrailBudget.alphaScale*specialistSilhouetteAlphaScale > 0.02 && (enemy.type === 'elite' || enemy.type === 'boss' || isSpecialistEnemyType(enemy.type));
      const specialistSignatureScale=specialistLocomotionOwnershipScale*(specialistRecoveryLocomotionCadence?.locomotionCadenceScale??1)*specialistRecoveryCadenceSignatureScale*specialistRecoveryCadenceScale*(specialistTurnStopRhythm?.cadenceScale??1)*(1-(1-(specialistTurnStopHandoff?.cadenceScale??1))*(specialistTurnStopDensity?.effectStrength??1));
      const bossLocomotionScale=bossLocomotionOwnershipScale*bossGroundRebase.locomotionSettleScale;
      ctx.save();
      ctx.translate(motionPresentation.leadX * locomotionOwnershipScale + attackMotion.offsetX * attackScale + attackResolve.offsetX * attackResolveScale + hitRecoil.offsetX + (enemyHitStagger?.offsetX ?? 0) * hitStaggerScale + (bossHeavyHitStagger?.offsetX ?? 0) * bossStaggerScale + (specialistLocomotionSignature?.offsetX ?? 0) * specialistSignatureScale + (specialistTurnStop?.offsetX ?? 0) * specialistTurnOwnershipScale + (bossSpecialBodyLanguage?.offsetX ?? 0) + (bossSpecialRecovery?.offsetX ?? 0) * recoveryScale, (motionPresentation.leadY - motionPresentation.bob) * locomotionOwnershipScale + attackMotion.offsetY * attackScale + attackResolve.offsetY * attackResolveScale + hitRecoil.offsetY + (enemyHitStagger?.offsetY ?? 0) * hitStaggerScale + (bossHeavyHitStagger?.offsetY ?? 0) * bossStaggerScale + bossLocomotion.offsetY * bossLocomotionScale + (specialistLocomotionSignature?.offsetY ?? 0) * specialistSignatureScale + (specialistTurnStop?.offsetY ?? 0) * specialistTurnOwnershipScale + (bossSpecialBodyLanguage?.offsetY ?? 0) + (bossSpecialRecovery?.offsetY ?? 0) * recoveryScale);
      ctx.rotate(motionPresentation.rotation * locomotionOwnershipScale + attackMotion.rotation * attackScale + attackResolve.rotation * attackResolveScale + rangedAimRotation * attackScale + hitRecoil.rotation + (enemyHitStagger?.rotation ?? 0) * hitStaggerScale + (bossHeavyHitStagger?.rotation ?? 0) * bossStaggerScale + bossLocomotion.rotation * bossLocomotionScale + (specialistLocomotionSignature?.rotation ?? 0) * specialistSignatureScale + (specialistTurnStop?.rotation ?? 0) * specialistTurnOwnershipScale + (bossSpecialBodyLanguage?.rotation ?? 0) + (bossSpecialRecovery?.rotation ?? 0) * recoveryScale);
      const attackMotionScaleX=1+(attackMotion.scaleX-1)*attackScale,attackMotionScaleY=1+(attackMotion.scaleY-1)*attackScale;
      const attackResolveScaleX=1+(attackResolve.scaleX-1)*attackResolveScale,attackResolveScaleY=1+(attackResolve.scaleY-1)*attackResolveScale;
      const enemyHitScaleX=1+((enemyHitStagger?.scaleX??1)-1)*hitStaggerScale,enemyHitScaleY=1+((enemyHitStagger?.scaleY??1)-1)*hitStaggerScale;
      const bossStaggerScaleX=1+((bossHeavyHitStagger?.scaleX??1)-1)*bossStaggerScale,bossStaggerScaleY=1+((bossHeavyHitStagger?.scaleY??1)-1)*bossStaggerScale;
      const bossRecoveryScaleX=1+((bossSpecialRecovery?.scaleX??1)-1)*recoveryScale,bossRecoveryScaleY=1+((bossSpecialRecovery?.scaleY??1)-1)*recoveryScale;
      const ownedMotionScaleX=1+(motionPresentation.scaleX-1)*locomotionOwnershipScale,ownedMotionScaleY=1+(motionPresentation.scaleY-1)*locomotionOwnershipScale;
      const specialistSignatureScaleX=1+((specialistLocomotionSignature?.scaleX??1)-1)*specialistSignatureScale,specialistSignatureScaleY=1+((specialistLocomotionSignature?.scaleY??1)-1)*specialistSignatureScale;
      const specialistTurnScaleX=1+((specialistTurnStop?.scaleX??1)-1)*specialistTurnOwnershipScale,specialistTurnScaleY=1+((specialistTurnStop?.scaleY??1)-1)*specialistTurnOwnershipScale;
      ctx.scale(ownedMotionScaleX * attackMotionScaleX * attackResolveScaleX * attackPhaseScale * enemyHitScaleX * bossStaggerScaleX * specialistSignatureScaleX * specialistTurnScaleX * (bossSpecialBodyLanguage?.scaleX ?? 1) * bossSpecialBodyScaleX * bossRecoveryScaleX, ownedMotionScaleY * attackMotionScaleY * attackResolveScaleY * enemyHitScaleY * bossStaggerScaleY * specialistSignatureScaleY * specialistTurnScaleY * (bossSpecialBodyLanguage?.scaleY ?? 1) * bossSpecialBodyScaleY * bossRecoveryScaleY / Math.max(0.94, attackPhaseScale));
      const recoilDisplacementGuard = hitRecoil.maxDisplacement;
      if (dynamicSilhouette) {
        ctx.save();
        ctx.globalAlpha = motionPresentation.silhouetteAlpha*recoverySilhouetteAlphaScale*silhouetteTrailBudget.alphaScale*specialistSilhouetteAlphaScale;
        const specialistTrailFacingX=specialistSilhouetteRecoveryTrail?.facingX??silhouettePivot.facingX,specialistTrailFacingY=specialistSilhouetteRecoveryTrail?.facingY??silhouettePivot.facingY;
        const specialistPerpX=-specialistTrailFacingY,specialistPerpY=specialistTrailFacingX,specialistLateral=specialistSilhouetteLateralOffset;
        ctx.translate(-specialistTrailFacingX * (enemy.radius * 0.28 + 3 + recoilDisplacementGuard * 0.02)*silhouetteTrailBudget.trailDistanceScale*specialistSilhouetteTrailScale+specialistPerpX*specialistLateral, -specialistTrailFacingY * (enemy.radius * 0.18 + 2)*silhouetteTrailBudget.trailDistanceScale*specialistSilhouetteTrailScale+specialistPerpY*specialistLateral);
        ctx.fillStyle = enemy.type === 'boss' ? 'rgba(255,125,140,.55)' : enemy.type === 'elite' ? 'rgba(255,222,120,.52)' : 'rgba(187,216,255,.45)';
        ctx.beginPath(); ctx.ellipse(0,0,enemy.radius*.92*specialistSilhouetteWidthScale,enemy.radius*.92*specialistSilhouetteHeightScale,0,0,Math.PI*2); ctx.fill();
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = spritePresentation.visible || bossPresentation?.visible ? 0.22 : 1;
      ctx.fillStyle = enemy.hitFlash > 0 ? '#ffffff' : enemy.color;
      ctx.beginPath(); ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = enemy.target === 'core' ? '#76dbff' : 'rgba(18,23,31,.9)'; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
      if (spritePresentation.visible && spriteAtlasImage && isEnemySpriteType(enemy.type)) {
        const sprite = enemySpriteRect(enemy.type);
        const size = spritePresentation.drawSize;
        ctx.drawImage(spriteAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -size / 2, -size / 2, size, size);
        if (enemy.hitFlash > 0) {
          ctx.save(); ctx.globalAlpha = 0.38; ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(0, 0, enemy.radius * 0.82, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
      }
      if (bossPresentation?.visible && bossSpriteAtlasImage && bossArchetype) {
        const sprite = bossSpriteRect(bossArchetype);
        const size = bossPresentation.drawSize;
        ctx.drawImage(bossSpriteAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -size / 2, -size / 2, size, size);
        if (enemy.hitFlash > 0) {
          ctx.save(); ctx.globalAlpha = 0.34; ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(0, 0, enemy.radius * 0.86, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
        const phase = bossPhaseForRatio(enemy.hp / Math.max(1, enemy.maxHp));
        if (phase >= 2 && bossPhaseOverlayVfxAtlasReady && bossPhaseOverlayVfxAtlasImage) {
          const overlay = bossPhaseOverlayVfxSprite(bossArchetype, phase === 3 ? 3 : 2);
          const overlaySize = size * (phase === 3 ? 1.26 : 1.16);
          ctx.save(); ctx.globalAlpha = (phase === 3 ? 0.76 : 0.56)*(bossSpecialCueBudget?bossSpecialCueBudget.phaseOverlayScale:1)*(bossSpecialCueBudget?.alphaScale??1);
          ctx.drawImage(bossPhaseOverlayVfxAtlasImage, overlay.sx, overlay.sy, overlay.sw, overlay.sh, -overlaySize / 2, -overlaySize / 2, overlaySize, overlaySize);
          ctx.restore();
        }
      }
      if (hitRecoil.flashAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = hitRecoil.flashAlpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(0, 0, enemy.radius * 0.7, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      if (enemyTargetPressureVfxAtlasReady && enemyTargetPressureVfxAtlasImage && enemyTargetPressureVisible(enemy.type,enemy.target)) {
        const pressureSprite = enemyTargetPressureVfxSprite(enemyTargetPressureClassForEnemyType(enemy.type),enemy.target);
        const pressureSize = enemy.type === 'boss' ? 52 : enemy.type === 'elite' ? 44 : isSpecialistEnemyType(enemy.type) ? 38 : 34;
        const pressureY = -enemy.radius - (enemy.type === 'boss' ? 42 : 30);
        ctx.save(); ctx.globalAlpha = reducedFlash ? 0.56 : 0.88;
        ctx.drawImage(enemyTargetPressureVfxAtlasImage, pressureSprite.sx, pressureSprite.sy, pressureSprite.sw, pressureSprite.sh, -pressureSize / 2, pressureY - pressureSize / 2, pressureSize, pressureSize);
        ctx.restore();
      }
      if (enemy.type === 'golden') {
        ctx.strokeStyle = 'rgba(255,232,111,.92)'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(0, 0, enemy.radius + 8 + Math.sin(enemy.attackTimer * 3) * (residualMotion?.goldenEnemyMotionAmplitude ?? 0.05) * 40, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#6a4810'; ctx.font = '900 15px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('G', 0, 1);
      } else if (enemy.type === 'bomber') {
        ctx.strokeStyle = 'rgba(255,106,61,.88)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, enemy.radius + 7 + Math.sin(enemy.attackTimer * 8) * (residualMotion?.bomberBodyMotionAmplitude ?? 0.05) * 40, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#40150c'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
      } else if (enemy.type === 'shaman') {
        ctx.strokeStyle = 'rgba(126,255,172,.72)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, enemy.radius + 10, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#e5fff0'; ctx.fillRect(-3, -10, 6, 20); ctx.fillRect(-10, -3, 20, 6);
      }
      if (enemy.type === 'shieldbearer' && (enemy.guardHp ?? 0) > 0) {
        ctx.strokeStyle = 'rgba(152,190,255,.88)'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(0, 0, enemy.radius + 7, Math.PI * 0.65, Math.PI * 1.35); ctx.stroke();
      } else if (enemy.type === 'assassin') {
        ctx.strokeStyle = 'rgba(214,126,255,.75)'; ctx.lineWidth = 2; ctx.setLineDash([5,4]);
        ctx.beginPath(); ctx.arc(0, 0, enemy.radius + 7, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      } else if (enemy.type === 'siegeGolem') {
        ctx.fillStyle = '#ffe0a5'; ctx.font = '900 9px system-ui'; ctx.textAlign = 'center'; ctx.fillText('CORE', 0, 2);
      } else if (enemy.type === 'nullifier') {
        ctx.strokeStyle = 'rgba(111,168,255,.55)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, enemy.preferredRange * 0.32, 0, Math.PI * 2); ctx.stroke();
      }
      if (isSpecialistCombatVfxType(enemy.type) && specialistCombatVfxAtlasReady && specialistCombatVfxAtlasImage) {
        const emphasis = specialistIntentEmphasis(enemy.type, {
          guardHp: enemy.guardHp ?? 0,
          specialistTimer: enemy.specialistTimer ?? 99,
          target: enemy.target,
          heroInsideNullifier: Boolean(heroPos && distance(enemy.pos, heroPos) <= SPECIALIST_COMBAT_CONTRACT.nullifierEffectRadius + enemy.radius),
        });
        const pose = specialistCombatVfxSprite(enemy.type, 'pose');
        const projectile = specialistCombatVfxSprite(enemy.type, 'projectile');
        const poseSize = Math.max(54, enemy.radius * 3.1);
        ctx.save(); ctx.globalAlpha = emphasis ? 0.74 : 0.34;
        ctx.drawImage(specialistCombatVfxAtlasImage, pose.sx, pose.sy, pose.sw, pose.sh, -poseSize / 2, -poseSize / 2, poseSize, poseSize);
        if (emphasis) {
          const effectSize = Math.max(34, enemy.radius * 1.8);
          const direction = enemy.target === 'core' ? 1 : -1;
          const effectX = direction * (enemy.radius + effectSize * 0.18);
          ctx.globalAlpha = 0.88;
          ctx.drawImage(specialistCombatVfxAtlasImage, projectile.sx, projectile.sy, projectile.sw, projectile.sh, effectX - effectSize / 2, -effectSize / 2, effectSize, effectSize);
        }
        ctx.restore();
      }
      if (isSpecialistIntentType(enemy.type) && specialistIntentAtlasReady && specialistIntentAtlasImage) {
        const layout = specialistIntentOnBodyLayout(enemy.radius, enemy.pos);
        const icon = specialistIntentIcon(enemy.type);
        const emphasis = specialistIntentEmphasis(enemy.type, {
          guardHp: enemy.guardHp ?? 0,
          specialistTimer: enemy.specialistTimer ?? 99,
          target: enemy.target,
          heroInsideNullifier: Boolean(heroPos && distance(enemy.pos, heroPos) <= 245 + enemy.radius),
        });
        ctx.save();
        ctx.globalAlpha = emphasis ? 1 : 0.82;
        if (emphasis) {
          ctx.fillStyle = 'rgba(143,233,255,.12)';
          ctx.fillRect(layout.localCenterX - layout.iconSize / 2 - 2, layout.localCenterY - layout.iconSize / 2 - 2, layout.iconSize + 4, layout.iconSize + 4);
          ctx.strokeStyle = 'rgba(205,245,255,.84)'; ctx.lineWidth = 1.25;
          ctx.strokeRect(layout.localCenterX - layout.iconSize / 2 - 1, layout.localCenterY - layout.iconSize / 2 - 1, layout.iconSize + 2, layout.iconSize + 2);
        }
        ctx.drawImage(specialistIntentAtlasImage, icon.sx, icon.sy, icon.sw, icon.sh, layout.localCenterX - layout.iconSize / 2, layout.localCenterY - layout.iconSize / 2, layout.iconSize, layout.iconSize);
        ctx.restore();
      }
      if (enemy.type === 'elite' && enemy.eliteAffixes?.length) {
        if (eliteAffixLifecycleVfxAtlasReady && eliteAffixLifecycleVfxAtlasImage) {
          const count = Math.min(2, enemy.eliteAffixes.length);
          for (let index = 0; index < count; index += 1) {
            const affixId = enemy.eliteAffixes[index]!;
            const activeSprite = eliteAffixLifecycleVfxSprite(affixId,'active');
            const size = enemy.radius * (index === 0 ? 2.9 : 2.45);
            ctx.save(); ctx.rotate((index === 0 ? 1 : -1) * (0.10 + index * 0.04)); ctx.globalAlpha = reducedFlash ? 0.26 : 0.42;
            ctx.drawImage(eliteAffixLifecycleVfxAtlasImage, activeSprite.sx, activeSprite.sy, activeSprite.sw, activeSprite.sh, -size / 2, -size / 2, size, size);
            ctx.restore();
          }
        }
        const layout = eliteAffixIdentityRowLayout(enemy.eliteAffixes.length, enemy.radius, enemy.pos);
        if (eliteAffixAtlasReady && eliteAffixAtlasImage) {
          const hpRatio = enemy.hp / Math.max(1, enemy.maxHp);
          const manaShieldRatio = enemy.manaShield / Math.max(1, enemy.maxManaShield);
          for (let index = 0; index < enemy.eliteAffixes.length && index < 2; index += 1) {
            const affixId = enemy.eliteAffixes[index]!;
            const icon = eliteAffixIdentityIcon(affixId);
            const localX = layout.worldCentersX[index]! - enemy.pos.x;
            const localY = layout.localCenterY;
            const emphasis = eliteAffixIdentityEmphasis(affixId, hpRatio, manaShieldRatio);
            ctx.save();
            ctx.globalAlpha = emphasis ? 1 : 0.88;
            if (emphasis) {
              ctx.fillStyle = 'rgba(255,238,154,.18)';
              ctx.fillRect(localX - layout.iconSize / 2 - 2, localY - layout.iconSize / 2 - 2, layout.iconSize + 4, layout.iconSize + 4);
              ctx.strokeStyle = '#fff0a5'; ctx.lineWidth = 1.5;
              ctx.strokeRect(localX - layout.iconSize / 2 - 1, localY - layout.iconSize / 2 - 1, layout.iconSize + 2, layout.iconSize + 2);
            }
            ctx.drawImage(eliteAffixAtlasImage, icon.sx, icon.sy, icon.sw, icon.sh, localX - layout.iconSize / 2, localY - layout.iconSize / 2, layout.iconSize, layout.iconSize);
            ctx.restore();
          }
        } else {
          ctx.font = '800 10px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          const text = enemy.eliteAffixes.map(eliteAffixLabel).join('·');
          ctx.fillStyle = '#fff0a5'; ctx.fillText(text, 0, layout.localCenterY);
        }
        if (enemy.maxManaShield > 0 && enemy.manaShield > 0) {
          ctx.strokeStyle = 'rgba(139,186,255,.82)'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(0, 0, enemy.radius + 15, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * enemy.manaShield / enemy.maxManaShield); ctx.stroke();
        }
      }
      if (enemy.type !== 'grunt' && enemy.type !== 'hound') {
        const w = enemy.radius * 2;
        ctx.fillStyle = '#2b1015'; ctx.fillRect(-enemy.radius, -enemy.radius - 12, w, 5);
        ctx.fillStyle = '#f45b68'; ctx.fillRect(-enemy.radius, -enemy.radius - 12, w * Math.max(0, enemy.hp / enemy.maxHp), 5);
      }
      ctx.restore();
    }
    if (regularEnemyActionVfxAtlasReady && regularEnemyActionVfxAtlasImage) {
      for (const cue of this.regularEnemyActionVfx) {
        const sprite = regularEnemyActionVfxSprite(cue.kind,'resolve');
        const t = Math.max(0, Math.min(1, cue.ttl / cue.maxTtl));
        const size = cue.kind === 'bomber' ? 118 : cue.kind === 'shaman' ? 104 : 86;
        ctx.save(); ctx.globalAlpha = Math.min(reducedFlash ? 0.48 : 0.84, t * 0.92);
        ctx.drawImage(regularEnemyActionVfxAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, cue.pos.x - size / 2, cue.pos.y - size / 2, size, size);
        ctx.restore();
      }
    }
    if (eliteAffixLifecycleVfxAtlasReady && eliteAffixLifecycleVfxAtlasImage) {
      for (const cue of this.eliteAffixResponseVfx) {
        const sprite = eliteAffixLifecycleVfxSprite(cue.affixId,'response');
        const t = Math.max(0, Math.min(1, cue.ttl / cue.maxTtl));
        const size = 92 + (1 - t) * 22;
        ctx.save(); ctx.globalAlpha = Math.min(reducedFlash ? 0.48 : 0.88, t);
        ctx.drawImage(eliteAffixLifecycleVfxAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, cue.pos.x - size / 2, cue.pos.y - size / 2, size, size);
        ctx.restore();
      }
    }
    if(specialistReactionLifecycleVfxAtlasReady&&specialistReactionLifecycleVfxAtlasImage){
      for(const cue of this.specialistReactionVfx){const progress=1-Math.max(0,cue.ttl/cue.maxTtl);const state=progress<0.38?'trigger':'afterglow';const sprite=specialistReactionLifecycleVfxSprite(cue.type,state);const drawPos=cue.type==='assassin'&&state==='afterglow'&&cue.targetPos?cue.targetPos:cue.type==='siegeGolem'&&cue.targetPos?cue.targetPos:cue.pos;const base=cue.type==='siegeGolem'?132:cue.type==='nullifier'?124:cue.type==='shieldbearer'?104:96;const size=base*(1+progress*.18);ctx.save();ctx.globalAlpha=Math.min(reducedFlash?0.42:0.76,(1-progress)*0.82+0.08);ctx.drawImage(specialistReactionLifecycleVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,drawPos.x-size/2,drawPos.y-size/2,size,size);ctx.restore();}
    }
  }

  private spawnRegular(seconds: number, danger: number, weights?: RegularEnemyWeights): void {
    const specialist = selectSpecialistEnemyType(seconds, Math.random());
    const type: EnemyType = specialist ?? selectRegularEnemyType(seconds, Math.random(), weights);
    const coreChance = Math.min(0.34, 0.20 + danger * 0.008);
    const target = specialist ? specialistTarget(specialist as SpecialistEnemyType) : (Math.random() < coreChance ? 'core' : 'hero');
    this.spawn(type, danger, target);
  }

  private spawn(type: EnemyType, danger: number, target: EnemyTarget, explicitPos?: Vec2): number {
    const baseStats = enemyStats(type, danger);
    const eliteHealthMultiplier = type === 'elite' ? this.endlessEliteHealthMultiplier : 1;
    const stats: EnemyStats = { ...baseStats, hp: Math.round(baseStats.hp * this.endlessHealthMultiplier * eliteHealthMultiplier), damage: baseStats.damage * this.endlessDamageMultiplier };
    const eliteAffixes = type === 'elite' ? selectEliteAffixes(danger) : [];
    const affix = eliteAffixModifiers(eliteAffixes);
    const pos = explicitPos ? { ...explicitPos } : this.spawnPointOutsideArena();
    const bossOrdinal = type === 'boss' ? this.bossSpawnCount++ : undefined;
    const bossArchetype = type === 'boss' ? bossArchetypeForOrdinal(bossOrdinal ?? 0) : undefined;
    const bossOpening = bossArchetype ? bossArchetypeTuning(bossArchetype, 1) : undefined;
    const id = this.nextId++;
    const portalKind:SpawnPressureKind = type === 'boss' ? 'boss' : type === 'elite' ? 'elite' : isSpecialistEnemyType(type) ? 'specialist' : 'regular';
    this.enemies.push({
      ...stats,
      speed: stats.speed * affix.speedMultiplier,
      attackInterval: stats.attackInterval * affix.attackIntervalMultiplier,
      id,
      type,
      pos,
      maxHp: stats.hp,
      color: bossOpening?.bodyColor ?? stats.color,
      target,
      attackTimer: Math.random() * stats.attackInterval,
      slowFactor: 1,
      slowTimer: 0,
      alive: true,
      hitFlash: 0,
      specialTimer: bossOpening?.specialInterval,
      bossCycle: type === 'boss' ? 0 : undefined,
      bossOrdinal,
      bossArchetype,
      eliteAffixes: eliteAffixes.length ? eliteAffixes : undefined,
      damageTakenMultiplier: affix.damageTakenMultiplier,
      regenPerSecondRatio: affix.regenPerSecondRatio,
      lowHpDamageMultiplier: affix.lowHpDamageMultiplier,
      commandAuraMultiplier: affix.commandAuraMultiplier,
      manaShield: stats.hp * affix.shieldRatio,
      maxManaShield: stats.hp * affix.shieldRatio,
      guardHp: type === 'shieldbearer' ? stats.hp * SPECIALIST_COMBAT_CONTRACT.shieldGuardRatio : 0,
      maxGuardHp: type === 'shieldbearer' ? stats.hp * SPECIALIST_COMBAT_CONTRACT.shieldGuardRatio : 0,
      specialistTimer: type === 'assassin' ? SPECIALIST_COMBAT_CONTRACT.assassinInitialBaseSeconds + Math.random() * SPECIALIST_COMBAT_CONTRACT.assassinInitialRandomSeconds : 0,
      spawnGroundMaterialize: portalKind !== 'boss' ? advanceEnemyPortalGroundMaterializeState(undefined,{kind:portalKind},0,false) : undefined,
    });
    this.spawnPortalVfx.push({ pos: { ...pos }, kind: portalKind, target, ttl: 0.72 });
    this.spawnLaneMemory = rememberSpawnLanePortal(this.spawnLaneMemory,{pos:{...pos},kind:portalKind,target});
    if (this.spawnPortalVfx.length > 28) this.spawnPortalVfx.splice(0, this.spawnPortalVfx.length - 28);
    return id;
  }


  private commandAuraBoost(enemy: Enemy): number {
    if (enemy.type === 'boss' || enemy.type === 'golden') return 1;
    for (const candidate of this.enemies) {
      if (!candidate.alive || candidate.id === enemy.id || (candidate.commandAuraMultiplier ?? 1) <= 1) continue;
      if (distance(candidate.pos, enemy.pos) <= 190 + candidate.radius) {
        if (candidate.eliteAffixes?.includes('commander')) this.queueEliteAffixResponseVfx(candidate,'commander');
        return candidate.commandAuraMultiplier ?? 1;
      }
    }
    return 1;
  }

  private spawnPointOutsideArena(): Vec2 {
    const side = Math.floor(Math.random() * 4);
    const pad = 45;
    if (side === 0) return { x: ARENA_MARGIN + Math.random() * (LOGICAL_WIDTH - ARENA_MARGIN * 2), y: ARENA_MARGIN - pad };
    if (side === 1) return { x: LOGICAL_WIDTH - ARENA_MARGIN + pad, y: ARENA_MARGIN + Math.random() * (LOGICAL_HEIGHT - ARENA_MARGIN * 2) };
    if (side === 2) return { x: ARENA_MARGIN + Math.random() * (LOGICAL_WIDTH - ARENA_MARGIN * 2), y: LOGICAL_HEIGHT - ARENA_MARGIN + pad };
    return { x: ARENA_MARGIN - pad, y: ARENA_MARGIN + Math.random() * (LOGICAL_HEIGHT - ARENA_MARGIN * 2) };
  }


  private updateBossSpecial(enemy: Enemy, dt: number, ctx: EnemyUpdateContext, danger: number, enemyBudget: number, bossVariantBonus = 0): void {
    const phase = bossPhaseForRatio(enemy.hp / enemy.maxHp);
    if (!enemy.bossArchetype && enemy.bossOrdinal === undefined) {
      const legacy = bossPatternTuning(phase);
      enemy.specialTimer = (enemy.specialTimer ?? legacy.specialInterval) - dt;
      if (enemy.specialTimer > 0) return;
      const cycle = enemy.bossCycle ?? 0;
      if (phase === 1) this.fireEnemyFan(enemy, ctx.hero.pos, legacy.fanProjectiles, legacy.fanSpread);
      else if (phase === 2) {
        if (cycle % 2 === 0) this.fireEnemyFan(enemy, ctx.hero.pos, legacy.fanProjectiles, legacy.fanSpread);
        else this.summonBossAdds(enemy, legacy.summonCount, danger, enemyBudget);
      } else {
        this.fireEnemyFan(enemy, ctx.hero.pos, legacy.fanProjectiles, legacy.fanSpread);
        if (cycle % 2 === 1) this.summonBossAdds(enemy, legacy.summonCount, danger, enemyBudget);
      }
      enemy.bossSpecialRecovery=advanceBossSpecialRecoveryState(enemy.bossSpecialRecovery,true,0,'inferno');
      enemy.bossCycle = cycle + 1;
      enemy.specialTimer = legacy.specialInterval;
      return;
    }

    const archetype = enemy.bossArchetype ?? bossArchetypeForOrdinal(enemy.bossOrdinal ?? 0);
    const tuning = bossVariantTuning(bossArchetypeTuning(archetype, phase), bossVariantTierForOrdinal(enemy.bossOrdinal ?? 0, bossVariantBonus));
    enemy.specialTimer = (enemy.specialTimer ?? tuning.specialInterval) - dt;
    if (enemy.specialTimer > 0) return;

    const cycle = enemy.bossCycle ?? 0;
    const tacticLink = enemy.isMythic ? activeMythicTacticAttackLink(ctx.mythicTacticAttackLink ?? null, ctx.elapsed * 1000, archetype) : null;
    const projectileCount = (count:number) => Math.max(1, Math.round(count * (tacticLink?.projectileCountMultiplier ?? 1)));
    const summonCount = (count:number) => Math.max(0, Math.round(count * (tacticLink?.summonCountMultiplier ?? 1)));
    const dashDistance = (amount:number) => amount * (tacticLink?.dashDistanceMultiplier ?? 1);
    if (archetype === 'inferno') {
      this.fireEnemyFan(enemy, ctx.hero.pos, projectileCount(tuning.fanProjectiles), tuning.fanSpread, tuning.projectileSpeedMultiplier);
      if (tuning.ringProjectiles > 0 && (phase === 3 || cycle % 2 === 1)) this.fireEnemyRing(enemy, projectileCount(tuning.ringProjectiles), tuning.projectileSpeedMultiplier);
      if (tuning.summonCount > 0 && cycle % 3 === 2) this.summonBossAdds(enemy, summonCount(tuning.summonCount * this.bossEncounterModifiers.summonCountMultiplier), danger, enemyBudget, archetype);
    } else if (archetype === 'summoner') {
      this.summonBossAdds(enemy, summonCount(tuning.summonCount * this.bossEncounterModifiers.summonCountMultiplier), danger, enemyBudget, archetype);
      if (cycle % 2 === 0) this.fireEnemyFan(enemy, ctx.hero.pos, projectileCount(tuning.fanProjectiles), tuning.fanSpread, tuning.projectileSpeedMultiplier);
      if (phase === 3 && tuning.ringProjectiles > 0 && cycle % 3 === 2) this.fireEnemyRing(enemy, projectileCount(tuning.ringProjectiles), tuning.projectileSpeedMultiplier);
    } else if (archetype === 'juggernaut') {
      this.dashBossToward(enemy, ctx.hero.pos, dashDistance(tuning.dashDistance * this.bossEncounterModifiers.dashDistanceMultiplier));
      this.fireEnemyFan(enemy, ctx.hero.pos, projectileCount(tuning.fanProjectiles), tuning.fanSpread, tuning.projectileSpeedMultiplier);
      if (tuning.ringProjectiles > 0 && phase >= 2) this.fireEnemyRing(enemy, projectileCount(tuning.ringProjectiles), tuning.projectileSpeedMultiplier);
      if (tuning.summonCount > 0 && phase === 3 && cycle % 3 === 2) this.summonBossAdds(enemy, summonCount(tuning.summonCount * this.bossEncounterModifiers.summonCountMultiplier), danger, enemyBudget, archetype);
    } else if (archetype === 'abyssWitch') {
      const special = bossArchetypeSpecial(archetype, phase);
      this.fireEnemyRing(enemy, projectileCount(Math.max(tuning.ringProjectiles, 4 + special.curseZones * 2)), tuning.projectileSpeedMultiplier);
      if (cycle % 2 === 0) this.fireEnemyFan(enemy, ctx.hero.pos, projectileCount(tuning.fanProjectiles), tuning.fanSpread, tuning.projectileSpeedMultiplier);
      if (tuning.summonCount > 0 && cycle % 3 === 2) this.summonBossAdds(enemy, summonCount(tuning.summonCount * this.bossEncounterModifiers.summonCountMultiplier), danger, enemyBudget, archetype);
    } else if (archetype === 'twinMaw') {
      const special = bossArchetypeSpecial(archetype, phase);
      this.fireEnemyFan(enemy, ctx.hero.pos, projectileCount(tuning.fanProjectiles), tuning.fanSpread, tuning.projectileSpeedMultiplier);
      const base = Math.atan2(ctx.hero.pos.y - enemy.pos.y, ctx.hero.pos.x - enemy.pos.x) + Math.PI + special.secondaryFanAngle * (cycle % 2 === 0 ? 1 : -1);
      const mirrorTarget = { x: enemy.pos.x + Math.cos(base) * 300, y: enemy.pos.y + Math.sin(base) * 300 };
      this.fireEnemyFan(enemy, mirrorTarget, projectileCount(tuning.fanProjectiles), tuning.fanSpread, tuning.projectileSpeedMultiplier);
      if (phase >= 2) this.dashBossToward(enemy, ctx.hero.pos, dashDistance(tuning.dashDistance * 0.55));
    } else {
      const special = bossArchetypeSpecial(archetype, phase);
      this.fireEnemyFan(enemy, ctx.hero.pos, projectileCount(tuning.fanProjectiles), tuning.fanSpread, tuning.projectileSpeedMultiplier);
      if (tuning.ringProjectiles > 0) this.fireEnemyRing(enemy, projectileCount(tuning.ringProjectiles), tuning.projectileSpeedMultiplier);
      ctx.onTimeWarp?.(special.cooldownPressureMultiplier * (tacticLink?.timeWarpPressureMultiplier ?? 1), special.cooldownPressureDuration * (tacticLink?.timeWarpPressureMultiplier ?? 1));
      if (tuning.summonCount > 0 && cycle % 3 === 2) this.summonBossAdds(enemy, summonCount(tuning.summonCount * this.bossEncounterModifiers.summonCountMultiplier), danger, enemyBudget, archetype);
    }

    if (enemy.isApex && enemy.apexSecondaryArchetype) this.executeApexSecondary(enemy, enemy.apexSecondaryArchetype, ctx, danger, enemyBudget, phase, tuning.projectileSpeedMultiplier);
    const mythic = mythicBossProfile(ctx.elapsed, ctx.apexThreatLevel ?? 0, enemy.bossOrdinal ?? 0);
    const mythicPhase = enemy.isMythic && mythic.active ? mythicPhaseProfile(mythic, enemy.hp / Math.max(1, enemy.maxHp), 1) : null;
    const lastLaw = enemy.isMythic && mythic.active ? mythicLastLawIdentityProfile(mythic, archetype, enemy.hp / Math.max(1, enemy.maxHp), 1) : null;
    if (mythicPhase) {
      const mythicMod = mythicPressureModifiers(mythic);
      const phasePressure = {
        projectileDensityMultiplier: Math.min(1.4, mythicMod.projectileDensityMultiplier * (lastLaw?.projectileDensityMultiplier ?? 1)),
        summonCountMultiplier: Math.min(1.2, mythicMod.summonCountMultiplier * mythicPhase.summonCountMultiplier * (lastLaw?.summonCountMultiplier ?? 1)),
      };
      for (const channel of mythicPhase.channels.slice(1, 3)) this.executeApexSecondary(enemy, channel, ctx, danger, enemyBudget, phase, tuning.projectileSpeedMultiplier, phasePressure);
    }
    enemy.bossSpecialRecovery=advanceBossSpecialRecoveryState(enemy.bossSpecialRecovery,true,0,archetype);
    enemy.bossCycle = cycle + 1;
    const apex = apexPressureModifiers(Boolean(enemy.isApex));
    const mythicCadence = mythicPhase ? Math.max(0.66, mythicPressureModifiers(mythic).specialCadenceMultiplier * mythicPhase.specialCadenceMultiplier * (lastLaw?.specialCadenceMultiplier ?? 1)) : 1;
    enemy.specialTimer = tuning.specialInterval * this.bossEncounterModifiers.specialCadenceMultiplier * apex.specialCadenceMultiplier * mythicCadence * (tacticLink?.nextCadenceMultiplier ?? 1);
    if (tacticLink) ctx.onMythicTacticAttackLinkConsumed?.(archetype);
  }

  private executeApexSecondary(enemy: Enemy, archetype: BossArchetype, ctx: EnemyUpdateContext, danger: number, enemyBudget: number, phase: import('./boss-patterns.js').BossPhase, projectileSpeedMultiplier: number, pressure?: { projectileDensityMultiplier:number; summonCountMultiplier:number }): void {
    const mod = pressure ?? apexPressureModifiers(true);
    if (archetype === 'inferno') {
      this.fireEnemyRing(enemy, Math.ceil((5 + phase * 2) * mod.projectileDensityMultiplier), projectileSpeedMultiplier);
    } else if (archetype === 'summoner') {
      this.summonBossAdds(enemy, Math.ceil((1 + phase) * mod.summonCountMultiplier), danger, enemyBudget, archetype);
    } else if (archetype === 'juggernaut') {
      this.dashBossToward(enemy, ctx.hero.pos, 55 + phase * 18);
      this.fireEnemyFan(enemy, ctx.hero.pos, 3 + phase, 0.68, projectileSpeedMultiplier);
    } else if (archetype === 'abyssWitch') {
      this.fireEnemyRing(enemy, 4 + phase * 2, projectileSpeedMultiplier * 0.95);
    } else if (archetype === 'twinMaw') {
      const angle = Math.atan2(ctx.hero.pos.y - enemy.pos.y, ctx.hero.pos.x - enemy.pos.x) + Math.PI;
      this.fireEnemyFan(enemy, { x: enemy.pos.x + Math.cos(angle) * 280, y: enemy.pos.y + Math.sin(angle) * 280 }, 3 + phase, 0.72, projectileSpeedMultiplier);
    } else {
      const special = bossArchetypeSpecial('timeEater', phase);
      ctx.onTimeWarp?.(special.cooldownPressureMultiplier, special.cooldownPressureDuration);
    }
  }

  private fireEnemyFan(enemy: Enemy, target: Vec2, count: number, spread: number, speedMultiplier = 1): void {
    const base = Math.atan2(target.y - enemy.pos.y, target.x - enemy.pos.x);
    for (let i = 0; i < count && this.projectiles.length < 150; i++) {
      const t = count <= 1 ? 0 : i / (count - 1) - 0.5;
      const angle = base + t * spread;
      const gameplayOrigin={ x: enemy.pos.x + Math.cos(angle) * (enemy.radius + 8), y: enemy.pos.y + Math.sin(angle) * (enemy.radius + 8) };
      const rebase=bossGroundOriginRebasePresentation(enemy.bossGroundOriginRebase,this.activeReducedMotion);
      const bossVisualLaunch=enemy.type==='boss'?bossSpecialLaunchOriginPresentation({archetype:enemy.bossArchetype??bossArchetypeForOrdinal(enemy.bossOrdinal??0),phase:bossPhaseForRatio(enemy.hp/Math.max(1,enemy.maxHp)),radius:enemy.radius,facingX:Math.cos(angle),facingY:Math.sin(angle),specialTimer:enemy.specialTimer??0,rebaseOffsetX:rebase.groundOffsetX,rebaseOffsetY:rebase.groundOffsetY,handoffStrength:enemy.bossSpecialOriginHandoff?.strength??0,recovery:enemy.bossSpecialRecovery?.recovery??0,stagger:enemy.bossHeavyHitStagger?.stagger??0},this.activeReducedMotion):null;
      this.projectiles.push({
        pos: gameplayOrigin,
        ...(bossVisualLaunch?{visualLaunchOffset:{x:enemy.pos.x+bossVisualLaunch.projectileOffsetX-gameplayOrigin.x,y:enemy.pos.y+bossVisualLaunch.projectileOffsetY-gameplayOrigin.y},visualLaunchTtl:bossVisualLaunch.convergeSeconds,visualLaunchMaxTtl:bossVisualLaunch.convergeSeconds,visualLaunchWorldOrigin:{x:enemy.pos.x+bossVisualLaunch.projectileOffsetX,y:enemy.pos.y+bossVisualLaunch.projectileOffsetY},visualLaunchTravelTtl:this.activeReducedMotion?.1:.15,visualLaunchTravelMaxTtl:this.activeReducedMotion?.1:.15}:{}),
        vel: { x: Math.cos(angle) * 285 * speedMultiplier * this.endlessProjectileSpeedMultiplier, y: Math.sin(angle) * 285 * speedMultiplier * this.endlessProjectileSpeedMultiplier },
        radius: 9, damage: enemy.damage * 0.72, ttl: 2.5, target: 'hero', sourceType: enemy.type,
        ...(enemy.type === 'boss' && enemy.bossArchetype ? { bossArchetype: enemy.bossArchetype } : {}),
      });
    }
  }

  private fireEnemyRing(enemy: Enemy, count: number, speedMultiplier = 1): void {
    for (let i = 0; i < count && this.projectiles.length < 150; i++) {
      const angle = (Math.PI * 2 * i) / Math.max(1, count) + (enemy.bossCycle ?? 0) * 0.18;
      const gameplayOrigin={ x: enemy.pos.x + Math.cos(angle) * (enemy.radius + 10), y: enemy.pos.y + Math.sin(angle) * (enemy.radius + 10) };
      const rebase=bossGroundOriginRebasePresentation(enemy.bossGroundOriginRebase,this.activeReducedMotion);
      const bossVisualLaunch=enemy.type==='boss'?bossSpecialLaunchOriginPresentation({archetype:enemy.bossArchetype??bossArchetypeForOrdinal(enemy.bossOrdinal??0),phase:bossPhaseForRatio(enemy.hp/Math.max(1,enemy.maxHp)),radius:enemy.radius,facingX:Math.cos(angle),facingY:Math.sin(angle),specialTimer:enemy.specialTimer??0,rebaseOffsetX:rebase.groundOffsetX,rebaseOffsetY:rebase.groundOffsetY,handoffStrength:enemy.bossSpecialOriginHandoff?.strength??0,recovery:enemy.bossSpecialRecovery?.recovery??0,stagger:enemy.bossHeavyHitStagger?.stagger??0},this.activeReducedMotion):null;
      this.projectiles.push({
        pos: gameplayOrigin,
        ...(bossVisualLaunch?{visualLaunchOffset:{x:enemy.pos.x+bossVisualLaunch.projectileOffsetX-gameplayOrigin.x,y:enemy.pos.y+bossVisualLaunch.projectileOffsetY-gameplayOrigin.y},visualLaunchTtl:bossVisualLaunch.convergeSeconds,visualLaunchMaxTtl:bossVisualLaunch.convergeSeconds,visualLaunchWorldOrigin:{x:enemy.pos.x+bossVisualLaunch.projectileOffsetX,y:enemy.pos.y+bossVisualLaunch.projectileOffsetY},visualLaunchTravelTtl:this.activeReducedMotion?.1:.15,visualLaunchTravelMaxTtl:this.activeReducedMotion?.1:.15}:{}),
        vel: { x: Math.cos(angle) * 245 * speedMultiplier * this.endlessProjectileSpeedMultiplier, y: Math.sin(angle) * 245 * speedMultiplier * this.endlessProjectileSpeedMultiplier },
        radius: 9, damage: enemy.damage * 0.62, ttl: 2.8, target: 'hero', sourceType: enemy.type,
        ...(enemy.type === 'boss' && enemy.bossArchetype ? { bossArchetype: enemy.bossArchetype } : {}),
      });
    }
  }

  private summonBossAdds(boss: Enemy, count: number, danger: number, enemyBudget: number, archetype: BossArchetype = 'inferno'): void {
    if(count>0)boss.bossSpecialOriginHandoff=advanceBossSpecialOriginHandoffState(boss.bossSpecialOriginHandoff,{kind:'summon',offsetX:0,offsetY:0},0,boss.radius,false);
    for (let i = 0; i < count && this.enemies.length < enemyBudget; i++) {
      let type: EnemyType;
      if (archetype === 'summoner') type = i % 4 === 3 ? 'shaman' : i % 3 === 2 ? 'brute' : 'hound';
      else if (archetype === 'abyssWitch') type = i % 2 === 0 ? 'nullifier' : 'shaman';
      else if (archetype === 'timeEater') type = i % 2 === 0 ? 'assassin' : 'nullifier';
      else type = i % 3 === 2 ? 'brute' : 'hound';
      const baseStats = enemyStats(type, Math.max(1, danger - 1));
      const stats: EnemyStats = { ...baseStats, hp: Math.round(baseStats.hp * this.endlessHealthMultiplier), damage: baseStats.damage * this.endlessDamageMultiplier };
      const angle = (Math.PI * 2 * i) / Math.max(1, count) + (boss.bossCycle ?? 0) * 0.35;
      const distanceFromBoss = boss.radius + stats.radius + 34;
      const addPos = { x: boss.pos.x + Math.cos(angle) * distanceFromBoss, y: boss.pos.y + Math.sin(angle) * distanceFromBoss };
      this.enemies.push({
        ...stats, id: this.nextId++, type,
        pos: addPos,
        maxHp: stats.hp, target: i % 2 === 0 ? 'hero' : 'core', attackTimer: stats.attackInterval * 0.6,
        slowFactor: 1, slowTimer: 0, alive: true, hitFlash: 0,
        damageTakenMultiplier: 1, regenPerSecondRatio: 0, lowHpDamageMultiplier: 1, commandAuraMultiplier: 1,
        manaShield: 0, maxManaShield: 0,
        bossSpecialOriginHandoff:advanceBossSpecialOriginHandoffState(undefined,{kind:'materialize',offsetX:0,offsetY:0},0,stats.radius,false),
      });
      this.spawnPortalVfx.push({ pos: { ...addPos }, kind: 'regular', target: i % 2 === 0 ? 'hero' : 'core', ttl: 0.72 });
      this.spawnLaneMemory = rememberSpawnLanePortal(this.spawnLaneMemory,{pos:{...addPos},kind:'regular',target:i%2===0?'hero':'core'});
      if (this.spawnPortalVfx.length > 28) this.spawnPortalVfx.splice(0, this.spawnPortalVfx.length - 28);
    }
  }

  private dashBossToward(boss: Enemy, target: Vec2, distanceAmount: number): void {
    if (distanceAmount <= 0) return;
    const origin={x:boss.pos.x,y:boss.pos.y};
    const dir = normalize({ x: target.x - boss.pos.x, y: target.y - boss.pos.y });
    boss.pos.x += dir.x * distanceAmount;
    boss.pos.y += dir.y * distanceAmount;
    boss.pos.x = Math.max(ARENA_MARGIN, Math.min(LOGICAL_WIDTH - ARENA_MARGIN, boss.pos.x));
    boss.pos.y = Math.max(ARENA_MARGIN, Math.min(LOGICAL_HEIGHT - ARENA_MARGIN, boss.pos.y));
    boss.bossSpecialOriginHandoff=advanceBossSpecialOriginHandoffState(boss.bossSpecialOriginHandoff,{kind:'teleport',offsetX:origin.x-boss.pos.x,offsetY:origin.y-boss.pos.y},0,boss.radius,false);
  }

  private detonateBomber(enemy: Enemy, ctx: EnemyUpdateContext): void {
    const blastRadius = SPECIALIST_COMBAT_CONTRACT.bomberBlastRadius;
    this.queueRegularEnemyActionVfx('bomber','resolve',enemy.pos,0.42);
    if (distance(enemy.pos, ctx.hero.pos) <= blastRadius + ctx.hero.radius) ctx.onHeroDamage(enemy.damage, 'explosion');
    if (distance(enemy.pos, ctx.core.pos) <= blastRadius + ctx.core.radius) ctx.onCoreDamage(enemy.damage, 'explosion', enemy.pos);
    enemy.alive = false;
  }

  private healNearby(shaman: Enemy): void {
    let healedCount = 0;
    for (const ally of this.enemies) {
      if (!ally.alive || ally.id === shaman.id || ally.hp >= ally.maxHp) continue;
      if (distance(shaman.pos, ally.pos) > SPECIALIST_COMBAT_CONTRACT.shamanHealRadius + ally.radius) continue;
      ally.hp = Math.min(ally.maxHp, ally.hp + Math.max(SPECIALIST_COMBAT_CONTRACT.shamanHealMinimum, ally.maxHp * SPECIALIST_COMBAT_CONTRACT.shamanHealRatio));
      ally.hitFlash = Math.max(ally.hitFlash, 0.04);
      healedCount += 1;
    }
    if (healedCount > 0) this.queueRegularEnemyActionVfx('shaman','resolve',shaman.pos,0.44);
  }

  private fireEnemyProjectile(enemy: Enemy, target: Vec2, reducedMotion=false): void {
    const dir = normalize({ x: target.x - enemy.pos.x, y: target.y - enemy.pos.y });
    if (enemy.type === 'archer') this.queueRegularEnemyActionVfx('archer','resolve',enemy.pos,0.34);
    const attackPose=enemyAttackMotionPresentation('archer',0,enemy.attackInterval,target.x-enemy.pos.x,target.y-enemy.pos.y,true,reducedMotion);
    const launch=rangedEnemyProjectileLaunchOriginPresentation({type:'archer',radius:enemy.radius,facingX:dir.x,facingY:dir.y,pullback:attackPose.pullback,lunge:attackPose.lunge,resolve:enemy.attackResolveMotion?.resolve??0},reducedMotion);
    this.projectiles.push({
      pos: { x: enemy.pos.x, y: enemy.pos.y },
      visualLaunchOffset:{x:launch.originOffsetX,y:launch.originOffsetY},visualLaunchTtl:launch.convergeSeconds,visualLaunchMaxTtl:launch.convergeSeconds,
      vel: { x: dir.x * 260 * this.endlessProjectileSpeedMultiplier, y: dir.y * 260 * this.endlessProjectileSpeedMultiplier },
      radius: 7,
      damage: enemy.damage,
      ttl: 2.2,
      target: enemy.target,
      sourceType: enemy.type,
      ...(enemy.type === 'boss' && enemy.bossArchetype ? { bossArchetype: enemy.bossArchetype } : {}),
    });
  }

  private queueRegularEnemyActionVfx(kind:RegularEnemyActionVfxKind,state:'resolve',pos:Vec2,maxTtl=0.36):void {
    this.regularEnemyActionVfx.push({pos:{...pos},kind,ttl:maxTtl,maxTtl});
    if (this.regularEnemyActionVfx.length > 28) this.regularEnemyActionVfx.splice(0,this.regularEnemyActionVfx.length-28);
  }

  private queueEliteAffixResponseVfx(enemy:Enemy,affixId:EliteAffixId):void {
    const existing=this.eliteAffixResponseVfx.find((cue)=>cue.enemyId===enemy.id&&cue.affixId===affixId&&cue.ttl>0.12);
    if(existing)return;
    const maxTtl=0.42;
    this.eliteAffixResponseVfx.push({pos:{...enemy.pos},enemyId:enemy.id,affixId,ttl:maxTtl,maxTtl});
    if (this.eliteAffixResponseVfx.length > 32) this.eliteAffixResponseVfx.splice(0,this.eliteAffixResponseVfx.length-32);
  }

  private queueSpecialistReactionVfx(enemy:Enemy,type:SpecialistEnemyType,pos:Vec2=enemy.pos,targetPos?:Vec2,maxTtl=0.52):void {
    this.specialistReactionVfx.push({pos:{...pos},...(targetPos?{targetPos:{...targetPos}}:{}),enemyId:enemy.id,type,ttl:maxTtl,maxTtl});
    if (this.specialistReactionVfx.length > 24) this.specialistReactionVfx.splice(0,this.specialistReactionVfx.length-24);
  }

  private updateProjectiles(dt: number, ctx: EnemyUpdateContext): void {
    for (const p of this.projectiles) {
      p.ttl -= dt;
      if(p.visualLaunchTtl!==undefined)p.visualLaunchTtl=Math.max(0,p.visualLaunchTtl-dt);
      if(p.visualLaunchTravelTtl!==undefined)p.visualLaunchTravelTtl=Math.max(0,p.visualLaunchTravelTtl-dt);
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      const target = p.target === 'core' ? ctx.core : ctx.hero;
      if (distance(p.pos, target.pos) <= p.radius + target.radius) {
        const entryOffset=projectileImpactEntryOffset(p.visualLaunchOffset,p.visualLaunchTtl,p.visualLaunchMaxTtl,this.activeReducedMotion);
        let ordinaryImpactAlphaScale=1;
        if (p.target === 'core') {
          const appliedResult=ctx.onCoreDamage(p.damage, 'projectile', p.pos);
          const applied=typeof appliedResult==='number'&&Number.isFinite(appliedResult)?Math.max(0,appliedResult):p.damage;
          const preventionRatio=p.damage>0?Math.max(0,Math.min(1,1-applied/p.damage)):0;
          const maxTtl=.36,guard=coreProjectileGuardImpactHandoffPresentation({preventedRatio:preventionRatio,impactTtl:maxTtl,impactMaxTtl:maxTtl},false);
          ordinaryImpactAlphaScale=guard.ordinaryImpactAlphaScale;
          if(guard.owner==='core-guard'){this.projectileCoreGuardImpactVfx.push({pos:{...p.pos},incoming:{...p.vel},preventionRatio,ttl:maxTtl,maxTtl});if(this.projectileCoreGuardImpactVfx.length>16)this.projectileCoreGuardImpactVfx.splice(0,this.projectileCoreGuardImpactVfx.length-16);}
        } else {
          const appliedResult=ctx.onHeroDamage(p.damage, 'projectile');
          const applied=typeof appliedResult==='number'&&Number.isFinite(appliedResult)?Math.max(0,appliedResult):p.damage;
          const preventionRatio=p.damage>0?Math.max(0,Math.min(1,1-applied/p.damage)):0;
          const maxTtl=.36,guard=projectileGuardImpactHandoffPresentation({preventedRatio:preventionRatio,impactTtl:maxTtl,impactMaxTtl:maxTtl},false);
          ordinaryImpactAlphaScale=guard.ordinaryImpactAlphaScale;
          if(guard.owner==='guard'){this.projectileGuardImpactVfx.push({pos:{...p.pos},incoming:{...p.vel},preventionRatio,ttl:maxTtl,maxTtl});if(this.projectileGuardImpactVfx.length>16)this.projectileGuardImpactVfx.splice(0,this.projectileGuardImpactVfx.length-16);}
        }
        if (p.sourceType === 'archer') { this.archerProjectileImpactVfx.push(({pos:{...p.pos},incoming:{...p.vel},entryOffset,ordinaryImpactAlphaScale,ttl:.34} as {pos:Vec2;incoming:Vec2;ttl:number}&{entryOffset?:Vec2;ordinaryImpactAlphaScale?:number})); if(this.archerProjectileImpactVfx.length>24)this.archerProjectileImpactVfx.splice(0,this.archerProjectileImpactVfx.length-24); }
        if (p.bossArchetype) { const maxTtl=.38; this.bossProjectileImpactVfx.push(({pos:{...p.pos},archetype:p.bossArchetype,incoming:{...p.vel},entryOffset,ordinaryImpactAlphaScale,ttl:maxTtl,maxTtl} as {pos:Vec2;archetype:BossArchetype;incoming:Vec2;ttl:number;maxTtl:number}&{entryOffset?:Vec2;ordinaryImpactAlphaScale?:number})); if(this.bossProjectileImpactVfx.length>24)this.bossProjectileImpactVfx.splice(0,this.bossProjectileImpactVfx.length-24); }
        p.ttl = -1;
      }
    }
    this.projectiles = this.projectiles.filter((p) => p.ttl > 0);
    for (const cue of this.archerProjectileImpactVfx) cue.ttl -= Math.max(0,dt);
    this.archerProjectileImpactVfx = this.archerProjectileImpactVfx.filter((cue)=>cue.ttl>0);
    for (const cue of this.bossProjectileImpactVfx) cue.ttl -= Math.max(0,dt);
    this.bossProjectileImpactVfx = this.bossProjectileImpactVfx.filter((cue)=>cue.ttl>0);
  }
}

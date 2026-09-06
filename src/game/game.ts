import { FixedGameLoop } from '../core/loop.js';
import { clamp, distance, normalize, type Vec2 } from '../core/math.js';
import { InputState } from '../core/input.js';
import { ACTION_BUTTONS, ARENA_MARGIN, LOGICAL_HEIGHT, LOGICAL_WIDTH, type ActionId } from './config.js';
import { createGuardianCore, createHero, type GuardianCore, type Hero } from './entities.js';
import { dangerTierForSeconds, xpNeededForLevel } from '../domain/progression.js';
import { catastropheAt, catastropheModifiers, type Catastrophe } from '../domain/catastrophe.js';
import { EnemyManager, type Enemy, type EnemyDeathEvent, type EnemyType, type EnemyDeathVisualSource } from './enemies.js';
import { bossPhaseForRatio, type BossArchetype, type BossVariantTier } from './boss-patterns.js';
import { SpellSystem, type SpellId, type SpellWorld } from './spells.js';
import { CastIntentBuffer, COMBAT_CAST_ACTIONS, type CombatCastAction } from './cast-intent-buffer.js';
import { ManualTargetMemory } from './manual-target-stability.js';
import { PickupManager } from './pickups.js';
import { TerrainSystem } from './terrain.js';
import { applyUpgrade, buildBossRewardChoices, buildUpgradeChoices } from './upgrades.js';
import { guideBossRewardChoices } from './boss-reward-guidance.js';
import { projectBossRewardImpact } from './boss-reward-impact-projection.js';
import { bossRewardImpactRoleIdentityStyle } from './boss-reward-impact-role-identity-assets.js';
import { LevelUpOverlay } from '../ui/levelup.js';
import { growthChoiceIconStyle } from './growth-choice-icon-assets.js';
import { projectGenericUpgradeEffectiveGain, genericUpgradeEffectiveGainHint } from './generic-upgrade-effective-projection.js';
import { genericUpgradeGainStatusIdentityStyle } from './generic-upgrade-gain-status-identity-assets.js';
import { ShopOverlay } from '../ui/shop.js';
import { HeroSelectOverlay } from '../ui/hero-select.js';
import { ResultsOverlay } from '../ui/results.js';
import { LobbyOverlay } from '../ui/lobby.js';
import { TraitSelectOverlay } from '../ui/trait-select.js';
import { generateShopOffers, type ShopDisplayOffer } from './shop-data.js';
import { quickShopRecommendation, safeQuickPurchase, shopGuidanceForOffers } from './shop-guidance.js';
import { purchaseOffer, rerollCost, SHOP_FIRST_TOKEN_AT, SHOP_TOKEN_INTERVAL } from '../domain/economy.js';
import type { EquipmentState } from '../domain/types.js';
import { HERO_PROFILES, heroProfile, type HeroId } from './hero-profiles.js';
import { CombatFeedbackSystem, KillChainVfxTracker, killChainVfxProfile, type KillChainVfxCue } from './combat-feedback.js';
import { kainOverloadCooldownMultiplier, kainOverloadNext } from './hero-passives.js';
import { heroActionLabel } from './hero-spells.js';
import { FieldEventDirector, eliteRushCount, fieldEventArenaPosition, fieldEventModifiers, type ActiveFieldEvent, type FieldEventId } from './field-events.js';
import { calculateArcaneShards } from '../domain/meta-rewards.js';
import { defaultMetaProfile, loadMetaProfile, metaBonuses, purchaseMetaUpgrade, saveMetaProfile, type MetaProfile } from '../domain/meta-profile.js';
import { MASTERY_RUN_TRAITS, RUN_TRAITS, runTraitBonuses, type RunTraitId } from './run-traits.js';
import { composeRunStartStats } from './run-start.js';
import { relicDefinition, relicDisplayName, type RelicId } from './relics.js';
import { LegendaryEffectController, type LegendaryProc } from './legendary-effects.js';
import { composeCombatBuild, composeObjectiveCombatModifiers, type CombatBuildModifiers } from './build-modifiers.js';
import { activeSynergies, synergyHudNames, type SynergyId } from './synergies.js';
import { SYNERGY_IDENTITY_ATLAS, synergyIdentityIcon, type SynergyIdentityId } from './synergy-identity-assets.js';
import { SHOP_ITEM_ATLAS } from './shop-item-assets.js';
import { activeLegendaryAwakeningRecall, legendaryProcIdentity, type LegendaryAwakeningItemId } from './legendary-awakening-recall.js';
import { RunMissionDirector, missionProgress, type ActiveRunMission, type RunMissionReward, type RunMissionSnapshot } from './run-missions.js';
import { threatDirectiveAt, threatDirectiveModifiers, type ThreatDirective } from './threat-directives.js';
import { dangerUiState, priorityThreatIds, criticalHapticEvents, type DangerUiState } from './danger-ui.js';
import { CombatHapticArbiter } from './combat-haptic-arbitration.js';
import { applyMissionRewardToState, composeEnemyPressure } from './phase9-runtime.js';
import { PresentationRuntime } from './presentation-runtime.js';
import { spellVfxDescriptor } from './spell-vfx.js';
import { enemyDeathCue, enemyStatusCue, enemyThreatTelegraph, sortTelegraphsByPriority } from './enemy-presentation.js';
import { BossPresentationTracker, bossPatternTelegraph, bossLifecycleCinematicProfile, type BossPhaseCue } from './boss-presentation.js';
import { edgeThreatVfxProfile, edgeThreatIndicator, deathAfterglowProfile, ultimateAftermathProfile, bossSettleProfile, createVfxQualityTransition, advanceVfxQualityTransition, type VfxQualityTransitionState } from './visual-rhythm.js';
import { spellResidueProfile, bossHealthPressureProfile, mapAmbientDepthProfile, visualPriorityPolicy, spellEchoContinuityProfile, bossPressureTransitionProfile, mapCombatReactionProfile, visualReadabilityBudget, spellEchoCadenceProfile, bossPressureEnvelope, mapAmbientFlowProfile, visualFocusBudget } from './visual-presence.js';
import { criticalCuePolicy, nextPresentationQuality } from './presentation-integration.js';
import { cosmeticMotionScale, cosmeticMotionVelocity, loadPresentationSettings, savePresentationSettings, type PresentationSettings } from './presentation-settings.js';
import { actionCuePresentation, spellButtonPresentation, compactPhase22BuildLabels } from './hud-presentation.js';
import { ACTION_ICON_ATLAS, actionIconPresentation, actionIconSprite } from './action-icon-assets.js';
import { HERO_ABILITY_IDENTITY_ATLAS, heroAbilityIdentityIcon, heroAbilitySecondaryIdentityStyle, isHeroAbilityActionId } from './hero-ability-identity-assets.js';
import { SPELL_EVOLUTION_CREST_ATLAS, spellEvolutionCrestFor, spellEvolutionPreviewCrestStyle, spellEvolutionSpellForAction } from './spell-evolution-identity-assets.js';
import { SPELL_EVOLUTION_MODIFIER_IDENTITY_ATLAS, spellEvolutionModifierIdentityIcon, spellEvolutionModifierIdentityStyle } from './spell-evolution-modifier-identity-assets.js';
import { spellEvolutionTierDeltaIdentityStyle } from './spell-evolution-tier-delta-identity-assets.js';
import { projectSpellEvolutionSelection, spellEvolutionProjectionHint, type SpellEvolutionProjection } from './spell-evolution-selection-projection.js';
import { spellEvolution, spellEvolutionTier, type SpellEvolutionTier } from './spell-evolutions.js';
import { ENEMY_SPRITE_ATLAS, enemySpritePresentation, enemySpriteRect, isEnemySpriteType } from './enemy-sprite-assets.js';
import { ENEMY_COMBAT_VFX_ATLAS, enemyCombatVfxSprite, isEnemyCombatVfxType } from './enemy-combat-vfx-assets.js';
import { HERO_BATTLE_SPRITE_ATLAS, heroBattleSpritePresentation, heroBattleSpriteRect } from './hero-battle-sprite-assets.js';
import { HERO_MOTION_RENDER_ATLAS, heroMotionRenderPresentation, heroMotionRenderSprite } from './hero-motion-render-assets.js';
import { HERO_CAST_RENDER_ATLAS, heroCastRenderPresentation, heroCastRenderSprite } from './hero-cast-render-assets.js';
import { advanceHeroKinematicRenderState, createHeroKinematicRenderState, heroKinematicRenderPresentation, type HeroKinematicRenderState } from './hero-kinematic-rendering.js';
import { heroCastOrientationPresentation } from './hero-cast-orientation-rendering.js';
import { advanceHeroCastAimHoldState, createHeroCastAimHoldState, heroCastAimHoldPresentation, type HeroCastAimHoldState } from './hero-cast-aim-hold-rendering.js';
import { heroBodyFacingOwnerPresentation } from './hero-body-facing-owner-rendering.js';
import { advanceHeroBodyFacingHysteresisState, createHeroBodyFacingHysteresisState, heroBodyFacingHysteresisPresentation, type HeroBodyFacingHysteresisState } from './hero-body-facing-hysteresis-rendering.js';
import { heroDirectionalOverlayOwnerPresentation } from './hero-directional-overlay-owner-rendering.js';
import { heroActionPoseEmphasisPresentation } from './hero-action-pose-emphasis-rendering.js';
import { heroActionPoseHandoffPresentation } from './hero-action-pose-handoff-rendering.js';
import { heroActionLayerBudgetPresentation } from './hero-action-layer-budget-rendering.js';
import { advanceHeroCastCadenceState, heroCastCadencePresentation, type HeroCastCadenceState } from './hero-cast-cadence-rendering.js';
import { advanceHeroActionTransitionState, heroActionTransitionPresentation, type HeroActionTransitionState } from './hero-action-transition-rendering.js';
import { advanceHeroUltimateBodyState, heroUltimateBodyPresentation, type HeroUltimateBodyState } from './hero-ultimate-body-continuity-rendering.js';
import { advanceHeroUltimateAimContinuityState, createHeroUltimateAimContinuityState, heroUltimateAimContinuityPresentation, type HeroUltimateAimContinuityState } from './hero-ultimate-aim-continuity-rendering.js';
import { advanceHeroUltimateActionHandoffState, heroUltimateActionHandoffPresentation, type HeroUltimateActionHandoffState } from './hero-ultimate-action-handoff-rendering.js';
import { heroMotionBudgetPresentation } from './hero-motion-budget-rendering.js';
import { heroGroundContactOwnershipPresentation } from './hero-ground-contact-ownership-rendering.js';
import { heroHitGroundHandoffPresentation } from './hero-hit-ground-handoff-rendering.js';
import { advanceHeroCrisisGroundSettleState, heroCrisisGroundSettlePresentation, type HeroCrisisGroundSettleState } from './hero-crisis-ground-settle-rendering.js';
import { heroActionLaunchOriginCoherencePresentation } from './hero-action-launch-origin-coherence-rendering.js';
import { bossSpecialLaunchOriginPresentation } from './boss-special-launch-origin-rendering.js';
import { bossHazardActivationDensityBudgetPresentation, bossHazardFootprintDensityBudgetPresentation, bossHazardFootprintLifecycleHandoffPresentation, bossHazardMaterializationFootprintPresentation, bossHazardPersistentActivationSettlePresentation, bossHazardTelegraphHandoffPresentation } from './boss-hazard-telegraph-handoff-rendering.js';
import { bossClearedGroundSafeLaneRecoveryCoherencePresentation, bossClearedGroundSafeLaneRecoveryHandoffPresentation, bossClearedGroundSafeLaneRecoveryDensityBudgetPresentation, bossHazardAftermathDensityBudgetPresentation, bossHazardAftermathOwnerArbitrationPresentation, bossHazardEndAftermathOwnershipPresentation, bossHazardExpirationGroundStateDensityBudgetPresentation, bossHazardExpirationGroundStateHandoffPresentation, bossHazardLifecycleOwnerPresentation, bossHazardPersistentExpirationGroundStatePresentation, bossHazardRespawnGroundCoherencePresentation, bossHazardRespawnGroundDensityBudgetPresentation, bossHazardRespawnGroundHandoffPresentation, bossHazardRespawnMaterializationDensityBudgetPresentation, bossHazardRespawnMaterializationOwnershipPresentation, bossHazardRespawnMaterializationSettlePresentation } from './boss-hazard-lifecycle-owner-rendering.js';
import { bossGroundOriginRebasePresentation } from './boss-ground-origin-rebase-rendering.js';
import { enemyDeathTransitionPresentation, enemyFinisherDeathAfterglowContinuityPresentation, enemyFinisherDeathAfterglowHandoffPresentation, enemyFinisherDeathAfterglowDensityBudgetPresentation } from './enemy-hit-death-transition-rendering.js';
import { specialistDefeatGroundRetirementPresentation } from './specialist-defeat-ground-retirement-rendering.js';
import { regularDefeatGroundRetirementPresentation, type RegularDefeatGroundType } from './regular-defeat-ground-retirement-rendering.js';
import { characterGroundContactPresentation, characterHitRecoilPresentation } from './character-contact-recoil-rendering.js';
import { HERO_RESPONSE_VFX_ATLAS, heroResponseVfxSprite, type HeroResponseVfxKind } from './hero-response-vfx-assets.js';
import { HERO_PROJECTILE_VFX_ATLAS } from './hero-projectile-vfx-assets.js';
import { HERO_ULTIMATE_SIGNATURE_VFX_ATLAS } from './hero-ultimate-signature-vfx-assets.js';
import { HERO_SPELL_SIGNATURE_VFX_ATLAS } from './hero-spell-signature-vfx-assets.js';
import { ELITE_AFFIX_IDENTITY_ATLAS } from './elite-affix-identity-assets.js';
import { SPECIALIST_INTENT_ATLAS, specialistIntentIcon } from './specialist-intent-identity-assets.js';
import { SPECIALIST_COMBAT_VFX_ATLAS } from './specialist-combat-vfx-assets.js';
import { BOSS_WEAKPOINT_IDENTITY_ATLAS, bossWeakpointIdentityIcon } from './boss-weakpoint-identity-assets.js';
import { BOSS_WEAKPOINT_WORLD_VFX_ATLAS, bossWeakpointWorldVfxSprite, type BossWeakpointWorldVfxKind } from './boss-weakpoint-world-vfx-assets.js';
import { BOSS_WEAKPOINT_BREAK_IDENTITY_ATLAS, bossWeakpointBreakIdentityIcon } from './boss-weakpoint-break-identity-assets.js';
import { BOSS_COUNTERPLAY_BENEFIT_IDENTITY_ATLAS, bossCounterplayBenefitActive, bossCounterplayBenefitIdentityIcon } from './boss-counterplay-benefit-identity-assets.js';
import { BOSS_PHASE2_ESCALATION_ATLAS, bossPhase2EscalationIcon } from './boss-phase2-escalation-identity-assets.js';
import { BOSS_PHASE3_ENRAGE_ATLAS, bossPhase3EnrageIcon } from './boss-phase3-enrage-identity-assets.js';
import { BOSS_VARIANT_PRESSURE_ATLAS, bossVariantPressureIcon, bossVariantTierBadge } from './boss-variant-pressure-identity-assets.js';
import { APEX_SECONDARY_PATTERN_ATLAS, apexSecondaryPatternIcon } from './apex-secondary-pattern-identity-assets.js';
import { BOSS_ARENA_HAZARD_IDENTITY_ATLAS, bossArenaHazardIdentityIcon } from './boss-arena-hazard-identity-assets.js';
import { BOSS_ARENA_LIFECYCLE_VFX_ATLAS, bossArenaLifecycleVfxSprite } from './boss-arena-lifecycle-vfx-assets.js';
import { BOSS_ARCHETYPE_IDENTITY_ATLAS, bossArchetypeIdentityIcon } from './boss-archetype-identity-assets.js';
import { BOSS_SPECIAL_INTENT_ATLAS, bossSpecialIntentIcon, bossSpecialIntentSegments } from './boss-special-intent-assets.js';
import { BOSS_RESPONSE_ACK_IDENTITY_ATLAS, bossResponseAckIdentityIcon } from './boss-response-ack-identity-assets.js';
import { PERFECT_EVADE_IDENTITY_ATLAS, normalizedPerfectEvadeStreak, perfectEvadeIdentityIcon, type PerfectEvadeStreak } from './perfect-evade-identity-assets.js';
import { DAMAGE_SOURCE_IDENTITY_ATLAS, damageSourceIdentityIcon } from './damage-source-identity-assets.js';
import { FIELD_NODE_IDENTITY_ATLAS, fieldNodeIdentityIcon, fieldNodeIdentityPresentation } from './field-node-identity-assets.js';
import { WORLD_EVOLUTION_IDENTITY_ATLAS, worldEvolutionIdentityIcon, type WorldEvolutionIdentityId } from './endless/world-evolution-identity-assets.js';
import { CATASTROPHE_IDENTITY_ATLAS, catastropheIdentityIcon } from './catastrophe-identity-assets.js';
import { CATASTROPHE_TRANSITION_IDENTITY_ATLAS, catastropheTransitionIdentityIcon } from './catastrophe-transition-identity-assets.js';
import { catastropheTransitionForecastLabel, catastropheTransitionHint, projectCatastropheTransition, projectCatastropheTransitionForecast, type CatastropheTransitionProjection } from './catastrophe-transition-projection.js';
import { MYTHIC_LAST_LAW_IDENTITY_ATLAS, mythicLastLawIdentityIcon } from './endless/mythic-last-law-identity-assets.js';
import { MYTHIC_TACTIC_IDENTITY_ATLAS, mythicTacticIdentityIcon, mythicTacticIdentityIdForArchetype } from './endless/mythic-tactic-identity-assets.js';
import { MYTHIC_PHASE_IDENTITY_ATLAS, mythicPhaseIdentityIcon, mythicPhasePressureSegments, type MythicPhaseIdentityId } from './endless/mythic-phase-identity-assets.js';
import { MYTHIC_ARENA_GEOMETRY_IDENTITY_ATLAS, mythicArenaGeometryIdentityIcon } from './endless/mythic-arena-geometry-identity-assets.js';
import { MYTHIC_SAFE_ZONE_LIFECYCLE_IDENTITY_ATLAS, mythicSafeZoneLifecycleIdentityIcon } from './endless/mythic-safe-zone-lifecycle-identity-assets.js';
import { MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_ATLAS, mythicSafeZonePressureEffectIdentityIcon } from './endless/mythic-safe-zone-pressure-effect-identity-assets.js';
import { projectMythicSafeZonePressureEffects, type MythicSafeZonePressureEffectsProjection } from './endless/mythic-safe-zone-pressure-projection.js';
import { projectBossEffectivePressure, type BossEffectivePressureProjection } from './endless/boss-effective-pressure-projection.js';
import { SAFE_ZONE_TRANSITION_DIRECTION_ATLAS, safeZoneTransitionDirectionFromVector, safeZoneTransitionDirectionIcon } from './endless/safe-zone-transition-direction-assets.js';
import { BOSS_SPRITE_ATLAS } from './boss-sprite-assets.js';
import { BOSS_SIGNATURE_VFX_ATLAS, bossSignatureVfxSprite } from './boss-signature-vfx-assets.js';
import { BOSS_SPECIAL_COMBAT_VFX_ATLAS, bossSpecialHazardVfxSprite } from './boss-special-combat-vfx-assets.js';
import { BOSS_PHASE_OVERLAY_VFX_ATLAS } from './boss-phase-overlay-vfx-assets.js';
import { TACTICAL_STATUS_ICON_ATLAS, tacticalStatusIconPresentation, type TacticalStatusIconId } from './tactical-status-icon-assets.js';
import { OBJECTIVE_ACTION_IDENTITY_ATLAS, objectiveActionIdentityForObjective, objectiveActionIdentityIcon } from './objective-action-identity-assets.js';
import { OBJECTIVE_REWARD_IDENTITY_ATLAS, objectiveRewardIdentityIcon, objectiveRewardPreviewAmount } from './objective-reward-identity-assets.js';
import { RUN_MISSION_PACE_IDENTITY_ATLAS, runMissionPaceIdentityForRatios, runMissionPaceIdentityIcon, type RunMissionPaceIdentityId } from './run-mission-pace-identity-assets.js';
import { RUN_CONTRACT_BOON_EFFECT_IDENTITY_ATLAS, runContractBoonEffectIdentityForFamily, runContractBoonEffectIdentityIcon } from './run-contract-boon-effect-identity-assets.js';
import { OATH_REQUIREMENT_IDENTITY_ATLAS, oathRequirementIdentityIcon } from './oath-requirement-identity-assets.js';
import { OATH_BOON_OUTCOME_IDENTITY_ATLAS, oathBoonOutcomeIdentityIcon, type OathBoonOutcomeIdentityId } from './oath-boon-outcome-identity-assets.js';
import { oathRequirementBoonIdentity, type OathRequirementBoonIdentity } from './oath-requirement-boon-identity.js';
import { FIELD_EVENT_RESPONSE_IDENTITY_ATLAS, fieldEventResponseIdentityForEvent, fieldEventResponseIdentityIcon } from './field-event-response-identity-assets.js';
import { FIELD_EVENT_EFFECT_PROFILE_IDENTITY_ATLAS, fieldEventEffectProfileIdentityForEvent, fieldEventEffectProfileIdentityIcon } from './field-event-effect-profile-identity-assets.js';
import { BUILD_IDENTITY_ATLAS, buildIdentityIcon, type BuildIdentityId } from './build-identity-assets.js';
import { HERO_METER_IDENTITY_ATLAS, heroMeterIdentityIcon, type HeroMeterIdentityId } from './hero-meter-identity-assets.js';
import { ARCANE_COMBO_IDENTITY_ATLAS, arcaneComboIdentityIcon, arcaneComboTierBadge, type ArcaneComboIdentityId } from './arcane-combo-identity-assets.js';
import { relicResonanceRecallIcon, relicResonanceRecallPresentation, relicResonanceTierBadge, type ActiveRelicResonanceTier } from './relic-resonance-recall-assets.js';
import { RELIC_RESONANCE_IMPACT_IDENTITY_ATLAS, relicResonanceImpactIdentityIcon, relicResonanceImpactIdentityStyle, type RelicResonanceImpactIdentityId } from './relic-resonance-impact-identity-assets.js';
import { RELIC_RESONANCE_TIER_IDENTITY_ATLAS, relicResonanceTierIdentityForTier, relicResonanceTierIdentityIcon, relicResonanceTierIdentityStyle, type RelicResonanceTierIdentityId } from './relic-resonance-tier-identity-assets.js';
import { projectRelicResonance, relicResonanceImpactForTiers, relicResonanceNextTierProgress } from './relic-resonance-projection.js';
import { HERO_ASCENSION_MODIFIER_IDENTITY_ATLAS, heroAscensionModifierIdentityIcon, heroAscensionModifierIdentityStyle } from './hero-ascension-modifier-identity-assets.js';
import { HERO_ASCENSION_BUILD_DIRECTION_ATLAS, heroAscensionBuildDirectionIdentityIcon, heroAscensionBuildDirectionIdentityStyle } from './hero-ascension-build-direction-identity-assets.js';
import { heroAscensionProjectionHint, projectHeroAscensionSelection, type HeroAscensionProjection } from './hero-ascension-projection.js';
import { FUSION_MODIFIER_IDENTITY_ATLAS, fusionModifierIdentityIcon, fusionModifierIdentityStyle } from './fusion-modifier-identity-assets.js';
import { FUSION_COMPONENT_RELATION_ATLAS, fusionComponentRelationIdentityIcon, fusionComponentRelationIdentityStyle } from './fusion-component-relation-identity-assets.js';
import { fusionProjectionHint, projectFusionSelection, type FusionSelectionProjection } from './fusion-selection-projection.js';
import { buildOverdriveRecallPresentation } from './build-overdrive-recall-assets.js';
import { BUILD_OVERDRIVE_EFFECT_ATLAS, buildOverdriveEffectIdentityIcon } from './build-overdrive-effect-identity-assets.js';
import { buildOverdriveActivationToastLabel, buildOverdriveEffectProjectionHint, projectBuildOverdriveEffects, type BuildOverdriveEffectProjection } from './build-overdrive-effect-projection.js';
import { FINAL_FORM_IDENTITY_ATLAS, finalFormIdentityIcon } from './final-form-identity-assets.js';
import { BATTLEFIELD_ENVIRONMENT_ATLAS, battlefieldEnvironmentSprite } from './battlefield-environment-assets.js';
import { BATTLEFIELD_ATMOSPHERE_VFX_ATLAS, battlefieldAtmosphereVfxSprite } from './battlefield-atmosphere-vfx-assets.js';
import { BATTLEFIELD_DEPTH_OVERLAY_ATLAS, battlefieldDepthOverlaySprite } from './battlefield-depth-overlay-assets.js';
import { BATTLEFIELD_ENVIRONMENT_REACTION_VFX_ATLAS, battlefieldEnvironmentReactionVfxSprite, type BattlefieldEnvironmentReactionKind } from './battlefield-environment-reaction-vfx-assets.js';
import { BATTLEFIELD_PROP_VFX_ATLAS, battlefieldPropSprite } from './battlefield-props-vfx-assets.js';
import { BATTLEFIELD_OBSTACLE_STATE_VFX_ATLAS, battlefieldObstacleStateForEvolution, battlefieldObstacleStateVfxSprite } from './battlefield-obstacle-state-vfx-assets.js';
import { BATTLEFIELD_INTERACTION_VFX_ATLAS, battlefieldCoreVisualState, battlefieldInteractionSprite } from './battlefield-interaction-vfx-assets.js';
import { PICKUP_FLOW_VFX_ATLAS } from './pickup-flow-vfx-assets.js';
import { SPAWN_PRESSURE_VFX_ATLAS } from './spawn-pressure-vfx-assets.js';
import { SURVIVAL_RESPONSE_VFX_ATLAS, survivalResponseVfxSprite, type SurvivalResponseVfxKind } from './survival-response-vfx-assets.js';
import { coreGuardSurvivalResponseArbitrationPresentation } from './core-guard-survival-response-arbitration-rendering.js';
import { coreHitWorldGuardArbitrationPresentation } from './core-hit-world-guard-arbitration-rendering.js';
import { coreGuardDamageSourceBodyLanguagePresentation } from './core-guard-damage-source-body-language-rendering.js';
import { coreGuardMixedSourceCompositionPresentation } from './core-guard-mixed-source-composition-rendering.js';
import { coreGuardVisualLoadBudgetPresentation } from './core-guard-visual-load-budget-rendering.js';
import { coreGuardMixedAccentPhasePresentation } from './core-guard-mixed-accent-phase-rendering.js';
import { coreGuardMultiCueStackBudget } from './core-guard-multi-cue-stack-budget-rendering.js';
import { coreGuardDirectionalStackOwnership } from './core-guard-directional-stack-ownership-rendering.js';
import { coreGuardPressureVectorOrientationPresentation } from './core-guard-pressure-vector-orientation-rendering.js';
import { advanceCoreGuardPressureVectorHysteresis, createCoreGuardPressureVectorHysteresisState, type CoreGuardPressureVectorHysteresisState } from './core-guard-pressure-vector-hysteresis-rendering.js';
import { advanceCoreGuardDamageSourceHysteresis, createCoreGuardDamageSourceHysteresisState, type CoreGuardDamageSourceHysteresisState } from './core-guard-damage-source-hysteresis-rendering.js';
import { FREEZE_CONTROL_VFX_ATLAS, freezeControlVfxClassForEnemyType, freezeControlVfxSprite, type FreezeControlVfxClass } from './freeze-control-vfx-assets.js';
import { REGULAR_ENEMY_ACTION_VFX_ATLAS } from './regular-enemy-action-vfx-assets.js';
import { ELITE_AFFIX_LIFECYCLE_VFX_ATLAS } from './elite-affix-lifecycle-vfx-assets.js';
import { ENEMY_TARGET_PRESSURE_VFX_ATLAS } from './enemy-target-pressure-vfx-assets.js';
import { FINAL_FORM_WORLD_VFX_ATLAS, finalFormWorldVfxSprite, type FinalFormWorldVfxState } from './final-form-world-vfx-assets.js';
import { FUSION_WORLD_VFX_ATLAS, fusionWorldVfxSprite } from './fusion-world-vfx-assets.js';
import { HERO_METER_WORLD_VFX_ATLAS, heroMeterWorldVfxSprite } from './hero-meter-world-vfx-assets.js';
import { BOSS_PROJECTILE_LIFECYCLE_VFX_ATLAS } from './boss-projectile-lifecycle-vfx-assets.js';
import { PERSISTENT_SPELL_ZONE_VFX_ATLAS } from './persistent-spell-zone-vfx-assets.js';
import { CRYSTAL_INTERACTION_LIFECYCLE_VFX_ATLAS, crystalInteractionLifecycleVfxSprite } from './crystal-interaction-lifecycle-vfx-assets.js';
import { BOSS_PHASE_AFTERMATH_VFX_ATLAS, bossPhaseAftermathVfxSprite } from './boss-phase-aftermath-vfx-assets.js';
import { SPECIALIST_REACTION_LIFECYCLE_VFX_ATLAS } from './specialist-reaction-lifecycle-vfx-assets.js';
import { MAP_EVOLUTION_AFTERMATH_VFX_ATLAS, mapEvolutionAftermathVfxSprite } from './map-evolution-aftermath-vfx-assets.js';
import { BOSS_HAZARD_AFTERMATH_VFX_ATLAS, bossHazardAftermathVfxSprite } from './boss-hazard-aftermath-vfx-assets.js';
import { bossHazardAftermathTerrainRetirementPresentation } from './boss-hazard-aftermath-terrain-retirement-rendering.js';
import { bossHazardClearedGroundMemoryPresentation } from './boss-hazard-cleared-ground-memory-rendering.js';
import { bossClearedGroundGeometryPresentation } from './boss-cleared-ground-geometry-rendering.js';
import { bossClearedSafeLaneArbitrationPresentation } from './boss-cleared-safe-lane-arbitration-rendering.js';
import { bossClearedSafeLaneForecastTarget } from './boss-cleared-safe-lane-forecast-arbitration-rendering.js';
import { safeLaneForecastVisualCoherencePresentation } from './safe-lane-forecast-visual-coherence-rendering.js';
import { advanceSafeLaneForecastPromotionHysteresis, createSafeLaneForecastPromotionHysteresisState, type SafeLaneForecastPromotionHysteresisState } from './safe-lane-forecast-promotion-hysteresis-rendering.js';
import { safeLaneCombatAttentionBudgetPresentation } from './safe-lane-combat-attention-budget-rendering.js';
import { advanceSafeLaneAttentionRecoveryHysteresis, createSafeLaneAttentionRecoveryHysteresisState, safeLaneAttentionRecoveryPresentation, type SafeLaneAttentionRecoveryHysteresisState } from './safe-lane-attention-recovery-hysteresis-rendering.js';
import { safeLaneIdentityOwnerArbitrationPresentation } from './safe-lane-identity-owner-arbitration-rendering.js';
import { safeLaneHazardPathOcclusionPresentation } from './safe-lane-hazard-path-occlusion-rendering.js';
import { safeLaneHazardPathGapPresentation } from './safe-lane-hazard-path-gap-rendering.js';
import { safeLaneGapFeatherPresentation } from './safe-lane-gap-feather-rendering.js';
import { advanceSafeLaneGapFeatherHysteresisState, createSafeLaneGapFeatherHysteresisState, type SafeLaneGapFeatherHysteresisState } from './safe-lane-gap-feather-hysteresis-rendering.js';
import { safeLaneGapHazardHandoffPresentation } from './safe-lane-gap-hazard-handoff-rendering.js';
import { denseBattleSafeLaneContinuityPresentation, hazardExpiryEdgeContinuityPresentation } from './threat-impact-continuity-rendering.js';
import { hazardResidueReleasePresentation, safeLaneHazardReclaimPresentation } from './threat-impact-recovery-rendering.js';
import { hazardGroundResolutionPresentation, safeLaneCanonicalResolutionPresentation } from './threat-impact-resolution-rendering.js';
import { battlefieldThreatLayerBudgetPresentation, safeLaneOcclusionGuardPresentation } from './threat-impact-priority-rendering.js';
import { bossCriticalFocusReservationPresentation, hazardSafeLaneCarvePresentation, safeLaneCorridorReservationPresentation } from './threat-impact-spatial-priority-rendering.js';
import { hazardCorridorStabilityPresentation, safeLaneAttentionHoldPresentation, temporalThreatBudgetPresentation } from './threat-impact-temporal-focus-rendering.js';
import { battlefieldDepthBudgetPresentation, bossTelegraphImpactDepthPresentation, safeLaneProjectileCrossingPresentation } from './threat-impact-depth-priority-rendering.js';
import { bossTelegraphDepthReleasePresentation, depthRecoveryBudgetPresentation, safeLaneDepthRecoveryPresentation } from './threat-impact-depth-recovery-rendering.js';
import { bossTelegraphStackOrderPresentation, safeLaneEdgeClutterProtectionPresentation, unifiedDepthStackBudgetPresentation } from './threat-impact-depth-stack-rendering.js';
import { canonicalCorridorProtectionPresentation, spatialThreatSeparationBudgetPresentation, telegraphSafeLaneSeparationPresentation } from './threat-impact-spatial-separation-rendering.js';
import { spatialReclaimGuardPresentation, spatialRecoveryBudgetPresentation, telegraphSafeLaneReleasePresentation } from './threat-impact-spatial-recovery-rendering.js';
import { denseBattlefieldArbitrationPresentation, denseHazardArbitrationPresentation, denseSafeLaneArbitrationPresentation } from './threat-impact-dense-arbitration-rendering.js';
import { depthPlaneBudgetPresentation, hazardDepthPlanePresentation, safeLaneContourDepthPresentation } from './threat-impact-depth-plane-rendering.js';
import { depthReentryBudgetPresentation, hazardDepthReentryPresentation, safeLaneContourReentryPresentation } from './threat-impact-depth-plane-reentry-rendering.js';
import { bossFocusCorridorBudgetPresentation, bossSafeLaneFocusCorridorPresentation, bossTelegraphFocusCorridorPresentation } from './threat-impact-boss-focus-corridor-rendering.js';
import { canonicalReacquisitionBudgetPresentation, hazardCanonicalReacquisitionPresentation, safeLaneCanonicalReacquisitionPresentation } from './threat-impact-canonical-reacquisition-rendering.js';
import { directionReacquisitionBudgetPresentation, hazardBoundaryDirectionReacquisitionPresentation, safeLaneDirectionReacquisitionPresentation } from './threat-impact-direction-reacquisition-rendering.js';
import { advanceSafeLaneHazardOcclusionRecovery, createSafeLaneHazardOcclusionRecoveryState, safeLaneHazardOcclusionRecoveryPresentation, type SafeLaneHazardOcclusionRecoveryState } from './safe-lane-hazard-occlusion-recovery-rendering.js';
import { ENEMY_FINISHER_VFX_ATLAS, enemyFinisherVfxSprite } from './enemy-finisher-vfx-assets.js';
import { HERO_CRISIS_VFX_ATLAS, heroCrisisVfxSprite, type HeroCrisisVfxState } from './hero-crisis-vfx-assets.js';
import { PERFECT_EVADE_TRAIL_VFX_ATLAS, perfectEvadeTrailVfxSprite } from './perfect-evade-trail-vfx-assets.js';
import { CROWD_CONTROL_PROPAGATION_VFX_ATLAS } from './crowd-control-propagation-vfx-assets.js';
import { BOSS_COUNTERPLAY_REWARD_VFX_ATLAS, bossCounterplayRewardVfxSprite } from './boss-counterplay-reward-vfx-assets.js';
import { OBJECTIVE_COMPLETION_CEREMONY_VFX_ATLAS, objectiveCompletionCeremonyVfxSprite } from './objective-completion-ceremony-vfx-assets.js';
import { ULTIMATE_POST_IMPACT_RESIDUE_VFX_ATLAS } from './ultimate-post-impact-residue-vfx-assets.js';
import { MAP_SAFE_LANE_TRANSITION_VFX_ATLAS, mapSafeLaneTransitionVfxSprite } from './map-safe-lane-transition-vfx-assets.js';
import { OBJECTIVE_ACTIVATION_MATERIALIZATION_VFX_ATLAS, objectiveActivationMaterializationVfxSprite } from './objective-activation-materialization-vfx-assets.js';
import { BOSS_ARENA_TRANSITION_WORLD_VFX_ATLAS, bossArenaTransitionWorldVfxSprite, type BossArenaTransitionWorldVfxState } from './boss-arena-transition-world-vfx-assets.js';
import { MAP_COMBAT_BOUNDARY_WARNING_VFX_ATLAS, mapCombatBoundaryWarningVfxSprite } from './map-combat-boundary-warning-vfx-assets.js';
import { OBJECTIVE_FAILURE_DISSOLVE_VFX_ATLAS, objectiveFailureDissolveVfxSprite } from './objective-failure-dissolve-vfx-assets.js';
import { FIELD_EVENT_LIFECYCLE_WORLD_VFX_ATLAS, fieldEventLifecycleWorldVfxSprite, type FieldEventLifecycleWorldVfxState } from './field-event-lifecycle-world-vfx-assets.js';
import { ELITE_PACK_APPROACH_FORMATION_VFX_ATLAS, elitePackApproachFormationVfxSprite } from './elite-pack-approach-formation-vfx-assets.js';
import { BATTLEFIELD_MECHANIC_ATLAS, battlefieldMechanicIdentityIcon } from './battlefield-mechanic-identity-assets.js';
import { battlefieldEvolutionImpactHint, projectBattlefieldEvolutionImpact, projectBattlefieldMechanics, type BattlefieldEvolutionImpactProjection } from './battlefield-mechanic-projection.js';
import { ASCENSION_TIER_PRESSURE_ATLAS, ascensionTierPressureIdentityIcon } from './ascension-tier-pressure-identity-assets.js';
import { ascensionTierForecastLabel, ascensionTierPressureHint, projectAscensionTierForecast, projectAscensionTierOutcome, type AscensionTierOutcomeProjection } from './ascension-tier-pressure-projection.js';
import { DEEP_RUN_DECISION_ATLAS, deepRunDecisionIdentityIcon, deepRunDecisionIdentityStyle, type DeepRunDecisionIdentity } from './deep-run-decision-identity-assets.js';
import { activeRunContractBoonRecall, runContractRecallIcon } from './run-contract-boon-recall-assets.js';
import { longRunOathKindFromTitle, longRunOathRecallIcon } from './long-run-oath-recall-assets.js';
import { DECISION_PATH_ICON_ATLAS } from './decision-path-icon-assets.js';
import { runTraitIdentity, ascensionSelectionIdentity } from './run-foundation-identity-assets.js';
import { fatePathRecallIcon } from './fate-path-recall-assets.js';
import { FATE_BENEFIT_VECTOR_ATLAS, fateBenefitVectorIcon } from './fate-benefit-vector-identity-assets.js';
import { FATE_COST_VECTOR_ATLAS, fateCostVectorIcon } from './fate-cost-vector-identity-assets.js';
import { fateChoiceImpact, fateCumulativeImpact, type FateImpactVector } from './fate-tradeoff-identity.js';
import type { FatePathId } from './fate-paths.js';
import { deepRunDecisionAttention } from './deep-run-decision-attention.js';
import { createHeroMeterState, heroMeterLabel, heroMeterModifiers, updateHeroMeter, type HeroMeterSignals, type HeroMeterState } from './hero-meters.js';
import { composeHeroMeterCombat, heroMeterCastSignals, heroMeterKillSignals } from './hero-meter-integration.js';
import { mapEvolutionLabel, mapEnvironmentVfxDescriptor, environmentDestructionVfxDescriptor, type MapEvolutionStage } from './map-evolution.js';
import { defaultThreatProfile, loadThreatProfile, saveThreatProfile, selectThreatLevel, type ThreatProfile } from '../domain/threat-profile.js';
import { threatLevelModifiers, threatLevelName, type ThreatLevel } from '../domain/threat-level.js';
import { defaultRunRecords, loadRunRecords, saveRunRecords, type RunRecordsState } from '../domain/run-records.js';
import { completeRunProgression } from '../domain/run-completion.js';
import { composeThreatPressure } from './phase14-runtime.js';
import { ArcaneAudio, defaultAudioSettings, loadAudioSettings, saveAudioSettings, type AudioSettings, type SoundKind } from './audio.js';
import { BossEncounterSystem, type BossEncounterModifiers } from './boss-encounters.js';
import { BossArenaSystem } from './boss-arena.js';
import { analyzeArcaneCombo } from './arcane-combos.js';
import { ComboRuntime } from './combo-runtime.js';
import { calculateTacticalScoreBonus, tacticalRecapLines, type TacticalRecap } from '../domain/tactical-recap.js';
import { BattlefieldObjectiveDirector, objectiveDefinition } from './battlefield-objectives.js';
import { ObjectiveRuntime, objectiveRewardFor, type ObjectiveReward } from './objective-runtime.js';
import { chooseObjectiveAnchor } from './objective-rules.js';
import { chooseSpellTarget } from './auto-targeting.js';
import { FusionRuntime } from './fusion-runtime.js';
import { fusionDefinition, type FusionId } from './spell-fusions.js';
import { fusionProcForCast } from './fusion-integration.js';
import { FateRuntime } from './fate-runtime.js';
import { DecisionPickGuard, nextDecisionKind } from './decision-continuity.js';
import { FateSelectOverlay } from '../ui/fate-select.js';
import { composeFatePressure, fateRewardMultipliers, fateHudSummary } from './fate-integration.js';
import { nullifierCooldownMultiplier } from './enemy-specialists.js';
import { defaultMasteryProfile, grantMasteryXp, loadMasteryProfile, saveMasteryProfile, type MasteryProfile } from '../domain/mastery-profile.js';
import { masteryXpForRun } from '../domain/mastery-rewards.js';
import { PauseState } from './pause-state.js';
import { clearRunSnapshot, saveRunSnapshot, type RunSnapshot } from '../domain/run-snapshot.js';
import { createBrowserSessionStorage } from '../domain/resilient-storage.js';
import { OnboardingController, defaultOnboardingState, loadOnboardingState, saveOnboardingState } from './onboarding.js';
import { advanceEndlessRuntime, createDefaultEndlessState } from './endless/runtime.js';
import { restoreExtension, serializeExtension, type ExtensionSnapshotV2 } from './endless/snapshot.js';
import { acceptContract, contractHudLine, getContractModifiers, type ActiveContract, type ContractBoon, type ContractFamily } from './endless/contracts.js';
import { buildLegacyRunView, composeEndlessHostModifiers, contractChoiceCards } from './endless/host.js';
import { consumeFieldNode, type FieldNode } from './endless/world-evolution.js';
import { getBossAdaptations, type BossAdaptation } from './endless/nemesis.js';
import { NEMESIS_ADAPTATION_IDENTITY_ATLAS, nemesisAdaptationIdentityIcon } from './endless/nemesis-adaptation-identity-assets.js';
import { NEMESIS_ADAPTATION_EFFECT_IDENTITY_ATLAS, nemesisAdaptationEffectIdentityIcon } from './endless/nemesis-adaptation-effect-identity-assets.js';
import { nemesisAdaptationLearningToastLabel, projectNemesisAdaptationEffects } from './endless/nemesis-adaptation-effect-projection.js';
import { recordTelemetryEvent } from './endless/telemetry.js';
import type { Effect as EndlessEffect, GameplayEvent } from './endless/types.js';
import { heroAscensionModifiers, selectHeroAscension } from './endless/hero-ascension.js';
import { deriveRelicResonance } from './endless/relic-resonance.js';
import { evaluateAdaptiveDirector } from './endless/adaptive-director.js';
import { bossArenaMutationModifiers, createBossArenaMutation, type BossArenaMutationKind } from './endless/boss-arena-mutations.js';
import { BOSS_ARENA_MUTATION_IDENTITY_ATLAS, bossArenaMutationIdentityIcon, bossArenaMutationIntensitySegments } from './endless/boss-arena-mutation-identity-assets.js';
import { mythicArenaIdentityProfile } from './endless/mythic-arena-identity.js';
import { mythicArenaGeometryProfile } from './endless/mythic-arena-geometry.js';
import { chronicleSummary } from './endless/chronicle.js';
import { mythicBossProfile } from './endless/mythic-boss.js';
import { buildRunFingerprint } from './endless/run-fingerprint.js';
import { ascensionMutatorRuntimeModifiers } from './endless/ascension-mutator-runtime.js';
import { ASCENSION_MUTATOR_IDENTITY_ATLAS, ascensionMutatorIdentityIcon, type AscensionMutatorIdentityId } from './endless/ascension-mutator-identity-assets.js';
import { mythicCounterplayModifiers } from './endless/mythic-counterplay.js';
import { appendRunHistory, loadRunHistory, type RunHistoryEntry } from '../domain/run-history.js';
import { appendRecoveryCheckpoint, clearRecoveryJournal, loadRunSnapshotWithJournal } from '../domain/recovery-journal.js';
import { advanceLifecycleCheckpoint, createLifecycleCheckpointState, type LifecycleCheckpointState } from './lifecycle-idempotency-audit.js';
import { loadRetryBlueprint, saveRetryBlueprint, type RetryBlueprint } from '../domain/retry-blueprint.js';
import { compareRunResult } from '../domain/run-comparison.js';
import { encodeBuildCapsule, type BuildCapsulePayload } from '../domain/build-capsule.js';
import { createBuildReplayPlan, type BuildReplayPlan } from '../domain/build-replay.js';
import { replayGuidance, type ReplayGuidance } from '../domain/build-replay-guidance.js';
import { deriveHeroFinalForm, finalFormModifiers, type HeroFinalForm, type HeroFinalFormId } from './endless/final-form.js';
import { overdriveModifiers, resolveBuildArchetype, type BuildArchetype } from './endless/build-overdrive.js';
import { mythicPhaseProfile } from './endless/mythic-phases.js';
import { mythicLastLawProfile } from './endless/mythic-last-law.js';
import { mythicLastLawIdentityProfile, type MythicLastLawId } from './endless/mythic-last-law-identity.js';
import { finalFormSignatureModifiers, finalFormSignatureProfile } from './endless/final-form-signature.js';
import { finalFormAttackPattern } from './endless/final-form-patterns.js';
import { advanceFinalFormMotion, finalFormMobilityProfile, signatureMobilityImpulse } from './endless/final-form-mobility.js';
import { advanceFinalFormFlow, createDefaultFinalFormFlowState, finalFormFlowModifiers, recordFinalFormFlowCast, type FinalFormFlowState } from './endless/final-form-flow.js';
import { longRunComfortPolicy } from './endless/long-run-comfort.js';
import { longRunHudFocusPolicy } from './long-run-hud-focus.js';
import { openingHudFocusPolicy } from './opening-hud-focus.js';
import { autoTargetIndicator, primaryWeakpointNode, weakpointIndicator } from './auto-target-visibility.js';
import { advanceDamageReason, recordDamageReason, type DamageReasonState } from './damage-reason-feedback.js';
import { purchaseImpactFeedback } from './purchase-impact-feedback.js';
import { dangerProjectileCues } from './projectile-threat-visibility.js';
import { BOSS_RESPONSE_ACK_SECONDS, bossActionAssist, bossResponseActions, type BossActionAssistCue } from './boss-action-assist.js';
import { combatAttentionPolicy, targetGuidanceMotionPolicy, secondaryCombatMotionPolicy, residualCombatMotionPolicy, type CombatAttentionPrimary, type CombatAttentionPolicy, type SecondaryCombatMotionPolicy, type ResidualCombatMotionPolicy } from './combat-cue-priority.js';
import { worldVfxPriorityPolicy, type WorldVfxPriority, type WorldVfxPriorityPolicy } from './world-vfx-priority-arbitration.js';
import { worldVfxOcclusionScale, type WorldVfxProtectedAnchor } from './world-vfx-occlusion-guard.js';
import { resolveWorldVfxOccupancy, type WorldVfxOccupancyId, type WorldVfxOccupancyResult } from './world-vfx-occupancy-budget.js';
import { enemySpawnLaneCues } from './enemy-spawn-lane-readability.js';
import { spawnLaneEdgeStackArbitration } from './spawn-lane-edge-stack-arbitration.js';
import { spawnLaneEdgeLabelFade } from './spawn-lane-edge-label-fade.js';
import { spawnLaneEdgeCountDownwardDebounce, type SpawnLaneEdgeCountDownwardDebounceEntry } from './spawn-lane-edge-count-downward-debounce.js';
import { bossSafeResponseWindowConfirmation } from './boss-safe-response-window-confirmation.js';
import { bossSafeResponseCompactAcknowledgement } from './boss-safe-response-compact-acknowledgement.js';
import { bossSafeResponseVisibleAffordance } from './boss-safe-response-visible-affordance.js';
import { bossSafeResponseLabelPlacement } from './boss-safe-response-label-placement.js';
import { bossSafeResponseSlotHysteresis, type BossSafeResponseSlotMemory } from './boss-safe-response-slot-hysteresis.js';
import { objectiveMarkerMotionPolicy } from './tactical-status-attention.js';
import { openingCombatPacing } from './opening-pacing.js';
import { firstThirtyMinuteProfile } from './first-thirty-minute-director.js';
import { bossDifficultyCurve } from './boss-difficulty-curve.js';
import { longRunOathModifiers, oathHudLine, type LongRunOathKind } from './endless/long-run-oaths.js';
import { advanceMobileFrameGovernor, mobileFrameGovernorPolicy } from './endless/mobile-frame-governor.js';
import { thermalBudgetPolicy } from './endless/thermal-budget-director.js';
import { advanceThermalRecovery, createThermalRecoveryState, thermalPolicyForEffectiveTier, type ThermalRecoveryState } from './endless/thermal-recovery-hysteresis.js';
import { longRunRewardDensityPolicy } from './endless/long-run-reward-density.js';
import { compactLandscapeStatusLine, prioritizeLandscapeBuildLabels } from './landscape-hud.js';
import { buildRecoveryGuidance } from './build-recovery-guidance.js';
import { flowFeedbackProfile, flowImpactProfile, shouldEmitFlowCue } from './endless/final-form-flow-feedback.js';
import { openingWaveCeremony, type OpeningWaveBeatId } from './opening-wave-ceremony.js';
import { openingBossEntrance, type OpeningBossEntranceStage } from './opening-boss-entrance.js';
import { openingAutoReadyProfile, openingAutoCastIntent } from './opening-auto-ready.js';
import { guideOpeningUpgradeChoices } from './opening-upgrade-guidance.js';
import { guideMidgameUpgradeChoices } from './midgame-upgrade-guidance.js';
import { openingShopFastPath } from './opening-shop-fast-path.js';
import { repeatShopFastPath } from './repeat-shop-fast-path.js';
import { lateShopFastPath } from './late-shop-fast-path.js';
import { bossRewardNextGoal } from './boss-reward-next-goal.js';
import { secondBossBuildGoal } from './second-boss-build-goal.js';
import { completedBuildHudFocus } from './completed-build-hud-focus.js';
import { lateRunMaintenanceGoal } from './late-run-maintenance-goal.js';
import { lateRunShopNeed } from './late-run-shop-need.js';
import { deepRunHudFocus } from './deep-run-hud-focus.js';
import { reduceDeepRunBossRewardDecision } from './deep-run-boss-reward-guidance.js';
import { reduceRepeatBossRewardDecision } from './repeat-boss-reward-guidance.js';
import { ultraLongShopFocus } from './ultra-long-shop-focus.js';
import { compactUltraLongBossRewards } from './ultra-long-reward-focus.js';
import { fourHourHudFocus } from './four-hour-hud-focus.js';
import { ultraLongCriticalFocus } from './ultra-long-critical-focus.js';
import { fourEightHourShopSilence } from './four-eight-hour-shop-silence.js';
import { focusFourEightHourBossRewards } from './four-eight-hour-reward-focus.js';
import { fourEightHourToastFocus } from './four-eight-hour-toast-focus.js';
import { fourEightHourPriorityFocus, priorityBuildLabels } from './four-eight-hour-priority-focus.js';
import { eightTwelveHourShopFocus } from './eight-twelve-hour-shop-focus.js';
import { focusEightTwelveHourBossRewards } from './eight-twelve-hour-reward-focus.js';
import { eightTwelveHourToastFocus } from './eight-twelve-hour-toast-focus.js';
import { eightTwelveHourHudFocus, eightTwelveHourBuildLabels } from './eight-twelve-hour-hud-focus.js';
import { openingBossPrepAssist } from './opening-boss-prep.js';
import { landscapeSafeAreaProfile } from './landscape-safe-area.js';
import { foldableDensityPolicy } from './foldable-density-director.js';
import { advanceArenaDodgeTracker, createArenaDodgeTracker, type ArenaDodgeTracker } from './endless/arena-dodge-reward.js';
import { arenaDodgeChainReward, breakArenaDodgeChain, createArenaDodgeChain, recordArenaDodgeChain, type ArenaDodgeChainState } from './endless/arena-dodge-chain.js';
import { arenaDodgeFinisherProfile, shouldTriggerArenaDodgeFinisher } from './endless/arena-dodge-finisher.js';
import { finalFormEvadeFinisher } from './endless/final-form-evade-finisher.js';
import { finalFormFinisherFeedback } from './endless/final-form-finisher-feedback.js';
import { finalFormFinisherSignature } from './endless/final-form-finisher-signature.js';
import { finalFormAudioPalette } from './endless/final-form-audio-palette.js';
import { mythicSafeLaneHint } from './endless/mythic-safe-lane.js';
import { safeLaneForecast } from './endless/safe-lane-forecast.js';
import { safeTelegraphTimeline } from './endless/safe-telegraph-timeline.js';
import { lastLawSafeTimeline } from './endless/last-law-safe-timeline.js';
import { lastLawSafeZoneLifecycle } from './endless/last-law-safe-zone-lifecycle.js';
import { mythicSafeZoneDamageMultiplier, mythicSafeZoneState } from './endless/mythic-safe-zone.js';
import { mythicSafeZonePressure } from './endless/mythic-safe-zone-pressure.js';
import { mythicTacticReward } from './endless/mythic-tactic-reward.js';
import { createMythicTacticAttackLink, type MythicTacticAttackLink } from './endless/mythic-tactic-attack-link.js';
import { projectMythicTacticAttackLink } from './endless/mythic-tactic-attack-link-projection.js';
import { mythicTacticLinkFeedback } from './endless/mythic-tactic-link-feedback.js';
import { finalFormFlowLink } from './endless/final-form-flow-link.js';
import { advanceSafeLaneLink, consumeSafeLanePerfectEvade, createSafeLaneLink, type SafeLaneLinkState } from './endless/safe-lane-link.js';

export class Game {
  readonly input: InputState;
  private readonly storage = createBrowserSessionStorage();
  private lifecycleCheckpointState: LifecycleCheckpointState = createLifecycleCheckpointState();
  hero: Hero = createHero('arkan');
  core: GuardianCore = createGuardianCore();
  elapsed = 0;
  paused = true;
  readonly pauseState = new PauseState();
  gameOver = false;
  shopTokens = 0;
  bossesKilled = 0;
  goldEarned = 0;
  autoCastNormal = false;
  private autoTargetId: number | null = null;
  private bossActionAssistCue: BossActionAssistCue | null = null;
  private bossActionAssistCueSince = 0;
  private bossActionAssistBossId: number | null = null;
  private bossActionAssistArchetype: BossArchetype | null = null;
  private bossResponseAckAction: ActionId | null = null;
  private bossResponseAckSince = 0;
  private bossResponseAckBossId: number | null = null;
  private bossResponseAckArchetype: BossArchetype | null = null;
  private bossResponseAckCycle: number | null = null;
  private bossSafeResponseWindowUntil = 0;
  private bossSafeResponseBossId: number | null = null;
  private bossSafeResponseCycle: number | null = null;
  private bossSafeResponseShownCycle: number | null = null;
  private bossSafeResponseSlotMemory: BossSafeResponseSlotMemory | null = null;
  private spawnLaneEdgeCountDebounceMemory: SpawnLaneEdgeCountDownwardDebounceEntry[] = [];

  readonly enemies = new EnemyManager();
  readonly spells = new SpellSystem();
  private readonly castIntentBuffer = new CastIntentBuffer();
  private readonly manualTargetMemory = new ManualTargetMemory();
  readonly pickups = new PickupManager();
  readonly terrain = new TerrainSystem();
  readonly feedback = new CombatFeedbackSystem();
  readonly presentation = new PresentationRuntime('high');
  readonly bossPresentation = new BossPresentationTracker();
  readonly killChainVfx = new KillChainVfxTracker();
  readonly fieldEvents = new FieldEventDirector();
  readonly legendaryEffects = new LegendaryEffectController();
  readonly runMissions = new RunMissionDirector();
  readonly battlefieldObjectives = new BattlefieldObjectiveDirector();
  readonly objectiveRuntime = new ObjectiveRuntime();
  readonly bossEncounter = new BossEncounterSystem();
  readonly bossArena = new BossArenaSystem();
  readonly comboRuntime = new ComboRuntime();
  readonly fusionRuntime = new FusionRuntime();
  readonly fateRuntime = new FateRuntime();
  private readonly decisionPickGuard = new DecisionPickGuard();
  private decisionSessionActive = false;
  private decisionReplay: ((generation: number) => void) | null = null;
  private onboarding = new OnboardingController(defaultOnboardingState());
  readonly levelUpOverlay: LevelUpOverlay;
  readonly shopOverlay: ShopOverlay;
  readonly heroSelectOverlay: HeroSelectOverlay;
  readonly resultsOverlay: ResultsOverlay;
  readonly lobbyOverlay: LobbyOverlay;
  readonly traitSelectOverlay: TraitSelectOverlay;
  readonly fateSelectOverlay: FateSelectOverlay;

  private queuedLevelUps = 0;
  private queuedBossRewards = 0;
  private equipmentState: EquipmentState = { coins: 0, weapon: null, armor: null, healingPotions: 1 };
  private shopOffers: ShopDisplayOffer[] = [];
  private shopImpactMessage = '';
  private damageReasonState: DamageReasonState | null = null;
  private rerollsThisVisit = 0;
  private nextShopTokenAt = SHOP_FIRST_TOKEN_AT;
  private catastrophe: Catastrophe | null = null;
  private lastCatastropheId: string | null = null;
  private catastropheBannerTimer = 0;
  private catastropheBannerTransitionProjection: CatastropheTransitionProjection | null = null;
  private kainOverload = 0;
  private heroMeter: HeroMeterState = createHeroMeterState('arkan');
  private goldenGoblinEnemyId: number | null = null;
  private supplyCrate: Vec2 | null = null;
  private eventToast = '';
  private eventToastTimer = 0;
  private eventToastLastLawId: MythicLastLawId | null = null;
  private eventToastMythicTacticArchetype: BossArchetype | null = null;
  private eventToastMythicPhase: MythicPhaseIdentityId | null = null;
  private eventToastBossArchetype: BossArchetype | null = null;
  private eventToastBossVariantTier: BossVariantTier | null = null;
  private eventToastApexSecondaryArchetype: BossArchetype | null = null;
  private eventToastBossWeakpointBreakArchetype: BossArchetype | null = null;
  private eventToastPerfectEvadeStreak: PerfectEvadeStreak | null = null;
  private eventToastAscensionMutator: AscensionMutatorIdentityId | null = null;
  private eventToastFatePath: FatePathId | null = null;
  private eventToastFateImpact: FateImpactVector | null = null;
  private eventToastOathKind: LongRunOathKind | null = null;
  private eventToastOathHelper: OathRequirementBoonIdentity | { boonId: OathBoonOutcomeIdentityId } | null = null;
  private eventToastContractFamily: ContractFamily | null = null;
  private eventToastContractBoonFamily: ContractFamily | null = null;
  private eventToastRelicResonance: { relicId: RelicId; tier: ActiveRelicResonanceTier } | null = null;
  private eventToastRelicProjection: { impactId: RelicResonanceImpactIdentityId; tierId: RelicResonanceTierIdentityId } | null = null;
  private eventToastNemesisAdaptations: BossAdaptation[] = [];
  private eventToastWorldEvolution: WorldEvolutionIdentityId | null = null;
  private eventToastBossArenaMutation: BossArenaMutationKind | null = null;
  private eventToastHeroMeterId: HeroMeterIdentityId | null = null;
  private eventToastArcaneComboFamily: ArcaneComboIdentityId | null = null;
  private eventToastTacticalStatusIconId: TacticalStatusIconId | null = null;
  private eventToastBuildIdentityId: BuildIdentityId | null = null;
  private eventToastSynergyId: SynergyIdentityId | null = null;
  private eventToastLegendaryItemId: LegendaryAwakeningItemId | null = null;
  private eventToastSpellEvolution: { spellId: SpellId; tier: 1 | 2 } | null = null;
  private eventToastSpellEvolutionProjection: SpellEvolutionProjection | null = null;
  private eventToastRunTraitId: RunTraitId | null = null;
  private eventToastAscensionSelectionId: import('./endless/hero-ascension.js').HeroAscensionId | null = null;
  private eventToastHeroAscensionProjection: HeroAscensionProjection | null = null;
  private eventToastFusionProjection: FusionSelectionProjection | null = null;
  private eventToastBuildOverdriveProjection: BuildOverdriveEffectProjection | null = null;
  private eventToastBattlefieldEvolutionProjection: BattlefieldEvolutionImpactProjection | null = null;
  private eventToastAscensionTierProjection: AscensionTierOutcomeProjection | null = null;
  private eventToastObjectiveRewards: ObjectiveReward[] = [];
  private eventToastObjectiveRewardMultiplier = 1;
  private eventToastMissionReward: RunMissionReward | null = null;
  private eventToastFieldEventId: FieldEventId | null = null;
  private runFoundationIdentityInitialized = false;
  private lastRunFoundationTrait: RunTraitId | null = null;
  private synergyIdentityInitialized = false;
  private lastSynergyIdentityIds: SynergyId[] = [];
  private lastRelicResonanceRelic: RelicId | null = null;
  private lastRelicResonanceTier: 0|1|2|3 = 0;
  private metaProfile: MetaProfile = defaultMetaProfile();
  private masteryProfile: MasteryProfile = defaultMasteryProfile();
  private threatProfile: ThreatProfile = defaultThreatProfile();
  private runThreatLevel: ThreatLevel = 0;
  private runRecords: RunRecordsState = defaultRunRecords();
  private audioSettings: AudioSettings = defaultAudioSettings();
  private resumeSnapshot: RunSnapshot | null = null;
  private nextSnapshotAt = 15;
  private nextRecoveryJournalAt = 60;
  private currentRunBlueprint: RetryBlueprint | null = null;
  private currentReplayPlan: BuildReplayPlan | null = null;
  readonly audio = new ArcaneAudio(this.audioSettings);
  private readonly seenBossIds = new Set<number>();
  private readonly bossPressureRatioById = new Map<number, number>();
  private selectedTrait: RunTraitId | null = null;
  private runGoldMultiplier = 1;
  private runHeroDamageTakenMultiplier = 1;
  private runCoreDamageTakenMultiplier = 1;
  private activeRelic: RelicId | null = null;
  private pendingBossArchetype: BossArchetype | null = null;
  private eliteKills = 0;
  private objectivePowerTimer = 0;
  private timeWarpTimer = 0;
  private timeWarpCooldownMultiplier = 1;
  private bossEncounterNodesDestroyed = 0;
  private lastBossEncounterDestroyedNodes = 0;
  private threatDirective: ThreatDirective | null = null;
  private dangerState: DangerUiState = dangerUiState(1, 1);
  private bossWarningHapticActive = false;
  private readonly hapticArbiter = new CombatHapticArbiter();
  private presentationSettings: PresentationSettings = loadPresentationSettings(this.storage);
  private bossPhaseCue: BossPhaseCue | null = null;
  private bossPhaseCueTimer = 0;
  private killChainCue: KillChainVfxCue | null = null;
  private killChainCueTimer = 0;
  private mapVfxAccumulator = 0;
  private mapVfxSequence = 0;
  private battlefieldEnvironmentReactionVfx: Array<{mapId: import('./map-layouts.js').MapId; kind: BattlefieldEnvironmentReactionKind; x:number; y:number; size:number; ttl:number; maxTtl:number}> = [];
  private lastRenderClock = 0;
  private smoothedFps = 60;
  private vfxQualityTransition: VfxQualityTransitionState = createVfxQualityTransition('high');
  private thermalRecoveryState: ThermalRecoveryState = createThermalRecoveryState();
  private presentationControls: HTMLDivElement | null = null;
  private readonly actionReadyState: Partial<Record<import('./config.js').ActionId, boolean>> = {};
  private readonly ultimatePulseUntil: Partial<Record<import('./config.js').ActionId, number>> = {};
  private actionIconAtlasImage: HTMLImageElement | null = null;
  private actionIconAtlasReady = false;
  private heroAbilityIconAtlasImage: HTMLImageElement | null = null;
  private heroAbilityIconAtlasReady = false;
  private spellEvolutionCrestAtlasImage: HTMLImageElement | null = null;
  private spellEvolutionCrestAtlasReady = false;
  private spellEvolutionModifierIdentityAtlasImage: HTMLImageElement | null = null;
  private spellEvolutionModifierIdentityAtlasReady = false;
  private heroBattleSpriteAtlasImage: HTMLImageElement | null = null;
  private heroBattleSpriteAtlasReady = false;
  private heroMotionRenderAtlasImage: HTMLImageElement | null = null;
  private heroMotionRenderAtlasReady = false;
  private heroCastRenderAtlasImage: HTMLImageElement | null = null;
  private heroCastRenderAtlasReady = false;
  private heroRenderMotionBlend = 0;
  private heroRenderStride = 0;
  private heroRenderTurnTilt = 0;
  private heroRenderRecoveryBlend = 0;
  private heroRenderLastMoving = false;
  private heroRenderPreviousFacing: Vec2 = { x: 1, y: 0 };
  private heroCastRenderCast = 0;
  private heroCastRenderRecover = 0;
  private heroCastCadenceState: HeroCastCadenceState = { chain:0, bridge:0, pulse:0 };
  private heroCastAimHoldState: HeroCastAimHoldState = createHeroCastAimHoldState();
  private heroBodyFacingHysteresisState: HeroBodyFacingHysteresisState = createHeroBodyFacingHysteresisState();
  private heroBodyFacingHysteresisLastAt = -99;
  private heroActionTransitionState: HeroActionTransitionState = { hit:0, cast:0, evade:0, bridge:0, last:'neutral' };
  private heroUltimateBodyState: HeroUltimateBodyState = { kind:null, elapsed:0 };
  private heroUltimateAimContinuityState: HeroUltimateAimContinuityState = createHeroUltimateAimContinuityState();
  private heroUltimateActionHandoffState: HeroUltimateActionHandoffState = { normalCast:0 };
  private heroRenderKinematicState: HeroKinematicRenderState = createHeroKinematicRenderState();
  private heroRenderHitRecoil = 0;
  private heroCrisisGroundSettleState: HeroCrisisGroundSettleState = { impact:0, settle:0 };
  private heroLastRenderedBodyOffset: Vec2 = { x:0, y:0 };
  private heroLastRenderedActionFacing: Vec2 = { x:1, y:0 };
  private heroLastRenderedActionPoseStrength = 0;
  private heroLastRenderedActionOwner: 'movement'|'cast'|'ultimate'|'recovery' = 'movement';
  private heroProjectileVfxAtlasImage: HTMLImageElement | null = null;
  private heroProjectileVfxAtlasReady = false;
  private heroResponseVfxAtlasImage: HTMLImageElement | null = null;
  private heroResponseVfxAtlasReady = false;
  private heroResponseVfx: Array<{kind:HeroResponseVfxKind;x:number;y:number;ttl:number;maxTtl:number}> = [];
  private heroUltimateSignatureVfxAtlasImage: HTMLImageElement | null = null;
  private heroUltimateSignatureVfxAtlasReady = false;
  private heroSpellSignatureVfxAtlasImage: HTMLImageElement | null = null;
  private heroSpellSignatureVfxAtlasReady = false;
  private enemyCombatVfxAtlasImage: HTMLImageElement | null = null;
  private enemyCombatVfxAtlasReady = false;
  private enemyDeathImageBursts: Array<{x:number;y:number;type:Exclude<EnemyType,'boss'>;startedAt:number;until:number}> = [];
  private enemyDefeatBodyTransitions: Array<{death:EnemyDeathEvent&{type:Exclude<EnemyType,'boss'>};startedAt:number;until:number}> = [];
  private enemySpriteAtlasImage: HTMLImageElement | null = null;
  private enemySpriteAtlasReady = false;
  private eliteAffixIdentityAtlasImage: HTMLImageElement | null = null;
  private eliteAffixIdentityAtlasReady = false;
  private specialistIntentAtlasImage: HTMLImageElement | null = null;
  private specialistIntentAtlasReady = false;
  private specialistCombatVfxAtlasImage: HTMLImageElement | null = null;
  private specialistCombatVfxAtlasReady = false;
  private bossWeakpointIdentityAtlasImage: HTMLImageElement | null = null;
  private bossWeakpointWorldVfxAtlasImage: HTMLImageElement | null = null;
  private bossWeakpointWorldVfxAtlasReady = false;
  private bossWeakpointBreakWorldVfx: Array<{kind:BossWeakpointWorldVfxKind;x:number;y:number;ttl:number;maxTtl:number}> = [];
  private bossWeakpointIdentityAtlasReady = false;
  private bossWeakpointBreakIdentityAtlasImage: HTMLImageElement | null = null;
  private bossWeakpointBreakIdentityAtlasReady = false;
  private bossCounterplayBenefitIdentityAtlasImage: HTMLImageElement | null = null;
  private bossCounterplayBenefitIdentityAtlasReady = false;
  private bossPhase2EscalationAtlasImage: HTMLImageElement | null = null;
  private bossPhase2EscalationAtlasReady = false;
  private bossPhase3EnrageAtlasImage: HTMLImageElement | null = null;
  private bossPhase3EnrageAtlasReady = false;
  private bossVariantPressureAtlasImage: HTMLImageElement | null = null;
  private bossVariantPressureAtlasReady = false;
  private apexSecondaryPatternAtlasImage: HTMLImageElement | null = null;
  private apexSecondaryPatternAtlasReady = false;
  private bossArenaHazardIdentityAtlasImage: HTMLImageElement | null = null;
  private bossArenaLifecycleVfxAtlasImage: HTMLImageElement | null = null;
  private bossArenaLifecycleVfxAtlasReady = false;
  private bossArenaHazardIdentityAtlasReady = false;
  private bossArchetypeIdentityAtlasImage: HTMLImageElement | null = null;
  private bossArchetypeIdentityAtlasReady = false;
  private bossSpecialIntentAtlasImage: HTMLImageElement | null = null;
  private bossSpecialIntentAtlasReady = false;
  private bossResponseAckIdentityAtlasImage: HTMLImageElement | null = null;
  private bossResponseAckIdentityAtlasReady = false;
  private perfectEvadeIdentityAtlasImage: HTMLImageElement | null = null;
  private perfectEvadeIdentityAtlasReady = false;
  private damageSourceIdentityAtlasImage: HTMLImageElement | null = null;
  private damageSourceIdentityAtlasReady = false;
  private fieldNodeIdentityAtlasImage: HTMLImageElement | null = null;
  private fieldNodeIdentityAtlasReady = false;
  private worldEvolutionIdentityAtlasImage: HTMLImageElement | null = null;
  private worldEvolutionIdentityAtlasReady = false;
  private catastropheIdentityAtlasImage: HTMLImageElement | null = null;
  private catastropheIdentityAtlasReady = false;
  private catastropheTransitionIdentityAtlasImage: HTMLImageElement | null = null;
  private catastropheTransitionIdentityAtlasReady = false;
  private mythicLastLawIdentityAtlasImage: HTMLImageElement | null = null;
  private mythicLastLawIdentityAtlasReady = false;
  private mythicTacticIdentityAtlasImage: HTMLImageElement | null = null;
  private mythicTacticIdentityAtlasReady = false;
  private mythicPhaseIdentityAtlasImage: HTMLImageElement | null = null;
  private mythicPhaseIdentityAtlasReady = false;
  private mythicArenaGeometryIdentityAtlasImage: HTMLImageElement | null = null;
  private mythicArenaGeometryIdentityAtlasReady = false;
  private mythicSafeZoneLifecycleIdentityAtlasImage: HTMLImageElement | null = null;
  private mythicSafeZoneLifecycleIdentityAtlasReady = false;
  private mythicSafeZonePressureEffectIdentityAtlasImage: HTMLImageElement | null = null;
  private mythicSafeZonePressureEffectIdentityAtlasReady = false;
  private safeZoneTransitionDirectionAtlasImage: HTMLImageElement | null = null;
  private safeZoneTransitionDirectionAtlasReady = false;
  private ascensionMutatorIdentityAtlasImage: HTMLImageElement | null = null;
  private ascensionMutatorIdentityAtlasReady = false;
  private nemesisAdaptationIdentityAtlasImage: HTMLImageElement | null = null;
  private nemesisAdaptationIdentityAtlasReady = false;
  private nemesisAdaptationEffectIdentityAtlasImage: HTMLImageElement | null = null;
  private nemesisAdaptationEffectIdentityAtlasReady = false;
  private bossArenaMutationIdentityAtlasImage: HTMLImageElement | null = null;
  private bossArenaMutationIdentityAtlasReady = false;
  private decisionPathIconAtlasImage: HTMLImageElement | null = null;
  private decisionPathIconAtlasReady = false;
  private bossSpriteAtlasImage: HTMLImageElement | null = null;
  private bossSpriteAtlasReady = false;
  private bossSignatureVfxAtlasImage: HTMLImageElement | null = null;
  private bossSignatureVfxAtlasReady = false;
  private bossSpecialCombatVfxAtlasImage: HTMLImageElement | null = null;
  private bossSpecialCombatVfxAtlasReady = false;
  private bossPhaseOverlayVfxAtlasImage: HTMLImageElement | null = null;
  private bossPhaseOverlayVfxAtlasReady = false;
  private bossSignatureEntranceBossId: number | null = null;
  private bossSignatureEntranceUntil = 0;
  private tacticalStatusIconAtlasImage: HTMLImageElement | null = null;
  private tacticalStatusIconAtlasReady = false;
  private objectiveActionIdentityAtlasImage: HTMLImageElement | null = null;
  private objectiveActionIdentityAtlasReady = false;
  private objectiveRewardIdentityAtlasImage: HTMLImageElement | null = null;
  private objectiveRewardIdentityAtlasReady = false;
  private runMissionPaceIdentityAtlasImage: HTMLImageElement | null = null;
  private runMissionPaceIdentityAtlasReady = false;
  private runContractBoonEffectIdentityAtlasImage: HTMLImageElement | null = null;
  private runContractBoonEffectIdentityAtlasReady = false;
  private oathRequirementIdentityAtlasImage: HTMLImageElement | null = null;
  private oathRequirementIdentityAtlasReady = false;
  private oathBoonOutcomeIdentityAtlasImage: HTMLImageElement | null = null;
  private oathBoonOutcomeIdentityAtlasReady = false;
  private relicResonanceImpactIdentityAtlasImage: HTMLImageElement | null = null;
  private relicResonanceImpactIdentityAtlasReady = false;
  private relicResonanceTierIdentityAtlasImage: HTMLImageElement | null = null;
  private relicResonanceTierIdentityAtlasReady = false;
  private heroAscensionModifierIdentityAtlasImage: HTMLImageElement | null = null;
  private heroAscensionModifierIdentityAtlasReady = false;
  private heroAscensionBuildDirectionAtlasImage: HTMLImageElement | null = null;
  private heroAscensionBuildDirectionAtlasReady = false;
  private fusionModifierIdentityAtlasImage: HTMLImageElement | null = null;
  private fusionModifierIdentityAtlasReady = false;
  private fusionComponentRelationAtlasImage: HTMLImageElement | null = null;
  private fusionComponentRelationAtlasReady = false;
  private fateBenefitVectorAtlasImage: HTMLImageElement | null = null;
  private fateBenefitVectorAtlasReady = false;
  private fateCostVectorAtlasImage: HTMLImageElement | null = null;
  private fateCostVectorAtlasReady = false;
  private fieldEventResponseIdentityAtlasImage: HTMLImageElement | null = null;
  private fieldEventResponseIdentityAtlasReady = false;
  private fieldEventEffectProfileIdentityAtlasImage: HTMLImageElement | null = null;
  private fieldEventEffectProfileIdentityAtlasReady = false;
  private buildIdentityAtlasImage: HTMLImageElement | null = null;
  private buildIdentityAtlasReady = false;
  private buildOverdriveEffectAtlasImage: HTMLImageElement | null = null;
  private buildOverdriveEffectAtlasReady = false;
  private heroMeterIdentityAtlasImage: HTMLImageElement | null = null;
  private heroMeterIdentityAtlasReady = false;
  private arcaneComboIdentityAtlasImage: HTMLImageElement | null = null;
  private arcaneComboIdentityAtlasReady = false;
  private synergyIdentityAtlasImage: HTMLImageElement | null = null;
  private synergyIdentityAtlasReady = false;
  private legendaryAwakeningAtlasImage: HTMLImageElement | null = null;
  private legendaryAwakeningAtlasReady = false;
  private finalFormIdentityAtlasImage: HTMLImageElement | null = null;
  private finalFormIdentityAtlasReady = false;
  private battlefieldPropVfxAtlasImage: HTMLImageElement | null = null;
  private battlefieldPropVfxAtlasReady = false;
  private battlefieldObstacleStateVfxAtlasImage: HTMLImageElement | null = null;
  private battlefieldObstacleStateVfxAtlasReady = false;
  private battlefieldInteractionVfxAtlasImage: HTMLImageElement | null = null;
  private battlefieldInteractionVfxAtlasReady = false;
  private pickupFlowVfxAtlasImage: HTMLImageElement | null = null;
  private pickupFlowVfxAtlasReady = false;
  private spawnPressureVfxAtlasImage: HTMLImageElement | null = null;
  private spawnPressureVfxAtlasReady = false;
  private survivalResponseVfxAtlasImage: HTMLImageElement | null = null;
  private survivalResponseVfxAtlasReady = false;
  private survivalResponseVfx: Array<{kind:SurvivalResponseVfxKind;x:number;y:number;ttl:number;maxTtl:number;worldGuardOwned?:boolean;mitigationRatio?:number;worldDamageOwned?:boolean;damageSource?:string;mixedPressure?:boolean;pressureVector?:Vec2}> = [];
  private survivalResponseLastAt: Partial<Record<SurvivalResponseVfxKind,number>> = {};
  private coreGuardDamageSourceHysteresisState:CoreGuardDamageSourceHysteresisState=createCoreGuardDamageSourceHysteresisState();
  private coreGuardDamageSourceLastAt=-99;
  private coreGuardPressureVectorHysteresisState:CoreGuardPressureVectorHysteresisState=createCoreGuardPressureVectorHysteresisState();
  private coreGuardPressureVectorLastAt=-99;
  private observedCoreHpForVfx = this.core.hp;
  private freezeControlVfxAtlasImage: HTMLImageElement | null = null;
  private freezeControlVfxAtlasReady = false;
  private freezeShatterVfx: Array<{enemyClass:FreezeControlVfxClass;x:number;y:number;ttl:number;maxTtl:number}> = [];
  private regularEnemyActionVfxAtlasImage: HTMLImageElement | null = null;
  private regularEnemyActionVfxAtlasReady = false;
  private eliteAffixLifecycleVfxAtlasImage: HTMLImageElement | null = null;
  private eliteAffixLifecycleVfxAtlasReady = false;
  private enemyTargetPressureVfxAtlasImage: HTMLImageElement | null = null;
  private enemyTargetPressureVfxAtlasReady = false;
  private finalFormWorldVfxAtlasImage: HTMLImageElement | null = null;
  private finalFormWorldVfxAtlasReady = false;
  private finalFormWorldVfx: Array<{formId:HeroFinalFormId;state:FinalFormWorldVfxState;x:number;y:number;size:number;ttl:number;maxTtl:number}> = [];
  private fusionWorldVfxAtlasImage: HTMLImageElement | null = null;
  private fusionWorldVfxAtlasReady = false;
  private fusionWorldVfx: Array<{fusionId:FusionId;x:number;y:number;ttl:number;maxTtl:number}> = [];
  private heroMeterWorldVfxAtlasImage: HTMLImageElement | null = null;
  private heroMeterWorldVfxAtlasReady = false;
  private heroMeterWorldVfx: Array<{heroId:HeroId;x:number;y:number;ttl:number;maxTtl:number}> = [];
  private bossProjectileLifecycleVfxAtlasImage: HTMLImageElement | null = null;
  private bossProjectileLifecycleVfxAtlasReady = false;
  private persistentSpellZoneVfxAtlasImage: HTMLImageElement | null = null;
  private persistentSpellZoneVfxAtlasReady = false;
  private crystalInteractionLifecycleVfxAtlasImage: HTMLImageElement | null = null;
  private crystalInteractionLifecycleVfxAtlasReady = false;
  private crystalInteractionLifecycleVfx: Array<{mapId:import('./map-layouts.js').MapId;x:number;y:number;size:number;ttl:number;maxTtl:number}> = [];
  private bossPhaseAftermathVfxAtlasImage: HTMLImageElement | null = null;
  private bossPhaseAftermathVfxAtlasReady = false;
  private bossPhaseTransitionVfx: Array<{archetype:BossArchetype;phase:2|3;x:number;y:number;ttl:number;maxTtl:number}> = [];
  private specialistReactionLifecycleVfxAtlasImage: HTMLImageElement | null = null;
  private specialistReactionLifecycleVfxAtlasReady = false;
  private mapEvolutionAftermathVfxAtlasImage: HTMLImageElement | null = null;
  private mapEvolutionAftermathVfxAtlasReady = false;
  private mapEvolutionAftermathVfx: Array<{mapId:import('./map-layouts.js').MapId;stage:1|2;x:number;y:number;size:number;ttl:number;maxTtl:number}> = [];
  private bossHazardAftermathVfxAtlasImage: HTMLImageElement | null = null;
  private bossHazardAftermathVfxAtlasReady = false;
  private bossHazardAftermathVfx: Array<{kind:import('./boss-arena.js').BossArenaHazardKind;x:number;y:number;radius:number;ttl:number;maxTtl:number;geometryShape?:import('./endless/mythic-arena-geometry.js').MythicArenaGeometryShape;angle?:number;length?:number}> = [];
  private bossHazardClearedGroundMemory: Array<{kind:import('./boss-arena.js').BossArenaHazardKind;x:number;y:number;radius:number;ttl:number;maxTtl:number;geometryShape?:import('./endless/mythic-arena-geometry.js').MythicArenaGeometryShape;angle?:number;length?:number}> = [];
  private currentMythicSafeLanePresentation: {target:Vec2;confidence:number;forecastTarget?:Vec2;forecastUrgency?:number;forecastTransitionMs?:number}|null = null;
  private safeLaneForecastPromotionHysteresisState:SafeLaneForecastPromotionHysteresisState=createSafeLaneForecastPromotionHysteresisState();
  private safeLaneAttentionRecoveryHysteresisState:SafeLaneAttentionRecoveryHysteresisState=createSafeLaneAttentionRecoveryHysteresisState();
  private safeLaneAttentionRecoveryLastAt=-99;
  private safeLaneHazardOcclusionRecoveryState:SafeLaneHazardOcclusionRecoveryState=createSafeLaneHazardOcclusionRecoveryState();
  private safeLaneGapFeatherHysteresisState:SafeLaneGapFeatherHysteresisState=createSafeLaneGapFeatherHysteresisState();
  private safeLaneHazardOcclusionRecoveryLastAt=-99;
  private enemyFinisherVfxAtlasImage: HTMLImageElement | null = null;
  private enemyFinisherVfxAtlasReady = false;
  private enemyFinisherVfx: Array<{source:EnemyDeathVisualSource;x:number;y:number;enemyType:EnemyType;tier:import('./enemy-hit-death-transition-rendering.js').EnemyHitDeathTier;ttl:number;maxTtl:number}> = [];
  private heroCrisisVfxAtlasImage: HTMLImageElement | null = null;
  private heroCrisisVfxAtlasReady = false;
  private heroCrisisVfx: Array<{heroId:HeroId;state:HeroCrisisVfxState;x:number;y:number;ttl:number;maxTtl:number}> = [];
  private lastHeroCrisisHpRatio = 1;
  private perfectEvadeTrailVfxAtlasImage: HTMLImageElement | null = null;
  private perfectEvadeTrailVfxAtlasReady = false;
  private perfectEvadeTrailVfx: Array<{heroId:HeroId;x:number;y:number;dirX:number;dirY:number;ttl:number;maxTtl:number}> = [];
  private crowdControlPropagationVfxAtlasImage: HTMLImageElement | null = null;
  private crowdControlPropagationVfxAtlasReady = false;
  private bossCounterplayRewardVfxAtlasImage: HTMLImageElement | null = null;
  private bossCounterplayRewardVfxAtlasReady = false;
  private bossCounterplayRewardBurstVfx: Array<{archetype:BossArchetype;x:number;y:number;ttl:number;maxTtl:number}> = [];
  private objectiveCompletionCeremonyVfxAtlasImage: HTMLImageElement | null = null;
  private objectiveCompletionCeremonyVfxAtlasReady = false;
  private objectiveCompletionCeremonyVfx: Array<{objectiveId:import('./battlefield-objectives.js').BattlefieldObjectiveId;x:number;y:number;rewardCount:number;ttl:number;maxTtl:number}> = [];
  private ultimatePostImpactResidueVfxAtlasImage: HTMLImageElement | null = null;
  private ultimatePostImpactResidueVfxAtlasReady = false;
  private mapSafeLaneTransitionVfxAtlasImage: HTMLImageElement | null = null;
  private mapSafeLaneTransitionVfxAtlasReady = false;
  private objectiveActivationMaterializationVfxAtlasImage: HTMLImageElement | null = null;
  private objectiveActivationMaterializationVfxAtlasReady = false;
  private objectiveActivationMaterializationVfx: Array<{objectiveId:import('./battlefield-objectives.js').BattlefieldObjectiveId;x:number;y:number;ttl:number;maxTtl:number}> = [];
  private bossArenaTransitionWorldVfxAtlasImage: HTMLImageElement | null = null;
  private bossArenaTransitionWorldVfxAtlasReady = false;
  private bossArenaTransitionWorldVfx: Array<{archetype:BossArchetype;state:BossArenaTransitionWorldVfxState;x:number;y:number;radius:number;ttl:number;maxTtl:number}> = [];
  private mapCombatBoundaryWarningVfxAtlasImage: HTMLImageElement | null = null;
  private mapCombatBoundaryWarningVfxAtlasReady = false;
  private objectiveFailureDissolveVfxAtlasImage: HTMLImageElement | null = null;
  private objectiveFailureDissolveVfxAtlasReady = false;
  private objectiveFailureDissolveVfx: Array<{objectiveId:import('./battlefield-objectives.js').BattlefieldObjectiveId;x:number;y:number;ttl:number;maxTtl:number}> = [];
  private fieldEventLifecycleWorldVfxAtlasImage: HTMLImageElement | null = null;
  private fieldEventLifecycleWorldVfxAtlasReady = false;
  private fieldEventLifecycleWorldVfx: Array<{eventId:FieldEventId;state:FieldEventLifecycleWorldVfxState;x:number;y:number;ttl:number;maxTtl:number}> = [];
  private fieldEventWorldAnchor:{id:FieldEventId;x:number;y:number}|null=null;
  private elitePackApproachFormationVfxAtlasImage: HTMLImageElement | null = null;
  private elitePackApproachFormationVfxAtlasReady = false;
  private elitePackApproachFormationVfx:Array<{enemyIds:number[];target:import('./enemies.js').EnemyTarget;ttl:number;maxTtl:number}> = [];
  private activeWorldVfxPriorityPolicy:WorldVfxPriorityPolicy=worldVfxPriorityPolicy('normal','high');
  private activeWorldVfxOccupancyPolicy:WorldVfxOccupancyResult=resolveWorldVfxOccupancy({quality:'high',combatPrimary:'normal',viewportArea:LOGICAL_WIDTH*LOGICAL_HEIGHT,candidates:[]});
  private battlefieldEnvironmentAtlasImage: HTMLImageElement | null = null;
  private battlefieldEnvironmentAtlasReady = false;
  private battlefieldAtmosphereVfxAtlasImage: HTMLImageElement | null = null;
  private battlefieldAtmosphereVfxAtlasReady = false;
  private battlefieldDepthOverlayAtlasImage: HTMLImageElement | null = null;
  private battlefieldDepthOverlayAtlasReady = false;
  private battlefieldEnvironmentReactionVfxAtlasImage: HTMLImageElement | null = null;
  private battlefieldEnvironmentReactionVfxAtlasReady = false;
  private battlefieldMechanicAtlasImage: HTMLImageElement | null = null;
  private battlefieldMechanicAtlasReady = false;
  private ascensionTierPressureAtlasImage: HTMLImageElement | null = null;
  private ascensionTierPressureAtlasReady = false;
  private deepRunDecisionIdentityAtlasImage: HTMLImageElement | null = null;
  private deepRunDecisionIdentityAtlasReady = false;
  private finalFormIdentityCueId: import('./endless/final-form.js').HeroFinalFormId | null = null;
  private finalFormIdentityCueUntil = 0;
  private endlessState: ExtensionSnapshotV2 = createDefaultEndlessState();
  private readonly frameEndlessEvents: GameplayEvent[] = [];
  private endlessBossStartedAt = 0;
  private endlessBossCoreHpAtStart = 0;
  private endlessBossKey: string | null = null;
  private mythicLastLawBossId: number | null = null;
  private mythicPhaseBossId: number | null = null;
  private lastMythicPhase: 0|1|2|3 = 0;
  private finalFormMotion: Vec2 = { x: 0, y: 0 };
  private finalFormFlow: FinalFormFlowState = createDefaultFinalFormFlowState();
  private lastOpeningWaveBeatId: OpeningWaveBeatId | null = null;
  private lastOpeningBossEntranceStage: OpeningBossEntranceStage = null;
  private arenaDodgeTracker: ArenaDodgeTracker = createArenaDodgeTracker();
  private arenaDodgeChain: ArenaDodgeChainState = createArenaDodgeChain();
  private safeLaneLink: SafeLaneLinkState = createSafeLaneLink();
  private arenaEvadeBoostUntilMs = 0;
  private arenaEvadeMoveMultiplier = 1;
  private flowImpactTimer = 0;
  private mythicTacticBoostUntilMs = 0;
  private mythicTacticBossDamageMultiplier = 1;
  private mythicTacticAttackLink: MythicTacticAttackLink | null = null;
  private recentGoldPerMinute = 0;
  private rewardRateWindowStartedAt = 0;
  private rewardRateWindowStartGold = 0;

  private readonly ctx: CanvasRenderingContext2D;
  private readonly loop: FixedGameLoop;

  constructor(readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    this.ctx = ctx;
    this.initializeActionIconAtlas();
    this.initializeHeroAbilityIconAtlas();
    this.initializeSpellEvolutionCrestAtlas();
    this.initializeSpellEvolutionModifierIdentityAtlas();
    this.initializeHeroBattleSpriteAtlas();
    this.initializeHeroMotionRenderAtlas();
    this.initializeHeroCastRenderAtlas();
    this.initializeHeroResponseVfxAtlas();
    this.initializeHeroProjectileVfxAtlas();
    this.initializeHeroUltimateSignatureVfxAtlas();
    this.initializeHeroSpellSignatureVfxAtlas();
    this.initializeEnemyCombatVfxAtlas();
    this.initializeEnemySpriteAtlas();
    this.initializeEliteAffixIdentityAtlas();
    this.initializeSpecialistIntentAtlas();
    this.initializeSpecialistCombatVfxAtlas();
    this.initializeBossWeakpointIdentityAtlas();
    this.initializeBossWeakpointWorldVfxAtlas();
    this.initializeBossWeakpointBreakIdentityAtlas();
    this.initializeBossCounterplayBenefitIdentityAtlas();
    this.initializeBossPhase2EscalationAtlas();
    this.initializeBossPhase3EnrageAtlas();
    this.initializeBossVariantPressureAtlas();
    this.initializeApexSecondaryPatternAtlas();
    this.initializeBossArenaHazardIdentityAtlas();
    this.initializeBossArenaLifecycleVfxAtlas();
    this.initializeBossArchetypeIdentityAtlas();
    this.initializeBossSpecialIntentAtlas();
    this.initializeBossResponseAckIdentityAtlas();
    this.initializePerfectEvadeIdentityAtlas();
    this.initializeDamageSourceIdentityAtlas();
    this.initializeFieldNodeIdentityAtlas();
    this.initializeWorldEvolutionIdentityAtlas();
    this.initializeCatastropheIdentityAtlas();
    this.initializeCatastropheTransitionIdentityAtlas();
    this.initializeMythicLastLawIdentityAtlas();
    this.initializeMythicTacticIdentityAtlas();
    this.initializeMythicPhaseIdentityAtlas();
    this.initializeMythicArenaGeometryIdentityAtlas();
    this.initializeMythicSafeZoneLifecycleIdentityAtlas();
    this.initializeMythicSafeZonePressureEffectIdentityAtlas();
    this.initializeSafeZoneTransitionDirectionAtlas();
    this.initializeAscensionMutatorIdentityAtlas();
    this.initializeNemesisAdaptationIdentityAtlas();
    this.initializeNemesisAdaptationEffectIdentityAtlas();
    this.initializeBossArenaMutationIdentityAtlas();
    this.initializeDecisionPathIconAtlas();
    this.initializeBossSpriteAtlas();
    this.initializeBossSignatureVfxAtlas();
    this.initializeBossSpecialCombatVfxAtlas();
    this.initializeBossPhaseOverlayVfxAtlas();
    this.initializeTacticalStatusIconAtlas();
    this.initializeObjectiveActionIdentityAtlas();
    this.initializeObjectiveRewardIdentityAtlas();
    this.initializeRunMissionPaceIdentityAtlas();
    this.initializeRunContractBoonEffectIdentityAtlas();
    this.initializeOathRequirementIdentityAtlas();
    this.initializeOathBoonOutcomeIdentityAtlas();
    this.initializeRelicResonanceImpactIdentityAtlas();
    this.initializeRelicResonanceTierIdentityAtlas();
    this.initializeHeroAscensionModifierIdentityAtlas();
    this.initializeHeroAscensionBuildDirectionAtlas();
    this.initializeFusionModifierIdentityAtlas();
    this.initializeFusionComponentRelationAtlas();
    this.initializeFateBenefitVectorAtlas();
    this.initializeFateCostVectorAtlas();
    this.initializeFieldEventResponseIdentityAtlas();
    this.initializeFieldEventEffectProfileIdentityAtlas();
    this.initializeBuildIdentityAtlas();
    this.initializeBuildOverdriveEffectAtlas();
    this.initializeHeroMeterIdentityAtlas();
    this.initializeArcaneComboIdentityAtlas();
    this.initializeSynergyIdentityAtlas();
    this.initializeLegendaryAwakeningAtlas();
    this.initializeFinalFormIdentityAtlas();
    this.initializeBattlefieldPropVfxAtlas();
    this.initializeBattlefieldObstacleStateVfxAtlas();
    this.initializeBattlefieldInteractionVfxAtlas();
    this.initializePickupFlowVfxAtlas();
    this.initializeSpawnPressureVfxAtlas();
    this.initializeSurvivalResponseVfxAtlas();
    this.initializeFreezeControlVfxAtlas();
    this.initializeRegularEnemyActionVfxAtlas();
    this.initializeEliteAffixLifecycleVfxAtlas();
    this.initializeEnemyTargetPressureVfxAtlas();
    this.initializeFinalFormWorldVfxAtlas();
    this.initializeFusionWorldVfxAtlas();
    this.initializeHeroMeterWorldVfxAtlas();
    this.initializeBossProjectileLifecycleVfxAtlas();
    this.initializePersistentSpellZoneVfxAtlas();
    this.initializeCrystalInteractionLifecycleVfxAtlas();
    this.initializeBossPhaseAftermathVfxAtlas();
    this.initializeSpecialistReactionLifecycleVfxAtlas();
    this.initializeMapEvolutionAftermathVfxAtlas();
    this.initializeBossHazardAftermathVfxAtlas();
    this.initializeEnemyFinisherVfxAtlas();
    this.initializeHeroCrisisVfxAtlas();
    this.initializePerfectEvadeTrailVfxAtlas();
    this.initializeCrowdControlPropagationVfxAtlas();
    this.initializeBossCounterplayRewardVfxAtlas();
    this.initializeObjectiveCompletionCeremonyVfxAtlas();
    this.initializeUltimatePostImpactResidueVfxAtlas();
    this.initializeMapSafeLaneTransitionVfxAtlas();
    this.initializeObjectiveActivationMaterializationVfxAtlas();
    this.initializeBossArenaTransitionWorldVfxAtlas();
    this.initializeMapCombatBoundaryWarningVfxAtlas();
    this.initializeObjectiveFailureDissolveVfxAtlas();
    this.initializeFieldEventLifecycleWorldVfxAtlas();
    this.initializeElitePackApproachFormationVfxAtlas();
    this.initializeBattlefieldEnvironmentAtlas();
    this.initializeBattlefieldAtmosphereVfxAtlas();
    this.initializeBattlefieldDepthOverlayAtlas();
    this.initializeBattlefieldEnvironmentReactionVfxAtlas();
    this.initializeBattlefieldMechanicAtlas();
    this.initializeAscensionTierPressureAtlas();
    this.initializeDeepRunDecisionIdentityAtlas();
    this.metaProfile = this.loadStoredMetaProfile();
    this.masteryProfile = this.loadStoredMasteryProfile();
    this.threatProfile = this.loadStoredThreatProfile();
    this.runRecords = this.loadStoredRunRecords();
    this.audioSettings = this.loadStoredAudioSettings();
    this.resumeSnapshot = this.loadStoredRunSnapshot();
    this.audio.settings = this.audioSettings;
    this.input = new InputState(canvas);
    this.enemies.feedback = this.feedback;
    const uiParent = canvas.parentElement ?? document.body;
    this.levelUpOverlay = new LevelUpOverlay(uiParent);
    this.shopOverlay = new ShopOverlay(uiParent);
    this.heroSelectOverlay = new HeroSelectOverlay(uiParent);
    this.resultsOverlay = new ResultsOverlay(uiParent);
    this.lobbyOverlay = new LobbyOverlay(uiParent);
    this.traitSelectOverlay = new TraitSelectOverlay(uiParent);
    this.fateSelectOverlay = new FateSelectOverlay(uiParent);
    this.presentationControls = this.createPresentationControls(uiParent);
    this.loop = new FixedGameLoop((dt) => this.update(dt), () => this.render());
    this.onboarding = new OnboardingController(this.loadStoredOnboardingState());
    this.restart();
  }

  start(): void { this.loop.start(); }
  stop(): void { this.loop.stop(); }

  private initializeActionIconAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.actionIconAtlasReady = true; };
    image.onerror = () => { this.actionIconAtlasReady = false; };
    image.src = ACTION_ICON_ATLAS.src;
    this.actionIconAtlasImage = image;
  }

  private initializeHeroAbilityIconAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.heroAbilityIconAtlasReady = true; };
    image.onerror = () => { this.heroAbilityIconAtlasReady = false; };
    image.src = HERO_ABILITY_IDENTITY_ATLAS.src;
    this.heroAbilityIconAtlasImage = image;
  }

  private initializeSpellEvolutionCrestAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.spellEvolutionCrestAtlasReady = true; };
    image.onerror = () => { this.spellEvolutionCrestAtlasReady = false; };
    image.src = SPELL_EVOLUTION_CREST_ATLAS.src;
    this.spellEvolutionCrestAtlasImage = image;
  }

  private initializeSpellEvolutionModifierIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.spellEvolutionModifierIdentityAtlasReady = true; };
    image.onerror = () => { this.spellEvolutionModifierIdentityAtlasReady = false; };
    image.src = SPELL_EVOLUTION_MODIFIER_IDENTITY_ATLAS.src;
    this.spellEvolutionModifierIdentityAtlasImage = image;
  }

  private initializeHeroBattleSpriteAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.heroBattleSpriteAtlasReady = true; };
    image.onerror = () => { this.heroBattleSpriteAtlasReady = false; };
    image.src = HERO_BATTLE_SPRITE_ATLAS.src;
    this.heroBattleSpriteAtlasImage = image;
  }

  private initializeHeroMotionRenderAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.heroMotionRenderAtlasReady = true; };
    image.onerror = () => { this.heroMotionRenderAtlasReady = false; };
    image.src = HERO_MOTION_RENDER_ATLAS.src;
    this.heroMotionRenderAtlasImage = image;
  }

  private initializeHeroCastRenderAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.heroCastRenderAtlasReady = true; };
    image.onerror = () => { this.heroCastRenderAtlasReady = false; };
    image.src = HERO_CAST_RENDER_ATLAS.src;
    this.heroCastRenderAtlasImage = image;
  }

  private initializeHeroResponseVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.heroResponseVfxAtlasReady = true; };
    image.onerror = () => { this.heroResponseVfxAtlasReady = false; };
    image.src = HERO_RESPONSE_VFX_ATLAS.src; this.heroResponseVfxAtlasImage = image;
  }

  private initializeHeroProjectileVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.heroProjectileVfxAtlasReady = true; };
    image.onerror = () => { this.heroProjectileVfxAtlasReady = false; };
    image.src = HERO_PROJECTILE_VFX_ATLAS.src;
    this.heroProjectileVfxAtlasImage = image;
  }

  private initializeHeroUltimateSignatureVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.heroUltimateSignatureVfxAtlasReady = true; };
    image.onerror = () => { this.heroUltimateSignatureVfxAtlasReady = false; };
    image.src = HERO_ULTIMATE_SIGNATURE_VFX_ATLAS.src;
    this.heroUltimateSignatureVfxAtlasImage = image;
  }

  private initializeHeroSpellSignatureVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.heroSpellSignatureVfxAtlasReady = true; };
    image.onerror = () => { this.heroSpellSignatureVfxAtlasReady = false; };
    image.src = HERO_SPELL_SIGNATURE_VFX_ATLAS.src;
    this.heroSpellSignatureVfxAtlasImage = image;
  }

  private initializeEnemyCombatVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.enemyCombatVfxAtlasReady = true; };
    image.onerror = () => { this.enemyCombatVfxAtlasReady = false; };
    image.src = ENEMY_COMBAT_VFX_ATLAS.src;
    this.enemyCombatVfxAtlasImage = image;
  }

  private initializeEnemySpriteAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.enemySpriteAtlasReady = true; };
    image.onerror = () => { this.enemySpriteAtlasReady = false; };
    image.src = ENEMY_SPRITE_ATLAS.src;
    this.enemySpriteAtlasImage = image;
  }

  private initializeEliteAffixIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.eliteAffixIdentityAtlasReady = true; };
    image.onerror = () => { this.eliteAffixIdentityAtlasReady = false; };
    image.src = ELITE_AFFIX_IDENTITY_ATLAS.src;
    this.eliteAffixIdentityAtlasImage = image;
  }

  private initializeSpecialistIntentAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.specialistIntentAtlasReady = true; };
    image.onerror = () => { this.specialistIntentAtlasReady = false; };
    image.src = SPECIALIST_INTENT_ATLAS.src;
    this.specialistIntentAtlasImage = image;
  }

  private initializeSpecialistCombatVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.specialistCombatVfxAtlasReady = true; };
    image.onerror = () => { this.specialistCombatVfxAtlasReady = false; };
    image.src = SPECIALIST_COMBAT_VFX_ATLAS.src;
    this.specialistCombatVfxAtlasImage = image;
  }

  private initializeBossWeakpointIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.bossWeakpointIdentityAtlasReady = true; };
    image.onerror = () => { this.bossWeakpointIdentityAtlasReady = false; };
    image.src = BOSS_WEAKPOINT_IDENTITY_ATLAS.src;
    this.bossWeakpointIdentityAtlasImage = image;
  }

  private initializeBossWeakpointWorldVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.bossWeakpointWorldVfxAtlasReady = true; };
    image.onerror = () => { this.bossWeakpointWorldVfxAtlasReady = false; };
    image.src = BOSS_WEAKPOINT_WORLD_VFX_ATLAS.src; this.bossWeakpointWorldVfxAtlasImage = image;
  }

  private initializeBossWeakpointBreakIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.bossWeakpointBreakIdentityAtlasReady = true; };
    image.onerror = () => { this.bossWeakpointBreakIdentityAtlasReady = false; };
    image.src = BOSS_WEAKPOINT_BREAK_IDENTITY_ATLAS.src; this.bossWeakpointBreakIdentityAtlasImage = image;
  }

  private initializeBossCounterplayBenefitIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.bossCounterplayBenefitIdentityAtlasReady = true; };
    image.onerror = () => { this.bossCounterplayBenefitIdentityAtlasReady = false; };
    image.src = BOSS_COUNTERPLAY_BENEFIT_IDENTITY_ATLAS.src; this.bossCounterplayBenefitIdentityAtlasImage = image;
  }

  private initializeBossPhase2EscalationAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.bossPhase2EscalationAtlasReady = true; };
    image.onerror = () => { this.bossPhase2EscalationAtlasReady = false; };
    image.src = BOSS_PHASE2_ESCALATION_ATLAS.src; this.bossPhase2EscalationAtlasImage = image;
  }

  private initializeBossPhase3EnrageAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.bossPhase3EnrageAtlasReady = true; };
    image.onerror = () => { this.bossPhase3EnrageAtlasReady = false; };
    image.src = BOSS_PHASE3_ENRAGE_ATLAS.src; this.bossPhase3EnrageAtlasImage = image;
  }

  private initializeBossVariantPressureAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.bossVariantPressureAtlasReady = true; };
    image.onerror = () => { this.bossVariantPressureAtlasReady = false; };
    image.src = BOSS_VARIANT_PRESSURE_ATLAS.src; this.bossVariantPressureAtlasImage = image;
  }

  private initializeApexSecondaryPatternAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.apexSecondaryPatternAtlasReady = true; };
    image.onerror = () => { this.apexSecondaryPatternAtlasReady = false; };
    image.src = APEX_SECONDARY_PATTERN_ATLAS.src; this.apexSecondaryPatternAtlasImage = image;
  }

  private initializeBossArenaHazardIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.bossArenaHazardIdentityAtlasReady = true; };
    image.onerror = () => { this.bossArenaHazardIdentityAtlasReady = false; };
    image.src = BOSS_ARENA_HAZARD_IDENTITY_ATLAS.src; this.bossArenaHazardIdentityAtlasImage = image;
  }

  private initializeBossArenaLifecycleVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.bossArenaLifecycleVfxAtlasReady = true; };
    image.onerror = () => { this.bossArenaLifecycleVfxAtlasReady = false; };
    image.src = BOSS_ARENA_LIFECYCLE_VFX_ATLAS.src; this.bossArenaLifecycleVfxAtlasImage = image;
  }

  private initializeBossArchetypeIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.bossArchetypeIdentityAtlasReady = true; };
    image.onerror = () => { this.bossArchetypeIdentityAtlasReady = false; };
    image.src = BOSS_ARCHETYPE_IDENTITY_ATLAS.src; this.bossArchetypeIdentityAtlasImage = image;
  }

  private initializeBossSpecialIntentAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.bossSpecialIntentAtlasReady = true; };
    image.onerror = () => { this.bossSpecialIntentAtlasReady = false; };
    image.src = BOSS_SPECIAL_INTENT_ATLAS.src; this.bossSpecialIntentAtlasImage = image;
  }

  private initializeBossResponseAckIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.bossResponseAckIdentityAtlasReady = true; };
    image.onerror = () => { this.bossResponseAckIdentityAtlasReady = false; };
    image.src = BOSS_RESPONSE_ACK_IDENTITY_ATLAS.src; this.bossResponseAckIdentityAtlasImage = image;
  }

  private initializePerfectEvadeIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.perfectEvadeIdentityAtlasReady = true; };
    image.onerror = () => { this.perfectEvadeIdentityAtlasReady = false; };
    image.src = PERFECT_EVADE_IDENTITY_ATLAS.src; this.perfectEvadeIdentityAtlasImage = image;
  }

  private initializeDamageSourceIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.damageSourceIdentityAtlasReady = true; };
    image.onerror = () => { this.damageSourceIdentityAtlasReady = false; };
    image.src = DAMAGE_SOURCE_IDENTITY_ATLAS.src;
    this.damageSourceIdentityAtlasImage = image;
  }

  private initializeFieldNodeIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.fieldNodeIdentityAtlasReady = true; };
    image.onerror = () => { this.fieldNodeIdentityAtlasReady = false; };
    image.src = FIELD_NODE_IDENTITY_ATLAS.src;
    this.fieldNodeIdentityAtlasImage = image;
  }

  private initializeWorldEvolutionIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.worldEvolutionIdentityAtlasReady = true; };
    image.onerror = () => { this.worldEvolutionIdentityAtlasReady = false; };
    image.src = WORLD_EVOLUTION_IDENTITY_ATLAS.src;
    this.worldEvolutionIdentityAtlasImage = image;
  }

  private initializeCatastropheIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.catastropheIdentityAtlasReady = true; };
    image.onerror = () => { this.catastropheIdentityAtlasReady = false; };
    image.src = CATASTROPHE_IDENTITY_ATLAS.src;
    this.catastropheIdentityAtlasImage = image;
  }

  private initializeCatastropheTransitionIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.catastropheTransitionIdentityAtlasReady = true; };
    image.onerror = () => { this.catastropheTransitionIdentityAtlasReady = false; };
    image.src = CATASTROPHE_TRANSITION_IDENTITY_ATLAS.src;
    this.catastropheTransitionIdentityAtlasImage = image;
  }

  private initializeMythicLastLawIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.mythicLastLawIdentityAtlasReady = true; };
    image.onerror = () => { this.mythicLastLawIdentityAtlasReady = false; };
    image.src = MYTHIC_LAST_LAW_IDENTITY_ATLAS.src;
    this.mythicLastLawIdentityAtlasImage = image;
  }

  private initializeMythicTacticIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.mythicTacticIdentityAtlasReady = true; };
    image.onerror = () => { this.mythicTacticIdentityAtlasReady = false; };
    image.src = MYTHIC_TACTIC_IDENTITY_ATLAS.src;
    this.mythicTacticIdentityAtlasImage = image;
  }

  private initializeMythicPhaseIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.mythicPhaseIdentityAtlasReady = true; };
    image.onerror = () => { this.mythicPhaseIdentityAtlasReady = false; };
    image.src = MYTHIC_PHASE_IDENTITY_ATLAS.src;
    this.mythicPhaseIdentityAtlasImage = image;
  }

  private initializeMythicArenaGeometryIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.mythicArenaGeometryIdentityAtlasReady = true; };
    image.onerror = () => { this.mythicArenaGeometryIdentityAtlasReady = false; };
    image.src = MYTHIC_ARENA_GEOMETRY_IDENTITY_ATLAS.src; this.mythicArenaGeometryIdentityAtlasImage = image;
  }

  private initializeMythicSafeZoneLifecycleIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.mythicSafeZoneLifecycleIdentityAtlasReady = true; };
    image.onerror = () => { this.mythicSafeZoneLifecycleIdentityAtlasReady = false; };
    image.src = MYTHIC_SAFE_ZONE_LIFECYCLE_IDENTITY_ATLAS.src; this.mythicSafeZoneLifecycleIdentityAtlasImage = image;
  }

  private initializeMythicSafeZonePressureEffectIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.mythicSafeZonePressureEffectIdentityAtlasReady = true; };
    image.onerror = () => { this.mythicSafeZonePressureEffectIdentityAtlasReady = false; };
    image.src = MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_ATLAS.src;
    this.mythicSafeZonePressureEffectIdentityAtlasImage = image;
  }

  private initializeSafeZoneTransitionDirectionAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.safeZoneTransitionDirectionAtlasReady = true; };
    image.onerror = () => { this.safeZoneTransitionDirectionAtlasReady = false; };
    image.src = SAFE_ZONE_TRANSITION_DIRECTION_ATLAS.src; this.safeZoneTransitionDirectionAtlasImage = image;
  }

  private initializeAscensionMutatorIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.ascensionMutatorIdentityAtlasReady = true; };
    image.onerror = () => { this.ascensionMutatorIdentityAtlasReady = false; };
    image.src = ASCENSION_MUTATOR_IDENTITY_ATLAS.src;
    this.ascensionMutatorIdentityAtlasImage = image;
  }

  private initializeNemesisAdaptationIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.nemesisAdaptationIdentityAtlasReady = true; };
    image.onerror = () => { this.nemesisAdaptationIdentityAtlasReady = false; };
    image.src = NEMESIS_ADAPTATION_IDENTITY_ATLAS.src;
    this.nemesisAdaptationIdentityAtlasImage = image;
  }

  private initializeNemesisAdaptationEffectIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.nemesisAdaptationEffectIdentityAtlasReady = true; };
    image.onerror = () => { this.nemesisAdaptationEffectIdentityAtlasReady = false; };
    image.src = NEMESIS_ADAPTATION_EFFECT_IDENTITY_ATLAS.src;
    this.nemesisAdaptationEffectIdentityAtlasImage = image;
  }

  private initializeBossArenaMutationIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.bossArenaMutationIdentityAtlasReady = true; };
    image.onerror = () => { this.bossArenaMutationIdentityAtlasReady = false; };
    image.src = BOSS_ARENA_MUTATION_IDENTITY_ATLAS.src;
    this.bossArenaMutationIdentityAtlasImage = image;
  }

  private initializeDecisionPathIconAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.decisionPathIconAtlasReady = true; };
    image.onerror = () => { this.decisionPathIconAtlasReady = false; };
    image.src = DECISION_PATH_ICON_ATLAS.src;
    this.decisionPathIconAtlasImage = image;
  }

  private initializeBossSpriteAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.bossSpriteAtlasReady = true; };
    image.onerror = () => { this.bossSpriteAtlasReady = false; };
    image.src = BOSS_SPRITE_ATLAS.src;
    this.bossSpriteAtlasImage = image;
  }

  private initializeBossSignatureVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.bossSignatureVfxAtlasReady = true; };
    image.onerror = () => { this.bossSignatureVfxAtlasReady = false; };
    image.src = BOSS_SIGNATURE_VFX_ATLAS.src;
    this.bossSignatureVfxAtlasImage = image;
  }

  private initializeBossSpecialCombatVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.bossSpecialCombatVfxAtlasReady = true; };
    image.onerror = () => { this.bossSpecialCombatVfxAtlasReady = false; };
    image.src = BOSS_SPECIAL_COMBAT_VFX_ATLAS.src;
    this.bossSpecialCombatVfxAtlasImage = image;
  }

  private initializeBossPhaseOverlayVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.bossPhaseOverlayVfxAtlasReady = true; };
    image.onerror = () => { this.bossPhaseOverlayVfxAtlasReady = false; };
    image.src = BOSS_PHASE_OVERLAY_VFX_ATLAS.src;
    this.bossPhaseOverlayVfxAtlasImage = image;
  }

  private initializeTacticalStatusIconAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.tacticalStatusIconAtlasReady = true; };
    image.onerror = () => { this.tacticalStatusIconAtlasReady = false; };
    image.src = TACTICAL_STATUS_ICON_ATLAS.src;
    this.tacticalStatusIconAtlasImage = image;
  }

  private initializeObjectiveActionIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.objectiveActionIdentityAtlasReady = true; };
    image.onerror = () => { this.objectiveActionIdentityAtlasReady = false; };
    image.src = OBJECTIVE_ACTION_IDENTITY_ATLAS.src; this.objectiveActionIdentityAtlasImage = image;
  }

  private initializeObjectiveRewardIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.objectiveRewardIdentityAtlasReady = true; };
    image.onerror = () => { this.objectiveRewardIdentityAtlasReady = false; };
    image.src = OBJECTIVE_REWARD_IDENTITY_ATLAS.src; this.objectiveRewardIdentityAtlasImage = image;
  }

  private initializeRunMissionPaceIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.runMissionPaceIdentityAtlasReady = true; };
    image.onerror = () => { this.runMissionPaceIdentityAtlasReady = false; };
    image.src = RUN_MISSION_PACE_IDENTITY_ATLAS.src; this.runMissionPaceIdentityAtlasImage = image;
  }

  private initializeRunContractBoonEffectIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.runContractBoonEffectIdentityAtlasReady = true; };
    image.onerror = () => { this.runContractBoonEffectIdentityAtlasReady = false; };
    image.src = RUN_CONTRACT_BOON_EFFECT_IDENTITY_ATLAS.src; this.runContractBoonEffectIdentityAtlasImage = image;
  }

  private initializeOathRequirementIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.oathRequirementIdentityAtlasReady = true; };
    image.onerror = () => { this.oathRequirementIdentityAtlasReady = false; };
    image.src = OATH_REQUIREMENT_IDENTITY_ATLAS.src; this.oathRequirementIdentityAtlasImage = image;
  }

  private initializeOathBoonOutcomeIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.oathBoonOutcomeIdentityAtlasReady = true; };
    image.onerror = () => { this.oathBoonOutcomeIdentityAtlasReady = false; };
    image.src = OATH_BOON_OUTCOME_IDENTITY_ATLAS.src; this.oathBoonOutcomeIdentityAtlasImage = image;
  }

  private initializeRelicResonanceImpactIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.relicResonanceImpactIdentityAtlasReady = true; };
    image.onerror = () => { this.relicResonanceImpactIdentityAtlasReady = false; };
    image.src = RELIC_RESONANCE_IMPACT_IDENTITY_ATLAS.src; this.relicResonanceImpactIdentityAtlasImage = image;
  }

  private initializeRelicResonanceTierIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.relicResonanceTierIdentityAtlasReady = true; };
    image.onerror = () => { this.relicResonanceTierIdentityAtlasReady = false; };
    image.src = RELIC_RESONANCE_TIER_IDENTITY_ATLAS.src; this.relicResonanceTierIdentityAtlasImage = image;
  }

  private initializeHeroAscensionModifierIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.heroAscensionModifierIdentityAtlasReady = true; };
    image.onerror = () => { this.heroAscensionModifierIdentityAtlasReady = false; };
    image.src = HERO_ASCENSION_MODIFIER_IDENTITY_ATLAS.src; this.heroAscensionModifierIdentityAtlasImage = image;
  }

  private initializeHeroAscensionBuildDirectionAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.heroAscensionBuildDirectionAtlasReady = true; };
    image.onerror = () => { this.heroAscensionBuildDirectionAtlasReady = false; };
    image.src = HERO_ASCENSION_BUILD_DIRECTION_ATLAS.src; this.heroAscensionBuildDirectionAtlasImage = image;
  }

  private initializeFusionModifierIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.fusionModifierIdentityAtlasReady = true; };
    image.onerror = () => { this.fusionModifierIdentityAtlasReady = false; };
    image.src = FUSION_MODIFIER_IDENTITY_ATLAS.src; this.fusionModifierIdentityAtlasImage = image;
  }

  private initializeFusionComponentRelationAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.fusionComponentRelationAtlasReady = true; };
    image.onerror = () => { this.fusionComponentRelationAtlasReady = false; };
    image.src = FUSION_COMPONENT_RELATION_ATLAS.src; this.fusionComponentRelationAtlasImage = image;
  }

  private initializeFateBenefitVectorAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.fateBenefitVectorAtlasReady = true; };
    image.onerror = () => { this.fateBenefitVectorAtlasReady = false; };
    image.src = FATE_BENEFIT_VECTOR_ATLAS.src; this.fateBenefitVectorAtlasImage = image;
  }

  private initializeFateCostVectorAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.fateCostVectorAtlasReady = true; };
    image.onerror = () => { this.fateCostVectorAtlasReady = false; };
    image.src = FATE_COST_VECTOR_ATLAS.src; this.fateCostVectorAtlasImage = image;
  }

  private initializeFieldEventResponseIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.fieldEventResponseIdentityAtlasReady = true; };
    image.onerror = () => { this.fieldEventResponseIdentityAtlasReady = false; };
    image.src = FIELD_EVENT_RESPONSE_IDENTITY_ATLAS.src; this.fieldEventResponseIdentityAtlasImage = image;
  }

  private initializeFieldEventEffectProfileIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.fieldEventEffectProfileIdentityAtlasReady = true; };
    image.onerror = () => { this.fieldEventEffectProfileIdentityAtlasReady = false; };
    image.src = FIELD_EVENT_EFFECT_PROFILE_IDENTITY_ATLAS.src; this.fieldEventEffectProfileIdentityAtlasImage = image;
  }

  private initializeBuildIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.buildIdentityAtlasReady = true; };
    image.onerror = () => { this.buildIdentityAtlasReady = false; };
    image.src = BUILD_IDENTITY_ATLAS.src;
    this.buildIdentityAtlasImage = image;
  }

  private initializeBuildOverdriveEffectAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.buildOverdriveEffectAtlasReady = true; };
    image.onerror = () => { this.buildOverdriveEffectAtlasReady = false; };
    image.src = BUILD_OVERDRIVE_EFFECT_ATLAS.src;
    this.buildOverdriveEffectAtlasImage = image;
  }

  private initializeHeroMeterIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.heroMeterIdentityAtlasReady = true; };
    image.onerror = () => { this.heroMeterIdentityAtlasReady = false; };
    image.src = HERO_METER_IDENTITY_ATLAS.src;
    this.heroMeterIdentityAtlasImage = image;
  }

  private initializeArcaneComboIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.arcaneComboIdentityAtlasReady = true; };
    image.onerror = () => { this.arcaneComboIdentityAtlasReady = false; };
    image.src = ARCANE_COMBO_IDENTITY_ATLAS.src;
    this.arcaneComboIdentityAtlasImage = image;
  }

  private initializeSynergyIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.synergyIdentityAtlasReady = true; };
    image.onerror = () => { this.synergyIdentityAtlasReady = false; };
    image.src = SYNERGY_IDENTITY_ATLAS.src; this.synergyIdentityAtlasImage = image;
  }

  private initializeLegendaryAwakeningAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.legendaryAwakeningAtlasReady = true; };
    image.onerror = () => { this.legendaryAwakeningAtlasReady = false; };
    image.src = SHOP_ITEM_ATLAS.src; this.legendaryAwakeningAtlasImage = image;
  }

  private initializeFinalFormIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.finalFormIdentityAtlasReady = true; };
    image.onerror = () => { this.finalFormIdentityAtlasReady = false; };
    image.src = FINAL_FORM_IDENTITY_ATLAS.src;
    this.finalFormIdentityAtlasImage = image;
  }

  private initializeBattlefieldPropVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.battlefieldPropVfxAtlasReady = true; };
    image.onerror = () => { this.battlefieldPropVfxAtlasReady = false; };
    image.src = BATTLEFIELD_PROP_VFX_ATLAS.src;
    this.battlefieldPropVfxAtlasImage = image;
  }

  private initializeBattlefieldObstacleStateVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.battlefieldObstacleStateVfxAtlasReady = true; };
    image.onerror = () => { this.battlefieldObstacleStateVfxAtlasReady = false; };
    image.src = BATTLEFIELD_OBSTACLE_STATE_VFX_ATLAS.src;
    this.battlefieldObstacleStateVfxAtlasImage = image;
  }

  private initializeBattlefieldInteractionVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.battlefieldInteractionVfxAtlasReady = true; };
    image.onerror = () => { this.battlefieldInteractionVfxAtlasReady = false; };
    image.src = BATTLEFIELD_INTERACTION_VFX_ATLAS.src;
    this.battlefieldInteractionVfxAtlasImage = image;
  }

  private initializePickupFlowVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.pickupFlowVfxAtlasReady = true; };
    image.onerror = () => { this.pickupFlowVfxAtlasReady = false; };
    image.src = PICKUP_FLOW_VFX_ATLAS.src;
    this.pickupFlowVfxAtlasImage = image;
  }

  private initializeSpawnPressureVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.spawnPressureVfxAtlasReady = true; };
    image.onerror = () => { this.spawnPressureVfxAtlasReady = false; };
    image.src = SPAWN_PRESSURE_VFX_ATLAS.src;
    this.spawnPressureVfxAtlasImage = image;
  }

  private initializeSurvivalResponseVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.survivalResponseVfxAtlasReady = true; };
    image.onerror = () => { this.survivalResponseVfxAtlasReady = false; };
    image.src = SURVIVAL_RESPONSE_VFX_ATLAS.src;
    this.survivalResponseVfxAtlasImage = image;
  }

  private initializeFreezeControlVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.freezeControlVfxAtlasReady = true; };
    image.onerror = () => { this.freezeControlVfxAtlasReady = false; };
    image.src = FREEZE_CONTROL_VFX_ATLAS.src;
    this.freezeControlVfxAtlasImage = image;
  }

  private initializeRegularEnemyActionVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.regularEnemyActionVfxAtlasReady = true; };
    image.onerror = () => { this.regularEnemyActionVfxAtlasReady = false; };
    image.src = REGULAR_ENEMY_ACTION_VFX_ATLAS.src;
    this.regularEnemyActionVfxAtlasImage = image;
  }

  private initializeEliteAffixLifecycleVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.eliteAffixLifecycleVfxAtlasReady = true; };
    image.onerror = () => { this.eliteAffixLifecycleVfxAtlasReady = false; };
    image.src = ELITE_AFFIX_LIFECYCLE_VFX_ATLAS.src;
    this.eliteAffixLifecycleVfxAtlasImage = image;
  }

  private initializeEnemyTargetPressureVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.enemyTargetPressureVfxAtlasReady = true; };
    image.onerror = () => { this.enemyTargetPressureVfxAtlasReady = false; };
    image.src = ENEMY_TARGET_PRESSURE_VFX_ATLAS.src;
    this.enemyTargetPressureVfxAtlasImage = image;
  }

  private initializeFinalFormWorldVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.finalFormWorldVfxAtlasReady = true; };
    image.onerror = () => { this.finalFormWorldVfxAtlasReady = false; };
    image.src = FINAL_FORM_WORLD_VFX_ATLAS.src;
    this.finalFormWorldVfxAtlasImage = image;
  }

  private initializeFusionWorldVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.fusionWorldVfxAtlasReady = true; };
    image.onerror = () => { this.fusionWorldVfxAtlasReady = false; };
    image.src = FUSION_WORLD_VFX_ATLAS.src;
    this.fusionWorldVfxAtlasImage = image;
  }

  private initializeHeroMeterWorldVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.heroMeterWorldVfxAtlasReady = true; };
    image.onerror = () => { this.heroMeterWorldVfxAtlasReady = false; };
    image.src = HERO_METER_WORLD_VFX_ATLAS.src;
    this.heroMeterWorldVfxAtlasImage = image;
  }


  private initializeBossProjectileLifecycleVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.bossProjectileLifecycleVfxAtlasReady = true; };
    image.onerror = () => { this.bossProjectileLifecycleVfxAtlasReady = false; };
    image.src = BOSS_PROJECTILE_LIFECYCLE_VFX_ATLAS.src;
    this.bossProjectileLifecycleVfxAtlasImage = image;
  }

  private initializePersistentSpellZoneVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.persistentSpellZoneVfxAtlasReady = true; };
    image.onerror = () => { this.persistentSpellZoneVfxAtlasReady = false; };
    image.src = PERSISTENT_SPELL_ZONE_VFX_ATLAS.src;
    this.persistentSpellZoneVfxAtlasImage = image;
  }

  private initializeCrystalInteractionLifecycleVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.crystalInteractionLifecycleVfxAtlasReady = true; };
    image.onerror = () => { this.crystalInteractionLifecycleVfxAtlasReady = false; };
    image.src = CRYSTAL_INTERACTION_LIFECYCLE_VFX_ATLAS.src;
    this.crystalInteractionLifecycleVfxAtlasImage = image;
  }

  private initializeBossPhaseAftermathVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.bossPhaseAftermathVfxAtlasReady = true; };
    image.onerror = () => { this.bossPhaseAftermathVfxAtlasReady = false; };
    image.src = BOSS_PHASE_AFTERMATH_VFX_ATLAS.src; this.bossPhaseAftermathVfxAtlasImage = image;
  }

  private initializeSpecialistReactionLifecycleVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.specialistReactionLifecycleVfxAtlasReady = true; };
    image.onerror = () => { this.specialistReactionLifecycleVfxAtlasReady = false; };
    image.src = SPECIALIST_REACTION_LIFECYCLE_VFX_ATLAS.src; this.specialistReactionLifecycleVfxAtlasImage = image;
  }

  private initializeMapEvolutionAftermathVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.mapEvolutionAftermathVfxAtlasReady = true; };
    image.onerror = () => { this.mapEvolutionAftermathVfxAtlasReady = false; };
    image.src = MAP_EVOLUTION_AFTERMATH_VFX_ATLAS.src; this.mapEvolutionAftermathVfxAtlasImage = image;
  }

  private initializeBossHazardAftermathVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.bossHazardAftermathVfxAtlasReady = true; };
    image.onerror = () => { this.bossHazardAftermathVfxAtlasReady = false; };
    image.src = BOSS_HAZARD_AFTERMATH_VFX_ATLAS.src; this.bossHazardAftermathVfxAtlasImage = image;
  }

  private initializeEnemyFinisherVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.enemyFinisherVfxAtlasReady = true; };
    image.onerror = () => { this.enemyFinisherVfxAtlasReady = false; };
    image.src = ENEMY_FINISHER_VFX_ATLAS.src; this.enemyFinisherVfxAtlasImage = image;
  }

  private initializeHeroCrisisVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.heroCrisisVfxAtlasReady = true; };
    image.onerror = () => { this.heroCrisisVfxAtlasReady = false; };
    image.src = HERO_CRISIS_VFX_ATLAS.src; this.heroCrisisVfxAtlasImage = image;
  }

  private initializePerfectEvadeTrailVfxAtlas(): void { if(typeof Image==='undefined')return;const image=new Image();image.decoding='async';image.onload=()=>{this.perfectEvadeTrailVfxAtlasReady=true;};image.onerror=()=>{this.perfectEvadeTrailVfxAtlasReady=false;};image.src=PERFECT_EVADE_TRAIL_VFX_ATLAS.src;this.perfectEvadeTrailVfxAtlasImage=image; }
  private initializeCrowdControlPropagationVfxAtlas(): void { if(typeof Image==='undefined')return;const image=new Image();image.decoding='async';image.onload=()=>{this.crowdControlPropagationVfxAtlasReady=true;};image.onerror=()=>{this.crowdControlPropagationVfxAtlasReady=false;};image.src=CROWD_CONTROL_PROPAGATION_VFX_ATLAS.src;this.crowdControlPropagationVfxAtlasImage=image; }
  private initializeBossCounterplayRewardVfxAtlas(): void { if(typeof Image==='undefined')return;const image=new Image();image.decoding='async';image.onload=()=>{this.bossCounterplayRewardVfxAtlasReady=true;};image.onerror=()=>{this.bossCounterplayRewardVfxAtlasReady=false;};image.src=BOSS_COUNTERPLAY_REWARD_VFX_ATLAS.src;this.bossCounterplayRewardVfxAtlasImage=image; }
  private initializeObjectiveCompletionCeremonyVfxAtlas(): void { if(typeof Image==='undefined')return;const image=new Image();image.decoding='async';image.onload=()=>{this.objectiveCompletionCeremonyVfxAtlasReady=true;};image.onerror=()=>{this.objectiveCompletionCeremonyVfxAtlasReady=false;};image.src=OBJECTIVE_COMPLETION_CEREMONY_VFX_ATLAS.src;this.objectiveCompletionCeremonyVfxAtlasImage=image; }
  private initializeUltimatePostImpactResidueVfxAtlas(): void { if(typeof Image==='undefined')return;const image=new Image();image.decoding='async';image.onload=()=>{this.ultimatePostImpactResidueVfxAtlasReady=true;};image.onerror=()=>{this.ultimatePostImpactResidueVfxAtlasReady=false;};image.src=ULTIMATE_POST_IMPACT_RESIDUE_VFX_ATLAS.src;this.ultimatePostImpactResidueVfxAtlasImage=image; }
  private initializeMapSafeLaneTransitionVfxAtlas(): void { if(typeof Image==='undefined')return;const image=new Image();image.decoding='async';image.onload=()=>{this.mapSafeLaneTransitionVfxAtlasReady=true;};image.onerror=()=>{this.mapSafeLaneTransitionVfxAtlasReady=false;};image.src=MAP_SAFE_LANE_TRANSITION_VFX_ATLAS.src;this.mapSafeLaneTransitionVfxAtlasImage=image; }
  private initializeObjectiveActivationMaterializationVfxAtlas(): void { if(typeof Image==='undefined')return;const image=new Image();image.decoding='async';image.onload=()=>{this.objectiveActivationMaterializationVfxAtlasReady=true;};image.onerror=()=>{this.objectiveActivationMaterializationVfxAtlasReady=false;};image.src=OBJECTIVE_ACTIVATION_MATERIALIZATION_VFX_ATLAS.src;this.objectiveActivationMaterializationVfxAtlasImage=image; }
  private initializeBossArenaTransitionWorldVfxAtlas(): void { if(typeof Image==='undefined')return;const image=new Image();image.decoding='async';image.onload=()=>{this.bossArenaTransitionWorldVfxAtlasReady=true;};image.onerror=()=>{this.bossArenaTransitionWorldVfxAtlasReady=false;};image.src=BOSS_ARENA_TRANSITION_WORLD_VFX_ATLAS.src;this.bossArenaTransitionWorldVfxAtlasImage=image; }
  private initializeMapCombatBoundaryWarningVfxAtlas(): void { if(typeof Image==='undefined')return;const image=new Image();image.decoding='async';image.onload=()=>{this.mapCombatBoundaryWarningVfxAtlasReady=true;};image.onerror=()=>{this.mapCombatBoundaryWarningVfxAtlasReady=false;};image.src=MAP_COMBAT_BOUNDARY_WARNING_VFX_ATLAS.src;this.mapCombatBoundaryWarningVfxAtlasImage=image; }
  private initializeObjectiveFailureDissolveVfxAtlas(): void { if(typeof Image==='undefined')return;const image=new Image();image.decoding='async';image.onload=()=>{this.objectiveFailureDissolveVfxAtlasReady=true;};image.onerror=()=>{this.objectiveFailureDissolveVfxAtlasReady=false;};image.src=OBJECTIVE_FAILURE_DISSOLVE_VFX_ATLAS.src;this.objectiveFailureDissolveVfxAtlasImage=image; }
  private initializeFieldEventLifecycleWorldVfxAtlas(): void { if(typeof Image==='undefined')return;const image=new Image();image.decoding='async';image.onload=()=>{this.fieldEventLifecycleWorldVfxAtlasReady=true;};image.onerror=()=>{this.fieldEventLifecycleWorldVfxAtlasReady=false;};image.src=FIELD_EVENT_LIFECYCLE_WORLD_VFX_ATLAS.src;this.fieldEventLifecycleWorldVfxAtlasImage=image; }
  private initializeElitePackApproachFormationVfxAtlas(): void { if(typeof Image==='undefined')return;const image=new Image();image.decoding='async';image.onload=()=>{this.elitePackApproachFormationVfxAtlasReady=true;};image.onerror=()=>{this.elitePackApproachFormationVfxAtlasReady=false;};image.src=ELITE_PACK_APPROACH_FORMATION_VFX_ATLAS.src;this.elitePackApproachFormationVfxAtlasImage=image; }

  private initializeBattlefieldEnvironmentAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.battlefieldEnvironmentAtlasReady = true; };
    image.onerror = () => { this.battlefieldEnvironmentAtlasReady = false; };
    image.src = BATTLEFIELD_ENVIRONMENT_ATLAS.src;
    this.battlefieldEnvironmentAtlasImage = image;
  }

  private initializeBattlefieldAtmosphereVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.battlefieldAtmosphereVfxAtlasReady = true; };
    image.onerror = () => { this.battlefieldAtmosphereVfxAtlasReady = false; };
    image.src = BATTLEFIELD_ATMOSPHERE_VFX_ATLAS.src; this.battlefieldAtmosphereVfxAtlasImage = image;
  }

  private initializeBattlefieldDepthOverlayAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.battlefieldDepthOverlayAtlasReady = true; };
    image.onerror = () => { this.battlefieldDepthOverlayAtlasReady = false; };
    image.src = BATTLEFIELD_DEPTH_OVERLAY_ATLAS.src; this.battlefieldDepthOverlayAtlasImage = image;
  }

  private initializeBattlefieldEnvironmentReactionVfxAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.battlefieldEnvironmentReactionVfxAtlasReady = true; };
    image.onerror = () => { this.battlefieldEnvironmentReactionVfxAtlasReady = false; };
    image.src = BATTLEFIELD_ENVIRONMENT_REACTION_VFX_ATLAS.src; this.battlefieldEnvironmentReactionVfxAtlasImage = image;
  }

  private initializeBattlefieldMechanicAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.battlefieldMechanicAtlasReady = true; };
    image.onerror = () => { this.battlefieldMechanicAtlasReady = false; };
    image.src = BATTLEFIELD_MECHANIC_ATLAS.src; this.battlefieldMechanicAtlasImage = image;
  }

  private initializeAscensionTierPressureAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image(); image.decoding = 'async';
    image.onload = () => { this.ascensionTierPressureAtlasReady = true; };
    image.onerror = () => { this.ascensionTierPressureAtlasReady = false; };
    image.src = ASCENSION_TIER_PRESSURE_ATLAS.src; this.ascensionTierPressureAtlasImage = image;
  }

  private initializeDeepRunDecisionIdentityAtlas(): void {
    if (typeof Image === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { this.deepRunDecisionIdentityAtlasReady = true; };
    image.onerror = () => { this.deepRunDecisionIdentityAtlasReady = false; };
    image.src = DEEP_RUN_DECISION_ATLAS.src;
    this.deepRunDecisionIdentityAtlasImage = image;
  }

  checkpointForLifecycle(): void {
    const now = typeof performance !== 'undefined' && Number.isFinite(performance.now()) ? performance.now() : Date.now();
    const decision = advanceLifecycleCheckpoint(this.lifecycleCheckpointState, now);
    this.lifecycleCheckpointState = decision.state;
    if (decision.shouldSave) this.saveCurrentRunSnapshot();
    this.resetTransientDecisionInput();
  }

  private currentCombatAttentionPolicy(): CombatAttentionPolicy {
    const boss=this.enemies.enemies.find((enemy)=>enemy.alive&&enemy.type==='boss')??null;
    return combatAttentionPolicy({
      heroCritical:this.dangerState.heroCritical,
      coreCritical:this.dangerState.coreCritical,
      damageSeverity:this.damageReasonState?.severity??null,
      bossSpecialTimer:boss?.specialTimer??99,
      reducedFlash:this.presentationSettings.reducedFlash,
      reducedMotion:this.presentationSettings.reducedMotion,
      bossCountdown:this.enemies.bossCountdown,
    });
  }

  private worldVfxLayerAlpha(priority:WorldVfxPriority):number { return this.activeWorldVfxPriorityPolicy.alpha[priority]; }

  private currentWorldVfxProtectedAnchors():WorldVfxProtectedAnchor[] {
    const anchors:WorldVfxProtectedAnchor[]=[];
    if(this.dangerState.heroCritical)anchors.push({x:this.hero.pos.x,y:this.hero.pos.y,radius:112});
    if(this.dangerState.coreCritical)anchors.push({x:this.core.pos.x,y:this.core.pos.y,radius:126});
    return anchors;
  }

  private worldVfxCueAlpha(priority:WorldVfxPriority,x:number,y:number,radius:number):number {
    return this.worldVfxLayerAlpha(priority)*worldVfxOcclusionScale({priority,cue:{x,y,radius:Math.max(0,radius)},protectedAnchors:this.currentWorldVfxProtectedAnchors()});
  }

  private currentWorldVfxOccupancyPolicy(combatPrimary:CombatAttentionPrimary):WorldVfxOccupancyResult {
    const candidates:Array<{id:WorldVfxOccupancyId;priority:'tactical'|'informational'|'decorative';area:number}>=[];
    const add=(id:WorldVfxOccupancyId,priority:'tactical'|'informational'|'decorative',count:number,diameter:number)=>{if(count>0)candidates.push({id,priority,area:count*Math.PI*(diameter*.5)**2});};
    add('objective-activation','tactical',this.objectiveActivationMaterializationVfx.length,150);
    add('objective-completion','informational',this.objectiveCompletionCeremonyVfx.length,158);
    add('objective-failure','tactical',this.objectiveFailureDissolveVfx.length,172);
    add('field-event-lifecycle','informational',this.fieldEventLifecycleWorldVfx.length,178);
    add('boss-arena-transition','tactical',this.bossArenaTransitionWorldVfx.length,420);
    add('map-evolution-aftermath','decorative',this.mapEvolutionAftermathVfx.length,Math.min(LOGICAL_WIDTH,LOGICAL_HEIGHT)*.72);
    add('boss-hazard-aftermath','tactical',this.bossHazardAftermathVfx.length,176);
    add('elite-pack-approach','tactical',this.elitePackApproachFormationVfx.length,220);
    add('enemy-spawn-lane','tactical',this.enemies.spawnLanePresentationViews().length,160);
    return resolveWorldVfxOccupancy({quality:this.presentation.quality,combatPrimary,viewportArea:LOGICAL_WIDTH*LOGICAL_HEIGHT,candidates});
  }

  private worldVfxLayerAllowed(id:WorldVfxOccupancyId):boolean {
    return this.activeWorldVfxOccupancyPolicy.allowedIds.includes(id);
  }

  private currentSecondaryCombatMotionPolicy(attention:CombatAttentionPolicy=this.currentCombatAttentionPolicy()): SecondaryCombatMotionPolicy {
    const nowMs=this.elapsed*1000;
    return secondaryCombatMotionPolicy({
      combatPrimary:attention.primary,
      reducedFlash:this.presentationSettings.reducedFlash,
      reducedMotion:this.presentationSettings.reducedMotion,
      hasBossHazard:this.bossArena.hazards.some((hazard)=>hazard.telegraph>0),
      hasPriorityThreat:priorityThreatIds(this.enemies.enemies,this.hero.pos,2).length>0,
      hasSupplyCrate:Boolean(this.supplyCrate),
      hasFieldNode:this.endlessState.world.nodes.some((node)=>node.expiresAtMs>nowMs),
      hasFreezeStatus:this.enemies.enemies.some((enemy)=>enemy.alive&&enemy.slowTimer>0),
      coreVisible:this.core.hp>0,
    });
  }

  private currentResidualCombatMotionPolicy(attention:CombatAttentionPolicy,secondary:SecondaryCombatMotionPolicy):ResidualCombatMotionPolicy {
    return residualCombatMotionPolicy({
      combatPrimary:attention.primary,
      reducedFlash:this.presentationSettings.reducedFlash,
      reducedMotion:this.presentationSettings.reducedMotion,
      secondaryOwner:secondary.owner,
      hasBlackHole:this.spells.hasActiveBlackHole,
      hasTerrainCrystal:this.terrain.hasActiveCrystal,
      hasGoldenEnemy:this.enemies.enemies.some((enemy)=>enemy.alive&&enemy.type==='golden'),
      hasBomber:this.enemies.enemies.some((enemy)=>enemy.alive&&enemy.type==='bomber'),
      finalFormFlowActive:Boolean(this.currentHeroFinalForm())&&this.finalFormFlow.streak>0,
    });
  }

  private clearBossActionAssistCue(): void {
    this.bossActionAssistCue = null;
    this.bossActionAssistCueSince = 0;
    this.bossActionAssistBossId = null;
    this.bossActionAssistArchetype = null;
  }

  private clearBossResponseAcknowledgement(): void {
    this.bossResponseAckAction = null;
    this.bossResponseAckSince = 0;
    this.bossResponseAckBossId = null;
    this.bossResponseAckArchetype = null;
    this.bossResponseAckCycle = null;
  }

  private clearBufferedCastIntents(): void {
    this.castIntentBuffer.clear();
    this.manualTargetMemory.clear();
    this.clearBossActionAssistCue();
    this.clearBossResponseAcknowledgement();
  }

  resetTransientDecisionInput(): void {
    const now = this.decisionNowMs();
    this.hapticArbiter.clear();
    this.input.resetTransient();
    this.clearBufferedCastIntents();
    this.decisionPickGuard.resetTransient(now);
    if (this.decisionSessionActive && this.decisionReplay) {
      const generation = this.decisionPickGuard.render(now, true);
      this.decisionReplay(generation);
    }
  }

  setVisibilityPaused(hidden: boolean): void {
    if (hidden) this.checkpointForLifecycle();
    this.pauseState.set('visibility', hidden);
    this.endlessState = { ...this.endlessState, telemetry: recordTelemetryEvent(this.endlessState.telemetry, { type: hidden ? 'pause' : 'resume' }) };
  }
  toggleManualPause(): boolean {
    const paused = this.pauseState.toggle('manual');
    if (paused) {
      this.hapticArbiter.clear();
      this.input.clearStrategicActionArms();
      this.clearBufferedCastIntents();
    }
    this.endlessState = { ...this.endlessState, telemetry: recordTelemetryEvent(this.endlessState.telemetry, { type: paused ? 'pause' : 'resume' }) };
    return paused;
  }
  get manuallyPaused(): boolean { return this.pauseState.has('manual'); }

  restart(): void {
    this.resultsOverlay.hide();
    this.heroSelectOverlay.hide();
    this.traitSelectOverlay.hide();
    this.lobbyOverlay.hide();
    this.resetRun('arkan', null);
    this.paused = true;
    this.openLobby();
  }

  private openLobby(): void {
    this.paused = true;
    this.heroSelectOverlay.hide();
    this.traitSelectOverlay.hide();
    this.lobbyOverlay.open(this.metaProfile, {
      onPurchase: (id) => {
        const result = purchaseMetaUpgrade(this.metaProfile, id);
        if (result.ok) {
          this.metaProfile = result.profile;
          this.saveStoredMetaProfile();
        }
        return this.metaProfile;
      },
      onThreatChange: (level) => {
        this.threatProfile = selectThreatLevel(this.threatProfile, level);
        this.saveStoredThreatProfile();
        return this.threatProfile;
      },
      onContinue: () => {
        this.lobbyOverlay.hide();
        this.openHeroSelect();
      },
      onResume: () => {
        if (!this.resumeSnapshot) return;
        const snapshot = this.resumeSnapshot;
        this.lobbyOverlay.hide();
        this.restoreRunSnapshot(snapshot);
        this.paused = false;
      },
    }, this.threatProfile, this.masteryProfile, this.resumeSnapshot, this.loadStoredRunHistory());
  }

  private openHeroSelect(): void {
    this.paused = true;
    this.heroSelectOverlay.open(HERO_PROFILES, (id) => this.openTraitSelect(id));
  }

  private openTraitSelect(heroId: HeroId): void {
    this.paused = true;
    this.traitSelectOverlay.open(heroId, (traitId) => {
      this.clearStoredRunSnapshot();
      this.resetRun(heroId, traitId);
      this.syncRunFoundationIdentityTracker(true);
      this.paused = false;
    }, this.masteryProfile.heroes[heroId].level);
  }

  private resetRun(heroId: HeroId, traitId: RunTraitId | null, retryBlueprint: RetryBlueprint | null = null, replayPlan: BuildReplayPlan | null = null): void {
    this.hapticArbiter.clear();
    this.input.clearStrategicActionArms();
    this.clearBufferedCastIntents();
    this.bossSafeResponseWindowUntil = 0;
    this.bossSafeResponseBossId = null;
    this.bossSafeResponseCycle = null;
    this.bossSafeResponseShownCycle = null;
    this.bossSafeResponseSlotMemory = null;
    this.spawnLaneEdgeCountDebounceMemory = [];
    this.hero = createHero(heroId);
    const startStats = composeRunStartStats(
      {
        maxHp: this.hero.maxHp,
        spellPower: this.hero.spellPower,
        cooldownMultiplier: this.hero.cooldownMultiplier,
        speed: this.hero.speed,
        pickupRadius: this.hero.pickupRadius,
      },
      metaBonuses(this.metaProfile),
      runTraitBonuses(traitId),
    );
    this.hero.maxHp = startStats.maxHp;
    this.hero.hp = startStats.maxHp;
    this.hero.spellPower = startStats.spellPower;
    this.hero.cooldownMultiplier = startStats.cooldownMultiplier;
    this.hero.speed = startStats.speed;
    this.hero.pickupRadius = startStats.pickupRadius;
    this.selectedTrait = traitId;
    this.currentReplayPlan = replayPlan;
    this.runThreatLevel = retryBlueprint?.threatLevel ?? this.threatProfile.selected;
    this.runGoldMultiplier = startStats.goldMultiplier;
    this.runHeroDamageTakenMultiplier = startStats.heroDamageTakenMultiplier;
    this.runCoreDamageTakenMultiplier = startStats.coreDamageTakenMultiplier;
    this.hero.xpNext = xpNeededForLevel(1);
    this.core = createGuardianCore();
    this.elapsed = 0;
    this.gameOver = false;
    this.shopTokens = 0;
    this.bossesKilled = 0;
    this.goldEarned = 0;
    this.autoCastNormal = openingAutoReadyProfile().initialAutoEnabled;
    this.autoTargetId = null;
    this.enemies.reset();
    this.spells.reset();
    this.enemyDeathImageBursts = [];
    this.enemyDefeatBodyTransitions = [];
    this.pickups.reset();
    this.terrain.reset();
    if (retryBlueprint) this.terrain.restore(retryBlueprint.mapId, 0);
    this.feedback.reset();
    this.presentation.reset();
    this.presentation.quality = this.presentationSettings.quality;
    this.vfxQualityTransition = createVfxQualityTransition(this.presentation.quality);
    this.bossPresentation.reset();
    this.seenBossIds.clear();
    this.bossSignatureEntranceBossId = null;
    this.bossSignatureEntranceUntil = 0;
    this.bossPressureRatioById.clear();
    this.bossPhaseCue = null;
    this.bossPhaseCueTimer = 0;
    this.killChainVfx.reset();
    this.killChainCue = null;
    this.killChainCueTimer = 0;
    this.mapVfxAccumulator = 0;
    this.mapVfxSequence = 0;
    this.battlefieldEnvironmentReactionVfx = [];
    this.heroResponseVfx = [];
    this.heroRenderMotionBlend = 0;
    this.heroRenderStride = 0;
    this.heroRenderTurnTilt = 0;
    this.heroRenderRecoveryBlend = 0;
    this.heroRenderLastMoving = false;
    this.heroRenderPreviousFacing = { x: 1, y: 0 };
    this.heroCastRenderCast = 0;
    this.heroCastRenderRecover = 0;
    this.heroCastCadenceState = { chain:0, bridge:0, pulse:0 };
    this.heroCastAimHoldState = createHeroCastAimHoldState();
    this.heroBodyFacingHysteresisState = createHeroBodyFacingHysteresisState(this.hero.facing);
    this.heroBodyFacingHysteresisLastAt = -99;
    this.heroActionTransitionState = { hit:0, cast:0, evade:0, bridge:0, last:'neutral' };
    this.heroUltimateBodyState = { kind:null, elapsed:0 };
    this.heroUltimateAimContinuityState = createHeroUltimateAimContinuityState();
    this.heroUltimateActionHandoffState = { normalCast:0 };
    this.heroRenderKinematicState = createHeroKinematicRenderState(this.hero.facing);
    this.heroRenderHitRecoil = 0;
    this.heroCrisisGroundSettleState = { impact:0, settle:0 };
    this.heroLastRenderedBodyOffset = { x:0, y:0 };
    this.heroLastRenderedActionFacing = { ...this.hero.facing };
    this.heroLastRenderedActionPoseStrength = 0;
    this.heroLastRenderedActionOwner = 'movement';
    this.survivalResponseVfx = [];
    this.survivalResponseLastAt = {};
    this.coreGuardDamageSourceHysteresisState=createCoreGuardDamageSourceHysteresisState();
    this.coreGuardDamageSourceLastAt=-99;
    this.coreGuardPressureVectorHysteresisState=createCoreGuardPressureVectorHysteresisState();
    this.coreGuardPressureVectorLastAt=-99;
    this.observedCoreHpForVfx = this.core.hp;
    this.freezeShatterVfx = [];
    this.finalFormWorldVfx = [];
    this.fusionWorldVfx = [];
    this.heroMeterWorldVfx = [];
    this.crystalInteractionLifecycleVfx = [];
    this.bossPhaseTransitionVfx = [];
    this.mapEvolutionAftermathVfx = [];
    this.bossHazardAftermathVfx=[];
    this.bossHazardClearedGroundMemory=[];
    this.currentMythicSafeLanePresentation=null;
    this.safeLaneForecastPromotionHysteresisState=createSafeLaneForecastPromotionHysteresisState();
    this.safeLaneAttentionRecoveryHysteresisState=createSafeLaneAttentionRecoveryHysteresisState();
    this.safeLaneAttentionRecoveryLastAt=-99;
    this.safeLaneHazardOcclusionRecoveryState=createSafeLaneHazardOcclusionRecoveryState();
    this.safeLaneGapFeatherHysteresisState=createSafeLaneGapFeatherHysteresisState();
    this.safeLaneHazardOcclusionRecoveryLastAt=-99;
    this.enemyFinisherVfx=[];
    this.heroCrisisVfx=[];
    this.lastHeroCrisisHpRatio=1;
    this.perfectEvadeTrailVfx=[];
    this.bossCounterplayRewardBurstVfx=[];
    this.objectiveCompletionCeremonyVfx=[];
    this.objectiveActivationMaterializationVfx=[];
    this.bossArenaTransitionWorldVfx=[];
    this.objectiveFailureDissolveVfx=[];
    this.fieldEventLifecycleWorldVfx=[];
    this.fieldEventWorldAnchor=null;
    this.elitePackApproachFormationVfx=[];
    this.bossWeakpointBreakWorldVfx = [];
    this.fieldEvents.reset();
    this.levelUpOverlay.close();
    this.shopOverlay.hide();
    this.queuedLevelUps = 0;
    this.queuedBossRewards = 0;
    this.equipmentState = { coins: startStats.startingGold, weapon: null, armor: null, healingPotions: 1 };
    this.rerollsThisVisit = 0;
    this.shopImpactMessage = '';
    this.damageReasonState = null;
    this.nextShopTokenAt = SHOP_FIRST_TOKEN_AT;
    this.catastrophe = null;
    this.lastCatastropheId = null;
    this.catastropheBannerTimer = 0;
    this.catastropheBannerTransitionProjection = null;
    this.kainOverload = 0;
    this.finalFormMotion = { x: 0, y: 0 };
    this.finalFormFlow = createDefaultFinalFormFlowState();
    this.lastOpeningWaveBeatId = null;
    this.lastOpeningBossEntranceStage = null;
    this.arenaDodgeTracker = createArenaDodgeTracker();
    this.arenaDodgeChain = createArenaDodgeChain();
    this.safeLaneLink = createSafeLaneLink();
    this.arenaEvadeBoostUntilMs = 0;
    this.arenaEvadeMoveMultiplier = 1;
    this.flowImpactTimer = 0;
    this.mythicTacticBoostUntilMs = 0;
    this.mythicTacticBossDamageMultiplier = 1;
    this.mythicTacticAttackLink = null;
    this.mythicPhaseBossId = null;
    this.lastMythicPhase = 0;
    this.recentGoldPerMinute = 0;
    this.thermalRecoveryState = createThermalRecoveryState();
    this.rewardRateWindowStartedAt = 0;
    this.rewardRateWindowStartGold = 0;
    this.heroMeter = createHeroMeterState(heroId);
    this.goldenGoblinEnemyId = null;
    this.supplyCrate = null;
    this.eventToast = '';
    this.eventToastTimer = 0;
    this.eventToastLastLawId = null;
    this.eventToastMythicTacticArchetype = null;
    this.eventToastMythicPhase = null;
    this.eventToastBossArchetype = null;
    this.eventToastBossVariantTier = null;
    this.eventToastApexSecondaryArchetype = null;
    this.eventToastBossWeakpointBreakArchetype = null;
    this.eventToastAscensionMutator = null;
    this.eventToastFatePath = null;
    this.eventToastOathKind = null;
    this.eventToastOathHelper = null;
    this.eventToastContractFamily = null;
    this.eventToastRelicResonance = null;
    this.eventToastNemesisAdaptations = [];
    this.eventToastWorldEvolution = null;
    this.eventToastBossArenaMutation = null;
    this.eventToastHeroMeterId = null;
    this.eventToastArcaneComboFamily = null;
    this.eventToastTacticalStatusIconId = null;
    this.eventToastBuildIdentityId = null;
    this.eventToastSynergyId = null;
    this.eventToastLegendaryItemId = null;
    this.eventToastSpellEvolution = null;
    this.eventToastSpellEvolutionProjection = null;
    this.eventToastRunTraitId = null;
    this.eventToastAscensionSelectionId = null;
    this.eventToastHeroAscensionProjection = null;
    this.eventToastFusionProjection = null;
    this.eventToastBuildOverdriveProjection = null;
    this.eventToastBattlefieldEvolutionProjection = null;
    this.eventToastAscensionTierProjection = null;
    this.eventToastMissionReward = null;
    this.eventToastContractBoonFamily = null;
    this.eventToastFateImpact = null;
    this.eventToastRelicProjection = null;
    this.eventToastOathHelper = null;
    this.eventToastFieldEventId = null;
    this.runFoundationIdentityInitialized = false;
    this.lastRunFoundationTrait = null;
    this.synergyIdentityInitialized = false;
    this.lastSynergyIdentityIds = [];
    this.lastRelicResonanceRelic = null;
    this.lastRelicResonanceTier = 0;
    this.hero.temporaryCooldownMultiplier = 1;
    this.hero.temporaryChainJumpBonus = 0;
    this.activeRelic = null;
    this.pendingBossArchetype = null;
    this.eliteKills = 0;
    this.threatDirective = null;
    this.dangerState = dangerUiState(1, 1);
    this.bossWarningHapticActive = false;
    for (const key of Object.keys(this.actionReadyState)) delete this.actionReadyState[key as import('./config.js').ActionId];
    for (const key of Object.keys(this.ultimatePulseUntil)) delete this.ultimatePulseUntil[key as import('./config.js').ActionId];
    this.legendaryEffects.reset();
    this.runMissions.reset();
    this.battlefieldObjectives.reset();
    this.objectiveRuntime.reset();
    this.objectivePowerTimer = 0;
    this.timeWarpTimer = 0;
    this.timeWarpCooldownMultiplier = 1;
    this.bossEncounter.reset();
    this.bossArena.reset();
    this.bossEncounterNodesDestroyed = 0;
    this.lastBossEncounterDestroyedNodes = 0;
    this.comboRuntime.reset();
    this.fusionRuntime.reset();
    this.fateRuntime.reset();
    this.decisionSessionActive = false;
    this.decisionReplay = null;
    this.decisionPickGuard.resetTransient(this.decisionNowMs());
    this.fateSelectOverlay.hide();
    const runSeed = retryBlueprint?.seed ?? (((Date.now() >>> 0) ^ (heroId === 'arkan' ? 0x11aacc : heroId === 'seria' ? 0x22bbdd : heroId === 'kain' ? 0x33ccee : 0x44ddff) ^ (this.runThreatLevel << 24)) >>> 0);
    this.endlessState = createDefaultEndlessState(runSeed);
    this.currentRunBlueprint = { version: 1, heroId, traitId, threatLevel: this.runThreatLevel, mapId: this.terrain.currentLayout.id, seed: runSeed };
    this.saveStoredRetryBlueprint(this.currentRunBlueprint);
    this.frameEndlessEvents.length = 0;
    this.endlessBossStartedAt = 0;
    this.endlessBossCoreHpAtStart = this.core.hp;
    this.endlessBossKey = null;
    this.nextSnapshotAt = 15;
    this.nextRecoveryJournalAt = 60;
    this.syncEquipmentState();
  }

  private update(dt: number): void {
    this.hapticArbiter.clear();
    if (this.paused || this.pauseState.paused || this.gameOver) {
      this.input.endFrame();
      return;
    }

    this.frameEndlessEvents.length = 0;
    this.elapsed += dt;
    this.finalFormFlow = advanceFinalFormFlow(this.finalFormFlow, this.elapsed * 1000);
    if (this.elapsed >= this.nextSnapshotAt) {
      this.saveCurrentRunSnapshot();
      this.nextSnapshotAt = this.elapsed + 15;
    }
    if (this.elapsed >= this.nextRecoveryJournalAt) {
      this.saveCurrentRunSnapshot();
      try {
        if (typeof window !== 'undefined' && this.resumeSnapshot) appendRecoveryCheckpoint(this.storage, this.resumeSnapshot);
      } catch { /* optional recovery persistence */ }
      this.nextRecoveryJournalAt = this.elapsed + 60;
    }
    this.fateRuntime.update(this.elapsed);
    if (this.fateRuntime.pending) {
      this.continueDecisionSession();
      this.input.endFrame();
      return;
    }
    this.bossPhaseCueTimer = Math.max(0, this.bossPhaseCueTimer - dt);
    this.killChainCueTimer = Math.max(0, this.killChainCueTimer - dt);
    this.flowImpactTimer = Math.max(0, this.flowImpactTimer - dt);
    this.heroRenderHitRecoil = Math.max(0, this.heroRenderHitRecoil - dt / (this.presentationSettings.reducedMotion ? 0.09 : 0.14));
    this.heroCrisisGroundSettleState = advanceHeroCrisisGroundSettleState(this.heroCrisisGroundSettleState, null, dt, this.presentationSettings.reducedMotion);
    this.heroCastCadenceState = advanceHeroCastCadenceState(this.heroCastCadenceState, false, dt, this.presentationSettings.reducedMotion);
    this.heroCastAimHoldState = advanceHeroCastAimHoldState(this.heroCastAimHoldState, null, dt, this.presentationSettings.reducedMotion);
    this.heroActionTransitionState = advanceHeroActionTransitionState(this.heroActionTransitionState, null, dt, this.presentationSettings.reducedMotion);
    this.heroUltimateBodyState = advanceHeroUltimateBodyState(this.heroUltimateBodyState, null, dt, this.presentationSettings.reducedMotion);
    this.heroUltimateAimContinuityState = advanceHeroUltimateAimContinuityState(this.heroUltimateAimContinuityState, null, dt, this.presentationSettings.reducedMotion);
    this.heroUltimateActionHandoffState = advanceHeroUltimateActionHandoffState(this.heroUltimateActionHandoffState, false, dt, this.presentationSettings.reducedMotion);
    if (this.heroCastRenderCast > 0) {
      this.heroCastRenderCast = Math.max(0, this.heroCastRenderCast - dt / (this.presentationSettings.reducedMotion ? 0.2 : 0.24));
      if (this.heroCastRenderCast <= 0) this.heroCastRenderRecover = Math.max(this.heroCastRenderRecover, 1);
    } else {
      this.heroCastRenderRecover = Math.max(0, this.heroCastRenderRecover - dt / (this.presentationSettings.reducedMotion ? 0.16 : 0.22));
    }
    this.presentation.update(dt, this.flowImpactTimer > 0 ? .1 : 1, cosmeticMotionScale(this.presentationSettings));
    this.fusionRuntime.update(dt);
    this.updateCatastrophe(dt);
    this.eventToastTimer = Math.max(0, this.eventToastTimer - dt);
    this.damageReasonState = advanceDamageReason(this.damageReasonState, this.elapsed);
    const nextThreat = threatDirectiveAt(this.elapsed);
    if (nextThreat?.id !== this.threatDirective?.id) {
      this.threatDirective = nextThreat;
      if (nextThreat) this.showTacticalStatusEventToast(`전투 지시 · ${nextThreat.name}`, nextThreat.id);
    } else this.threatDirective = nextThreat;
    const eventTransition = this.fieldEvents.update(dt, this.elapsed, this.enemies.bossCountdown);
    if (eventTransition.started) this.handleFieldEventStart(eventTransition.started);
    if (eventTransition.ended) this.handleFieldEventEnd(eventTransition.ended);
    const objectiveTransition = this.battlefieldObjectives.update(dt, this.elapsed, this.enemies.bossCountdown);
    if (objectiveTransition.started) {
      const pos = chooseObjectiveAnchor(this.terrain.currentLayout.id, this.terrain.evolutionStage, this.hero.pos);
      this.objectiveRuntime.begin(objectiveTransition.started.id, pos);
      this.queueObjectiveActivationMaterializationVfx(objectiveTransition.started.id,pos.x,pos.y);
      this.showTacticalStatusEventToast(`전장 목표 · ${objectiveTransition.started.name}`, objectiveTransition.started.id);
    }
    if (objectiveTransition.ended && this.objectiveRuntime.active) {
      const failedAnchor={x:this.objectiveRuntime.active.pos.x,y:this.objectiveRuntime.active.pos.y};
      const failed = this.objectiveRuntime.failActive();
      if (failed.failed) { this.queueObjectiveFailureDissolveVfx(objectiveTransition.ended.id,failedAnchor.x,failedAnchor.y); this.showTacticalStatusEventToast('전장 목표 실패', objectiveTransition.ended.id); }
    }
    this.objectivePowerTimer = Math.max(0, this.objectivePowerTimer - dt);
    this.timeWarpTimer = Math.max(0, this.timeWarpTimer - dt);
    if (this.timeWarpTimer <= 0) this.timeWarpCooldownMultiplier = 1;
    const eventMods = fieldEventModifiers(this.fieldEvents.active);
    const catastropheMods = catastropheModifiers(this.catastrophe);
    const threatMods = threatDirectiveModifiers(this.threatDirective);
    const cursedActive = this.objectiveRuntime.active?.id === 'cursedAltar' && this.objectiveRuntime.active.activated;
    const objectiveMods = composeObjectiveCombatModifiers(this.objectivePowerTimer, cursedActive);
    const basePressure = composeEnemyPressure(eventMods, catastropheMods, threatMods);
    const baseThreatPressure = composeThreatPressure(basePressure, threatLevelModifiers(this.runThreatLevel));
    const fateMods = this.fateRuntime.modifiers;
    const fatePressure = composeFatePressure(baseThreatPressure, fateMods);
    const endlessMods = composeEndlessHostModifiers(this.endlessState, this.runThreatLevel);
    const ascensionMutatorMods = ascensionMutatorRuntimeModifiers(this.endlessState.ascension.mutators);
    const contractMods = getContractModifiers(this.endlessState.contracts, this.elapsed * 1000);
    const adaptive = this.currentAdaptiveDirector();
    const openingPacing = openingCombatPacing(this.elapsed);
    const firstThirty = firstThirtyMinuteProfile(this.elapsed);
    const openingCeremony = openingWaveCeremony(this.elapsed);
    if (openingCeremony.beatId && openingCeremony.beatId !== this.lastOpeningWaveBeatId) {
      this.lastOpeningWaveBeatId = openingCeremony.beatId;
      this.showEventToast(`${openingCeremony.label} · 전투 밀도 상승`);
      this.presentation.emitTelegraph({ x:this.hero.pos.x, y:this.hero.pos.y, radius:120*openingCeremony.telegraphPulse, color:'#ffd36a', ttl:.85, width:4, alpha:.72 });
    }
    const bossEntrance = openingBossEntrance(this.elapsed);
    if (bossEntrance.stage && bossEntrance.stage !== this.lastOpeningBossEntranceStage) {
      this.lastOpeningBossEntranceStage = bossEntrance.stage;
      this.showEventToast(`${bossEntrance.label} · 보스 진입`);
      if (bossEntrance.soundKind) this.audio.play(bossEntrance.soundKind);
      this.presentation.emitTelegraph({ x:this.core.pos.x, y:this.core.pos.y, radius:bossEntrance.telegraphRadius, color:'#ff736b', ttl:.75, width:5, alpha:.78 });
      this.feedback.addImpact(this.core.pos, bossEntrance.stage === 'arrival' ? 'bossHit' : 'awakened');
    }
    const pressure = {
      ...fatePressure,
      spawnPressureMultiplier: fatePressure.spawnPressureMultiplier * objectiveMods.spawnPressureMultiplier * endlessMods.spawnPressureMultiplier * adaptive.compositionPressureMultiplier * openingPacing.spawnPressureMultiplier * firstThirty.spawnPressureMultiplier * openingCeremony.spawnPulse,
      eliteIntervalMultiplier: fatePressure.eliteIntervalMultiplier * endlessMods.eliteIntervalMultiplier * adaptive.eliteIntervalMultiplier * openingPacing.eliteIntervalMultiplier * firstThirty.eliteIntervalMultiplier,
    };
    if (this.elapsed >= this.nextShopTokenAt) {
      const firstScheduledShopToken = this.nextShopTokenAt === SHOP_FIRST_TOKEN_AT;
      this.shopTokens += 1;
      if (firstScheduledShopToken) this.showEventToast('상점권 획득 · 추천 구매 1탭');
      this.nextShopTokenAt += SHOP_TOKEN_INTERVAL * ascensionMutatorMods.shopIntervalMultiplier / Math.max(1, fateRewardMultipliers(this.fateRuntime.modifiers).shopTokenMultiplier);
    }

    this.input.refreshKeyboardMovement();
    if (this.input.consumePressed('potion')) this.useHealingPotion();
    if (this.input.consumePressed('auto')) {
      this.autoCastNormal = !this.autoCastNormal;
      this.manualTargetMemory.clear();
    }
    if (this.input.consumePressed('shop') && this.shopTokens > 0) {
      this.openShop();
      this.input.endFrame();
      return;
    }

    const desiredMove = this.input.move;
    const movementForm = this.currentHeroFinalForm();
    this.finalFormMotion = advanceFinalFormMotion(this.finalFormMotion, desiredMove, dt, movementForm?.id ?? null);
    const move = this.finalFormMotion;
    const isMoving = Math.hypot(move.x, move.y) > .01;
    if ((desiredMove.x !== 0 || desiredMove.y !== 0) && this.onboarding.signal('move')) this.saveStoredOnboardingState();
    const runtimeProcs = this.legendaryEffects.update(dt, this.equipmentState, {
      heroHpRatio: this.hero.hp / Math.max(1, this.hero.maxHp),
      coreHpRatio: this.core.hp / Math.max(1, this.core.maxHp),
      moving: isMoving,
    });
    this.applyLegendaryProcs(runtimeProcs, this.hero.pos);
    this.advanceHeroMeter(dt, { moving: isMoving });
    this.updateArcaneCombo();
    this.syncSynergyIdentityTracker();
    const combatBuild = this.currentCombatBuild();
    this.syncEquipmentState(combatBuild);
    let heroTempoMultiplier = 1;
    if (this.hero.profileId === 'kain') {
      this.kainOverload = kainOverloadNext(this.kainOverload, isMoving, dt, combatBuild.kainOverloadGainMultiplier);
      heroTempoMultiplier = kainOverloadCooldownMultiplier(this.kainOverload, combatBuild.kainOverloadMaxCooldownReduction);
    } else {
      this.kainOverload = 0;
    }
    this.hero.temporaryCooldownMultiplier = heroTempoMultiplier * eventMods.cooldownMultiplier * catastropheMods.cooldownMultiplier * nullifierCooldownMultiplier(this.enemies.enemies, this.hero.pos) * this.timeWarpCooldownMultiplier * contractMods.cooldownMultiplier;
    if (isMoving) {
      this.hero.facing = normalize(move);
      this.hero.pos.x = clamp(this.hero.pos.x + move.x * this.hero.speed * this.hero.equipmentMoveSpeed * dt, ARENA_MARGIN, LOGICAL_WIDTH - ARENA_MARGIN);
      this.hero.pos.y = clamp(this.hero.pos.y + move.y * this.hero.speed * this.hero.equipmentMoveSpeed * dt, ARENA_MARGIN + 55, LOGICAL_HEIGHT - ARENA_MARGIN);
      this.terrain.resolveHero(this.hero);
    }
    const heroMotionTarget = isMoving ? 1 : 0;
    this.heroRenderMotionBlend += (heroMotionTarget - this.heroRenderMotionBlend) * Math.min(1, dt * (heroMotionTarget > this.heroRenderMotionBlend ? 10 : 6));
    this.heroRenderMotionBlend = clamp(this.heroRenderMotionBlend, 0, 1);
    this.heroRenderStride += dt * (4 + this.heroRenderMotionBlend * 8);
    const previousFacingAngle = Math.atan2(this.heroRenderPreviousFacing.y, this.heroRenderPreviousFacing.x);
    const currentFacingAngle = Math.atan2(this.hero.facing.y, this.hero.facing.x);
    let turnDelta = currentFacingAngle - previousFacingAngle;
    while (turnDelta > Math.PI) turnDelta -= Math.PI * 2;
    while (turnDelta < -Math.PI) turnDelta += Math.PI * 2;
    const turnTarget = isMoving ? clamp(turnDelta / 0.55, -1, 1) * this.heroRenderMotionBlend : 0;
    this.heroRenderTurnTilt += (turnTarget - this.heroRenderTurnTilt) * Math.min(1, dt * (isMoving ? 12 : 7));
    if (!isMoving && this.heroRenderLastMoving) this.heroRenderRecoveryBlend = Math.max(this.heroRenderRecoveryBlend, this.heroRenderMotionBlend || 0.85);
    this.heroRenderRecoveryBlend = Math.max(0, this.heroRenderRecoveryBlend - dt * (this.presentationSettings.reducedMotion ? 3.2 : 2.4));
    this.heroRenderLastMoving = isMoving;
    this.heroRenderPreviousFacing = { ...this.hero.facing };
    this.heroRenderKinematicState = advanceHeroKinematicRenderState(this.heroRenderKinematicState, move, this.hero.facing, dt);
    this.updateSupplyCrate();
    this.syncBossEncounter();
    this.bossEncounter.update(dt);
    this.enemies.setBossEncounterModifiers(this.endlessBossEncounterModifiers(this.bossEncounter.modifiers));
    this.enemies.setEndlessScaling(
      endlessMods.enemyHealthMultiplier,
      endlessMods.enemyDamageMultiplier,
      endlessMods.projectilePressureMultiplier * ascensionMutatorMods.projectileSpeedMultiplier,
      ascensionMutatorMods.eliteHealthMultiplier,
    );

    if (this.autoCastNormal) this.autoTargetId = chooseSpellTarget(this.enemies.enemies, this.hero.pos, this.core.pos, true, this.autoTargetId)?.id ?? null;
    else this.autoTargetId = null;
    const spellWorld: SpellWorld = { hero: this.hero, core: this.core, enemies: this.enemies, terrain: this.terrain, feedback: this.feedback, magicTargets: this.bossEncounter, weakpointAim:this.bossEncounter, fusions: this.fusionRuntime.equipped, preferredAutoTargetId:this.autoTargetId, preferredManualTargetId:null, visualBodyOffset:this.heroLastRenderedBodyOffset, visualActionFacing:this.heroLastRenderedActionFacing, visualActionPoseStrength:this.heroLastRenderedActionPoseStrength, visualActionOwner:this.heroLastRenderedActionOwner, reducedMotion:this.presentationSettings.reducedMotion, reducedFlash:this.presentationSettings.reducedFlash };
    this.flushBufferedManualCasts(spellWorld);
    for (const action of COMBAT_CAST_ACTIONS) {
      if (this.input.consumePressed(action)) this.handleManualCastPress(action, spellWorld);
    }
    for (const action of ['spell1', 'spell2', 'spell3', 'spell4'] as const) {
      const held = this.input.isHeld(action);
      const { autoTriggered } = openingAutoCastIntent(this.autoCastNormal, held);
      if (held && !autoTriggered && this.spells.cooldownRemaining(action) <= 0) this.prepareManualTarget(spellWorld);
      if ((autoTriggered || held) && this.spells.tryCast(action, { ...spellWorld, autoAim:autoTriggered })) this.handleSuccessfulCast(action, autoTriggered ? 'auto' : 'manual');
    }
    this.spells.update(dt, spellWorld);
    this.syncBossWeakpointBreakFeedback();

    const edricAuraRadius = 220 + combatBuild.edricAuraRadiusBonus;
    const edricAura = this.hero.profileId === 'edric' && distance(this.hero.pos, this.core.pos) <= edricAuraRadius;
    this.enemies.update(dt, {
      hero: this.hero,
      core: this.core,
      elapsed: this.elapsed,
      enemySpeedMultiplier: pressure.enemySpeedMultiplier,
      spawnPressureMultiplier: pressure.spawnPressureMultiplier,
      eliteIntervalMultiplier: pressure.eliteIntervalMultiplier,
      ...(pressure.regularWeights ? { regularWeights: pressure.regularWeights } : {}),
      bossVariantBonus: pressure.bossVariantBonus,
      apexThreatLevel: this.runThreatLevel,
      reducedMotion: this.presentationSettings.reducedMotion,
      bossCurve: bossDifficultyCurve,
      mythicTacticAttackLink: this.mythicTacticAttackLink,
      onMythicTacticAttackLinkConsumed: (archetype) => {
        this.mythicTacticAttackLink = null;
        this.emitMythicTacticLinkFeedback(archetype);
      },
      onTimeWarp: (multiplier, duration) => {
        this.timeWarpCooldownMultiplier = Math.max(this.timeWarpCooldownMultiplier, multiplier);
        this.timeWarpTimer = Math.max(this.timeWarpTimer, duration);
        this.showEventToast('시간 왜곡 · 영창 지연');
      },
      onHeroDamage: (amount, source = 'contact') => {
        const auraMultiplier = edricAura ? combatBuild.edricHeroAuraMultiplier : 1;
        const applied = amount * this.hero.equipmentDamageTakenMultiplier * this.runHeroDamageTakenMultiplier * auraMultiplier;
        const beforeHpRatio=this.hero.hp/Math.max(1,this.hero.maxHp);
        this.hero.hp = Math.max(0, this.hero.hp - applied);
        const afterHpRatio=this.hero.hp/Math.max(1,this.hero.maxHp);
        if (applied > 0) {
          this.queueHeroResponseVfx('hit', Math.min(1.25, applied / Math.max(1, this.hero.maxHp) * 8 + .62));
          const damageRatio=applied/Math.max(1,this.hero.maxHp);
          const crisisKind:HeroCrisisVfxState=damageRatio>=.32?'critical':damageRatio>=.12?'heavy':'hit';
          if(beforeHpRatio>.22&&afterHpRatio<=.22)this.queueHeroCrisisVfx('nearDeath');else this.queueHeroCrisisVfx(crisisKind);
          this.frameEndlessEvents.push({ type: 'hero_damaged', amount: applied });
          this.damageReasonState = recordDamageReason(this.damageReasonState, source, applied, this.hero.maxHp, this.elapsed);
        }
        const prevented=Math.max(0,amount-applied);
        if(prevented>=this.hero.maxHp*.002)this.queueSurvivalResponseVfx('heroGuard');
        this.advanceHeroMeter(0, { preventedDamageRatio: Math.max(0, amount - applied) / Math.max(1, this.hero.maxHp) });
        return applied;
      },
      onCoreDamage: (amount, source = 'contact', origin) => {
        const applied = amount * this.hero.equipmentCoreDamageTakenMultiplier * this.runCoreDamageTakenMultiplier * fateRewardMultipliers(this.fateRuntime.modifiers).coreDamageTakenMultiplier * catastropheMods.coreDamageMultiplier * contractMods.coreDamageTakenMultiplier * (edricAura ? combatBuild.edricCoreAuraMultiplier : 1);
        this.core.hp = Math.max(0, this.core.hp - applied);
        const prevented=Math.max(0,amount-applied),mitigationRatio=amount>0?Math.max(0,Math.min(1,prevented/amount)):0;
        if (applied > 0) { this.frameEndlessEvents.push({ type: 'core_damaged', amount: applied }); this.queueSurvivalResponseVfx('coreHit',{mitigationRatio,damageSource:source,...(origin?{pressureVector:{x:this.core.pos.x-origin.x,y:this.core.pos.y-origin.y}}:{})}); }
        if(prevented>=this.core.maxHp*.002)this.queueSurvivalResponseVfx('coreGuard');
        if (applied > 0 && this.onboarding.signal('core')) this.saveStoredOnboardingState();
        this.advanceHeroMeter(0, { preventedDamageRatio: Math.max(0, amount - applied) / Math.max(1, this.core.maxHp) });
        void source;
        return applied;
      },
    });

    this.syncBossEncounter();
    this.updateBossArena(dt);
    this.updateBattlefieldObjective(dt);
    this.updateBossPresentation();
    const evolved = this.terrain.updateEvolution(this.elapsed);
    if (evolved) { this.showBattlefieldEvolutionToast(evolved); this.emitMapEvolutionVfx(evolved); }
    this.updateMapEnvironmentVfx(dt);
    this.terrain.update(dt, this.enemies);
    this.emitTerrainDestructionVfx();
    this.feedback.update(dt);
    this.processEnemyDeaths();
    this.pickups.update(dt, this.hero, {
      onXp: (value) => this.gainXp(value),
      onCoin: (value) => {
        this.equipmentState = { ...this.equipmentState, coins: this.equipmentState.coins + value };
        this.hero.coins = this.equipmentState.coins;
        this.goldEarned += value;
        this.audio.play('coin');
      },
    });
    this.updateLongRunRewardRate();
    this.updateEndlessFieldNodes();
    this.updateEndlessRuntime(dt);
    this.updateRelicResonanceRecall();

    this.updateRunMission(dt);
    this.updateCriticalFeedback();
    this.updateBossSafeResponseWindowConfirmation();

    this.continueDecisionSession();
    if (this.decisionSessionActive || this.paused || this.pauseState.paused || this.shopOverlay.isOpen) this.hapticArbiter.clear();
    else this.flushCombatHaptics();
    if (this.hero.hp <= 0 || this.core.hp <= 0) this.endRun();
    this.input.endFrame();
  }

  private updateLongRunRewardRate(): void {
    if (this.elapsed - this.rewardRateWindowStartedAt < 60) return;
    const minutes = Math.max(1 / 60, (this.elapsed - this.rewardRateWindowStartedAt) / 60);
    this.recentGoldPerMinute = Math.max(0, (this.goldEarned - this.rewardRateWindowStartGold) / minutes);
    this.rewardRateWindowStartedAt = this.elapsed;
    this.rewardRateWindowStartGold = this.goldEarned;
  }

  private processEnemyDeaths(): void {
    for (let wave = 0; wave < 6; wave++) {
      const deaths = this.enemies.drainDeaths();
      if (deaths.length === 0) break;
      for (const death of deaths) {
        this.hero.kills += 1;
        this.frameEndlessEvents.push({ type: 'enemy_killed', elite: death.type === 'elite' || death.type === 'boss' });
        this.advanceHeroMeter(0, heroMeterKillSignals(this.hero.profileId, death));
        if(death.wasSlowed)this.queueFreezeShatterVfx(death.type,death.x,death.y);
        if (this.hero.profileId === 'seria' && death.wasSlowed && this.heroMeter.activeTimer > 0) this.triggerSeriaShatter(death);
        const eventMods = fieldEventModifiers(this.fieldEvents.active);
        const catastropheMods = catastropheModifiers(this.catastrophe);
        const combatBuild = this.currentCombatBuild();
        const fateRewards = fateRewardMultipliers(this.fateRuntime.modifiers);
        const endlessRewardMods = composeEndlessHostModifiers(this.endlessState, this.runThreatLevel);
        const contractRewardMods = getContractModifiers(this.endlessState.contracts, this.elapsed * 1000);
        const oathRewardMods = longRunOathModifiers(this.endlessState.oaths, this.elapsed * 1000);
        const openingReward = openingCombatPacing(this.elapsed).rewardMultiplier * openingWaveCeremony(this.elapsed).rewardPulse * firstThirtyMinuteProfile(this.elapsed).rewardMultiplier;
        const longRunReward = longRunRewardDensityPolicy(this.elapsed, this.recentGoldPerMinute);
        const goldMultiplier = eventMods.goldMultiplier * catastropheMods.goldMultiplier * combatBuild.goldMultiplier * this.runGoldMultiplier * fateRewards.goldMultiplier * endlessRewardMods.goldMultiplier * contractRewardMods.goldMultiplier * oathRewardMods.goldMultiplier * openingReward;
        this.pickups.spawnDeath({ ...death, xp: Math.max(1, Math.round(death.xp * fateRewards.xpMultiplier * contractRewardMods.xpMultiplier * openingReward * longRunReward.xpMultiplier)), gold: Math.max(1, Math.round(death.gold * goldMultiplier * longRunReward.goldMultiplier)) });
        this.feedback.addKill({ x: death.x, y: death.y }, death.type === 'boss');
        const killChainCue=this.killChainVfx.record(this.elapsed);
        if(killChainCue){
          this.killChainCue=killChainCue; this.killChainCueTimer=0.72;
          const chainVfx=killChainVfxProfile(killChainCue.tier);
          this.presentation.emitScreenEffect({kind:'pulse',x:death.x,y:death.y,radius:80+killChainCue.tier*34,color:chainVfx.color,ttl:0.20+killChainCue.tier*0.035,alpha:chainVfx.pulseAlpha,width:3+killChainCue.tier});
          this.feedback.addCameraPressure('killChain');
        }
        this.queueEnemyFinisherVfx(death.visualSource??'normal',death.x,death.y,death.type,death.deathPose?.tier??'normal');
        if(death.type!=='boss'&&death.deathPose)this.enemyDefeatBodyTransitions.push({death:death as EnemyDeathEvent&{type:Exclude<EnemyType,'boss'>},startedAt:this.elapsed,until:this.elapsed+(this.presentationSettings.reducedMotion?.22:.34)});
        if(this.enemyDefeatBodyTransitions.length>20)this.enemyDefeatBodyTransitions.splice(0,this.enemyDefeatBodyTransitions.length-20);
        this.emitDeathPresentation(death);
        if(death.type==='boss'){
          const archetype=death.bossArchetype??'inferno'; this.queueBossArenaTransitionWorldVfx(archetype,'exit',death.x,death.y,72); const cinematic=bossLifecycleCinematicProfile(archetype,'death');
          for(let i=0;i<cinematic.shockwaveCount;i++) this.presentation.emitScreenEffect({kind:'shockwave',x:death.x,y:death.y,radius:118+i*42,color:cinematic.color,ttl:.26+i*.055,alpha:Math.min(.30,cinematic.flashAlpha),width:4+i*.6});
          this.presentation.emitScreenEffect({kind:'glow',x:death.x,y:death.y,radius:240,color:cinematic.color,ttl:cinematic.duration,alpha:cinematic.flashAlpha});
          for(let i=0;i<cinematic.rayCount;i++){const a=Math.PI*2*i/cinematic.rayCount;this.presentation.emitTrail({x1:death.x+Math.cos(a)*38,y1:death.y+Math.sin(a)*38,x2:death.x+Math.cos(a)*(118+(i%3)*24),y2:death.y+Math.sin(a)*(118+(i%3)*24),color:cinematic.color,ttl:.24,alpha:.56,width:2.4});}
          this.feedback.addCameraPressure('bossDeath');
          const settle=bossSettleProfile(archetype,this.presentation.quality);
          for(let i=0;i<settle.rayCount;i++){const a=Math.PI*2*i/Math.max(1,settle.rayCount);this.presentation.emitTrail({x1:death.x+Math.cos(a)*settle.radius*.20,y1:death.y+Math.sin(a)*settle.radius*.20,x2:death.x+Math.cos(a)*settle.radius,y2:death.y+Math.sin(a)*settle.radius,color:settle.color,ttl:settle.ttl,alpha:settle.alpha,width:1.6+(i%2)*.4});}
          this.presentation.emitParticle({x:death.x,y:death.y,vx:0,vy:cosmeticMotionVelocity(-14,this.presentationSettings.reducedMotion),color:settle.color,ttl:settle.ttl,size:8,alpha:settle.alpha});
        }
        const mutatorRuntime = ascensionMutatorRuntimeModifiers(this.endlessState.ascension.mutators);
        if (mutatorRuntime.volatileDeath.enabled && (death.type === 'elite' || death.type === 'bomber')) {
          const blastDistance = Math.hypot(this.hero.pos.x - death.x, this.hero.pos.y - death.y);
          if (blastDistance <= mutatorRuntime.volatileDeath.radius + this.hero.radius) {
            const falloff = Math.max(.35, 1 - blastDistance / Math.max(1, mutatorRuntime.volatileDeath.radius));
            const applied = mutatorRuntime.volatileDeath.damage * falloff * this.hero.equipmentDamageTakenMultiplier * this.runHeroDamageTakenMultiplier;
            this.hero.hp = Math.max(0, this.hero.hp - applied);
            if(applied>0)this.queueHeroResponseVfx('hit',.92);
            this.feedback.addImpact({ x: death.x, y: death.y }, 'eliteKill');
          }
        }
        if (death.type === 'elite') {
          this.audio.play('eliteDeath');
          this.eliteKills += 1;
          this.feedback.addImpact({ x: death.x, y: death.y }, 'eliteKill');
        }
        this.applyLegendaryProcs(this.legendaryEffects.onKill(death.type, this.equipmentState), { x: death.x, y: death.y });
        if (death.type === 'golden') {
          this.goldenGoblinEnemyId = null;
          if (this.fieldEvents.active?.id === 'goldenGoblin') { const ended=this.fieldEvents.completeActive(this.elapsed);if(ended)this.finishFieldEventLifecycleWorldVfx(ended); }
          this.showTacticalStatusEventToast(`황금 고블린 처치! +${Math.round(death.gold * goldMultiplier).toLocaleString()}G`, 'goldenGoblin');
        }
        if (death.type === 'boss') {
          this.audio.play('eliteDeath');
          this.bossesKilled += 1;
          this.shopTokens += 1;
          this.queuedBossRewards += 1;
          this.pendingBossArchetype = death.bossArchetype ?? null;
          const bossId = death.bossArchetype ?? this.endlessBossKey ?? 'boss';
          this.frameEndlessEvents.push({
            type: 'boss_defeated', bossId,
            durationMs: Math.max(0, (this.elapsed - this.endlessBossStartedAt) * 1000),
            coreDamage: Math.max(0, this.endlessBossCoreHpAtStart - this.core.hp),
          });
          this.endlessBossKey = null;
        }
        if (this.hero.profileId === 'arkan' && death.type !== 'boss') {
          if (Math.random() < 0.18 + combatBuild.arkanExplosionChanceBonus) this.triggerArkanExplosion(death, combatBuild);
        }
      }
    }
  }

  private triggerArkanExplosion(death: EnemyDeathEvent, build: CombatBuildModifiers = this.currentCombatBuild()): void {
    const damage = 48 * this.hero.spellPower * this.hero.equipmentSpellPower;
    const radius = 105 * build.arkanExplosionRadiusMultiplier;
    for (const enemy of this.enemies.enemies) {
      if (enemy.alive && Math.hypot(enemy.pos.x - death.x, enemy.pos.y - death.y) <= radius + enemy.radius) this.enemies.damage(enemy, damage, undefined, 'explosion');
    }
  }

  private updateEndlessRuntime(dt: number): void {
    const previousOverdriveActivations = this.endlessState.overdrive.activations;
    const previousFinalForm = deriveHeroFinalForm(this.hero.profileId, this.endlessState.heroAscension.selected, Math.max(0, this.elapsed - dt) * 1000);
    const legacy = buildLegacyRunView({
      heroId: this.hero.profileId,
      elapsedSeconds: this.elapsed,
      level: this.hero.level,
      threat: this.runThreatLevel,
      kills: this.hero.kills,
      bossesDefeated: this.bossesKilled,
      elitesDefeated: this.eliteKills,
      gold: this.equipmentState.coins,
      xp: this.hero.xp,
      guardianCoreHp: this.core.hp,
      guardianCoreMaxHp: this.core.maxHp,
      fateChoices: this.fateRuntime.choices,
      spellFusionCount: this.fusionRuntime.equipped.length,
      mapEvolutionRank: this.terrain.evolutionStage,
      masteryLevel: this.masteryProfile.heroes[this.hero.profileId].level,
      presentationQuality: this.presentationSettings.quality,
    });
    const result = advanceEndlessRuntime({ legacy, state: this.endlessState, deltaMs: Math.max(0, dt * 1000), events: this.frameEndlessEvents });
    this.endlessState = result.state;
    for (const effect of result.effects) this.applyEndlessEffect(effect);
    if (this.endlessState.overdrive.activations > previousOverdriveActivations) {
      this.showBuildOverdriveActivationToast(this.currentBuildArchetype(), this.endlessState.overdrive);
    }
    const finalForm = this.currentHeroFinalForm();
    if (!previousFinalForm && finalForm) { this.showEventToast(`최종 변신 · ${finalForm.name}`); this.showFinalFormTransformationCue(finalForm); }
  }

  private applyEndlessEffect(effect: EndlessEffect): void {
    if (effect.type === 'show_contract_offer') this.showEventToast('런 계약 도착 · 3가지 중 하나를 선택하세요');
    else if (effect.type === 'contract_reward') {
      const boon=activeRunContractBoonRecall(this.endlessState.contracts.boons,this.elapsed*1000);
      if(boon)this.showRunContractSuccessToast(boon.family);else this.showEventToast('런 계약 성공 · 90초 강화 획득');
    }
    else if (effect.type === 'contract_failed') this.showEventToast('런 계약 실패 · 다음 계약을 노리세요', null, null, null, null, null, effect.family as ContractFamily);
    else if (effect.type === 'world_evolved') this.showEventToast(`전장 변이 · ${this.endlessWorldName(effect.world)}`,null,null,null,null,null,null,null,[],effect.world as WorldEvolutionIdentityId);
    else if (effect.type === 'ascension_tier') this.showAscensionTierEventToast(effect.tier);
    else if (effect.type === 'ascension_mutator') this.showAscensionMutatorEventToast(effect);
    else if (effect.type === 'nemesis_updated' && effect.adaptations.length > 0) {
      const adaptations=getBossAdaptations(this.endlessState.nemesis,effect.bossId).slice(0,3),projection=projectNemesisAdaptationEffects(adaptations);
      this.showEventToast(nemesisAdaptationLearningToastLabel(effect.adaptations.length,projection),null,null,null,null,null,null,null,adaptations);
    }
    else if (effect.type === 'show_hero_ascension_offer') this.showEventToast(`영웅 승천 · ${effect.milestone}분 선택 도착`);
    else if (effect.type === 'final_form_signature') {
      this.showEventToast(`SIGNATURE · ${effect.name}`);
      this.presentation.emitTelegraph({ x:this.hero.pos.x, y:this.hero.pos.y, radius:92, color:effect.color, ttl:.9, width:5, alpha:.9 });
      const impulse = signatureMobilityImpulse(this.currentHeroFinalForm()?.id ?? null, this.hero.facing);
      if (impulse.x !== 0 || impulse.y !== 0) {
        this.hero.pos.x = clamp(this.hero.pos.x + impulse.x, ARENA_MARGIN, LOGICAL_WIDTH - ARENA_MARGIN);
        this.hero.pos.y = clamp(this.hero.pos.y + impulse.y, ARENA_MARGIN + 55, LOGICAL_HEIGHT - ARENA_MARGIN);
        this.terrain.resolveHero(this.hero);
      }
      this.triggerFinalFormPattern(effect.formId, effect.color);
    }
    else if (effect.type === 'oath_started') {
      const kind=longRunOathKindFromTitle(effect.title);
      this.showEventToast(`${effect.milestone}분 서약 · ${effect.title}`, null, null, null, null, kind);
      if(kind)this.eventToastOathHelper=oathRequirementBoonIdentity(kind);
    }
    else if (effect.type === 'oath_completed') {
      this.equipmentState = { ...this.equipmentState, coins:this.equipmentState.coins + effect.rewardGold };
      this.hero.coins = this.equipmentState.coins;
      this.goldEarned += effect.rewardGold;
      this.core.hp = Math.min(this.core.maxHp, this.core.hp + this.core.maxHp * effect.coreHealPercent);
      const kind=longRunOathKindFromTitle(effect.title),boonId=this.endlessState.oaths.boon?.kind;
      this.showEventToast(`서약 완수 · ${effect.title} · +${effect.rewardGold}G`, null, null, null, null, kind);
      if(boonId)this.eventToastOathHelper={boonId};
    }
    else if (effect.type === 'oath_failed') { this.showEventToast(`서약 실패 · ${effect.title}`, null, null, null, null, longRunOathKindFromTitle(effect.title)); this.eventToastOathHelper = null; }
    else if (effect.type === 'oath_expired') { this.showEventToast(`서약 종료 · ${effect.title}`, null, null, null, null, longRunOathKindFromTitle(effect.title)); this.eventToastOathHelper = null; }
    else if (effect.type === 'run_checkpoint') {
      this.saveCurrentRunSnapshot();
      try {
        if (typeof window !== 'undefined' && this.resumeSnapshot) appendRecoveryCheckpoint(this.storage, this.resumeSnapshot);
      } catch { /* optional recovery persistence */ }
      this.showEventToast(`${effect.title} · 자동 저장 완료`);
    }
    else if (effect.type === 'run_milestone_recap') this.showEventToast(`${effect.title} · ${effect.headline} · K+${effect.killsDelta} B+${effect.bossesDelta}`);
    else if (effect.type === 'chronicle_milestone') {
      this.equipmentState = { ...this.equipmentState, coins: this.equipmentState.coins + effect.rewardGold };
      this.hero.coins = this.equipmentState.coins;
      this.goldEarned += effect.rewardGold;
      this.core.hp = Math.min(this.core.maxHp, this.core.hp + this.core.maxHp * effect.coreHealPercent);
      this.showEventToast(`${effect.minute}분 연대기 · ${effect.title} · +${effect.rewardGold}G`);
    }
  }

  private triggerFinalFormPattern(formId: string, color: string): void {
    const pattern = finalFormAttackPattern(formId);
    if (!pattern) return;
    const link = finalFormFlowLink(formId, this.finalFormFlow.streak);
    const radius = pattern.radius * (link?.radiusMultiplier ?? 1);
    this.queueFinalFormWorldVfx(formId, link ? 'flow' : 'signature', this.hero.pos.x, this.hero.pos.y, radius);
    const pushDistance = pattern.pushDistance * (link?.pushMultiplier ?? 1);
    const slowDuration = pattern.slowDuration + (link?.slowDurationBonus ?? 0);
    const baseDamage = 72 * this.hero.spellPower * this.hero.equipmentSpellPower * pattern.damageMultiplier * (link?.damageMultiplier ?? 1);
    const living = this.enemies.enemies.filter((enemy) => enemy.alive);
    if (pattern.kind === 'chain') {
      const targets = living
        .filter((enemy) => distance(enemy.pos, this.hero.pos) <= radius + enemy.radius)
        .sort((a, b) => distance(a.pos, this.hero.pos) - distance(b.pos, this.hero.pos))
        .slice(0, pattern.chainTargets + (link?.chainBonus ?? 0));
      for (const enemy of targets) {
        if(this.enemies.damage(enemy, baseDamage))this.enemies.markLastDeathVisualSource('finalForm');
        if (slowDuration > 0) this.enemies.applySlow(enemy, pattern.slowFactor, slowDuration);
      }
    } else {
      for (const enemy of living) {
        if (distance(enemy.pos, this.hero.pos) > radius + enemy.radius) continue;
        if(this.enemies.damage(enemy, baseDamage))this.enemies.markLastDeathVisualSource('finalForm');
        if (pushDistance > 0) this.enemies.pushAway(enemy, this.hero.pos, pushDistance);
        if (slowDuration > 0) this.enemies.applySlow(enemy, pattern.slowFactor, slowDuration);
      }
    }
    if (pattern.coreHealPercent > 0) this.core.hp = Math.min(this.core.maxHp, this.core.hp + this.core.maxHp * pattern.coreHealPercent);
    this.presentation.emitTelegraph({ x:this.hero.pos.x, y:this.hero.pos.y, radius, color, ttl:.55, width:4, alpha:.72 });
    if (link) {
      this.finalFormFlow = { ...this.finalFormFlow, streak:3, expiresAtMs:Math.max(this.finalFormFlow.expiresAtMs,this.elapsed*1000+2200) };
      this.showEventToast(`${link.label} · 최종형 연계`);
      this.audio.play('flowImpact');
    }
    this.feedback.addImpact(this.hero.pos, pattern.kind === 'shockwave' ? 'awakened' : 'final');
  }

  private emitMythicTacticLinkFeedback(archetype: BossArchetype): void {
    const feedback = mythicTacticLinkFeedback(archetype);
    const boss = this.enemies.enemies.find((enemy) => enemy.alive && enemy.type === 'boss');
    const origin = boss?.pos ?? this.hero.pos;
    for (let ring = 0; ring < feedback.ringCount; ring++) {
      this.presentation.emitTelegraph({ x:origin.x, y:origin.y, radius:feedback.radius + ring * 18, color:ring % 2 === 0 ? feedback.accent : feedback.secondaryAccent, ttl:Math.min(.5, feedback.ttl + ring * .035), width:4.5 - ring * .6, alpha:.82 - ring * .12 });
    }
    for (let i = 0; i < feedback.particleCount; i++) {
      const a = Math.PI * 2 * i / Math.max(1, feedback.particleCount);
      const speed = 58 + (i % 3) * 16;
      this.presentation.emitParticle({ x:origin.x, y:origin.y, vx:Math.cos(a) * speed, vy:Math.sin(a) * speed, color:i % 2 === 0 ? feedback.accent : feedback.secondaryAccent, ttl:feedback.ttl, size:2.6 + (i % 2) * .8, alpha:.78 });
    }
    for (let i = 0; i < feedback.trailCount; i++) {
      const a = Math.PI * 2 * i / Math.max(1, feedback.trailCount) + .24;
      const len = feedback.radius * .72;
      this.presentation.emitTrail({ x1:origin.x, y1:origin.y, x2:origin.x + Math.cos(a) * len, y2:origin.y + Math.sin(a) * len, color:i % 2 === 0 ? feedback.secondaryAccent : feedback.accent, ttl:feedback.ttl * .82, width:2.2, alpha:.68 });
    }
    this.audio.play(feedback.soundKind);
    this.feedback.addImpact(origin, 'awakened');
    this.showEventToast(`${feedback.label} · TACTIC LINK`, null, archetype);
  }

  private decisionNowMs(): number {
    return typeof performance !== 'undefined' && Number.isFinite(performance.now()) ? performance.now() : Date.now();
  }

  private continueDecisionSession(nowMs: number = this.decisionNowMs()): boolean {
    const kind = nextDecisionKind({
      fate: this.fateRuntime.pending,
      heroAscension: Boolean(this.endlessState.heroAscension.pendingOffer),
      runContract: Boolean(this.endlessState.contracts.pendingOffer),
      bossRewardCount: this.queuedBossRewards,
      levelUpCount: this.queuedLevelUps,
    });
    if (!kind) {
      this.decisionReplay = null;
      if (!this.decisionSessionActive) return false;
      this.levelUpOverlay.close();
      this.fateSelectOverlay.hide();
      this.decisionSessionActive = false;
      this.paused = false;
      return false;
    }
    if (this.shopOverlay.isOpen) return false;
    const transitioning = this.decisionSessionActive;
    if (!this.decisionSessionActive) {
      this.input.clearStrategicActionArms();
      this.clearBufferedCastIntents();
    }
    this.decisionSessionActive = true;
    this.paused = true;
    const generation = this.decisionPickGuard.render(nowMs, transitioning);
    if (kind === 'fate') {
      if (this.levelUpOverlay.isOpen) this.levelUpOverlay.close();
      const checkpoint = this.fateRuntime.choices.length;
      const renderDecision = (activeGeneration: number) => this.fateSelectOverlay.open(checkpoint, this.fateRuntime.choices, (id) => {
        this.finishDecisionPick(activeGeneration, () => {
          const before=[...this.fateRuntime.choices];
          const impact=fateChoiceImpact(before,id);
          if (this.fateRuntime.choose(id)) { this.showEventToast(`운명 선택 · ${fateHudSummary([id])}`, null, null, null, id); this.eventToastFateImpact=impact; }
        });
      });
      this.decisionReplay = renderDecision;
      renderDecision(generation);
    } else {
      if (this.fateSelectOverlay.isOpen) this.fateSelectOverlay.hide();
      if (kind === 'heroAscension') this.openPendingHeroAscension(generation);
      else if (kind === 'runContract') this.openPendingEndlessContract(generation);
      else if (kind === 'bossReward') this.openNextBossReward(generation);
      else this.openNextLevelUp(generation);
    }
    return true;
  }

  private finishDecisionPick(generation: number, apply: () => void): void {
    const nowMs = this.decisionNowMs();
    if (!this.decisionPickGuard.accept(generation, nowMs)) return;
    apply();
    this.continueDecisionSession(nowMs);
  }

  private openPendingHeroAscension(generation: number): void {
    const offer = this.endlessState.heroAscension.pendingOffer;
    if (!offer) return;
    const cards = offer.options.map((option) => {
      const projection=projectHeroAscensionSelection(this.endlessState.heroAscension.selected,option.optionId);
      const directionStyle=heroAscensionBuildDirectionIdentityStyle(projection.directionId);
      const modifierStyles=projection.modifierIds.slice(0,2).map(heroAscensionModifierIdentityStyle);
      const directionLabel=heroAscensionBuildDirectionIdentityIcon(projection.directionId).label;
      return{...option,projection,identityIconStyle:deepRunDecisionIdentityStyle({kind:'ascension',id:option.optionId}),secondaryIdentityStyles:[directionStyle,...modifierStyles],badge:directionLabel,hint:heroAscensionProjectionHint(projection)};
    });
    const renderDecision = (activeGeneration: number) => this.levelUpOverlay.open(cards, (card) => {
      this.finishDecisionPick(activeGeneration, () => {
        const projection=projectHeroAscensionSelection(this.endlessState.heroAscension.selected,card.optionId);
        this.endlessState = { ...this.endlessState, heroAscension: selectHeroAscension(this.endlessState.heroAscension, card.optionId) };
        this.syncEquipmentState();
        this.showDeepRunAscensionEventToast(`승천 선택 · ${card.title}`,card.optionId,projection);
      });
    }, { eyebrow: 'HERO ASCENSION', title: `${offer.milestone}분 승천 경로`, subtitle: '실제 누적 보정 기준 · 확장/혼합/집중과 실효 수치를 바로 비교합니다' });
    this.decisionReplay = renderDecision;
    renderDecision(generation);
  }

  private openPendingEndlessContract(generation: number): void {
    const offer = this.endlessState.contracts.pendingOffer;
    if (!offer) return;
    const cards = contractChoiceCards(offer.options);
    const renderDecision = (activeGeneration: number) => this.levelUpOverlay.open(cards, (card) => {
      this.finishDecisionPick(activeGeneration, () => {
        this.endlessState = {
          ...this.endlessState,
          contracts: acceptContract(this.endlessState.contracts, card.optionId, this.elapsed * 1000, this.core.hp),
        };
        this.showEventToast(`런 계약 수락 · ${card.title}`, null, null, null, null, null, card.family);
      });
    }, { eyebrow: 'RUN CONTRACT', title: '이번 전투 계약을 고르세요', subtitle: '성공하면 90초 동안 강화됩니다 · 새 전투 버튼은 없습니다' });
    this.decisionReplay = renderDecision;
    renderDecision(generation);
  }

  private updateEndlessFieldNodes(): void {
    const nowMs = this.elapsed * 1000;
    const nodes = this.endlessState.world.nodes.filter((node) => node.expiresAtMs > nowMs);
    if (nodes.length !== this.endlessState.world.nodes.length) this.endlessState = { ...this.endlessState, world: { ...this.endlessState.world, nodes } };
    for (const node of nodes) {
      const pos = this.endlessFieldNodePosition(node);
      const radius = 24 + node.radius * 190;
      if (distance(this.hero.pos, pos) > this.hero.radius + radius) continue;
      const consumed = consumeFieldNode(this.endlessState.world, node.nodeId);
      if (!consumed.consumed) continue;
      this.endlessState = { ...this.endlessState, world: consumed.state };
      if (node.kind === 'mana_well') {
        this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + this.hero.maxHp * 0.05);
        this.gainXp(Math.max(1, Math.round(this.hero.xpNext * 0.05)));
        this.showEventToast('마나 우물 · 체력/경험치 회복');
      } else if (node.kind === 'sanctuary_zone') {
        const recovery = composeEndlessHostModifiers(this.endlessState, this.runThreatLevel).coreRecoveryMultiplier;
        this.core.hp = Math.min(this.core.maxHp, this.core.hp + this.core.maxHp * 0.08 * recovery);
        this.showEventToast('성역 · 수호핵 회복');
      } else if (node.kind === 'barricade') {
        this.core.hp = Math.min(this.core.maxHp, this.core.hp + this.core.maxHp * 0.05);
        this.showEventToast('폐허 방벽 · 수호핵 보강');
      } else if (node.kind === 'safe_corridor') {
        this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + this.hero.maxHp * 0.07);
        this.showEventToast('폭풍 통로 · 체력 회복');
      } else {
        const gain = 80 + this.runThreatLevel * 35;
        this.equipmentState = { ...this.equipmentState, coins: this.equipmentState.coins + gain };
        this.hero.coins = this.equipmentState.coins;
        this.goldEarned += gain;
        const damage = this.hero.maxHp * 0.025;
        this.hero.hp = Math.max(1, this.hero.hp - damage);
        this.queueHeroResponseVfx('hit',.68);
        this.frameEndlessEvents.push({ type: 'hero_damaged', amount: damage });
        this.damageReasonState = recordDamageReason(this.damageReasonState, 'strain', damage, this.hero.maxHp, this.elapsed);
        this.showEventToast(`불안정 지대 · +${gain}G / 체력 소모`);
      }
    }
  }

  private endlessFieldNodePosition(node: FieldNode): Vec2 {
    const top = ARENA_MARGIN + 55;
    const bottom = LOGICAL_HEIGHT - ARENA_MARGIN;
    return {
      x: ARENA_MARGIN + node.x * (LOGICAL_WIDTH - ARENA_MARGIN * 2),
      y: top + node.y * (bottom - top),
    };
  }

  private drawEndlessFieldNodes(ctx: CanvasRenderingContext2D, motion: SecondaryCombatMotionPolicy): void {
    const nowMs = this.elapsed * 1000;
    const activeNodes=this.endlessState.world.nodes.filter((node)=>node.expiresAtMs>nowMs);
    const primaryFieldNodeId=motion.owner==='field-node'
      ? activeNodes.reduce<FieldNode|null>((best,node)=>!best||distance(this.hero.pos,this.endlessFieldNodePosition(node))<distance(this.hero.pos,this.endlessFieldNodePosition(best))?node:best,null)?.nodeId??null
      : null;
    for (const node of activeNodes) {
      const pos = this.endlessFieldNodePosition(node);
      const radius = 24 + node.radius * 190;
      const presentation=fieldNodeIdentityPresentation(node.kind);
      const color = presentation.color;
      const amplitude=node.nodeId===primaryFieldNodeId?motion.fieldNodeMotionAmplitude:0;
      ctx.save(); ctx.globalAlpha = 0.30 + Math.sin(this.elapsed * 3 + node.x * 9) * amplitude; ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.82; ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
      if(this.battlefieldInteractionVfxAtlasReady&&this.battlefieldInteractionVfxAtlasImage){
        const icon=battlefieldInteractionSprite('field-node',node.kind); const size=Math.max(40,Math.min(58,radius*.82));
        ctx.globalAlpha=.96;
        ctx.drawImage(this.battlefieldInteractionVfxAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,pos.x-size/2,pos.y-size/2,size,size);
      }else if(this.fieldNodeIdentityAtlasReady&&this.fieldNodeIdentityAtlasImage){
        const icon=fieldNodeIdentityIcon(node.kind); const size=Math.max(30,Math.min(42,radius*.62));
        ctx.globalAlpha=.96;
        ctx.drawImage(this.fieldNodeIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,pos.x-size/2,pos.y-size/2,size,size);
      }else{
        ctx.globalAlpha=.82; ctx.fillStyle = '#fff'; ctx.font = '800 11px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline='middle';
        ctx.fillText(presentation.label, pos.x, pos.y + 4);
      }
      ctx.restore();
    }
  }

  private currentMythicSafeZone(boss: Enemy, destroyedRatio: number): ReturnType<typeof mythicSafeZoneState> {
    const destroyed = clamp(Number.isFinite(destroyedRatio) ? destroyedRatio : 0, 0, 1);
    const mythic = mythicBossProfile(this.elapsed, this.runThreatLevel, boss.bossOrdinal ?? this.bossesKilled);
    const lastLaw = mythicLastLawIdentityProfile(mythic, boss.bossArchetype ?? 'inferno', boss.hp / Math.max(1, boss.maxHp), 1 - destroyed);
    const lifecycle = lastLawSafeZoneLifecycle(lastLaw.active, destroyedRatio);
    return mythicSafeZoneState(boss.bossArchetype ?? 'inferno', Math.max(0, (this.elapsed - this.endlessBossStartedAt) * 1000), LOGICAL_WIDTH, LOGICAL_HEIGHT, destroyed, lifecycle);
  }

  private endlessBossEncounterModifiers(base: BossEncounterModifiers): BossEncounterModifiers {
    const key = this.bossEncounter.archetype ?? this.endlessBossKey;
    if (!key) return base;
    const out = { ...base };
    for (const adaptation of getBossAdaptations(this.endlessState.nemesis, key)) {
      if (adaptation.kind === 'spell_guard') out.bossDamageTakenMultiplier = Math.max(0.72, out.bossDamageTakenMultiplier * (1 - adaptation.rank * 0.035));
      else if (adaptation.kind === 'mirror_affinity') out.bossDamageTakenMultiplier = Math.max(0.74, out.bossDamageTakenMultiplier * 0.94);
      else if (adaptation.kind === 'blink_hunt') out.dashDistanceMultiplier = Math.min(1.45, out.dashDistanceMultiplier * (1 + adaptation.rank * 0.05));
      else if (adaptation.kind === 'core_siege') out.summonCountMultiplier = Math.min(1.5, out.summonCountMultiplier * (1 + adaptation.rank * 0.05));
      else if (adaptation.kind === 'enrage_clock') out.specialCadenceMultiplier = Math.max(0.7, out.specialCadenceMultiplier * (1 - adaptation.rank * 0.04));
    }
    const boss = this.enemies.enemies.find((enemy) => enemy.alive && enemy.type === 'boss' && enemy.id === this.bossEncounter.activeBossId);
    const nodesAlive = this.bossEncounter.nodes.filter((node) => node.alive).length;
    const nodeTotal = this.bossEncounter.nodes.length;
    if (boss?.isMythic) {
      const mythic = mythicBossProfile(this.elapsed, this.runThreatLevel, boss.bossOrdinal ?? 0);
      const weakpointRatio = nodeTotal > 0 ? nodesAlive / nodeTotal : 0;
      const phase = mythicPhaseProfile(mythic, boss.hp / Math.max(1, boss.maxHp), weakpointRatio);
      const baseLastLaw = mythicLastLawProfile(mythic, boss.hp / Math.max(1, boss.maxHp), weakpointRatio);
      const lastLaw = baseLastLaw.active ? mythicLastLawIdentityProfile(mythic, boss.bossArchetype ?? 'inferno', boss.hp / Math.max(1, boss.maxHp), weakpointRatio) : baseLastLaw;
      out.bossDamageTakenMultiplier *= phase.bossDamageTakenMultiplier * lastLaw.bossDamageTakenMultiplier;
      out.specialCadenceMultiplier *= phase.specialCadenceMultiplier * lastLaw.specialCadenceMultiplier;
      out.summonCountMultiplier *= phase.summonCountMultiplier * lastLaw.summonCountMultiplier;
      out.dashDistanceMultiplier *= phase.dashDistanceMultiplier * lastLaw.dashDistanceMultiplier;
      const destroyedRatio=nodeTotal>0?1-nodesAlive/nodeTotal:0;
      const safeZone=this.currentMythicSafeZone(boss,destroyedRatio);
      const safeZonePressure=mythicSafeZonePressure(boss.bossArchetype??'inferno',safeZone,destroyedRatio);
      out.bossDamageTakenMultiplier*=safeZonePressure.bossDamageTakenMultiplier;
      out.specialCadenceMultiplier*=safeZonePressure.specialCadenceMultiplier;
      out.summonCountMultiplier*=safeZonePressure.summonCountMultiplier;
      out.dashDistanceMultiplier*=safeZonePressure.dashDistanceMultiplier;
    }
    const counterplay = mythicCounterplayModifiers(Boolean(boss?.isMythic), nodesAlive, nodeTotal);
    out.bossDamageTakenMultiplier *= counterplay.bossDamageTakenMultiplier;
    out.specialCadenceMultiplier *= counterplay.specialCadenceMultiplier;
    out.summonCountMultiplier *= counterplay.summonCountMultiplier;
    const heroAscension = heroAscensionModifiers(this.endlessState.heroAscension.selected);
    const currentFinalForm = this.currentHeroFinalForm();
    const finalForm = finalFormModifiers(currentFinalForm);
    const signature = finalFormSignatureModifiers(this.endlessState.signature,currentFinalForm,this.elapsed*1000);
    const oath = longRunOathModifiers(this.endlessState.oaths,this.elapsed*1000);
    const overdrive = this.currentOverdriveModifiers();
    const contract = getContractModifiers(this.endlessState.contracts, this.elapsed * 1000);
    const tacticMultiplier = this.elapsed*1000 < this.mythicTacticBoostUntilMs ? this.mythicTacticBossDamageMultiplier : 1;
    out.bossDamageTakenMultiplier = clamp(out.bossDamageTakenMultiplier * heroAscension.bossDamageMultiplier * finalForm.bossDamageMultiplier * signature.bossDamageMultiplier * oath.bossDamageMultiplier * overdrive.bossDamageMultiplier * contract.bossDamageMultiplier * tacticMultiplier, 0.7, 1.85);
    out.specialCadenceMultiplier = clamp(out.specialCadenceMultiplier, 0.62, 1.4);
    out.summonCountMultiplier = clamp(out.summonCountMultiplier, 0.72, 1.55);
    out.dashDistanceMultiplier = clamp(out.dashDistanceMultiplier, 0.82, 1.55);
    return out;
  }

  private endlessWorldName(world: string): string {
    return world === 'stormfront' ? '폭풍전선' : world === 'ruins' ? '붕괴유적' : world === 'mana_bloom' ? '마나개화' : world === 'blood_moon' ? '혈월' : world === 'sanctuary' ? '성역' : '안정';
  }

  private endlessMutatorName(mutator: string): string {
    return mutator === 'accelerated_projectiles' ? '가속 탄막' : mutator === 'reinforced_elites' ? '강화 정예' : mutator === 'volatile_death' ? '폭발성 죽음' : '희소 상점';
  }

  private currentRelicResonance() {
    return deriveRelicResonance({
      heroId: this.hero.profileId,
      relicId: this.activeRelic,
      fusionCount: this.fusionRuntime.equipped.length,
      fateChoiceCount: this.fateRuntime.choices.length,
      ascensionSelections: this.endlessState.heroAscension.selected.length,
    });
  }

  private syncRelicResonanceRecallTracker(): void {
    const current=this.currentRelicResonance();
    this.lastRelicResonanceRelic=this.activeRelic;
    this.lastRelicResonanceTier=current.tier;
  }

  private updateRelicResonanceRecall(): void {
    if(!this.activeRelic){
      this.lastRelicResonanceRelic = null;
      this.lastRelicResonanceTier = 0;
      return;
    }
    const current=this.currentRelicResonance();
    if(this.lastRelicResonanceRelic!==this.activeRelic){
      this.lastRelicResonanceRelic=this.activeRelic;
      this.lastRelicResonanceTier=0;
    }
    if(current.tier>this.lastRelicResonanceTier){
      const badge=relicResonanceTierBadge(current.tier);
      if(badge) this.showEventToast(`유물 공명 · ${relicDefinition(this.activeRelic).name} · 공명 ${badge.label}`,null,null,null,null,null,null,{relicId:this.activeRelic,tier:badge.tier});
    }
    this.lastRelicResonanceTier=current.tier;
  }

  private currentHeroFinalForm(): HeroFinalForm | null {
    return deriveHeroFinalForm(this.hero.profileId, this.endlessState.heroAscension.selected, this.elapsed * 1000);
  }

  private currentBuildArchetype(): BuildArchetype {
    const ascension = heroAscensionModifiers(this.endlessState.heroAscension.selected);
    const form = finalFormModifiers(this.currentHeroFinalForm());
    return resolveBuildArchetype({
      spellPowerMultiplier: ascension.spellPowerMultiplier * form.spellPowerMultiplier,
      cooldownMultiplier: ascension.cooldownMultiplier * form.cooldownMultiplier,
      areaMultiplier: ascension.areaMultiplier * form.areaMultiplier,
      heroDamageTakenMultiplier: ascension.heroDamageTakenMultiplier * form.heroDamageTakenMultiplier,
      coreDamageTakenMultiplier: ascension.coreDamageTakenMultiplier * form.coreDamageTakenMultiplier,
      fusionPowerMultiplier: ascension.fusionPowerMultiplier * form.fusionPowerMultiplier,
      bossDamageMultiplier: ascension.bossDamageMultiplier * form.bossDamageMultiplier,
    });
  }

  private currentOverdriveModifiers() {
    return overdriveModifiers(this.endlessState.overdrive, this.currentBuildArchetype(), this.elapsed * 1000);
  }

  private endlessArchetypeName(archetype: BuildArchetype): string {
    return archetype === 'burst' ? '폭발' : archetype === 'cycle' ? '순환' : archetype === 'domain' ? '영역' : '수호';
  }

  private currentAdaptiveDirector() {
    const counts = this.presentation.counts;
    const deviceClass = this.presentation.quality === 'low' ? 'low' : this.presentation.quality === 'medium' ? 'mid' : 'high';
    const adaptive = evaluateAdaptiveDirector({
      fps: this.smoothedFps,
      enemyCount: this.enemies.enemies.length,
      projectileCount: this.enemies.activeProjectileCount,
      effectCount: counts.particles + counts.trails + counts.telegraphs + this.presentation.deathBurstCount,
      coreRatio: this.core.hp / Math.max(1, this.core.maxHp),
      heroHpRatio: this.hero.hp / Math.max(1, this.hero.maxHp),
      deviceClass,
      ascensionTier: this.endlessState.ascension.tier,
    });
    const governor = mobileFrameGovernorPolicy(this.endlessState.frameGovernor.tier);
    const desiredThermal = thermalBudgetPolicy({ elapsedSeconds:this.elapsed, fps:this.smoothedFps, adaptivePressure:adaptive.telemetryPressure, frameGovernorTier:this.endlessState.frameGovernor.tier, deviceClass });
    const thermal = thermalPolicyForEffectiveTier(desiredThermal,this.thermalRecoveryState.tier);
    return {
      ...adaptive,
      visualDensity: adaptive.visualDensity * governor.visualDensity * thermal.visualDensityMultiplier,
      projectileVisualDensity: adaptive.projectileVisualDensity * governor.projectileVisualDensity * thermal.visualDensityMultiplier,
    };
  }

  private currentMissionSnapshot(): RunMissionSnapshot {
    return {
      kills: this.hero.kills,
      eliteKills: this.eliteKills,
      goldEarned: this.goldEarned,
      danger: dangerTierForSeconds(this.elapsed),
    };
  }

  private updateRunMission(dt: number): void {
    const transition = this.runMissions.update(dt, this.elapsed, this.currentMissionSnapshot(), this.enemies.bossCountdown);
    if (transition.started) { this.showTacticalStatusEventToast(`미션 시작 · ${transition.started.name}`, transition.started.id); this.eventToastMissionReward={...transition.started.reward}; }
    if (transition.completed) {
      const next = applyMissionRewardToState({
        shopTokens: this.shopTokens,
        equipmentState: this.equipmentState,
        goldEarned: this.goldEarned,
      }, transition.completed.reward);
      this.shopTokens = next.shopTokens;
      this.equipmentState = next.equipmentState;
      this.goldEarned = next.goldEarned;
      this.syncEquipmentState();
      this.showRunMissionCompletionToast(transition.completed);
    }
    if (transition.failed) this.showRunMissionFailureToast(transition.failed);
  }

  private updateCriticalFeedback(): void {
    const next = dangerUiState(
      this.hero.hp / Math.max(1, this.hero.maxHp),
      this.core.hp / Math.max(1, this.core.maxHp),
      this.dangerState,
    );
    for (const event of criticalHapticEvents(this.dangerState, next)) {
      if (event === 'hero') this.hapticArbiter.queue('heroCritical');
      else this.hapticArbiter.queue('coreCritical');
    }
    this.dangerState = next;

    const bossWarning = this.enemies.bossCountdown > 0 && this.enemies.bossCountdown <= 8;
    if (bossWarning && !this.bossWarningHapticActive) this.hapticArbiter.queue('bossCountdown');
    this.bossWarningHapticActive = bossWarning;
  }

  private flushCombatHaptics(): void {
    const decision = this.hapticArbiter.resolve(this.presentationSettings.haptics);
    if (decision.pattern !== null) this.vibrate(decision.pattern);
  }

  private vibrate(pattern: number | number[]): void {
    if (!this.presentationSettings.haptics) return;
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(pattern);
    } catch {
      // Haptics are optional and must never interrupt a run.
    }
  }

  private updateCatastrophe(dt: number): void {
    this.catastropheBannerTimer = Math.max(0, this.catastropheBannerTimer - dt);
    const previous=this.catastrophe;
    const next = catastropheAt(this.elapsed);
    const nextId = next?.id ?? null;
    if (nextId !== this.lastCatastropheId) {
      this.lastCatastropheId = nextId;
      this.catastropheBannerTimer = next ? 3.4 : 0;
      this.catastropheBannerTransitionProjection=next?projectCatastropheTransition(previous,next):null;
    }
    this.catastrophe = next;
  }

  private render(): void {
    const ctx = this.ctx;
    this.updatePresentationQuality();
    ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    const combatAttention=this.currentCombatAttentionPolicy();
    const worldVfxPriority=worldVfxPriorityPolicy(combatAttention.primary,this.presentation.quality);
    this.activeWorldVfxPriorityPolicy=worldVfxPriority;
    this.activeWorldVfxOccupancyPolicy=this.currentWorldVfxOccupancyPolicy(combatAttention.primary);
    let secondaryMotion=this.currentSecondaryCombatMotionPolicy(combatAttention);
    const residualMotion=this.currentResidualCombatMotionPolicy(combatAttention,secondaryMotion);
    if(residualMotion.owner!=='none'&&secondaryMotion.owner==='core-ambient')secondaryMotion={...secondaryMotion,owner:'none',coreAmbientMotionAmplitude:0};
    const shakeScale = this.presentationSettings.reducedShake ? 0.4 : 1;
    const shake = this.feedback.cameraOffset;
    const cameraPressureScale = this.presentationSettings.reducedShake ? 0.4 : 1;
    const cameraScale = 1 + this.feedback.cameraScaleOffset * cameraPressureScale;
    ctx.save();
    ctx.translate(shake.x * shakeScale, shake.y * shakeScale);
    ctx.translate(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2); ctx.scale(cameraScale, cameraScale); ctx.translate(-LOGICAL_WIDTH / 2, -LOGICAL_HEIGHT / 2);
    this.drawArena(ctx);
    this.drawBattlefieldAtmosphereVfx(ctx);
    this.drawBattlefieldDepthOverlays(ctx);
    this.terrain.render(ctx, residualMotion);
    this.drawTerrainSpriteOverlays(ctx, residualMotion);
    this.drawMapCombatBoundaryWarnings(ctx);
    this.drawBattlefieldEnvironmentReactionVfx(ctx);
    this.drawMapEvolutionAftermathVfx(ctx);
    this.drawCrystalInteractionLifecycleVfx(ctx);
    this.drawEndlessFieldNodes(ctx, secondaryMotion);
    this.drawBossArenaHazards(ctx, secondaryMotion);
    this.drawBossHazardAftermathVfx(ctx);
    this.drawBossHazardClearedGroundMemory(ctx);
    this.drawSupplyCrate(ctx, secondaryMotion);
    this.drawBattlefieldObjective(ctx);
    this.drawObjectiveActivationMaterializationVfx(ctx);
    this.drawObjectiveCompletionCeremonyVfx(ctx);
    this.drawObjectiveFailureDissolveVfx(ctx);
    this.drawFieldEventLifecycleWorldVfx(ctx);
    this.drawBossEncounterNodes(ctx);
    this.drawBossWeakpointBreakWorldVfx(ctx);
    this.drawBossCounterplayRewardVfx(ctx);
    this.drawBossSignatureVfx(ctx);
    this.drawBossArenaTransitionWorldVfx(ctx);
    this.drawBossPhaseTransitionVfx(ctx);
    this.drawEnemySpawnLaneReadability(ctx);
    this.enemies.renderEnemies(ctx, this.enemySpriteAtlasImage, this.enemySpriteAtlasReady, this.bossSpriteAtlasImage, this.bossSpriteAtlasReady, residualMotion, this.eliteAffixIdentityAtlasImage, this.eliteAffixIdentityAtlasReady, this.specialistIntentAtlasImage, this.specialistIntentAtlasReady, this.hero.pos, this.specialistCombatVfxAtlasImage, this.specialistCombatVfxAtlasReady, this.bossPhaseOverlayVfxAtlasImage, this.bossPhaseOverlayVfxAtlasReady, this.battlefieldInteractionVfxAtlasImage, this.battlefieldInteractionVfxAtlasReady, this.spawnPressureVfxAtlasImage, this.spawnPressureVfxAtlasReady, this.regularEnemyActionVfxAtlasImage, this.regularEnemyActionVfxAtlasReady, this.eliteAffixLifecycleVfxAtlasImage, this.eliteAffixLifecycleVfxAtlasReady, this.enemyTargetPressureVfxAtlasImage, this.enemyTargetPressureVfxAtlasReady, this.core.pos, this.specialistReactionLifecycleVfxAtlasImage, this.specialistReactionLifecycleVfxAtlasReady, this.presentationSettings.reducedFlash, this.presentationSettings.reducedMotion, Math.min(1,this.bossArena.hazards.length/6));
    this.drawEnemyDefeatBodyTransitions(ctx);
    this.drawElitePackApproachFormationVfx(ctx);
    this.drawEnemyCombatImageVfx(ctx);
    this.drawEnemyFinisherVfx(ctx);
    this.drawFreezeShatterVfx(ctx);
    this.drawGoldenGoblinEventResponseIdentity(ctx);
    this.drawMythicTacticPrimedIcon(ctx);
    this.drawBossSpecialIntentCue(ctx);
    this.drawBossSafeResponseWindowConfirmation(ctx);
    // Preserve the residual-motion render contract: this.spells.render(ctx, residualMotion)
    this.spells.render(ctx, residualMotion, this.battlefieldPropVfxAtlasImage, this.battlefieldPropVfxAtlasReady, this.heroProjectileVfxAtlasImage, this.heroProjectileVfxAtlasReady, this.heroSpellSignatureVfxAtlasImage, this.heroSpellSignatureVfxAtlasReady, this.heroUltimateSignatureVfxAtlasImage, this.heroUltimateSignatureVfxAtlasReady, this.persistentSpellZoneVfxAtlasImage, this.persistentSpellZoneVfxAtlasReady, this.crowdControlPropagationVfxAtlasImage, this.crowdControlPropagationVfxAtlasReady, this.presentationSettings.reducedFlash, this.ultimatePostImpactResidueVfxAtlasImage, this.ultimatePostImpactResidueVfxAtlasReady, this.presentationSettings.reducedMotion, this.presentation.quality, this.enemies.projectileImpactLabelBlockers(this.presentation.quality,this.presentationSettings.reducedFlash), this.hero.pos, this.bossArena.hazards.filter((hazard)=>hazard.telegraph>0).map((hazard)=>({pos:hazard.pos,radius:hazard.radius})));
    this.drawFinalFormWorldVfx(ctx);
    this.drawFusionWorldVfx(ctx);
    this.drawEnemyStatusCues(ctx, secondaryMotion);
    this.drawPriorityThreats(ctx, secondaryMotion);
    this.presentation.renderDecorative(ctx, this.presentationSettings.reducedMotion);
    this.feedback.render(ctx,this.presentation.quality);
    this.presentation.renderScreenEffects(ctx, this.presentationSettings.reducedFlash, this.presentationSettings.reducedMotion);
    this.pickups.render(ctx, this.battlefieldInteractionVfxAtlasImage, this.battlefieldInteractionVfxAtlasReady, this.pickupFlowVfxAtlasImage, this.pickupFlowVfxAtlasReady, this.presentationSettings.reducedFlash);
    this.drawCore(ctx, secondaryMotion);
    this.enemies.renderProjectiles(ctx, this.bossSpecialCombatVfxAtlasImage, this.bossSpecialCombatVfxAtlasReady, this.battlefieldEnvironmentReactionVfxAtlasImage, this.battlefieldEnvironmentReactionVfxAtlasReady, this.bossProjectileLifecycleVfxAtlasImage, this.bossProjectileLifecycleVfxAtlasReady, this.presentation.quality, this.presentationSettings.reducedFlash, this.presentationSettings.reducedMotion, this.hero.pos, this.currentMythicSafeLanePresentation?.target??null);
    this.drawProjectileThreatVisibility(ctx);
    this.drawDangerTelegraphs(ctx);
    this.drawHeroMeterWorldVfx(ctx);
    this.drawHero(ctx, residualMotion);
    this.drawHeroResponseVfx(ctx);
    this.drawHeroCrisisVfx(ctx);
    this.drawPerfectEvadeTrailVfx(ctx);
    this.drawSurvivalResponseVfx(ctx);
    this.drawAutoTargetVisibility(ctx);
    this.drawDamageReasonFeedback(ctx);
    ctx.restore();
    this.drawBossHealthPressure(ctx);
    this.drawDangerVignette(ctx);
    this.drawEdgeThreatVfx(ctx);
    this.drawHud(ctx);
    this.drawFinalFormTransformationCue(ctx);
    this.drawArcaneComboHud(ctx);
    this.drawControls(ctx);
    this.drawCriticalWarnings(ctx);
    if (this.enemies.bossCountdown > 0 && this.enemies.bossCountdown <= 8) this.drawBossWarning(ctx);
    if (this.bossPhaseCueTimer > 0 && this.bossPhaseCue) this.drawBossPhaseCue(ctx);
    if (this.killChainCueTimer > 0 && this.killChainCue) this.drawKillChainCue(ctx);
    this.drawTacticalStack(ctx);
    if (this.catastropheBannerTimer > 0 && this.catastrophe) this.drawCatastropheBanner(ctx);
    if (this.eventToastTimer > 0 && this.eventToast) this.drawEventToast(ctx);
  }

  private updatePresentationQuality(): void {
    const now = typeof performance !== 'undefined' ? performance.now() : 0;
    let qualityDt = 1 / 60;
    if (this.lastRenderClock > 0 && now > this.lastRenderClock) {
      qualityDt = Math.min(.25, Math.max(0, (now - this.lastRenderClock) / 1000));
      const instant = Math.min(120, 1000 / Math.max(1, now - this.lastRenderClock));
      this.smoothedFps = this.smoothedFps * 0.92 + instant * 0.08;
    }
    this.lastRenderClock = now;
    const counts = this.presentation.counts;
    const load = Math.max(counts.particles / 180, counts.trails / 72, this.presentation.screenEffectCount / 4, this.presentation.deathBurstCount / 32);
    let next = nextPresentationQuality(this.presentation.quality, this.smoothedFps, load);
    const adaptiveBeforeGovernorStep = this.currentAdaptiveDirector();
    this.endlessState.frameGovernor = advanceMobileFrameGovernor(this.endlessState.frameGovernor, { fps:this.smoothedFps, adaptivePressure:adaptiveBeforeGovernorStep.telemetryPressure });
    const adaptive = this.currentAdaptiveDirector();
    const governor = mobileFrameGovernorPolicy(this.endlessState.frameGovernor.tier);
    const deviceClass = this.presentation.quality === 'low' ? 'low' : this.presentation.quality === 'medium' ? 'mid' : 'high';
    const desiredThermal = thermalBudgetPolicy({ elapsedSeconds:this.elapsed, fps:this.smoothedFps, adaptivePressure:adaptive.telemetryPressure, frameGovernorTier:this.endlessState.frameGovernor.tier, deviceClass });
    this.thermalRecoveryState = advanceThermalRecovery(this.thermalRecoveryState, desiredThermal.tier);
    const thermal = thermalPolicyForEffectiveTier(desiredThermal,this.thermalRecoveryState.tier);
    if (adaptive.visualDensity < 0.56) next = 'low';
    else if (adaptive.visualDensity < 0.78 && next === 'high') next = 'medium';
    if (governor.maxQuality === 'low') next = 'low';
    else if (governor.maxQuality === 'medium' && next === 'high') next = 'medium';
    if (this.presentationSettings.quality === 'low') next = 'low';
    else if (this.presentationSettings.quality === 'medium' && next === 'high') next = 'medium';
    this.vfxQualityTransition = advanceVfxQualityTransition(this.vfxQualityTransition, next, qualityDt);
    this.presentation.quality = this.vfxQualityTransition.current;
    const comfort = longRunComfortPolicy(this.elapsed);
    this.presentation.trimToBudget(
      Math.max(48, Math.round(governor.particleCap * comfort.vfxDensity * thermal.particleCapMultiplier)),
      Math.max(20, Math.round(governor.trailCap * comfort.vfxDensity * thermal.trailCapMultiplier)),
      governor.telegraphCap,
    );
  }


  private prepareManualTarget(spellWorld: SpellWorld): void {
    const target = this.manualTargetMemory.select(this.enemies.enemies, this.hero.pos, this.core.pos, this.elapsed);
    spellWorld.preferredManualTargetId = target?.id ?? null;
  }

  private handleManualCastPress(action: CombatCastAction, spellWorld: SpellWorld): void {
    const request = this.castIntentBuffer.request(action, this.spells.cooldownRemaining(action));
    if (request !== 'ready') return;
    this.prepareManualTarget(spellWorld);
    if (this.spells.tryCast(action, { ...spellWorld, autoAim:false })) this.handleSuccessfulCast(action, 'manual');
  }

  private flushBufferedManualCasts(spellWorld: SpellWorld): void {
    for (const action of COMBAT_CAST_ACTIONS) {
      if (!this.castIntentBuffer.consumeIfReady(action, this.spells.cooldownRemaining(action))) continue;
      this.prepareManualTarget(spellWorld);
      if (this.spells.tryCast(action, { ...spellWorld, autoAim:false })) this.handleSuccessfulCast(action, 'manual');
    }
  }


  private recordBossResponseAcknowledgement(action: ActionId, source: 'manual' | 'auto'): void {
    if (source !== 'manual') return;
    const boss = this.enemies.enemies.find((enemy) => enemy.alive && enemy.type === 'boss') ?? null;
    if (!boss) return;
    const specialTimer = boss.specialTimer ?? 99;
    if (!Number.isFinite(specialTimer) || specialTimer < 0 || specialTimer > 1.05) return;
    const archetype = boss.bossArchetype ?? 'inferno';
    if (!bossResponseActions(archetype).includes(action)) return;
    this.bossResponseAckAction = action;
    this.bossResponseAckSince = this.elapsed;
    this.bossResponseAckBossId = boss.id;
    this.bossResponseAckArchetype = archetype;
    this.bossResponseAckCycle = boss.bossCycle ?? 0;
  }

  private handleSuccessfulCast(action: import('./config.js').ActionId, source: 'manual' | 'auto' = 'manual'): void {
    this.recordBossResponseAcknowledgement(action, source);
    if ((action === 'spell1' || action === 'spell2' || action === 'spell3' || action === 'spell4') && this.onboarding.signal('spell')) this.saveStoredOnboardingState();
    if ((action === 'ultimate1' || action === 'ultimate2') && this.onboarding.signal('ultimate')) this.saveStoredOnboardingState();
    this.emitSpellCastVfx(action);
    this.heroCastCadenceState = advanceHeroCastCadenceState(this.heroCastCadenceState, true, 0, this.presentationSettings.reducedMotion);
    this.heroCastAimHoldState = advanceHeroCastAimHoldState(this.heroCastAimHoldState, this.hero.facing, 0, this.presentationSettings.reducedMotion);
    this.heroActionTransitionState = advanceHeroActionTransitionState(this.heroActionTransitionState, 'cast', 0, this.presentationSettings.reducedMotion);
    if (action === 'ultimate1' || action === 'ultimate2') { this.heroUltimateBodyState = advanceHeroUltimateBodyState(this.heroUltimateBodyState, action === 'ultimate1' ? 'meteorStorm' : 'blackHole', 0, this.presentationSettings.reducedMotion); this.heroUltimateAimContinuityState = advanceHeroUltimateAimContinuityState(this.heroUltimateAimContinuityState, this.hero.facing, 0, this.presentationSettings.reducedMotion); }
    const normalSpellHandoff = action === 'spell1' || action === 'spell2' || action === 'spell3' || action === 'spell4';
    const ultimateHandoffReset = action === 'ultimate1' || action === 'ultimate2';
    this.heroUltimateActionHandoffState = advanceHeroUltimateActionHandoffState(this.heroUltimateActionHandoffState, normalSpellHandoff, 0, this.presentationSettings.reducedMotion, ultimateHandoffReset);
    this.heroCastRenderCast = 1;
    this.heroCastRenderRecover = Math.max(this.heroCastRenderRecover, 0.25);
    const sound: SoundKind = action === 'ultimate1' || action === 'ultimate2' ? 'ultimate' : this.hero.profileId === 'arkan' ? 'fire' : this.hero.profileId === 'seria' ? 'ice' : this.hero.profileId === 'kain' ? 'lightning' : 'holy';
    this.audio.play(sound);
    this.advanceHeroMeter(0, heroMeterCastSignals(this.hero.profileId, action));
    const flowForm = this.currentHeroFinalForm();
    const previousFlowStreak = this.finalFormFlow.streak;
    this.finalFormFlow = recordFinalFormFlowCast(this.finalFormFlow, flowForm?.id ?? null, Math.hypot(this.finalFormMotion.x, this.finalFormMotion.y) > .28, this.elapsed * 1000);
    if (flowForm && shouldEmitFlowCue(previousFlowStreak, this.finalFormFlow.streak)) {
      const mobility = finalFormMobilityProfile(flowForm.id);
      const impact = flowImpactProfile(previousFlowStreak, this.finalFormFlow.streak, mobility.family, this.endlessState.frameGovernor.tier);
      this.feedback.addImpact(this.hero.pos, this.finalFormFlow.streak >= 5 ? 'final' : 'awakened');
      if (impact) {
        this.flowImpactTimer = Math.max(this.flowImpactTimer, impact.freezeMs / 1000);
        this.audio.play(impact.soundKind);
        const color = finalFormSignatureProfile(flowForm).color;
        for (let i=0;i<impact.particleCount;i++) { const a=Math.PI*2*i/impact.particleCount; this.presentation.emitParticle({x:this.hero.pos.x,y:this.hero.pos.y,vx:cosmeticMotionVelocity(Math.cos(a)*(55+impact.shake*9),this.presentationSettings.reducedMotion),vy:cosmeticMotionVelocity(Math.sin(a)*(55+impact.shake*9),this.presentationSettings.reducedMotion),color,ttl:.16,size:2.5+(this.finalFormFlow.streak>=5?1.5:0),alpha:.8}); }
        this.presentation.emitTelegraph({x:this.hero.pos.x,y:this.hero.pos.y,radius:impact.ringRadius,color,ttl:.12,width:2.5+impact.shake*.45,alpha:.72});
      }
    }
    const spellByAction: Partial<Record<import('./config.js').ActionId, SpellId>> = { spell1: 'fireBolt', spell2: 'chainLightning', spell3: 'frostNova', spell4: 'flameField', ultimate1: 'meteorStorm', ultimate2: 'blackHole' };
    const spellId = spellByAction[action];
    if (spellId) {
      const fusionProcs = fusionProcForCast(this.fusionRuntime.equipped, spellId);
      const affinity = this.hero.profileId === 'arkan' ? 'fire' : this.hero.profileId === 'seria' ? 'ice' : this.hero.profileId === 'kain' ? 'lightning' : 'holy';
      this.frameEndlessEvents.push({ type: 'spell_cast', spellId, fusion: fusionProcs.length > 0, affinity });
      for (const fusionId of fusionProcs) if (this.fusionRuntime.tryTrigger(fusionId)) this.triggerFusionProc(fusionId);
    }
  }

  private triggerFusionProc(fusionId: FusionId): void {
    const target = this.enemies.nearestEnemy(this.hero.pos);
    const origin = target ? target.pos : this.hero.pos;
    this.queueFusionWorldVfx(fusionId, origin);
    const contract = getContractModifiers(this.endlessState.contracts, this.elapsed * 1000);
    const heroAscension = heroAscensionModifiers(this.endlessState.heroAscension.selected);
    const currentFinalForm = this.currentHeroFinalForm();
    const finalForm = finalFormModifiers(currentFinalForm);
    const signature = finalFormSignatureModifiers(this.endlessState.signature,currentFinalForm,this.elapsed*1000);
    const overdrive = this.currentOverdriveModifiers();
    const damage = 52 * this.hero.spellPower * this.hero.equipmentSpellPower * contract.fusionPowerMultiplier * heroAscension.fusionPowerMultiplier * finalForm.fusionPowerMultiplier * signature.fusionPowerMultiplier * overdrive.fusionPowerMultiplier;
    for (const enemy of this.enemies.enemies) {
      if (!enemy.alive || distance(enemy.pos, origin) > 105 + enemy.radius) continue;
      this.enemies.damage(enemy, damage, origin,'fusion');
    }
    this.feedback.addImpact(origin, 'awakened');
    this.showBuildIdentityEventToast(`융합 발동 · ${fusionDefinition(fusionId).name}`, fusionId);
  }

  private advanceHeroMeter(dt: number, signals: HeroMeterSignals): void {
    const transition = updateHeroMeter(this.heroMeter, dt, signals);
    this.heroMeter = transition.state;
    this.hero.temporaryChainJumpBonus = heroMeterModifiers(this.heroMeter).kainChainBonus;
    if (!transition.activated) return;
    this.queueHeroMeterWorldVfx(this.hero.profileId);
    const label = heroMeterLabel(this.hero.profileId);
    this.showHeroMeterEventToast(`${label.activeName} 발동!`, this.hero.profileId);
    this.audio.play('meter');
    this.feedback.addImpact(this.hero.pos, 'final');
    if (transition.releaseShockwave) this.triggerEdricJudgment();
  }

  private triggerEdricJudgment(): void {
    const radius = 260;
    const damage = 78 * this.hero.spellPower * this.hero.equipmentSpellPower;
    for (const enemy of this.enemies.enemies) {
      if (!enemy.alive || distance(enemy.pos, this.core.pos) > radius + enemy.radius) continue;
      this.enemies.damage(enemy, damage);
      this.enemies.pushAway(enemy, this.core.pos, 95);
    }
    this.core.hp = Math.min(this.core.maxHp, this.core.hp + this.core.maxHp * 0.025);
  }

  private triggerSeriaShatter(death: EnemyDeathEvent): void {
    const meter = heroMeterModifiers(this.heroMeter);
    if (meter.shatterRadius <= 0) return;
    const damage = 54 * meter.shatterDamageMultiplier * this.hero.spellPower * this.hero.equipmentSpellPower;
    const origin = { x: death.x, y: death.y };
    for (const enemy of this.enemies.enemies) {
      if (!enemy.alive || distance(enemy.pos, origin) > meter.shatterRadius + enemy.radius) continue;
      this.enemies.damage(enemy, damage, origin,'freeze');
      this.enemies.applySlow(enemy, 0.38, 1.4);
    }
    this.feedback.addImpact(origin, 'final');
  }

  private emitSpellCastVfx(action: import('./config.js').ActionId): void {
    const spellByAction: Partial<Record<import('./config.js').ActionId, SpellId>> = {
      spell1: 'fireBolt', spell2: 'chainLightning', spell3: 'frostNova', spell4: 'flameField', ultimate1: 'meteorStorm', ultimate2: 'blackHole',
    };
    const spellId = spellByAction[action];
    if (!spellId) return;
    const descriptor = spellVfxDescriptor(this.hero.profileId, spellId, this.spells.levels[spellId]);
    const launchPose=heroActionLaunchOriginCoherencePresentation({owner:this.heroLastRenderedActionOwner,bodyOffsetX:this.heroLastRenderedBodyOffset.x,bodyOffsetY:this.heroLastRenderedBodyOffset.y,bodyFacingX:this.heroLastRenderedActionFacing.x,bodyFacingY:this.heroLastRenderedActionFacing.y,movementFacingX:this.hero.facing.x,movementFacingY:this.hero.facing.y,radius:this.hero.radius,poseStrength:this.heroLastRenderedActionPoseStrength,kind:descriptor.ultimate?'ultimate':'normal'},this.presentationSettings.reducedMotion);
    const launchOrigin={x:this.hero.pos.x+launchPose.originOffsetX,y:this.hero.pos.y+launchPose.originOffsetY};
    const density = criticalCuePolicy(this.presentation.quality).decorativeDensity;
    const alphaCap = this.presentationSettings.reducedFlash ? Math.min(0.58, descriptor.opacity) : descriptor.opacity;
    const count = Math.max(2, Math.round(descriptor.sparkCount * density));
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.35;
      const speed = 46 + Math.random() * 110;
      this.presentation.emitParticle({
        x: launchOrigin.x + Math.cos(angle) * this.hero.radius,
        y: launchOrigin.y + Math.sin(angle) * this.hero.radius,
        vx: cosmeticMotionVelocity(Math.cos(angle) * speed,this.presentationSettings.reducedMotion), vy: cosmeticMotionVelocity(Math.sin(angle) * speed,this.presentationSettings.reducedMotion),
        size: descriptor.tier === 2 ? 4.5 : 3,
        color: i % 2 === 0 ? descriptor.primary : descriptor.secondary,
        alpha: alphaCap, ttl: descriptor.persistence,
      });
    }
    this.presentation.emitTrail({
      x1: launchOrigin.x, y1: launchOrigin.y,
      x2: launchOrigin.x + this.hero.facing.x * descriptor.burstRadius,
      y2: launchOrigin.y + this.hero.facing.y * descriptor.burstRadius,
      color: descriptor.primary, width: descriptor.trailWidth, alpha: alphaCap * 0.72, ttl: 0.12 + descriptor.tier * 0.05,
    });
    const criticalThreat=this.hero.hp<=this.hero.maxHp*.30||this.core.hp<=this.core.maxHp*.30;
    const residue=spellResidueProfile(spellId,this.spells.levels[spellId],this.presentation.quality,criticalThreat);
    const residuePolicy=visualPriorityPolicy(this.presentation.quality,criticalThreat);
    const threatBand=criticalThreat?'critical':(this.hero.hp<=this.hero.maxHp*.55||this.core.hp<=this.core.maxHp*.55?'danger':'normal');
    const readability=visualReadabilityBudget(this.presentation.quality,threatBand);
    const activeBoss=this.enemies.enemies.find((enemy)=>enemy.alive&&enemy.type==='boss');
    const activeBossTier=activeBoss?bossHealthPressureProfile(activeBoss.bossArchetype??'inferno',activeBoss.hp/Math.max(1,activeBoss.maxHp),this.presentation.quality,this.presentationSettings.reducedFlash).tier:'none';
    const focus=visualFocusBudget(this.presentation.quality,threatBand,activeBossTier);
    const echo=spellEchoContinuityProfile(spellId,this.spells.levels[spellId],this.presentation.quality,criticalThreat);
    const cadence=spellEchoCadenceProfile(spellId,this.spells.levels[spellId],this.presentation.quality,criticalThreat);
    const facingAngle=Math.atan2(this.hero.facing.y,this.hero.facing.x);
    for(let i=0;i<residue.count;i++){
      const t=residue.count<=1?0:i/(residue.count-1); const spread=(t-.5)*residue.spread; let a=facingAngle+spread; let vx=Math.cos(a)*residue.speed,vy=Math.sin(a)*residue.speed;
      if(residue.motion==='frost-halo'||residue.motion==='void-orbit'){a=Math.PI*2*i/Math.max(1,residue.count);vx=Math.cos(a)*residue.speed*(residue.motion==='void-orbit'?.45:.7);vy=Math.sin(a)*residue.speed*(residue.motion==='void-orbit'?.45:.7);}
      else if(residue.motion==='heat-haze'){vx=(i-(residue.count-1)/2)*3;vy=-residue.speed;}
      else if(residue.motion==='meteor-smoke'){vx=-this.hero.facing.x*residue.speed*.45+(i%3-1)*8;vy=-residue.speed*.68;}
      else if(residue.motion==='ember-tail'){vx=-this.hero.facing.x*residue.speed+Math.sin(i*1.7)*8;vy=-this.hero.facing.y*residue.speed-10;}
      this.presentation.emitParticle({x:launchOrigin.x-this.hero.facing.x*(8+i*2),y:launchOrigin.y-this.hero.facing.y*(8+i*2),vx,vy,color:i%2?residue.secondaryColor:residue.color,ttl:residue.ttl,size:1.8+(i%3)*.55,alpha:residue.alpha*residuePolicy.spellResidueScale});
    }
    const echoAngle=Math.atan2(this.hero.facing.y,this.hero.facing.x);
    for(let i=0;i<echo.echoCount;i++){
      const offset=(i-(echo.echoCount-1)/2)*echo.spacing; let a=echoAngle, x1=launchOrigin.x, y1=launchOrigin.y, x2=launchOrigin.x, y2=launchOrigin.y;
      if(echo.shape==='halo-echo'||echo.shape==='orbit-echo'){a=Math.PI*2*i/Math.max(1,echo.echoCount);x1+=Math.cos(a)*18;y1+=Math.sin(a)*18;x2=x1+Math.cos(a)*echo.length*.42;y2=y1+Math.sin(a)*echo.length*.42;}
      else if(echo.shape==='drop-echo'){x1+=offset;y1-=echo.length*.58;x2=x1+this.hero.facing.x*10;y2=launchOrigin.y+12;}
      else {const perpX=-this.hero.facing.y,perpY=this.hero.facing.x; const fork=echo.shape==='fork-echo'?(i%2===0?-.18:.18):0; a=echoAngle+fork; x1+=perpX*offset;y1+=perpY*offset;x2=x1+Math.cos(a)*echo.length;y2=y1+Math.sin(a)*echo.length;}
      const cadenceIndex=Math.min(i,cadence.alphaScales.length-1),cadenceAlpha=cadence.alphaScales[cadenceIndex]??.42,cadenceTtl=cadence.ttlScales[cadenceIndex]??.6;
      this.presentation.emitTrail({x1,y1,x2,y2,color:i%2?echo.secondary:echo.color,width:1.25+(i%2)*.45,alpha:echo.alpha*Math.min(readability.spellEchoScale,focus.spellEchoScale)*cadenceAlpha,ttl:Math.min(.38,echo.ttl*cadenceTtl+cadence.delayStep*i*.22)});
    }
    const reaction=mapCombatReactionProfile(this.terrain.currentLayout.id,spellId,this.presentation.quality,criticalThreat);
    const reactionCount=Math.max(1,Math.round(reaction.particleCount*readability.environmentReactionScale));
    for(let i=0;i<reactionCount;i++){const a=Math.PI*2*i/Math.max(1,reactionCount);const lift=reaction.motion==='frost-lift'?-1:reaction.motion==='gust'?.45:.2;this.presentation.emitParticle({x:launchOrigin.x+Math.cos(a)*24,y:launchOrigin.y+Math.sin(a)*18,vx:cosmeticMotionVelocity(Math.cos(a)*reaction.speed*(reaction.motion==='resonance'?.55:1),this.presentationSettings.reducedMotion),vy:cosmeticMotionVelocity(Math.sin(a)*reaction.speed*lift-(reaction.motion==='frost-lift'?reaction.speed*.42:0),this.presentationSettings.reducedMotion),color:i%2?reaction.accent:reaction.color,ttl:reaction.ttl,size:1.7+(i%3)*.45,alpha:reaction.alpha*Math.min(readability.environmentReactionScale,focus.environmentScale)});}
    const rayDensity = Math.max(0, Math.round(descriptor.rayCount * density));
    for (let i = 0; i < rayDensity; i++) {
      const spread = descriptor.shape === 'bolt' ? 0.16 : descriptor.shape === 'fork' ? 0.52 : Math.PI * 2;
      const angle = descriptor.shape === 'bolt' || descriptor.shape === 'fork'
        ? Math.atan2(this.hero.facing.y, this.hero.facing.x) + (i - (rayDensity - 1) / 2) * (spread / Math.max(1, rayDensity - 1))
        : Math.PI * 2 * i / Math.max(1, rayDensity);
      const length = descriptor.burstRadius * (0.72 + (i % 3) * 0.12);
      this.presentation.emitTrail({x1:launchOrigin.x,y1:launchOrigin.y,x2:launchOrigin.x+Math.cos(angle)*length,y2:launchOrigin.y+Math.sin(angle)*length,color:i%2?descriptor.secondary:descriptor.primary,width:Math.max(1.5,descriptor.trailWidth*0.55),alpha:alphaCap*0.55,ttl:0.09+descriptor.tier*0.035});
    }
    const waveCount = Math.min(focus.screenEffectCap, Math.max(0, Math.round(descriptor.waveCount * density)));
    for (let i = 0; i < waveCount; i++) this.presentation.emitScreenEffect({kind:'shockwave',x:this.hero.pos.x,y:this.hero.pos.y,radius:descriptor.burstRadius*(0.8+i*0.22),color:descriptor.primary,ttl:0.18+i*0.035,alpha:Math.min(descriptor.flashAlpha,0.30),width:2.5+descriptor.tier});
    if (descriptor.screenPulse >= 0.5) {
      this.presentation.emitScreenEffect({kind:'flash',x:this.hero.pos.x,y:this.hero.pos.y,radius:0,color:descriptor.secondary,ttl:0.10+descriptor.tier*0.02,alpha:descriptor.flashAlpha});
      this.feedback.addImpact(this.hero.pos, descriptor.ultimate ? 'ultimate' : 'awakened');
      if (spellId === 'meteorStorm') this.feedback.addCameraPressure('meteor');
      if (spellId === 'blackHole') this.feedback.addCameraPressure('vortex');
    } else if (descriptor.screenPulse >= 0.30) {
      this.presentation.emitScreenEffect({kind:'pulse',x:this.hero.pos.x,y:this.hero.pos.y,radius:descriptor.burstRadius*1.15,color:descriptor.secondary,ttl:0.14,alpha:Math.min(0.20,descriptor.flashAlpha)});
    }
    if (descriptor.ultimate) {
      const aftermath = ultimateAftermathProfile(spellId as Extract<SpellId,'meteorStorm'|'blackHole'>, this.spells.levels[spellId], this.presentation.quality);
      for (let i=0;i<aftermath.ringCount;i++) this.presentation.emitScreenEffect({kind:'pulse',x:this.hero.pos.x,y:this.hero.pos.y,radius:aftermath.radius*(.72+i*.14),color:i%2?aftermath.secondary:aftermath.color,ttl:aftermath.ttl*.55+i*.025,alpha:aftermath.alpha*.72,width:2+i*.35});
      for (let i=0;i<aftermath.particleCount;i++) { const a=Math.PI*2*i/Math.max(1,aftermath.particleCount); const inward=aftermath.motion==='collapse'?-1:1; this.presentation.emitParticle({x:this.hero.pos.x+Math.cos(a)*aftermath.radius*.35,y:this.hero.pos.y+Math.sin(a)*aftermath.radius*.35,vx:cosmeticMotionVelocity(Math.cos(a)*26*inward,this.presentationSettings.reducedMotion),vy:cosmeticMotionVelocity(Math.sin(a)*26*inward+(aftermath.motion==='embers'?-34:0),this.presentationSettings.reducedMotion),color:i%2?aftermath.secondary:aftermath.color,ttl:aftermath.ttl,size:2.5+(i%3)*.7,alpha:aftermath.alpha}); }
    }
  }

  private emitDeathPresentation(death: EnemyDeathEvent): void {
    if (isEnemyCombatVfxType(death.type)) this.enemyDeathImageBursts.push({x:death.x,y:death.y,type:death.type,startedAt:this.elapsed,until:this.elapsed+0.34});
    const cue = enemyDeathCue(death.type);
    this.presentation.recordDeath({ x: death.x, y: death.y, color: cue.color, radius: cue.radius }, this.elapsed);
    const density = criticalCuePolicy(this.presentation.quality).decorativeDensity;
    const count = Math.max(2, Math.round(cue.particles * density));
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const motifSpeed=cue.motif==='slash'||cue.motif==='shadow'?1.45:cue.motif==='quake'||cue.motif==='fracture'?.72:1;
      const speed = (40 + (i % 4) * 18)*motifSpeed;
      this.presentation.emitParticle({ x: death.x, y: death.y, vx: cosmeticMotionVelocity(Math.cos(angle) * speed,this.presentationSettings.reducedMotion), vy: cosmeticMotionVelocity(Math.sin(angle) * speed,this.presentationSettings.reducedMotion), color: cue.color, ttl: Math.min(0.52, cue.duration), size: death.type === 'boss' ? 5 : cue.motif==='quake'?4:3 });
    }
    const rays=Math.max(0,Math.round(cue.rayCount*density));
    for(let i=0;i<rays;i++){const a=Math.PI*2*i/Math.max(1,rays);const inner=cue.radius*.25,outer=cue.radius*(.78+(i%3)*.12);this.presentation.emitTrail({x1:death.x+Math.cos(a)*inner,y1:death.y+Math.sin(a)*inner,x2:death.x+Math.cos(a)*outer,y2:death.y+Math.sin(a)*outer,color:cue.color,ttl:.16,alpha:.46,width:cue.motif==='shield'||cue.motif==='fracture'?3:2});}
    const afterglow=deathAfterglowProfile(death.type,this.presentation.quality);
    if(afterglow.alpha>0)this.presentation.emitScreenEffect({kind:'glow',x:death.x,y:death.y,radius:afterglow.radius,color:afterglow.color,ttl:afterglow.ttl,alpha:afterglow.alpha});
    for(let i=0;i<afterglow.particleCount;i++){const a=Math.PI*2*i/Math.max(1,afterglow.particleCount);this.presentation.emitParticle({x:death.x,y:death.y,vx:cosmeticMotionVelocity(Math.cos(a)*afterglow.drift,this.presentationSettings.reducedMotion),vy:cosmeticMotionVelocity(Math.sin(a)*afterglow.drift*.55-8,this.presentationSettings.reducedMotion),color:afterglow.color,ttl:afterglow.ttl,size:1.8+(i%2),alpha:afterglow.alpha*.92});}
  }

  private drawEnemyDefeatBodyTransitions(ctx:CanvasRenderingContext2D):void{
    this.enemyDefeatBodyTransitions=this.enemyDefeatBodyTransitions.filter((cue)=>cue.until>this.elapsed);
    for(const cue of this.enemyDefeatBodyTransitions){
      const pose=cue.death.deathPose;if(!pose||!isEnemySpriteType(cue.death.type))continue;
      const duration=Math.max(.001,cue.until-cue.startedAt),progress=Math.max(0,Math.min(1,(this.elapsed-cue.startedAt)/duration));
      const body=enemyDeathTransitionPresentation(cue.death.type,pose,progress,this.presentationSettings.reducedMotion);
      const deathAfterglowContinuity=enemyFinisherDeathAfterglowContinuityPresentation({deathProgress:progress,finisherProgress:progress,tier:pose.tier},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const deathAfterglowHandoff=enemyFinisherDeathAfterglowHandoffPresentation({owner:deathAfterglowContinuity.owner,deathProgress:progress,afterglowAlpha:deathAfterglowContinuity.afterglowAlphaScale},this.presentationSettings.reducedMotion);
      const spritePresentation=enemySpritePresentation(cue.death.type,pose.radius,this.enemySpriteAtlasReady);
      const specialistRetirement=(cue.death.type==='shieldbearer'||cue.death.type==='assassin'||cue.death.type==='siegeGolem'||cue.death.type==='nullifier')?specialistDefeatGroundRetirementPresentation(cue.death.type,progress,{offsetX:body.offsetX,offsetY:body.offsetY,alpha:body.alpha,radius:pose.radius},this.presentationSettings.reducedMotion):null;
      const regularRetirement=specialistRetirement?null:regularDefeatGroundRetirementPresentation(cue.death.type as RegularDefeatGroundType,progress,{offsetX:body.offsetX,offsetY:body.offsetY,alpha:body.alpha,radius:pose.radius},this.presentationSettings.reducedMotion);
      const deathGroundRetirement=specialistRetirement??regularRetirement;
      const retirement=deathGroundRetirement;
      if(retirement&&retirement.shadowAlpha>0){ctx.save();ctx.translate(cue.death.x+retirement.shadowOffsetX,cue.death.y+retirement.shadowOffsetY);ctx.globalAlpha=retirement.shadowAlpha;ctx.fillStyle='rgba(8,12,18,.92)';ctx.beginPath();ctx.ellipse(0,pose.radius+8,pose.radius*1.05*retirement.widthScale,pose.radius*retirement.heightScale,0,0,Math.PI*2);ctx.fill();ctx.restore();}
      if(retirement&&retirement.groundPulseScale>0.01){ctx.save();ctx.globalAlpha=.14*retirement.groundPulseScale;ctx.strokeStyle='rgba(190,214,240,.5)';ctx.beginPath();ctx.ellipse(cue.death.x,cue.death.y+pose.radius+8,pose.radius*1.25,pose.radius*.28,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
      ctx.save();ctx.translate(cue.death.x+body.offsetX,cue.death.y+body.offsetY);ctx.rotate(body.rotation);ctx.scale(body.scaleX,body.scaleY);ctx.globalAlpha=body.alpha*deathAfterglowContinuity.bodyAlphaScale*deathAfterglowHandoff.bodyScale*(this.presentationSettings.reducedFlash?.78:.92);
      if(spritePresentation.visible&&this.enemySpriteAtlasImage){const sprite=enemySpriteRect(cue.death.type),size=spritePresentation.drawSize;ctx.drawImage(this.enemySpriteAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,-size/2,-size/2,size,size);}
      else{ctx.fillStyle='rgba(145,158,176,.52)';ctx.beginPath();ctx.arc(0,0,pose.radius,0,Math.PI*2);ctx.fill();}
      ctx.restore();
    }
  }

  private drawEnemyCombatImageVfx(ctx: CanvasRenderingContext2D): void {
    this.enemyDeathImageBursts = this.enemyDeathImageBursts.filter((burst) => burst.until > this.elapsed);
    if (!this.enemyCombatVfxAtlasReady || !this.enemyCombatVfxAtlasImage) return;
    const alphaCap = this.presentationSettings.reducedFlash ? 0.5 : 0.78;
    for (const enemy of this.enemies.enemies) {
      if (!enemy.alive || !isEnemyCombatVfxType(enemy.type) || enemy.hitFlash <= 0) continue;
      const sprite = enemyCombatVfxSprite(enemy.type, 'hit');
      const strength = Math.max(0, Math.min(1, enemy.hitFlash / 0.10));
      const size = Math.max(56, enemy.radius * 4.1);
      ctx.save(); ctx.globalAlpha = Math.min(alphaCap, 0.22 + strength * 0.56);
      ctx.drawImage(this.enemyCombatVfxAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, enemy.pos.x - size / 2, enemy.pos.y - size / 2, size, size);
      ctx.restore();
    }
    for (const burst of this.enemyDeathImageBursts) {
      const duration = Math.max(0.001, burst.until - burst.startedAt);
      const progress = Math.max(0, Math.min(1, (this.elapsed - burst.startedAt) / duration));
      const sprite = enemyCombatVfxSprite(burst.type, 'death');
      const size = 84 + progress * 42;
      ctx.save(); ctx.globalAlpha = Math.min(alphaCap, (1 - progress) * 0.82);
      ctx.drawImage(this.enemyCombatVfxAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, burst.x - size / 2, burst.y - size / 2, size, size);
      ctx.restore();
    }
  }

  private updateBossPresentation(): void {
    for (const enemy of this.enemies.enemies) {
      if (!enemy.alive || enemy.type !== 'boss') continue;
      const archetype = enemy.bossArchetype ?? 'inferno';
      if (!this.seenBossIds.has(enemy.id)) {
        this.seenBossIds.add(enemy.id); this.audio.play('bossSpawn');
        this.bossSignatureEntranceBossId = enemy.id;
        this.bossSignatureEntranceUntil = this.elapsed + 1.15;
        this.queueBossArenaTransitionWorldVfx(archetype,'entrance',enemy.pos.x,enemy.pos.y,enemy.radius);
        const cinematic=bossLifecycleCinematicProfile(archetype,'entrance');
        for(let i=0;i<cinematic.shockwaveCount;i++) this.presentation.emitScreenEffect({kind:'shockwave',x:enemy.pos.x,y:enemy.pos.y,radius:94+i*38,color:cinematic.color,ttl:.22+i*.045,alpha:Math.min(.24,cinematic.flashAlpha),width:3.5+i*.6});
        this.presentation.emitScreenEffect({kind:'glow',x:enemy.pos.x,y:enemy.pos.y,radius:196,color:cinematic.color,ttl:cinematic.duration,alpha:cinematic.flashAlpha});
        this.feedback.addCameraPressure('bossEnter');
      }
      const bossRatio=enemy.hp/Math.max(1,enemy.maxHp);
      const previousBossRatio=this.bossPressureRatioById.get(enemy.id)??bossRatio;
      const transition=bossPressureTransitionProfile(archetype,previousBossRatio,bossRatio,this.presentation.quality,this.presentationSettings.reducedFlash);
      this.bossPressureRatioById.set(enemy.id,bossRatio);
      if(transition){
        const threatBand=this.hero.hp<=this.hero.maxHp*.30||this.core.hp<=this.core.maxHp*.30?'critical':'normal';
        const budget=visualReadabilityBudget(this.presentation.quality,threatBand);
        this.presentation.emitScreenEffect({kind:'pulse',x:enemy.pos.x,y:enemy.pos.y,radius:transition.radius,color:transition.color,ttl:transition.ttl,alpha:transition.alpha*budget.bossPressureScale,width:transition.tier==='desperate'?5:3.5});
        for(let i=0;i<transition.rayCount;i++){const a=Math.PI*2*i/Math.max(1,transition.rayCount);this.presentation.emitTrail({x1:enemy.pos.x+Math.cos(a)*enemy.radius*.5,y1:enemy.pos.y+Math.sin(a)*enemy.radius*.5,x2:enemy.pos.x+Math.cos(a)*transition.radius*.68,y2:enemy.pos.y+Math.sin(a)*transition.radius*.68,color:transition.color,ttl:transition.ttl*.72,alpha:transition.alpha*.82*budget.bossPressureScale,width:2});}
      }
      const cue = this.bossPresentation.update(enemy.id, bossRatio, archetype);
      if (!cue) continue;
      this.bossPhaseCue = cue;
      { const maxTtl=1.16; this.bossPhaseTransitionVfx.push({archetype,phase:cue.phase,x:enemy.pos.x,y:enemy.pos.y,ttl:maxTtl,maxTtl}); if(this.bossPhaseTransitionVfx.length>12)this.bossPhaseTransitionVfx.splice(0,this.bossPhaseTransitionVfx.length-12); }
      this.audio.play('bossPhase');
      this.bossPhaseCueTimer = cue.duration;
      this.presentation.emitTelegraph({ x: enemy.pos.x, y: enemy.pos.y, radius: cue.ringRadius, color: cue.color, width: 7, alpha: 0.9, ttl: cue.duration });
      for(let i=0;i<cue.cinematic.shockwaveCount;i++) this.presentation.emitScreenEffect({kind:'shockwave',x:enemy.pos.x,y:enemy.pos.y,radius:cue.ringRadius*(0.82+i*0.22),color:cue.color,ttl:0.22+i*0.05,alpha:Math.min(0.30,cue.cinematic.edgePulseAlpha),width:4+i});
      this.presentation.emitScreenEffect({kind:'pulse',x:enemy.pos.x,y:enemy.pos.y,radius:cue.ringRadius*1.35,color:cue.color,ttl:0.28,alpha:cue.cinematic.edgePulseAlpha,width:6});
      this.feedback.addCameraPressure(cue.cinematic.cameraKind);
      this.feedback.addImpact(enemy.pos, 'bossHit');
      this.hapticArbiter.queue(cue.phase === 3 ? 'bossPhase3' : 'bossPhase');
    }
  }


  private updateMapEnvironmentVfx(dt:number):void {
    const safeDt=Math.max(0,dt);
    for (const cue of this.finalFormWorldVfx) cue.ttl -= safeDt;
    this.finalFormWorldVfx = this.finalFormWorldVfx.filter((cue)=>cue.ttl>0);
    for (const cue of this.fusionWorldVfx) cue.ttl -= safeDt;
    this.fusionWorldVfx = this.fusionWorldVfx.filter((cue)=>cue.ttl>0);
    for (const cue of this.heroMeterWorldVfx) cue.ttl -= safeDt;
    this.heroMeterWorldVfx = this.heroMeterWorldVfx.filter((cue)=>cue.ttl>0);
    for (const cue of this.crystalInteractionLifecycleVfx) cue.ttl -= safeDt;
    this.crystalInteractionLifecycleVfx = this.crystalInteractionLifecycleVfx.filter((cue)=>cue.ttl>0);
    for (const cue of this.bossPhaseTransitionVfx) cue.ttl -= safeDt;
    this.bossPhaseTransitionVfx = this.bossPhaseTransitionVfx.filter((cue)=>cue.ttl>0);
    for (const cue of this.mapEvolutionAftermathVfx) cue.ttl -= safeDt;
    this.mapEvolutionAftermathVfx = this.mapEvolutionAftermathVfx.filter((cue)=>cue.ttl>0);
    for(const cue of this.bossHazardAftermathVfx)cue.ttl-=safeDt;
    this.bossHazardAftermathVfx=this.bossHazardAftermathVfx.filter((cue)=>cue.ttl>0);
    for(const cue of this.bossHazardClearedGroundMemory)cue.ttl-=safeDt;
    this.bossHazardClearedGroundMemory=this.bossHazardClearedGroundMemory.filter((cue)=>cue.ttl>0);
    for(const cue of this.enemyFinisherVfx)cue.ttl-=safeDt;
    this.enemyFinisherVfx=this.enemyFinisherVfx.filter((cue)=>cue.ttl>0);
    for(const cue of this.heroCrisisVfx)cue.ttl-=safeDt;
    this.heroCrisisVfx=this.heroCrisisVfx.filter((cue)=>cue.ttl>0);
    for(const cue of this.perfectEvadeTrailVfx)cue.ttl-=safeDt;
    this.perfectEvadeTrailVfx=this.perfectEvadeTrailVfx.filter((cue)=>cue.ttl>0);
    for(const cue of this.bossCounterplayRewardBurstVfx)cue.ttl-=safeDt;
    this.bossCounterplayRewardBurstVfx=this.bossCounterplayRewardBurstVfx.filter((cue)=>cue.ttl>0);
    for(const cue of this.objectiveCompletionCeremonyVfx)cue.ttl-=safeDt;
    this.objectiveCompletionCeremonyVfx=this.objectiveCompletionCeremonyVfx.filter((cue)=>cue.ttl>0);
    for(const cue of this.objectiveActivationMaterializationVfx)cue.ttl-=safeDt;
    this.objectiveActivationMaterializationVfx=this.objectiveActivationMaterializationVfx.filter((cue)=>cue.ttl>0);
    for(const cue of this.bossArenaTransitionWorldVfx)cue.ttl-=safeDt;
    this.bossArenaTransitionWorldVfx=this.bossArenaTransitionWorldVfx.filter((cue)=>cue.ttl>0);
    for(const cue of this.objectiveFailureDissolveVfx)cue.ttl-=safeDt;
    this.objectiveFailureDissolveVfx=this.objectiveFailureDissolveVfx.filter((cue)=>cue.ttl>0);
    for(const cue of this.fieldEventLifecycleWorldVfx)cue.ttl-=safeDt;
    this.fieldEventLifecycleWorldVfx=this.fieldEventLifecycleWorldVfx.filter((cue)=>cue.ttl>0);
    for(const cue of this.elitePackApproachFormationVfx)cue.ttl-=safeDt;
    this.elitePackApproachFormationVfx=this.elitePackApproachFormationVfx.filter((cue)=>cue.ttl>0);
    for (const cue of this.heroResponseVfx) cue.ttl -= safeDt;
    this.heroResponseVfx=this.heroResponseVfx.filter((cue)=>cue.ttl>0);
    for(const cue of this.survivalResponseVfx)cue.ttl-=safeDt;
    this.survivalResponseVfx=this.survivalResponseVfx.filter((cue)=>cue.ttl>0);
    for(const cue of this.freezeShatterVfx)cue.ttl-=safeDt;
    this.freezeShatterVfx=this.freezeShatterVfx.filter((cue)=>cue.ttl>0);
    if(this.core.hp>this.observedCoreHpForVfx+.5)this.queueSurvivalResponseVfx('coreRecover');
    this.observedCoreHpForVfx=this.core.hp;
    const current=this.hero.hp/Math.max(1,this.hero.maxHp),previous=this.lastHeroCrisisHpRatio;
    if(previous<=.35&&current>.35)this.queueHeroCrisisVfx('recovery');
    this.lastHeroCrisisHpRatio=current;
    for (const cue of this.bossWeakpointBreakWorldVfx) cue.ttl -= safeDt;
    this.bossWeakpointBreakWorldVfx=this.bossWeakpointBreakWorldVfx.filter((cue)=>cue.ttl>0);
    for (const cue of this.battlefieldEnvironmentReactionVfx) cue.ttl -= safeDt;
    this.battlefieldEnvironmentReactionVfx = this.battlefieldEnvironmentReactionVfx.filter((cue)=>cue.ttl>0);
    const descriptor=mapEnvironmentVfxDescriptor(this.terrain.currentLayout.id,this.terrain.evolutionStage,this.presentation.quality);
    const criticalThreat=this.hero.hp<=this.hero.maxHp*.30||this.core.hp<=this.core.maxHp*.30;
    const ambient=mapAmbientDepthProfile(this.terrain.currentLayout.id,this.terrain.evolutionStage,this.presentation.quality,criticalThreat);
    const ambientFlow=mapAmbientFlowProfile(this.terrain.currentLayout.id,this.terrain.evolutionStage,this.elapsed,criticalThreat);
    const priority=visualPriorityPolicy(this.presentation.quality,criticalThreat);
    const threatBand=criticalThreat?'critical':(this.hero.hp<=this.hero.maxHp*.55||this.core.hp<=this.core.maxHp*.55?'danger':'normal');
    const activeBoss=this.enemies.enemies.find((enemy)=>enemy.alive&&enemy.type==='boss');
    const activeBossTier=activeBoss?bossHealthPressureProfile(activeBoss.bossArchetype??'inferno',activeBoss.hp/Math.max(1,activeBoss.maxHp),this.presentation.quality,this.presentationSettings.reducedFlash).tier:'none';
    const focus=visualFocusBudget(this.presentation.quality,threatBand,activeBossTier);
    this.mapVfxAccumulator=Math.min(ambient.particlesPerSecond*2,this.mapVfxAccumulator+Math.max(0,dt)*ambient.particlesPerSecond);
    let emitted=0;
    while(this.mapVfxAccumulator>=1&&emitted<3){
      this.mapVfxAccumulator-=1; emitted+=1; this.mapVfxSequence+=1;
      const phase=this.mapVfxSequence*2.399963+this.elapsed*0.19;
      const x=(0.08+0.84*((Math.sin(phase)*0.5)+0.5))*LOGICAL_WIDTH;
      const y=(0.08+0.84*((Math.cos(phase*1.37)*0.5)+0.5))*LOGICAL_HEIGHT;
      const layer=this.mapVfxSequence%Math.max(1,ambient.layers); const layerScale=1-layer*.16; const drift=Math.sin(phase*0.73)*12*layerScale;
      const baseVx=ambient.motion==='snow-parallax'?drift:ambient.motion==='ember-drift'?drift*.35:Math.cos(phase)*descriptor.speed*ambient.parallax;
      const baseVy=ambient.motion==='ember-drift'?-descriptor.speed*layerScale:ambient.motion==='snow-parallax'?descriptor.speed*layerScale:Math.sin(phase)*descriptor.speed*ambient.parallax;
      const flowSpeed=descriptor.speed*ambientFlow.speedScale*ambientFlow.depthScale,flowNoise=Math.sin(phase*1.91)*descriptor.speed*ambientFlow.turbulence;
      const vx=cosmeticMotionVelocity(baseVx+ambientFlow.x*flowSpeed*.34+flowNoise,this.presentationSettings.reducedMotion),vy=cosmeticMotionVelocity(baseVy+ambientFlow.y*flowSpeed*.34+Math.cos(phase*1.57)*descriptor.speed*ambientFlow.turbulence*.65,this.presentationSettings.reducedMotion);
      this.presentation.emitParticle({x,y,vx,vy,color:layer%2?ambient.secondaryColor:descriptor.color,ttl:ambient.motion==='snow-parallax'?1.1:.82,size:descriptor.size*(1-layer*.08),alpha:ambient.alpha*Math.min(priority.environmentScale,focus.environmentScale)});
    }
  }

  private emitMapEvolutionVfx(stage:MapEvolutionStage):void {
    if(stage>0){const maxTtl=1.55;this.mapEvolutionAftermathVfx.push({mapId:this.terrain.currentLayout.id,stage:stage as 1|2,x:LOGICAL_WIDTH/2,y:LOGICAL_HEIGHT/2,size:Math.min(LOGICAL_WIDTH,LOGICAL_HEIGHT)*0.72,ttl:maxTtl,maxTtl});if(this.mapEvolutionAftermathVfx.length>8)this.mapEvolutionAftermathVfx.splice(0,this.mapEvolutionAftermathVfx.length-8);}
    this.queueBattlefieldEnvironmentReactionVfx('evolutionCollapse', LOGICAL_WIDTH/2, LOGICAL_HEIGHT/2, Math.min(LOGICAL_WIDTH,LOGICAL_HEIGHT)*0.58);
    const descriptor=mapEnvironmentVfxDescriptor(this.terrain.currentLayout.id,stage,this.presentation.quality);
    const collapse=environmentDestructionVfxDescriptor(this.terrain.currentLayout.id,'evolutionCollapse',stage,this.presentation.quality);
    this.presentation.emitScreenEffect({kind:'pulse',x:LOGICAL_WIDTH/2,y:LOGICAL_HEIGHT/2,radius:Math.min(LOGICAL_WIDTH,LOGICAL_HEIGHT)*0.42,color:descriptor.color,ttl:0.42,alpha:descriptor.evolutionPulseAlpha,width:5+stage});
    this.presentation.emitScreenEffect({kind:'glow',x:LOGICAL_WIDTH/2,y:LOGICAL_HEIGHT/2,radius:300,color:collapse.color,ttl:.34,alpha:collapse.glowAlpha});
    for(let i=0;i<collapse.debrisCount;i++){const a=Math.PI*2*i/collapse.debrisCount;this.presentation.emitParticle({x:LOGICAL_WIDTH/2,y:LOGICAL_HEIGHT/2,vx:cosmeticMotionVelocity(Math.cos(a)*collapse.debrisSpeed,this.presentationSettings.reducedMotion),vy:cosmeticMotionVelocity(Math.sin(a)*collapse.debrisSpeed,this.presentationSettings.reducedMotion),color:collapse.color,ttl:.38,size:2.5+(i%3),alpha:.44});}
  }

  private emitTerrainDestructionVfx():void {
    for(const event of this.terrain.drainPresentationEvents()){
      if(event.kind==='crystalBlast'){const maxTtl=.72;this.crystalInteractionLifecycleVfx.push({mapId:this.terrain.currentLayout.id,x:event.x,y:event.y,size:Math.max(132,event.radius*2.45),ttl:maxTtl,maxTtl});if(this.crystalInteractionLifecycleVfx.length>12)this.crystalInteractionLifecycleVfx.splice(0,this.crystalInteractionLifecycleVfx.length-12);}
      this.queueBattlefieldEnvironmentReactionVfx('crystalBlast', event.x, event.y, event.radius*2.2);
      const d=environmentDestructionVfxDescriptor(this.terrain.currentLayout.id,'crystalBlast',this.terrain.evolutionStage,this.presentation.quality);
      for(let i=0;i<d.waveCount;i++)this.presentation.emitScreenEffect({kind:'shockwave',x:event.x,y:event.y,radius:event.radius*(.72+i*.22),color:d.color,ttl:.18+i*.05,alpha:Math.min(.28,d.glowAlpha),width:3+i});
      this.presentation.emitScreenEffect({kind:'glow',x:event.x,y:event.y,radius:event.radius*1.18,color:d.color,ttl:.26,alpha:d.glowAlpha});
      for(let i=0;i<d.debrisCount;i++){const a=Math.PI*2*i/d.debrisCount;this.presentation.emitParticle({x:event.x,y:event.y,vx:cosmeticMotionVelocity(Math.cos(a)*d.debrisSpeed,this.presentationSettings.reducedMotion),vy:cosmeticMotionVelocity(Math.sin(a)*d.debrisSpeed,this.presentationSettings.reducedMotion),color:d.color,ttl:.34,size:2.5+(i%3),alpha:.58});}
    }
  }

  private queueBattlefieldEnvironmentReactionVfx(kind: BattlefieldEnvironmentReactionKind, x:number, y:number, size:number): void {
    const maxTtl = kind === 'evolutionCollapse' ? 0.56 : 0.42;
    this.battlefieldEnvironmentReactionVfx.push({mapId:this.terrain.currentLayout.id,kind,x,y,size:Math.max(72,size),ttl:maxTtl,maxTtl});
    if(this.battlefieldEnvironmentReactionVfx.length>12)this.battlefieldEnvironmentReactionVfx.splice(0,this.battlefieldEnvironmentReactionVfx.length-12);
  }

  private queueBossHazardAftermathVfx(kind:import('./boss-arena.js').BossArenaHazardKind,x:number,y:number,radius:number):void{
    const maxTtl=.78;this.bossHazardAftermathVfx.push({kind,x,y,radius:Math.max(42,radius),ttl:maxTtl,maxTtl});if(this.bossHazardAftermathVfx.length>16)this.bossHazardAftermathVfx.splice(0,this.bossHazardAftermathVfx.length-16);
    const memoryMaxTtl=1.25;this.bossHazardClearedGroundMemory.push({kind,x,y,radius:Math.max(42,radius),ttl:memoryMaxTtl,maxTtl:memoryMaxTtl});if(this.bossHazardClearedGroundMemory.length>16)this.bossHazardClearedGroundMemory.splice(0,this.bossHazardClearedGroundMemory.length-16);
  }
  private attachBossHazardClearedGeometry(geometryShape?:import('./endless/mythic-arena-geometry.js').MythicArenaGeometryShape,angle?:number,length?:number):void{
    const apply=(cue:typeof this.bossHazardClearedGroundMemory[number]|typeof this.bossHazardAftermathVfx[number]|undefined)=>{if(!cue)return;if(geometryShape)cue.geometryShape=geometryShape;if(angle!==undefined)cue.angle=angle;if(length!==undefined)cue.length=length;};
    apply(this.bossHazardAftermathVfx.at(-1));apply(this.bossHazardClearedGroundMemory.at(-1));
  }

  private queueEnemyFinisherVfx(source:EnemyDeathVisualSource,x:number,y:number,enemyType:EnemyType,tier:import('./enemy-hit-death-transition-rendering.js').EnemyHitDeathTier='normal'):void{
    const maxTtl=source==='ultimate'||source==='finalForm'||source==='fusion'?.66:.52;this.enemyFinisherVfx.push({source,x,y,enemyType,tier,ttl:maxTtl,maxTtl});if(this.enemyFinisherVfx.length>24)this.enemyFinisherVfx.splice(0,this.enemyFinisherVfx.length-24);
  }

  private queueHeroCrisisVfx(state:HeroCrisisVfxState):void{
    const maxTtl=state==='nearDeath'?.92:state==='recovery'?.72:state==='critical'?.54:state==='heavy'?.42:.30;this.heroCrisisVfx.push({heroId:this.hero.profileId,state,x:this.hero.pos.x,y:this.hero.pos.y,ttl:maxTtl,maxTtl});if(this.heroCrisisVfx.length>12)this.heroCrisisVfx.splice(0,this.heroCrisisVfx.length-12);
  }

  private drawBossHazardAftermathVfx(ctx:CanvasRenderingContext2D):void{
    if(!this.worldVfxLayerAllowed('boss-hazard-aftermath'))return;
    if(!this.bossHazardAftermathVfxAtlasReady||!this.bossHazardAftermathVfxAtlasImage)return;
    const activeAftermathCount=this.bossHazardAftermathVfx.length;
    const aftermathRank=new Map(this.bossHazardAftermathVfx.map((cue,index)=>[cue,Math.max(0,this.bossHazardAftermathVfx.length-1-index)]));
    for(const cue of this.bossHazardAftermathVfx){
      const lifecycle=bossHazardLifecycleOwnerPresentation({telegraph:0,ttl:0,aftermathTtl:cue.ttl,aftermathMaxTtl:cue.maxTtl},this.presentationSettings.reducedFlash);
      const matchingGroundMemory=this.bossHazardClearedGroundMemory.find((memory)=>Math.hypot(memory.x-cue.x,memory.y-cue.y)<=Math.max(16,cue.radius*.2));
      const expirationGroundState=bossHazardPersistentExpirationGroundStatePresentation({aftermathTtl:cue.ttl,aftermathMaxTtl:cue.maxTtl,memoryTtl:matchingGroundMemory?.ttl??0,memoryMaxTtl:matchingGroundMemory?.maxTtl??1.25},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const expirationGroundHandoff=bossHazardExpirationGroundStateHandoffPresentation({owner:expirationGroundState.owner,aftermathLife:Math.max(0,cue.ttl/Math.max(.001,cue.maxTtl)),memoryLife:Math.max(0,(matchingGroundMemory?.ttl??0)/Math.max(.001,matchingGroundMemory?.maxTtl??1.25))},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const expirationGroundDensity=bossHazardExpirationGroundStateDensityBudgetPresentation({activeCount:activeAftermathCount,indexFromNewest:aftermathRank.get(cue)??activeAftermathCount,owner:expirationGroundState.owner},this.presentationSettings.reducedMotion);
      const aftermathOwnership=bossHazardEndAftermathOwnershipPresentation({aftermathTtl:cue.ttl,aftermathMaxTtl:cue.maxTtl},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const nextHazard=this.bossArena.hazards.filter(h=>h.telegraph>0).reduce<import('./boss-arena.js').BossArenaHazard|null>((best,h)=>{const d=Math.hypot(h.pos.x-cue.x,h.pos.y-cue.y);return !best||d<Math.hypot(best.pos.x-cue.x,best.pos.y-cue.y)?h:best;},null);
      const retirement=bossHazardAftermathTerrainRetirementPresentation({aftermathTtl:cue.ttl,aftermathMaxTtl:cue.maxTtl,nextHazardDistance:nextHazard?Math.hypot(nextHazard.pos.x-cue.x,nextHazard.pos.y-cue.y):999,nextHazardTelegraph:nextHazard?.telegraph??0},this.presentationSettings.reducedFlash);
      const aftermathArbitration=bossHazardAftermathOwnerArbitrationPresentation({endOwner:aftermathOwnership.owner,endAlpha:aftermathOwnership.aftermathAlphaScale,terrainOwner:retirement.owner,aftermathAlpha:retirement.aftermathAlphaScale,terrainAlpha:retirement.terrainAlphaScale},this.presentationSettings.reducedFlash);
      const aftermathDensityBudget=bossHazardAftermathDensityBudgetPresentation({activeCount:activeAftermathCount,indexFromNewest:aftermathRank.get(cue)??activeAftermathCount,owner:aftermathArbitration.owner},this.presentationSettings.reducedMotion);
      const respawnGroundCoherence=bossHazardRespawnGroundCoherencePresentation({memoryLife:Math.max(0,cue.ttl/Math.max(.001,cue.maxTtl)),aftermathActive:true,nextHazardDistance:nextHazard?Math.hypot(nextHazard.pos.x-cue.x,nextHazard.pos.y-cue.y):999,nextHazardRadius:nextHazard?.radius??cue.radius,nextHazardTelegraph:nextHazard?.telegraph??0},this.presentationSettings.reducedFlash);
      const respawnGroundHandoff=bossHazardRespawnGroundHandoffPresentation({coherenceOwner:respawnGroundCoherence.owner,memoryLife:Math.max(0,cue.ttl/Math.max(.001,cue.maxTtl)),nextHazardTelegraph:nextHazard?.telegraph??0},this.presentationSettings.reducedFlash);
      const respawnGroundDensityBudget=bossHazardRespawnGroundDensityBudgetPresentation({activeTransitionCount:activeAftermathCount,indexFromNewest:aftermathRank.get(cue)??activeAftermathCount,owner:respawnGroundCoherence.owner},this.presentationSettings.reducedMotion);
      const progress=1-Math.max(0,cue.ttl/cue.maxTtl);const state=aftermathArbitration.owner==='terrain'?'residual':progress<0.32?'detonate':'residual';const sprite=bossHazardAftermathVfxSprite(cue.kind,state);const size=Math.max(112,cue.radius*2.55)*(state==='detonate'?1+progress*.28:1.08+progress*.16)*retirement.sizeScale*aftermathOwnership.sizeScale*aftermathDensityBudget.sizeScale,cueAlpha=this.worldVfxCueAlpha('tactical',cue.x,cue.y,size*.5);if(cueAlpha<=0||aftermathArbitration.owner==='retired'||!aftermathDensityBudget.visible)continue;const ownerAlpha=aftermathArbitration.owner==='terrain'?Math.max(aftermathArbitration.terrainAlphaScale,aftermathArbitration.aftermathAlphaScale):aftermathArbitration.aftermathAlphaScale;ctx.save();ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?0.36:0.64,(1-progress)*.76+.06)*cueAlpha*lifecycle.aftermathAlphaScale*ownerAlpha*aftermathDensityBudget.alphaScale*respawnGroundCoherence.aftermathAlphaScale*respawnGroundHandoff.aftermathAlphaScale*respawnGroundDensityBudget.aftermathAlphaScale*expirationGroundState.aftermathAlphaScale*expirationGroundHandoff.aftermathAlphaScale*expirationGroundDensity.aftermathAlphaScale;ctx.drawImage(this.bossHazardAftermathVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.x-size/2,cue.y-size/2,size,size);ctx.restore();
    }
  }

  private drawBossHazardClearedGroundMemory(ctx:CanvasRenderingContext2D):void{
    const activeMemoryCount=this.bossHazardClearedGroundMemory.length;
    const respawnMemoryRank=new Map(this.bossHazardClearedGroundMemory.map((cue,index)=>[cue,Math.max(0,this.bossHazardClearedGroundMemory.length-1-index)]));
    for(const cue of this.bossHazardClearedGroundMemory){
      const matchingAftermath=this.bossHazardAftermathVfx.find((after)=>Math.hypot(after.x-cue.x,after.y-cue.y)<=Math.max(24,cue.radius*.35)&&after.ttl>0);
      const aftermathActive=Boolean(matchingAftermath);
      const expirationGroundState=bossHazardPersistentExpirationGroundStatePresentation({aftermathTtl:matchingAftermath?.ttl??0,aftermathMaxTtl:matchingAftermath?.maxTtl??.78,memoryTtl:cue.ttl,memoryMaxTtl:cue.maxTtl},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const expirationGroundHandoff=bossHazardExpirationGroundStateHandoffPresentation({owner:expirationGroundState.owner,aftermathLife:Math.max(0,(matchingAftermath?.ttl??0)/Math.max(.001,matchingAftermath?.maxTtl??.78)),memoryLife:Math.max(0,cue.ttl/Math.max(.001,cue.maxTtl))},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const expirationGroundDensity=bossHazardExpirationGroundStateDensityBudgetPresentation({activeCount:activeMemoryCount,indexFromNewest:respawnMemoryRank.get(cue)??activeMemoryCount,owner:expirationGroundState.owner},this.presentationSettings.reducedMotion);
      const expirationGroundTransitionScale=1-(1-expirationGroundState.groundAlphaScale*expirationGroundHandoff.groundAlphaScale)*expirationGroundDensity.effectStrength;
      const nextHazard=this.bossArena.hazards.filter((hazard)=>hazard.telegraph>0).reduce<import('./boss-arena.js').BossArenaHazard|null>((best,hazard)=>{const d=Math.hypot(hazard.pos.x-cue.x,hazard.pos.y-cue.y);return !best||d<Math.hypot(best.pos.x-cue.x,best.pos.y-cue.y)?hazard:best;},null);
      const memory=bossHazardClearedGroundMemoryPresentation({memoryTtl:cue.ttl,memoryMaxTtl:cue.maxTtl,aftermathActive,nextHazardDistance:nextHazard?Math.hypot(nextHazard.pos.x-cue.x,nextHazard.pos.y-cue.y):999,nextHazardTelegraph:nextHazard?.telegraph??0},this.presentationSettings.reducedFlash);
      const hazardGroundResolution=hazardGroundResolutionPresentation({hazardActive:false,hazardLife:0,memoryLife:Math.max(0,cue.ttl/Math.max(.001,cue.maxTtl))},this.presentationSettings.reducedFlash);
      const respawnGroundCoherence=bossHazardRespawnGroundCoherencePresentation({memoryLife:Math.max(0,cue.ttl/Math.max(.001,cue.maxTtl)),aftermathActive,nextHazardDistance:nextHazard?Math.hypot(nextHazard.pos.x-cue.x,nextHazard.pos.y-cue.y):999,nextHazardRadius:nextHazard?.radius??cue.radius,nextHazardTelegraph:nextHazard?.telegraph??0},this.presentationSettings.reducedFlash);
      const respawnGroundHandoff=bossHazardRespawnGroundHandoffPresentation({coherenceOwner:respawnGroundCoherence.owner,memoryLife:Math.max(0,cue.ttl/Math.max(.001,cue.maxTtl)),nextHazardTelegraph:nextHazard?.telegraph??0},this.presentationSettings.reducedFlash);
      const respawnGroundDensityBudget=bossHazardRespawnGroundDensityBudgetPresentation({activeTransitionCount:activeMemoryCount,indexFromNewest:respawnMemoryRank.get(cue)??activeMemoryCount,owner:respawnGroundCoherence.owner},this.presentationSettings.reducedMotion);
      if(memory.owner!=='cleared'||memory.clearedAlpha<=0||respawnGroundCoherence.memoryAlphaScale<=0||respawnGroundHandoff.memoryAlphaScale<=0||respawnGroundDensityBudget.memoryAlphaScale<=0||expirationGroundTransitionScale<=0)continue;
      const radius=cue.radius*memory.radiusScale*expirationGroundState.groundRadiusScale,cueAlpha=this.worldVfxCueAlpha('informational',cue.x,cue.y,radius);if(cueAlpha<=0)continue;
      const geometry=bossClearedGroundGeometryPresentation({geometryShape:cue.geometryShape,radius,angle:cue.angle??0,length:cue.length??0,alpha:memory.clearedAlpha},this.presentationSettings.reducedFlash);
      const forecastLane=bossClearedSafeLaneForecastTarget({currentTarget:this.currentMythicSafeLanePresentation?.target,currentConfidence:this.currentMythicSafeLanePresentation?.confidence,nextTarget:this.currentMythicSafeLanePresentation?.forecastTarget,forecastUrgency:this.currentMythicSafeLanePresentation?.forecastUrgency,transitionMs:this.currentMythicSafeLanePresentation?.forecastTransitionMs},this.presentationSettings.reducedFlash);const agreement=bossClearedSafeLaneArbitrationPresentation({shape:geometry.shape,center:{x:cue.x,y:cue.y},angle:geometry.angle,halfLength:geometry.halfLength,halfWidth:geometry.halfWidth,safeLaneTarget:forecastLane.target,safeLaneConfidence:forecastLane.confidence},this.presentationSettings.reducedFlash),clearedAlphaScale=agreement.clearedAlphaScale;if(clearedAlphaScale<=0)continue;
      ctx.save();ctx.translate(cue.x,cue.y);ctx.rotate(geometry.angle);ctx.globalAlpha=geometry.alpha*cueAlpha*clearedAlphaScale*respawnGroundCoherence.memoryAlphaScale*respawnGroundHandoff.memoryAlphaScale*respawnGroundDensityBudget.memoryAlphaScale*expirationGroundTransitionScale*expirationGroundDensity.groundAlphaScale*hazardGroundResolution.clearedGroundAlphaScale;ctx.strokeStyle='#8fffd3';ctx.lineWidth=1.5;ctx.setLineDash([5,9]);ctx.beginPath();if(geometry.shape==='circle')ctx.arc(0,0,geometry.radius,0,Math.PI*2);else if(geometry.shape==='corridor')ctx.rect(-geometry.halfLength,-geometry.halfWidth,geometry.halfLength*2,geometry.halfWidth*2);else{ctx.moveTo(-geometry.halfLength,0);ctx.lineTo(geometry.halfLength,0);ctx.moveTo(0,-geometry.halfLength);ctx.lineTo(0,geometry.halfLength);}ctx.stroke();ctx.setLineDash([]);ctx.restore();
    }
  }

  private drawEnemyFinisherVfx(ctx:CanvasRenderingContext2D):void{
    if(!this.enemyFinisherVfxAtlasReady||!this.enemyFinisherVfxAtlasImage)return;const activeFinisherCount=this.enemyFinisherVfx.length;const finisherRank=new Map(this.enemyFinisherVfx.map((cue,index)=>[cue,Math.max(0,this.enemyFinisherVfx.length-1-index)]));for(const cue of this.enemyFinisherVfx){const progress=1-Math.max(0,cue.ttl/cue.maxTtl);const state=progress<0.38?'burst':'afterglow';const sprite=enemyFinisherVfxSprite(cue.source,state);const eliteScale=cue.enemyType==='boss'?1.55:cue.enemyType==='elite'?1.28:1;const size=(state==='burst'?92:108)*eliteScale*(1+progress*.18);const deathAfterglowContinuity=enemyFinisherDeathAfterglowContinuityPresentation({deathProgress:progress,finisherProgress:progress,tier:cue.tier},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);const deathAfterglowHandoff=enemyFinisherDeathAfterglowHandoffPresentation({owner:deathAfterglowContinuity.owner,deathProgress:progress,afterglowAlpha:deathAfterglowContinuity.afterglowAlphaScale},this.presentationSettings.reducedMotion);const deathAfterglowDensity=enemyFinisherDeathAfterglowDensityBudgetPresentation({activeCount:activeFinisherCount,indexFromNewest:finisherRank.get(cue)??activeFinisherCount,tier:cue.tier,owner:deathAfterglowHandoff.owner},this.presentationSettings.reducedMotion);ctx.save();ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?0.42:0.72,(1-progress)*.82+.05)*(state==='afterglow'?deathAfterglowContinuity.afterglowAlphaScale*deathAfterglowHandoff.afterglowScale*deathAfterglowDensity.effectStrength:deathAfterglowContinuity.finisherAlphaScale*deathAfterglowHandoff.finisherScale*Math.max(.62,deathAfterglowDensity.effectStrength));ctx.drawImage(this.enemyFinisherVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.x-size/2,cue.y-size/2,size,size);ctx.restore();}
  }

  private drawHeroCrisisVfx(ctx:CanvasRenderingContext2D):void{
    if(!this.heroCrisisVfxAtlasReady||!this.heroCrisisVfxAtlasImage)return;for(const cue of this.heroCrisisVfx){const progress=1-Math.max(0,cue.ttl/cue.maxTtl);const sprite=heroCrisisVfxSprite(cue.heroId,cue.state);const anchorActive=cue.state==='nearDeath'||cue.state==='recovery';const x=anchorActive?this.hero.pos.x:cue.x,y=anchorActive?this.hero.pos.y:cue.y;const size=(cue.state==='nearDeath'?126:cue.state==='critical'?112:cue.state==='heavy'?96:cue.state==='recovery'?108:84)*(1+progress*.16);ctx.save();ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?0.38:0.7,(1-progress)*.82+.05);ctx.drawImage(this.heroCrisisVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,x-size/2,y-size/2,size,size);ctx.restore();}
  }

  private queuePerfectEvadeTrailVfx(dirX:number,dirY:number):void{const mag=Math.hypot(dirX,dirY)||1,maxTtl=.78;this.perfectEvadeTrailVfx.push({heroId:this.hero.profileId,x:this.hero.pos.x,y:this.hero.pos.y,dirX:dirX/mag,dirY:dirY/mag,ttl:maxTtl,maxTtl});if(this.perfectEvadeTrailVfx.length>12)this.perfectEvadeTrailVfx.splice(0,this.perfectEvadeTrailVfx.length-12);}
  private drawPerfectEvadeTrailVfx(ctx:CanvasRenderingContext2D):void{if(!this.perfectEvadeTrailVfxAtlasReady||!this.perfectEvadeTrailVfxAtlasImage)return;for(const cue of this.perfectEvadeTrailVfx){const progress=1-Math.max(0,cue.ttl/cue.maxTtl),state=progress<0.28?'escape':progress<0.72?'slipstream':'success',sprite=perfectEvadeTrailVfxSprite(cue.heroId,state),angle=Math.atan2(cue.dirY,cue.dirX),travel=state==='success'?18:progress*64,x=cue.x+cue.dirX*travel,y=cue.y+cue.dirY*travel,size=state==='slipstream'?126:108;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?0.34:0.68,(1-progress)*.78+.08);ctx.drawImage(this.perfectEvadeTrailVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,-size/2,-size/2,size,size);ctx.restore();}}
  private queueBossCounterplayRewardBurstVfx(archetype:BossArchetype,x:number,y:number):void{const maxTtl=.68;this.bossCounterplayRewardBurstVfx.push({archetype,x,y,ttl:maxTtl,maxTtl});if(this.bossCounterplayRewardBurstVfx.length>8)this.bossCounterplayRewardBurstVfx.splice(0,this.bossCounterplayRewardBurstVfx.length-8);}
  private drawBossCounterplayRewardVfx(ctx:CanvasRenderingContext2D):void{if(!this.bossCounterplayRewardVfxAtlasReady||!this.bossCounterplayRewardVfxAtlasImage)return;for(const cue of this.bossCounterplayRewardBurstVfx){const progress=1-Math.max(0,cue.ttl/cue.maxTtl),sprite=bossCounterplayRewardVfxSprite(cue.archetype,'burst'),size=138*(1+progress*.38);ctx.save();ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?0.36:0.72,(1-progress)*.84+.06);ctx.drawImage(this.bossCounterplayRewardVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.x-size/2,cue.y-size/2,size,size);ctx.restore();}const archetype=this.bossEncounter.archetype;if(!archetype||!bossCounterplayBenefitActive(archetype,this.bossEncounter.modifiers))return;const boss=this.enemies.enemies.find(enemy=>enemy.alive&&enemy.id===this.bossEncounter.activeBossId);if(!boss)return;const sprite=bossCounterplayRewardVfxSprite(archetype,'aura'),size=Math.max(170,boss.radius*4.4);ctx.save();ctx.globalAlpha=this.presentationSettings.reducedFlash?0.30:0.48;ctx.drawImage(this.bossCounterplayRewardVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,boss.pos.x-size/2,boss.pos.y-size/2,size,size);ctx.restore();}

  private drawBossPhaseTransitionVfx(ctx:CanvasRenderingContext2D):void {
    if(!this.bossPhaseAftermathVfxAtlasReady||!this.bossPhaseAftermathVfxAtlasImage)return;
    for(const cue of this.bossPhaseTransitionVfx){const progress=1-Math.max(0,cue.ttl/cue.maxTtl);const state=progress<0.34?'burst':'aftermath';const sprite=bossPhaseAftermathVfxSprite(cue.archetype,cue.phase,state);const scale=state==='burst'?(1+progress*.38):(1.12+progress*.18);const size=(cue.phase===3?238:204)*scale;ctx.save();ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?0.42:0.72,(1-progress)*0.86+0.08);ctx.drawImage(this.bossPhaseAftermathVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.x-size/2,cue.y-size/2,size,size);ctx.restore();}
  }

  private drawMapEvolutionAftermathVfx(ctx:CanvasRenderingContext2D):void {
    if(!this.worldVfxLayerAllowed('map-evolution-aftermath'))return;
    const layerAlpha=this.worldVfxLayerAlpha('decorative');if(layerAlpha<=0)return;
    if(!this.mapEvolutionAftermathVfxAtlasReady||!this.mapEvolutionAftermathVfxAtlasImage)return;
    for(const cue of this.mapEvolutionAftermathVfx){const progress=1-Math.max(0,cue.ttl/cue.maxTtl);const state=progress<0.24?'collapse':progress<0.62?'debris':'settle';const sprite=mapEvolutionAftermathVfxSprite(cue.mapId,cue.stage,state);const size=cue.size*(state==='collapse'?0.82+progress*.55:state==='debris'?1.02:1.08);ctx.save();ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?0.34:0.56,(1-progress)*0.62+0.10)*layerAlpha;ctx.drawImage(this.mapEvolutionAftermathVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.x-size/2,cue.y-size/2,size,size);ctx.restore();}
  }

  private drawCrystalInteractionLifecycleVfx(ctx:CanvasRenderingContext2D):void{
    if(!this.crystalInteractionLifecycleVfxAtlasReady||!this.crystalInteractionLifecycleVfxAtlasImage)return;
    for(const cue of this.crystalInteractionLifecycleVfx){const progress=1-Math.max(0,cue.ttl/cue.maxTtl);const state=progress<0.45?'blast':'afterglow';const sprite=crystalInteractionLifecycleVfxSprite(cue.mapId,state);const size=cue.size*(1+progress*.22);ctx.save();ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?.46:.78,(1-progress)*.86);ctx.drawImage(this.crystalInteractionLifecycleVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.x-size/2,cue.y-size/2,size,size);ctx.restore();}
  }

  private drawBattlefieldEnvironmentReactionVfx(ctx:CanvasRenderingContext2D):void {
    if(!this.battlefieldEnvironmentReactionVfxAtlasReady||!this.battlefieldEnvironmentReactionVfxAtlasImage)return;
    for(const cue of this.battlefieldEnvironmentReactionVfx){const sprite=battlefieldEnvironmentReactionVfxSprite(cue.mapId,cue.kind);const t=Math.max(0,Math.min(1,cue.ttl/cue.maxTtl));ctx.save();ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?.52:.78,.18+t*.62);ctx.drawImage(this.battlefieldEnvironmentReactionVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.x-cue.size/2,cue.y-cue.size/2,cue.size,cue.size);ctx.restore();}
  }

  private drawBattlefieldAtmosphereVfx(ctx:CanvasRenderingContext2D):void {
    const layerAlpha=this.worldVfxLayerAlpha('decorative');if(layerAlpha<=0)return;
    if(!this.battlefieldAtmosphereVfxAtlasReady||!this.battlefieldAtmosphereVfxAtlasImage)return;
    const sprite=battlefieldAtmosphereVfxSprite(this.terrain.currentLayout.id,this.terrain.evolutionStage);
    const drift=this.presentationSettings.reducedMotion?0:Math.sin(this.elapsed*0.08)*6;
    ctx.save();ctx.globalAlpha=(this.presentationSettings.quality==='low'?.16:this.presentationSettings.quality==='medium'?.22:.28)*layerAlpha;
    ctx.drawImage(this.battlefieldAtmosphereVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,-8+drift,-5,LOGICAL_WIDTH+16,LOGICAL_HEIGHT+10);ctx.restore();
  }

  private drawBattlefieldDepthOverlays(ctx:CanvasRenderingContext2D):void {
    const layerAlpha=this.worldVfxLayerAlpha('decorative');if(layerAlpha<=0)return;
    if(!this.battlefieldDepthOverlayAtlasReady||!this.battlefieldDepthOverlayAtlasImage)return;
    const sprite=battlefieldDepthOverlaySprite(this.terrain.currentLayout.id,this.terrain.evolutionStage);
    const driftX=this.presentationSettings.reducedMotion?0:Math.sin(this.elapsed*0.11+this.terrain.evolutionStage*.7)*sprite.motionAmplitude;
    const driftY=this.presentationSettings.reducedMotion?0:Math.cos(this.elapsed*0.09+this.terrain.evolutionStage*.45)*Math.max(1,sprite.motionAmplitude*.45);
    const baseAlpha=this.presentationSettings.quality==='low'?.08:this.presentationSettings.quality==='medium'?.12:.16;
    const stageBoost=this.terrain.evolutionStage===2?.04:this.terrain.evolutionStage===1?.02:0;
    ctx.save();
    ctx.globalCompositeOperation='screen';
    ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?.12:baseAlpha+stageBoost,.22)*layerAlpha;
    ctx.drawImage(this.battlefieldDepthOverlayAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,-10+driftX,-8+driftY,LOGICAL_WIDTH+20,LOGICAL_HEIGHT+16);
    ctx.globalCompositeOperation='source-over';
    ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?.08:baseAlpha*.65+stageBoost*.5,.15)*layerAlpha;
    ctx.drawImage(this.battlefieldDepthOverlayAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,-6+driftX*.55,-4+driftY*.45,LOGICAL_WIDTH+12,LOGICAL_HEIGHT+8);
    ctx.restore();
  }

  private drawBossHealthPressure(ctx:CanvasRenderingContext2D):void {
    const boss=this.enemies.enemies.find((enemy)=>enemy.alive&&enemy.type==='boss'); if(!boss)return;
    const archetype=boss.bossArchetype??'inferno',ratio=boss.hp/Math.max(1,boss.maxHp);
    const profile=bossHealthPressureProfile(archetype,ratio,this.presentation.quality,this.presentationSettings.reducedFlash);
    const envelope=bossPressureEnvelope(archetype,ratio,this.elapsed,this.presentation.quality,this.presentationSettings.reducedFlash,this.presentationSettings.reducedMotion);
    const threatBand=this.hero.hp<=this.hero.maxHp*.30||this.core.hp<=this.core.maxHp*.30?'critical':this.hero.hp<=this.hero.maxHp*.55||this.core.hp<=this.core.maxHp*.55?'danger':'normal';
    const focus=visualFocusBudget(this.presentation.quality,threatBand,profile.tier);
    this.drawNemesisAdaptationRecall(ctx,boss,3);
    this.drawBossEffectivePressureRecall(ctx,boss);
    this.drawBossArchetypeRecall(ctx,boss);
    this.drawBossArenaMutationRecall(ctx,boss);
    this.drawMythicPhaseRecall(ctx,boss);
    this.drawBossPhaseEscalationRecall(ctx,boss);
    this.drawBossCounterplayBenefitRecall(ctx,boss);
    this.drawBossVariantPressureRecall(ctx,boss);
    this.drawApexSecondaryPatternRecall(ctx,boss);
    if(profile.edgeAlpha<=0)return;
    ctx.save(); ctx.strokeStyle=profile.color; ctx.lineWidth=(profile.tier==='desperate'?5:3)*envelope.lineWidthScale; ctx.globalAlpha=profile.edgeAlpha*envelope.edgeScale*focus.bossPressureScale; ctx.strokeRect(profile.inset,profile.inset,LOGICAL_WIDTH-profile.inset*2,LOGICAL_HEIGHT-profile.inset*2);
    ctx.globalAlpha=profile.glowAlpha*envelope.glowScale*focus.bossPressureScale; ctx.lineWidth=12*envelope.lineWidthScale; ctx.strokeRect(profile.inset+8,profile.inset+8,LOGICAL_WIDTH-(profile.inset+8)*2,LOGICAL_HEIGHT-(profile.inset+8)*2); ctx.restore();
  }

  private drawKillChainCue(ctx:CanvasRenderingContext2D):void {
    if(!this.killChainCue)return;
    const alpha=Math.min(1,this.killChainCueTimer/0.18);
    ctx.save(); ctx.globalAlpha=this.presentationSettings.reducedFlash?Math.min(0.72,alpha):alpha;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font=`900 ${18+this.killChainCue.tier*3}px system-ui`; ctx.fillStyle=this.killChainCue.color;
    ctx.shadowColor='rgba(0,0,0,.72)'; ctx.shadowBlur=8;
    ctx.fillText(`${this.killChainCue.label} · ×${this.killChainCue.count}`,LOGICAL_WIDTH/2,142);
    ctx.restore();
  }

  private drawEnemyStatusCues(ctx: CanvasRenderingContext2D, motion: SecondaryCombatMotionPolicy): void {
    const frost = enemyStatusCue('freeze');
    const frozen=this.enemies.enemies.filter((enemy)=>enemy.alive&&enemy.slowTimer>0);
    const primaryFrozenEnemyId=motion.owner==='freeze-status'
      ? frozen.reduce<Enemy|null>((best,enemy)=>!best||distance(this.hero.pos,enemy.pos)<distance(this.hero.pos,best.pos)?enemy:best,null)?.id??null
      : null;
    ctx.save();
    for (const enemy of frozen) {
      const amplitude=enemy.id===primaryFrozenEnemyId?motion.freezeStatusMotionAmplitude:0;
      if(this.freezeControlVfxAtlasReady&&this.freezeControlVfxAtlasImage){
        const enemyClass=freezeControlVfxClassForEnemyType(enemy.type),sprite=freezeControlVfxSprite(enemyClass,'active');
        const size=Math.max(enemyClass==='boss'?142:enemyClass==='elite'?112:enemyClass==='specialist'?92:78,enemy.radius*(enemyClass==='boss'?2.5:3.15));
        ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?.46:.72,.56+Math.sin(this.elapsed*5+enemy.id)*amplitude);
        ctx.drawImage(this.freezeControlVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,enemy.pos.x-size/2,enemy.pos.y-size/2,size,size);
      }else{
        ctx.globalAlpha = 0.52 + Math.sin(this.elapsed * 5 + enemy.id) * amplitude;
        ctx.strokeStyle = frost.color; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(enemy.pos.x, enemy.pos.y, enemy.radius + 6, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.restore();
  }

  private drawDangerTelegraphs(ctx: CanvasRenderingContext2D): void {
    const cues = sortTelegraphsByPriority(this.enemies.enemies.map((enemy) => enemyThreatTelegraph(enemy))).slice(0, 24);
    ctx.save();
    for (const cue of cues) {
      const enemy = this.enemies.enemies.find((candidate) => candidate.id === cue.enemyId);
      if (!enemy) continue;
      ctx.globalAlpha = cue.style === 'support-ring' ? 0.42 : 0.78;
      ctx.strokeStyle = cue.color; ctx.lineWidth = cue.style === 'boss-ring' ? 5 : 3.5;
      if (enemy.type === 'boss') {
        const phase = bossPhaseForRatio(enemy.hp / Math.max(1, enemy.maxHp));
        const pattern = bossPatternTelegraph(enemy.bossArchetype ?? 'inferno', phase);
        ctx.strokeStyle = pattern.color; ctx.globalAlpha = pattern.opacity;
        if (pattern.style === 'lane') {
          ctx.lineWidth = Math.max(10, pattern.width * 0.12);
          ctx.beginPath(); ctx.moveTo(enemy.pos.x, enemy.pos.y); ctx.lineTo(this.hero.pos.x, this.hero.pos.y); ctx.stroke();
        } else {
          ctx.lineWidth = pattern.width;
          ctx.beginPath(); ctx.arc(enemy.pos.x, enemy.pos.y, pattern.radius, 0, Math.PI * 2); ctx.stroke();
        }
      } else {
        ctx.beginPath(); ctx.arc(enemy.pos.x, enemy.pos.y, cue.radius, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.restore();
    this.presentation.renderTelegraphs(ctx);
  }

  private drawBossPhaseCue(ctx: CanvasRenderingContext2D): void {
    if (!this.bossPhaseCue) return;
    const alpha = Math.min(1, this.bossPhaseCueTimer / 0.28);
    ctx.save(); ctx.globalAlpha = this.presentationSettings.reducedFlash ? Math.min(0.58, alpha) : alpha;
    const vignetteAlpha=this.presentationSettings.reducedFlash?Math.min(0.12,this.bossPhaseCue.cinematic.vignetteAlpha):this.bossPhaseCue.cinematic.vignetteAlpha;
    ctx.save(); ctx.globalAlpha=vignetteAlpha*alpha; ctx.strokeStyle=this.bossPhaseCue.color; ctx.lineWidth=20; ctx.strokeRect(10,10,LOGICAL_WIDTH-20,LOGICAL_HEIGHT-20); ctx.restore();
    ctx.fillStyle = 'rgba(5,8,15,.88)'; ctx.fillRect(570, 178, 460, 56);
    this.drawBossPhaseEscalationCueIcon(ctx);
    ctx.strokeStyle = this.bossPhaseCue.color; ctx.lineWidth = 3; ctx.strokeRect(570, 178, 460, 56);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.font = '900 22px system-ui';
    ctx.fillText(this.bossPhaseCue.title, 800, 206); ctx.restore();
  }

  private createPresentationControls(parent: HTMLElement): HTMLDivElement {
    const row = document.createElement('div');
    row.className = 'presentation-controls';
    const sync = () => {
      row.replaceChildren();
      const defs: Array<{label:string;ariaLabel:string;pressed:boolean|null;action:()=>void}> = [
        {label:`VFX ${this.presentationSettings.quality.toUpperCase()}`,ariaLabel:`시각 효과 품질 ${this.presentationSettings.quality}`,pressed:null,action:() => {
          this.presentationSettings.quality = this.presentationSettings.quality === 'high' ? 'medium' : this.presentationSettings.quality === 'medium' ? 'low' : 'high';
          this.presentation.quality = this.presentationSettings.quality;
        }},
        {label:`FLASH ${this.presentationSettings.reducedFlash ? 'LOW' : 'ON'}`,ariaLabel:'섬광 줄이기',pressed:this.presentationSettings.reducedFlash,action:() => { this.presentationSettings.reducedFlash = !this.presentationSettings.reducedFlash; }},
        {label:`SHAKE ${this.presentationSettings.reducedShake ? 'LOW' : 'ON'}`,ariaLabel:'화면 흔들림 줄이기',pressed:this.presentationSettings.reducedShake,action:() => { this.presentationSettings.reducedShake = !this.presentationSettings.reducedShake; }},
        {label:`MOTION ${this.presentationSettings.reducedMotion ? 'LOW' : 'ON'}`,ariaLabel:'장식 움직임 줄이기',pressed:this.presentationSettings.reducedMotion,action:() => { this.presentationSettings.reducedMotion = !this.presentationSettings.reducedMotion; }},
        {label:`HAPTIC ${this.presentationSettings.haptics ? 'ON' : 'OFF'}`,ariaLabel:'진동 사용',pressed:this.presentationSettings.haptics,action:() => { this.presentationSettings.haptics = !this.presentationSettings.haptics; }},
        {label:`SOUND ${this.audioSettings.enabled ? 'ON' : 'OFF'}`,ariaLabel:'사운드 사용',pressed:this.audioSettings.enabled,action:() => { this.audioSettings.enabled = !this.audioSettings.enabled; this.audio.settings = this.audioSettings; saveAudioSettings(this.storage, this.audioSettings); }},
        {label:`VOL ${Math.round(this.audioSettings.volume * 100)}%`,ariaLabel:`사운드 볼륨 ${Math.round(this.audioSettings.volume * 100)} 퍼센트`,pressed:null,action:() => { this.audioSettings.volume = this.audioSettings.volume > 0.75 ? 0.35 : this.audioSettings.volume > 0.45 ? 1 : 0.65; this.audio.settings = this.audioSettings; saveAudioSettings(this.storage, this.audioSettings); }},
      ];
      for (const def of defs) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = def.label;
        button.setAttribute('aria-label', def.ariaLabel);
        if (def.pressed !== null) button.setAttribute('aria-pressed', String(def.pressed));
        button.addEventListener('click', (event) => { event.preventDefault(); def.action(); savePresentationSettings(this.presentationSettings, this.storage); sync(); });
        row.append(button);
      }
    };
    sync(); parent.append(row); return row;
  }

  private drawArena(ctx: CanvasRenderingContext2D): void {
    const palette = this.terrain.currentLayout.palette;
    const grad = ctx.createRadialGradient(800, 450, 100, 800, 450, 850);
    grad.addColorStop(0, palette.center);
    grad.addColorStop(0.55, palette.mid);
    grad.addColorStop(1, palette.edge);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    if (this.battlefieldEnvironmentAtlasReady && this.battlefieldEnvironmentAtlasImage) {
      const sprite = battlefieldEnvironmentSprite(this.terrain.currentLayout.id, this.terrain.evolutionStage);
      ctx.save();
      ctx.globalAlpha = 0.32;
      ctx.drawImage(this.battlefieldEnvironmentAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.restore();
    }

    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    for (let x = 80; x < LOGICAL_WIDTH; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 80); ctx.lineTo(x, LOGICAL_HEIGHT - 40); ctx.stroke();
    }
    for (let y = 100; y < LOGICAL_HEIGHT; y += 80) {
      ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(LOGICAL_WIDTH - 40, y); ctx.stroke();
    }
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(ARENA_MARGIN, ARENA_MARGIN + 38, LOGICAL_WIDTH - ARENA_MARGIN * 2, LOGICAL_HEIGHT - ARENA_MARGIN * 2 - 38);
  }

  private drawCore(ctx: CanvasRenderingContext2D, motion: SecondaryCombatMotionPolicy): void {
    const { x, y } = this.core.pos;
    const pulse = 1 + Math.sin(this.elapsed * 2.6) * motion.coreAmbientMotionAmplitude;
    ctx.save();
    ctx.translate(x, y);
    const combatBuild = this.currentCombatBuild();
    const auraRadius = 220 + combatBuild.edricAuraRadiusBonus;
    if (this.hero.profileId === 'edric' && distance(this.hero.pos, this.core.pos) <= auraRadius) {
      ctx.strokeStyle = 'rgba(244,205,105,.25)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, auraRadius, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(79,209,255,.18)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 92 * pulse, 0, Math.PI * 2); ctx.stroke();
    const grad = ctx.createRadialGradient(-12, -15, 8, 0, 0, 55);
    grad.addColorStop(0, '#d7fbff'); grad.addColorStop(.3, '#68d7ff'); grad.addColorStop(1, '#154a78');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, this.core.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#9feeff'; ctx.lineWidth = 4; ctx.stroke();
    if (this.battlefieldInteractionVfxAtlasReady && this.battlefieldInteractionVfxAtlasImage) {
      const coreState = battlefieldCoreVisualState(this.core.hp / Math.max(1, this.core.maxHp));
      const sprite = battlefieldInteractionSprite('core', coreState);
      const size = 122;
      ctx.globalAlpha = 0.96;
      ctx.drawImage(this.battlefieldInteractionVfxAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -size / 2, -size / 2, size, size);
    }
    ctx.restore();
  }

  private drawBossSignatureVfx(ctx: CanvasRenderingContext2D): void {
    if (!this.bossSignatureVfxAtlasReady || !this.bossSignatureVfxAtlasImage) return;
    const boss = this.enemies.enemies.find((enemy) => enemy.alive && enemy.type === 'boss');
    if (!boss) return;
    const entrance = this.bossSignatureEntranceBossId === boss.id && this.elapsed <= this.bossSignatureEntranceUntil;
    const specialTimer = boss.specialTimer ?? 99;
    const specialCharge = specialTimer <= 1.2 ? 1 - Math.max(0, specialTimer) / 1.2 : 0;
    const phaseActive = Boolean(this.bossPhaseCue && this.bossPhaseCue.bossId === boss.id && this.bossPhaseCueTimer > 0);
    if (!entrance && specialCharge <= 0 && !phaseActive) return;
    const sprite = bossSignatureVfxSprite(boss.bossArchetype ?? 'inferno');
    const entranceStrength = entrance ? Math.max(0, Math.min(1, (this.bossSignatureEntranceUntil - this.elapsed) / 1.15)) : 0;
    const strength = Math.max(entranceStrength, specialCharge, phaseActive ? 0.86 : 0);
    const size = Math.max(150, boss.radius * (3.25 + strength * 0.65));
    const rotation = this.presentationSettings.reducedMotion ? 0 : this.elapsed * 0.42;
    ctx.save();
    ctx.translate(boss.pos.x, boss.pos.y);
    ctx.rotate(rotation);
    ctx.globalAlpha = Math.min(this.presentationSettings.reducedFlash ? 0.42 : 0.62, 0.22 + strength * 0.42);
    ctx.drawImage(this.bossSignatureVfxAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  private drawTerrainSpriteOverlays(ctx: CanvasRenderingContext2D, motion: ResidualCombatMotionPolicy): void {
    if (!this.battlefieldPropVfxAtlasReady || !this.battlefieldPropVfxAtlasImage) return;
    const mapId = this.terrain.currentLayout.id;
    const wallSprite = battlefieldPropSprite(mapId, 'wall');
    const obstacleState = battlefieldObstacleStateForEvolution(this.terrain.evolutionStage);
    const obstacleSprite = battlefieldObstacleStateVfxSprite(mapId, obstacleState);
    const crystalSprite = battlefieldPropSprite(mapId, 'crystal');

    for (const wall of this.terrain.walls) {
      const drawWidth = Math.max(wall.w + 18, 72);
      const drawHeight = Math.max(wall.h + 18, 72);
      const dx = wall.x + wall.w / 2 - drawWidth / 2;
      const dy = wall.y + wall.h / 2 - drawHeight / 2;
      ctx.save();
      ctx.globalAlpha = 0.92;
      if (this.battlefieldObstacleStateVfxAtlasReady && this.battlefieldObstacleStateVfxAtlasImage) {
        ctx.drawImage(this.battlefieldObstacleStateVfxAtlasImage, obstacleSprite.sx, obstacleSprite.sy, obstacleSprite.sw, obstacleSprite.sh, dx, dy, drawWidth, drawHeight);
      } else {
        ctx.drawImage(this.battlefieldPropVfxAtlasImage, wallSprite.sx, wallSprite.sy, wallSprite.sw, wallSprite.sh, dx, dy, drawWidth, drawHeight);
      }
      ctx.restore();
    }

    for (const crystal of this.terrain.crystals) {
      const active = crystal.cooldown <= 0;
      const pulse = active ? 1 + Math.sin(this.elapsed * 4.5) * (motion.terrainCrystalMotionAmplitude ?? 0.08) : 0.86;
      const size = (active ? 104 : 94) * pulse;
      ctx.save();
      ctx.globalAlpha = active ? 0.98 : 0.66;
      ctx.drawImage(this.battlefieldPropVfxAtlasImage, crystalSprite.sx, crystalSprite.sy, crystalSprite.sw, crystalSprite.sh, crystal.x - size / 2, crystal.y - size * 0.58, size, size);
      if (active && crystal.charge > 0 && this.crystalInteractionLifecycleVfxAtlasReady && this.crystalInteractionLifecycleVfxAtlasImage) {
        const chargeRatio = crystal.charge / Math.max(1,crystal.threshold);
        const chargingSprite = crystalInteractionLifecycleVfxSprite(mapId,'charging');
        const primedSprite = crystalInteractionLifecycleVfxSprite(mapId,'primed');
        const interactionSprite = chargeRatio >= 0.7 ? primedSprite : chargingSprite;
        const interactionSize = size * 1.34;
        ctx.save(); ctx.globalAlpha = chargeRatio >= 0.7 ? 0.78 : 0.52;
        ctx.drawImage(this.crystalInteractionLifecycleVfxAtlasImage,interactionSprite.sx,interactionSprite.sy,interactionSprite.sw,interactionSprite.sh,crystal.x-interactionSize/2,crystal.y-interactionSize*.56,interactionSize,interactionSize); ctx.restore();
      }
      if (active) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#f6fbff';
        ctx.font = '900 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.floor(crystal.charge)}/${crystal.threshold}`, crystal.x, crystal.y + 46);
      }
      ctx.restore();
    }
  }

  private queueSurvivalResponseVfx(kind:SurvivalResponseVfxKind,metadata?:{mitigationRatio?:number;damageSource?:string;pressureVector?:Vec2}):void{
    const cooldown=kind==='coreHit'||kind==='coreGuard'||kind==='heroGuard'?.10:.04,last=this.survivalResponseLastAt[kind]??-99;
    if(this.elapsed-last<cooldown)return;
    this.survivalResponseLastAt[kind]=this.elapsed;
    const target=kind.startsWith('core')?this.core.pos:this.hero.pos,maxTtl=kind==='coreHit'?.34:kind.includes('Guard')?.42:.52;
    let damageSource=metadata?.damageSource,mixedPressure=false,pressureVector=metadata?.pressureVector;
    if(kind==='coreHit'&&damageSource){const delta=Math.max(0,this.elapsed-this.coreGuardDamageSourceLastAt);this.coreGuardDamageSourceHysteresisState=advanceCoreGuardDamageSourceHysteresis(this.coreGuardDamageSourceHysteresisState,damageSource,delta);this.coreGuardDamageSourceLastAt=this.elapsed;damageSource=this.coreGuardDamageSourceHysteresisState.sourceClass;mixedPressure=this.coreGuardDamageSourceHysteresisState.mixedPressure;}
    if(kind==='coreHit'&&pressureVector){const delta=Math.max(0,this.elapsed-this.coreGuardPressureVectorLastAt);this.coreGuardPressureVectorHysteresisState=advanceCoreGuardPressureVectorHysteresis(this.coreGuardPressureVectorHysteresisState,pressureVector,delta,this.presentationSettings.reducedMotion);this.coreGuardPressureVectorLastAt=this.elapsed;pressureVector=this.coreGuardPressureVectorHysteresisState.vector??pressureVector;}
    this.survivalResponseVfx.push({kind,x:target.x,y:target.y,ttl:maxTtl,maxTtl,...(metadata?.mitigationRatio!==undefined?{mitigationRatio:metadata.mitigationRatio}:{}),...(damageSource?{damageSource}:{}),...(mixedPressure?{mixedPressure:true}:{}),...(pressureVector?{pressureVector:{...pressureVector}}:{})});
    if(this.survivalResponseVfx.length>12)this.survivalResponseVfx.splice(0,this.survivalResponseVfx.length-12);
  }

  private queueFinalFormWorldVfx(formId:string,state:FinalFormWorldVfxState,x:number,y:number,radius:number):void{
    const maxTtl=state==='flow'?.72:.6;
    this.finalFormWorldVfx.push({formId:formId as HeroFinalFormId,state,x,y,size:Math.max(220,Math.min(520,radius*1.55)),ttl:maxTtl,maxTtl});
    if(this.finalFormWorldVfx.length > 24)this.finalFormWorldVfx.splice(0,this.finalFormWorldVfx.length-24);
  }

  private drawFinalFormWorldVfx(ctx:CanvasRenderingContext2D):void{
    if(!this.finalFormWorldVfxAtlasReady||!this.finalFormWorldVfxAtlasImage)return;
    for(const vfx of this.finalFormWorldVfx){
      const sprite=finalFormWorldVfxSprite(vfx.formId,vfx.state);
      const t=Math.max(0,Math.min(1,vfx.ttl/vfx.maxTtl)),progress=1-t;
      const baseAlpha=vfx.state === 'flow' ? 0.92 : 0.78;
      const size=vfx.size*(.82+progress*.34);
      ctx.save();ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?.46:baseAlpha,t*baseAlpha);
      ctx.drawImage(this.finalFormWorldVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,vfx.x-size/2,vfx.y-size/2,size,size);ctx.restore();
    }
  }

  private queueFusionWorldVfx(fusionId:FusionId,origin:{x:number;y:number}):void{
    const maxTtl=.68;this.fusionWorldVfx.push({fusionId,x:origin.x,y:origin.y,ttl:maxTtl,maxTtl});
    if(this.fusionWorldVfx.length > 32)this.fusionWorldVfx.splice(0,this.fusionWorldVfx.length-32);
  }

  private drawFusionWorldVfx(ctx:CanvasRenderingContext2D):void{
    if(!this.fusionWorldVfxAtlasReady||!this.fusionWorldVfxAtlasImage)return;
    for(const vfx of this.fusionWorldVfx){
      const progress=1-Math.max(0,Math.min(1,vfx.ttl/vfx.maxTtl));
      const state = progress < 0.48 ? 'proc' : 'aftershock';
      const sprite=fusionWorldVfxSprite(vfx.fusionId,state);
      const size=148+progress*72,alpha=(1-progress)*.9;
      ctx.save();ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?.48:.9,Math.max(.12,alpha));
      ctx.drawImage(this.fusionWorldVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,vfx.x-size/2,vfx.y-size/2,size,size);ctx.restore();
    }
  }

  private queueHeroMeterWorldVfx(heroId:HeroId):void{
    const maxTtl=.66;this.heroMeterWorldVfx.push({heroId,x:this.hero.pos.x,y:this.hero.pos.y,ttl:maxTtl,maxTtl});
    if(this.heroMeterWorldVfx.length>12)this.heroMeterWorldVfx.splice(0,this.heroMeterWorldVfx.length-12);
  }

  private drawHeroMeterWorldVfx(ctx:CanvasRenderingContext2D):void{
    if(!this.heroMeterWorldVfxAtlasReady||!this.heroMeterWorldVfxAtlasImage)return;
    if(this.heroMeter.activeTimer > 0){
      const sprite=heroMeterWorldVfxSprite(this.hero.profileId,'active');
      const pulse=.5+.5*Math.sin(this.elapsed*5.2),size=112+pulse*8;
      ctx.save();ctx.globalAlpha=this.presentationSettings.reducedFlash?.24:.42;
      ctx.drawImage(this.heroMeterWorldVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,this.hero.pos.x-size/2,this.hero.pos.y-size/2,size,size);ctx.restore();
    }
    for(const vfx of this.heroMeterWorldVfx){
      const sprite=heroMeterWorldVfxSprite(vfx.heroId,'activate');
      const t=Math.max(0,Math.min(1,vfx.ttl/vfx.maxTtl)),progress=1-t,size=118+progress*54;
      ctx.save();ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?.42:.86,t*.9);
      ctx.drawImage(this.heroMeterWorldVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,vfx.x-size/2,vfx.y-size/2,size,size);ctx.restore();
    }
  }

  private drawSurvivalResponseVfx(ctx:CanvasRenderingContext2D):void{
    if(!this.survivalResponseVfxAtlasReady||!this.survivalResponseVfxAtlasImage)return;
    const worldCoreGuard=this.enemies.coreWorldGuardPresentationState();
    const coreHitCues=this.survivalResponseVfx.flatMap((cue,index)=>cue.kind==='coreHit'?[{id:index,ttl:cue.ttl,maxTtl:cue.maxTtl,pressureVector:cue.pressureVector}]:[]),coreHitStack=coreGuardMultiCueStackBudget(coreHitCues,this.presentationSettings.reducedFlash),coreHitStackAlphaByIndex=new Map(coreHitStack.entries.map(entry=>[entry.id,entry.alphaScale])),coreHitDirectional=coreGuardDirectionalStackOwnership(coreHitCues,this.presentationSettings.reducedFlash),coreHitDirectionalAlphaByIndex=new Map(coreHitDirectional.entries.map(entry=>[entry.id,entry.accentAlphaScale]));
    for(const [cueIndex,cue] of this.survivalResponseVfx.entries()){
      let arbitrationAlphaScale=1,arbitrationSizeScale=1;
      if(cue.kind==='coreGuard'){const arbitration=coreGuardSurvivalResponseArbitrationPresentation({worldGuardStrength:worldCoreGuard.strength,worldGuardOwned:cue.worldGuardOwned??false,survivalTtl:cue.ttl,survivalMaxTtl:cue.maxTtl},this.presentationSettings.reducedFlash);cue.worldGuardOwned=arbitration.worldGuardOwned;arbitrationAlphaScale=arbitration.survivalAlphaScale;if(arbitrationAlphaScale<=0)continue;}
      let sourceBody:ReturnType<typeof coreGuardDamageSourceBodyLanguagePresentation>|null=null,sourceComposition:ReturnType<typeof coreGuardMixedSourceCompositionPresentation>|null=null;
      if(cue.kind==='coreHit'){const arbitration=coreHitWorldGuardArbitrationPresentation({worldGuardStrength:worldCoreGuard.strength,mitigationRatio:cue.mitigationRatio??0,worldDamageOwned:cue.worldDamageOwned??false,hitTtl:cue.ttl,hitMaxTtl:cue.maxTtl},this.presentationSettings.reducedFlash);cue.worldDamageOwned=arbitration.worldDamageOwned;arbitrationAlphaScale=arbitration.coreHitAlphaScale;arbitrationSizeScale=arbitration.coreHitSizeScale;sourceBody=coreGuardDamageSourceBodyLanguagePresentation({source:cue.damageSource??'contact',owner:arbitration.owner,mitigationRatio:cue.mitigationRatio??0,ttl:cue.ttl,maxTtl:cue.maxTtl},this.presentationSettings.reducedFlash);sourceComposition=coreGuardMixedSourceCompositionPresentation({sourceClass:sourceBody.sourceClass,mixedPressure:cue.mixedPressure??false,owner:arbitration.owner,ttl:cue.ttl,maxTtl:cue.maxTtl},this.presentationSettings.reducedFlash);const pressureOrientation=coreGuardPressureVectorOrientationPresentation({pressureVector:cue.pressureVector});const visualLoad=coreGuardVisualLoadBudgetPresentation({coreHitAlphaScale:arbitrationAlphaScale,projectileAccentAlpha:sourceComposition.projectileAccentAlpha,contactAccentAlpha:sourceComposition.contactAccentAlpha,mitigationRatio:cue.mitigationRatio??0,mixedPressure:cue.mixedPressure??false},this.presentationSettings.reducedFlash),accentPhase=coreGuardMixedAccentPhasePresentation({ttl:cue.ttl,maxTtl:cue.maxTtl,mixedPressure:cue.mixedPressure??false},this.presentationSettings.reducedFlash);arbitrationAlphaScale*=visualLoad.coreHitAlphaScale*(coreHitStackAlphaByIndex.get(cueIndex)??1);if(sourceBody.visible){ctx.save();ctx.strokeStyle='#8fffd3';ctx.lineWidth=2.4;if(sourceComposition.projectileAccentAlpha>0){ctx.globalAlpha=sourceComposition.projectileAccentAlpha*visualLoad.accentAlphaScale*accentPhase.projectileAlphaScale*(coreHitDirectionalAlphaByIndex.get(cueIndex)??1);ctx.save();ctx.translate(cue.x,cue.y);ctx.rotate(pressureOrientation.projectileLineAngle);ctx.beginPath();ctx.moveTo(-34*accentPhase.projectileLengthScale,0);ctx.lineTo(34*accentPhase.projectileLengthScale,0);ctx.stroke();ctx.restore();}if(sourceComposition.contactAccentAlpha>0){ctx.globalAlpha=sourceComposition.contactAccentAlpha*visualLoad.accentAlphaScale*accentPhase.contactAlphaScale*(coreHitDirectionalAlphaByIndex.get(cueIndex)??1);ctx.beginPath();ctx.arc(cue.x,cue.y,31*accentPhase.contactRadiusScale,pressureOrientation.contactArcStart,pressureOrientation.contactArcEnd);ctx.stroke();}ctx.restore();}if(arbitrationAlphaScale<=0)continue;}
      const sprite=survivalResponseVfxSprite(cue.kind),t=Math.max(0,Math.min(1,cue.ttl/cue.maxTtl)),progress=1-t;
      const base=cue.kind==='coreRecover'?126:cue.kind==='coreHit'?118:cue.kind==='heroPotionBoost'?114:cue.kind.includes('Guard')?104:98,size=base*(1+progress*.18)*arbitrationSizeScale,drawW=size*(sourceComposition?.bodyScaleX??sourceBody?.bodyScaleX??1),drawH=size*(sourceComposition?.bodyScaleY??sourceBody?.bodyScaleY??1);
      ctx.save();ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?.48:.82,t*(cue.kind==='coreHit'?.78:.92))*arbitrationAlphaScale;
      ctx.drawImage(this.survivalResponseVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.x-drawW/2,cue.y-drawH/2,drawW,drawH);ctx.restore();
    }
  }

  private queueFreezeShatterVfx(type:EnemyType,x:number,y:number):void{
    const enemyClass=freezeControlVfxClassForEnemyType(type),maxTtl=enemyClass==='boss'?.62:.46;
    this.freezeShatterVfx.push({enemyClass,x,y,ttl:maxTtl,maxTtl});
    if(this.freezeShatterVfx.length>16)this.freezeShatterVfx.splice(0,this.freezeShatterVfx.length-16);
  }

  private drawFreezeShatterVfx(ctx:CanvasRenderingContext2D):void{
    if(!this.freezeControlVfxAtlasReady||!this.freezeControlVfxAtlasImage)return;
    for(const cue of this.freezeShatterVfx){const sprite=freezeControlVfxSprite(cue.enemyClass,'shatter'),t=Math.max(0,Math.min(1,cue.ttl/cue.maxTtl)),progress=1-t,base=cue.enemyClass==='boss'?164:cue.enemyClass==='elite'?126:cue.enemyClass==='specialist'?104:88,size=base*(1+progress*.28);ctx.save();ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?.5:.84,t*.92);ctx.drawImage(this.freezeControlVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.x-size/2,cue.y-size/2,size,size);ctx.restore();}
  }

  private queueHeroResponseVfx(kind:HeroResponseVfxKind,_intensity=1):void{const maxTtl=kind==='hit'?.32:kind==='perfectEvade'?.48:.42;if(kind==='hit'){this.heroRenderHitRecoil=Math.max(this.heroRenderHitRecoil,Math.max(0,Math.min(1.25,_intensity)));this.heroCrisisGroundSettleState=advanceHeroCrisisGroundSettleState(this.heroCrisisGroundSettleState,_intensity,0,this.presentationSettings.reducedMotion);this.heroActionTransitionState=advanceHeroActionTransitionState(this.heroActionTransitionState,'hit',0,this.presentationSettings.reducedMotion);}else if(kind==='perfectEvade')this.heroActionTransitionState=advanceHeroActionTransitionState(this.heroActionTransitionState,'evade',0,this.presentationSettings.reducedMotion);this.heroResponseVfx.push({kind,x:this.hero.pos.x,y:this.hero.pos.y,ttl:maxTtl,maxTtl});if(this.heroResponseVfx.length>10)this.heroResponseVfx.splice(0,this.heroResponseVfx.length-10);}

  private drawHeroResponseVfx(ctx:CanvasRenderingContext2D):void{if(!this.heroResponseVfxAtlasReady||!this.heroResponseVfxAtlasImage)return;for(const cue of this.heroResponseVfx){const sprite=heroResponseVfxSprite(this.hero.profileId,cue.kind);const t=Math.max(0,Math.min(1,cue.ttl/cue.maxTtl)),progress=1-t,size=(cue.kind==='perfectEvade'?118:92)*(1+progress*.22);ctx.save();ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?.5:.86,t*(cue.kind==='hit'?.72:.92));ctx.drawImage(this.heroResponseVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.x-size/2,cue.y-size/2,size,size);ctx.restore();}}

  private queueBossWeakpointBreakWorldVfx(kind:BossWeakpointWorldVfxKind,x:number,y:number):void{const maxTtl=.62;this.bossWeakpointBreakWorldVfx.push({kind,x,y,ttl:maxTtl,maxTtl});if(this.bossWeakpointBreakWorldVfx.length>8)this.bossWeakpointBreakWorldVfx.splice(0,this.bossWeakpointBreakWorldVfx.length-8);}

  private drawBossWeakpointBreakWorldVfx(ctx:CanvasRenderingContext2D):void{if(!this.bossWeakpointWorldVfxAtlasReady||!this.bossWeakpointWorldVfxAtlasImage)return;for(const cue of this.bossWeakpointBreakWorldVfx){const sprite=bossWeakpointWorldVfxSprite(cue.kind,'break'),t=Math.max(0,Math.min(1,cue.ttl/cue.maxTtl)),size=108+(1-t)*48;ctx.save();ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?.48:.82,t*.9);ctx.drawImage(this.bossWeakpointWorldVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.x-size/2,cue.y-size/2,size,size);ctx.restore();}}

  private drawHero(ctx: CanvasRenderingContext2D, motion:ResidualCombatMotionPolicy): void {
    const profile = heroProfile(this.hero.profileId);
    const { x, y } = this.hero.pos;
    const finalForm = this.currentHeroFinalForm();
    const heroMeterPulse = this.heroMeter.activeTimer > 0 ? 1 : this.heroMeter.charge;
    const movementBlend = this.presentationSettings.reducedMotion ? 0 : this.heroRenderMotionBlend;
    const castCadence = heroCastCadencePresentation(this.heroCastCadenceState, this.heroCastRenderCast, this.heroCastRenderRecover, this.heroRenderKinematicState.speed, this.presentationSettings.reducedMotion);
    const actionTransition = heroActionTransitionPresentation(this.heroActionTransitionState, this.hero.facing.x, this.hero.facing.y, this.heroRenderKinematicState.speed, this.presentationSettings.reducedMotion);
    const ultimateAim = heroUltimateAimContinuityPresentation(this.heroUltimateAimContinuityState, this.hero.facing.x, this.hero.facing.y, this.heroUltimateBodyState.kind!==null, this.heroUltimateBodyState.elapsed, this.presentationSettings.reducedMotion);
    const ultimateBody = heroUltimateBodyPresentation(this.heroUltimateBodyState, ultimateAim.facingX, ultimateAim.facingY, this.presentationSettings.reducedMotion);
    const ultimateHandoff = heroUltimateActionHandoffPresentation(this.heroUltimateBodyState, this.heroUltimateActionHandoffState, this.heroRenderKinematicState.speed, this.presentationSettings.reducedMotion);
    const baseUltimatePoseScale = ultimateHandoff.ultimatePoseScale;
    const rawCastBlend = Math.max(castCadence.castBlend, actionTransition.castContinuity * 0.22, ultimateBody.windup * 0.28 * baseUltimatePoseScale, ultimateBody.release * 0.38 * baseUltimatePoseScale);
    const baseHitRecoil = characterHitRecoilPresentation(this.heroRenderHitRecoil, this.hero.facing.x, this.hero.facing.y, 1, this.presentationSettings.reducedMotion);
    const motionBudget = heroMotionBudgetPresentation({ movement:movementBlend, cast:rawCastBlend, ultimate:Math.max(ultimateBody.windup,ultimateBody.release,ultimateBody.recovery)*baseUltimatePoseScale, hit:baseHitRecoil.intensity, evade:actionTransition.evadeContinuity }, this.presentationSettings.reducedMotion);
    const renderMovementBlend = movementBlend * motionBudget.movementScale;
    const castBlend = rawCastBlend * motionBudget.castScale;
    const ultimatePoseScale = baseUltimatePoseScale * motionBudget.ultimateScale;
    const transitionScale = motionBudget.transitionScale;
    const ultimateScaleX = 1 + (ultimateBody.scaleX - 1) * ultimatePoseScale;
    const ultimateScaleY = 1 + (ultimateBody.scaleY - 1) * ultimatePoseScale;
    const recoveryBlend = castCadence.recoverBlend * (1 - actionTransition.recoverSuppression * transitionScale) * (1 - ultimateBody.castRecoverySuppression * ultimateHandoff.castRecoverySuppressionScale * motionBudget.ultimateScale);
    const kinematicPresentation = heroKinematicRenderPresentation(this.heroRenderKinematicState, this.presentationSettings.reducedMotion, castBlend);
    const castAimHold = heroCastAimHoldPresentation(this.heroCastAimHoldState, this.hero.facing.x, this.hero.facing.y, castBlend, recoveryBlend, this.presentationSettings.reducedMotion);
    const desiredBodyFacing = heroBodyFacingOwnerPresentation({ currentFacing:this.hero.facing, cast:castAimHold, ultimate:ultimateAim }, this.presentationSettings.reducedMotion);
    const heroBodyFacingHysteresisDt=this.heroBodyFacingHysteresisLastAt<0?0:Math.max(0,this.elapsed-this.heroBodyFacingHysteresisLastAt);
    this.heroBodyFacingHysteresisState=advanceHeroBodyFacingHysteresisState(this.heroBodyFacingHysteresisState,desiredBodyFacing,heroBodyFacingHysteresisDt,this.presentationSettings.reducedMotion);this.heroBodyFacingHysteresisLastAt=this.elapsed;
    const bodyFacing=heroBodyFacingHysteresisPresentation(this.heroBodyFacingHysteresisState);
    const castOrientation = heroCastOrientationPresentation({ facingX:castAimHold.facingX, facingY:castAimHold.facingY, speed:this.heroRenderKinematicState.speed, turn:this.heroRenderKinematicState.turn, cast:castBlend, recover:recoveryBlend }, this.presentationSettings.reducedMotion);
    const { accelerationLean, turnAnticipation, decelerationSettle, castFocus } = kinematicPresentation;
    const hitRecoilScale = actionTransition.hitRecoilScale * motionBudget.hitScale;
    const hitRecoil = { ...baseHitRecoil, intensity:baseHitRecoil.intensity*motionBudget.hitScale, offsetX:baseHitRecoil.offsetX*hitRecoilScale, offsetY:baseHitRecoil.offsetY*hitRecoilScale, rotation:baseHitRecoil.rotation*hitRecoilScale, flashAlpha:baseHitRecoil.flashAlpha*(0.72+hitRecoilScale*0.28) };
    const groundContact = characterGroundContactPresentation(this.hero.radius, renderMovementBlend, hitRecoil.intensity, this.hero.facing.x, this.presentationSettings.reducedMotion, 1);
    const facingAngle = bodyFacing.bodyAngle;
    const movementFacingAngle = Math.atan2(this.hero.facing.y, this.hero.facing.x);
    const directionalOverlay=heroDirectionalOverlayOwnerPresentation({owner:bodyFacing.owner,bodyAngle:facingAngle,movementAngle:movementFacingAngle,castAngle:castOrientation.overlayAngle,actionRetention:bodyFacing.owner==='movement'?0:Math.max(desiredBodyFacing.actionRetention,Math.min(1,bodyFacing.hold/.12)),movementBlend:renderMovementBlend,castBlend},this.presentationSettings.reducedMotion);
    const heroActionPose=heroActionPoseEmphasisPresentation({owner:bodyFacing.owner,cast:castBlend,recovery:Math.max(recoveryBlend,this.heroRenderRecoveryBlend),ultimateWindup:ultimateBody.windup*ultimatePoseScale,ultimateRelease:ultimateBody.release*ultimatePoseScale,ultimateRecovery:ultimateBody.recovery*ultimatePoseScale,hit:hitRecoil.intensity,facingX:bodyFacing.facingX,facingY:bodyFacing.facingY},this.presentationSettings.reducedMotion);
    const heroActionPoseHandoff=heroActionPoseHandoffPresentation({owner:bodyFacing.owner,cast:castBlend,recovery:Math.max(recoveryBlend,this.heroRenderRecoveryBlend),ultimateWindup:ultimateBody.windup*ultimatePoseScale,ultimateRelease:ultimateBody.release*ultimatePoseScale,ultimateRecovery:ultimateBody.recovery*ultimatePoseScale,hit:hitRecoil.intensity,releaseAccent:heroActionPose.releaseAccentScale},this.presentationSettings.reducedMotion);
    const heroActionLayerBudget=heroActionLayerBudgetPresentation({owner:heroActionPoseHandoff.owner,movement:renderMovementBlend,cast:castBlend,recovery:Math.max(recoveryBlend,this.heroRenderRecoveryBlend),ultimate:Math.max(ultimateBody.windup,ultimateBody.release,ultimateBody.recovery)*ultimatePoseScale,hit:hitRecoil.intensity,meter:heroMeterPulse},this.presentationSettings.reducedMotion);
    const bobOffset = Math.sin(this.heroRenderStride) * (0.8 + renderMovementBlend * 1.8);
    const lift = renderMovementBlend * 2.4 + (heroMeterPulse > 0.92 ? 0.9 : 0) + castBlend * 2.2 + heroActionPose.lift*heroActionPoseHandoff.actionPoseScale + heroActionPoseHandoff.releaseCarry*.7;
    const cadenceBodyScale = 1 + (castCadence.bodyScale - 1) * motionBudget.castScale;
    const transitionScaleX = 1 + (actionTransition.scaleX - 1) * transitionScale;
    const transitionScaleY = 1 + (actionTransition.scaleY - 1) * transitionScale;
    const bodyScaleX = (1 + renderMovementBlend * 0.04 + castBlend * 0.02) * kinematicPresentation.scaleX * cadenceBodyScale * transitionScaleX * ultimateScaleX * (1+(heroActionPose.scaleX-1)*heroActionPoseHandoff.actionPoseScale);
    const bodyScaleY = (1 - renderMovementBlend * 0.03 - castBlend * 0.015 + recoveryBlend * 0.02) * kinematicPresentation.scaleY * transitionScaleY * ultimateScaleY * (1+(heroActionPose.scaleY-1)*heroActionPoseHandoff.actionPoseScale) / Math.max(1, cadenceBodyScale * 0.995);
    const movementLeadX = this.hero.facing.x * (renderMovementBlend * 3.8 + castBlend * 4.4 + castCadence.chainLead * motionBudget.castScale) + this.hero.facing.y * this.heroRenderTurnTilt * 2.8 * motionBudget.movementScale + kinematicPresentation.leadX + castOrientation.leadX * castBlend * 0.38 + hitRecoil.offsetX + actionTransition.offsetX * transitionScale + ultimateBody.offsetX * ultimatePoseScale + bodyFacing.facingX*heroActionPose.forwardLead*heroActionPoseHandoff.actionPoseScale;
    const movementLeadY = this.hero.facing.y * (renderMovementBlend * 2.6 + castBlend * 2.2) - this.heroRenderRecoveryBlend * 1.8 * motionBudget.movementScale + recoveryBlend * 1.4 + kinematicPresentation.leadY + castOrientation.leadY * castBlend * 0.32 + hitRecoil.offsetY + actionTransition.offsetY * transitionScale + ultimateBody.offsetY * ultimatePoseScale + bodyFacing.facingY*heroActionPose.forwardLead*heroActionPoseHandoff.actionPoseScale;
    const bodyRotation = this.heroRenderTurnTilt * 0.18 * motionBudget.movementScale + castBlend * 0.11 - (this.heroRenderRecoveryBlend * motionBudget.movementScale + recoveryBlend) * 0.05 + kinematicPresentation.rotation + castOrientation.bodyRotation + hitRecoil.rotation + actionTransition.rotation * transitionScale + ultimateBody.rotation * ultimatePoseScale + heroActionPose.rotation*heroActionPoseHandoff.actionPoseScale;
    this.heroLastRenderedBodyOffset = { x:movementLeadX, y:movementLeadY - bobOffset - lift };
    this.heroLastRenderedActionFacing = { x:bodyFacing.facingX, y:bodyFacing.facingY };
    this.heroLastRenderedActionPoseStrength = heroActionPose.poseStrength * heroActionPoseHandoff.actionPoseScale;
    this.heroLastRenderedActionOwner = heroActionPoseHandoff.owner==='ultimate'?'ultimate':heroActionPoseHandoff.owner==='cast'?'cast':heroActionPoseHandoff.owner==='recovery'?'recovery':'movement';
    const heroActionGroundOffsetX=this.hero.facing.x*(castBlend*4.4+castCadence.chainLead*motionBudget.castScale)+castOrientation.leadX*castBlend*.38+actionTransition.offsetX*transitionScale+ultimateBody.offsetX*ultimatePoseScale;
    const heroActionGroundOffsetY=this.hero.facing.y*(castBlend*2.2)+recoveryBlend*1.4+castOrientation.leadY*castBlend*.32+actionTransition.offsetY*transitionScale+ultimateBody.offsetY*ultimatePoseScale;
    const heroGroundOwnership=heroGroundContactOwnershipPresentation({movement:renderMovementBlend,cast:castBlend,evade:actionTransition.evadeContinuity*transitionScale,ultimate:Math.max(ultimateBody.windup,ultimateBody.release,ultimateBody.recovery)*ultimatePoseScale,actionOffsetX:heroActionGroundOffsetX,actionOffsetY:heroActionGroundOffsetY,lift:Math.max(0,castBlend*2.2-Math.min(0,ultimateBody.offsetY*ultimatePoseScale))},this.presentationSettings.reducedMotion);
    const heroHitGroundHandoff=heroHitGroundHandoffPresentation({hit:hitRecoil.intensity,hitOffsetX:hitRecoil.offsetX,hitOffsetY:hitRecoil.offsetY,movement:renderMovementBlend,cast:castBlend,evade:actionTransition.evadeContinuity*transitionScale,ultimate:Math.max(ultimateBody.windup,ultimateBody.release,ultimateBody.recovery)*ultimatePoseScale},this.presentationSettings.reducedMotion);
    const heroCrisisGroundSettle=heroCrisisGroundSettlePresentation(this.heroCrisisGroundSettleState,renderMovementBlend,this.presentationSettings.reducedMotion);
    void accelerationLean; void turnAnticipation; void decelerationSettle; void castFocus;

    ctx.save();
    ctx.translate(x, y);

    const idlePresentation = heroMotionRenderPresentation('idle', this.hero.radius, this.heroMotionRenderAtlasReady, Math.max(heroMeterPulse * 0.55, finalForm ? 0.72 : 0.18));
    const movePresentation = heroMotionRenderPresentation('move', this.hero.radius, this.heroMotionRenderAtlasReady, renderMovementBlend);
    const crestPresentation = heroMotionRenderPresentation('crest', this.hero.radius, this.heroMotionRenderAtlasReady, Math.max(heroMeterPulse, finalForm ? 0.85 : renderMovementBlend * 0.55));
    const castPresentation = heroCastRenderPresentation('cast', this.hero.radius, this.heroCastRenderAtlasReady, castBlend);
    const recoverPresentation = heroCastRenderPresentation('recover', this.hero.radius, this.heroCastRenderAtlasReady, Math.max(recoveryBlend, this.heroRenderRecoveryBlend));

    ctx.save();
    const heroCrisisGroundScale=heroHitGroundHandoff.owner==='hit'?1:Math.min(heroCrisisGroundSettle.groundMotionScale,heroCrisisGroundSettle.movementRestartScale);
    const heroGroundMotionScale=heroGroundOwnership.locomotionGroundScale*heroHitGroundHandoff.groundMotionScale*heroCrisisGroundScale;
    ctx.translate(groundContact.offsetX*heroGroundMotionScale+heroGroundOwnership.shadowOffsetX+heroHitGroundHandoff.shadowOffsetX*heroCrisisGroundSettle.shadowFollowScale, groundContact.offsetY*heroGroundMotionScale+heroGroundOwnership.shadowOffsetY+heroHitGroundHandoff.shadowOffsetY*heroCrisisGroundSettle.shadowFollowScale - (this.hero.radius + 11));
    ctx.fillStyle = `rgba(8,12,18,${groundContact.alpha*heroGroundOwnership.alphaScale*heroHitGroundHandoff.alphaScale*heroCrisisGroundSettle.alphaScale})`;
    ctx.beginPath();
    ctx.ellipse(0, this.hero.radius + 11, groundContact.width*heroGroundOwnership.widthScale*heroHitGroundHandoff.widthScale*heroCrisisGroundSettle.widthScale, groundContact.height*heroGroundOwnership.heightScale*heroHitGroundHandoff.heightScale*heroCrisisGroundSettle.heightScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (idlePresentation.visible && this.heroMotionRenderAtlasImage) {
      const idleSprite = heroMotionRenderSprite(this.hero.profileId, 'idle');
      ctx.save();
      ctx.globalAlpha = Math.min(this.presentationSettings.reducedFlash ? 0.18 : 0.36, idlePresentation.alpha * (finalForm ? 1.14 : 1)*heroActionLayerBudget.idleScale);
      ctx.drawImage(this.heroMotionRenderAtlasImage, idleSprite.sx, idleSprite.sy, idleSprite.sw, idleSprite.sh, -idlePresentation.size / 2, -idlePresentation.size / 2 + 2, idlePresentation.size, idlePresentation.size);
      ctx.restore();
    }

    if (castPresentation.visible && this.heroCastRenderAtlasImage && castBlend > 0.04) {
      const castSprite = heroCastRenderSprite(this.hero.profileId, 'cast');
      const castLead = castPresentation.focusOffset;
      ctx.save();
      ctx.rotate(directionalOverlay.castAngle);
      ctx.globalAlpha = Math.min(this.presentationSettings.reducedFlash ? 0.24 : 0.68, castPresentation.alpha * castBlend + castCadence.overlayAlphaBoost)*directionalOverlay.castAlphaScale*heroActionPose.castOverlayAlphaScale*heroActionPoseHandoff.castOverlayScale*heroActionLayerBudget.castScale;
      ctx.drawImage(this.heroCastRenderAtlasImage, castSprite.sx, castSprite.sy, castSprite.sw, castSprite.sh, -castPresentation.size / 2 + castLead * 0.12, -castPresentation.size / 2 - castLead * 0.16, castPresentation.size, castPresentation.size);
      ctx.restore();
    }

    if (finalForm && this.finalFormFlow.streak > 0) {
      const mobility = finalFormMobilityProfile(finalForm.id);
      const flowVfx = flowFeedbackProfile(this.finalFormFlow.streak, mobility.family, this.endlessState.frameGovernor.tier);
      ctx.save();
      ctx.globalAlpha = flowVfx.auraAlpha;
      ctx.strokeStyle = profile.color;
      ctx.lineWidth = flowVfx.lineWidth;
      ctx.beginPath();
      ctx.arc(0, 0, flowVfx.auraRadius + Math.sin(this.elapsed * 8) * motion.finalFormFlowMotionAmplitude * 50, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < flowVfx.trailSegments; i++) {
        const t = (i + 1) / flowVfx.trailSegments;
        const a = facingAngle + Math.PI + (i % 2 === 0 ? .15 : -.15);
        ctx.globalAlpha = flowVfx.auraAlpha * (1 - t * .72);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12);
        ctx.lineTo(Math.cos(a) * (12 + flowVfx.trailLength * t), Math.sin(a) * (12 + flowVfx.trailLength * t));
        ctx.stroke();
      }
      ctx.restore();
    }

    if (movePresentation.visible && this.heroMotionRenderAtlasImage && movementBlend > 0.08) {
      const moveSprite = heroMotionRenderSprite(this.hero.profileId, 'move');
      const moveOffset = movePresentation.motionAmplitude * movementBlend;
      ctx.save();
      ctx.rotate(directionalOverlay.movementAngle);
      ctx.globalAlpha = Math.min(this.presentationSettings.reducedFlash ? 0.18 : 0.40, movePresentation.alpha * movementBlend)*directionalOverlay.movementAlphaScale*heroActionLayerBudget.movementScale;
      ctx.drawImage(this.heroMotionRenderAtlasImage, moveSprite.sx, moveSprite.sy, moveSprite.sw, moveSprite.sh, -movePresentation.size / 2 - moveOffset * 0.3, -movePresentation.size / 2 + 4, movePresentation.size, movePresentation.size);
      ctx.restore();
    }

    if (this.elapsed * 1000 < this.arenaEvadeBoostUntilMs && this.heroResponseVfxAtlasReady && this.heroResponseVfxAtlasImage) {
      const sprite = heroResponseVfxSprite(this.hero.profileId,'flowBoost');
      const size = Math.max(88, this.hero.radius * 4.2);
      ctx.save();
      ctx.globalAlpha = this.presentationSettings.reducedFlash ? .28 : .46;
      ctx.drawImage(this.heroResponseVfxAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    const spritePresentation = heroBattleSpritePresentation(this.hero.profileId, this.hero.radius, this.heroBattleSpriteAtlasReady);
    ctx.save();
    ctx.translate(movementLeadX, movementLeadY - bobOffset - lift);
    ctx.rotate(bodyRotation);
    ctx.scale(bodyScaleX, bodyScaleY);
    ctx.shadowColor = profile.color;
    ctx.shadowBlur = 24 + movementBlend * 8 + castBlend * 10;
    ctx.fillStyle = profile.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.hero.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#f5f7ff';
    ctx.lineWidth = 4;
    ctx.stroke();
    if (spritePresentation.visible && this.heroBattleSpriteAtlasImage) {
      const sprite = heroBattleSpriteRect(this.hero.profileId);
      const size = spritePresentation.drawSize;
      ctx.save();
      ctx.scale(bodyFacing.mirrorX,1);
      ctx.globalAlpha = 0.99;
      ctx.drawImage(this.heroBattleSpriteAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -size / 2, -size / 2, size, size);
      ctx.restore();
    }
    ctx.restore();

    if (hitRecoil.flashAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = hitRecoil.flashAlpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(movementLeadX, movementLeadY - bobOffset - lift, this.hero.radius * 0.74, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (recoverPresentation.visible && this.heroCastRenderAtlasImage && (recoveryBlend > 0.04 || this.heroRenderRecoveryBlend > 0.04)) {
      const recoverSprite = heroCastRenderSprite(this.hero.profileId, 'recover');
      ctx.save();
      ctx.rotate(castOrientation.overlayAngle - castOrientation.bodyRotation * 0.35);
      ctx.globalAlpha = Math.min(this.presentationSettings.reducedFlash ? 0.18 : 0.42, recoverPresentation.alpha * Math.max(recoveryBlend, this.heroRenderRecoveryBlend * 0.75))*heroActionPose.recoverOverlayAlphaScale*heroActionPoseHandoff.recoverOverlayScale*heroActionLayerBudget.recoveryScale;
      ctx.drawImage(this.heroCastRenderAtlasImage, recoverSprite.sx, recoverSprite.sy, recoverSprite.sw, recoverSprite.sh, -recoverPresentation.size / 2 - recoverPresentation.focusOffset * 0.1, -recoverPresentation.size / 2 + recoverPresentation.focusOffset * 0.05, recoverPresentation.size, recoverPresentation.size);
      ctx.restore();
    }

    if (crestPresentation.visible && this.heroMotionRenderAtlasImage) {
      const crestSprite = heroMotionRenderSprite(this.hero.profileId, 'crest');
      const crestPulse = 1 + Math.sin(this.elapsed * 4.8) * (this.presentationSettings.reducedMotion ? 0.02 : 0.045);
      const crestSize = crestPresentation.size * crestPulse;
      ctx.save();
      ctx.globalAlpha = Math.min(this.presentationSettings.reducedFlash ? 0.16 : 0.34, crestPresentation.alpha * (finalForm ? 1.05 : 0.9)*heroActionLayerBudget.crestScale);
      ctx.drawImage(this.heroMotionRenderAtlasImage, crestSprite.sx, crestSprite.sy, crestSprite.sw, crestSprite.sh, -crestSize / 2, -crestSize / 2 + 1, crestSize, crestSize);
      ctx.restore();
    }

    ctx.strokeStyle = '#f5d47e';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.hero.facing.x * (34 + movementBlend * 5), this.hero.facing.y * (34 + movementBlend * 5));
    ctx.stroke();
    ctx.restore();
  }

  private drawHud(ctx: CanvasRenderingContext2D): void {
    const profile = heroProfile(this.hero.profileId);
    const viewportRect = this.canvas.getBoundingClientRect();
    const safeArea = landscapeSafeAreaProfile(viewportRect.width || LOGICAL_WIDTH, viewportRect.height || LOGICAL_HEIGHT);
    const statusPanel = safeArea.statusPanel;
    const hudBoss = this.enemies.enemies.find((enemy) => enemy.alive && enemy.type === 'boss');
    const comfort = longRunComfortPolicy(this.elapsed);
    const focus = longRunHudFocusPolicy(this.elapsed, Boolean(hudBoss), Boolean(hudBoss?.isMythic));
    const openingFocus = openingHudFocusPolicy(this.elapsed);
    const completedFocus = completedBuildHudFocus({elapsedSeconds:this.elapsed,equipment:this.equipmentState,activeRelic:this.activeRelic,activeFusionCount:this.fusionRuntime.equipped.length});
    const deepFocus = deepRunHudFocus({elapsedSeconds:this.elapsed,equipment:this.equipmentState,activeRelic:this.activeRelic,activeFusionCount:this.fusionRuntime.equipped.length});
    const ultraHudFocus = fourHourHudFocus({elapsedSeconds:this.elapsed,equipment:this.equipmentState,activeRelic:this.activeRelic,activeFusionCount:this.fusionRuntime.equipped.length,bossActive:Boolean(hudBoss),mythicActive:Boolean(hudBoss?.isMythic)});
    const deepComplete=(this.equipmentState.weapon?.rank??0)>=5&&(this.equipmentState.armor?.rank??0)>=5&&Boolean(this.activeRelic)&&this.fusionRuntime.equipped.length>=2;
    const deepestHudFocus=eightTwelveHourHudFocus({elapsedSeconds:this.elapsed,completeBuild:deepComplete,bossActive:Boolean(hudBoss),mythicActive:Boolean(hudBoss?.isMythic),finalFormActive:Boolean(this.currentHeroFinalForm()),heroCritical:this.dangerState.heroCritical,coreCritical:this.dangerState.coreCritical});
    const density = foldableDensityPolicy(safeArea, {
      bossActive:Boolean(hudBoss),
      mythicActive:Boolean(hudBoss?.isMythic),
      longRunTier:comfort.tier,
      maxBuildLabels:comfort.maxBuildLabels,
    });
    ctx.save();
    ctx.fillStyle = 'rgba(4,8,15,.82)'; ctx.fillRect(18, 16, 440, 94);
    ctx.strokeStyle = 'rgba(177,220,255,.24)'; ctx.lineWidth = 2; ctx.strokeRect(18, 16, 440, 94);
    this.drawBar(ctx, 92, 32, 330, 20, this.hero.hp / this.hero.maxHp, '#ef4965', '#39101a');
    this.drawBar(ctx, 92, 64, 330, 14, this.hero.xp / Math.max(1, this.hero.xpNext), '#52b7ff', '#10283b');
    ctx.fillStyle = profile.color; ctx.font = '800 15px system-ui'; ctx.fillText(profile.name, 34, 28);
    ctx.fillStyle = '#fff'; ctx.font = '700 22px system-ui'; ctx.fillText(`LV ${this.hero.level}`, 34, 55);
    ctx.font = '600 16px system-ui'; ctx.fillStyle = '#d8e7f3'; ctx.fillText(`HP ${Math.ceil(this.hero.hp)} / ${this.hero.maxHp}`, 98, 49);
    if (density.showXpNumbers && focus.showXpNumbers && ultraHudFocus.showXpNumbers) { ctx.fillStyle = '#9bd7ff'; ctx.fillText(`EXP ${Math.floor(this.hero.xp)} / ${this.hero.xpNext}`, 98, 91); }
    const meterLabel = heroMeterLabel(this.hero.profileId);
    ctx.fillStyle = 'rgba(4,8,15,.72)'; ctx.fillRect(18, 114, 440, this.hero.profileId === 'kain' ? 48 : 28);
    const meterRatio = this.heroMeter.activeTimer > 0 ? 1 : this.heroMeter.charge;
    this.drawHeroMeterIdentityHud(ctx, 101, 116, 22);
    this.drawBar(ctx, 132, 122, 290, 10, meterRatio, meterLabel.color, '#211b35');
    ctx.fillStyle = meterLabel.color; ctx.font = '800 12px system-ui';
    if (density.showMeterText && ((focus.showMeterText && ultraHudFocus.showMeterText) || this.heroMeter.activeTimer > 0)) ctx.fillText(this.heroMeter.activeTimer > 0 ? `${meterLabel.activeName} ${this.heroMeter.activeTimer.toFixed(1)}s` : `${meterLabel.name} ${Math.round(this.heroMeter.charge * 100)}%`, 34, 134);
    if (this.hero.profileId === 'kain') {
      this.drawBar(ctx, 132, 145, 290, 7, this.kainOverload, '#a88cff', '#211b35');
      if (density.showMeterText && focus.showMeterText && ultraHudFocus.showMeterText) { ctx.fillStyle = '#cbbdff'; ctx.font = '700 10px system-ui'; ctx.fillText(`과부하 ${Math.round(this.kainOverload * 100)}%`, 34, 153); }
    }

    ctx.fillStyle = 'rgba(4,8,15,.78)'; ctx.fillRect(safeArea.statusPanel.x, safeArea.statusPanel.y, safeArea.statusPanel.width, safeArea.statusPanel.height);
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = `${safeArea.aspectClass === 'foldable' ? 22 : 29}px system-ui`; ctx.fillText(this.formatTime(this.elapsed), safeArea.headerCenterX, 47);
    ctx.font = `600 ${safeArea.aspectClass === 'foldable' ? 14 : 17}px system-ui`; ctx.fillStyle = '#f7cd76';
    const statusLine = compactLandscapeStatusLine({
      mapName:this.terrain.currentLayout.name,
      threatLevel:this.runThreatLevel,
      threatName:threatLevelName(this.runThreatLevel),
      danger:dangerTierForSeconds(this.elapsed),
      disasterName:this.catastrophe?.name,
      kills:this.hero.kills,
      coins:this.hero.coins,
    }, Math.min(density.statusMaxChars, focus.statusMaxChars, ultraHudFocus.statusMaxChars, deepestHudFocus.statusMaxChars));
    ctx.fillText(statusLine, safeArea.headerCenterX, 72);
    this.drawBattlefieldIdentityHud(ctx, this.terrain.currentLayout.id, this.terrain.evolutionStage, safeArea.statusPanel.x + 10, safeArea.statusPanel.y + 10, 34, 19);
    this.drawBattlefieldMechanicRecall(ctx, this.terrain.currentLayout.id, this.terrain.evolutionStage, safeArea.statusPanel.x + 10, safeArea.statusPanel.y + 10, 34, 19);
    const showWorldEvolutionLabel=safeArea.aspectClass!=='foldable'&&comfort.tier<2&&!hudBoss;
    this.drawWorldEvolutionRecall(ctx,this.endlessState.world.current,safeArea.statusPanel.x+52,safeArea.statusPanel.y+9,22,showWorldEvolutionLabel);
    this.drawAscensionTierForecast(ctx,this.elapsed*1000,statusPanel.x + statusPanel.width - 128,statusPanel.y+9);
    if(safeArea.aspectClass!=='foldable')this.drawCatastropheTransitionForecast(ctx,this.elapsed,safeArea.statusPanel.x+safeArea.statusPanel.width-218,safeArea.statusPanel.y+9);
    this.drawCatastropheStatusIcon(ctx, safeArea.statusPanel.x + safeArea.statusPanel.width - 38, safeArea.statusPanel.y + 10, 28);
    const synergyNames = synergyHudNames({
      heroId: this.hero.profileId,
      traitId: this.selectedTrait,
      relicId: this.activeRelic,
      equipment: this.equipmentState,
    }, 2);
    const baseBuildLabels = compactPhase22BuildLabels({
      masteryLevel: this.masteryProfile.heroes[this.hero.profileId].level,
      relicName: this.activeRelic ? relicDisplayName(this.activeRelic) : null,
      synergies: synergyNames,
      fusionNames: this.fusionRuntime.equipped.map((id) => fusionDefinition(id).name),
      fateSummary: this.fateRuntime.choices.length > 0 ? fateHudSummary(this.fateRuntime.choices) : '',
    });
    const finalForm = this.currentHeroFinalForm();
    const fourEightComplete=(this.equipmentState.weapon?.rank??0)>=5&&(this.equipmentState.armor?.rank??0)>=5&&Boolean(this.activeRelic)&&this.fusionRuntime.equipped.length>=2;
    const fourEightPriority=fourEightHourPriorityFocus({elapsedSeconds:this.elapsed,completeBuild:fourEightComplete,bossActive:Boolean(hudBoss),mythicActive:Boolean(hudBoss?.isMythic),finalFormActive:Boolean(finalForm),heroCritical:this.dangerState.heroCritical,coreCritical:this.dangerState.coreCritical});
    const eightTwelvePriority=deepestHudFocus;
    const signature = finalFormSignatureModifiers(this.endlessState.signature,finalForm,this.elapsed*1000);
    const signatureLabel = signature.active && finalForm ? `SIGNATURE · ${finalFormSignatureProfile(finalForm).name}` : '';
    const contractLabel = contractHudLine(this.endlessState.contracts);
    const oathLabel = oathHudLine(this.endlessState.oaths,this.elapsed*1000);
    const deepRunIdentityFocus = deepRunDecisionAttention({
      bossActive:Boolean(hudBoss),mythicActive:Boolean(hudBoss?.isMythic),heroCritical:this.dangerState.heroCritical,coreCritical:this.dangerState.coreCritical,
      activeContract:Boolean(this.endlessState.contracts.active),activeOath:Boolean(this.endlessState.oaths.active),ascensionCount:this.endlessState.heroAscension.selected.length,
    });
    const archetype = this.currentBuildArchetype();
    const overdrive = this.currentOverdriveModifiers();
    const replayGuide = this.currentReplayPlan ? this.currentReplayGuidance() : null;
    const flow = finalFormFlowModifiers(this.finalFormFlow, finalForm?.id ?? null, this.elapsed * 1000);
    const recoveryGuide = !hudBoss ? buildRecoveryGuidance({ heroId:this.hero.profileId, elapsedSeconds:this.elapsed, spellLevels:this.spells.levels, activeRelic:this.activeRelic, activeFusions:this.fusionRuntime.equipped, equipment:this.equipmentState }) : null;
    const rawBuildLabels = [
      ...(replayGuide ? [`REPLAY ${replayGuide.progress}% · ${replayGuide.label}`] : []),
      ...(deepRunIdentityFocus.showContractProgress && contractLabel ? [contractLabel] : []),
      ...(deepRunIdentityFocus.showOathProgress && oathLabel ? [oathLabel] : []),
      ...(signatureLabel ? [signatureLabel] : []),
      ...(this.finalFormFlow.streak >= 2 && flow.damageMultiplier > 1 ? [`FLOW ×${this.finalFormFlow.streak}`] : []),
      ...(overdrive.active ? [`OVERDRIVE · ${this.endlessArchetypeName(archetype)}`] : []),
      ...(finalForm ? [`최종형 · ${finalForm.name}`] : []),
      ...(recoveryGuide ? [recoveryGuide.label] : []),
      ...baseBuildLabels,
    ];
    const baseBuildLabelCap=Math.min(density.maxBuildLabels,focus.maxBuildLabels,openingFocus.maxBuildLabels,completedFocus.maxBuildLabels,deepFocus.maxBuildLabels,ultraHudFocus.maxBuildLabels);
    const requestedBuildLabelCap=eightTwelvePriority.active?Math.max(eightTwelvePriority.routineBuildLabelCap,eightTwelvePriority.preserveFinalForm?1:0):fourEightPriority.active?Math.max(fourEightPriority.routineBuildLabelCap,fourEightPriority.preserveFinalForm?1:0):baseBuildLabelCap;
    const prioritizedBuildLabels = prioritizeLandscapeBuildLabels(rawBuildLabels, {
      bossActive:Boolean(hudBoss), mythicActive:Boolean(hudBoss?.isMythic), longRunTier:comfort.tier, maxLabels:requestedBuildLabelCap,
    });
    const buildLabels = eightTwelvePriority.active?(eightTwelvePriority.routineBuildLabelCap===0?eightTwelveHourBuildLabels(rawBuildLabels,eightTwelvePriority):eightTwelveHourBuildLabels(prioritizedBuildLabels,eightTwelvePriority)):fourEightPriority.active?priorityBuildLabels(prioritizedBuildLabels,fourEightPriority):prioritizedBuildLabels;
    let buildY = this.hero.profileId === 'kain' ? 168 : 148;
    const buildIdentityY = buildY;
    for (const label of buildLabels) {
      const accent = label.startsWith('REPLAY') ? '#8ff0ff' : label.startsWith('CONTRACT') ? '#ffd66e' : label.startsWith('SIGNATURE') ? '#ff8dc7' : label.startsWith('서약') ? '#7ff2bb' : label.startsWith('OVERDRIVE') ? '#ffb85c' : label.startsWith('최종형') ? '#fff0a6' : label.startsWith('RECOVER') ? '#8ff0c8' : label.startsWith('융합') ? '#84ecff' : label.startsWith('운명') ? '#e7a1ff' : label.startsWith('시너지') ? '#e5bcff' : '#f2d37b';
      ctx.fillStyle = 'rgba(10,10,20,.76)'; ctx.fillRect(18, buildY, 440, 23);
      ctx.strokeStyle = accent; ctx.globalAlpha = 0.58; ctx.lineWidth = 1; ctx.strokeRect(18, buildY, 440, 23);
      ctx.globalAlpha = 1; ctx.fillStyle = accent; ctx.font = '800 11px system-ui'; ctx.textAlign = 'left';
      ctx.fillText(label, 34, buildY + 16);
      if (label.startsWith('CONTRACT') && this.endlessState.contracts.active) { this.drawDeepRunDecisionIdentityHud(ctx,{kind:'contract',id:this.endlessState.contracts.active.family},425,buildY+3,17); this.drawRunContractPaceBoonRecall(ctx,this.endlessState.contracts.active,buildY+3); }
      if (label.startsWith('서약') && this.endlessState.oaths.active) { this.drawDeepRunDecisionIdentityHud(ctx,{kind:'oath',id:this.endlessState.oaths.active.kind},425,buildY+3,17); this.drawLongRunOathRequirementBoonRecall(ctx,this.endlessState.oaths.active.kind,buildY+3); }
      if (finalForm && (label.startsWith('최종형') || label.startsWith('SIGNATURE') || label.startsWith('FLOW'))) this.drawFinalFormIdentityHud(ctx, finalForm, 425, buildY + 3, 17);
      if (label.startsWith('REPLAY') && this.currentReplayPlan) this.drawBattlefieldIdentityHud(ctx, this.currentReplayPlan.target.mapId, 0, 399, buildY + 5, 23, 13);
      if (replayGuide?.category === 'final-form' && this.currentReplayPlan?.target.finalForm && label.startsWith('REPLAY')) this.drawFinalFormIdentityHud(ctx, { id:this.currentReplayPlan.target.finalForm } as HeroFinalForm, 425, buildY + 3, 17);
      buildY += 26;
    }
    this.drawBuildOverdriveRecall(ctx,this.endlessState.overdrive,this.elapsed*1000,126,buildIdentityY+2,focus.tier>=2);
    this.drawBuildOverdriveEffectRecall(ctx,this.endlessState.overdrive,this.currentBuildArchetype(),this.elapsed*1000,160,buildIdentityY+3,focus.tier>=2);
    this.drawRunContractBoonRecall(ctx,this.endlessState.contracts.boons,this.elapsed*1000,198,buildIdentityY+2);
    this.drawAscensionMutatorRecall(ctx,this.endlessState.ascension.mutators,3,256,buildIdentityY+2);
    if (deepRunIdentityFocus.showAscensionRecall) this.drawDeepRunAscensionRecall(ctx,this.endlessState.heroAscension.selected,deepRunIdentityFocus.maxAscensionIcons,322,buildIdentityY+2);
    this.drawRunTraitRecall(ctx,13,buildIdentityY+2,18);
    this.drawLegendaryAwakeningRecall(ctx,34,buildIdentityY+3,16);
    this.drawSynergyIdentityHud(ctx,76,buildIdentityY+3,16,2);
    this.drawBuildIdentityStrip(ctx, 386, buildIdentityY + 2);

    ctx.fillStyle = 'rgba(4,8,15,.78)'; ctx.fillRect(1125, 18, 452, 62);
    ctx.textAlign = 'left'; ctx.fillStyle = '#bfefff'; ctx.font = '700 17px system-ui'; ctx.fillText('수호핵', 1145, 43);
    this.drawBar(ctx, 1220, 29, 330, 18, this.core.hp / this.core.maxHp, '#55c9f0', '#0b2b38');
    ctx.fillStyle = '#d9f8ff'; ctx.font = '600 14px system-ui'; ctx.fillText(`${Math.ceil(this.core.hp)} / ${this.core.maxHp}`, 1220, 68);
    ctx.restore();
  }


  private showFinalFormIdentityCue(id: import('./endless/final-form.js').HeroFinalFormId, durationSeconds: number): void {
    this.finalFormIdentityCueId = id;
    this.finalFormIdentityCueUntil = this.elapsed + Math.max(0, durationSeconds);
  }

  private showFinalFormTransformationCue(form: HeroFinalForm): void {
    this.showFinalFormIdentityCue(form.id, 2.4);
  }

  private drawBattlefieldIdentityHud(ctx: CanvasRenderingContext2D, mapId: import('./map-layouts.js').MapId, stage: MapEvolutionStage, x:number, y:number, width=28, height=16): void {
    if (!this.battlefieldEnvironmentAtlasReady || !this.battlefieldEnvironmentAtlasImage) return;
    const sprite=battlefieldEnvironmentSprite(mapId, stage);
    ctx.save();
    ctx.globalAlpha=.9;
    ctx.drawImage(this.battlefieldEnvironmentAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,x,y,width,height);
    ctx.restore();
  }

  private drawBattlefieldMechanicRecall(ctx:CanvasRenderingContext2D,mapId:import('./map-layouts.js').MapId,stage:MapEvolutionStage,x:number,y:number,width=34,height=19):void{
    if(!this.battlefieldMechanicAtlasReady||!this.battlefieldMechanicAtlasImage)return;
    const projection=projectBattlefieldMechanics(mapId,stage),mechanic=battlefieldMechanicIdentityIcon(projection.dominantMechanic),stageIcon=battlefieldMechanicIdentityIcon(projection.stageIdentity);
    ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.82)';ctx.fillRect(x+1,y+1,12,12);ctx.drawImage(this.battlefieldMechanicAtlasImage,mechanic.sx,mechanic.sy,mechanic.sw,mechanic.sh,x+2,y+2,10,10);ctx.fillStyle='rgba(4,8,14,.86)';ctx.fillRect(x+width-11,y+height-10,10,9);ctx.drawImage(this.battlefieldMechanicAtlasImage,stageIcon.sx,stageIcon.sy,stageIcon.sw,stageIcon.sh,x+width-10,y+height-9,8,8);ctx.restore();
  }

  private drawFinalFormIdentityHud(ctx: CanvasRenderingContext2D, form: Pick<HeroFinalForm,'id'>, x:number, y:number, size=18): void {
    if (!this.finalFormIdentityAtlasReady || !this.finalFormIdentityAtlasImage) return;
    const icon=finalFormIdentityIcon(form.id);
    ctx.save();
    ctx.globalAlpha=.96;
    ctx.drawImage(this.finalFormIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);
    ctx.restore();
  }

  private drawFinalFormTransformationCue(ctx: CanvasRenderingContext2D): void {
    if (!this.finalFormIdentityCueId || this.elapsed >= this.finalFormIdentityCueUntil) return;
    if (!this.finalFormIdentityAtlasReady || !this.finalFormIdentityAtlasImage) return;
    const icon=finalFormIdentityIcon(this.finalFormIdentityCueId);
    const ttl=Math.max(0,this.finalFormIdentityCueUntil-this.elapsed);
    const alpha=Math.min(1,ttl/.35);
    const size=76; const x=LOGICAL_WIDTH/2-size/2; const y=104;
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.fillStyle='rgba(5,8,16,.78)'; ctx.fillRect(x-8,y-8,size+16,size+16);
    ctx.strokeStyle='#fff0a6'; ctx.lineWidth=2; ctx.strokeRect(x-8,y-8,size+16,size+16);
    ctx.drawImage(this.finalFormIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);
    ctx.restore();
  }

  private drawDeepRunDecisionIdentityHud(ctx:CanvasRenderingContext2D,identity:DeepRunDecisionIdentity,x:number,y:number,size=18):void{
    if(!this.deepRunDecisionIdentityAtlasReady||!this.deepRunDecisionIdentityAtlasImage)return;
    const icon=deepRunDecisionIdentityIcon(identity);
    ctx.save();ctx.globalAlpha=.96;ctx.drawImage(this.deepRunDecisionIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();
  }

  private drawAscensionMutatorRecall(ctx:CanvasRenderingContext2D,ids:readonly AscensionMutatorIdentityId[],maxIcons:number,x:number,y:number):void{
    if(!this.ascensionMutatorIdentityAtlasReady||!this.ascensionMutatorIdentityAtlasImage||maxIcons<=0)return;
    const visible=ids.slice(-Math.min(3,maxIcons));const size=18,gap=3;
    ctx.save();
    for(let i=0;i<visible.length;i++){
      const icon=ascensionMutatorIdentityIcon(visible[i]!);const dx=x+i*(size+gap);
      ctx.fillStyle='rgba(6,12,22,.88)';ctx.fillRect(dx-1,y-1,size+2,size+2);
      ctx.drawImage(this.ascensionMutatorIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,dx,y,size,size);
    }
    ctx.restore();
  }

  private drawDeepRunAscensionRecall(ctx:CanvasRenderingContext2D,ids:readonly import('./endless/hero-ascension.js').HeroAscensionId[],maxIcons:0|1|2|3,x:number,y:number):void{
    if(!this.deepRunDecisionIdentityAtlasReady||!this.deepRunDecisionIdentityAtlasImage||maxIcons===0)return;
    const visible=ids.slice(-maxIcons);const size=18,gap=3;
    ctx.save();
    for(let i=0;i<visible.length;i++){
      const icon=deepRunDecisionIdentityIcon({kind:'ascension',id:visible[i]!});const dx=x+i*(size+gap);
      ctx.fillStyle='rgba(6,12,22,.88)';ctx.fillRect(dx-1,y-1,size+2,size+2);
      ctx.drawImage(this.deepRunDecisionIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,dx,y,size,size);
    }
    ctx.restore();
  }

  private hideAscensionTierPressureIdentity():boolean{
    const boss=this.enemies.enemies.find(enemy=>enemy.alive&&enemy.type==='boss')??null;
    const heroCritical=this.dangerState.heroCritical,coreCritical=this.dangerState.coreCritical,bossSpecialTimer=boss?.specialTimer??99;
    return heroCritical||coreCritical||bossSpecialTimer<=1.2;
  }

  private drawAscensionTierForecast(ctx:CanvasRenderingContext2D,elapsedMs:number,x:number,y:number):void{
    const projection=projectAscensionTierForecast(elapsedMs);
    if(!projection.visible||this.hideAscensionTierPressureIdentity()||!this.ascensionTierPressureAtlasReady||!this.ascensionTierPressureAtlasImage)return;
    const w=82,h=22,size=9;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(7,10,18,.9)';ctx.fillRect(x,y,w,h);ctx.strokeStyle=projection.mutatorThreshold?'#ff6fab':'#ffbf78';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,h-1);ctx.fillStyle='#ffe0a6';ctx.font='900 9px system-ui';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(ascensionTierForecastLabel(projection),x+4,y+h/2+.5);
    projection.primaryPressureIds.slice(0,2).forEach((id,index)=>{const icon=ascensionTierPressureIdentityIcon(id),dx=x+47+index*12;ctx.drawImage(this.ascensionTierPressureAtlasImage!,icon.sx,icon.sy,icon.sw,icon.sh,dx,y+6,size,size);});
    if(projection.mutatorThreshold){const icon=ascensionTierPressureIdentityIcon('mutator-threshold');ctx.drawImage(this.ascensionTierPressureAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x+w-11,y+2,8,8);}
    ctx.restore();
  }

  private drawBuildOverdriveRecall(ctx:CanvasRenderingContext2D,state:import('./endless/build-overdrive.js').BuildOverdriveState,elapsedMs:number,x:number,y:number,compact:boolean):void{
    const recall=buildOverdriveRecallPresentation(state,elapsedMs,compact);
    const height=18;
    ctx.save();
    if(recall.mode==='active'&&!recall.compact){
      ctx.fillStyle='rgba(6,12,22,.88)';ctx.fillRect(x-1,y-1,57,height+2);
      ctx.strokeStyle='#ffb85c';ctx.globalAlpha=.7;ctx.strokeRect(x-.5,y-.5,56,height+1);ctx.globalAlpha=1;
      ctx.fillStyle='#ffcf8a';ctx.font='900 10px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(recall.numericLabel,x+16,y+height/2+1);
      ctx.restore();return;
    }
    const segmentW=7,gap=2;const gaugeW=recall.totalSegments*segmentW+(recall.totalSegments-1)*gap;const boxW=recall.compact?gaugeW+4:gaugeW+27;
    ctx.fillStyle='rgba(6,12,22,.88)';ctx.fillRect(x-1,y-1,boxW,height+2);
    for(let i=0;i<recall.totalSegments;i++){const sx=x+2+i*(segmentW+gap);ctx.fillStyle=i<recall.filledSegments?'#ffb85c':'rgba(255,184,92,.18)';ctx.fillRect(sx,y+5,segmentW,8);ctx.strokeStyle='rgba(255,207,138,.52)';ctx.lineWidth=1;ctx.strokeRect(sx+.5,y+5.5,segmentW-1,7);}
    if(!recall.compact&&recall.numericLabel){ctx.fillStyle=recall.mode==='ready'?'#fff0a6':'#ffcf8a';ctx.font='900 9px system-ui';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(recall.numericLabel,x+gaugeW+7,y+height/2+1);}
    ctx.restore();
  }

  private hideBuildOverdriveEffectIdentity():boolean{
    const boss=this.enemies.enemies.find(enemy=>enemy.alive&&enemy.type==='boss')??null;
    return this.dangerState.heroCritical||this.dangerState.coreCritical||(boss?.specialTimer??99)<=1.2;
  }

  private drawBuildOverdriveEffectRecall(ctx:CanvasRenderingContext2D,state:import('./endless/build-overdrive.js').BuildOverdriveState,archetype:BuildArchetype,elapsedMs:number,x:number,y:number,compact:boolean):void{
    const projection=projectBuildOverdriveEffects(state,archetype,elapsedMs);
    if(!projection.active||compact||this.hideBuildOverdriveEffectIdentity()||!this.buildOverdriveEffectAtlasReady||!this.buildOverdriveEffectAtlasImage)return;
    const size=10,gap=2;ctx.save();ctx.globalAlpha=.96;projection.effects.slice(0,2).forEach((effect,index)=>{const icon=buildOverdriveEffectIdentityIcon(effect.id),dx=x+index*(size+gap);ctx.fillStyle='rgba(6,12,22,.9)';ctx.fillRect(dx-1,y-1,size+2,size+2);ctx.drawImage(this.buildOverdriveEffectAtlasImage!,icon.sx,icon.sy,icon.sw,icon.sh,dx,y,size,size);});ctx.restore();
  }

  private currentSynergyIdentityIds(): SynergyIdentityId[] {
    return activeSynergies({heroId:this.hero.profileId,traitId:this.selectedTrait,relicId:this.activeRelic,equipment:this.equipmentState}).map(v=>v.id);
  }

  private syncSynergyIdentityTracker(showToast=true): void {
    const ids=this.currentSynergyIdentityIds();
    if(!this.synergyIdentityInitialized){this.lastSynergyIdentityIds=[...ids];this.synergyIdentityInitialized=true;return;}
    const previous=new Set(this.lastSynergyIdentityIds);const added=ids.find(id=>!previous.has(id));this.lastSynergyIdentityIds=[...ids];
    if(showToast&&added){const def=activeSynergies({heroId:this.hero.profileId,traitId:this.selectedTrait,relicId:this.activeRelic,equipment:this.equipmentState}).find(v=>v.id===added);if(def)this.showSynergyEventToast(`시너지 활성 · ${def.name}`,added);}
  }

  private drawSynergyIdentityHud(ctx:CanvasRenderingContext2D,x:number,y:number,size=16,maxIcons=2):void{
    const ids=this.currentSynergyIdentityIds().slice(0,Math.max(0,maxIcons));if(ids.length===0||!this.synergyIdentityAtlasReady||!this.synergyIdentityAtlasImage)return;
    const gap=3;ctx.save();ctx.globalAlpha=.95;ids.forEach((id,index)=>{const icon=synergyIdentityIcon(id),dx=x+index*(size+gap);ctx.fillStyle='rgba(6,12,22,.9)';ctx.fillRect(dx-1,y-1,size+2,size+2);ctx.drawImage(this.synergyIdentityAtlasImage!,icon.sx,icon.sy,icon.sw,icon.sh,dx,y,size,size);});ctx.restore();
  }

  private drawLegendaryAwakeningRecall(ctx:CanvasRenderingContext2D,x:number,y:number,size=16):void{
    const recalls=activeLegendaryAwakeningRecall(this.equipmentState,this.legendaryEffects.modifiers);if(recalls.length===0||!this.legendaryAwakeningAtlasReady||!this.legendaryAwakeningAtlasImage)return;
    const gap=3;ctx.save();ctx.globalAlpha=.96;recalls.forEach((recall,index)=>{const dx=x+index*(size+gap);ctx.fillStyle='rgba(6,12,22,.9)';ctx.fillRect(dx-1,y-1,size+2,size+2);ctx.drawImage(this.legendaryAwakeningAtlasImage!,recall.icon.sx,recall.icon.sy,recall.icon.sw,recall.icon.sh,dx,y,size,size);ctx.strokeStyle='#ffd879';ctx.lineWidth=1;ctx.strokeRect(dx+.5,y+.5,size-1,size-1);});ctx.restore();
  }

  private drawBuildIdentityStrip(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (!this.buildIdentityAtlasReady || !this.buildIdentityAtlasImage) return;
    const ids=[...(this.activeRelic?[this.activeRelic]:[]),...this.fusionRuntime.equipped].slice(0,3);
    if(ids.length===0)return;
    const size=18,gap=3;
    const resonance=this.currentRelicResonance();
    const resonancePresentation=relicResonanceRecallPresentation(this.activeRelic,resonance.tier);
    ctx.save();
    for(let i=0;i<ids.length;i++){
      const icon=buildIdentityIcon(ids[i]!);
      const dx=x+i*(size+gap);
      ctx.fillStyle='rgba(6,12,22,.88)';ctx.fillRect(dx-1,y-1,size+2,size+2);
      ctx.drawImage(this.buildIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,dx,y,size,size);
      if(i===0&&this.activeRelic&&ids[i]===this.activeRelic){this.drawRelicResonanceProgressFrame(ctx,dx,y,size,relicResonanceNextTierProgress(resonance));if(resonancePresentation)this.drawRelicResonanceTierBadge(ctx,dx,y,size,resonancePresentation.badge.label);}
    }
    ctx.restore();
  }

  private drawPriorityThreats(ctx: CanvasRenderingContext2D, motion: SecondaryCombatMotionPolicy): void {
    const orderedIds=priorityThreatIds(this.enemies.enemies, this.hero.pos, 2);
    const ids = new Set(orderedIds);
    if (ids.size === 0) return;
    const primaryThreatId=motion.owner==='priority-threat'?orderedIds[0]??null:null;
    ctx.save();
    for (const enemy of this.enemies.enemies) {
      if (!enemy.alive || !ids.has(enemy.id)) continue;
      const accent = enemy.type === 'boss' ? '#ff5d6f' : enemy.type === 'bomber' ? '#ff9b4a' : '#72e5a4';
      const amplitude=enemy.id===primaryThreatId?motion.priorityThreatMotionAmplitude:0;
      const pulse=1+Math.sin(this.elapsed*6)*amplitude;
      ctx.strokeStyle = accent;
      ctx.globalAlpha = enemy.type === 'boss' ? 0.88 : 0.72;
      ctx.lineWidth = enemy.type === 'boss' ? 5 : 3;
      ctx.beginPath();
      ctx.arc(enemy.pos.x, enemy.pos.y, (enemy.radius + (enemy.type === 'boss' ? 24 : 14)) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      if (enemy.type !== 'boss') {
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.9;
        ctx.font = '900 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(enemy.type === 'bomber' ? '폭발' : '주술', enemy.pos.x, enemy.pos.y - enemy.radius - 22);
      }
    }
    ctx.restore();
  }

  private drawDangerVignette(ctx: CanvasRenderingContext2D): void {
    const alpha = this.dangerState.vignetteAlpha;
    if (alpha <= 0) return;
    ctx.save();
    const top = ctx.createLinearGradient(0, 0, 0, 150);
    top.addColorStop(0, `rgba(255,28,53,${alpha})`);
    top.addColorStop(1, 'rgba(255,28,53,0)');
    ctx.fillStyle = top; ctx.fillRect(0, 0, LOGICAL_WIDTH, 150);
    const bottom = ctx.createLinearGradient(0, LOGICAL_HEIGHT, 0, LOGICAL_HEIGHT - 150);
    bottom.addColorStop(0, `rgba(255,28,53,${alpha})`);
    bottom.addColorStop(1, 'rgba(255,28,53,0)');
    ctx.fillStyle = bottom; ctx.fillRect(0, LOGICAL_HEIGHT - 150, LOGICAL_WIDTH, 150);
    const left = ctx.createLinearGradient(0, 0, 145, 0);
    left.addColorStop(0, `rgba(255,28,53,${alpha * 0.82})`);
    left.addColorStop(1, 'rgba(255,28,53,0)');
    ctx.fillStyle = left; ctx.fillRect(0, 0, 145, LOGICAL_HEIGHT);
    const right = ctx.createLinearGradient(LOGICAL_WIDTH, 0, LOGICAL_WIDTH - 145, 0);
    right.addColorStop(0, `rgba(255,28,53,${alpha * 0.82})`);
    right.addColorStop(1, 'rgba(255,28,53,0)');
    ctx.fillStyle = right; ctx.fillRect(LOGICAL_WIDTH - 145, 0, 145, LOGICAL_HEIGHT);
    ctx.restore();
  }

  private drawCriticalWarnings(ctx: CanvasRenderingContext2D): void {
    const boss=this.enemies.enemies.find((enemy)=>enemy.alive&&enemy.type==='boss')??null;
    const attention=combatAttentionPolicy({
      heroCritical:this.dangerState.heroCritical,
      coreCritical:this.dangerState.coreCritical,
      damageSeverity:this.damageReasonState?.severity??null,
      bossSpecialTimer:boss?.specialTimer??99,
      reducedFlash:this.presentationSettings.reducedFlash,
      reducedMotion:this.presentationSettings.reducedMotion,
      bossCountdown:this.enemies.bossCountdown,
    });
    const animatedPulse=0.75+Math.sin(this.elapsed*9)*attention.criticalMotionAmplitude;
    const steadyAlpha=0.82;
    ctx.save();
    if (attention.showHeroWarning) {
      ctx.globalAlpha = attention.heroWarningAnimated ? animatedPulse : steadyAlpha;
      ctx.fillStyle = 'rgba(91,6,18,.88)'; ctx.fillRect(18, 260, 160, 34);
      ctx.strokeStyle = '#ff5268'; ctx.lineWidth = 2; ctx.strokeRect(18, 260, 160, 34);
      ctx.fillStyle = '#fff'; ctx.font = '900 15px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(this.dangerState.heroWarning, 98, 283);
    }
    if (attention.showCoreWarning) {
      ctx.globalAlpha = attention.coreWarningAnimated ? animatedPulse : steadyAlpha;
      ctx.fillStyle = 'rgba(71,12,17,.9)'; ctx.fillRect(1330, 86, 247, 34);
      ctx.strokeStyle = '#ff6b79'; ctx.lineWidth = 2; ctx.strokeRect(1330, 86, 247, 34);
      ctx.fillStyle = '#fff'; ctx.font = '900 14px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(this.dangerState.coreWarning, 1453, 109);
      if (distance(this.hero.pos, this.core.pos) > 300) {
        const direction = normalize({ x: this.core.pos.x - this.hero.pos.x, y: this.core.pos.y - this.hero.pos.y });
        const px = this.hero.pos.x + direction.x * 58;
        const py = this.hero.pos.y + direction.y * 58;
        const angle = Math.atan2(direction.y, direction.x);
        ctx.translate(px, py); ctx.rotate(angle);
        ctx.fillStyle = '#ff6b79';
        ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-10, -9); ctx.lineTo(-10, 9); ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();
  }

  private drawTacticalStack(ctx: CanvasRenderingContext2D): void {
    const rows: Array<{ accent: string; title: string; detail: string; iconId?: string; fateIds?: readonly FatePathId[]; objectiveRewards?: readonly ObjectiveReward[]; objectiveRewardMultiplier?: number; fieldEventId?: FieldEventId; missionPaceId?: RunMissionPaceIdentityId; missionReward?: RunMissionReward }> = [];
    const onboardingStep = this.onboarding.current;
    if (onboardingStep) rows.push({ accent: '#fff3a0', title: `첫 전투 · ${onboardingStep.title}`, detail: onboardingStep.hint });
    if (this.fateRuntime.choices.length > 0) rows.push({ accent: '#e7a1ff', title: '운명', detail: fateHudSummary(this.fateRuntime.choices), fateIds: this.fateRuntime.choices });
    const event = this.fieldEvents.active;
    if (event) rows.push({ accent: event.accent, title: event.name, detail: `${Math.max(0, Math.ceil(event.remaining))}초 · ${event.description}`, iconId: event.id, fieldEventId: event.id });
    const objective = this.objectiveRuntime.active;
    if (objective) {
      const def = objectiveDefinition(objective.id);
      const detail = objective.id === 'riftSeal'
        ? `${Math.round(objective.progress)}% 봉인`
        : objective.id === 'beaconDefense'
          ? `HP ${Math.round(objective.hp)} · ${Math.ceil(objective.timeLeft)}초`
          : `${objective.activated ? '활성' : '접근 필요'} · ${Math.ceil(objective.timeLeft)}초`;
      const objectiveRewardMultiplier = fateRewardMultipliers(this.fateRuntime.modifiers).objectiveRewardMultiplier;
      const objectiveRewards = objectiveRewardFor(objective.id, this.objectiveRuntime.stats.currentStreak + 1);
      rows.push({ accent: def.accent, title: `목표 · ${def.name}`, detail, iconId: objective.id, objectiveRewards, objectiveRewardMultiplier });
    }
    const mission = this.runMissions.active;
    if (mission) {
      const progress = Math.min(mission.target, missionProgress(mission, this.currentMissionSnapshot()));
      const progressRatio=progress/Math.max(1,mission.target),elapsedRatio=(mission.duration-mission.remaining)/Math.max(1,mission.duration);
      const missionPaceId=runMissionPaceIdentityForRatios(progressRatio,elapsedRatio);
      rows.push({ accent: mission.accent, title: `미션 · ${mission.name}`, detail: `${progress}/${mission.target} · ${Math.max(0, Math.ceil(mission.remaining))}초`, iconId: mission.id, missionPaceId, missionReward: mission.reward });
    }
    if (this.threatDirective) rows.push({ accent: this.threatDirective.accent, title: `전투 지시 · ${this.threatDirective.name}`, detail: this.threatDirective.description, iconId: this.threatDirective.id });
    if (rows.length === 0) return;
    let y = this.enemies.bossCountdown > 0 && this.enemies.bossCountdown <= 8 ? 178 : 96;
    const openingFocus = openingHudFocusPolicy(this.elapsed);
    for (const row of rows.slice(0, openingFocus.maxTacticalRows)) {
      this.drawStatusRow(ctx, y, row.accent, row.title, row.detail, row.iconId);
      if (row.fateIds) { this.drawFatePathRecall(ctx,row.fateIds,y); if(!this.hideFateImpactHelperIdentity()) this.drawFateCumulativeImpactRecall(ctx,row.fateIds,y); }
      if (row.fieldEventId && !this.hideFieldEventHelperIdentity()) this.drawFieldEventResponseEffectRecall(ctx,row.fieldEventId,y);
      if (row.objectiveRewards && !this.hideObjectiveHelperIdentity()) this.drawObjectiveRewardPreview(ctx,row.objectiveRewards.slice(0, 2),row.objectiveRewardMultiplier ?? 1,y);
      if (row.missionPaceId && row.missionReward && !this.hideRunMissionHelperIdentity()) this.drawRunMissionPaceRewardRecall(ctx,row.missionPaceId,row.missionReward,y);
      y += 48;
    }
  }

  private drawFatePathRecall(ctx:CanvasRenderingContext2D,ids:readonly FatePathId[],y:number):void {
    if(!this.decisionPathIconAtlasReady||!this.decisionPathIconAtlasImage)return;
    const visible=ids.slice(0,3); const size=18,gap=3,x=626;
    ctx.save();
    for(let i=0;i<visible.length;i++){
      const icon=fatePathRecallIcon(visible[i]!); const sprite=icon.sprite; const dx=x+i*(size+gap),dy=y+20;
      ctx.fillStyle='rgba(6,12,22,.88)'; ctx.fillRect(dx-1,dy-1,size+2,size+2);
      ctx.drawImage(this.decisionPathIconAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,dx,dy,size,size);
    }
    ctx.restore();
  }

  private hideFateImpactHelperIdentity():boolean{
    const heroCritical=this.dangerState.heroCritical;
    const coreCritical=this.dangerState.coreCritical;
    const boss=this.enemies.enemies.find((enemy)=>enemy.type==='boss');
    const bossSpecialTimer=boss?.specialTimer??Infinity;
    return heroCritical||coreCritical||bossSpecialTimer<=1.2;
  }

  private drawFateImpactPair(ctx:CanvasRenderingContext2D,impact:FateImpactVector,x:number,y:number,size:number):void{
    const benefitImage=this.fateBenefitVectorAtlasImage,costImage=this.fateCostVectorAtlasImage;
    if(!this.fateBenefitVectorAtlasReady||!benefitImage||!this.fateCostVectorAtlasReady||!costImage)return;
    const benefit=fateBenefitVectorIcon(impact.benefitId),cost=fateCostVectorIcon(impact.costId);
    ctx.save();ctx.globalAlpha=.95;ctx.fillStyle='rgba(5,9,17,.9)';ctx.fillRect(x-1,y-1,size*2+6,size+2);
    ctx.drawImage(benefitImage,benefit.sx,benefit.sy,benefit.sw,benefit.sh,x,y,size,size);
    ctx.drawImage(costImage,cost.sx,cost.sy,cost.sw,cost.sh,x+size+4,y,size,size);ctx.restore();
  }

  private drawFateCumulativeImpactRecall(ctx:CanvasRenderingContext2D,ids:readonly FatePathId[],y:number):void{
    if(ids.length===0)return; const impact=fateCumulativeImpact(ids); this.drawFateImpactPair(ctx,impact,695,y+20,18);
  }

  private drawStatusRow(ctx: CanvasRenderingContext2D, y: number, accent: string, title: string, detail: string, iconId?: string): void {
    ctx.save();
    ctx.fillStyle = 'rgba(5,10,19,.86)'; ctx.fillRect(570, y, 480, 42);
    ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.strokeRect(570, y, 480, 42);
    const iconPresentation=tacticalStatusIconPresentation(iconId??'');
    let titleX=586;
    if (iconPresentation.visible && this.tacticalStatusIconAtlasImage && this.tacticalStatusIconAtlasReady) {
      const sprite=iconPresentation.sprite;
      const size=iconPresentation.size;
      const dx=580;
      const dy=y+(42-size)/2;
      ctx.drawImage(this.tacticalStatusIconAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,dx,dy,size,size);
      titleX=616;
    }
    ctx.fillStyle = accent; ctx.font = '900 14px system-ui'; ctx.textAlign = 'left'; ctx.fillText(title, titleX, y + 17);
    ctx.fillStyle = '#d8e3ec'; ctx.font = '700 12px system-ui'; ctx.textAlign = 'right'; ctx.fillText(detail, 1034, y + 17);
    ctx.restore();
  }

  private drawBossResponseAckIdentity(ctx:CanvasRenderingContext2D,boss:Enemy,x:number,y:number,radius:number):void {
    if(!this.bossResponseAckIdentityAtlasReady||!this.bossResponseAckIdentityAtlasImage)return;
    const icon=bossResponseAckIdentityIcon(boss.bossArchetype??'inferno'),size=radius>60?24:20,dx=x+radius*.48-size/2,dy=y-radius*.48-size/2;
    ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(5,9,16,.9)';ctx.fillRect(dx-2,dy-2,size+4,size+4);ctx.drawImage(this.bossResponseAckIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,dx,dy,size,size);ctx.restore();
  }

  private drawControls(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    const boss=this.enemies.enemies.find((enemy)=>enemy.alive&&enemy.type==='boss')??null;
    const readyActions=new Set<ActionId>();
    for(const button of ACTION_BUTTONS){
      if(button.id==='potion'){if(this.hero.healingPotions>0)readyActions.add('potion');continue;}
      if(button.id.startsWith('spell')||button.id.startsWith('ultimate')){if(this.spells.cooldownRemaining(button.id)<=0)readyActions.add(button.id);}
    }
    let actionAssist:BossActionAssistCue|null=null;
    if(boss&&(boss.specialTimer??99)<=1.05){
      const archetype=boss.bossArchetype??'inferno';
      const sameBoss=this.bossActionAssistBossId===boss.id&&this.bossActionAssistArchetype===archetype;
      const previousCue=sameBoss?this.bossActionAssistCue:null;
      const previousCueAge=sameBoss?Math.max(0,this.elapsed-this.bossActionAssistCueSince):Infinity;
      const sameAckBoss=this.bossResponseAckBossId===boss.id&&this.bossResponseAckArchetype===archetype;
      const currentBossCycle=boss.bossCycle??0;
      const sameAckCycle=sameAckBoss&&this.bossResponseAckCycle===currentBossCycle;
      const ackAge=sameAckCycle?Math.max(0,this.elapsed-this.bossResponseAckSince):Infinity;
      const acknowledged=sameAckCycle&&ackAge<=BOSS_RESPONSE_ACK_SECONDS;
      const cycleAcknowledged=sameAckCycle;
      if(this.bossResponseAckAction&&!sameAckCycle)this.clearBossResponseAcknowledgement();
      const queuedActions=new Set<ActionId>(COMBAT_CAST_ACTIONS.filter((id)=>this.castIntentBuffer.isQueued(id)));
      actionAssist=bossActionAssist({archetype,specialTimer:boss.specialTimer??99,hpRatio:this.hero.hp/Math.max(1,this.hero.maxHp),potions:this.hero.healingPotions,readyActions,previousCue,previousCueAge,previousArchetype:sameBoss?this.bossActionAssistArchetype:null,acknowledged,cycleAcknowledged,queuedActions});
      if(actionAssist){
        if(!previousCue||actionAssist.actionId!==previousCue.actionId)this.bossActionAssistCueSince=this.elapsed;
        this.bossActionAssistCue=actionAssist;this.bossActionAssistBossId=boss.id;this.bossActionAssistArchetype=archetype;
      }else this.clearBossActionAssistCue();
    }else { this.clearBossActionAssistCue(); this.clearBossResponseAcknowledgement(); }
    const prepAssist=openingBossPrepAssist({elapsedSeconds:this.elapsed,bossCountdown:this.enemies.bossCountdown,shopTokens:this.shopTokens,hpRatio:this.hero.hp/Math.max(1,this.hero.maxHp),potions:this.hero.healingPotions});
    const lateShopNeed=lateRunShopNeed(this.elapsed,this.equipmentState);
    const ultraShopNeed=ultraLongShopFocus(this.elapsed,this.equipmentState);
    const fourEightShop=fourEightHourShopSilence(this.elapsed,this.equipmentState);
    const eightTwelveShop=eightTwelveHourShopFocus(this.elapsed,this.equipmentState);
    const quietShop=lateShopNeed.deemphasizeShop||ultraShopNeed.deemphasizeShop||fourEightShop.suppressRoutinePressure||eightTwelveShop.dormant;
    const controlAssist=actionAssist??prepAssist;
    const combatAttention=combatAttentionPolicy({
      heroCritical:this.dangerState.heroCritical,
      coreCritical:this.dangerState.coreCritical,
      damageSeverity:this.damageReasonState?.severity??null,
      bossSpecialTimer:boss?.specialTimer??99,
      reducedFlash:this.presentationSettings.reducedFlash,
      reducedMotion:this.presentationSettings.reducedMotion,
      bossCountdown:this.enemies.bossCountdown,
    });
    if (this.input.joystickActive) {
      const b = this.input.joystickBase;
      const t = this.input.joystickThumb;
      ctx.fillStyle = 'rgba(191,220,255,.10)'; ctx.beginPath(); ctx.arc(b.x, b.y, 100, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(210,234,255,.32)'; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = 'rgba(220,236,255,.28)'; ctx.beginPath(); ctx.arc(t.x, t.y, 42, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(210,234,255,.14)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(180, 720, 88, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(210,234,255,.12)'; ctx.beginPath(); ctx.arc(180, 720, 34, 0, Math.PI * 2); ctx.fill();
    }

    for (const button of ACTION_BUTTONS) {
      const held = this.input.isHeld(button.id);
      const unavailableShop = button.id === 'shop' && this.shopTokens <= 0;
      const autoActive = button.id === 'auto' && this.autoCastNormal;
      ctx.beginPath(); ctx.arc(button.x, button.y, button.radius, 0, Math.PI * 2);
      ctx.fillStyle = button.id.startsWith('ultimate') ? (held ? '#6930a8' : 'rgba(72,36,118,.84)') : button.id === 'potion' ? 'rgba(34,113,76,.86)' : button.id === 'shop' ? (unavailableShop ? 'rgba(58,52,40,.55)' : eightTwelveShop.dormant ? `rgba(58,60,68,${eightTwelveShop.visualAlpha})` : quietShop ? 'rgba(74,65,45,.62)' : 'rgba(117,85,30,.9)') : button.id === 'auto' ? (autoActive ? 'rgba(36,142,126,.95)' : 'rgba(44,74,82,.88)') : (held ? '#9e4224' : 'rgba(56,72,102,.86)');
      ctx.fill();
      ctx.strokeStyle = button.id.startsWith('ultimate') ? '#d8a9ff' : '#9fd9ff'; ctx.lineWidth = held ? 5 : 3; ctx.stroke();
      const cooldown = this.spells.cooldownRemaining(button.id);
      const ratio = this.spells.cooldownRatio(button.id, this.hero);
      const queuedCast = COMBAT_CAST_ACTIONS.includes(button.id as CombatCastAction) && this.castIntentBuffer.isQueued(button.id as CombatCastAction);
      const isUltimate = button.id.startsWith('ultimate');
      const wasReady = this.actionReadyState[button.id] ?? false;
      const buttonState = spellButtonPresentation(cooldown, isUltimate, wasReady, this.autoCastNormal);
      const readyPulseActiveBeforeArbitration = (this.ultimatePulseUntil[button.id] ?? 0) > this.elapsed;
      const compactBossAssist=actionAssist?.actionId===button.id&&combatAttention.bossAssistCompact;
      const responseAckAge=Math.max(0,this.elapsed-this.bossResponseAckSince);
      const responseAckActive=Boolean(boss&&this.bossResponseAckAction===button.id&&this.bossResponseAckBossId===boss.id&&this.bossResponseAckCycle===(boss.bossCycle??0)&&responseAckAge<=BOSS_RESPONSE_ACK_SECONDS);
      const cuePresentation = actionCuePresentation({
        assistActive: controlAssist?.actionId === button.id,
        queued: queuedCast,
        readyPulseRequested: buttonState.pulse,
        readyPulseActive: readyPulseActiveBeforeArbitration,
        reducedFlash: this.presentationSettings.reducedFlash,
        reducedMotion: this.presentationSettings.reducedMotion||compactBossAssist||(prepAssist?.actionId===button.id&&!combatAttention.openingPrepAnimated),
      });
      if (cuePresentation.clearReadyPulse) this.ultimatePulseUntil[button.id] = 0;
      else if (buttonState.pulse) this.ultimatePulseUntil[button.id] = this.elapsed + 0.48;
      this.actionReadyState[button.id] = buttonState.ready;
      if (cuePresentation.outerCue === 'assist' && controlAssist?.actionId === button.id) {
        const radiusScale = 1.20 + (cuePresentation.animated ? Math.sin(this.elapsed * 10) * cuePresentation.motionAmplitude * 0.04 : 0);
        ctx.save(); ctx.globalAlpha=.72; ctx.strokeStyle=controlAssist.accent; ctx.lineWidth=5;
        ctx.beginPath(); ctx.arc(button.x,button.y,button.radius*radiusScale,0,Math.PI*2); ctx.stroke();
        const showAssistLabel=cuePresentation.showAssistLabel&&(!compactBossAssist||combatAttention.showBossAssistLabel);
        if (showAssistLabel) {
          ctx.fillStyle=controlAssist.accent; ctx.font='900 10px system-ui'; ctx.textAlign='center';
          ctx.fillText(controlAssist.label,button.x,button.y-button.radius-13);
        }
        ctx.restore();
      } else if (cuePresentation.outerCue === 'ready' && (this.ultimatePulseUntil[button.id] ?? 0) > this.elapsed) {
        const radiusScale = 1.15 + (cuePresentation.animated ? Math.sin((this.ultimatePulseUntil[button.id]! - this.elapsed) * 18) * cuePresentation.motionAmplitude * 0.05 : 0);
        ctx.save(); ctx.globalAlpha = 0.32; ctx.strokeStyle = '#fff2ad'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(button.x, button.y, button.radius * radiusScale, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
      if(responseAckActive&&boss)this.drawBossResponseAckIdentity(ctx,boss,button.x,button.y,button.radius);
      const heroAbilityIconImage = isHeroAbilityActionId(button.id) && this.heroAbilityIconAtlasReady && this.heroAbilityIconAtlasImage
        ? this.heroAbilityIconAtlasImage
        : null;
      const legacyActionIconImage = this.actionIconAtlasReady && this.actionIconAtlasImage ? this.actionIconAtlasImage : null;
      const legacyIconPresentation = actionIconPresentation(button.radius, this.actionIconAtlasReady);
      const iconPresentation = heroAbilityIconImage ? actionIconPresentation(button.radius, true) : legacyIconPresentation;
      if (iconPresentation.visible) {
        const iconSize = iconPresentation.iconSize;
        ctx.save();
        ctx.globalAlpha = unavailableShop ? 0.34 : held ? 0.76 : 0.92;
        if (heroAbilityIconImage && isHeroAbilityActionId(button.id)) {
          const sprite = heroAbilityIdentityIcon(this.hero.profileId, button.id);
          ctx.drawImage(
            heroAbilityIconImage,
            sprite.sx, sprite.sy, sprite.sw, sprite.sh,
            button.x - iconSize / 2, button.y + iconPresentation.iconOffsetY - iconSize / 2, iconSize, iconSize,
          );
        } else if (legacyActionIconImage) {
          const sprite = actionIconSprite(button.id);
          ctx.drawImage(
            legacyActionIconImage,
            sprite.sx, sprite.sy, sprite.sw, sprite.sh,
            button.x - iconSize / 2, button.y + iconPresentation.iconOffsetY - iconSize / 2, iconSize, iconSize,
          );
        }
        ctx.restore();
      }
      if (ratio > 0) {
        ctx.fillStyle = 'rgba(0,0,0,.50)';
        ctx.beginPath(); ctx.moveTo(button.x, button.y); ctx.arc(button.x, button.y, button.radius - 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio); ctx.closePath(); ctx.fill();
      }
      this.drawSpellEvolutionActionCrest(ctx,button.id,button.x,button.y,button.radius);
      ctx.fillStyle = unavailableShop ? 'rgba(255,255,255,.45)' : '#fff';
      ctx.font = `800 ${button.radius > 60 ? 18 : 15}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const showShopTokenCount=eightTwelveShop.active?eightTwelveShop.showTokenCount:fourEightShop.active?fourEightShop.showTokenCount:ultraShopNeed.showTokenCount;
      const buttonLabel = button.id === 'shop' ? (showShopTokenCount ? `상점 ${this.shopTokens}` : '상점') : button.id === 'potion' ? `물약 ${this.hero.healingPotions}` : button.id === 'auto' ? (this.autoCastNormal ? 'AUTO ON' : 'AUTO') : heroActionLabel(this.hero.profileId, button.id);
      ctx.fillText(buttonLabel, button.x, button.y + iconPresentation.labelOffsetY);
      ctx.font = '600 12px system-ui'; ctx.fillStyle = 'rgba(255,255,255,.62)';
      const secondaryLabel = queuedCast ? 'QUEUED' : button.id === 'shop' && quietShop ? (eightTwelveShop.dormant ? eightTwelveShop.secondaryLabel : fourEightShop.suppressRoutinePressure ? fourEightShop.secondaryLabel : ultraShopNeed.deemphasizeShop ? ultraShopNeed.secondaryLabel : lateShopNeed.secondaryLabel) : button.id === 'auto' ? buttonState.autoLabel : buttonState.secondary;
      ctx.fillText(secondaryLabel, button.x, button.y + iconPresentation.secondaryOffsetY);
    }
    ctx.restore();
  }


  private handleFieldEventStart(event: ActiveFieldEvent): void {
    const danger = dangerTierForSeconds(this.elapsed);
    let anchor={id:event.id,x:this.hero.pos.x,y:this.hero.pos.y};
    if (event.id === 'goldenGoblin') {
      const pos = fieldEventArenaPosition();
      this.goldenGoblinEnemyId = this.enemies.spawnEventEnemy('golden', danger, 'hero', pos);
      anchor={id:event.id,x:pos.x,y:pos.y};
    } else if (event.id === 'supplyDrop') {
      this.supplyCrate = fieldEventArenaPosition();
      anchor={id:event.id,x:this.supplyCrate.x,y:this.supplyCrate.y};
    } else if (event.id === 'eliteRush') {
      const count = eliteRushCount(danger);
      const eliteRushEnemyIds:number[]=[];let heroTargets=0,coreTargets=0;
      for (let i = 0; i < count; i++) { const target=Math.random()<0.3?'core':'hero';if(target==='hero')heroTargets+=1;else coreTargets+=1;eliteRushEnemyIds.push(this.enemies.spawnEventEnemy('elite', danger, target)); }
      const spawned=eliteRushEnemyIds.map(id=>this.enemies.enemies.find(enemy=>enemy.id===id)).filter((enemy):enemy is Enemy=>Boolean(enemy));
      if(spawned.length>0)anchor={id:event.id,x:spawned.reduce((sum,enemy)=>sum+enemy.pos.x,0)/spawned.length,y:spawned.reduce((sum,enemy)=>sum+enemy.pos.y,0)/spawned.length};
      this.queueElitePackApproachFormationVfx(eliteRushEnemyIds,heroTargets>=coreTargets?'hero':'core');
    }
    this.fieldEventWorldAnchor=anchor;
    this.queueFieldEventLifecycleWorldVfx(event.id,'entrance',anchor.x,anchor.y);
    this.showFieldEventStartToast(`${event.name} 발생!`, event.id);
  }

  private handleFieldEventEnd(event: ActiveFieldEvent): void {
    this.finishFieldEventLifecycleWorldVfx(event);
    if (event.id === 'goldenGoblin' && this.goldenGoblinEnemyId !== null) {
      this.enemies.removeEnemyById(this.goldenGoblinEnemyId);
      this.goldenGoblinEnemyId = null;
      this.showTacticalStatusEventToast('황금 고블린이 도망쳤습니다.', event.id);
    }
    if (event.id === 'supplyDrop' && this.supplyCrate) {
      this.supplyCrate = null;
      this.showTacticalStatusEventToast('보급 상자가 사라졌습니다.', event.id);
    }
  }

  private updateSupplyCrate(): void {
    if (!this.supplyCrate || this.fieldEvents.active?.id !== 'supplyDrop') return;
    if (distance(this.hero.pos, this.supplyCrate) > this.hero.radius + 58) return;
    if (Math.random() < 0.45) {
      this.equipmentState = { ...this.equipmentState, healingPotions: this.equipmentState.healingPotions + 1 };
      this.showTacticalStatusEventToast('보급 획득 · 체력 물약 +1', 'supplyDrop');
    } else {
      const equipmentOffers = generateShopOffers().filter((offer) => offer.kind !== 'potion');
      const offer = equipmentOffers[Math.floor(Math.random() * equipmentOffers.length)] ?? equipmentOffers[0];
      if (offer) {
        const result = purchaseOffer(this.equipmentState, { ...offer, price: 0 });
        if (result.ok) this.equipmentState = result.state;
        this.showTacticalStatusEventToast(`무료 보급 · ${offer.name}`, 'supplyDrop');
      }
    }
    this.syncEquipmentState();
    this.supplyCrate = null;
    const ended=this.fieldEvents.completeActive(this.elapsed);if(ended)this.finishFieldEventLifecycleWorldVfx(ended);
  }

  private drawSupplyCrate(ctx: CanvasRenderingContext2D, motion: SecondaryCombatMotionPolicy): void {
    if (!this.supplyCrate) return;
    const pulse = 1 + Math.sin(this.elapsed * 4) * motion.supplyCrateMotionAmplitude;
    ctx.save();
    ctx.translate(this.supplyCrate.x, this.supplyCrate.y);
    ctx.scale(pulse, pulse);
    ctx.shadowColor = '#75d7ff'; ctx.shadowBlur = 24;
    const iconPresentation=tacticalStatusIconPresentation('supplyDrop');
    if(this.battlefieldInteractionVfxAtlasReady&&this.battlefieldInteractionVfxAtlasImage){
      const sprite=battlefieldInteractionSprite('supply','crate'),size=82;
      ctx.shadowBlur=0; ctx.globalAlpha=.98;
      ctx.drawImage(this.battlefieldInteractionVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,-size/2,-size/2,size,size);
    }else{
      ctx.fillStyle = '#183c55'; ctx.fillRect(-28, -22, 56, 44);
      ctx.strokeStyle = '#b8efff'; ctx.lineWidth = 4; ctx.strokeRect(-28, -22, 56, 44);
      if(iconPresentation.visible&&this.tacticalStatusIconAtlasImage&&this.tacticalStatusIconAtlasReady){
        const sprite=iconPresentation.sprite,size=40;
        ctx.shadowBlur=0;
        ctx.drawImage(this.tacticalStatusIconAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,-size/2,-size/2,size,size);
      }else{
        ctx.fillStyle = '#f4d477'; ctx.fillRect(-5, -22, 10, 44);
        ctx.fillRect(-28, -5, 56, 10);
      }
    }
    this.drawFieldEventResponseIdentity(ctx,'supplyDrop',0,-43,20);
    ctx.restore();
  }

  private drawHeroMeterIdentityHud(ctx:CanvasRenderingContext2D,x:number,y:number,size:number):void {
    if(!this.heroMeterIdentityAtlasReady||!this.heroMeterIdentityAtlasImage)return;
    const icon=heroMeterIdentityIcon(this.hero.profileId),active=this.heroMeter.activeTimer>0;
    ctx.save();ctx.globalAlpha=.96;
    if(active){ctx.shadowColor=icon.accent;ctx.shadowBlur=9;ctx.strokeStyle=icon.accent;ctx.lineWidth=2;ctx.strokeRect(x-2,y-2,size+4,size+4);}
    ctx.drawImage(this.heroMeterIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);
    if(active){ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,255,255,.88)';ctx.lineWidth=1;ctx.strokeRect(x-.5,y-.5,size+1,size+1);}
    ctx.restore();
  }

  private updateArcaneCombo(): void {
    const evolvedSpells = (Object.keys(this.spells.levels) as SpellId[]).filter((id) => this.spells.levels[id] >= 5);
    const legendaryIds = [this.equipmentState.weapon, this.equipmentState.armor].filter((item): item is NonNullable<typeof item> => item?.legendary === true).map((item) => item.id);
    const synergyIds = activeSynergies({ heroId: this.hero.profileId, traitId: this.selectedTrait, relicId: this.activeRelic, equipment: this.equipmentState }).map((entry) => entry.id);
    const previousTier = this.comboRuntime.current.tier;
    this.comboRuntime.update(analyzeArcaneCombo({
      heroId: this.hero.profileId, evolvedSpells, legendaryIds, relicId: this.activeRelic, traitId: this.selectedTrait, synergyIds,
      meterActive: this.heroMeter.activeTimer > 0, coreHpRatio: this.core.hp / Math.max(1, this.core.maxHp), objectiveStreak: this.objectiveRuntime.stats.currentStreak,
    }));
    if (this.comboRuntime.current.tier > previousTier && this.comboRuntime.current.tier > 0) {
      this.showArcaneComboEventToast(`ARCANE ${this.comboRuntime.current.label} · ${this.comboRuntime.current.name}`, this.comboRuntime.current.family as ArcaneComboIdentityId);
    }
  }

  private drawArcaneComboHud(ctx: CanvasRenderingContext2D): void {
    const combo = this.comboRuntime.current;
    if (combo.tier <= 0 || combo.family === 'none') return;
    const accent = combo.tier === 3 ? '#ffe07a' : combo.tier === 2 ? '#9fdcff' : '#cab5ff';
    ctx.save(); ctx.fillStyle = 'rgba(6,11,20,.82)'; ctx.fillRect(36, 306, 276, 34);
    ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.strokeRect(36, 306, 276, 34);
    const hasIdentity = this.drawArcaneComboIdentityHud(ctx, combo.family, combo.tier as 1|2|3, 47, 313, 20);
    ctx.fillStyle = accent; ctx.font = '900 12px system-ui'; ctx.textAlign = 'left'; ctx.fillText(`ARCANE ${combo.label}`, hasIdentity ? 76 : 48, 328);
    ctx.fillStyle = '#eef6ff'; ctx.textAlign = 'right'; ctx.fillText(combo.name, 300, 328); ctx.restore();
  }

  private drawArcaneComboIdentityHud(ctx:CanvasRenderingContext2D,family:ArcaneComboIdentityId,tier:1|2|3,x:number,y:number,size:number):boolean {
    if(!this.arcaneComboIdentityAtlasReady||!this.arcaneComboIdentityAtlasImage)return false;
    const icon=arcaneComboIdentityIcon(family),badge=arcaneComboTierBadge(tier);
    ctx.save();ctx.globalAlpha=.96;ctx.drawImage(this.arcaneComboIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);
    if(badge){const bw=badge==='III'?13:9,bh=9,bx=x+size-bw+2,by=y+size-bh+2;ctx.fillStyle='rgba(5,9,18,.96)';ctx.fillRect(bx,by,bw,bh);ctx.strokeStyle=icon.accent;ctx.lineWidth=1;ctx.strokeRect(bx+.5,by+.5,bw-1,bh-1);ctx.fillStyle='#fff';ctx.font='900 6px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(badge,bx+bw/2,by+bh/2+.5);}
    ctx.restore();return true;
  }

  private syncBossEncounter(): void {
    const boss = this.enemies.enemies.find((enemy) => enemy.alive && enemy.type === 'boss');
    if (!boss) {
      if (this.bossEncounter.activeBossId !== null) {
        this.bossEncounterNodesDestroyed += this.bossEncounter.destroyedNodes;
        this.bossEncounter.reset();
        this.lastBossEncounterDestroyedNodes = 0;
        this.bossArena.reset();
        this.arenaDodgeTracker = createArenaDodgeTracker();
        this.mythicLastLawBossId = null;
        this.mythicPhaseBossId = null;
        this.lastMythicPhase = 0;
        this.mythicTacticBoostUntilMs = 0;
        this.mythicTacticBossDamageMultiplier = 1;
        this.mythicTacticAttackLink = null;
        this.enemies.setBossEncounterModifiers(this.endlessBossEncounterModifiers(this.bossEncounter.modifiers));
      }
      return;
    }
    if (this.bossEncounter.activeBossId === boss.id) return;
    if (this.bossEncounter.activeBossId !== null) this.bossEncounterNodesDestroyed += this.bossEncounter.destroyedNodes;
    this.bossEncounter.begin(boss.id, boss.bossArchetype ?? 'inferno', boss.pos, boss.bossVariantTier ?? 0);
    this.lastBossEncounterDestroyedNodes = 0;
    this.endlessBossStartedAt = this.elapsed;
    this.endlessBossCoreHpAtStart = this.core.hp;
    this.endlessBossKey = boss.bossArchetype ?? 'inferno';
    this.bossArena.reset();
    this.arenaDodgeTracker = createArenaDodgeTracker();
    this.mythicLastLawBossId = null;
    this.mythicPhaseBossId = null;
    this.lastMythicPhase = 0;
    this.mythicTacticBoostUntilMs = 0;
    this.mythicTacticBossDamageMultiplier = 1;
    this.mythicTacticAttackLink = null;
    this.enemies.setBossEncounterModifiers(this.endlessBossEncounterModifiers(this.bossEncounter.modifiers));
    const bossOrdinal = boss.bossOrdinal ?? this.bossesKilled;
    const mythic = mythicBossProfile(this.elapsed, this.runThreatLevel, bossOrdinal);
    const mutation = createBossArenaMutation(boss.bossArchetype ?? 'inferno', this.endlessState.ascension.tier, bossOrdinal);
    if (mythic.active) { this.mythicPhaseBossId=boss.id; this.lastMythicPhase=1; this.showEventToast(`${mythic.label} · ${mythic.channels.length}중 패턴 결합`,null,null,null,null,null,null,null,[],null,mutation?.kind ?? null,{mythicPhase:1,bossArchetype:boss.bossArchetype??'inferno'}); }
    else { const variantTier=boss.bossVariantTier??0; const secondary=boss.isApex?boss.apexSecondaryArchetype:null; this.showEventToast(mutation ? `보스 전장 변이 · ${mutation.label}` : '보스 전장전 · 약점을 파괴하세요', null, null, null, null, null, null, null, [], null, mutation?.kind ?? null,{bossArchetype:boss.bossArchetype??'inferno',...(variantTier>0?{bossVariantTier:variantTier}:{}),...(secondary?{apexSecondaryArchetype:secondary}:{})}); }
  }

  private syncBossWeakpointBreakFeedback(): void {
    const total=this.bossEncounter.nodes.length;
    const previousDestroyed=this.lastBossEncounterDestroyedNodes;
    const destroyed=this.bossEncounter.destroyedNodes;
    this.lastBossEncounterDestroyedNodes=destroyed;
    if(total<=0)return;
    const completed=this.bossEncounter.destroyedNodes===total;
    const finalBreak=completed&&previousDestroyed<total;
    if(!finalBreak)return;
    const archetype=this.bossEncounter.archetype??'inferno';
    const breakCenter=this.bossEncounter.nodes.reduce((sum,node)=>({x:sum.x+node.pos.x,y:sum.y+node.pos.y}),{x:0,y:0});
    breakCenter.x/=total;breakCenter.y/=total;
    const breakKind=this.bossEncounter.nodes[0]?.kind;
    if(breakKind)this.queueBossWeakpointBreakWorldVfx(breakKind,breakCenter.x,breakCenter.y);
    this.queueBossCounterplayRewardBurstVfx(archetype,breakCenter.x,breakCenter.y);
    const breakIdentity=bossWeakpointBreakIdentityIcon(archetype);
    const benefit=bossCounterplayBenefitIdentityIcon(archetype);
    this.showEventToast(`${breakIdentity.label} · ${benefit.label}`,null,null,null,null,null,null,null,[],null,null,{bossWeakpointBreakArchetype:archetype});
  }

  private updateBossArena(dt: number): void {
    const boss = this.enemies.enemies.find((enemy) => enemy.alive && enemy.type === 'boss');
    if (!boss) return;
    const hpRatio = boss.hp / Math.max(1, boss.maxHp);
    const phase = bossPhaseForRatio(hpRatio);
    const archetype = boss.bossArchetype ?? 'inferno';
    if (this.mythicTacticBoostUntilMs > 0 && this.elapsed*1000 >= this.mythicTacticBoostUntilMs) {
      this.mythicTacticBoostUntilMs = 0;
      this.mythicTacticBossDamageMultiplier = 1;
      this.mythicTacticAttackLink = null;
      this.enemies.setBossEncounterModifiers(this.endlessBossEncounterModifiers(this.bossEncounter.modifiers));
    }
    if (boss.isMythic) {
      const mythic = mythicBossProfile(this.elapsed, this.runThreatLevel, boss.bossOrdinal ?? this.bossesKilled);
      const total = this.bossEncounter.nodes.length;
      const alive = this.bossEncounter.nodes.filter((node) => node.alive).length;
      const weakpointRatio=total>0?alive/total:0;
      const activePhase=mythicPhaseProfile(mythic,hpRatio,weakpointRatio);
      if(this.mythicPhaseBossId!==boss.id){this.mythicPhaseBossId=boss.id;this.lastMythicPhase=activePhase.phase;}
      else if(activePhase.phase>this.lastMythicPhase&&activePhase.phase>0){this.lastMythicPhase=activePhase.phase;const message=activePhase.phase===2?'MYTHIC PHASE II · 압박 격화':'MYTHIC PHASE III · 최종 폭주';this.showMythicPhaseEventToast(message,activePhase.phase as MythicPhaseIdentityId);}
      const lastLaw = mythicLastLawIdentityProfile(mythic, archetype, hpRatio, weakpointRatio);
      if (lastLaw.active && this.mythicLastLawBossId !== boss.id) {
        this.mythicLastLawBossId = boss.id;
        this.showEventToast(`${lastLaw.label} · 약점 파괴로 최종 압박 완화`, lastLaw.lawId);
        this.presentation.emitTelegraph({ x:boss.pos.x, y:boss.pos.y, radius:Math.max(90,boss.radius*2.4), color:lastLaw.accent, ttl:1.2, width:6, alpha:.95 });
      }
    }
    const baseMutation = bossArenaMutationModifiers(createBossArenaMutation(archetype, this.endlessState.ascension.tier, boss.bossOrdinal ?? this.bossesKilled));
    const totalNodes = this.bossEncounter.nodes.length;
    const destroyedRatio = totalNodes > 0 ? this.bossEncounter.nodes.filter((node) => !node.alive).length / totalNodes : 0;
    const mutation = boss.isMythic ? mythicArenaIdentityProfile(archetype, baseMutation, destroyedRatio).modifiers : baseMutation;
    const geometry = boss.isMythic ? mythicArenaGeometryProfile(archetype, destroyedRatio) : null;
    const safeZone = boss.isMythic ? this.currentMythicSafeZone(boss, destroyedRatio) : null;
    const safeDt=Math.max(0,dt);
    const expiringHazards=this.bossArena.hazards.filter((hazard)=>hazard.telegraph<=0&&hazard.ttl>0&&hazard.ttl-safeDt<=0).map((hazard)=>({kind:hazard.kind,pos:{...hazard.pos},radius:hazard.radius,geometryShape:hazard.geometryShape,angle:hazard.angle,length:hazard.length}));
    const bossFacing=normalize({x:this.hero.pos.x-boss.pos.x,y:this.hero.pos.y-boss.pos.y});
    const bossRebase=bossGroundOriginRebasePresentation(boss.bossGroundOriginRebase,this.presentationSettings.reducedMotion);
    const bossLaunch=bossSpecialLaunchOriginPresentation({archetype,phase,radius:boss.radius,facingX:bossFacing.x,facingY:bossFacing.y,specialTimer:boss.specialTimer??99,rebaseOffsetX:bossRebase.groundOffsetX,rebaseOffsetY:bossRebase.groundOffsetY,handoffStrength:boss.bossSpecialOriginHandoff?.strength??0},this.presentationSettings.reducedMotion);
    const bossLaunchOrigin={x:boss.pos.x+bossLaunch.hazardOriginOffsetX,y:boss.pos.y+bossLaunch.hazardOriginOffsetY};
    this.bossArena.update(dt, { bossPos: boss.pos, heroPos: this.hero.pos, visualLaunchOrigin:bossLaunchOrigin, archetype, phase, variantTier: boss.bossVariantTier ?? 0, mutation, ...(geometry ? { geometry } : {}) });
    for(const hazard of expiringHazards){this.queueBossHazardAftermathVfx(hazard.kind,hazard.pos.x,hazard.pos.y,hazard.radius);this.attachBossHazardClearedGeometry(hazard.geometryShape,hazard.angle,hazard.length);}
    const safePreference = safeZone?.active ? { target:safeZone.center, radius:safeZone.radius, weight:safeZone.preferenceWeight } : null;
    const currentSafeLane = boss.isMythic ? mythicSafeLaneHint(this.bossArena.hazards, this.hero.pos, this.hero.radius, LOGICAL_WIDTH, LOGICAL_HEIGHT, safePreference) : null;
    this.safeLaneLink = advanceSafeLaneLink(this.safeLaneLink, this.hero.pos, currentSafeLane, this.elapsed * 1000);
    const dodgeStep = advanceArenaDodgeTracker(this.arenaDodgeTracker, this.bossArena.hazards, this.hero.pos, this.hero.radius, this.elapsed * 1000);
    this.arenaDodgeTracker = dodgeStep.state;
    if (dodgeStep.reward) {
      const previousEvadeCount = this.arenaDodgeChain.count;
      this.arenaDodgeChain = recordArenaDodgeChain(this.arenaDodgeChain, this.elapsed * 1000);
      const chainReward = arenaDodgeChainReward(this.arenaDodgeChain.count);
      this.finalFormFlow = { ...this.finalFormFlow, expiresAtMs: Math.max(this.finalFormFlow.expiresAtMs, this.elapsed * 1000 + dodgeStep.reward.flowRetentionMs + chainReward.flowRetentionBonusMs) };
      this.endlessState.signature = { ...this.endlessState.signature, charge: clamp(this.endlessState.signature.charge + dodgeStep.reward.signatureCharge + chainReward.signatureChargeBonus, 0, 100) };
      this.arenaEvadeBoostUntilMs = this.elapsed * 1000 + dodgeStep.reward.evadeBoostMs + chainReward.boostBonusMs;
      this.arenaEvadeMoveMultiplier = Math.min(1.08, dodgeStep.reward.moveSpeedMultiplier * chainReward.moveSpeedBonusMultiplier);
      this.showPerfectEvadeEventToast(`${dodgeStep.reward.label} ×${this.arenaDodgeChain.count} · FLOW 유지`,this.arenaDodgeChain.count);
      this.queueHeroResponseVfx('perfectEvade',1);
      this.queuePerfectEvadeTrailVfx(this.hero.facing.x,this.hero.facing.y);
      this.feedback.addImpact(this.hero.pos, 'final');
      if (shouldTriggerArenaDodgeFinisher(previousEvadeCount, this.arenaDodgeChain.count)) {
        const finalFormId = this.currentHeroFinalForm()?.id ?? null;
        if (finalFormId) this.showFinalFormIdentityCue(finalFormId,1.2);
        const finisher = finalFormEvadeFinisher(finalFormId, arenaDodgeFinisherProfile());
        const finisherSignature = finalFormId ? finalFormFinisherSignature(finalFormId) : null;
        const damage = 68 * this.hero.spellPower * this.hero.equipmentSpellPower * finisher.damageMultiplier;
        const outside: Array<{ enemy:Enemy; distance:number }> = [];
        for (const enemy of this.enemies.enemies) {
          if (!enemy.alive) continue;
          const enemyDistance = distance(enemy.pos, this.hero.pos);
          if (enemyDistance <= finisher.radius + enemy.radius) {
            this.enemies.damage(enemy, damage);
            this.enemies.pushAway(enemy, this.hero.pos, finisher.pushDistance);
            this.enemies.applySlow(enemy, finisher.slowFactor, finisher.slowDuration);
          } else if (finisher.chainTargets > 0 && enemyDistance <= finisher.radius * 1.65 + enemy.radius) {
            outside.push({ enemy, distance:enemyDistance });
          }
        }
        if (finisher.chainTargets > 0) {
          outside.sort((a,b)=>a.distance-b.distance);
          for (const { enemy } of outside.slice(0,finisher.chainTargets)) {
            this.enemies.damage(enemy, damage * .55);
            this.enemies.applySlow(enemy, Math.max(.68,finisher.slowFactor), Math.max(.5,finisher.slowDuration*.65));
          }
        }
        if (finisher.coreHealPercent > 0) this.core.hp = Math.min(this.core.maxHp, this.core.hp + this.core.maxHp * finisher.coreHealPercent);
        this.endlessState.signature = { ...this.endlessState.signature, charge: clamp(this.endlessState.signature.charge + finisher.signatureChargeBonus, 0, 100) };
        const finisherFeedback = finalFormFinisherFeedback(finalFormId, finisher);
        const finisherPalette = finalFormId ? finalFormAudioPalette(finalFormId) : null;
        const primaryAccent = finisherPalette?.primary ?? finisher.accent;
        const formAngle = finisherSignature?.angleOffset ?? 0;
        const ringScale = finisherSignature?.ringScale ?? 1;
        const secondaryAccent = finisherPalette?.secondary ?? finisherSignature?.secondaryAccent ?? finisherFeedback.accent;
        for (let ring=0; ring<finisherFeedback.ringCount; ring++) this.presentation.emitTelegraph({ x:this.hero.pos.x, y:this.hero.pos.y, radius:(finisher.radius + ring*finisherFeedback.ringStep)*ringScale, color:ring%2===0?primaryAccent:secondaryAccent, ttl:Math.min(.5,finisherFeedback.ttl+ring*.035), width:5-ring*.7, alpha:.86-ring*.12 });
        for (let i=0;i<finisherFeedback.particleCount;i++) { const sides=finisherSignature?.particleSides ?? finisherFeedback.particleCount; const spoke=i%Math.max(1,sides); const a=Math.PI*2*spoke/Math.max(1,sides)+formAngle+(Math.floor(i/Math.max(1,sides))*.09); const speed=finisherFeedback.particleSpeed*(.82+(i%3)*.09); this.presentation.emitParticle({x:this.hero.pos.x,y:this.hero.pos.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,color:i%2===0?primaryAccent:secondaryAccent,ttl:finisherFeedback.ttl,size:2.8+(i%2)*1.2,alpha:.82}); }
        for (let i=0;i<finisherFeedback.trailCount;i++) { const skew=finisherSignature?.trailSkew ?? 0; const a=Math.PI*2*i/Math.max(1,finisherFeedback.trailCount)+formAngle+skew*(i%2===0?1:-1); const len=finisher.radius*(.55+(i%2)*.16); this.presentation.emitTrail({x1:this.hero.pos.x,y1:this.hero.pos.y,x2:this.hero.pos.x+Math.cos(a)*len,y2:this.hero.pos.y+Math.sin(a)*len,color:i%2===0?primaryAccent:secondaryAccent,ttl:finisherFeedback.ttl*.8,width:2.4,alpha:.72}); }
        this.feedback.addImpact(this.hero.pos, finisherFeedback.shake >= 4 ? 'final' : 'awakened');
        this.showEventToast(`${finisher.label} · ${finisher.family.toUpperCase()}${finisherSignature?` · ${finisherSignature.labelSuffix}`:''} · PERFECT ×5`);
        this.audio.play(finisherFeedback.soundKind, undefined, finisherPalette?.audio);
      }
      const safeLinkStep = consumeSafeLanePerfectEvade(this.safeLaneLink, this.currentHeroFinalForm()?.id ?? null, this.elapsed * 1000);
      this.safeLaneLink = safeLinkStep.state;
      if (safeLinkStep.reward) {
        const safeReward = safeLinkStep.reward;
        this.finalFormFlow = {
          ...this.finalFormFlow,
          streak:Math.min(5,this.finalFormFlow.streak + safeReward.flowStackBonus),
          expiresAtMs:Math.max(this.finalFormFlow.expiresAtMs,this.elapsed*1000+safeReward.flowRetentionMs),
        };
        this.endlessState.signature = { ...this.endlessState.signature, charge:clamp(this.endlessState.signature.charge + safeReward.signatureChargeBonus,0,100) };
        this.arenaEvadeBoostUntilMs = Math.max(this.arenaEvadeBoostUntilMs,this.elapsed*1000+safeReward.boostMs);
        this.arenaEvadeMoveMultiplier = Math.min(1.09,Math.max(this.arenaEvadeMoveMultiplier,safeReward.moveSpeedMultiplier));
        this.showEventToast(`SAFE LINK · FLOW ×${this.finalFormFlow.streak}`);
        this.feedback.addImpact(this.hero.pos,'awakened');
        if (boss.isMythic && safeZone) {
          const tactic = mythicTacticReward(archetype,true,destroyedRatio,safeZone.phase);
          if (tactic) {
            this.mythicTacticBoostUntilMs = this.elapsed*1000 + tactic.durationMs;
            this.mythicTacticBossDamageMultiplier = tactic.bossDamageTakenMultiplier;
            this.mythicTacticAttackLink = createMythicTacticAttackLink(archetype, this.elapsed*1000, tactic.durationMs);
            this.endlessState.signature = { ...this.endlessState.signature, charge:clamp(this.endlessState.signature.charge+tactic.signatureChargeBonus,0,100) };
            this.finalFormFlow = { ...this.finalFormFlow, expiresAtMs:Math.max(this.finalFormFlow.expiresAtMs,this.elapsed*1000+tactic.flowRetentionMs) };
            this.enemies.setBossEncounterModifiers(this.endlessBossEncounterModifiers(this.bossEncounter.modifiers));
            this.presentation.emitTelegraph({x:this.hero.pos.x,y:this.hero.pos.y,radius:88,color:tactic.accent,ttl:.42,width:4,alpha:.78});
            this.showEventToast(`${tactic.label} · MYTHIC TACTIC`, null, archetype);
          }
        }
      }
    }
    const arenaContact = this.bossArena.contactAt(this.hero.pos, this.hero.radius);
    const safeZoneDamage = mythicSafeZoneDamageMultiplier(safeZone, this.hero.pos);
    const hazardDamage = this.bossArena.damageAt(this.hero.pos, this.hero.radius) * dt * safeZoneDamage;
    if (hazardDamage > 0) {
      if (this.arenaDodgeChain.count > 0) this.arenaDodgeChain = breakArenaDodgeChain(this.arenaDodgeChain);
      const applied = hazardDamage * this.hero.equipmentDamageTakenMultiplier * this.runHeroDamageTakenMultiplier;
      this.hero.hp = Math.max(0, this.hero.hp - applied);
      if(applied>0)this.queueHeroResponseVfx('hit',.84);
      this.damageReasonState = recordDamageReason(this.damageReasonState, 'arena', applied, this.hero.maxHp, this.elapsed);
      if (arenaContact.hit && safeZoneDamage >= .5) {
        const shove = Math.min(48, arenaContact.penetration * .65) * dt * 8;
        this.hero.pos.x = clamp(this.hero.pos.x + arenaContact.push.x * shove, ARENA_MARGIN, LOGICAL_WIDTH - ARENA_MARGIN);
        this.hero.pos.y = clamp(this.hero.pos.y + arenaContact.push.y * shove, ARENA_MARGIN + 55, LOGICAL_HEIGHT - ARENA_MARGIN);
        this.finalFormMotion = { x:this.finalFormMotion.x*arenaContact.slowMultiplier, y:this.finalFormMotion.y*arenaContact.slowMultiplier };
        this.terrain.resolveHero(this.hero);
      }
    }
  }

  private drawEnemySpawnLaneReadability(ctx:CanvasRenderingContext2D):void {
    if(!this.worldVfxLayerAllowed('enemy-spawn-lane'))return;
    const cues=enemySpawnLaneCues({portals:this.enemies.spawnLanePresentationViews(),heroPos:this.hero.pos,corePos:this.core.pos,width:LOGICAL_WIDTH,height:LOGICAL_HEIGHT,quality:this.presentation.quality,combatPrimary:this.currentCombatAttentionPolicy().primary});
    const stackedCues=spawnLaneEdgeStackArbitration({cues,width:LOGICAL_WIDTH,height:LOGICAL_HEIGHT});
    const countDebounce=spawnLaneEdgeCountDownwardDebounce(this.spawnLaneEdgeCountDebounceMemory,stackedCues,this.elapsed);this.spawnLaneEdgeCountDebounceMemory=countDebounce.memory;
    for(let cueIndex=0;cueIndex<stackedCues.length;cueIndex++){const cue=stackedCues[cueIndex]!,displayCount=countDebounce.counts[cueIndex]??cue.count;
      const dx=cue.end.x-cue.start.x,dy=cue.end.y-cue.start.y,len=Math.hypot(dx,dy);if(len<1)continue;const nx=dx/len,ny=dy/len;
      const start={x:cue.start.x+nx*28,y:cue.start.y+ny*28},end={x:cue.end.x-nx*64,y:cue.end.y-ny*64};
      const alpha=cue.alpha*this.worldVfxCueAlpha('tactical',cue.start.x,cue.start.y,80);if(alpha<=0)continue;
      const accent=cue.kind==='boss'?'#ff6d78':cue.kind==='elite'?'#ffd36a':cue.kind==='specialist'?'#bb8cff':'#8fb7d8';
      ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=accent;ctx.fillStyle=accent;ctx.lineWidth=cue.kind==='boss'?3:2;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.lineTo(end.x,end.y);ctx.stroke();ctx.setLineDash([]);
      const angle=Math.atan2(dy,dx),arrow=cue.kind==='boss'?12:9;ctx.beginPath();ctx.moveTo(end.x,end.y);ctx.lineTo(end.x-Math.cos(angle-.55)*arrow,end.y-Math.sin(angle-.55)*arrow);ctx.lineTo(end.x-Math.cos(angle+.55)*arrow,end.y-Math.sin(angle+.55)*arrow);ctx.closePath();ctx.fill();
      const labelFade=spawnLaneEdgeLabelFade({...cue,count:displayCount});const debouncedLabelVisible=displayCount>1&&(cue.labelVisible||displayCount>cue.count);if(debouncedLabelVisible&&labelFade.visible){ctx.globalAlpha=labelFade.labelAlpha*this.worldVfxCueAlpha('tactical',cue.start.x,cue.start.y,80);ctx.font='700 11px system-ui';ctx.textAlign='center';ctx.fillText(`×${displayCount}`,cue.labelPos.x,cue.labelPos.y);}ctx.restore();
    }
  }

  private updateBossSafeResponseWindowConfirmation():void {
    const boss=this.enemies.enemies.find((enemy)=>enemy.alive&&enemy.type==='boss')??null;
    if(!boss){this.bossSafeResponseWindowUntil=0;this.bossSafeResponseBossId=null;this.bossSafeResponseCycle=null;this.bossSafeResponseShownCycle=null;this.bossSafeResponseSlotMemory=null;return;}
    const cycle=boss.bossCycle??0;
    if(this.bossSafeResponseBossId!==null&&this.bossSafeResponseBossId!==boss.id){this.bossSafeResponseWindowUntil=0;this.bossSafeResponseBossId=null;this.bossSafeResponseCycle=null;this.bossSafeResponseShownCycle=null;this.bossSafeResponseSlotMemory=null;}
    if(this.bossResponseAckBossId===boss.id&&this.bossResponseAckCycle!==null&&cycle===this.bossResponseAckCycle+1){this.bossSafeResponseBossId=boss.id;this.bossSafeResponseCycle=cycle;}
    if(this.bossSafeResponseBossId!==boss.id||this.bossSafeResponseCycle!==cycle||this.bossSafeResponseShownCycle===cycle)return;
    const dangerProjectileCount=dangerProjectileCues(this.enemies.projectileThreatViews(),this.hero.pos,this.core.pos,6).filter((cue)=>cue.level!=='watch').length;
    const result=bossSafeResponseWindowConfirmation({bossId:boss.id,currentCycle:cycle,ackBossId:this.bossSafeResponseBossId,ackCycle:cycle-1,specialTimer:boss.specialTimer??0,heroCritical:this.dangerState.heroCritical,coreCritical:this.dangerState.coreCritical,damageSeverity:this.damageReasonState?.severity??null,dangerProjectileCount});
    if(result.confirmed){this.bossSafeResponseWindowUntil=this.elapsed+result.visualSeconds;this.bossSafeResponseShownCycle=cycle;}
  }

  // Canonical boss safe-response label retained for source-contract continuity: 대응 여유
  private drawBossSafeResponseWindowConfirmation(ctx:CanvasRenderingContext2D):void {
    const active=this.elapsed<this.bossSafeResponseWindowUntil;
    const boss=this.enemies.enemies.find((enemy)=>enemy.alive&&enemy.type==='boss'&&enemy.id===this.bossSafeResponseBossId)??null;if(!boss)return;
    const visibleAffordance=bossSafeResponseVisibleAffordance({bossId:boss.id,currentCycle:boss.bossCycle??0,bossSpecialTimer:boss.specialTimer??99,actionAssistPresent:Boolean(this.bossActionAssistCue),actionAssistBossId:this.bossActionAssistBossId,actionAssistAge:Math.max(0,this.elapsed-this.bossActionAssistCueSince),responseAckPresent:Boolean(this.bossResponseAckAction),responseAckBossId:this.bossResponseAckBossId,responseAckCycle:this.bossResponseAckCycle,responseAckAge:Math.max(0,this.elapsed-this.bossResponseAckSince),responseAckAssetReady:this.bossResponseAckIdentityAtlasReady&&Boolean(this.bossResponseAckIdentityAtlasImage)});
    const presentation=bossSafeResponseCompactAcknowledgement({active,quality:this.presentation.quality,actionAssistVisible:visibleAffordance.actionAssistVisible,responseAckVisible:visibleAffordance.responseAckVisible,heroCritical:this.dangerState.heroCritical,coreCritical:this.dangerState.coreCritical});
    if(presentation.mode==='hidden')return;
    const placementInput={bossPos:boss.pos,bossRadius:boss.radius,heroPos:this.hero.pos,corePos:this.core.pos,width:LOGICAL_WIDTH,height:LOGICAL_HEIGHT,extraProtected:this.currentWorldVfxProtectedAnchors()};
    const strictLabelPlacement=bossSafeResponseLabelPlacement(placementInput);
    const slotHysteresis=bossSafeResponseSlotHysteresis({previous:this.bossSafeResponseSlotMemory,current:strictLabelPlacement,placementInput,bossId:boss.id,cycle:boss.bossCycle??0,now:this.elapsed});this.bossSafeResponseSlotMemory=slotHysteresis.memory;const labelPlacement=slotHysteresis.placement;
    const alpha=this.worldVfxLayerAlpha('tactical')*(this.presentationSettings.reducedFlash?.58:presentation.ringAlpha);if(alpha<=0)return;
    ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle='#79e6b4';ctx.fillStyle='#b8f7dc';ctx.lineWidth=presentation.mode==='compact'?2:2.5;ctx.setLineDash([8,6]);ctx.beginPath();ctx.arc(boss.pos.x,boss.pos.y,boss.radius+24,Math.PI*.12,Math.PI*.88);ctx.stroke();ctx.setLineDash([]);
    const showPlacedLabel=presentation.showLabel&&labelPlacement.visible;if(presentation.showLabel){if(showPlacedLabel){ctx.font='700 12px system-ui';ctx.textAlign='center';ctx.fillText(presentation.label,labelPlacement.pos.x,labelPlacement.pos.y);}}
    ctx.restore();
  }

  private drawProjectileThreatVisibility(ctx:CanvasRenderingContext2D):void {
    const projectiles=this.enemies.projectileThreatViews();
    const boss=this.enemies.enemies.find((enemy)=>enemy.alive&&enemy.type==='boss')??null;
    const policy=combatAttentionPolicy({heroCritical:this.dangerState.heroCritical,coreCritical:this.dangerState.coreCritical,damageSeverity:this.damageReasonState?.severity??null,bossSpecialTimer:boss?.specialTimer??99,reducedFlash:this.presentationSettings.reducedFlash,
      reducedMotion:this.presentationSettings.reducedMotion,bossCountdown:this.enemies.bossCountdown});
    const ultraCritical=ultraLongCriticalFocus({elapsedSeconds:this.elapsed,bossActive:Boolean(boss),mythicActive:Boolean(boss?.isMythic),heroCritical:this.dangerState.heroCritical,coreCritical:this.dangerState.coreCritical});
    const completeBuild=(this.equipmentState.weapon?.rank??0)>=5&&(this.equipmentState.armor?.rank??0)>=5&&Boolean(this.activeRelic)&&this.fusionRuntime.equipped.length>=2;
    const fourEightPriority=fourEightHourPriorityFocus({elapsedSeconds:this.elapsed,completeBuild,bossActive:Boolean(boss),mythicActive:Boolean(boss?.isMythic),finalFormActive:Boolean(this.currentHeroFinalForm()),heroCritical:this.dangerState.heroCritical,coreCritical:this.dangerState.coreCritical});
    const eightTwelvePriority=eightTwelveHourHudFocus({elapsedSeconds:this.elapsed,completeBuild,bossActive:Boolean(boss),mythicActive:Boolean(boss?.isMythic),finalFormActive:Boolean(this.currentHeroFinalForm()),heroCritical:this.dangerState.heroCritical,coreCritical:this.dangerState.coreCritical});
    const cues=dangerProjectileCues(projectiles,this.hero.pos,this.core.pos,Math.min(policy.maxProjectileCues,ultraCritical.maxProjectileCues,fourEightPriority.maxProjectileCues,eightTwelvePriority.maxProjectileCues));
    for(const cue of cues){
      const p=projectiles[cue.index]; if(!p)continue;
      const speed=Math.hypot(p.vel.x,p.vel.y)||1,nx=p.vel.x/speed,ny=p.vel.y/speed;
      ctx.save();ctx.globalAlpha=cue.level==='critical'?.9:cue.level==='danger'?.72:.48;ctx.strokeStyle=cue.accent;ctx.lineWidth=cue.level==='critical'?3:2;
      const cuePos=p.visualPos??p.pos;ctx.beginPath();ctx.moveTo(cuePos.x,cuePos.y);ctx.lineTo(cuePos.x-nx*cue.trailLength,cuePos.y-ny*cue.trailLength);ctx.stroke();
      ctx.beginPath();ctx.arc(cuePos.x,cuePos.y,p.radius+cue.radiusBoost,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
  }

  private drawEdgeThreatVfx(ctx:CanvasRenderingContext2D):void {
    const projectiles=this.enemies.projectileThreatViews();
    const cues=dangerProjectileCues(projectiles,this.hero.pos,this.core.pos,3).filter((cue)=>cue.level!=='watch');
    if(cues.length===0)return;
    ctx.save();
    for(const cue of cues){
      const projectile=projectiles[cue.index]; if(!projectile)continue;
      const profile=edgeThreatVfxProfile(cue.level,cue.target);
      const indicator=edgeThreatIndicator(projectile.visualPos??projectile.pos,LOGICAL_WIDTH,LOGICAL_HEIGHT);
      ctx.globalAlpha=this.presentationSettings.reducedFlash?profile.alpha*.62:profile.alpha; ctx.fillStyle=profile.color;
      const length=48+profile.segmentCount*18,thickness=profile.thickness;
      for(let i=0;i<profile.segmentCount;i++){
        const offset=(i-(profile.segmentCount-1)/2)*(thickness+4);
        if(indicator.edge==='left'||indicator.edge==='right'){const y=indicator.position*LOGICAL_HEIGHT+offset;const x=indicator.edge==='left'?indicator.inset:LOGICAL_WIDTH-indicator.inset-thickness;ctx.fillRect(x,y-length/2,thickness,length);}
        else {const x=indicator.position*LOGICAL_WIDTH+offset;const y=indicator.edge==='top'?indicator.inset:LOGICAL_HEIGHT-indicator.inset-thickness;ctx.fillRect(x-length/2,y,length,thickness);}
      }
    }
    ctx.restore();
  }

  private drawAutoTargetVisibility(ctx: CanvasRenderingContext2D): void {
    if (!this.autoCastNormal) return;
    const target = this.autoTargetId===null?null:this.enemies.enemies.find((enemy)=>enemy.alive&&enemy.id===this.autoTargetId)??null;
    const cue = autoTargetIndicator(target, this.hero.pos, this.core.pos);
    if (!target || !cue) return;
    const boss=this.enemies.enemies.find((enemy)=>enemy.alive&&enemy.type==='boss')??null;
    const policy=combatAttentionPolicy({heroCritical:this.dangerState.heroCritical,coreCritical:this.dangerState.coreCritical,damageSeverity:this.damageReasonState?.severity??null,bossSpecialTimer:boss?.specialTimer??99,reducedFlash:this.presentationSettings.reducedFlash,
      reducedMotion:this.presentationSettings.reducedMotion,bossCountdown:this.enemies.bossCountdown});
    const primaryWeakpointId=primaryWeakpointNode(this.bossEncounter.nodes,this.hero.pos)?.id??null;
    const guidance=targetGuidanceMotionPolicy({combatPrimary:policy.primary,reducedFlash:this.presentationSettings.reducedFlash,reducedMotion:this.presentationSettings.reducedMotion,hasWeakpoint:primaryWeakpointId!==null,hasAutoTarget:true});
    const pulse=1+Math.sin(this.elapsed*8)*guidance.autoTargetMotionAmplitude;
    ctx.save(); ctx.globalAlpha=.38+.34*cue.urgency; ctx.strokeStyle=cue.accent; ctx.lineWidth=3; ctx.setLineDash([7,6]);
    ctx.beginPath(); ctx.arc(target.pos.x,target.pos.y,(target.radius+cue.radius*.35)*pulse,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
    const ultraCritical=ultraLongCriticalFocus({elapsedSeconds:this.elapsed,bossActive:Boolean(boss),mythicActive:Boolean(boss?.isMythic),heroCritical:this.dangerState.heroCritical,coreCritical:this.dangerState.coreCritical});
    if(policy.showAutoLabel&&ultraCritical.showAutoLabel){
      if(cue.specialistIntent&&this.specialistIntentAtlasReady&&this.specialistIntentAtlasImage){
        const icon=specialistIntentIcon(cue.specialistIntent),size=18,x=target.pos.x,y=target.pos.y-target.radius-43;
        ctx.globalAlpha=.92;ctx.drawImage(this.specialistIntentAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x-size/2,y-size/2,size,size);
      }
      ctx.globalAlpha=.9; ctx.fillStyle=cue.accent; ctx.font='900 10px system-ui'; ctx.textAlign='center'; ctx.fillText(cue.label,target.pos.x,target.pos.y-target.radius-22);
    } ctx.restore();
  }

  private drawDamageReasonFeedback(ctx: CanvasRenderingContext2D): void {
    const state=this.damageReasonState; if(!state)return;
    const critical=state.severity==='critical',heavy=state.severity==='heavy';
    const accent=critical?'#ff6277':heavy?'#ffb35c':'#e8f4ff';
    const alpha=Math.max(.2,Math.min(1,(state.expiresAt-this.elapsed)*2));
    const x=this.hero.pos.x,y=this.hero.pos.y-this.hero.radius-46;
    ctx.save(); ctx.globalAlpha=alpha; ctx.textAlign='center'; ctx.font=`900 ${critical?15:13}px system-ui`;
    const text=`${state.label} · -${Math.max(1,Math.round(state.amount))}`;
    const hasIcon=this.damageSourceIdentityAtlasReady&&this.damageSourceIdentityAtlasImage;
    const iconSize=critical?20:heavy?19:18;
    const width=Math.max(hasIcon?166:138,ctx.measureText(text).width+(hasIcon?52:22));
    ctx.fillStyle='rgba(8,12,20,.84)';ctx.fillRect(x-width/2,y-20,width,28);ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.strokeRect(x-width/2,y-20,width,28);
    if(hasIcon&&this.damageSourceIdentityAtlasImage){
      const icon=damageSourceIdentityIcon(state.source);
      const iconX=x-width/2+18;
      ctx.globalAlpha=alpha*.96;
      ctx.drawImage(this.damageSourceIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,iconX-iconSize/2,y-iconSize/2,iconSize,iconSize);
      ctx.globalAlpha=alpha;
    }
    ctx.fillStyle=accent;ctx.fillText(text,x+(hasIcon?10:0),y);ctx.restore();
  }

  private drawBossEncounterNodes(ctx: CanvasRenderingContext2D): void {
    const primaryWeakpointId=primaryWeakpointNode(this.bossEncounter.nodes,this.hero.pos)?.id??null;
    const boss=this.enemies.enemies.find((enemy)=>enemy.alive&&enemy.type==='boss')??null;
    const policy=combatAttentionPolicy({heroCritical:this.dangerState.heroCritical,coreCritical:this.dangerState.coreCritical,damageSeverity:this.damageReasonState?.severity??null,bossSpecialTimer:boss?.specialTimer??99,reducedFlash:this.presentationSettings.reducedFlash,
      reducedMotion:this.presentationSettings.reducedMotion,bossCountdown:this.enemies.bossCountdown});
    const autoTarget=this.autoCastNormal&&this.autoTargetId!==null?this.enemies.enemies.find((enemy)=>enemy.alive&&enemy.id===this.autoTargetId)??null:null;
    const hasAutoTarget=Boolean(autoTargetIndicator(autoTarget,this.hero.pos,this.core.pos));
    const guidance=targetGuidanceMotionPolicy({combatPrimary:policy.primary,reducedFlash:this.presentationSettings.reducedFlash,reducedMotion:this.presentationSettings.reducedMotion,hasWeakpoint:primaryWeakpointId!==null,hasAutoTarget});
    const ultraCritical=ultraLongCriticalFocus({elapsedSeconds:this.elapsed,bossActive:Boolean(boss),mythicActive:Boolean(boss?.isMythic),heroCritical:this.dangerState.heroCritical,coreCritical:this.dangerState.coreCritical});
    for (const node of this.bossEncounter.nodes) {
      if (!node.alive) continue;
      const color = node.kind === 'flamePylon' ? '#ff8a4d' : node.kind === 'summonCore' ? '#78efab' : node.kind === 'armorPlate' ? '#ffd36a' : node.kind === 'curseAnchor' ? '#cf72ff' : node.kind === 'mawSigil' ? '#ff6fa7' : '#62caff';
      ctx.save(); ctx.translate(node.pos.x, node.pos.y);
      ctx.shadowColor = color; ctx.shadowBlur = 18; ctx.fillStyle = 'rgba(11,17,26,.9)'; ctx.strokeStyle = color; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, node.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if(this.bossWeakpointWorldVfxAtlasReady&&this.bossWeakpointWorldVfxAtlasImage){const world=bossWeakpointWorldVfxSprite(node.kind,'active');const worldSize=Math.max(70,node.radius*2.7);ctx.save();ctx.globalAlpha=this.presentationSettings.reducedFlash?.42:.68;ctx.drawImage(this.bossWeakpointWorldVfxAtlasImage,world.sx,world.sy,world.sw,world.sh,-worldSize/2,-worldSize/2,worldSize,worldSize);ctx.restore();}
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (this.bossWeakpointIdentityAtlasReady && this.bossWeakpointIdentityAtlasImage) {
        const icon=bossWeakpointIdentityIcon(node.kind);
        const size=Math.max(26,Math.min(34,node.radius*1.08));
        ctx.shadowBlur=0; ctx.globalAlpha=.96;
        ctx.drawImage(this.bossWeakpointIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,-size/2,-size/2,size,size);
        ctx.globalAlpha=1; ctx.shadowColor=color; ctx.shadowBlur=18;
      } else {
        ctx.fillStyle = color; ctx.font = '900 11px system-ui';
        ctx.fillText(node.kind === 'flamePylon' ? 'PYLON' : node.kind === 'summonCore' ? 'CORE' : node.kind === 'armorPlate' ? 'PLATE' : node.kind === 'curseAnchor' ? 'CURSE' : node.kind === 'mawSigil' ? 'MAW' : 'TIME', 0, 1);
      }
      ctx.fillStyle = '#31151a'; ctx.fillRect(-node.radius, node.radius + 8, node.radius * 2, 5);
      ctx.fillStyle = color; ctx.fillRect(-node.radius, node.radius + 8, node.radius * 2 * node.hp / Math.max(1, node.maxHp), 5);
      const weakCue = weakpointIndicator(node,node.id===primaryWeakpointId);
      if (weakCue) {
        const amplitude=node.id===primaryWeakpointId?guidance.weakpointMotionAmplitude:0;
        const pulse=1+Math.sin(this.elapsed*7+node.id)*amplitude; ctx.shadowBlur=0; ctx.globalAlpha=.48+.28*weakCue.urgency; ctx.strokeStyle=weakCue.accent; ctx.lineWidth=3;
        ctx.beginPath(); ctx.arc(0,0,weakCue.radius*pulse,0,Math.PI*2); ctx.stroke();
        if(weakCue.label&&policy.showWeakpointLabel&&ultraCritical.showWeakpointLabel){ctx.globalAlpha=.92; ctx.fillStyle=weakCue.accent; ctx.font='900 10px system-ui'; ctx.fillText(weakCue.label,0,-weakCue.radius-9);}
      }
      ctx.restore();
    }
  }

  private drawBossArenaHazards(ctx: CanvasRenderingContext2D, motion: SecondaryCombatMotionPolicy): void {
    this.currentMythicSafeLanePresentation=null;
    const boss = this.enemies.enemies.find((enemy) => enemy.alive && enemy.type === 'boss');
    let safeZone: ReturnType<typeof mythicSafeZoneState> | null = null;
    let safeZoneLabelAnchor: Vec2 | null = null;
    let destroyedRatio=0;
    if (boss?.isMythic) {
      const totalNodes=this.bossEncounter.nodes.length;
      destroyedRatio=totalNodes>0?this.bossEncounter.nodes.filter((node)=>!node.alive).length/totalNodes:0;
      safeZone=this.currentMythicSafeZone(boss, destroyedRatio);
      const zoneColor = safeZone.phase === 'collapse' ? '#ffd36f' : safeZone.phase === 'collapsed' ? '#ff6f7f' : safeZone.phase === 'reform' ? '#7fd9ff' : '#78ffd1';
      const zoneCenter = safeZone.phase === 'collapsed' ? safeZone.nextCenter : safeZone.center;
      safeZoneLabelAnchor={x:zoneCenter.x,y:zoneCenter.y-safeZone.radius-10};
      ctx.save();
      ctx.strokeStyle=zoneColor; ctx.fillStyle=zoneColor; ctx.lineWidth=safeZone.phase==='collapse'?4:3;
      ctx.globalAlpha=safeZone.phase==='collapsed'?.22:safeZone.phase==='collapse'?.42:.28;
      if(safeZone.phase!=='stable')ctx.setLineDash([8,7]);
      ctx.beginPath(); ctx.arc(zoneCenter.x,zoneCenter.y,safeZone.radius,0,Math.PI*2); ctx.stroke();
      if(safeZone.active){ctx.globalAlpha*=.18;ctx.beginPath();ctx.arc(zoneCenter.x,zoneCenter.y,safeZone.radius,0,Math.PI*2);ctx.fill();}
      ctx.setLineDash([]);ctx.globalAlpha=.82;ctx.font='800 10px system-ui';ctx.textAlign='center';ctx.fillText(safeZone.phase==='collapsed'?'SAFE ZONE · REFORM':safeZone.phase==='collapse'?'SAFE ZONE · COLLAPSE':safeZone.label,zoneCenter.x,zoneCenter.y-safeZone.radius-10);ctx.restore();
    }
    const safePreference=safeZone?.active?{target:safeZone.center,radius:safeZone.radius,weight:safeZone.preferenceWeight}:null;
    const safeLane = mythicSafeLaneHint(this.bossArena.hazards, this.hero.pos, this.hero.radius, LOGICAL_WIDTH, LOGICAL_HEIGHT, safePreference);
    const encounterElapsedMs=Math.max(0,(this.elapsed-this.endlessBossStartedAt)*1000);
    const forecast=safeLaneForecast(safeLane,safeZone,encounterElapsedMs);
    this.currentMythicSafeLanePresentation=boss?.isMythic&&safeLane?{target:{...safeLane.target},confidence:safeLane.confidence,...(forecast?{forecastTarget:{...forecast.nextTarget},forecastUrgency:forecast.urgency,forecastTransitionMs:forecast.transitionMs}:{})}:null;
    const timeline=safeTelegraphTimeline(forecast,this.bossArena.hazards,this.hero.radius);
    const lawIdentity = boss?.isMythic ? mythicLastLawIdentityProfile(
      mythicBossProfile(this.elapsed,this.runThreatLevel,boss.bossOrdinal??0),
      boss.bossArchetype??'inferno',
      boss.hp/Math.max(1,boss.maxHp),
      1-destroyedRatio,
    ) : null;
    const lawTimeline = timeline ? lastLawSafeTimeline(timeline,Boolean(boss?.isMythic),boss?boss.hp/Math.max(1,boss.maxHp):1,lawIdentity?{active:lawIdentity.active,label:lawIdentity.label,accent:lawIdentity.accent}:null) : null;
    if(boss?.isMythic&&safeZone&&safeZoneLabelAnchor){
      const lawActive=Boolean(lawIdentity?.active);
      this.drawMythicSafeZoneLifecycleIcon(ctx,safeZone.phase,safeZoneLabelAnchor.x+52,safeZoneLabelAnchor.y-10,20,lawActive);
      const pressureProjection=projectMythicSafeZonePressureEffects(boss.bossArchetype??'inferno',safeZone,destroyedRatio);
      this.drawMythicSafeZonePressureHelpers(ctx,boss,pressureProjection,safeZoneLabelAnchor.x,safeZoneLabelAnchor.y+4,lawActive);
    }
    if(!safeLane){this.safeLaneForecastPromotionHysteresisState=createSafeLaneForecastPromotionHysteresisState();this.safeLaneAttentionRecoveryHysteresisState=createSafeLaneAttentionRecoveryHysteresisState();this.safeLaneAttentionRecoveryLastAt=this.elapsed;this.safeLaneHazardOcclusionRecoveryState=createSafeLaneHazardOcclusionRecoveryState();this.safeLaneGapFeatherHysteresisState=createSafeLaneGapFeatherHysteresisState();this.safeLaneHazardOcclusionRecoveryLastAt=this.elapsed;}
    const denseBattleSafeLane=denseBattleSafeLaneContinuityPresentation({hazardCount:this.bossArena.hazards.length,projectileCount:this.enemies.activeProjectileCount,bossSpecial:Boolean(boss&&Number.isFinite(boss.specialTimer)&&(boss.specialTimer??99)<=1.2)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),expiringHazardCount=this.bossArena.hazards.filter((hazard)=>hazard.telegraph<=0&&hazard.ttl<=1.2).length,battlefieldHazardReclaim=safeLaneHazardReclaimPresentation({expiringHazardCount,clearedMemoryCount:this.bossHazardClearedGroundMemory.length,occlusion:0},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
    if (safeLane) {
      const forecastDistance=forecast?Math.hypot(forecast.nextTarget.x-forecast.currentTarget.x,forecast.nextTarget.y-forecast.currentTarget.y):Infinity;
      this.safeLaneForecastPromotionHysteresisState=advanceSafeLaneForecastPromotionHysteresis(this.safeLaneForecastPromotionHysteresisState,{hasForecast:Boolean(forecast),urgency:forecast?.urgency??0,transitionMs:forecast?.transitionMs??0,targetDistance:forecastDistance});
      const safeLaneVisual=safeLaneForecastVisualCoherencePresentation({currentTarget:safeLane.target,currentConfidence:safeLane.confidence,...(forecast?{nextTarget:forecast.nextTarget,forecastUrgency:forecast.urgency,transitionMs:forecast.transitionMs}:{}),promotionOwner:this.safeLaneForecastPromotionHysteresisState.owner},this.presentationSettings.reducedFlash),safeLaneAttention=safeLaneCombatAttentionBudgetPresentation({heroCritical:this.dangerState.heroCritical,coreCritical:this.dangerState.coreCritical,lawActive:Boolean(lawIdentity?.active)},this.presentationSettings.reducedFlash),safeLaneAttentionTarget=this.dangerState.coreCritical?1:this.dangerState.heroCritical?.86:lawIdentity?.active?.72:0,safeLaneAttentionDt=this.safeLaneAttentionRecoveryLastAt<0?0:Math.max(0,this.elapsed-this.safeLaneAttentionRecoveryLastAt);this.safeLaneAttentionRecoveryHysteresisState=advanceSafeLaneAttentionRecoveryHysteresis(this.safeLaneAttentionRecoveryHysteresisState,safeLaneAttentionTarget,safeLaneAttentionDt,this.presentationSettings.reducedMotion);this.safeLaneAttentionRecoveryLastAt=this.elapsed;const safeLaneAttentionRecovery=safeLaneAttentionRecoveryPresentation(this.safeLaneAttentionRecoveryHysteresisState),safeLaneIdentity=safeLaneIdentityOwnerArbitrationPresentation({lawActive:Boolean(lawIdentity?.active),lawIdAvailable:Boolean(lawIdentity&&lawIdentity.lawId!=='none'),mythic:Boolean(boss?.isMythic),directionVisible:Boolean(safeLaneVisual.directionVisible&&safeLaneAttention.directionVisible&&safeLaneAttentionRecovery.secondaryRecovered),attentionOwner:safeLaneAttention.identityOwner}),safeLaneVisualTarget=safeLaneVisual.target,safeLaneHazardOcclusion=safeLaneHazardPathOcclusionPresentation({from:this.hero.pos,to:safeLaneVisualTarget,hazards:this.bossArena.hazards},this.presentationSettings.reducedFlash),safeLanePathGap=safeLaneHazardPathGapPresentation({from:this.hero.pos,to:safeLaneVisualTarget,hazards:this.bossArena.hazards}),safeLaneRawGap='gap' in safeLanePathGap?{start:safeLanePathGap.gap.start,end:safeLanePathGap.gap.end}:null,gapHandoff=safeLaneGapHazardHandoffPresentation({current:this.safeLaneGapFeatherHysteresisState.visible?{visible:true,start:this.safeLaneGapFeatherHysteresisState.start,end:this.safeLaneGapFeatherHysteresisState.end,release:this.safeLaneGapFeatherHysteresisState.release}:null,next:safeLaneRawGap},this.presentationSettings.reducedMotion);if(gapHandoff.resetBeforeAdvance)this.safeLaneGapFeatherHysteresisState=createSafeLaneGapFeatherHysteresisState();this.safeLaneGapFeatherHysteresisState=advanceSafeLaneGapFeatherHysteresisState(this.safeLaneGapFeatherHysteresisState,gapHandoff.nextGap,this.elapsed,this.presentationSettings.reducedMotion);const safeLaneGapFeatherState=this.safeLaneGapFeatherHysteresisState,safeLaneGapFeather=safeLaneGapFeatherPresentation({from:this.hero.pos,to:safeLaneVisualTarget,gap:safeLaneGapFeatherState.visible?{start:safeLaneGapFeatherState.start,end:safeLaneGapFeatherState.end}:null},this.presentationSettings.reducedFlash),safeLaneHazardRecoveryDt=this.safeLaneHazardOcclusionRecoveryLastAt<0?0:Math.max(0,this.elapsed-this.safeLaneHazardOcclusionRecoveryLastAt);this.safeLaneHazardOcclusionRecoveryState=advanceSafeLaneHazardOcclusionRecovery(this.safeLaneHazardOcclusionRecoveryState,{pathAlphaScale:safeLaneHazardOcclusion.pathAlphaScale,bridgeAlphaScale:safeLaneHazardOcclusion.bridgeAlphaScale},safeLaneHazardRecoveryDt,this.presentationSettings.reducedMotion);this.safeLaneHazardOcclusionRecoveryLastAt=this.elapsed;const safeLaneHazardRecovery=safeLaneHazardOcclusionRecoveryPresentation(this.safeLaneHazardOcclusionRecoveryState),safeLaneReclaim=safeLaneHazardReclaimPresentation({expiringHazardCount,clearedMemoryCount:this.bossHazardClearedGroundMemory.length,occlusion:1-safeLaneHazardOcclusion.pathAlphaScale},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),safeLaneResolution=safeLaneCanonicalResolutionPresentation({release:safeLaneReclaim.release,hazardPressure:denseBattleSafeLane.pressure,memoryCount:this.bossHazardClearedGroundMemory.length},this.presentationSettings.reducedFlash);const safeLanePriority=safeLaneOcclusionGuardPresentation({confidence:safeLane.confidence,hazardPressure:denseBattleSafeLane.pressure,projectilePressure:Math.min(1,this.enemies.activeProjectileCount/12),criticalPressure:this.dangerState.coreCritical?1:(this.dangerState.heroCritical ? .9 : 0)},this.presentationSettings.reducedFlash),battlefieldThreatBudget=battlefieldThreatLayerBudgetPresentation({projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0,criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),safeLaneSpatial=safeLaneCorridorReservationPresentation({confidence:safeLane.confidence,occlusion:1-safeLaneHazardOcclusion.pathAlphaScale,threatPressure:denseBattleSafeLane.pressure},this.presentationSettings.reducedFlash),bossSpatialFocus=bossCriticalFocusReservationPresentation({bossSpecial:Boolean(boss&&Number.isFinite(boss.specialTimer)&&(boss.specialTimer??99)<=1.2),criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),pressure:denseBattleSafeLane.pressure},this.presentationSettings.reducedFlash);const safeLaneTemporal=safeLaneAttentionHoldPresentation({confidence:safeLane.confidence,critical:this.dangerState.coreCritical||this.dangerState.heroCritical,pressure:denseBattleSafeLane.pressure,release:safeLaneAttentionRecovery.recoveryAlphaScale},this.presentationSettings.reducedFlash),safeLaneTemporalBudget=temporalThreatBudgetPresentation({churn:Math.min(1,(this.bossArena.hazards.length+this.enemies.activeProjectileCount)/14),pressure:denseBattleSafeLane.pressure,criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const safeLaneProjectileDepth=safeLaneProjectileCrossingPresentation({laneProximity:Math.min(1,this.enemies.activeProjectileCount/8),threatLevel:denseBattleSafeLane.pressure,critical:this.dangerState.coreCritical||this.dangerState.heroCritical},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),safeLaneDepthBudget=battlefieldDepthBudgetPresentation({criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),bossTelegraph:Boolean(boss&&Number.isFinite(boss.specialTimer)&&(boss.specialTimer??99)<=1.2),safeLaneVisible:true,projectilePressure:Math.min(1,this.enemies.activeProjectileCount/12),impactPressure:0,hazardPressure:denseBattleSafeLane.pressure},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const safeLaneDepthRecovery=safeLaneDepthRecoveryPresentation({laneProximity:Math.min(1,this.enemies.activeProjectileCount/8),confidence:safeLane.confidence,release:safeLaneReclaim.release,critical:this.dangerState.coreCritical||this.dangerState.heroCritical},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),safeLaneRecoveryBudget=depthRecoveryBudgetPresentation({recoveringCount:this.bossArena.hazards.length+this.enemies.activeProjectileCount,pressure:denseBattleSafeLane.pressure,criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const safeLaneEdgeDistance=Math.min(safeLaneVisualTarget.x,LOGICAL_WIDTH-safeLaneVisualTarget.x,safeLaneVisualTarget.y,LOGICAL_HEIGHT-safeLaneVisualTarget.y),safeLaneStackProtection=safeLaneEdgeClutterProtectionPresentation({edgeProximity:1-Math.min(1,safeLaneEdgeDistance/180),clutter:Math.min(1,(this.bossArena.hazards.length+this.enemies.activeProjectileCount)/14),confidence:safeLane.confidence,critical:this.dangerState.coreCritical||this.dangerState.heroCritical},this.presentationSettings.reducedFlash),safeLaneUnifiedStack=unifiedDepthStackBudgetPresentation({criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),bossTelegraphCount:this.bossArena.hazards.filter((entry)=>entry.telegraph>0).length,safeLaneVisible:true,secondaryCount:this.bossArena.hazards.length+this.enemies.activeProjectileCount,pressure:denseBattleSafeLane.pressure},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const safeLaneCorridorProtection=canonicalCorridorProtectionPresentation({safeLaneVisible:true,laneConfidence:safeLane.confidence,threatPressure:denseBattleSafeLane.pressure,edgeProximity:1-Math.min(1,safeLaneEdgeDistance/180)},this.presentationSettings.reducedFlash),safeLaneSpatialSeparationBudget=spatialThreatSeparationBudgetPresentation({criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),safeLaneVisible:true,projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const safeLaneSpatialReclaim=spatialReclaimGuardPresentation({release:safeLaneReclaim.release,pressure:denseBattleSafeLane.pressure,safeLaneVisible:true},this.presentationSettings.reducedFlash),safeLaneSpatialRecoveryBudget=spatialRecoveryBudgetPresentation({recoveringCount:this.bossArena.hazards.length+this.enemies.activeProjectileCount,pressure:denseBattleSafeLane.pressure,criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const safeLaneDenseArbitration=denseSafeLaneArbitrationPresentation({hazardCount:this.bossArena.hazards.length,projectileCount:this.enemies.activeProjectileCount,confidence:safeLane.confidence,critical:this.dangerState.coreCritical||this.dangerState.heroCritical},this.presentationSettings.reducedFlash),safeLaneDenseBattlefield=denseBattlefieldArbitrationPresentation({criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),hazardCount:this.bossArena.hazards.length,projectileCount:this.enemies.activeProjectileCount,impactCount:0,silhouetteCount:0,safeLaneVisible:true},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const safeLaneDepthContour=safeLaneContourDepthPresentation({visible:true,confidence:safeLane.confidence,pressure:safeLaneDenseBattlefield.stress},this.presentationSettings.reducedFlash),safeLaneDepthPlaneBudget=depthPlaneBudgetPresentation({criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0,safeLaneVisible:true},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const safeLaneDepthReentry=safeLaneContourReentryPresentation({release:Math.max(0,1-safeLaneDepthContour.fillScale),pressure:safeLaneDenseBattlefield.stress,visible:true},this.presentationSettings.reducedFlash),safeLaneDepthReentryBudget=depthReentryBudgetPresentation({reenteringCount:this.bossArena.hazards.length+this.enemies.activeProjectileCount,pressure:safeLaneDenseBattlefield.stress,criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const safeLaneBossFocus=bossSafeLaneFocusCorridorPresentation({visible:true,confidence:safeLane.confidence,bossPressure:safeLaneDenseBattlefield.stress,critical:this.dangerState.coreCritical||this.dangerState.heroCritical},this.presentationSettings.reducedFlash),safeLaneBossFocusBudget=bossFocusCorridorBudgetPresentation({bossActive:Boolean(boss),criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0,safeLaneVisible:true},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const safeLaneCanonicalReacquisition=safeLaneCanonicalReacquisitionPresentation({visible:true,confidence:safeLane.confidence,release:safeLaneReclaim.release,pressure:safeLaneDenseBattlefield.stress},this.presentationSettings.reducedFlash),safeLaneCanonicalReacquisitionBudget=canonicalReacquisitionBudgetPresentation({criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0,safeLaneVisible:true},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const safeLaneDirectionReacquisition=safeLaneDirectionReacquisitionPresentation({visible:true,confidence:safeLane.confidence,reacquire:safeLaneReclaim.release,pressure:safeLaneDenseBattlefield.stress},this.presentationSettings.reducedFlash),safeLaneDirectionReacquisitionBudget=directionReacquisitionBudgetPresentation({criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0,safeLaneVisible:true},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const nearbyClearedSafeLaneMemory=this.bossHazardClearedGroundMemory.filter((cue)=>cue.ttl>0).sort((a,b)=>Math.hypot(a.x-safeLaneVisualTarget.x,a.y-safeLaneVisualTarget.y)-Math.hypot(b.x-safeLaneVisualTarget.x,b.y-safeLaneVisualTarget.y))[0];const clearedGroundSafeLaneRecovery=bossClearedGroundSafeLaneRecoveryCoherencePresentation({memoryLife:nearbyClearedSafeLaneMemory?nearbyClearedSafeLaneMemory.ttl/Math.max(.001,nearbyClearedSafeLaneMemory.maxTtl):0,safeLaneConfidence:safeLane.confidence,nearLane:Boolean(nearbyClearedSafeLaneMemory&&Math.hypot(nearbyClearedSafeLaneMemory.x-safeLaneVisualTarget.x,nearbyClearedSafeLaneMemory.y-safeLaneVisualTarget.y)<=Math.max(80,nearbyClearedSafeLaneMemory.radius*1.4)),hazardOccluded:safeLaneHazardOcclusion.pathAlphaScale<.78},this.presentationSettings.reducedMotion);const clearedGroundSafeLaneHandoff=bossClearedGroundSafeLaneRecoveryHandoffPresentation({owner:clearedGroundSafeLaneRecovery.owner,memoryLife:nearbyClearedSafeLaneMemory?nearbyClearedSafeLaneMemory.ttl/Math.max(.001,nearbyClearedSafeLaneMemory.maxTtl):0,safeLaneConfidence:safeLane.confidence,hazardOccluded:safeLaneHazardOcclusion.pathAlphaScale<.78},this.presentationSettings.reducedMotion);const clearedGroundSafeLaneDensity=bossClearedGroundSafeLaneRecoveryDensityBudgetPresentation({activeCount:this.bossHazardClearedGroundMemory.length,indexFromNewest:nearbyClearedSafeLaneMemory?Math.max(0,this.bossHazardClearedGroundMemory.length-1-this.bossHazardClearedGroundMemory.indexOf(nearbyClearedSafeLaneMemory)):this.bossHazardClearedGroundMemory.length,owner:clearedGroundSafeLaneHandoff.owner},this.presentationSettings.reducedMotion);
      const safeLaneBaseAlpha=(.26 + safeLane.confidence * .18)*safeLaneVisual.primaryAlphaScale*safeLaneAttention.primaryAlphaScale*safeLaneAttentionRecovery.recoveryAlphaScale*(1-(1-clearedGroundSafeLaneRecovery.safeLaneAlphaScale*clearedGroundSafeLaneHandoff.safeLaneAlphaScale)*clearedGroundSafeLaneDensity.effectStrength)*clearedGroundSafeLaneDensity.safeLaneAlphaScale*denseBattleSafeLane.safeLaneAlphaScale*safeLaneReclaim.safeLaneAlphaScale*safeLaneResolution.safeLaneAlphaScale*safeLanePriority.safeLaneAlphaScale*battlefieldThreatBudget.safeLaneAlphaScale*safeLaneSpatial.safeLaneAlphaScale*bossSpatialFocus.safeLaneAlphaScale*safeLaneTemporal.safeLaneAlphaScale*safeLaneTemporalBudget.safeLaneAlphaScale*safeLaneProjectileDepth.safeLaneAlphaScale*safeLaneDepthBudget.safeLaneAlphaScale*safeLaneDepthRecovery.safeLaneAlphaScale*safeLaneStackProtection.safeLaneAlphaScale*safeLaneUnifiedStack.safeLaneAlphaScale*safeLaneCorridorProtection.safeLaneAlphaScale*safeLaneSpatialSeparationBudget.safeLaneAlphaScale*safeLaneSpatialReclaim.safeLaneAlphaScale*safeLaneDenseArbitration.safeLaneAlphaScale*safeLaneDenseBattlefield.safeLaneAlphaScale*safeLaneDepthContour.contourAlphaScale*safeLaneDepthPlaneBudget.safeLaneScale*safeLaneDepthReentry.contourAlphaScale*safeLaneDepthReentryBudget.canonicalScale*safeLaneBossFocus.safeLaneScale*safeLaneBossFocusBudget.safeLaneScale*safeLaneCanonicalReacquisition.safeLaneScale*safeLaneCanonicalReacquisitionBudget.safeLaneScale*safeLaneDirectionReacquisition.pathDirectionScale*safeLaneDirectionReacquisitionBudget.safeLaneScale;
      ctx.save(); ctx.globalAlpha = safeLaneBaseAlpha*Math.max(safeLaneHazardRecovery.pathAlphaScale,safeLaneStackProtection.pathAlphaFloor,safeLaneCorridorProtection.pathAlphaFloor,safeLaneDenseArbitration.pathAlphaFloor,safeLaneCanonicalReacquisition.pathAlphaFloor,safeLaneDirectionReacquisition.pathAlphaFloor); ctx.strokeStyle = '#8fffd3'; ctx.fillStyle = '#8fffd3'; ctx.lineWidth = 2; ctx.setLineDash([7,7]);
      ctx.beginPath();for(const segment of safeLaneGapFeather.bodySegments){ctx.moveTo(segment.from.x,segment.from.y);ctx.lineTo(segment.to.x,segment.to.y);}ctx.stroke();for(const feather of safeLaneGapFeather.featherSegments){ctx.globalAlpha=safeLaneBaseAlpha*safeLaneHazardRecovery.pathAlphaScale*feather.alphaScale;ctx.beginPath();ctx.moveTo(feather.from.x,feather.from.y);ctx.lineTo(feather.to.x,feather.to.y);ctx.stroke();} ctx.setLineDash([]);
      if(safeLaneGapFeather.locatorVisible){ctx.globalAlpha=safeLaneBaseAlpha*safeLaneHazardOcclusion.locatorAlphaScale*safeLaneHazardRecovery.locatorAlphaScale;ctx.beginPath(); ctx.arc(safeLaneVisualTarget.x, safeLaneVisualTarget.y, 14, 0, Math.PI*2); ctx.stroke();}
      this.drawMapSafeLaneTransitionVfx(ctx,safeLane,safeLaneVisualTarget,safeLaneVisual.arrivalAlphaScale*safeLaneAttention.arrivalAlphaScale*safeLaneHazardOcclusion.arrivalAlphaScale);
      if(forecast&&forecast.urgency>=.65&&safeLaneVisual.bridgeVisible){
        ctx.globalAlpha=(.18+.22*forecast.urgency)*safeLaneVisual.bridgeAlphaScale*safeLaneAttention.bridgeAlphaScale*safeLaneAttentionRecovery.bridgeRecoveryScale*safeLaneHazardRecovery.bridgeAlphaScale;ctx.strokeStyle='#7fd9ff';ctx.setLineDash([4,8]);
        ctx.beginPath();ctx.moveTo(forecast.currentTarget.x,forecast.currentTarget.y);ctx.lineTo(forecast.nextTarget.x,forecast.nextTarget.y);ctx.stroke();ctx.setLineDash([]);
        ctx.beginPath();ctx.arc(forecast.nextTarget.x,forecast.nextTarget.y,10,0,Math.PI*2);ctx.stroke();
        if(!safeLaneVisual.handoffSettled&&safeLaneIdentity.showDirectionIcon){const direction=safeZoneTransitionDirectionFromVector(forecast.nextTarget.x-forecast.currentTarget.x,forecast.nextTarget.y-forecast.currentTarget.y);this.drawSafeZoneTransitionDirectionIcon(ctx,direction,safeLaneVisualTarget.x+16,safeLaneVisualTarget.y-34,20);}
      }
      ctx.globalAlpha=.78*safeLaneVisual.primaryAlphaScale*safeLaneAttention.primaryAlphaScale*safeLaneAttentionRecovery.recoveryAlphaScale;ctx.fillStyle='#8fffd3';ctx.font='800 10px system-ui'; ctx.textAlign='center';
      const forecastText=forecast&&safeLaneVisual.forecastDetailVisible&&safeLaneAttention.detailVisible&&safeLaneAttentionRecovery.secondaryRecovered?` · ${forecast.phase.toUpperCase()} ${(forecast.transitionMs/1000).toFixed(1)}s`:'';
      const timelineText=lawTimeline?` · ${lawTimeline.stage.toUpperCase()} ${(lawTimeline.decisionWindowMs/1000).toFixed(1)}s${lawTimeline.hazardActivationMs!==null?` / H${(lawTimeline.hazardActivationMs/1000).toFixed(1)}`:''}${lawTimeline.lawStage!=='none'?` / ${lawTimeline.label}`:''}`:'';
      if(lawTimeline)ctx.fillStyle=lawTimeline.accent;
      if(safeLaneIdentity.showLawIcon&&lawTimeline?.lawStage==='active'&&lawIdentity&&lawIdentity.lawId!=='none')this.drawMythicLastLawSafeLaneIcon(ctx,safeLaneVisualTarget.x-12,safeLaneVisualTarget.y-54,24,lawIdentity.lawId);
      if(safeLaneIdentity.showGeometryIcon&&boss?.isMythic)this.drawMythicArenaGeometrySafeLaneIcon(ctx,boss,destroyedRatio,safeLaneVisualTarget.x+18,safeLaneVisualTarget.y-54,24,Boolean(lawIdentity?.active));
      ctx.fillText(`${safeLane.label}${forecastText}${timelineText}`, safeLaneVisualTarget.x, safeLaneVisualTarget.y-20);
      if(lawTimeline){const barW=72,barX=safeLaneVisualTarget.x-barW/2,barY=safeLaneVisualTarget.y-14;ctx.globalAlpha=.34;ctx.fillStyle='#172b34';ctx.fillRect(barX,barY,barW,4);ctx.globalAlpha=.86;ctx.fillStyle=lawTimeline.accent;ctx.fillRect(barX,barY,barW*Math.max(.06,1-lawTimeline.urgency*.72),4);}
      ctx.restore();
    }
    const telegraphedHazards=this.bossArena.hazards.filter((hazard)=>hazard.telegraph>0);
    const respawnHazardRank=new Map(telegraphedHazards.map((hazard,index)=>[hazard,Math.max(0,telegraphedHazards.length-1-index)]));
    const earliestTelegraphHazard=telegraphedHazards.reduce<(typeof telegraphedHazards)[number]|null>((best,hazard)=>!best||hazard.telegraph<best.telegraph||hazard.telegraph===best.telegraph&&hazard.id<best.id?hazard:best,null);
    const primaryTelegraphHazardId=motion.owner==='boss-hazard'?earliestTelegraphHazard?.id??null:null;
    const primaryHazardIdentityId=!boss?.isMythic&&!this.dangerState.heroCritical&&!this.dangerState.coreCritical?earliestTelegraphHazard?.id??null:null;
    const activeHazardFootprints=this.bossArena.hazards.filter((hazard)=>Boolean(hazard.launchOrigin&&(hazard.launchTtl??0)>0));
    const hazardFootprintRank=new Map(activeHazardFootprints.map((hazard,index)=>[hazard,Math.max(0,activeHazardFootprints.length-1-index)]));
    const activeActivationHazards=this.bossArena.hazards.filter((hazard)=>Boolean((hazard.visualActivationTtl??0)>0));
    const activationHazardRank=new Map(activeActivationHazards.map((hazard,index)=>[hazard,Math.max(0,activeActivationHazards.length-1-index)]));
    for (const hazard of this.bossArena.hazards) {
      const color = hazard.kind === 'firePool' ? '#ff5b38' : hazard.kind === 'summonSigil' ? '#70e7a4' : hazard.kind === 'shockLane' ? '#ffd05a' : hazard.kind === 'cursePool' ? '#cf72ff' : hazard.kind === 'twinCross' ? '#ff6fa7' : '#62caff';
      const hazardHandoff=bossHazardTelegraphHandoffPresentation({telegraph:hazard.telegraph,launchTtl:hazard.launchTtl,launchMaxTtl:hazard.launchMaxTtl},this.presentationSettings.reducedFlash);const hazardFootprint=hazard.launchOrigin&&hazard.launchTtl!==undefined&&hazard.launchMaxTtl?bossHazardMaterializationFootprintPresentation({launchOrigin:hazard.launchOrigin,hazardPos:hazard.pos,radius:hazard.radius,launchTtl:hazard.launchTtl,launchMaxTtl:hazard.launchMaxTtl},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash):null;const footprintTelegraphScale=hazardFootprint?.telegraphAlphaScale??1;const hazardFootprintBudget=bossHazardFootprintDensityBudgetPresentation({activeCount:activeHazardFootprints.length,indexFromNewest:hazardFootprintRank.get(hazard)??activeHazardFootprints.length,progress:hazardFootprint?.progress??1},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);const footprintLifecycle=bossHazardFootprintLifecycleHandoffPresentation({footprintVisible:Boolean(hazardFootprint?.visible),footprintProgress:hazardFootprint?.progress??1,telegraph:hazard.telegraph,ttl:hazard.ttl},this.presentationSettings.reducedFlash);const activationSettle=bossHazardPersistentActivationSettlePresentation({telegraph:hazard.telegraph,ttl:hazard.ttl,activationTtl:hazard.visualActivationTtl,activationMaxTtl:hazard.visualActivationMaxTtl},this.presentationSettings.reducedFlash),activationDensityBudget=bossHazardActivationDensityBudgetPresentation({activeActivationCount:activeActivationHazards.length,indexFromNewest:activationHazardRank.get(hazard)??activeActivationHazards.length,owner:activationSettle.owner},this.presentationSettings.reducedMotion),activationActiveScale=1-(1-activationSettle.activeAlphaScale)*activationDensityBudget.effectStrength;const hazardLifecycle=bossHazardLifecycleOwnerPresentation({telegraph:hazard.telegraph,ttl:hazard.ttl,aftermathTtl:0,aftermathMaxTtl:0},this.presentationSettings.reducedFlash);
      const nearbyClearedMemory=this.bossHazardClearedGroundMemory.filter((cue)=>cue.ttl>0).reduce<(typeof this.bossHazardClearedGroundMemory)[number]|null>((best,cue)=>{const d=Math.hypot(cue.x-hazard.pos.x,cue.y-hazard.pos.y);return !best||d<Math.hypot(best.x-hazard.pos.x,best.y-hazard.pos.y)?cue:best;},null);const nearbyAftermathActive=nearbyClearedMemory?this.bossHazardAftermathVfx.some((after)=>Math.hypot(after.x-nearbyClearedMemory.x,after.y-nearbyClearedMemory.y)<=Math.max(24,nearbyClearedMemory.radius*.35)&&after.ttl>0):false;const clearedHandoff=nearbyClearedMemory?bossHazardClearedGroundMemoryPresentation({memoryTtl:nearbyClearedMemory.ttl,memoryMaxTtl:nearbyClearedMemory.maxTtl,aftermathActive:nearbyAftermathActive,nextHazardDistance:Math.hypot(nearbyClearedMemory.x-hazard.pos.x,nearbyClearedMemory.y-hazard.pos.y),nextHazardTelegraph:hazard.telegraph},this.presentationSettings.reducedFlash):null;const respawnGroundCoherence=nearbyClearedMemory?bossHazardRespawnGroundCoherencePresentation({memoryLife:Math.max(0,nearbyClearedMemory.ttl/Math.max(.001,nearbyClearedMemory.maxTtl)),aftermathActive:nearbyAftermathActive,nextHazardDistance:Math.hypot(nearbyClearedMemory.x-hazard.pos.x,nearbyClearedMemory.y-hazard.pos.y),nextHazardRadius:hazard.radius,nextHazardTelegraph:hazard.telegraph},this.presentationSettings.reducedFlash):null;const respawnGroundHandoff=respawnGroundCoherence&&nearbyClearedMemory?bossHazardRespawnGroundHandoffPresentation({coherenceOwner:respawnGroundCoherence.owner,memoryLife:Math.max(0,nearbyClearedMemory.ttl/Math.max(.001,nearbyClearedMemory.maxTtl)),nextHazardTelegraph:hazard.telegraph},this.presentationSettings.reducedFlash):null;const respawnGroundDensityBudget=respawnGroundCoherence?bossHazardRespawnGroundDensityBudgetPresentation({activeTransitionCount:telegraphedHazards.length,indexFromNewest:respawnHazardRank.get(hazard)??telegraphedHazards.length,owner:respawnGroundCoherence.owner},this.presentationSettings.reducedMotion):null;const respawnMaterializationOwner=bossHazardRespawnMaterializationOwnershipPresentation({respawnOwner:respawnGroundCoherence?.owner??'spawn',footprintOwner:footprintLifecycle.owner,activationOwner:activationSettle.owner,footprintProgress:hazardFootprint?.progress??1},this.presentationSettings.reducedFlash);const respawnMaterializationSettle=bossHazardRespawnMaterializationSettlePresentation({owner:respawnMaterializationOwner.owner,activationTtl:hazard.visualActivationTtl??0,activationMaxTtl:hazard.visualActivationMaxTtl??.08,ttl:hazard.ttl},this.presentationSettings.reducedFlash);const materializationTransitionCount=respawnMaterializationOwner.owner==='footprint'?activeHazardFootprints.length:respawnMaterializationOwner.owner==='activation'?activeActivationHazards.length:0;const materializationTransitionRank=respawnMaterializationOwner.owner==='footprint'?(hazardFootprintRank.get(hazard)??materializationTransitionCount):respawnMaterializationOwner.owner==='activation'?(activationHazardRank.get(hazard)??materializationTransitionCount):0;const respawnMaterializationDensityBudget=bossHazardRespawnMaterializationDensityBudgetPresentation({activeCount:materializationTransitionCount,indexFromNewest:materializationTransitionRank,owner:respawnMaterializationOwner.owner},this.presentationSettings.reducedMotion);const telegraphAlphaScale=(clearedHandoff?.telegraphAlphaScale??1)*(respawnGroundCoherence?.telegraphAlphaScale??1)*(respawnGroundHandoff?.telegraphAlphaScale??1)*(respawnGroundDensityBudget?.telegraphAlphaScale??1)*respawnMaterializationOwner.telegraphAlphaScale;
      if(hazard.launchOrigin&&hazardHandoff.launchCueAlpha>0){ctx.save();ctx.globalAlpha=hazardHandoff.launchCueAlpha;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.setLineDash([6,9]);ctx.beginPath();ctx.moveTo(hazard.launchOrigin.x,hazard.launchOrigin.y);ctx.lineTo(hazard.pos.x,hazard.pos.y);ctx.stroke();ctx.setLineDash([]);ctx.restore();}if(hazardFootprint?.visible&&hazardFootprintBudget.visible){ctx.save();ctx.globalAlpha=hazardFootprint.alphaScale*hazardFootprintBudget.alphaScale*footprintLifecycle.footprintAlphaScale*respawnMaterializationOwner.footprintAlphaScale*respawnMaterializationSettle.materializationAlphaScale*respawnMaterializationDensityBudget.effectStrength;ctx.strokeStyle=color;ctx.lineWidth=1.8;ctx.setLineDash([4,7]);ctx.beginPath();ctx.arc(hazardFootprint.center.x,hazardFootprint.center.y,hazardFootprint.radius,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
      const amplitude=hazard.id===primaryTelegraphHazardId?motion.bossHazardMotionAmplitude:0;
      const hazardExpiry=hazardExpiryEdgeContinuityPresentation({ttl:hazard.ttl,maxTtl:5.4,telegraph:hazard.telegraph},this.presentationSettings.reducedFlash),hazardResidueRelease=hazardResidueReleasePresentation({ttl:hazard.ttl,maxTtl:5.4,clearedMemoryLife:nearbyClearedMemory?nearbyClearedMemory.ttl/Math.max(.001,nearbyClearedMemory.maxTtl):0},this.presentationSettings.reducedFlash),hazardGroundResolution=hazardGroundResolutionPresentation({hazardActive:hazard.telegraph<=0&&hazard.ttl>0,hazardLife:hazard.ttl/5.4,memoryLife:nearbyClearedMemory?nearbyClearedMemory.ttl/Math.max(.001,nearbyClearedMemory.maxTtl):0},this.presentationSettings.reducedFlash);
      const hazardBaseAlpha = hazard.telegraph > 0 ? (0.34 + amplitude * Math.sin(this.elapsed * 10))*hazardHandoff.telegraphAlphaScale*footprintTelegraphScale*hazardLifecycle.telegraphAlphaScale*footprintLifecycle.telegraphAlphaScale*telegraphAlphaScale : 0.34*hazardLifecycle.activeAlphaScale*footprintLifecycle.activeAlphaScale*activationActiveScale*respawnMaterializationOwner.activeAlphaScale*respawnMaterializationSettle.persistentAlphaScale;
      const hazardLaneProximity=safeLane?1-Math.min(1,Math.hypot(hazard.pos.x-safeLane.target.x,hazard.pos.y-safeLane.target.y)/Math.max(1,hazard.radius*2.4)):0,hazardSpatial=hazardSafeLaneCarvePresentation({hazardActive:hazard.telegraph<=0&&hazard.ttl>0,laneProximity:hazardLaneProximity,pressure:denseBattleSafeLane.pressure},this.presentationSettings.reducedFlash),hazardTemporal=hazardCorridorStabilityPresentation({active:hazard.telegraph<=0&&hazard.ttl>0,life:hazard.ttl/5.4,laneProximity:hazardLaneProximity,pressure:denseBattleSafeLane.pressure},this.presentationSettings.reducedFlash);
      const hazardTelegraphDepth=bossTelegraphImpactDepthPresentation({telegraphActive:hazard.telegraph>0,overlap:Math.min(1,this.enemies.activeProjectileCount/8),impactLife:Math.max(0,Math.min(1,hazard.ttl/5.4))},this.presentationSettings.reducedFlash),hazardDepthBudget=battlefieldDepthBudgetPresentation({criticalCount:hazard.id===primaryTelegraphHazardId?1:0,bossTelegraph:hazard.telegraph>0,safeLaneVisible:Boolean(safeLane),projectilePressure:Math.min(1,this.enemies.activeProjectileCount/12),impactPressure:0,hazardPressure:denseBattleSafeLane.pressure},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const hazardDepthRelease=bossTelegraphDepthReleasePresentation({telegraphLife:hazard.telegraph>0?Math.min(1,hazard.telegraph/1.2):0,impactLife:Math.max(0,Math.min(1,hazard.ttl/5.4)),overlap:Math.min(1,this.enemies.activeProjectileCount/8)},this.presentationSettings.reducedFlash),hazardRecoveryBudget=depthRecoveryBudgetPresentation({recoveringCount:this.bossArena.hazards.length,pressure:denseBattleSafeLane.pressure,criticalCount:hazard.id===primaryTelegraphHazardId?1:0},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const hazardStackOrder=bossTelegraphStackOrderPresentation({activeCount:this.bossArena.hazards.length,indexFromNewest:Math.max(0,this.bossArena.hazards.length-1-this.bossArena.hazards.indexOf(hazard)),life:hazard.telegraph>0?Math.min(1,hazard.telegraph/1.2):Math.min(1,hazard.ttl/5.4),critical:hazard.id===primaryTelegraphHazardId},this.presentationSettings.reducedFlash),hazardUnifiedStack=unifiedDepthStackBudgetPresentation({criticalCount:hazard.id===primaryTelegraphHazardId?1:0,bossTelegraphCount:this.bossArena.hazards.filter((entry)=>entry.telegraph>0).length,safeLaneVisible:Boolean(safeLane),secondaryCount:this.bossArena.hazards.length+this.enemies.activeProjectileCount,pressure:denseBattleSafeLane.pressure},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const hazardSafeLaneSeparation=telegraphSafeLaneSeparationPresentation({telegraphActive:hazard.telegraph>0,safeLaneVisible:Boolean(safeLane),overlap:hazardLaneProximity,critical:hazard.id===primaryTelegraphHazardId},this.presentationSettings.reducedFlash),hazardSpatialSeparationBudget=spatialThreatSeparationBudgetPresentation({criticalCount:hazard.id===primaryTelegraphHazardId?1:0,safeLaneVisible:Boolean(safeLane),projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const hazardSafeLaneRelease=telegraphSafeLaneReleasePresentation({overlap:hazardLaneProximity,release:Math.max(0,1-Math.min(1,hazard.telegraph>0?hazard.telegraph/1.2:hazard.ttl/5.4)),telegraphActive:hazard.telegraph>0},this.presentationSettings.reducedFlash),hazardSpatialRecoveryBudget=spatialRecoveryBudgetPresentation({recoveringCount:this.bossArena.hazards.length,pressure:denseBattleSafeLane.pressure,criticalCount:hazard.id===primaryTelegraphHazardId?1:0},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const hazardDenseArbitration=denseHazardArbitrationPresentation({hazardCount:this.bossArena.hazards.length,indexFromNewest:Math.max(0,this.bossArena.hazards.length-1-this.bossArena.hazards.indexOf(hazard)),telegraph:hazard.telegraph>0,critical:hazard.id===primaryTelegraphHazardId,laneProximity:hazardLaneProximity},this.presentationSettings.reducedFlash),hazardDenseBattlefield=denseBattlefieldArbitrationPresentation({criticalCount:hazard.id===primaryTelegraphHazardId?1:0,hazardCount:this.bossArena.hazards.length,projectileCount:this.enemies.activeProjectileCount,impactCount:0,silhouetteCount:0,safeLaneVisible:Boolean(safeLane)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const hazardDepthPlane=hazardDepthPlanePresentation({telegraph:hazard.telegraph>0,laneProximity:hazardLaneProximity,crowd:Math.min(1,this.bossArena.hazards.length/6),critical:hazard.id===primaryTelegraphHazardId},this.presentationSettings.reducedFlash),hazardDepthPlaneBudget=depthPlaneBudgetPresentation({criticalCount:hazard.id===primaryTelegraphHazardId?1:0,projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0,safeLaneVisible:Boolean(safeLane)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const hazardDepthReentry=hazardDepthReentryPresentation({release:Math.max(0,1-hazardLaneProximity),pressure:hazardDepthPlane.pressure,telegraph:hazard.telegraph>0},this.presentationSettings.reducedFlash),hazardDepthReentryBudget=depthReentryBudgetPresentation({reenteringCount:this.bossArena.hazards.length,pressure:hazardDepthPlane.pressure,criticalCount:hazard.id===primaryTelegraphHazardId?1:0},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const hazardBossFocus=bossTelegraphFocusCorridorPresentation({active:hazard.telegraph>0,critical:hazard.id===primaryTelegraphHazardId,overlap:hazardLaneProximity,crowd:Math.min(1,this.bossArena.hazards.length/6)},this.presentationSettings.reducedFlash),hazardBossFocusBudget=bossFocusCorridorBudgetPresentation({bossActive:Boolean(boss),criticalCount:hazard.id===primaryTelegraphHazardId?1:0,projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0,safeLaneVisible:Boolean(safeLane)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const hazardCanonicalReacquisition=hazardCanonicalReacquisitionPresentation({telegraph:hazard.telegraph>0,release:hazardDepthReentry.reclaim,pressure:Math.max(hazardDepthPlane.pressure,hazardBossFocus.focus),critical:hazard.id===primaryTelegraphHazardId},this.presentationSettings.reducedFlash),hazardCanonicalReacquisitionBudget=canonicalReacquisitionBudgetPresentation({criticalCount:hazard.id===primaryTelegraphHazardId?1:0,projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0,safeLaneVisible:Boolean(safeLane)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const hazardDirectionReacquisition=hazardBoundaryDirectionReacquisitionPresentation({reacquire:hazardCanonicalReacquisition.reacquire,telegraph:hazard.telegraph>0,laneProximity:hazardLaneProximity,pressure:Math.max(hazardDepthPlane.pressure,hazardBossFocus.focus)},this.presentationSettings.reducedFlash),hazardDirectionReacquisitionBudget=directionReacquisitionBudgetPresentation({criticalCount:hazard.id===primaryTelegraphHazardId?1:0,projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0,safeLaneVisible:Boolean(safeLane)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);
      const hazardFillAlpha=hazardBaseAlpha*hazardExpiry.fillAlphaScale*denseBattleSafeLane.hazardFillScale*battlefieldHazardReclaim.hazardAlphaScale*hazardSpatial.fillAlphaScale*hazardTemporal.fillAlphaScale*hazardDepthBudget.secondaryAlphaScale*hazardRecoveryBudget.secondaryRecoveryScale*hazardDepthRelease.impactFillAlphaScale*hazardStackOrder.decorationAlphaScale*hazardUnifiedStack.secondaryAlphaScale*hazardSafeLaneSeparation.secondaryAlphaScale*hazardSpatialSeparationBudget.secondaryAlphaScale*hazardSafeLaneRelease.secondaryAlphaScale*hazardSpatialRecoveryBudget.secondaryRecoveryScale*hazardDenseArbitration.fillAlphaScale*hazardDenseBattlefield.secondaryAlphaScale*hazardDepthPlane.fillAlphaScale*hazardDepthPlaneBudget.secondaryAlphaScale*hazardDepthReentry.fillAlphaScale*hazardDepthReentryBudget.secondaryReentryScale*hazardBossFocus.secondaryScale*hazardBossFocusBudget.secondaryScale*hazardCanonicalReacquisition.fillAlphaScale*hazardCanonicalReacquisitionBudget.staleDecorationScale,hazardEdgeAlpha=hazardBaseAlpha*hazardExpiry.edgeAlphaScale*denseBattleSafeLane.hazardEdgeScale*hazardResidueRelease.hazardEdgeScale*hazardGroundResolution.hazardEdgeAlphaScale*hazardSpatial.hazardEdgeAlphaScale*hazardTemporal.edgeAlphaScale*hazardTelegraphDepth.telegraphEdgeAlphaScale*hazardDepthRelease.telegraphEdgeAlphaScale*hazardSafeLaneSeparation.telegraphEdgeAlphaScale*hazardSafeLaneRelease.telegraphEdgeAlphaScale*hazardDenseArbitration.edgeAlphaScale*hazardDepthPlane.edgeAlphaScale*hazardDepthReentry.edgeAlphaScale*hazardBossFocus.edgeAlphaScale*hazardBossFocusBudget.telegraphEdgeScale*hazardCanonicalReacquisition.edgeAlphaScale*hazardCanonicalReacquisitionBudget.criticalEdgeScale*hazardDirectionReacquisition.edgeDirectionScale*hazardDirectionReacquisitionBudget.primaryDirectionScale;
      ctx.save();
      ctx.globalAlpha = hazard.telegraph>0?hazardBaseAlpha*hazardTelegraphDepth.telegraphEdgeAlphaScale*hazardDepthRelease.telegraphEdgeAlphaScale*hazardStackOrder.edgeAlphaScale*hazardUnifiedStack.bossTelegraphEdgeAlphaScale*hazardSafeLaneSeparation.telegraphEdgeAlphaScale*hazardSpatialSeparationBudget.bossTelegraphEdgeAlphaScale:hazardFillAlpha;
      ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = hazard.telegraph > 0 ? 4 : 2;
      const shape = hazard.geometryShape;
      if (shape === 'corridor' || shape === 'cross') {
        ctx.translate(hazard.pos.x, hazard.pos.y); ctx.rotate(hazard.angle ?? 0);
        const length = hazard.length ?? hazard.radius * 3;
        ctx.beginPath(); ctx.rect(-length / 2, -hazard.radius, length, hazard.radius * 2);
        if (hazard.telegraph <= 0){ctx.globalAlpha=hazardFillAlpha;ctx.fill();}ctx.globalAlpha=hazard.telegraph>0?hazardBaseAlpha*hazardTelegraphDepth.telegraphEdgeAlphaScale*hazardDepthRelease.telegraphEdgeAlphaScale*hazardStackOrder.edgeAlphaScale*hazardUnifiedStack.bossTelegraphEdgeAlphaScale:hazardEdgeAlpha;ctx.stroke();
        if (shape === 'cross') {
          ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.rect(-length / 2, -hazard.radius * .7, length, hazard.radius * 1.4);
          if (hazard.telegraph <= 0){ctx.globalAlpha=hazardFillAlpha;ctx.fill();}ctx.globalAlpha=hazard.telegraph>0?hazardBaseAlpha*hazardTelegraphDepth.telegraphEdgeAlphaScale*hazardDepthRelease.telegraphEdgeAlphaScale*hazardStackOrder.edgeAlphaScale*hazardUnifiedStack.bossTelegraphEdgeAlphaScale:hazardEdgeAlpha;ctx.stroke();
        }
      } else if (shape === 'ring') {
        ctx.beginPath(); ctx.arc(hazard.pos.x, hazard.pos.y, hazard.radius, 0, Math.PI * 2); ctx.arc(hazard.pos.x, hazard.pos.y, Math.max(10, hazard.radius * .58), 0, Math.PI * 2, true);
        if (hazard.telegraph <= 0){ctx.globalAlpha=hazardFillAlpha;ctx.fill('evenodd');}ctx.globalAlpha=hazard.telegraph>0?hazardBaseAlpha*hazardTelegraphDepth.telegraphEdgeAlphaScale*hazardDepthRelease.telegraphEdgeAlphaScale*hazardStackOrder.edgeAlphaScale*hazardUnifiedStack.bossTelegraphEdgeAlphaScale:hazardEdgeAlpha;ctx.stroke();
      } else if (shape === 'orbit') {
        ctx.save(); ctx.translate(hazard.pos.x, hazard.pos.y); ctx.rotate(hazard.angle ?? 0); ctx.scale(1.45, .72);
        ctx.beginPath(); ctx.arc(0, 0, hazard.radius, 0, Math.PI * 2); if (hazard.telegraph <= 0){ctx.globalAlpha=hazardFillAlpha;ctx.fill();}ctx.globalAlpha=hazard.telegraph>0?hazardBaseAlpha*hazardTelegraphDepth.telegraphEdgeAlphaScale*hazardDepthRelease.telegraphEdgeAlphaScale*hazardStackOrder.edgeAlphaScale*hazardUnifiedStack.bossTelegraphEdgeAlphaScale:hazardEdgeAlpha;ctx.stroke(); ctx.restore();
      } else if (shape === 'clock') {
        ctx.translate(hazard.pos.x, hazard.pos.y); ctx.rotate(hazard.angle ?? 0);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, hazard.radius * 1.25, -.2, .2); ctx.closePath(); if (hazard.telegraph <= 0){ctx.globalAlpha=hazardFillAlpha;ctx.fill();}ctx.globalAlpha=hazard.telegraph>0?hazardBaseAlpha*hazardTelegraphDepth.telegraphEdgeAlphaScale*hazardDepthRelease.telegraphEdgeAlphaScale*hazardStackOrder.edgeAlphaScale*hazardUnifiedStack.bossTelegraphEdgeAlphaScale:hazardEdgeAlpha;ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(hazard.pos.x, hazard.pos.y, hazard.radius, 0, Math.PI * 2);
        if (hazard.telegraph <= 0){ctx.globalAlpha=hazardFillAlpha;ctx.fill();}ctx.globalAlpha=hazard.telegraph>0?hazardBaseAlpha*hazardTelegraphDepth.telegraphEdgeAlphaScale*hazardDepthRelease.telegraphEdgeAlphaScale*hazardStackOrder.edgeAlphaScale*hazardUnifiedStack.bossTelegraphEdgeAlphaScale:hazardEdgeAlpha;ctx.stroke();
      }
      if(hazardResidueRelease.owner==='residue'&&hazardResidueRelease.clearedGroundAlphaScale>.01){ctx.save();ctx.globalAlpha=.24*hazardResidueRelease.clearedGroundAlphaScale*hazardGroundResolution.clearedGroundAlphaScale;ctx.strokeStyle=color;ctx.lineWidth=1.4;ctx.setLineDash([3,7]);ctx.beginPath();ctx.arc(hazard.pos.x,hazard.pos.y,Math.max(12,hazard.radius*1.04),0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
      if(hazard.telegraph>0&&hazard.id===primaryHazardIdentityId)this.drawBossArenaHazardIdentity(ctx,hazard.kind,hazard.pos.x,hazard.pos.y-hazard.radius-30,24);
      ctx.restore();
      if (this.bossSpecialCombatVfxAtlasReady && this.bossSpecialCombatVfxAtlasImage) {
        const stamp = bossSpecialHazardVfxSprite(hazard.kind);
        const size = Math.max(96, hazard.radius * 2.18);
        const alpha = hazard.telegraph > 0 ? (this.presentationSettings.reducedFlash ? 0.22 : 0.34)*hazardLifecycle.telegraphAlphaScale*telegraphAlphaScale : (this.presentationSettings.reducedFlash ? 0.3 : 0.48)*hazardLifecycle.activeAlphaScale;
        ctx.save(); ctx.globalAlpha = alpha;
        ctx.drawImage(this.bossSpecialCombatVfxAtlasImage, stamp.sx, stamp.sy, stamp.sw, stamp.sh, hazard.pos.x - size / 2, hazard.pos.y - size / 2, size, size);
        ctx.restore();
      }
      if(this.bossArenaLifecycleVfxAtlasReady&&this.bossArenaLifecycleVfxAtlasImage){const life=bossArenaLifecycleVfxSprite(hazard.kind,hazard.telegraph>0?'telegraph':'active');const lifeSize=Math.max(108,hazard.radius*2.34);ctx.save();ctx.globalAlpha=hazard.telegraph>0?(this.presentationSettings.reducedFlash?.24:.4)*hazardLifecycle.telegraphAlphaScale*footprintTelegraphScale*telegraphAlphaScale:(this.presentationSettings.reducedFlash?.32:.54)*hazardLifecycle.activeAlphaScale;ctx.drawImage(this.bossArenaLifecycleVfxAtlasImage,life.sx,life.sy,life.sw,life.sh,hazard.pos.x-lifeSize/2,hazard.pos.y-lifeSize/2,lifeSize,lifeSize);ctx.restore();}
    }
  }

  private drawBossArenaHazardIdentity(ctx:CanvasRenderingContext2D,kind:import('./boss-arena.js').BossArenaHazardKind,x:number,y:number,size:number):void{
    if(!this.bossArenaHazardIdentityAtlasReady||!this.bossArenaHazardIdentityAtlasImage)return;
    const icon=bossArenaHazardIdentityIcon(kind);ctx.save();ctx.globalAlpha=.94;ctx.fillStyle='rgba(4,8,14,.82)';ctx.fillRect(x-size/2-2,y-2,size+4,size+4);ctx.drawImage(this.bossArenaHazardIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x-size/2,y,size,size);ctx.restore();
  }

  private drawMythicArenaGeometrySafeLaneIcon(ctx:CanvasRenderingContext2D,boss:Enemy,destroyedRatio:number,x:number,y:number,size:number,lawActive:boolean):void{
    if(!boss.isMythic||this.dangerState.heroCritical||this.dangerState.coreCritical||lawActive)return;
    if(!this.mythicArenaGeometryIdentityAtlasReady||!this.mythicArenaGeometryIdentityAtlasImage)return;
    const profile=mythicArenaGeometryProfile(boss.bossArchetype??'inferno',destroyedRatio),icon=mythicArenaGeometryIdentityIcon(profile.id);ctx.save();ctx.globalAlpha=.92;ctx.fillStyle='rgba(4,8,14,.82)';ctx.fillRect(x-2,y-2,size+4,size+4);ctx.drawImage(this.mythicArenaGeometryIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();
  }

  private bossEffectivePressureLastLawActive(boss:Enemy):boolean{
    if(!boss.isMythic)return false;
    const mythic=mythicBossProfile(this.elapsed,this.runThreatLevel,boss.bossOrdinal??this.bossesKilled);
    const total=this.bossEncounter.nodes.length,alive=this.bossEncounter.nodes.filter(node=>node.alive).length,weakpointRatio=total>0?alive/total:0;
    return mythicLastLawProfile(mythic,boss.hp/Math.max(1,boss.maxHp),weakpointRatio).active;
  }

  private hideBossEffectivePressureRecall(boss:Enemy):boolean{
    const {heroCritical,coreCritical}=this.dangerState;
    const attentionBlocked=heroCritical||coreCritical||(boss.specialTimer??99)<=1.2;
    return attentionBlocked||this.bossEffectivePressureLastLawActive(boss);
  }

  private preferBossEffectivePressureSummary(boss:Enemy,lawActive=false):boolean{
    return !lawActive&&!this.hideBossEffectivePressureRecall(boss);
  }

  private drawBossEffectivePressureRecall(ctx:CanvasRenderingContext2D,boss:Enemy):void{
    if(this.hideBossEffectivePressureRecall(boss))return;
    const projection:BossEffectivePressureProjection=projectBossEffectivePressure(this.enemies.getBossEncounterModifiers());
    const effects=projection.primaryEffects.slice(0,2);if(effects.length===0)return;
    const compact=boss.isMythic||this.elapsed>=4*60*60,iconSize=12,chipW=108,chipH=17,gap=5,hiddenThreatLabel=projection.hiddenThreatLabel,overflowGap=hiddenThreatLabel?4:0,overflowW=hiddenThreatLabel?40:0,total=effects.length*chipW+(effects.length-1)*gap+overflowGap+overflowW;
    const startX=LOGICAL_WIDTH/2-total/2,y=compact?87:86;
    ctx.save();ctx.globalAlpha=.91;ctx.textAlign='left';ctx.textBaseline='middle';ctx.font='900 8px system-ui';
    effects.forEach((effect,index)=>{
      const icon=mythicSafeZonePressureEffectIdentityIcon(effect.effectId),x=startX+index*(chipW+gap);
      ctx.fillStyle='rgba(4,8,14,.9)';ctx.fillRect(x,y,chipW,chipH);
      ctx.strokeStyle=effect.impact==='threat'?'rgba(255,151,122,.38)':'rgba(143,255,211,.34)';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,chipW-1,chipH-1);
      if(this.mythicSafeZonePressureEffectIdentityAtlasReady&&this.mythicSafeZonePressureEffectIdentityAtlasImage){ctx.drawImage(this.mythicSafeZonePressureEffectIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x+2,y+2,iconSize,iconSize);}
      ctx.fillStyle=icon.accent;ctx.fillText(effect.label,x+17,y+chipH/2+.5);
      ctx.textAlign='right';ctx.fillStyle=effect.impact==='threat'?'#ff977a':'#8fffd3';ctx.fillText(effect.impactLabel,x+chipW-4,y+chipH/2+.5);ctx.textAlign='left';
      // Explicit 위험/기회 text keeps semantic meaning readable without relying on sign or color alone.
    });
    if(hiddenThreatLabel){
      const x=startX+effects.length*chipW+(effects.length-1)*gap+overflowGap;
      ctx.fillStyle='rgba(35,8,8,.92)';ctx.fillRect(x,y,overflowW,chipH);ctx.strokeStyle='rgba(255,151,122,.5)';ctx.strokeRect(x+.5,y+.5,overflowW-1,chipH-1);
      ctx.fillStyle='#ffb09c';ctx.font='900 8px system-ui';ctx.textAlign='center';ctx.fillText(hiddenThreatLabel,x+overflowW/2,y+chipH/2+.5);ctx.textAlign='left';
    }
    ctx.restore();
  }

  private hideMythicSafeZonePressureIdentity(boss:Enemy,lawActive:boolean):boolean{
    const {heroCritical,coreCritical}=this.dangerState;
    return heroCritical||coreCritical||lawActive||(boss.specialTimer??99)<=1.2;
  }

  private drawMythicSafeZonePressureHelpers(ctx:CanvasRenderingContext2D,boss:Enemy,projection:MythicSafeZonePressureEffectsProjection,anchorX:number,anchorY:number,lawActive:boolean):void{
    if(this.hideMythicSafeZonePressureIdentity(boss,lawActive))return;
    if(this.preferBossEffectivePressureSummary(boss,lawActive))return;
    const effects=projection.primaryEffects.slice(0,2);if(effects.length===0)return;
    const iconSize=16,chipW=94,chipH=20,gap=4,total=effects.length*chipW+(effects.length-1)*gap;
    const startX=clamp(anchorX-total/2,ARENA_MARGIN,LOGICAL_WIDTH-ARENA_MARGIN-total),y=anchorY+3;
    ctx.save();ctx.globalAlpha=.88;ctx.textAlign='left';ctx.textBaseline='middle';ctx.font='800 8px system-ui';
    effects.forEach((effect,index)=>{
      const icon=mythicSafeZonePressureEffectIdentityIcon(effect.effectId),x=startX+index*(chipW+gap);
      ctx.fillStyle='rgba(4,8,14,.86)';ctx.fillRect(x,y,chipW,chipH);
      if(this.mythicSafeZonePressureEffectIdentityAtlasReady&&this.mythicSafeZonePressureEffectIdentityAtlasImage){
        ctx.drawImage(this.mythicSafeZonePressureEffectIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x+2,y+2,iconSize,iconSize);
      }
      ctx.fillStyle=icon.accent;ctx.fillText(effect.label,x+20,y+chipH/2+.5);
    });ctx.restore();
  }

  private drawMythicSafeZoneLifecycleIcon(ctx:CanvasRenderingContext2D,phase:import('./endless/mythic-safe-zone.js').MythicSafeZonePhase,x:number,y:number,size:number,lawActive:boolean):void{
    if(this.dangerState.heroCritical||this.dangerState.coreCritical||lawActive)return;
    if(!this.mythicSafeZoneLifecycleIdentityAtlasReady||!this.mythicSafeZoneLifecycleIdentityAtlasImage)return;
    const icon=mythicSafeZoneLifecycleIdentityIcon(phase);ctx.save();ctx.globalAlpha=.92;ctx.fillStyle='rgba(4,8,14,.82)';ctx.fillRect(x-2,y-2,size+4,size+4);ctx.drawImage(this.mythicSafeZoneLifecycleIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();
  }

  private drawSafeZoneTransitionDirectionIcon(ctx:CanvasRenderingContext2D,direction:import('./endless/safe-zone-transition-direction-assets.js').SafeZoneTransitionDirectionId,x:number,y:number,size:number):void{
    if(!this.safeZoneTransitionDirectionAtlasReady||!this.safeZoneTransitionDirectionAtlasImage)return;
    const icon=safeZoneTransitionDirectionIcon(direction);ctx.save();ctx.globalAlpha=.94;ctx.fillStyle='rgba(4,8,14,.82)';ctx.fillRect(x-2,y-2,size+4,size+4);ctx.drawImage(this.safeZoneTransitionDirectionAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();
  }

  /* Phase 2584~2586 source-contract continuity. Runtime rendering may promote an imminent forecast target, while the canonical gameplay safe-lane target remains unchanged:
     const dx=safeLane.target.x-this.hero.pos.x,dy=safeLane.target.y-this.hero.pos.y; Math.atan2(dy,dx);
     safeLane.target.x-arrivalSize/2; safeLane.target.y-arrivalSize/2; ctx.lineTo(safeLane.target.x, safeLane.target.y);
  */
  private drawMapSafeLaneTransitionVfx(ctx:CanvasRenderingContext2D,safeLane:NonNullable<ReturnType<typeof mythicSafeLaneHint>>,safeLaneVisualTarget:Vec2=safeLane.target,arrivalAlphaScale=1):void{
    if(this.mapSafeLaneTransitionVfxAtlasReady&&this.mapSafeLaneTransitionVfxAtlasImage){
      const dx=safeLaneVisualTarget.x-this.hero.pos.x,dy=safeLaneVisualTarget.y-this.hero.pos.y;
      const angle=Math.atan2(dy,dx),distanceToTarget=Math.hypot(dx,dy);
    const transitionAlpha=this.presentationSettings.reducedFlash?0.24:0.44;
      const pathSprite=mapSafeLaneTransitionVfxSprite(this.terrain.currentLayout.id,'path'),arrivalSprite=mapSafeLaneTransitionVfxSprite(this.terrain.currentLayout.id,'arrival');
      if(distanceToTarget>42){const pathSize=Math.min(132,Math.max(78,distanceToTarget*.34));ctx.save();ctx.translate(this.hero.pos.x+dx*.52,this.hero.pos.y+dy*.52);ctx.rotate(angle);ctx.globalAlpha=transitionAlpha;ctx.drawImage(this.mapSafeLaneTransitionVfxAtlasImage,pathSprite.sx,pathSprite.sy,pathSprite.sw,pathSprite.sh,-pathSize/2,-pathSize/2,pathSize,pathSize);ctx.restore();}
      const arrivalSize=86;ctx.save();ctx.globalAlpha=(transitionAlpha+.08)*Math.max(0,Math.min(1,arrivalAlphaScale));ctx.drawImage(this.mapSafeLaneTransitionVfxAtlasImage,arrivalSprite.sx,arrivalSprite.sy,arrivalSprite.sw,arrivalSprite.sh,safeLaneVisualTarget.x-arrivalSize/2,safeLaneVisualTarget.y-arrivalSize/2,arrivalSize,arrivalSize);ctx.restore();
    }
  }

  private queueObjectiveActivationMaterializationVfx(objectiveId:import('./battlefield-objectives.js').BattlefieldObjectiveId,x:number,y:number):void{const maxTtl=1.08;this.objectiveActivationMaterializationVfx.push({objectiveId,x,y,ttl:maxTtl,maxTtl});if(this.objectiveActivationMaterializationVfx.length>8)this.objectiveActivationMaterializationVfx.splice(0,this.objectiveActivationMaterializationVfx.length-8);}

  private drawObjectiveActivationMaterializationVfx(ctx:CanvasRenderingContext2D):void{
    if(!this.worldVfxLayerAllowed('objective-activation'))return;
    if(!this.objectiveActivationMaterializationVfxAtlasReady||!this.objectiveActivationMaterializationVfxAtlasImage)return;
    for(const cue of this.objectiveActivationMaterializationVfx){const progress=1-Math.max(0,cue.ttl/cue.maxTtl),alphaCap=this.presentationSettings.reducedFlash?0.26:0.48;const materializeSprite=objectiveActivationMaterializationVfxSprite(cue.objectiveId,'materialize'),locatorSprite=objectiveActivationMaterializationVfxSprite(cue.objectiveId,'locator');const materializeSize=146*(.9+progress*.22),cueAlpha=this.worldVfxCueAlpha('tactical',cue.x,cue.y,materializeSize*.5);if(cueAlpha<=0)continue;ctx.save();ctx.globalAlpha=Math.min(alphaCap,(1-progress)*.66+.08)*cueAlpha;ctx.drawImage(this.objectiveActivationMaterializationVfxAtlasImage,materializeSprite.sx,materializeSprite.sy,materializeSprite.sw,materializeSprite.sh,cue.x-materializeSize/2,cue.y-materializeSize/2,materializeSize,materializeSize);ctx.restore();const dx=cue.x-this.hero.pos.x,dy=cue.y-this.hero.pos.y,distanceToCue=Math.hypot(dx,dy);if(distanceToCue>54&&progress<.82){const angle=Math.atan2(dy,dx),locatorSize=Math.min(122,Math.max(74,distanceToCue*.24));ctx.save();ctx.translate(this.hero.pos.x+dx*.48,this.hero.pos.y+dy*.48);ctx.rotate(angle);ctx.globalAlpha=Math.min(alphaCap*.92,(1-progress)*.52+.06)*cueAlpha;ctx.drawImage(this.objectiveActivationMaterializationVfxAtlasImage,locatorSprite.sx,locatorSprite.sy,locatorSprite.sw,locatorSprite.sh,-locatorSize/2,-locatorSize/2,locatorSize,locatorSize);ctx.restore();}}
  }

  private queueBossArenaTransitionWorldVfx(archetype:BossArchetype,state:BossArenaTransitionWorldVfxState,x:number,y:number,radius:number):void{const maxTtl=state==='entrance'?1.18:.96;this.bossArenaTransitionWorldVfx.push({archetype,state,x,y,radius:Math.max(56,radius),ttl:maxTtl,maxTtl});if(this.bossArenaTransitionWorldVfx.length>12)this.bossArenaTransitionWorldVfx.splice(0,this.bossArenaTransitionWorldVfx.length-12);}

  private drawBossArenaTransitionWorldVfx(ctx:CanvasRenderingContext2D):void{
    if(!this.worldVfxLayerAllowed('boss-arena-transition'))return;
    if(!this.bossArenaTransitionWorldVfxAtlasReady||!this.bossArenaTransitionWorldVfxAtlasImage)return;
    for(const cue of this.bossArenaTransitionWorldVfx){const progress=1-Math.max(0,cue.ttl/cue.maxTtl),sprite=bossArenaTransitionWorldVfxSprite(cue.archetype,cue.state),baseSize=Math.max(340,cue.radius*6.4),size=cue.state==='entrance'?baseSize*(.74+progress*.34):baseSize*(.92+progress*.42),alphaCap=this.presentationSettings.reducedFlash?0.30:0.58,cueAlpha=this.worldVfxCueAlpha('tactical',cue.x,cue.y,size*.5);if(cueAlpha<=0)continue;ctx.save();ctx.globalAlpha=Math.min(alphaCap,(1-progress)*.64+.06)*cueAlpha;ctx.drawImage(this.bossArenaTransitionWorldVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.x-size/2,cue.y-size/2,size,size);ctx.restore();}
  }

  private drawMapCombatBoundaryWarnings(ctx:CanvasRenderingContext2D):void{if(!this.mapCombatBoundaryWarningVfxAtlasReady||!this.mapCombatBoundaryWarningVfxAtlasImage)return;const mapId=this.terrain.currentLayout.id,alphaCap=this.presentationSettings.reducedFlash?0.22:0.40;const left=ARENA_MARGIN,right=LOGICAL_WIDTH-ARENA_MARGIN,top=ARENA_MARGIN+38,bottom=LOGICAL_HEIGHT-ARENA_MARGIN;const boundaryDistances=[this.hero.pos.x-left,right-this.hero.pos.x,this.hero.pos.y-top,bottom-this.hero.pos.y];let nearestBoundaryIndex=0;for(let i=1;i<boundaryDistances.length;i++)if(boundaryDistances[i]!<boundaryDistances[nearestBoundaryIndex]!)nearestBoundaryIndex=i;const nearestBoundaryDistance=boundaryDistances[nearestBoundaryIndex]!;if(nearestBoundaryDistance<=118){const sprite=mapCombatBoundaryWarningVfxSprite(mapId,'boundary'),x=nearestBoundaryIndex===0?left:nearestBoundaryIndex===1?right:this.hero.pos.x,y=nearestBoundaryIndex===2?top:nearestBoundaryIndex===3?bottom:this.hero.pos.y,rotation=nearestBoundaryIndex<2?Math.PI/2:0,size=96;ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.globalAlpha=alphaCap*Math.max(.22,1-nearestBoundaryDistance/142);ctx.drawImage(this.mapCombatBoundaryWarningVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,-size/2,-size/2,size,size);ctx.restore();}const obstacleSprite=mapCombatBoundaryWarningVfxSprite(mapId,'obstacle');const nearWalls=this.terrain.walls.map((wall)=>{const px=clamp(this.hero.pos.x,wall.x,wall.x+wall.w),py=clamp(this.hero.pos.y,wall.y,wall.y+wall.h);return{px,py,distance:Math.hypot(this.hero.pos.x-px,this.hero.pos.y-py)};}).filter((entry)=>entry.distance<=112).sort((a,b)=>a.distance-b.distance).slice(0,3);for(const entry of nearWalls){const size=82;ctx.save();ctx.globalAlpha=alphaCap*Math.max(.18,1-entry.distance/128);ctx.drawImage(this.mapCombatBoundaryWarningVfxAtlasImage,obstacleSprite.sx,obstacleSprite.sy,obstacleSprite.sw,obstacleSprite.sh,entry.px-size/2,entry.py-size/2,size,size);ctx.restore();}}

  private queueObjectiveFailureDissolveVfx(objectiveId:import('./battlefield-objectives.js').BattlefieldObjectiveId,x:number,y:number):void{const maxTtl=1.02;this.objectiveFailureDissolveVfx.push({objectiveId,x,y,ttl:maxTtl,maxTtl});if(this.objectiveFailureDissolveVfx.length>8)this.objectiveFailureDissolveVfx.splice(0,this.objectiveFailureDissolveVfx.length-8);}

  private drawObjectiveFailureDissolveVfx(ctx:CanvasRenderingContext2D):void{
    if(!this.worldVfxLayerAllowed('objective-failure'))return;
    if(!this.objectiveFailureDissolveVfxAtlasReady||!this.objectiveFailureDissolveVfxAtlasImage)return;
    for(const cue of this.objectiveFailureDissolveVfx){const progress=1-Math.max(0,cue.ttl/cue.maxTtl),state=progress<0.46?'fracture':'dissolve',sprite=objectiveFailureDissolveVfxSprite(cue.objectiveId,state),size=(state==='fracture'?148:166)*(1+progress*.15),alphaCap=this.presentationSettings.reducedFlash?0.28:0.54,cueAlpha=this.worldVfxCueAlpha('tactical',cue.x,cue.y,size*.5);if(cueAlpha<=0)continue;ctx.save();ctx.globalAlpha=Math.min(alphaCap,(1-progress)*.68+.05)*cueAlpha;ctx.drawImage(this.objectiveFailureDissolveVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.x-size/2,cue.y-size/2,size,size);ctx.restore();}
  }

  private queueFieldEventLifecycleWorldVfx(eventId:FieldEventId,state:FieldEventLifecycleWorldVfxState,x:number,y:number):void{const maxTtl=state==='entrance'?1.06:.88;this.fieldEventLifecycleWorldVfx.push({eventId,state,x,y,ttl:maxTtl,maxTtl});if(this.fieldEventLifecycleWorldVfx.length>10)this.fieldEventLifecycleWorldVfx.splice(0,this.fieldEventLifecycleWorldVfx.length-10);}

  private finishFieldEventLifecycleWorldVfx(event:ActiveFieldEvent):void{const anchor=this.fieldEventWorldAnchor?.id===event.id?this.fieldEventWorldAnchor:{id:event.id,x:this.hero.pos.x,y:this.hero.pos.y};this.queueFieldEventLifecycleWorldVfx(event.id,'exit',anchor.x,anchor.y);this.fieldEventWorldAnchor=null;}

  private drawFieldEventLifecycleWorldVfx(ctx:CanvasRenderingContext2D):void{
    if(!this.worldVfxLayerAllowed('field-event-lifecycle'))return;
    if(this.worldVfxLayerAlpha('informational')<=0)return;
    if(!this.fieldEventLifecycleWorldVfxAtlasReady||!this.fieldEventLifecycleWorldVfxAtlasImage)return;
    for(const cue of this.fieldEventLifecycleWorldVfx){const progress=1-Math.max(0,cue.ttl/cue.maxTtl),sprite=fieldEventLifecycleWorldVfxSprite(cue.eventId,cue.state),size=(cue.state==='entrance'?172:154)*(1+(cue.state==='entrance'?progress*.18:progress*.28)),alphaCap=this.presentationSettings.reducedFlash?0.26:0.50,cueAlpha=this.worldVfxCueAlpha('informational',cue.x,cue.y,size*.5);if(cueAlpha<=0)continue;ctx.save();ctx.globalAlpha=Math.min(alphaCap,(1-progress)*.62+.05)*cueAlpha;ctx.drawImage(this.fieldEventLifecycleWorldVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.x-size/2,cue.y-size/2,size,size);ctx.restore();}
  }

  private queueElitePackApproachFormationVfx(enemyIds:number[],target:import('./enemies.js').EnemyTarget):void{if(enemyIds.length<2)return;const maxTtl=4.4;this.elitePackApproachFormationVfx.push({enemyIds:[...enemyIds],target,ttl:maxTtl,maxTtl});if(this.elitePackApproachFormationVfx.length>3)this.elitePackApproachFormationVfx.splice(0,this.elitePackApproachFormationVfx.length-3);}

  private drawElitePackApproachFormationVfx(ctx:CanvasRenderingContext2D):void{
    if(!this.worldVfxLayerAllowed('elite-pack-approach'))return;
    if(!this.elitePackApproachFormationVfxAtlasReady||!this.elitePackApproachFormationVfxAtlasImage)return;
    for(const cue of this.elitePackApproachFormationVfx){const members=cue.enemyIds.map(id=>this.enemies.enemies.find(enemy=>enemy.alive&&enemy.id===id)).filter((enemy):enemy is Enemy=>Boolean(enemy));if(members.length<2)continue;const centroid={x:members.reduce((sum,enemy)=>sum+enemy.pos.x,0)/members.length,y:members.reduce((sum,enemy)=>sum+enemy.pos.y,0)/members.length};const spread=Math.max(...members.map(enemy=>Math.hypot(enemy.pos.x-centroid.x,enemy.pos.y-centroid.y)));const targetPos=cue.target==='hero'?this.hero.pos:this.core.pos,dx=targetPos.x-centroid.x,dy=targetPos.y-centroid.y,distanceToTarget=Math.hypot(dx,dy),angle=Math.atan2(dy,dx),alphaCap=this.presentationSettings.reducedFlash?0.22:0.42;const formation=elitePackApproachFormationVfxSprite(cue.target,'formation'),formationSize=Math.max(126,Math.min(250,spread*2.25+92)),formationAlpha=this.worldVfxCueAlpha('tactical',centroid.x,centroid.y,formationSize*.5);if(formationAlpha>0){ctx.save();ctx.globalAlpha=alphaCap*formationAlpha;ctx.drawImage(this.elitePackApproachFormationVfxAtlasImage,formation.sx,formation.sy,formation.sw,formation.sh,centroid.x-formationSize/2,centroid.y-formationSize/2,formationSize,formationSize);ctx.restore();}if(distanceToTarget>96){const approach=elitePackApproachFormationVfxSprite(cue.target,'approach'),approachSize=Math.min(146,Math.max(86,distanceToTarget*.28)),approachX=centroid.x+dx*.43,approachY=centroid.y+dy*.43,approachAlpha=this.worldVfxCueAlpha('tactical',approachX,approachY,approachSize*.5);if(approachAlpha>0){ctx.save();ctx.translate(approachX,approachY);ctx.rotate(angle);ctx.globalAlpha=alphaCap*.92*approachAlpha;ctx.drawImage(this.elitePackApproachFormationVfxAtlasImage,approach.sx,approach.sy,approach.sw,approach.sh,-approachSize/2,-approachSize/2,approachSize,approachSize);ctx.restore();}}if(distanceToTarget<360){const focus=elitePackApproachFormationVfxSprite(cue.target,'focus'),focusSize=84,focusAlpha=this.worldVfxCueAlpha('tactical',targetPos.x,targetPos.y,focusSize*.5);if(focusAlpha>0){ctx.save();ctx.globalAlpha=alphaCap*.78*focusAlpha;ctx.drawImage(this.elitePackApproachFormationVfxAtlasImage,focus.sx,focus.sy,focus.sw,focus.sh,targetPos.x-focusSize/2,targetPos.y-focusSize/2,focusSize,focusSize);ctx.restore();}}}
  }

  private updateBattlefieldObjective(dt: number): void {
    const active = this.objectiveRuntime.active;
    if (!active) return;
    let nearbyEnemies = 0;
    for (const enemy of this.enemies.enemies) {
      if (enemy.alive && distance(enemy.pos, active.pos) <= 155 + enemy.radius) nearbyEnemies += 1;
    }
    const transition = this.objectiveRuntime.update(dt, { hero: this.hero.pos, nearbyEnemies });
    if (transition.completed) {
      this.battlefieldObjectives.completeActive(this.elapsed);
      this.queueObjectiveCompletionCeremonyVfx(active.id,active.pos.x,active.pos.y,transition.rewards);
      this.applyObjectiveRewards(transition.rewards);
      this.showObjectiveCompletionToast(active.id, transition.rewards);
    } else if (transition.failed) {
      this.queueObjectiveFailureDissolveVfx(active.id,active.pos.x,active.pos.y);
      this.battlefieldObjectives.completeActive(this.elapsed);
      this.showTacticalStatusEventToast('전장 목표 실패', active.id);
    }
  }

  private queueObjectiveCompletionCeremonyVfx(objectiveId:import('./battlefield-objectives.js').BattlefieldObjectiveId,x:number,y:number,rewards:readonly ObjectiveReward[]):void{const maxTtl=.86;this.objectiveCompletionCeremonyVfx.push({objectiveId,x,y,rewardCount:rewards.length,ttl:maxTtl,maxTtl});if(this.objectiveCompletionCeremonyVfx.length>8)this.objectiveCompletionCeremonyVfx.splice(0,this.objectiveCompletionCeremonyVfx.length-8);}

  private drawObjectiveCompletionCeremonyVfx(ctx:CanvasRenderingContext2D):void{
    if(!this.worldVfxLayerAllowed('objective-completion'))return;
    if(!this.objectiveCompletionCeremonyVfxAtlasReady||!this.objectiveCompletionCeremonyVfxAtlasImage)return;
    for(const cue of this.objectiveCompletionCeremonyVfx){const progress=1-Math.max(0,cue.ttl/cue.maxTtl),state=progress<0.48?'burst':'reward',sprite=objectiveCompletionCeremonyVfxSprite(cue.objectiveId,state),rewardScale=1+Math.min(2,cue.rewardCount)*.06,size=(state==='burst'?150:128)*rewardScale*(1+progress*.16),cueAlpha=this.worldVfxCueAlpha('informational',cue.x,cue.y,size*.5);if(cueAlpha<=0)continue;ctx.save();ctx.globalAlpha=Math.min(this.presentationSettings.reducedFlash?0.34:0.66,(1-progress)*.78+.06)*cueAlpha;ctx.drawImage(this.objectiveCompletionCeremonyVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.x-size/2,cue.y-size/2,size,size);ctx.restore();}
  }

  private applyObjectiveRewards(rewards: readonly ObjectiveReward[]): void {
    const rewardMultiplier = fateRewardMultipliers(this.fateRuntime.modifiers).objectiveRewardMultiplier;
    for (const reward of rewards) {
      const scaledAmount = reward.kind === 'temporaryPower' ? reward.amount : Math.max(1, Math.round(reward.amount * rewardMultiplier));
      if (reward.kind === 'gold') {
        this.equipmentState = { ...this.equipmentState, coins: this.equipmentState.coins + scaledAmount };
        this.goldEarned += scaledAmount;
      } else if (reward.kind === 'shopToken') {
        this.shopTokens += scaledAmount;
      } else if (reward.kind === 'potion') {
        this.equipmentState = { ...this.equipmentState, healingPotions: this.equipmentState.healingPotions + scaledAmount };
      } else if (reward.kind === 'temporaryPower') {
        this.objectivePowerTimer = Math.max(this.objectivePowerTimer, reward.amount);
      }
    }
    this.syncEquipmentState();
  }

  private drawBattlefieldObjective(ctx: CanvasRenderingContext2D): void {
    const active = this.objectiveRuntime.active;
    if (!active) return;
    const def = objectiveDefinition(active.id);
    const boss=this.enemies.enemies.find((enemy)=>enemy.alive&&enemy.type==='boss')??null;
    const attention=combatAttentionPolicy({heroCritical:this.dangerState.heroCritical,coreCritical:this.dangerState.coreCritical,damageSeverity:this.damageReasonState?.severity??null,bossSpecialTimer:boss?.specialTimer??99,bossCountdown:this.enemies.bossCountdown,reducedFlash:this.presentationSettings.reducedFlash,reducedMotion:this.presentationSettings.reducedMotion});
    const markerMotion=objectiveMarkerMotionPolicy({combatPrimary:attention.primary,reducedFlash:this.presentationSettings.reducedFlash,reducedMotion:this.presentationSettings.reducedMotion,active:true});
    const pulse = 1 + (markerMotion.animated ? Math.sin(this.elapsed * 4.2) * markerMotion.motionAmplitude : 0);
    ctx.save();
    ctx.translate(active.pos.x, active.pos.y);
    ctx.scale(pulse, pulse);
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = def.accent;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(0, 0, active.id === 'beaconDefense' ? 72 : 58, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = def.accent;
    ctx.beginPath(); ctx.arc(0, 0, active.id === 'beaconDefense' ? 68 : 54, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    const ratio = active.id === 'riftSeal' ? active.progress / 100 : active.id === 'beaconDefense' ? active.hp / 100 : active.activated ? active.timeLeft / 22 : 1;
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, active.id === 'beaconDefense' ? 82 : 68, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(ratio, 0, 1)); ctx.stroke();
    const iconPresentation=tacticalStatusIconPresentation(active.id);
    const objectiveInteractionVisible=this.battlefieldInteractionVfxAtlasReady&&Boolean(this.battlefieldInteractionVfxAtlasImage);
    if(objectiveInteractionVisible&&this.battlefieldInteractionVfxAtlasImage){
      const sprite=battlefieldInteractionSprite('objective',active.id);
      const size=active.id==='beaconDefense'?70:64;
      ctx.drawImage(this.battlefieldInteractionVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,-size/2,-size/2-7,size,size);
    }else if(iconPresentation.visible&&this.tacticalStatusIconAtlasImage&&this.tacticalStatusIconAtlasReady){
      const sprite=iconPresentation.sprite;
      const size=active.id==='beaconDefense'?42:38;
      ctx.drawImage(this.tacticalStatusIconAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,-size/2,-size/2-7,size,size);
    }
    if(!this.hideObjectiveHelperIdentity())this.drawObjectiveActionIdentity(ctx,active.id,active.id==='beaconDefense'?34:30,-34,22);
    ctx.fillStyle = '#fff'; ctx.font = '900 13px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(active.id === 'cursedAltar' && !active.activated ? 'ENTER' : def.name, 0, objectiveInteractionVisible||(iconPresentation.visible&&this.tacticalStatusIconAtlasReady)?27:4);
    ctx.restore();
  }

  private hideRunMissionHelperIdentity(): boolean {
    const boss=this.enemies.enemies.find(enemy=>enemy.alive&&enemy.type==='boss')??null;
    const heroCritical=this.dangerState.heroCritical,coreCritical=this.dangerState.coreCritical,bossSpecialTimer=boss?.specialTimer??99;
    return heroCritical||coreCritical||bossSpecialTimer <= 1.2;
  }

  private drawRunMissionPaceRewardRecall(ctx:CanvasRenderingContext2D,paceId:RunMissionPaceIdentityId,reward:RunMissionReward,y:number):void{
    if(this.hideRunMissionHelperIdentity())return;
    const size=18,dy=y+21;
    if(this.runMissionPaceIdentityAtlasReady&&this.runMissionPaceIdentityAtlasImage){const pace=runMissionPaceIdentityIcon(paceId),image=this.runMissionPaceIdentityAtlasImage,x=900;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.9)';ctx.fillRect(x-2,dy-2,size+4,size+4);ctx.drawImage(image,pace.sx,pace.sy,pace.sw,pace.sh,x,dy,size,size);ctx.restore();}
    if(this.objectiveRewardIdentityAtlasReady&&this.objectiveRewardIdentityAtlasImage){const icon=objectiveRewardIdentityIcon(reward.kind),image=this.objectiveRewardIdentityAtlasImage,x=944;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.9)';ctx.fillRect(x-2,dy-2,size+4,size+4);ctx.drawImage(image,icon.sx,icon.sy,icon.sw,icon.sh,x,dy,size,size);ctx.fillStyle='#eef8ff';ctx.font='800 10px system-ui';ctx.textAlign='left';ctx.fillText(`×${reward.amount}`,x+20,dy+13);ctx.restore();}
  }

  private showRunMissionCompletionToast(mission:ActiveRunMission):void{
    const reward=mission.reward,rewardText=reward.kind==='shopToken'?`상점권 +${reward.amount}`:reward.kind==='gold'?`+${reward.amount}G`:`물약 +${reward.amount}`;
    this.showTacticalStatusEventToast(`미션 성공 · ${rewardText}`,mission.id);
    this.eventToastMissionReward={...reward};
  }

  private showRunMissionFailureToast(mission:ActiveRunMission):void{
    this.showTacticalStatusEventToast(`미션 종료 · ${mission.name}`,mission.id);
    this.eventToastMissionReward = null;
  }

  private hideObjectiveHelperIdentity(): boolean {
    const boss=this.enemies.enemies.find(enemy=>enemy.alive&&enemy.type==='boss')??null;
    const heroCritical=this.dangerState.heroCritical,coreCritical=this.dangerState.coreCritical,bossSpecialTimer=boss?.specialTimer??99;
    return heroCritical||coreCritical||bossSpecialTimer <= 1.2;
  }

  private hideFieldEventHelperIdentity(): boolean {
    const boss=this.enemies.enemies.find(enemy=>enemy.alive&&enemy.type==='boss')??null;
    const heroCritical=this.dangerState.heroCritical,coreCritical=this.dangerState.coreCritical,bossSpecialTimer=boss?.specialTimer??99;
    return heroCritical||coreCritical||bossSpecialTimer <= 1.2;
  }

  private drawFieldEventResponseIdentity(ctx:CanvasRenderingContext2D,eventId:FieldEventId,x:number,y:number,size:number):void{
    if(this.hideFieldEventHelperIdentity()||!this.fieldEventResponseIdentityAtlasReady||!this.fieldEventResponseIdentityAtlasImage)return;
    const icon=fieldEventResponseIdentityIcon(fieldEventResponseIdentityForEvent(eventId));const image=this.fieldEventResponseIdentityAtlasImage;
    ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.9)';ctx.fillRect(x-size/2-2,y-size/2-2,size+4,size+4);ctx.drawImage(image,icon.sx,icon.sy,icon.sw,icon.sh,x-size/2,y-size/2,size,size);ctx.restore();
  }

  private drawFieldEventEffectProfileIdentity(ctx:CanvasRenderingContext2D,eventId:FieldEventId,x:number,y:number,size:number):void{
    if(this.hideFieldEventHelperIdentity()||!this.fieldEventEffectProfileIdentityAtlasReady||!this.fieldEventEffectProfileIdentityAtlasImage)return;
    const icon=fieldEventEffectProfileIdentityIcon(fieldEventEffectProfileIdentityForEvent(eventId));const image=this.fieldEventEffectProfileIdentityAtlasImage;
    ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.9)';ctx.fillRect(x-size/2-2,y-size/2-2,size+4,size+4);ctx.drawImage(image,icon.sx,icon.sy,icon.sw,icon.sh,x-size/2,y-size/2,size,size);ctx.restore();
  }

  private drawFieldEventResponseEffectRecall(ctx:CanvasRenderingContext2D,eventId:FieldEventId,y:number):void{
    this.drawFieldEventResponseIdentity(ctx,eventId,628,y+30,18);
    this.drawFieldEventEffectProfileIdentity(ctx,eventId,650,y+30,18);
  }

  private drawGoldenGoblinEventResponseIdentity(ctx:CanvasRenderingContext2D):void{
    if(this.fieldEvents.active?.id!=='goldenGoblin'||this.goldenGoblinEnemyId===null)return;
    const enemy=this.enemies.enemies.find(value=>value.alive&&value.id===this.goldenGoblinEnemyId);if(!enemy)return;
    this.drawFieldEventResponseIdentity(ctx,'goldenGoblin',enemy.pos.x,enemy.pos.y-enemy.radius-26,20);
  }

  private drawObjectiveActionIdentity(ctx:CanvasRenderingContext2D,objectiveId:import('./battlefield-objectives.js').BattlefieldObjectiveId,x:number,y:number,size:number):void{
    if(!this.objectiveActionIdentityAtlasReady||!this.objectiveActionIdentityAtlasImage)return;
    const icon=objectiveActionIdentityIcon(objectiveActionIdentityForObjective(objectiveId));
    ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.88)';ctx.fillRect(x-size/2-2,y-size/2-2,size+4,size+4);ctx.drawImage(this.objectiveActionIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x-size/2,y-size/2,size,size);ctx.restore();
  }

  private drawObjectiveRewardPreview(ctx:CanvasRenderingContext2D,rewards:readonly ObjectiveReward[],rewardMultiplier:number,y:number):void{
    if(!this.objectiveRewardIdentityAtlasReady||!this.objectiveRewardIdentityAtlasImage)return;
    const image=this.objectiveRewardIdentityAtlasImage,visible=rewards.slice(0, 2),size=18,startX=944;
    ctx.save();
    visible.forEach((reward,index)=>{const icon=objectiveRewardIdentityIcon(reward.kind),x=startX+index*43,dy=y+21,amount=objectiveRewardPreviewAmount(reward,rewardMultiplier);ctx.fillStyle='rgba(4,8,14,.9)';ctx.fillRect(x-2,dy-2,size+4,size+4);ctx.drawImage(image,icon.sx,icon.sy,icon.sw,icon.sh,x,dy,size,size);ctx.fillStyle='#eef8ff';ctx.font='800 10px system-ui';ctx.textAlign='left';ctx.fillText(`×${amount}`,x+20,dy+13);});
    ctx.restore();
  }

  private showObjectiveCompletionToast(id:import('./battlefield-objectives.js').BattlefieldObjectiveId,rewards:readonly ObjectiveReward[]):void{
    this.showTacticalStatusEventToast(`전장 목표 완료 · 연속 ${this.objectiveRuntime.stats.currentStreak}`,id);
    this.eventToastObjectiveRewards=[...rewards].slice(0,2);
    this.eventToastObjectiveRewardMultiplier=fateRewardMultipliers(this.fateRuntime.modifiers).objectiveRewardMultiplier;
  }

  private showRunContractSuccessToast(family:ContractFamily):void{
    this.showEventToast('런 계약 성공 · 90초 강화 획득',null,null,null,null,null,family);
    this.eventToastContractBoonFamily=family;
  }

  private showEventToast(message: string, lastLawId: MythicLastLawId | null = null, mythicTacticArchetype: BossArchetype | null = null, ascensionMutator: AscensionMutatorIdentityId | null = null, fatePath: FatePathId | null = null, oathKind: LongRunOathKind | null = null, contractFamily: ContractFamily | null = null, relicResonance: { relicId: RelicId; tier: ActiveRelicResonanceTier } | null = null, nemesisAdaptations: readonly BossAdaptation[] = [], worldEvolution: WorldEvolutionIdentityId | null = null, bossArenaMutation: BossArenaMutationKind | null = null, visualIdentity: { heroMeterId?:HeroMeterIdentityId; arcaneComboFamily?:ArcaneComboIdentityId; tacticalStatusIconId?:TacticalStatusIconId; buildIdentityId?:BuildIdentityId; synergyId?:SynergyIdentityId; legendaryItemId?:LegendaryAwakeningItemId; spellEvolution?:{spellId:SpellId;tier:1|2}; runTraitId?:RunTraitId; ascensionSelectionId?:import('./endless/hero-ascension.js').HeroAscensionId; mythicPhase?:MythicPhaseIdentityId; bossArchetype?:BossArchetype; bossVariantTier?:BossVariantTier; apexSecondaryArchetype?:BossArchetype; perfectEvadeStreak?:PerfectEvadeStreak; bossWeakpointBreakArchetype?:BossArchetype; fieldEventId?:FieldEventId } | null = null): void {
    if(!eightTwelveHourToastFocus(this.elapsed,message).show)return;
    if(!fourEightHourToastFocus(this.elapsed,message).show)return;
    this.eventToastObjectiveRewards = [];
    this.eventToastObjectiveRewardMultiplier = 1;
    this.eventToastMissionReward = null;
    this.eventToastContractBoonFamily = null;
    this.eventToastFateImpact = null;
    this.eventToastRelicProjection = null;
    this.eventToastSpellEvolutionProjection = null;
    this.eventToastHeroAscensionProjection = null;
    this.eventToastFusionProjection = null;
    this.eventToastBuildOverdriveProjection = null;
    this.eventToastBattlefieldEvolutionProjection = null;
    this.eventToastAscensionTierProjection = null;
    this.eventToastFieldEventId = visualIdentity?.fieldEventId ?? null;
    this.eventToast = message;
    this.eventToastLastLawId = lastLawId;
    this.eventToastMythicTacticArchetype = mythicTacticArchetype;
    this.eventToastMythicPhase = visualIdentity?.mythicPhase ?? null;
    this.eventToastBossArchetype = visualIdentity?.bossArchetype ?? null;
    this.eventToastBossVariantTier = visualIdentity?.bossVariantTier ?? null;
    this.eventToastApexSecondaryArchetype = visualIdentity?.apexSecondaryArchetype ?? null;
    this.eventToastBossWeakpointBreakArchetype = visualIdentity?.bossWeakpointBreakArchetype ?? null;
    this.eventToastPerfectEvadeStreak = visualIdentity?.perfectEvadeStreak ?? null;
    this.eventToastAscensionMutator = ascensionMutator;
    this.eventToastFatePath = fatePath;
    this.eventToastOathKind = oathKind;
    this.eventToastContractFamily = contractFamily;
    this.eventToastRelicResonance = relicResonance;
    this.eventToastNemesisAdaptations = [...nemesisAdaptations].slice(0,3);
    this.eventToastWorldEvolution = worldEvolution;
    this.eventToastBossArenaMutation = bossArenaMutation;
    this.eventToastHeroMeterId = visualIdentity?.heroMeterId ?? null;
    this.eventToastArcaneComboFamily = visualIdentity?.arcaneComboFamily ?? null;
    this.eventToastTacticalStatusIconId = visualIdentity?.tacticalStatusIconId ?? null;
    this.eventToastBuildIdentityId = visualIdentity?.buildIdentityId ?? null;
    this.eventToastSynergyId = visualIdentity?.synergyId ?? null;
    this.eventToastLegendaryItemId = visualIdentity?.legendaryItemId ?? null;
    this.eventToastSpellEvolution = visualIdentity?.spellEvolution ?? null;
    this.eventToastRunTraitId = visualIdentity?.runTraitId ?? null;
    this.eventToastAscensionSelectionId = visualIdentity?.ascensionSelectionId ?? null;
    const comfort = longRunComfortPolicy(this.elapsed);
    this.eventToastTimer = 2.4 / comfort.notificationCadenceMultiplier;
  }

  private showBattlefieldEvolutionToast(stage:1|2):void{
    const projection=projectBattlefieldEvolutionImpact(this.terrain.currentLayout.id,stage),hint=battlefieldEvolutionImpactHint(projection);
    this.showEventToast(`${mapEvolutionLabel(this.terrain.currentLayout.id,stage)}${hint?` · ${hint}`:''}`);
    this.eventToastBattlefieldEvolutionProjection=projection;
  }

  private showAscensionTierEventToast(tier:number):void{
    const projection=projectAscensionTierOutcome(tier);
    this.showEventToast(`ASCENSION ${tier} · ${ascensionTierPressureHint(projection)}`);
    this.eventToastAscensionTierProjection=projection;
  }

  private showAscensionMutatorEventToast(effect:Extract<EndlessEffect,{type:'ascension_mutator'}>):void{
    const projection=this.eventToastAscensionTierProjection??projectAscensionTierOutcome(this.endlessState.ascension.tier);
    this.showEventToast(`승천 변이 · ${this.endlessMutatorName(effect.mutator)}`,null,null,effect.mutator as AscensionMutatorIdentityId);
    this.eventToastAscensionTierProjection=projection;
  }

  private showBuildOverdriveActivationToast(archetype:BuildArchetype,state:import('./endless/build-overdrive.js').BuildOverdriveState):void{
    const projection=projectBuildOverdriveEffects(state,archetype,this.elapsed*1000);
    this.showEventToast(buildOverdriveActivationToastLabel(this.endlessArchetypeName(archetype),projection));
    this.eventToastBuildOverdriveProjection=projection;
  }

  private showHeroMeterEventToast(message:string,id:HeroMeterIdentityId):void { this.showEventToast(message,null,null,null,null,null,null,null,[],null,null,{heroMeterId:id}); }
  private showArcaneComboEventToast(message:string,family:ArcaneComboIdentityId):void { this.showEventToast(message,null,null,null,null,null,null,null,[],null,null,{arcaneComboFamily:family}); }
  private showTacticalStatusEventToast(message:string,id:TacticalStatusIconId):void { this.showEventToast(message,null,null,null,null,null,null,null,[],null,null,{tacticalStatusIconId:id}); }
  private showFieldEventStartToast(message:string,id:FieldEventId):void { this.showEventToast(message,null,null,null,null,null,null,null,[],null,null,{tacticalStatusIconId:id,fieldEventId:id}); }
  private showBuildIdentityEventToast(message:string,id:BuildIdentityId):void { this.showEventToast(message,null,null,null,null,null,null,null,[],null,null,{buildIdentityId:id}); }
  private showSynergyEventToast(message:string,id:SynergyIdentityId):void { this.showEventToast(message,null,null,null,null,null,null,null,[],null,null,{synergyId:id}); }
  private showLegendaryAwakeningEventToast(message:string,id:LegendaryAwakeningItemId):void { this.showEventToast(message,null,null,null,null,null,null,null,[],null,null,{legendaryItemId:id}); }
  private showSpellEvolutionEventToast(message:string,spellId:SpellId,tier:1|2,projection:SpellEvolutionProjection|null=null):void { this.showEventToast(message,null,null,null,null,null,null,null,[],null,null,{spellEvolution:{spellId,tier}}); this.eventToastSpellEvolutionProjection=projection; }
  private showRunTraitEventToast(message:string,id:RunTraitId):void { this.showEventToast(message,null,null,null,null,null,null,null,[],null,null,{runTraitId:id}); }
  private showDeepRunAscensionEventToast(message:string,id:import('./endless/hero-ascension.js').HeroAscensionId,projection:HeroAscensionProjection):void { this.showEventToast(message,null,null,null,null,null,null,null,[],null,null,{ascensionSelectionId:id}); this.eventToastHeroAscensionProjection=projection; }
  private showFusionProjectionEventToast(message:string,id:FusionId,projection:FusionSelectionProjection):void { this.showBuildIdentityEventToast(message,id); this.eventToastFusionProjection=projection; }
  private showMythicPhaseEventToast(message:string,phase:MythicPhaseIdentityId,bossArenaMutation:BossArenaMutationKind|null=null):void { this.showEventToast(message,null,null,null,null,null,null,null,[],null,bossArenaMutation,{mythicPhase:phase}); }
  private showPerfectEvadeEventToast(message:string,streak:number):void { this.showEventToast(message,null,null,null,null,null,null,null,[],null,null,{perfectEvadeStreak:normalizedPerfectEvadeStreak(streak)}); }

  private syncRunFoundationIdentityTracker(showToast=true):void{
    const trait=this.selectedTrait;
    if(!this.runFoundationIdentityInitialized){this.lastRunFoundationTrait=trait;this.runFoundationIdentityInitialized=true;if(showToast&&trait)this.showRunTraitEventToast(`전투 성향 · ${[...RUN_TRAITS,...MASTERY_RUN_TRAITS].find(v=>v.id===trait)?.name??trait}`,trait);return;}
    this.lastRunFoundationTrait=trait;
  }

  private drawRunTraitRecall(ctx:CanvasRenderingContext2D,x:number,y:number,size=18):void{
    const id=this.selectedTrait;if(!id||!this.decisionPathIconAtlasReady||!this.decisionPathIconAtlasImage)return;const icon=runTraitIdentity(id);
    ctx.save();ctx.globalAlpha=.95;ctx.fillStyle='rgba(6,12,22,.9)';ctx.fillRect(x-1,y-1,size+2,size+2);ctx.drawImage(this.decisionPathIconAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();
  }

  private notifySpellEvolutionIfChanged(spellId:SpellId,beforeTier:SpellEvolutionTier):boolean {
    const currentLevel=this.spells.levels[spellId],evolution=spellEvolution(this.hero.profileId,spellId,currentLevel);
    if(evolution.tier===0||evolution.tier<=beforeTier)return false;
    const tier=evolution.tier as 1|2,projection=projectSpellEvolutionSelection(this.hero.profileId,spellId,currentLevel-1);
    const detail=projection?` · ${spellEvolutionProjectionHint(projection)}`:'';
    this.showSpellEvolutionEventToast(`${tier===1?'1차 진화':'최종 진화'} · ${evolution.name}${detail}`,spellId,tier,projection);
    return true;
  }

  private drawHeroMeterToastIcon(ctx:CanvasRenderingContext2D):void {
    const id=this.eventToastHeroMeterId;if(!id||!this.heroMeterIdentityAtlasReady||!this.heroMeterIdentityAtlasImage)return;
    const icon=heroMeterIdentityIcon(id);ctx.save();ctx.globalAlpha=.96;ctx.shadowColor=icon.accent;ctx.shadowBlur=7;ctx.drawImage(this.heroMeterIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,602,827,28,28);ctx.restore();
  }
  private drawArcaneComboToastIcon(ctx:CanvasRenderingContext2D):void {
    const family=this.eventToastArcaneComboFamily;if(!family||!this.arcaneComboIdentityAtlasReady||!this.arcaneComboIdentityAtlasImage)return;
    const icon=arcaneComboIdentityIcon(family);ctx.save();ctx.globalAlpha=.96;ctx.drawImage(this.arcaneComboIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,602,827,28,28);ctx.restore();
  }
  private drawTacticalStatusToastIcon(ctx:CanvasRenderingContext2D):void {
    const id=this.eventToastTacticalStatusIconId;if(!id||!this.tacticalStatusIconAtlasReady||!this.tacticalStatusIconAtlasImage)return;
    const icon=tacticalStatusIconPresentation(id);if(!icon.visible)return;const sp=icon.sprite;ctx.save();ctx.globalAlpha=.96;ctx.drawImage(this.tacticalStatusIconAtlasImage,sp.sx,sp.sy,sp.sw,sp.sh,602,827,28,28);ctx.restore();
  }
  private drawFieldEventToastHelperIcons(ctx:CanvasRenderingContext2D):void{
    const id=this.eventToastFieldEventId;if(!id||this.hideFieldEventHelperIdentity())return;
    this.drawFieldEventResponseIdentity(ctx,id,648,841,24);
    this.drawFieldEventEffectProfileIdentity(ctx,id,680,841,24);
  }

  private drawObjectiveRewardToastIcons(ctx:CanvasRenderingContext2D):void{
    if(this.eventToastObjectiveRewards.length===0||!this.objectiveRewardIdentityAtlasReady||!this.objectiveRewardIdentityAtlasImage)return;
    const image=this.objectiveRewardIdentityAtlasImage,size=24,startX=634;
    this.eventToastObjectiveRewards.slice(0,2).forEach((reward,index)=>{const icon=objectiveRewardIdentityIcon(reward.kind),x=startX+index*48,amount=objectiveRewardPreviewAmount(reward,this.eventToastObjectiveRewardMultiplier);ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.92)';ctx.fillRect(x-1,827,size+2,size+2);ctx.drawImage(image,icon.sx,icon.sy,icon.sw,icon.sh,x,828,size,size);ctx.fillStyle='#fff';ctx.font='800 9px system-ui';ctx.textAlign='left';ctx.fillText(`×${amount}`,x+25,844);ctx.restore();});
  }

  private drawRunMissionToastRewardIcon(ctx:CanvasRenderingContext2D):void{
    const reward=this.eventToastMissionReward;if(!reward||this.hideRunMissionHelperIdentity()||!this.objectiveRewardIdentityAtlasReady||!this.objectiveRewardIdentityAtlasImage)return;
    const icon=objectiveRewardIdentityIcon(reward.kind),image=this.objectiveRewardIdentityAtlasImage,size=24,x=634;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.92)';ctx.fillRect(x-1,827,size+2,size+2);ctx.drawImage(image,icon.sx,icon.sy,icon.sw,icon.sh,x,828,size,size);ctx.fillStyle='#fff';ctx.font='800 9px system-ui';ctx.textAlign='left';ctx.fillText(`×${reward.amount}`,x+25,844);ctx.restore();
  }

  private drawBuildIdentityToastIcon(ctx:CanvasRenderingContext2D):void {
    const id=this.eventToastBuildIdentityId;if(!id||!this.buildIdentityAtlasReady||!this.buildIdentityAtlasImage)return;
    const icon=buildIdentityIcon(id);ctx.save();ctx.globalAlpha=.96;ctx.drawImage(this.buildIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,602,827,28,28);ctx.restore();
  }

  private drawSynergyToastIcon(ctx:CanvasRenderingContext2D):void{
    const id=this.eventToastSynergyId;if(!id||!this.synergyIdentityAtlasReady||!this.synergyIdentityAtlasImage)return;const icon=synergyIdentityIcon(id);ctx.save();ctx.globalAlpha=.96;ctx.drawImage(this.synergyIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,602,827,28,28);ctx.restore();
  }
  private drawLegendaryAwakeningToastIcon(ctx:CanvasRenderingContext2D):void{
    const id=this.eventToastLegendaryItemId;if(!id||!this.legendaryAwakeningAtlasReady||!this.legendaryAwakeningAtlasImage)return;const recall=legendaryProcIdentity({type:id==='blast-rod'?'nova':id==='golden-wand'?'bonusGold':id==='magnet-cloak'?'magnet':'coreHeal',...(id==='blast-rod'?{radius:0}:id==='golden-wand'?{amount:0}:id==='magnet-cloak'?{duration:0}:{fraction:0})} as LegendaryProc,this.equipmentState);const icon=recall?.icon;if(!icon)return;ctx.save();ctx.globalAlpha=.96;ctx.drawImage(this.legendaryAwakeningAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,602,827,28,28);ctx.restore();
  }

  private drawSpellEvolutionToastIcon(ctx:CanvasRenderingContext2D):void {
    const state=this.eventToastSpellEvolution;
    if(!state||!this.spellEvolutionCrestAtlasReady||!this.spellEvolutionCrestAtlasImage||!this.heroAbilityIconAtlasReady||!this.heroAbilityIconAtlasImage)return;
    const base=heroAbilityIdentityIcon(this.hero.profileId,({fireBolt:'spell1',chainLightning:'spell2',frostNova:'spell3',flameField:'spell4',meteorStorm:'ultimate1',blackHole:'ultimate2'} as const)[state.spellId]);
    const crest=spellEvolutionCrestFor(this.hero.profileId,state.tier);if(!crest)return;
    ctx.save();ctx.globalAlpha=.96;
    ctx.drawImage(this.heroAbilityIconAtlasImage,base.sx,base.sy,base.sw,base.sh,596,826,30,30);
    ctx.fillStyle='rgba(5,10,18,.92)';ctx.fillRect(618,840,18,18);
    ctx.drawImage(this.spellEvolutionCrestAtlasImage,crest.sx,crest.sy,crest.sw,crest.sh,619,841,16,16);
    ctx.strokeStyle=state.tier===2?'#ffe794':'rgba(210,235,255,.86)';ctx.lineWidth=1.5;ctx.strokeRect(618.5,840.5,17,17);ctx.restore();
  }

  private hideSpellEvolutionProjectionIdentity():boolean{
    const boss=this.enemies.enemies.find(enemy=>enemy.alive&&enemy.type==='boss')??null,heroCritical=this.dangerState.heroCritical,coreCritical=this.dangerState.coreCritical,bossSpecialTimer=boss?.specialTimer??99;
    return heroCritical||coreCritical||bossSpecialTimer <= 1.2;
  }

  private drawSpellEvolutionProjectionToastIcons(ctx:CanvasRenderingContext2D):void{
    const projection=this.eventToastSpellEvolutionProjection;if(!projection||this.hideSpellEvolutionProjectionIdentity()||!this.spellEvolutionModifierIdentityAtlasReady||!this.spellEvolutionModifierIdentityAtlasImage)return;const size=20,y=830;
    projection.modifierIds.slice(0,2).forEach((id,index)=>{const icon=spellEvolutionModifierIdentityIcon(id),x=642+index*24;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.92)';ctx.fillRect(x-1,y-1,size+2,size+2);ctx.drawImage(this.spellEvolutionModifierIdentityAtlasImage!,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();});
  }

  private drawSpellEvolutionActionCrest(ctx:CanvasRenderingContext2D,actionId:ActionId,x:number,y:number,radius:number):void {
    const spellId=spellEvolutionSpellForAction(actionId);if(!spellId)return;
    const tier=spellEvolutionTier(this.spells.levels[spellId]);if(tier===0||!this.spellEvolutionCrestAtlasReady||!this.spellEvolutionCrestAtlasImage)return;
    const crest=spellEvolutionCrestFor(this.hero.profileId,tier);if(!crest)return;
    const compact=this.elapsed>=4*60*60||radius<55,size=compact?14:18,dx=x+radius*.50-size/2,dy=y-radius*.50-size/2;
    ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(5,10,18,.9)';ctx.fillRect(dx-1,dy-1,size+2,size+2);ctx.drawImage(this.spellEvolutionCrestAtlasImage,crest.sx,crest.sy,crest.sw,crest.sh,dx,dy,size,size);ctx.strokeStyle=tier===2?'#ffe794':'rgba(196,229,255,.78)';ctx.lineWidth=tier===2?2:1;ctx.strokeRect(dx-.5,dy-.5,size+1,size+1);ctx.restore();
  }

  private drawMythicPhaseToastIcon(ctx:CanvasRenderingContext2D):void {
    const phase=this.eventToastMythicPhase;if(!phase||!this.mythicPhaseIdentityAtlasReady||!this.mythicPhaseIdentityAtlasImage)return;
    const icon=mythicPhaseIdentityIcon(phase),x=this.eventToastBossArenaMutation?634:602;
    ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(5,9,16,.9)';ctx.fillRect(x-1,826,30,30);ctx.drawImage(this.mythicPhaseIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,827,28,28);ctx.restore();
  }

  private drawBossWeakpointBreakToastIcon(ctx:CanvasRenderingContext2D):void {
    const archetype=this.eventToastBossWeakpointBreakArchetype;
    if(!archetype||!this.bossWeakpointBreakIdentityAtlasReady||!this.bossWeakpointBreakIdentityAtlasImage)return;
    const icon=bossWeakpointBreakIdentityIcon(archetype);ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(5,9,16,.9)';ctx.fillRect(600,825,32,32);ctx.drawImage(this.bossWeakpointBreakIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,602,827,28,28);ctx.restore();
  }

  private drawBossPhaseEscalationCueIcon(ctx:CanvasRenderingContext2D):void {
    if(!this.bossPhaseCue)return;
    const icon=this.bossPhaseCue.phase===2?bossPhase2EscalationIcon(this.bossPhaseCue.archetype):bossPhase3EnrageIcon(this.bossPhaseCue.archetype);
    const image=this.bossPhaseCue.phase===2?this.bossPhase2EscalationAtlasImage:this.bossPhase3EnrageAtlasImage;
    const ready=this.bossPhaseCue.phase===2?this.bossPhase2EscalationAtlasReady:this.bossPhase3EnrageAtlasReady;
    if(!ready||!image)return;
    ctx.save();ctx.globalAlpha=.97;ctx.fillStyle='rgba(4,8,14,.92)';ctx.fillRect(584,188,36,36);ctx.drawImage(image,icon.sx,icon.sy,icon.sw,icon.sh,586,190,32,32);ctx.restore();
  }

  private drawBossPhaseEscalationRecall(ctx:CanvasRenderingContext2D,boss:Enemy):void {
    if(boss.isMythic)return;
    if(this.dangerState.heroCritical||this.dangerState.coreCritical)return;
    if((boss.specialTimer??99)<=1.2)return;
    const phase=bossPhaseForRatio(boss.hp/Math.max(1,boss.maxHp));if(phase===1)return;
    const archetype=boss.bossArchetype??'inferno';
    const icon=phase===2?bossPhase2EscalationIcon(archetype):bossPhase3EnrageIcon(archetype);
    const image=phase===2?this.bossPhase2EscalationAtlasImage:this.bossPhase3EnrageAtlasImage;
    const ready=phase===2?this.bossPhase2EscalationAtlasReady:this.bossPhase3EnrageAtlasReady;if(!ready||!image)return;
    const size=this.elapsed>=4*60*60?16:19,x=1062,y=this.elapsed>=4*60*60?68:64;
    ctx.save();ctx.globalAlpha=.92;ctx.fillStyle='rgba(5,9,16,.84)';ctx.fillRect(x-2,y-2,size+4,size+4);ctx.drawImage(image,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();
  }

  private drawBossCounterplayBenefitRecall(ctx:CanvasRenderingContext2D,boss:Enemy):void {
    if(this.dangerState.heroCritical||this.dangerState.coreCritical)return;
    if((boss.specialTimer??99)<=1.2)return;
    const archetype=boss.bossArchetype??'inferno';
    if(boss.isMythic){const mythic=mythicBossProfile(this.elapsed,this.runThreatLevel,boss.bossOrdinal??this.bossesKilled),total=this.bossEncounter.nodes.length,alive=this.bossEncounter.nodes.filter(node=>node.alive).length,weakpointRatio=total>0?alive/total:0;const lastLaw=mythicLastLawIdentityProfile(mythic,archetype,boss.hp/Math.max(1,boss.maxHp),weakpointRatio);if(lastLaw.active)return;}
    if(!bossCounterplayBenefitActive(archetype,this.bossEncounter.modifiers))return;
    if(!this.bossCounterplayBenefitIdentityAtlasReady||!this.bossCounterplayBenefitIdentityAtlasImage)return;
    const icon=bossCounterplayBenefitIdentityIcon(archetype),compact=boss.isMythic||this.elapsed>=4*60*60,size=compact?16:19,x=1106,y=compact?68:64;
    ctx.save();ctx.globalAlpha=.92;ctx.fillStyle='rgba(5,9,16,.84)';ctx.fillRect(x-2,y-2,size+4,size+4);ctx.drawImage(this.bossCounterplayBenefitIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();
  }

  private drawBossVariantPressureRecall(ctx:CanvasRenderingContext2D,boss:Enemy):void {
    if(boss.isMythic)return;
    if(this.dangerState.heroCritical||this.dangerState.coreCritical)return;
    if((boss.specialTimer??99)<=1.2)return;
    const tier=boss.bossVariantTier??0;if(tier<=0||!this.bossVariantPressureAtlasReady||!this.bossVariantPressureAtlasImage)return;
    const icon=bossVariantPressureIcon(boss.bossArchetype??'inferno'),badge=bossVariantTierBadge(tier),size=this.elapsed>=4*60*60?16:19,x=1150,y=this.elapsed>=4*60*60?68:64;
    ctx.save();ctx.globalAlpha=.92;ctx.fillStyle='rgba(5,9,16,.84)';ctx.fillRect(x-2,y-2,size+4,size+4);ctx.drawImage(this.bossVariantPressureAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);
    if(badge){ctx.fillStyle='rgba(4,8,14,.95)';ctx.fillRect(x+size-7,y+size-7,9,9);ctx.fillStyle=icon.accent;ctx.font='900 6px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(badge,x+size-2.5,y+size-2.5);}ctx.restore();
  }

  private drawApexSecondaryPatternRecall(ctx:CanvasRenderingContext2D,boss:Enemy):void {
    if(boss.isMythic)return;
    if(this.dangerState.heroCritical||this.dangerState.coreCritical)return;
    if((boss.specialTimer??99)<=1.2)return;
    const secondary=boss.apexSecondaryArchetype;if(!boss.isApex||!secondary||!this.apexSecondaryPatternAtlasReady||!this.apexSecondaryPatternAtlasImage)return;
    const icon=apexSecondaryPatternIcon(secondary),size=this.elapsed>=4*60*60?16:19,x=1194,y=this.elapsed>=4*60*60?68:64;
    ctx.save();ctx.globalAlpha=.92;ctx.fillStyle='rgba(5,9,16,.84)';ctx.fillRect(x-2,y-2,size+4,size+4);ctx.drawImage(this.apexSecondaryPatternAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();
  }

  private drawBossArchetypeRecall(ctx:CanvasRenderingContext2D,boss:Enemy):void {
    if(!this.bossArchetypeIdentityAtlasReady||!this.bossArchetypeIdentityAtlasImage)return;
    const archetype=boss.bossArchetype??'inferno',icon=bossArchetypeIdentityIcon(archetype);
    const compact=boss.isMythic||this.elapsed>=4*60*60,size=compact?16:19,x=974,y=compact?68:64;
    ctx.save();ctx.globalAlpha=.94;ctx.fillStyle='rgba(5,9,16,.84)';ctx.fillRect(x-2,y-2,size+4,size+4);
    ctx.drawImage(this.bossArchetypeIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();
  }

  private drawBossSpecialIntentCue(ctx:CanvasRenderingContext2D):void {
    const boss=this.enemies.enemies.find((enemy)=>enemy.alive&&enemy.type==='boss');
    if(!boss||!this.bossSpecialIntentAtlasReady||!this.bossSpecialIntentAtlasImage)return;
    const timer=boss.specialTimer??99,segments=bossSpecialIntentSegments(timer);if(segments===0)return;
    const icon=bossSpecialIntentIcon(boss.bossArchetype??'inferno'),size=boss.isMythic?26:24,x=boss.pos.x-size/2,y=boss.pos.y-boss.radius-64;
    ctx.save();ctx.globalAlpha=.94;ctx.fillStyle='rgba(4,8,14,.78)';ctx.beginPath();ctx.roundRect(x-4,y-4,size+8,size+15,7);ctx.fill();
    ctx.drawImage(this.bossSpecialIntentAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);
    ctx.fillStyle=icon.accent;for(let i=0;i<segments;i++)ctx.fillRect(x+i*(size/3)+1,y+size+3,Math.max(4,size/3-2),3);
    this.drawApexSecondarySpecialIntent(ctx,boss,timer,segments,x+size+7,y,Math.max(18,size-4));ctx.restore();
  }

  private drawApexSecondarySpecialIntent(ctx:CanvasRenderingContext2D,boss:Enemy,timer:number,segments:0|1|2|3,x:number,y:number,size:number):void {
    if(!boss.isApex||boss.isMythic||segments===0||bossSpecialIntentSegments(timer)===0)return;
    const secondary=boss.apexSecondaryArchetype;if(!secondary||!this.apexSecondaryPatternAtlasReady||!this.apexSecondaryPatternAtlasImage)return;
    const icon=apexSecondaryPatternIcon(secondary);ctx.fillStyle='rgba(4,8,14,.78)';ctx.fillRect(x-2,y-2,size+4,size+9);ctx.drawImage(this.apexSecondaryPatternAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.fillStyle=icon.accent;for(let i=0;i<segments;i++)ctx.fillRect(x+i*(size/3)+1,y+size+2,Math.max(3,size/3-2),2);
  }

  private drawPerfectEvadeToastIcon(ctx:CanvasRenderingContext2D):void {
    const streak=this.eventToastPerfectEvadeStreak;if(!streak||!this.perfectEvadeIdentityAtlasReady||!this.perfectEvadeIdentityAtlasImage)return;
    const icon=perfectEvadeIdentityIcon(streak);ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(5,9,16,.9)';ctx.fillRect(600,825,32,32);ctx.drawImage(this.perfectEvadeIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,602,827,28,28);ctx.restore();
  }

  private drawBossVariantPressureToastIcon(ctx:CanvasRenderingContext2D):void {
    const tier=this.eventToastBossVariantTier,archetype=this.eventToastBossArchetype;if(!tier||tier<=0||!archetype||!this.bossVariantPressureAtlasReady||!this.bossVariantPressureAtlasImage)return;
    const icon=bossVariantPressureIcon(archetype),badge=bossVariantTierBadge(tier),x=this.eventToastBossArenaMutation?666:634;ctx.save();ctx.globalAlpha=.96;ctx.drawImage(this.bossVariantPressureAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,827,28,28);if(badge){ctx.fillStyle='rgba(4,8,14,.96)';ctx.fillRect(x+20,847,9,9);ctx.fillStyle=icon.accent;ctx.font='900 6px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(badge,x+24.5,851.5);}ctx.restore();
  }

  private drawApexSecondaryPatternToastIcon(ctx:CanvasRenderingContext2D):void {
    const secondary=this.eventToastApexSecondaryArchetype;if(!secondary||!this.apexSecondaryPatternAtlasReady||!this.apexSecondaryPatternAtlasImage)return;
    const icon=apexSecondaryPatternIcon(secondary),x=this.eventToastBossArenaMutation?698:666;ctx.save();ctx.globalAlpha=.96;ctx.drawImage(this.apexSecondaryPatternAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,827,28,28);ctx.restore();
  }

  private drawBossArchetypeToastIcon(ctx:CanvasRenderingContext2D):void {
    const archetype=this.eventToastBossArchetype;if(!archetype||!this.bossArchetypeIdentityAtlasReady||!this.bossArchetypeIdentityAtlasImage)return;
    const icon=bossArchetypeIdentityIcon(archetype),x=this.eventToastMythicPhase?666:this.eventToastBossArenaMutation?634:602;
    ctx.save();ctx.globalAlpha=.96;ctx.drawImage(this.bossArchetypeIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,827,28,28);ctx.restore();
  }

  private drawMythicPhaseRecall(ctx:CanvasRenderingContext2D,boss:Enemy):void {
    if(!boss.isMythic)return;
    const mythic=mythicBossProfile(this.elapsed,this.runThreatLevel,boss.bossOrdinal??this.bossesKilled),total=this.bossEncounter.nodes.length,alive=this.bossEncounter.nodes.filter(node=>node.alive).length,weakpointRatio=total>0?alive/total:0;
    const phase=mythicPhaseProfile(mythic,boss.hp / Math.max(1,boss.maxHp),weakpointRatio);if(phase.phase===0||!this.mythicPhaseIdentityAtlasReady||!this.mythicPhaseIdentityAtlasImage)return;
    const icon=mythicPhaseIdentityIcon(phase.phase as MythicPhaseIdentityId),compact=this.elapsed>=4*60*60,size=compact?16:20,x=1062,y=compact?68:64,segments=mythicPhasePressureSegments(weakpointRatio);
    ctx.save();ctx.globalAlpha=.95;ctx.fillStyle='rgba(5,9,16,.86)';ctx.fillRect(x-2,y-2,size+18,size+4);ctx.drawImage(this.mythicPhaseIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);
    ctx.fillStyle=icon.accent;for(let i=0;i<segments;i++)ctx.fillRect(x+size+3,y+2+i*5,6,3);ctx.fillStyle='rgba(5,9,16,.76)';for(let i=segments;i<3;i++)ctx.fillRect(x+size+3,y+2+i*5,6,3);
    ctx.fillStyle='#fff';ctx.font='900 7px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(phase.phase),x+size/2,y+size/2+.5);ctx.restore();
  }

  private drawMythicLastLawToastIcon(ctx: CanvasRenderingContext2D): void {
    const id=this.eventToastLastLawId;
    if(!id||id==='none'||!this.mythicLastLawIdentityAtlasReady||!this.mythicLastLawIdentityAtlasImage)return;
    const icon=mythicLastLawIdentityIcon(id);
    ctx.save();ctx.globalAlpha=.96;
    ctx.drawImage(this.mythicLastLawIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,602,827,28,28);
    ctx.restore();
  }

  private drawMythicLastLawSafeLaneIcon(ctx:CanvasRenderingContext2D,x:number,y:number,size:number,id:MythicLastLawId):void{
    if(id==='none'||!this.mythicLastLawIdentityAtlasReady||!this.mythicLastLawIdentityAtlasImage)return;
    const icon=mythicLastLawIdentityIcon(id);
    ctx.save();ctx.globalAlpha=.92;
    ctx.drawImage(this.mythicLastLawIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);
    ctx.restore();
  }

  private drawMythicTacticToastIcon(ctx: CanvasRenderingContext2D): void {
    const archetype=this.eventToastMythicTacticArchetype;
    if(!archetype||!this.mythicTacticIdentityAtlasReady||!this.mythicTacticIdentityAtlasImage)return;
    const icon=mythicTacticIdentityIcon(mythicTacticIdentityIdForArchetype(archetype));
    ctx.save();ctx.globalAlpha=.96;
    ctx.drawImage(this.mythicTacticIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,602,827,28,28);
    ctx.restore();
  }

  private drawMythicTacticPrimedIcon(ctx:CanvasRenderingContext2D):void{
    const link=this.mythicTacticAttackLink;if(!link)return;
    const boss=this.enemies.enemies.find((enemy)=>enemy.alive&&enemy.type==='boss'&&enemy.isMythic&&enemy.bossArchetype===link.archetype);if(!boss)return;
    const projection=projectMythicTacticAttackLink(link,this.elapsed*1000,link.archetype);if(!projection)return;
    const icon=mythicTacticIdentityIcon(mythicTacticIdentityIdForArchetype(link.archetype)),size=24,iconY=boss.pos.y-boss.radius-36;
    ctx.save();ctx.globalAlpha=.94;
    if(this.mythicTacticIdentityAtlasReady&&this.mythicTacticIdentityAtlasImage){
      ctx.fillStyle='rgba(4,8,14,.72)';ctx.beginPath();ctx.arc(boss.pos.x,boss.pos.y-boss.radius-24,17,0,Math.PI*2);ctx.fill();
      ctx.drawImage(this.mythicTacticIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,boss.pos.x-size/2,iconY,size,size);
    }
    const effects=projection.primaryEffects.slice(0,2);
    if(effects.length){
      ctx.font='800 8px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';
      const widths=effects.map(effect=>Math.max(54,Math.min(82,Math.ceil(ctx.measureText(effect.label).width)+12))),gap=4,total=widths.reduce((sum,width)=>sum+width,0)+gap*Math.max(0,widths.length-1);
      let x=clamp(boss.pos.x-total/2,ARENA_MARGIN+4,LOGICAL_WIDTH-ARENA_MARGIN-total-4),y=iconY-17;
      effects.forEach((effect,index)=>{const width=widths[index]!;ctx.fillStyle='rgba(4,8,14,.82)';ctx.fillRect(x,y,width,14);ctx.strokeStyle=projection.accent;ctx.globalAlpha=.82;ctx.strokeRect(x+.5,y+.5,width-1,13);ctx.globalAlpha=.96;ctx.fillStyle='#f7fbff';ctx.fillText(effect.label,x+width/2,y+7.5);x+=width+gap;});
    }
    ctx.restore();
  }

  private drawAscensionMutatorToastIcon(ctx:CanvasRenderingContext2D):void{
    const id=this.eventToastAscensionMutator;
    if(!id||!this.ascensionMutatorIdentityAtlasReady||!this.ascensionMutatorIdentityAtlasImage)return;
    const icon=ascensionMutatorIdentityIcon(id);
    ctx.save();ctx.globalAlpha=.96;
    ctx.drawImage(this.ascensionMutatorIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,602,827,28,28);
    ctx.restore();
  }

  private drawFatePathToastIcon(ctx:CanvasRenderingContext2D):void{
    const id=this.eventToastFatePath;
    if(!id||!this.decisionPathIconAtlasReady||!this.decisionPathIconAtlasImage)return;
    const icon=fatePathRecallIcon(id); const sprite=icon.sprite;
    ctx.save();ctx.globalAlpha=.96;
    ctx.drawImage(this.decisionPathIconAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,602,827,28,28);
    ctx.restore();
  }

  private drawFateTradeoffToastIcons(ctx:CanvasRenderingContext2D):void{
    const impact=this.eventToastFateImpact;if(!impact)return;this.drawFateImpactPair(ctx,impact,633,829,22);
  }

  private drawLongRunOathToastIcon(ctx:CanvasRenderingContext2D):void{
    const id=this.eventToastOathKind;
    if(!id||!this.deepRunDecisionIdentityAtlasReady||!this.deepRunDecisionIdentityAtlasImage)return;
    const icon=longRunOathRecallIcon(id);
    ctx.save();ctx.globalAlpha=.96;
    ctx.drawImage(this.deepRunDecisionIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,602,827,28,28);
    ctx.restore();
  }

  private drawRunContractToastIcon(ctx:CanvasRenderingContext2D):void{
    const family=this.eventToastContractFamily;
    if(!family||!this.deepRunDecisionIdentityAtlasReady||!this.deepRunDecisionIdentityAtlasImage)return;
    const icon=runContractRecallIcon(family);
    ctx.save();ctx.globalAlpha=.96;
    ctx.drawImage(this.deepRunDecisionIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,602,827,28,28);
    ctx.restore();
  }

  private drawRelicResonanceToastIcon(ctx:CanvasRenderingContext2D):void{
    const identity=this.eventToastRelicResonance;
    if(!identity||!this.buildIdentityAtlasReady||!this.buildIdentityAtlasImage)return;
    const icon=relicResonanceRecallIcon(identity.relicId);
    ctx.save();ctx.globalAlpha=.96;
    ctx.drawImage(this.buildIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,602,827,28,28);
    ctx.restore();
  }

  private drawRelicResonanceProgressFrame(ctx:CanvasRenderingContext2D,x:number,y:number,size:number,progress:ReturnType<typeof relicResonanceNextTierProgress>):void{
    const ratio=clamp(progress.ratio,0,1),filled=Math.max(0,Math.min(4,Math.ceil(ratio*4))),accent=progress.complete?'#ffd56b':'#7bdcff';
    ctx.save();ctx.lineWidth=1.5;ctx.strokeStyle='rgba(120,160,190,.22)';ctx.strokeRect(x-.5,y-.5,size+1,size+1);ctx.strokeStyle=accent;ctx.globalAlpha=.94;
    if(filled>=1){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+size,y);ctx.stroke();}if(filled>=2){ctx.beginPath();ctx.moveTo(x+size,y);ctx.lineTo(x+size,y+size);ctx.stroke();}if(filled>=3){ctx.beginPath();ctx.moveTo(x+size,y+size);ctx.lineTo(x,y+size);ctx.stroke();}if(filled>=4){ctx.beginPath();ctx.moveTo(x,y+size);ctx.lineTo(x,y);ctx.stroke();}ctx.restore();
  }

  private hideRelicResonanceProjectionIdentity():boolean{
    const boss=this.enemies.enemies.find(enemy=>enemy.alive&&enemy.type==='boss')??null,heroCritical=this.dangerState.heroCritical,coreCritical=this.dangerState.coreCritical,bossSpecialTimer=boss?.specialTimer??99;
    return heroCritical||coreCritical||bossSpecialTimer <= 1.2;
  }

  private drawRelicResonanceProjectionToastIcons(ctx:CanvasRenderingContext2D):void{
    const projection=this.eventToastRelicProjection;if(!projection||this.hideRelicResonanceProjectionIdentity())return;const size=24,y=828;
    if(this.relicResonanceImpactIdentityAtlasReady&&this.relicResonanceImpactIdentityAtlasImage){const icon=relicResonanceImpactIdentityIcon(projection.impactId),x=634;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.92)';ctx.fillRect(x-1,y-1,size+2,size+2);ctx.drawImage(this.relicResonanceImpactIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();}
    if(this.relicResonanceTierIdentityAtlasReady&&this.relicResonanceTierIdentityAtlasImage){const icon=relicResonanceTierIdentityIcon(projection.tierId),x=662;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.92)';ctx.fillRect(x-1,y-1,size+2,size+2);ctx.drawImage(this.relicResonanceTierIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();}
  }

  private drawRelicResonanceTierBadge(ctx:CanvasRenderingContext2D,x:number,y:number,size:number,label:'I'|'II'|'III'):void{
    const width=label==='III'?14:10;const height=10;const bx=x+size-width+2;const by=y+size-height+2;
    ctx.save();ctx.fillStyle='rgba(5,9,18,.94)';ctx.fillRect(bx,by,width,height);ctx.strokeStyle='#f2d37b';ctx.lineWidth=1;ctx.strokeRect(bx+.5,by+.5,width-1,height-1);
    ctx.fillStyle='#fff0a6';ctx.font='900 7px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,bx+width/2,by+height/2+.5);ctx.restore();
  }

  private hideLongRunOathHelperIdentity():boolean{
    const boss=this.enemies.enemies.find(enemy=>enemy.alive&&enemy.type==='boss')??null;
    const heroCritical=this.dangerState.heroCritical,coreCritical=this.dangerState.coreCritical,bossSpecialTimer=boss?.specialTimer??99;
    return heroCritical||coreCritical||bossSpecialTimer <= 1.2;
  }

  private drawLongRunOathRequirementBoonRecall(ctx:CanvasRenderingContext2D,kind:LongRunOathKind,y:number):void{
    if(this.hideLongRunOathHelperIdentity())return;
    const profile=oathRequirementBoonIdentity(kind),size=17;
    if(this.oathRequirementIdentityAtlasReady&&this.oathRequirementIdentityAtlasImage){const icon=oathRequirementIdentityIcon(profile.requirementId),x=377;ctx.save();ctx.globalAlpha=.95;ctx.fillStyle='rgba(5,9,17,.9)';ctx.fillRect(x-1,y-1,size+2,size+2);ctx.drawImage(this.oathRequirementIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();}
    if(this.oathBoonOutcomeIdentityAtlasReady&&this.oathBoonOutcomeIdentityAtlasImage){const icon=oathBoonOutcomeIdentityIcon(profile.boonId),x=401;ctx.save();ctx.globalAlpha=.95;ctx.fillStyle='rgba(5,9,17,.9)';ctx.fillRect(x-1,y-1,size+2,size+2);ctx.drawImage(this.oathBoonOutcomeIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();}
  }

  private drawLongRunOathHelperToastIcons(ctx:CanvasRenderingContext2D):void{
    const helper=this.eventToastOathHelper;if(!helper||this.hideLongRunOathHelperIdentity())return;
    if('requirementId' in helper&&this.oathRequirementIdentityAtlasReady&&this.oathRequirementIdentityAtlasImage){const icon=oathRequirementIdentityIcon(helper.requirementId),x=634,size=24;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.92)';ctx.fillRect(x-1,827,size+2,size+2);ctx.drawImage(this.oathRequirementIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,828,size,size);ctx.restore();}
    if(this.oathBoonOutcomeIdentityAtlasReady&&this.oathBoonOutcomeIdentityAtlasImage){const icon=oathBoonOutcomeIdentityIcon(helper.boonId),x='requirementId' in helper?662:634,size=24;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.92)';ctx.fillRect(x-1,827,size+2,size+2);ctx.drawImage(this.oathBoonOutcomeIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,828,size,size);ctx.restore();}
  }

  private hideRunContractHelperIdentity():boolean{
    const boss=this.enemies.enemies.find(enemy=>enemy.alive&&enemy.type==='boss')??null;
    const heroCritical=this.dangerState.heroCritical,coreCritical=this.dangerState.coreCritical,bossSpecialTimer=boss?.specialTimer??99;
    return heroCritical||coreCritical||bossSpecialTimer <= 1.2;
  }

  private runContractPaceId(active:ActiveContract):RunMissionPaceIdentityId{
    const progressRatio=active.progress/Math.max(1,active.target),durationMs=Math.max(1,active.deadlineMs-active.startedAtMs),elapsedRatio=(this.elapsed*1000-active.startedAtMs)/durationMs;
    return runMissionPaceIdentityForRatios(progressRatio,elapsedRatio);
  }

  private drawRunContractPaceBoonRecall(ctx:CanvasRenderingContext2D,active:ActiveContract,y:number):void{
    if(this.hideRunContractHelperIdentity())return;
    const size=17,paceId=this.runContractPaceId(active),boonId=runContractBoonEffectIdentityForFamily(active.family);
    if(this.runMissionPaceIdentityAtlasReady&&this.runMissionPaceIdentityAtlasImage){const icon=runMissionPaceIdentityIcon(paceId),image=this.runMissionPaceIdentityAtlasImage,x=377;ctx.save();ctx.globalAlpha=.95;ctx.fillStyle='rgba(5,9,17,.9)';ctx.fillRect(x-1,y-1,size+2,size+2);ctx.drawImage(image,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();}
    if(this.runContractBoonEffectIdentityAtlasReady&&this.runContractBoonEffectIdentityAtlasImage){const icon=runContractBoonEffectIdentityIcon(boonId),image=this.runContractBoonEffectIdentityAtlasImage,x=401;ctx.save();ctx.globalAlpha=.95;ctx.fillStyle='rgba(5,9,17,.9)';ctx.fillRect(x-1,y-1,size+2,size+2);ctx.drawImage(image,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();}
  }

  private drawRunContractBoonEffectToastIcon(ctx:CanvasRenderingContext2D):void{
    const family=this.eventToastContractBoonFamily;if(!family||!this.runContractBoonEffectIdentityAtlasReady||!this.runContractBoonEffectIdentityAtlasImage)return;
    const icon=runContractBoonEffectIdentityIcon(runContractBoonEffectIdentityForFamily(family)),image=this.runContractBoonEffectIdentityAtlasImage;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.92)';ctx.fillRect(633,827,26,26);ctx.drawImage(image,icon.sx,icon.sy,icon.sw,icon.sh,634,828,24,24);ctx.restore();
  }

  private drawRunContractBoonRecall(ctx:CanvasRenderingContext2D,boons:readonly ContractBoon[],elapsedMs:number,x:number,y:number):void{
    const recall=activeRunContractBoonRecall(boons,elapsedMs);
    if(!recall||!this.deepRunDecisionIdentityAtlasReady||!this.deepRunDecisionIdentityAtlasImage)return;
    const size=18;
    ctx.save();
    ctx.fillStyle='rgba(6,12,22,.88)';ctx.fillRect(x-1,y-1,52,size+2);
    ctx.drawImage(this.deepRunDecisionIdentityAtlasImage,recall.icon.sx,recall.icon.sy,recall.icon.sw,recall.icon.sh,x,y,size,size);
    ctx.fillStyle='#ffd66e';ctx.font='800 10px system-ui';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(`${recall.remainingSeconds}s`,x+22,y+size/2+1);
    ctx.restore();
  }


  private drawWorldEvolutionToastIcon(ctx:CanvasRenderingContext2D):void{
    const id=this.eventToastWorldEvolution;if(!id||!this.worldEvolutionIdentityAtlasReady||!this.worldEvolutionIdentityAtlasImage)return;
    const icon=worldEvolutionIdentityIcon(id);ctx.save();ctx.globalAlpha=.96;ctx.drawImage(this.worldEvolutionIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,602,827,28,28);ctx.restore();
  }

  private drawWorldEvolutionRecall(ctx:CanvasRenderingContext2D,world:import('./endless/world-evolution.js').WorldState,x:number,y:number,size=22,showLabel=true):void{
    if(world==='calm'||!this.worldEvolutionIdentityAtlasReady||!this.worldEvolutionIdentityAtlasImage)return;
    const icon=worldEvolutionIdentityIcon(world);ctx.save();ctx.globalAlpha=.94;ctx.fillStyle='rgba(5,10,18,.82)';ctx.fillRect(x-2,y-2,size+4,size+4);ctx.drawImage(this.worldEvolutionIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);
    if(showLabel){ctx.fillStyle=icon.accent;ctx.font='800 10px system-ui';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(icon.label,x+size+5,y+size/2+1);}ctx.restore();
  }

  private drawNemesisAdaptationRankBadge(ctx:CanvasRenderingContext2D,x:number,y:number,size:number,adaptation:BossAdaptation):void{
    const label=adaptation.rank===3?'III':adaptation.rank===2?'II':'I';
    const width=label==='III'?13:10,height=9,bx=x+size-width+2,by=y+size-height+2;
    ctx.save();ctx.fillStyle='rgba(7,9,16,.94)';ctx.fillRect(bx,by,width,height);ctx.strokeStyle='#ffbf78';ctx.lineWidth=1;ctx.strokeRect(bx+.5,by+.5,width-1,height-1);
    ctx.fillStyle='#fff2cf';ctx.font='900 7px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,bx+width/2,by+height/2+.5);ctx.restore();
  }

  private drawNemesisAdaptationToastIcons(ctx:CanvasRenderingContext2D):void{
    const adaptations=this.eventToastNemesisAdaptations.slice(0,Math.min(3,this.eventToastNemesisAdaptations.length));
    if(adaptations.length===0||!this.nemesisAdaptationIdentityAtlasReady||!this.nemesisAdaptationIdentityAtlasImage)return;
    const size=20,gap=3,startX=598,y=831;
    ctx.save();ctx.globalAlpha=.96;
    adaptations.forEach((adaptation,index)=>{const icon=nemesisAdaptationIdentityIcon(adaptation.kind);const x=startX+index*(size+gap);ctx.drawImage(this.nemesisAdaptationIdentityAtlasImage!,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);this.drawNemesisAdaptationRankBadge(ctx,x,y,size,adaptation);if(adaptation.kind==='mirror_affinity'&&adaptation.affinity){ctx.fillStyle='#d7fff6';ctx.font='800 6px system-ui';ctx.textAlign='center';ctx.fillText(adaptation.affinity.slice(0,3).toUpperCase(),x+size/2,y+size-2);}});
    ctx.restore();
  }

  private drawNemesisAdaptationRecall(ctx:CanvasRenderingContext2D,boss:Enemy,maxIcons=3):void{
    const key=boss.bossArchetype??this.endlessBossKey;if(!key||maxIcons<=0)return;
    const adaptations=getBossAdaptations(this.endlessState.nemesis,key).slice(0,Math.min(3,maxIcons));if(adaptations.length===0)return;
    if(!this.nemesisAdaptationIdentityAtlasReady||!this.nemesisAdaptationIdentityAtlasImage)return;
    const compact=boss.isMythic||this.elapsed>=4*60*60,size=compact?16:18,gap=4,total=adaptations.length*size+(adaptations.length-1)*gap,startX=LOGICAL_WIDTH/2-total/2,y=compact?68:64;
    ctx.save();ctx.globalAlpha=.94;
    adaptations.forEach((adaptation,index)=>{const icon=nemesisAdaptationIdentityIcon(adaptation.kind);const x=startX+index*(size+gap);ctx.fillStyle='rgba(5,9,16,.82)';ctx.fillRect(x-1,y-1,size+2,size+2);ctx.drawImage(this.nemesisAdaptationIdentityAtlasImage!,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);this.drawNemesisAdaptationRankBadge(ctx,x,y,size,adaptation);if(adaptation.kind==='mirror_affinity'&&adaptation.affinity){ctx.fillStyle='#d7fff6';ctx.font='800 6px system-ui';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText(adaptation.affinity.slice(0,3).toUpperCase(),x+size/2,y+size-2);}});
    ctx.restore();
    if(!this.hideNemesisAdaptationEffectIdentity(boss))this.drawNemesisAdaptationEffectRecall(ctx,boss,adaptations,y,size);
  }

  private hideNemesisAdaptationEffectIdentity(boss:Enemy):boolean{
    const heroCritical=this.dangerState.heroCritical,coreCritical=this.dangerState.coreCritical,bossSpecialTimer=boss.specialTimer??99;return heroCritical||coreCritical||bossSpecialTimer<=1.2||this.bossEffectivePressureLastLawActive(boss);
  }

  private drawNemesisAdaptationEffectRecall(ctx:CanvasRenderingContext2D,boss:Enemy,adaptations:BossAdaptation[],y:number,size:number):void{
    if(this.hideNemesisAdaptationEffectIdentity(boss)||!this.nemesisAdaptationEffectIdentityAtlasReady||!this.nemesisAdaptationEffectIdentityAtlasImage)return;
    if(this.preferBossEffectivePressureSummary(boss))return;
    const projection=projectNemesisAdaptationEffects(adaptations),helperSize=10,gap=5,helperY=y+size+2,total=projection.primaryEffects.slice(0,2).length*(helperSize+28)+(projection.primaryEffects.length>1?gap:0),startX=LOGICAL_WIDTH/2-total/2;
    ctx.save();ctx.globalAlpha=.9;projection.primaryEffects.slice(0,2).forEach((effect,index)=>{const icon=nemesisAdaptationEffectIdentityIcon(effect.effectId),x=startX+index*(helperSize+28+gap);ctx.fillStyle='rgba(4,8,14,.86)';ctx.fillRect(x-1,helperY-1,helperSize+30,helperSize+2);ctx.drawImage(this.nemesisAdaptationEffectIdentityAtlasImage!,icon.sx,icon.sy,icon.sw,icon.sh,x,helperY,helperSize,helperSize);ctx.fillStyle=icon.accent;ctx.font='900 7px system-ui';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(`${effect.pressurePercent}%`,x+helperSize+3,helperY+helperSize/2+.5);});ctx.restore();
  }

  private drawNemesisAdaptationEffectToastIcons(ctx:CanvasRenderingContext2D):void{
    if(this.eventToastNemesisAdaptations.length===0||!this.nemesisAdaptationEffectIdentityAtlasReady||!this.nemesisAdaptationEffectIdentityAtlasImage)return;
    const projection=projectNemesisAdaptationEffects(this.eventToastNemesisAdaptations),size=10,y=851,startX=598;ctx.save();ctx.globalAlpha=.94;projection.primaryEffects.slice(0,2).forEach((effect,index)=>{const icon=nemesisAdaptationEffectIdentityIcon(effect.effectId),x=startX+index*23;ctx.drawImage(this.nemesisAdaptationEffectIdentityAtlasImage!,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);});ctx.restore();
  }

  private drawBossArenaMutationToastIcon(ctx:CanvasRenderingContext2D):void{
    const id=this.eventToastBossArenaMutation;if(!id||!this.bossArenaMutationIdentityAtlasReady||!this.bossArenaMutationIdentityAtlasImage)return;
    const icon=bossArenaMutationIdentityIcon(id);ctx.save();ctx.globalAlpha=.96;ctx.drawImage(this.bossArenaMutationIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,602,827,28,28);ctx.restore();
  }

  private drawBossArenaMutationRecall(ctx:CanvasRenderingContext2D,boss:Enemy):void{
    const mutation=createBossArenaMutation(boss.bossArchetype??'inferno',this.endlessState.ascension.tier,boss.bossOrdinal??this.bossesKilled);
    if(!mutation||!this.bossArenaMutationIdentityAtlasReady||!this.bossArenaMutationIdentityAtlasImage)return;
    const icon=bossArenaMutationIdentityIcon(mutation.kind),compact=boss.isMythic||this.elapsed>=4*60*60,size=compact?16:19,x=1018,y=compact?68:64,segments=bossArenaMutationIntensitySegments(mutation.intensity);
    ctx.save();ctx.globalAlpha=.94;ctx.fillStyle='rgba(5,9,16,.84)';ctx.fillRect(x-2,y-2,size+18,size+4);ctx.drawImage(this.bossArenaMutationIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);
    ctx.fillStyle=icon.accent;for(let i=0;i<3;i++)ctx.fillRect(x+size+3,y+2+i*5,6,3);ctx.fillStyle='rgba(5,9,16,.78)';for(let i=segments;i<3;i++)ctx.fillRect(x+size+3,y+2+i*5,6,3);ctx.restore();
  }

  private drawRunTraitToastIcon(ctx:CanvasRenderingContext2D):void{const id=this.eventToastRunTraitId;if(!id||!this.decisionPathIconAtlasReady||!this.decisionPathIconAtlasImage)return;const icon=runTraitIdentity(id);ctx.save();ctx.globalAlpha=.96;ctx.drawImage(this.decisionPathIconAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,602,827,28,28);ctx.restore();}

  private drawAscensionSelectionToastIcon(ctx:CanvasRenderingContext2D):void{const id=this.eventToastAscensionSelectionId;if(!id||!this.deepRunDecisionIdentityAtlasReady||!this.deepRunDecisionIdentityAtlasImage)return;const icon=ascensionSelectionIdentity(id);ctx.save();ctx.globalAlpha=.96;ctx.drawImage(this.deepRunDecisionIdentityAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,602,827,28,28);ctx.restore();}

  private hideHeroAscensionProjectionIdentity():boolean{
    const boss=this.enemies.enemies.find(enemy=>enemy.alive&&enemy.type==='boss')??null,heroCritical=this.dangerState.heroCritical,coreCritical=this.dangerState.coreCritical,bossSpecialTimer=boss?.specialTimer??99;
    return heroCritical||coreCritical||bossSpecialTimer <= 1.2;
  }

  private drawHeroAscensionProjectionToastIcons(ctx:CanvasRenderingContext2D):void{
    const projection=this.eventToastHeroAscensionProjection;if(!projection||this.hideHeroAscensionProjectionIdentity())return;const size=22,y=829;
    if(this.heroAscensionBuildDirectionAtlasReady&&this.heroAscensionBuildDirectionAtlasImage){const icon=heroAscensionBuildDirectionIdentityIcon(projection.directionId),x=634;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.92)';ctx.fillRect(x-1,y-1,size+2,size+2);ctx.drawImage(this.heroAscensionBuildDirectionAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();}
    if(this.heroAscensionModifierIdentityAtlasReady&&this.heroAscensionModifierIdentityAtlasImage){projection.modifierIds.slice(0,2).forEach((id,index)=>{const icon=heroAscensionModifierIdentityIcon(id),x=660+index*26;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.92)';ctx.fillRect(x-1,y-1,size+2,size+2);ctx.drawImage(this.heroAscensionModifierIdentityAtlasImage!,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();});}
  }

  private hideFusionProjectionIdentity():boolean{
    const boss=this.enemies.enemies.find(enemy=>enemy.alive&&enemy.type==='boss')??null,heroCritical=this.dangerState.heroCritical,coreCritical=this.dangerState.coreCritical,bossSpecialTimer=boss?.specialTimer??99;
    return heroCritical||coreCritical||bossSpecialTimer <= 1.2;
  }

  private drawFusionProjectionToastIcons(ctx:CanvasRenderingContext2D):void{
    const projection=this.eventToastFusionProjection;if(!projection||this.hideFusionProjectionIdentity())return;const size=22,y=829;
    if(this.fusionComponentRelationAtlasReady&&this.fusionComponentRelationAtlasImage){const icon=fusionComponentRelationIdentityIcon(projection.relationId),x=634;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.92)';ctx.fillRect(x-1,y-1,size+2,size+2);ctx.drawImage(this.fusionComponentRelationAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();}
    if(this.fusionModifierIdentityAtlasReady&&this.fusionModifierIdentityAtlasImage){projection.modifierIds.slice(0,2).forEach((id,index)=>{const icon=fusionModifierIdentityIcon(id),x=660+index*26;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.92)';ctx.fillRect(x-1,y-1,size+2,size+2);ctx.drawImage(this.fusionModifierIdentityAtlasImage!,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();});}
  }

  private hideBattlefieldEvolutionProjectionIdentity():boolean{
    const boss=this.enemies.enemies.find(enemy=>enemy.alive&&enemy.type==='boss')??null;return this.dangerState.heroCritical||this.dangerState.coreCritical||(boss?.specialTimer??99)<=1.2;
  }

  private drawAscensionTierPressureToastIcons(ctx:CanvasRenderingContext2D):void{
    const projection=this.eventToastAscensionTierProjection;if(!projection||this.hideAscensionTierPressureIdentity()||!this.ascensionTierPressureAtlasReady||!this.ascensionTierPressureAtlasImage)return;const size=20,y=830,startX=this.eventToastAscensionMutator?634:604;
    projection.primaryPressureIds.slice(0,2).forEach((id,index)=>{const icon=ascensionTierPressureIdentityIcon(id),x=startX+index*24;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.92)';ctx.fillRect(x-1,y-1,size+2,size+2);ctx.drawImage(this.ascensionTierPressureAtlasImage!,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();});
    if(projection.mutatorThreshold){const icon=ascensionTierPressureIdentityIcon('mutator-threshold'),x=startX+48;ctx.save();ctx.globalAlpha=.96;ctx.drawImage(this.ascensionTierPressureAtlasImage,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();}
  }

  private drawBattlefieldEvolutionToastIcons(ctx:CanvasRenderingContext2D):void{
    const projection=this.eventToastBattlefieldEvolutionProjection;if(!projection||this.hideBattlefieldEvolutionProjectionIdentity()||!this.battlefieldMechanicAtlasReady||!this.battlefieldMechanicAtlasImage)return;const size=22,y=829;
    projection.changes.slice(0,2).forEach((change,index)=>{const icon=battlefieldMechanicIdentityIcon(change.id),x=604+index*26;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.92)';ctx.fillRect(x-1,y-1,size+2,size+2);ctx.drawImage(this.battlefieldMechanicAtlasImage!,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();});
  }

  private drawBuildOverdriveEffectToastIcons(ctx:CanvasRenderingContext2D):void{
    const projection=this.eventToastBuildOverdriveProjection;if(!projection||!projection.active||this.hideBuildOverdriveEffectIdentity()||!this.buildOverdriveEffectAtlasReady||!this.buildOverdriveEffectAtlasImage)return;const size=22,y=829;
    projection.effects.slice(0,3).forEach((effect,index)=>{const icon=buildOverdriveEffectIdentityIcon(effect.id),x=604+index*26;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(4,8,14,.92)';ctx.fillRect(x-1,y-1,size+2,size+2);ctx.drawImage(this.buildOverdriveEffectAtlasImage!,icon.sx,icon.sy,icon.sw,icon.sh,x,y,size,size);ctx.restore();});
  }

  private drawEventToast(ctx: CanvasRenderingContext2D): void {
    const alpha = Math.min(1, this.eventToastTimer / 0.35);
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(4,8,14,.84)'; ctx.fillRect(590, 820, 420, 42);
    ctx.strokeStyle = 'rgba(170,220,255,.35)'; ctx.strokeRect(590, 820, 420, 42);
    this.drawMythicLastLawToastIcon(ctx);
    this.drawMythicTacticToastIcon(ctx);
    this.drawMythicPhaseToastIcon(ctx);
    this.drawAscensionMutatorToastIcon(ctx);
    this.drawAscensionTierPressureToastIcons(ctx);
    this.drawFatePathToastIcon(ctx);
    this.drawFateTradeoffToastIcons(ctx);
    this.drawLongRunOathToastIcon(ctx);
    this.drawLongRunOathHelperToastIcons(ctx);
    this.drawRunContractToastIcon(ctx);
    this.drawRunContractBoonEffectToastIcon(ctx);
    this.drawRelicResonanceToastIcon(ctx);
    this.drawRelicResonanceProjectionToastIcons(ctx);
    this.drawWorldEvolutionToastIcon(ctx);
    this.drawNemesisAdaptationToastIcons(ctx);
    this.drawNemesisAdaptationEffectToastIcons(ctx);
    this.drawBossArenaMutationToastIcon(ctx);
    this.drawBossWeakpointBreakToastIcon(ctx);
    this.drawBossArchetypeToastIcon(ctx);
    this.drawBossVariantPressureToastIcon(ctx);
    this.drawApexSecondaryPatternToastIcon(ctx);
    this.drawPerfectEvadeToastIcon(ctx);
    this.drawHeroMeterToastIcon(ctx);
    this.drawArcaneComboToastIcon(ctx);
    this.drawTacticalStatusToastIcon(ctx);
    this.drawFieldEventToastHelperIcons(ctx);
    this.drawObjectiveRewardToastIcons(ctx);
    this.drawRunMissionToastRewardIcon(ctx);
    this.drawBuildIdentityToastIcon(ctx);
    this.drawSynergyToastIcon(ctx);
    this.drawLegendaryAwakeningToastIcon(ctx);
    this.drawSpellEvolutionToastIcon(ctx);
    this.drawSpellEvolutionProjectionToastIcons(ctx);
    this.drawRunTraitToastIcon(ctx);
    this.drawAscensionSelectionToastIcon(ctx);
    this.drawHeroAscensionProjectionToastIcons(ctx);
    this.drawFusionProjectionToastIcons(ctx);
    this.drawBattlefieldEvolutionToastIcons(ctx);
    this.drawBuildOverdriveEffectToastIcons(ctx);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.font = '800 16px system-ui';
    ctx.fillText(this.eventToast, 800, 841); ctx.restore();
  }

  private drawBossWarning(ctx: CanvasRenderingContext2D): void {
    const remaining = Math.max(1, Math.ceil(this.enemies.bossCountdown));
    const boss=this.enemies.enemies.find((enemy)=>enemy.alive&&enemy.type==='boss')??null;
    const attention=combatAttentionPolicy({heroCritical:this.dangerState.heroCritical,coreCritical:this.dangerState.coreCritical,damageSeverity:this.damageReasonState?.severity??null,bossSpecialTimer:boss?.specialTimer??99,bossCountdown:this.enemies.bossCountdown,reducedFlash:this.presentationSettings.reducedFlash,reducedMotion:this.presentationSettings.reducedMotion});
    const pulse = 0.75 + (attention.bossCountdownAnimated ? Math.sin(this.elapsed * 8) * attention.bossCountdownMotionAmplitude : 0);
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = 'rgba(72,8,16,.86)';
    ctx.fillRect(610, 104, 380, 62);
    ctx.strokeStyle = '#ff6c78';
    ctx.lineWidth = 3;
    ctx.strokeRect(610, 104, 380, 62);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.font = '900 24px system-ui';
    ctx.fillText(`BOSS APPROACHING · ${remaining}`, 800, 135);
    ctx.restore();
  }

  private hideCatastropheTransitionIdentity():boolean{
    const boss=this.enemies.enemies.find(enemy=>enemy.alive&&enemy.type==='boss')??null;const heroCritical=this.dangerState.heroCritical,coreCritical=this.dangerState.coreCritical,bossSpecialTimer=boss?.specialTimer??99;return heroCritical||coreCritical||bossSpecialTimer<=1.2;
  }

  private drawCatastropheTransitionForecast(ctx:CanvasRenderingContext2D,seconds:number,x:number,y:number):void{
    const projection=projectCatastropheTransitionForecast(seconds);if(!projection.visible||this.hideCatastropheTransitionIdentity()||!this.catastropheTransitionIdentityAtlasReady||!this.catastropheTransitionIdentityAtlasImage)return;
    const w=82,h=22,size=10;ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(7,10,18,.9)';ctx.fillRect(x,y,w,h);const statusIcon=catastropheTransitionIdentityIcon(projection.status);ctx.strokeStyle=statusIcon.accent;ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,h-1);ctx.fillStyle='#dcecff';ctx.font='900 9px system-ui';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(catastropheTransitionForecastLabel(projection),x+4,y+h/2+.5);const transitionIcon=catastropheTransitionIdentityIcon('transition');ctx.drawImage(this.catastropheTransitionIdentityAtlasImage,transitionIcon.sx,transitionIcon.sy,transitionIcon.sw,transitionIcon.sh,x+54,y+6,size,size);ctx.drawImage(this.catastropheTransitionIdentityAtlasImage,statusIcon.sx,statusIcon.sy,statusIcon.sw,statusIcon.sh,x+68,y+6,size,size);ctx.restore();
  }

  private drawCatastropheStatusIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    if (!this.catastrophe || !this.catastropheIdentityAtlasReady || !this.catastropheIdentityAtlasImage) return;
    const icon = catastropheIdentityIcon(this.catastrophe.id);
    ctx.save();
    ctx.globalAlpha = .94;
    ctx.drawImage(this.catastropheIdentityAtlasImage, icon.sx, icon.sy, icon.sw, icon.sh, x, y, size, size);
    ctx.restore();
  }

  private drawCatastropheBanner(ctx: CanvasRenderingContext2D): void {
    if (!this.catastrophe) return;
    const alpha = Math.min(1, this.catastropheBannerTimer / 0.55);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(6,8,14,.84)'; ctx.fillRect(500, 350, 600, 96);
    ctx.strokeStyle = this.catastrophe.id === 'goldenNight' ? '#f3d36b' : '#ff6675'; ctx.lineWidth = 3; ctx.strokeRect(500, 350, 600, 96);
    if (this.catastropheIdentityAtlasReady && this.catastropheIdentityAtlasImage) {
      const icon = catastropheIdentityIcon(this.catastrophe.id);
      ctx.drawImage(this.catastropheIdentityAtlasImage, icon.sx, icon.sy, icon.sw, icon.sh, 526, 370, 56, 56);
    }
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '900 30px system-ui'; ctx.fillText(this.catastrophe.name, 800, 387);
    ctx.font = '700 16px system-ui'; ctx.fillStyle = '#c9d6e0'; ctx.fillText(this.catastrophe.description, 800, 420);
    const projection=this.catastropheBannerTransitionProjection;if(projection){ctx.font='800 11px system-ui';ctx.fillStyle=catastropheTransitionIdentityIcon(projection.status).accent;ctx.fillText(catastropheTransitionHint(projection,2),800,439);if(this.catastropheTransitionIdentityAtlasReady&&this.catastropheTransitionIdentityAtlasImage){const transitionIcon=catastropheTransitionIdentityIcon('transition'),statusIcon=catastropheTransitionIdentityIcon(projection.status);ctx.drawImage(this.catastropheTransitionIdentityAtlasImage,transitionIcon.sx,transitionIcon.sy,transitionIcon.sw,transitionIcon.sh,947,428,14,14);ctx.drawImage(this.catastropheTransitionIdentityAtlasImage,statusIcon.sx,statusIcon.sy,statusIcon.sw,statusIcon.sh,965,428,14,14);}}
    ctx.restore();
  }

  private useHealingPotion(): void {
    if (this.hero.healingPotions <= 0 || this.hero.hp >= this.hero.maxHp) return;
    const beforeHp=this.hero.hp;
    this.equipmentState = { ...this.equipmentState, healingPotions: Math.max(0, this.equipmentState.healingPotions - 1) };
    const efficiency = getContractModifiers(this.endlessState.contracts, this.elapsed * 1000).potionEfficiency;
    this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + this.hero.maxHp * 0.35 * efficiency);
    if(this.hero.hp>beforeHp){if(efficiency>1.001)this.queueSurvivalResponseVfx('heroPotionBoost');else this.queueSurvivalResponseVfx('heroPotion');}
    this.syncEquipmentState();
  }

  private openShop(): void {
    if (this.shopTokens <= 0 || this.shopOverlay.isOpen || this.gameOver) return;
    this.input.clearStrategicActionArms();
    if (this.onboarding.signal('shop')) this.saveStoredOnboardingState();
    this.shopTokens -= 1;
    this.clearBufferedCastIntents();
    this.paused = true;
    this.rerollsThisVisit = 0;
    this.shopImpactMessage = '';
    this.shopOffers = generateShopOffers();
    this.refreshShopOverlay();
  }

  private refreshShopOverlay(): void {
    const guidance = shopGuidanceForOffers(this.shopOffers, { heroId:this.hero.profileId, archetype:this.currentBuildArchetype(), state:this.equipmentState });
    const quickOffer=quickShopRecommendation(this.shopOffers,guidance,this.equipmentState);
    const openingFastPath=openingShopFastPath(this.elapsed,Boolean(quickOffer));
    const repeatFast=repeatShopFastPath(this.elapsed,quickOffer,this.equipmentState);
    const lateFast=lateShopFastPath(this.elapsed,quickOffer,this.equipmentState);
    const promotedFast=repeatFast.promoteQuickBuy?repeatFast:lateFast;
    const fastPath=promotedFast.promoteQuickBuy
      ? {promoteQuickBuy:true,position:'before-grid' as const,estimatedPointerTravelReduction:promotedFast.estimatedPointerTravelReduction,newControlCount:0 as const}
      : openingFastPath;
    const model = { state: this.equipmentState, offers: this.shopOffers, rerollPrice: rerollCost(this.rerollsThisVisit), guidance, impactMessage:this.shopImpactMessage, quickOffer, fastPath };
    const purchase = (offer:ShopDisplayOffer,closeAfterPurchase=false):void => {
      const beforeState = this.equipmentState;
      const beforeWeaponLegendary = this.equipmentState.weapon?.legendary ?? false;
      const beforeArmorLegendary = this.equipmentState.armor?.legendary ?? false;
      const result = purchaseOffer(this.equipmentState, offer);
      if (!result.ok) return;
      this.equipmentState = result.state;
      this.shopImpactMessage = purchaseImpactFeedback(beforeState, result.state, offer).message;
      const becameLegendary = (!beforeWeaponLegendary && (result.state.weapon?.legendary ?? false)) || (!beforeArmorLegendary && (result.state.armor?.legendary ?? false));
      this.audio.play(becameLegendary ? 'legendary' : 'purchase');
      this.syncEquipmentState();
      if (closeAfterPurchase) { this.shopOverlay.hide(); this.paused = false; return; }
      this.refreshShopOverlay();
    };
    const handlers = {
      onPurchase: (offer: ShopDisplayOffer) => purchase(offer,false),
      onQuickPurchase: (offer: ShopDisplayOffer) => {
        const currentGuidance=shopGuidanceForOffers(this.shopOffers,{heroId:this.hero.profileId,archetype:this.currentBuildArchetype(),state:this.equipmentState});
        const currentQuick=quickShopRecommendation(this.shopOffers,currentGuidance,this.equipmentState);
        if(!currentQuick||currentQuick.id!==offer.id||currentQuick.kind!==offer.kind||currentQuick.price!==offer.price||!safeQuickPurchase(offer,this.shopOffers,this.equipmentState))return;
        purchase(offer,true);
      },
      onReroll: () => {
        const price = rerollCost(this.rerollsThisVisit);
        if (this.equipmentState.coins < price) return;
        this.equipmentState = { ...this.equipmentState, coins: this.equipmentState.coins - price };
        this.rerollsThisVisit += 1;
        this.shopOffers = generateShopOffers();
        this.shopImpactMessage = '';
        this.syncEquipmentState();
        this.refreshShopOverlay();
      },
      onClose: () => { this.shopOverlay.hide(); this.paused = false; },
    };
    if (this.shopOverlay.isOpen) this.shopOverlay.refresh(model);
    else this.shopOverlay.open(model, handlers);
  }

  private currentCombatBuild(): CombatBuildModifiers {
    const base = composeCombatBuild({
      heroId: this.hero.profileId,
      traitId: this.selectedTrait,
      relicId: this.activeRelic,
      equipment: this.equipmentState,
      legendaryRuntime: this.legendaryEffects.modifiers,
    });
    const metered = composeHeroMeterCombat(base, heroMeterModifiers(this.heroMeter));
    const objective = composeObjectiveCombatModifiers(this.objectivePowerTimer);
    const combo = this.comboRuntime.modifiers;
    const heroAscension = heroAscensionModifiers(this.endlessState.heroAscension.selected);
    const currentFinalForm = this.currentHeroFinalForm();
    const finalForm = finalFormModifiers(currentFinalForm);
    const mobility = currentFinalForm ? finalFormMobilityProfile(currentFinalForm.id) : null;
    const flow = finalFormFlowModifiers(this.finalFormFlow, currentFinalForm?.id ?? null, this.elapsed * 1000);
    const signature = finalFormSignatureModifiers(this.endlessState.signature,currentFinalForm,this.elapsed*1000);
    const oath = longRunOathModifiers(this.endlessState.oaths,this.elapsed*1000);
    const overdrive = this.currentOverdriveModifiers();
    const resonance = this.currentRelicResonance().modifiers;
    return {
      ...metered,
      spellPowerMultiplier: metered.spellPowerMultiplier * objective.spellPowerMultiplier * combo.spellPowerMultiplier * heroAscension.spellPowerMultiplier * finalForm.spellPowerMultiplier * flow.damageMultiplier * signature.spellPowerMultiplier * oath.spellPowerMultiplier * overdrive.spellPowerMultiplier * resonance.spellPowerMultiplier,
      cooldownMultiplier: metered.cooldownMultiplier * combo.cooldownMultiplier * heroAscension.cooldownMultiplier * finalForm.cooldownMultiplier * flow.cooldownMultiplier * signature.cooldownMultiplier * overdrive.cooldownMultiplier * resonance.cooldownMultiplier,
      areaMultiplier: metered.areaMultiplier * combo.areaMultiplier * heroAscension.areaMultiplier * finalForm.areaMultiplier * signature.areaMultiplier * overdrive.areaMultiplier * resonance.areaMultiplier,
      moveSpeedMultiplier: metered.moveSpeedMultiplier * heroAscension.moveSpeedMultiplier * finalForm.moveSpeedMultiplier * (mobility?.moveSpeedMultiplier ?? 1) * flow.moveSpeedMultiplier * signature.moveSpeedMultiplier * (this.elapsed * 1000 < this.arenaEvadeBoostUntilMs ? this.arenaEvadeMoveMultiplier : 1),
      heroDamageTakenMultiplier: metered.heroDamageTakenMultiplier * heroAscension.heroDamageTakenMultiplier * finalForm.heroDamageTakenMultiplier * signature.heroDamageTakenMultiplier * overdrive.heroDamageTakenMultiplier,
      coreDamageTakenMultiplier: metered.coreDamageTakenMultiplier * heroAscension.coreDamageTakenMultiplier * finalForm.coreDamageTakenMultiplier * signature.coreDamageTakenMultiplier * oath.coreDamageTakenMultiplier * overdrive.coreDamageTakenMultiplier * resonance.coreDamageTakenMultiplier,
      goldMultiplier: metered.goldMultiplier * resonance.goldMultiplier * oath.goldMultiplier,
    };
  }

  private syncEquipmentState(build: CombatBuildModifiers = this.currentCombatBuild()): void {
    this.hero.coins = this.equipmentState.coins;
    this.hero.healingPotions = this.equipmentState.healingPotions;
    this.hero.equipmentSpellPower = build.spellPowerMultiplier;
    this.hero.equipmentCooldownMultiplier = build.cooldownMultiplier;
    this.hero.equipmentMoveSpeed = build.moveSpeedMultiplier;
    this.hero.equipmentDamageTakenMultiplier = build.heroDamageTakenMultiplier;
    this.hero.equipmentAreaMultiplier = build.areaMultiplier;
    this.hero.equipmentGoldMultiplier = build.goldMultiplier;
    this.hero.equipmentPickupMultiplier = build.pickupMultiplier;
    this.hero.equipmentCoreDamageTakenMultiplier = build.coreDamageTakenMultiplier;
  }

  private applyLegendaryProcs(procs: readonly LegendaryProc[], origin: Vec2): void {
    for (const proc of procs) {
      if (proc.type === 'bonusGold') {
        this.equipmentState = { ...this.equipmentState, coins: this.equipmentState.coins + proc.amount };
        this.hero.coins = this.equipmentState.coins;
        this.goldEarned += proc.amount;
        const identity=legendaryProcIdentity(proc,this.equipmentState);if (proc.amount >= 250 && identity) this.showLegendaryAwakeningEventToast(`미다스의 손 · +${proc.amount}G`,identity.itemId);
      } else if (proc.type === 'magnet') {
        this.pickups.setGlobalMagnet(proc.duration);
        const identity=legendaryProcIdentity(proc,this.equipmentState);if(identity)this.showLegendaryAwakeningEventToast('심연의 자석망토 · 전역 흡수',identity.itemId);else this.showEventToast('심연의 자석망토 · 전역 흡수');
      } else if (proc.type === 'coreHeal') {
        this.core.hp = Math.min(this.core.maxHp, this.core.hp + this.core.maxHp * proc.fraction);
        const identity=legendaryProcIdentity(proc,this.equipmentState);if(identity)this.showLegendaryAwakeningEventToast('영원의 성벽 · 수호핵 복구',identity.itemId);else this.showEventToast('영원의 성벽 · 수호핵 복구');
      } else if (proc.type === 'nova') {
        const damage = 82 * this.hero.spellPower * this.hero.equipmentSpellPower;
        for (const enemy of this.enemies.enemies) {
          if (enemy.alive && Math.hypot(enemy.pos.x - origin.x, enemy.pos.y - origin.y) <= proc.radius + enemy.radius) this.enemies.damage(enemy, damage);
        }
        this.feedback.addImpact(origin, 'final');
        const identity=legendaryProcIdentity(proc,this.equipmentState);if(identity)this.showLegendaryAwakeningEventToast('폭발 지팡이 · NOVA',identity.itemId);
      }
    }
  }

  private gainXp(value: number): void {
    this.hero.xp += value;
    while (this.hero.xp >= this.hero.xpNext) {
      this.hero.xp -= this.hero.xpNext;
      this.hero.level += 1;
      this.hero.xpNext = xpNeededForLevel(this.hero.level);
      this.queuedLevelUps += 1;
      this.audio.play('levelUp');
    }
  }


  private openNextBossReward(generation: number): void {
    if (this.queuedBossRewards <= 0 || this.gameOver) return;
    const guidedChoices = guideBossRewardChoices(
      buildBossRewardChoices(this.spells, Math.random, this.hero.profileId, this.activeRelic, this.pendingBossArchetype, this.fusionRuntime.equipped, this.masteryProfile.heroes[this.hero.profileId].level),
      { activeRelic:this.activeRelic, activeFusionCount:this.fusionRuntime.equipped.length },
    );
    const repeatChoices = reduceRepeatBossRewardDecision(guidedChoices,{elapsedSeconds:this.elapsed,activeRelic:this.activeRelic,activeFusionCount:this.fusionRuntime.equipped.length});
    const deepChoices = reduceDeepRunBossRewardDecision(repeatChoices,{elapsedSeconds:this.elapsed,activeRelic:this.activeRelic,activeFusionCount:this.fusionRuntime.equipped.length});
    const ultraReward = compactUltraLongBossRewards(deepChoices,{elapsedSeconds:this.elapsed,activeRelic:this.activeRelic,activeFusionCount:this.fusionRuntime.equipped.length});
    const completeBuild=(this.equipmentState.weapon?.rank??0)>=5&&(this.equipmentState.armor?.rank??0)>=5&&Boolean(this.activeRelic)&&this.fusionRuntime.equipped.length>=2;
    const fourEightReward=focusFourEightHourBossRewards(ultraReward.choices,{elapsedSeconds:this.elapsed,completeBuild,finalFormActive:Boolean(this.currentHeroFinalForm())});
    const eightTwelveReward=focusEightTwelveHourBossRewards(fourEightReward.choices,{elapsedSeconds:this.elapsed,completeBuild,finalFormActive:Boolean(this.currentHeroFinalForm())});
    const choices = eightTwelveReward.choices;
    const impactContext={heroId:this.hero.profileId,activeRelic:this.activeRelic,activeFusions:this.fusionRuntime.equipped,spellLevels:this.spells.levels};
    const presentedChoices = choices.map((choice) => {
      const impact=projectBossRewardImpact(choice,impactContext),impactRoleStyle=bossRewardImpactRoleIdentityStyle(impact.roleId),impactRole={impactRoleStyle,impactRoleLabel:impact.roleLabel};
      if (choice.kind === 'fusion') {
        const projection=projectFusionSelection(this.fusionRuntime.equipped,choice.fusionId,this.hero.profileId);
        const componentStyles=projection.components.map(spellId=>heroAbilitySecondaryIdentityStyle(this.hero.profileId,spellId));
        const relationStyle=fusionComponentRelationIdentityStyle(projection.relationId);
        const modifierStyles=projection.modifierIds.slice(0,2).map(fusionModifierIdentityStyle);
        const relationLabel=fusionComponentRelationIdentityIcon(projection.relationId).label;
        const effectiveHint=fusionProjectionHint(projection);
        return{...choice,...impactRole,projection,secondaryIdentityStyles:[...componentStyles,relationStyle,...modifierStyles],secondaryIdentityLimit:5,badge:relationLabel,hint:`2마법 결합 · ${effectiveHint}`};
      }
      if (choice.kind === 'relic') {
        const projection=projectRelicResonance(this.activeRelic,choice.relicId,{heroId:this.hero.profileId,fusionCount:this.fusionRuntime.equipped.length,fateChoiceCount:this.fateRuntime.choices.length,ascensionSelections:this.endlessState.heroAscension.selected.length});
        const impactStyle=relicResonanceImpactIdentityStyle(projection.impactId),tierStyle=relicResonanceTierIdentityStyle(projection.tierId);
        const resonanceHint=`공명 ${projection.before.score.toFixed(1)}→${projection.after.score.toFixed(1)} · ${projection.after.tier===0?'잠든 공명':`공명 ${['','I','II','III'][projection.after.tier]}`}`;
        const hint=choice.hint?`${impact.summary} · ${resonanceHint} · ${choice.hint}`:`${impact.summary} · ${resonanceHint}`;
        return{...choice,...impactRole,secondaryIdentityStyles:[impactStyle,tierStyle],hint};
      }
      if(choice.id in this.spells.levels){
        const spellId=choice.id as SpellId,currentLevel=this.spells.levels[spellId],projection=projectSpellEvolutionSelection(this.hero.profileId,spellId,currentLevel),base={...choice,...impactRole,identityIconStyle:growthChoiceIconStyle(String(choice.id),choice.kind,this.hero.profileId),evolutionCrestStyle:spellEvolutionPreviewCrestStyle(this.hero.profileId,currentLevel)||undefined};
        if(!projection)return{...base,hint:choice.hint?`${impact.summary} · ${choice.hint}`:impact.summary};
        const tierStyle=spellEvolutionTierDeltaIdentityStyle(projection.tierDeltaId),modifierStyles=projection.modifierIds.slice(0,2).map(spellEvolutionModifierIdentityStyle),projectionHint=spellEvolutionProjectionHint(projection);
        return{...base,secondaryIdentityStyles:[tierStyle,...modifierStyles],hint:choice.hint?`${projectionHint} · ${choice.hint}`:projectionHint};
      }
      return{...choice,...impactRole,hint:choice.hint?`${impact.summary} · ${choice.hint}`:impact.summary};
    });
    const renderDecision = (activeGeneration: number) => this.levelUpOverlay.open(presentedChoices, (choice) => {
      this.finishDecisionPick(activeGeneration, () => {
        let rewardFeedback='보스 성장 완료';
        if (choice.kind === 'relic') {
          const projection=projectRelicResonance(this.activeRelic,choice.relicId,{heroId:this.hero.profileId,fusionCount:this.fusionRuntime.equipped.length,fateChoiceCount:this.fateRuntime.choices.length,ascensionSelections:this.endlessState.heroAscension.selected.length});
          this.activeRelic = choice.relicId;
          this.syncEquipmentState();
          rewardFeedback='';
          this.showBuildIdentityEventToast(`유물 장착 · ${relicDefinition(choice.relicId).name}`,choice.relicId);
          const actual=this.currentRelicResonance();
          this.eventToastRelicProjection={impactId:relicResonanceImpactForTiers(projection.before.tier,actual.tier),tierId:relicResonanceTierIdentityForTier(actual.tier)};
        } else if (choice.kind === 'fusion') {
          const projection=projectFusionSelection(this.fusionRuntime.equipped,choice.fusionId,this.hero.profileId);
          if (this.fusionRuntime.equip(choice.fusionId)) { rewardFeedback=''; this.showFusionProjectionEventToast(`마법 융합 · ${fusionDefinition(choice.fusionId).name}`,choice.fusionId,projection); }
        } else {
          const evolutionSpell=choice.id in this.spells.levels?choice.id as SpellId:null;
          const beforeTier=evolutionSpell?spellEvolutionTier(this.spells.levels[evolutionSpell]):0;
          applyUpgrade(choice.id, this.hero, this.spells);
          const evolved=evolutionSpell?this.notifySpellEvolutionIfChanged(evolutionSpell,beforeTier):false;
          rewardFeedback=evolved?'':`보스 성장 · ${choice.title}`;
        }
        const goalInput={elapsedSeconds:this.elapsed,heroId:this.hero.profileId,spellLevels:this.spells.levels,activeRelic:this.activeRelic,activeFusions:this.fusionRuntime.equipped,equipment:this.equipmentState};
        const nextGoal=lateRunMaintenanceGoal({...goalInput,bossesKilled:this.bossesKilled})??secondBossBuildGoal({...goalInput,bossesKilled:this.bossesKilled})??bossRewardNextGoal(goalInput);
        if(rewardFeedback)this.showEventToast(nextGoal?.label??rewardFeedback);
        this.queuedBossRewards = Math.max(0, this.queuedBossRewards - 1);
        this.pendingBossArchetype = null;
      });
    }, {
      eyebrow: 'BOSS REWARD',
      title: eightTwelveReward.compact||fourEightReward.compact||ultraReward.compact ? '유지 성장만 확인하세요' : '궁극의 힘을 선택하세요',
      subtitle: eightTwelveReward.compact||eightTwelveReward.preserveFullDetails ? eightTwelveReward.subtitle : fourEightReward.compact||fourEightReward.preserveFullDetails ? fourEightReward.subtitle : ultraReward.subtitle,
    });
    this.decisionReplay = renderDecision;
    renderDecision(generation);
  }

  private openNextLevelUp(generation: number): void {
    if (this.queuedLevelUps <= 0 || this.gameOver) return;
    if (this.onboarding.signal('levelup')) this.saveStoredOnboardingState();
    const openingChoices = guideOpeningUpgradeChoices(buildUpgradeChoices(this.hero, this.spells), { elapsedSeconds:this.elapsed, hpRatio:this.hero.hp/Math.max(1,this.hero.maxHp) });
    const choices = guideMidgameUpgradeChoices(openingChoices, { elapsedSeconds:this.elapsed, heroId:this.hero.profileId, spellLevels:this.spells.levels, activeFusions:this.fusionRuntime.equipped });
    const presentedChoices = choices.map((choice) => {
      if(choice.id in this.spells.levels){
        const spellId=choice.id as SpellId,currentLevel=this.spells.levels[spellId],projection=projectSpellEvolutionSelection(this.hero.profileId,spellId,currentLevel),base={...choice,identityIconStyle:growthChoiceIconStyle(String(choice.id),undefined,this.hero.profileId),evolutionCrestStyle:spellEvolutionPreviewCrestStyle(this.hero.profileId,currentLevel)||undefined};
        if(!projection)return base;
        const tierStyle=spellEvolutionTierDeltaIdentityStyle(projection.tierDeltaId),modifierStyles=projection.modifierIds.slice(0,2).map(spellEvolutionModifierIdentityStyle),projectionHint=spellEvolutionProjectionHint(projection);
        return{...base,secondaryIdentityStyles:[tierStyle,...modifierStyles],hint:choice.hint?`${projectionHint} · ${choice.hint}`:projectionHint};
      }
      const projection=projectGenericUpgradeEffectiveGain(this.hero,choice.id);
      if(!projection)return choice;
      const statusStyle=genericUpgradeGainStatusIdentityStyle(projection.statusId),projectionHint=genericUpgradeEffectiveGainHint(projection);
      return{...choice,identityIconStyle:growthChoiceIconStyle(String(choice.id),undefined,this.hero.profileId),secondaryIdentityStyles:[statusStyle],hint:choice.hint?`${projectionHint} · ${choice.hint}`:projectionHint};
    });
    const renderDecision = (activeGeneration: number) => this.levelUpOverlay.open(presentedChoices, (choice) => {
      this.finishDecisionPick(activeGeneration, () => {
        const evolutionSpell=choice.id in this.spells.levels?choice.id as SpellId:null;
        const beforeTier=evolutionSpell?spellEvolutionTier(this.spells.levels[evolutionSpell]):0;
        applyUpgrade(choice.id, this.hero, this.spells);
        if(evolutionSpell)this.notifySpellEvolutionIfChanged(evolutionSpell,beforeTier);
        this.queuedLevelUps = Math.max(0, this.queuedLevelUps - 1);
      });
    });
    this.decisionReplay = renderDecision;
    renderDecision(generation);
  }

  private loadStoredOnboardingState() {
    try {
      if (typeof window === 'undefined') return defaultOnboardingState();
      return loadOnboardingState(this.storage);
    } catch {
      return defaultOnboardingState();
    }
  }

  private saveStoredOnboardingState(): void {
    try { if (typeof window !== 'undefined') saveOnboardingState(this.storage, this.onboarding.snapshot()); }
    catch { /* optional persistence */ }
  }

  private loadStoredMetaProfile(): MetaProfile {
    try {
      if (typeof window === 'undefined') return defaultMetaProfile();
      return loadMetaProfile(this.storage);
    } catch {
      return defaultMetaProfile();
    }
  }

  private saveStoredMetaProfile(): void {
    try {
      if (typeof window !== 'undefined') saveMetaProfile(this.storage, this.metaProfile);
    } catch {
      // Persistent storage is optional; a run should never fail because the browser blocks it.
    }
  }

  private loadStoredRunSnapshot(): RunSnapshot | null {
    try { return typeof window === 'undefined' ? null : loadRunSnapshotWithJournal(this.storage); }
    catch { return null; }
  }

  private loadStoredRetryBlueprint(): RetryBlueprint | null {
    try { return typeof window === 'undefined' ? null : loadRetryBlueprint(this.storage); }
    catch { return null; }
  }

  private saveStoredRetryBlueprint(blueprint: RetryBlueprint): void {
    try { if (typeof window !== 'undefined') saveRetryBlueprint(this.storage, blueprint); }
    catch { /* optional persistence */ }
  }

  private clearStoredRunSnapshot(): void {
    this.resumeSnapshot = null;
    try {
      if (typeof window !== 'undefined') {
        clearRunSnapshot(this.storage);
        clearRecoveryJournal(this.storage);
      }
    } catch { /* optional */ }
  }

  private saveCurrentRunSnapshot(): void {
    if (this.gameOver || this.elapsed < 5 || this.selectedTrait === null) return;
    const snapshot: RunSnapshot = {
      version: 1, savedAt: Date.now(), heroId: this.hero.profileId, traitId: this.selectedTrait, threatLevel: this.runThreatLevel, elapsed: this.elapsed,
      hero: { level: this.hero.level, xp: this.hero.xp, xpNext: this.hero.xpNext, hp: this.hero.hp, maxHp: this.hero.maxHp, coins: this.hero.coins, kills: this.hero.kills },
      coreHp: this.core.hp, spellLevels: { ...this.spells.levels }, equipment: structuredClone(this.equipmentState), relic: this.activeRelic,
      fusions: [...this.fusionRuntime.equipped], fateChoices: [...this.fateRuntime.choices], map: { id: this.terrain.currentLayout.id, evolutionStage: this.terrain.evolutionStage },
      progression: { bossesKilled: this.bossesKilled, goldEarned: this.goldEarned, shopTokens: this.shopTokens },
      endless: serializeExtension(this.endlessState),
      ...(this.currentReplayPlan ? { replayCapsule:this.currentReplayPlan.capsule } : {}),
    };
    this.resumeSnapshot = snapshot;
    try { if (typeof window !== 'undefined') saveRunSnapshot(this.storage, snapshot); } catch { /* optional */ }
  }

  private restoreRunSnapshot(snapshot: RunSnapshot): void {
    this.resetRun(snapshot.heroId, snapshot.traitId);
    this.runThreatLevel = snapshot.threatLevel;
    this.elapsed = snapshot.elapsed;
    this.hero.level = snapshot.hero.level; this.hero.xp = snapshot.hero.xp; this.hero.xpNext = snapshot.hero.xpNext; this.hero.hp = snapshot.hero.hp; this.hero.maxHp = snapshot.hero.maxHp; this.hero.coins = snapshot.hero.coins; this.hero.kills = snapshot.hero.kills;
    this.core.hp = Math.min(this.core.maxHp, snapshot.coreHp);
    for (const id of Object.keys(snapshot.spellLevels) as SpellId[]) this.spells.levels[id] = snapshot.spellLevels[id];
    this.equipmentState = structuredClone(snapshot.equipment); this.activeRelic = snapshot.relic; this.fusionRuntime.restore(snapshot.fusions); this.fateRuntime.restore(snapshot.fateChoices);
    this.terrain.restore(snapshot.map.id, snapshot.map.evolutionStage);
    this.bossesKilled = snapshot.progression.bossesKilled; this.goldEarned = snapshot.progression.goldEarned; this.shopTokens = snapshot.progression.shopTokens;
    this.endlessState = restoreExtension(snapshot.endless ?? '', this.endlessState.rng.seed);
    this.currentReplayPlan = snapshot.replayCapsule ? createBuildReplayPlan(snapshot.replayCapsule) : null;
    this.currentRunBlueprint = { version: 1, heroId: snapshot.heroId, traitId: snapshot.traitId, threatLevel: snapshot.threatLevel, mapId: snapshot.map.id, seed: this.endlessState.rng.seed };
    this.saveStoredRetryBlueprint(this.currentRunBlueprint);
    this.nextSnapshotAt = this.elapsed + 15;
    this.nextRecoveryJournalAt = this.elapsed + 60;
    this.syncEquipmentState();
    this.syncRelicResonanceRecallTracker();
    this.syncSynergyIdentityTracker(false);
    this.syncRunFoundationIdentityTracker(false);
  }

  private loadStoredMasteryProfile(): MasteryProfile {
    try { return typeof window === 'undefined' ? defaultMasteryProfile() : loadMasteryProfile(this.storage); }
    catch { return defaultMasteryProfile(); }
  }

  private saveStoredMasteryProfile(): void {
    try { if (typeof window !== 'undefined') saveMasteryProfile(this.storage, this.masteryProfile); } catch { /* optional */ }
  }

  private loadStoredThreatProfile(): ThreatProfile {
    try { return typeof window === 'undefined' ? defaultThreatProfile() : loadThreatProfile(this.storage); }
    catch { return defaultThreatProfile(); }
  }

  private saveStoredThreatProfile(): void {
    try { if (typeof window !== 'undefined') saveThreatProfile(this.storage, this.threatProfile); } catch { /* optional */ }
  }

  private loadStoredRunRecords(): RunRecordsState {
    try { return typeof window === 'undefined' ? defaultRunRecords() : loadRunRecords(this.storage); }
    catch { return defaultRunRecords(); }
  }

  private saveStoredRunRecords(): void {
    try { if (typeof window !== 'undefined') saveRunRecords(this.storage, this.runRecords); } catch { /* optional */ }
  }

  private loadStoredRunHistory(): RunHistoryEntry[] {
    try { return typeof window === 'undefined' ? [] : loadRunHistory(this.storage); }
    catch { return []; }
  }

  private saveRunHistory(entry: RunHistoryEntry): void {
    try { if (typeof window !== 'undefined') appendRunHistory(this.storage, entry); }
    catch { /* optional */ }
  }

  private loadStoredAudioSettings(): AudioSettings {
    try { return typeof window === 'undefined' ? defaultAudioSettings() : loadAudioSettings(this.storage); }
    catch { return defaultAudioSettings(); }
  }

  private currentBuildCapsulePayload(seed = this.currentRunBlueprint?.seed ?? this.endlessState.rng.seed): BuildCapsulePayload {
    const finalForm = this.currentHeroFinalForm();
    return {
      version:1,
      heroId:this.hero.profileId,
      traitId:this.selectedTrait,
      threatLevel:this.runThreatLevel,
      mapId:this.terrain.currentLayout.id,
      seed,
      finalForm:finalForm?.id ?? null,
      ascensions:this.endlessState.heroAscension.selected,
      fateChoices:[...this.fateRuntime.choices],
      relic:this.activeRelic,
      fusions:[...this.fusionRuntime.equipped],
      archetype:this.currentBuildArchetype(),
      spellLevels:{ ...this.spells.levels },
    };
  }

  private currentReplayGuidance(): ReplayGuidance | null {
    return this.currentReplayPlan ? replayGuidance(this.currentReplayPlan, this.currentBuildCapsulePayload()) : null;
  }

  private currentReplayProgress(): number { return this.currentReplayGuidance()?.progress ?? 0; }

  private endRun(): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.clearStoredRunSnapshot();
    this.paused = true;
    this.levelUpOverlay.close();
    this.shopOverlay.hide();
    const danger = dangerTierForSeconds(this.elapsed);
    const shardsEarned = calculateArcaneShards({
      seconds: this.elapsed, bosses: this.bossesKilled, danger, kills: this.hero.kills, threatLevel: this.runThreatLevel,
    });
    this.metaProfile = { ...this.metaProfile, shards: this.metaProfile.shards + shardsEarned };
    this.saveStoredMetaProfile();

    const highestCombo = this.comboRuntime.highest;
    const tacticalRecap: TacticalRecap = {
      objectivesCompleted: this.objectiveRuntime.stats.completed, objectivesFailed: this.objectiveRuntime.stats.failed, bestObjectiveStreak: this.objectiveRuntime.stats.bestStreak,
      bossNodesDestroyed: this.bossEncounterNodesDestroyed + this.bossEncounter.destroyedNodes, highestComboTier: highestCombo.tier, highestComboName: highestCombo.name,
    };
    const tacticalBonus = calculateTacticalScoreBonus(tacticalRecap);
    const retryBlueprint = this.currentRunBlueprint ?? this.loadStoredRetryBlueprint();
    const finalForm = this.currentHeroFinalForm();
    const archetype = this.currentBuildArchetype();
    const buildCapsule = encodeBuildCapsule(this.currentBuildCapsulePayload(retryBlueprint?.seed ?? this.endlessState.rng.seed));
    const replayProgress = this.currentReplayPlan ? this.currentReplayProgress() : null;
    const nextReplayPlan = createBuildReplayPlan(buildCapsule);

    const completion = completeRunProgression(this.threatProfile, this.runRecords, {
      heroId: this.hero.profileId,
      mapId: this.terrain.currentLayout.id,
      threatLevel: this.runThreatLevel,
      seconds: this.elapsed,
      kills: this.hero.kills,
      bosses: this.bossesKilled,
      danger, tacticalBonus, buildCapsule,
    });
    this.threatProfile = completion.threatProfile;
    this.runRecords = completion.records;
    this.saveStoredThreatProfile();
    this.saveStoredRunRecords();

    const endlessMastery = composeEndlessHostModifiers(this.endlessState, this.runThreatLevel).masteryXpMultiplier;
    const contractMastery = getContractModifiers(this.endlessState.contracts, this.elapsed * 1000).masteryMultiplier;
    const masteryXpEarned = Math.round(masteryXpForRun({
      seconds: this.elapsed, bosses: this.bossesKilled, threatLevel: this.runThreatLevel, kills: this.hero.kills,
    }) * endlessMastery * contractMastery);
    this.masteryProfile = grantMasteryXp(this.masteryProfile, this.hero.profileId, masteryXpEarned);
    this.saveStoredMasteryProfile();

    const priorHistory = this.loadStoredRunHistory();
    const runCode = buildRunFingerprint({
      heroId: this.hero.profileId,
      threat: this.runThreatLevel,
      elapsedSeconds: this.elapsed,
      relicId: this.activeRelic,
      fusions: this.fusionRuntime.equipped,
      fateChoices: this.fateRuntime.choices,
      heroAscensions: this.endlessState.heroAscension.selected,
      chronicle: this.endlessState.chronicle.milestones,
    });
    const comparison = compareRunResult({
      heroId: this.hero.profileId,
      threat: this.runThreatLevel,
      seconds: this.elapsed,
      score: completion.summary.score,
      mapId: this.terrain.currentLayout.id,
    }, priorHistory);
    this.saveRunHistory({
      runCode,
      heroId: this.hero.profileId,
      seconds: this.elapsed,
      threat: this.runThreatLevel,
      score: completion.summary.score,
      mapId: this.terrain.currentLayout.id,
      bosses: this.bossesKilled,
      archetype,
      buildCapsule,
      ...(finalForm ? { finalForm: finalForm.id } : {}),
    });
    const baseBuildSummary = compactPhase22BuildLabels({
      masteryLevel: this.masteryProfile.heroes[this.hero.profileId].level,
      relicName: this.activeRelic ? relicDisplayName(this.activeRelic) : null,
      synergies: synergyHudNames({ heroId: this.hero.profileId, traitId: this.selectedTrait, relicId: this.activeRelic, equipment: this.equipmentState }, 2),
      fusionNames: this.fusionRuntime.equipped.map((id) => fusionDefinition(id).name),
      fateSummary: this.fateRuntime.choices.length > 0 ? fateHudSummary(this.fateRuntime.choices) : '',
    });
    this.resultsOverlay.open({
      heroId: this.hero.profileId,
      survival: this.formatTime(this.elapsed),
      kills: this.hero.kills,
      level: this.hero.level,
      gold: this.goldEarned,
      bosses: this.bossesKilled,
      shardsEarned,
      shardsTotal: this.metaProfile.shards,
      relic: relicDisplayName(this.activeRelic),
      relicId: this.activeRelic,
      fusionIds: [...this.fusionRuntime.equipped],
      finalFormId: finalForm?.id ?? null,
      score: completion.summary.score,
      newRecord: completion.newRecord,
      threat: `T${this.runThreatLevel} · ${threatLevelName(this.runThreatLevel)}`,
      map: this.terrain.currentLayout.name,
      mapId: this.terrain.currentLayout.id,
      mapEvolutionStage: this.terrain.evolutionStage,
      unlockedThreat: completion.unlockedNewThreat ? this.threatProfile.unlocked : null,
      tacticalRecap: [...tacticalRecapLines(tacticalRecap), ...chronicleSummary(this.endlessState.chronicle, 2)],
      masteryLevel: this.masteryProfile.heroes[this.hero.profileId].level,
      masteryXpEarned,
      runCode,
      buildCapsule,
      comparisonLines: comparison.lines,
      buildSummary: [
        ...(replayProgress !== null ? [`REPLAY · 목표 빌드 ${replayProgress}% 재현`] : []),
        ...(finalForm ? [`최종형 · ${finalForm.name}`] : []),
        `빌드 · ${this.endlessArchetypeName(archetype)}`,
        ...baseBuildSummary,
      ].slice(0, 4),
    }, {
      onRetrySameHero: () => {
        this.resultsOverlay.hide();
        if (nextReplayPlan) {
          this.clearStoredRunSnapshot();
          this.resetRun(nextReplayPlan.blueprint.heroId, nextReplayPlan.blueprint.traitId, nextReplayPlan.blueprint, nextReplayPlan);
          this.syncRunFoundationIdentityTracker(true);
          this.paused = false;
        } else if (retryBlueprint) {
          this.clearStoredRunSnapshot();
          this.resetRun(retryBlueprint.heroId, retryBlueprint.traitId, retryBlueprint);
          this.syncRunFoundationIdentityTracker(true);
          this.paused = false;
        } else this.openTraitSelect(this.hero.profileId);
      },
      onLobby: () => this.restart(),
    });
  }

  private drawBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ratio: number, fill: string, bg: string): void {
    ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = fill; ctx.fillRect(x, y, w * clamp(ratio, 0, 1), h);
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
  }

  private formatTime(seconds: number): string {
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}

import { distance, normalize, type Vec2 } from '../core/math.js';
import type { ActionId } from './config.js';
import type { GuardianCore, Hero } from './entities.js';
import { heroSpellIdentity } from './hero-spells.js';
import { spellEvolution } from './spell-evolutions.js';
import type { Enemy, EnemyManager } from './enemies.js';
import type { CombatFeedbackSink } from './combat-feedback.js';
import type { MagicTargetSink } from './boss-encounters.js';
import type { FusionId } from './spell-fusions.js';
import { composeFusionSpellModifiers, type FusionSpellModifiers } from './fusion-integration.js';
import { chooseSpellTarget } from './auto-targeting.js';
import { autoWeakpointAimPoint } from './auto-weakpoint-aim.js';
import type { BossEncounterNode } from './boss-encounters.js';
import { ultimateChoreographyDescriptor, type UltimateChoreographyDescriptor } from './spell-vfx.js';
import type { ResidualCombatMotionPolicy } from './combat-cue-priority.js';
import type { PresentationQuality } from './presentation-budget.js';
import { battlefieldSpellVfxSprite } from './battlefield-props-vfx-assets.js';
import { heroProjectileImpactVfxSprite, heroProjectileVfxSprite } from './hero-projectile-vfx-assets.js';
import { heroSpellSignatureVfxSprite } from './hero-spell-signature-vfx-assets.js';
import { heroUltimateSignatureVfxSprite } from './hero-ultimate-signature-vfx-assets.js';
import { persistentSpellZoneVfxSprite } from './persistent-spell-zone-vfx-assets.js';
import { crowdControlPropagationVfxSprite } from './crowd-control-propagation-vfx-assets.js';
import { ultimatePostImpactResidueVfxSprite, type UltimatePostImpactResidueVfxKind } from './ultimate-post-impact-residue-vfx-assets.js';
import type { HeroId } from './hero-profiles.js';
import { heroProjectileLaunchOriginPresentation, visualLaunchPosition } from './hero-projectile-launch-origin-rendering.js';
import { projectileTrailLaunchHandoffPresentation } from './projectile-trail-launch-handoff-rendering.js';
import { projectileImpactEntryOffset, projectileImpactVisualPosition } from './projectile-impact-arrival-handoff-rendering.js';
import { projectileMultiHitImpactHandoff } from './projectile-multihit-impact-retirement-rendering.js';
import { secondaryImpactCanonicalPresentation, type SecondaryImpactKind } from './secondary-impact-canonical-rendering.js';
import { secondaryImpactClusterReadabilityBudgetPresentation } from './secondary-impact-cluster-readability-budget-rendering.js';
import { advanceSecondaryImpactClusterIdentityHold, createSecondaryImpactClusterIdentityHoldState, secondaryImpactClusterIdentityFor, type SecondaryImpactClusterIdentityHoldState } from './secondary-impact-cluster-identity-hold-rendering.js';
import { advanceSecondaryImpactClusterSplitLineage, createSecondaryImpactClusterSplitLineageState, secondaryImpactSplitLineageFor, type SecondaryImpactClusterSplitLineageState } from './secondary-impact-cluster-split-lineage-rendering.js';

export type SpellId = 'fireBolt' | 'chainLightning' | 'frostNova' | 'flameField' | 'meteorStorm' | 'blackHole';

export interface SpellTuning {
  damage: number;
  cooldown: number;
  radius: number;
  projectiles: number;
  jumps: number;
  duration: number;
}

export function spellTuning(id: SpellId, level: number): SpellTuning {
  const l = Math.max(1, Math.floor(level));
  switch (id) {
    case 'fireBolt':
      return { damage: 34 + (l - 1) * 8, cooldown: Math.max(0.20, 0.50 - (l - 1) * 0.024), radius: 11 + Math.floor((l - 1) / 3) * 2, projectiles: 1 + Math.floor((l - 1) / 4), jumps: 0, duration: 0 };
    case 'chainLightning':
      return { damage: 48 + (l - 1) * 10, cooldown: Math.max(1.05, 2.25 - (l - 1) * 0.07), radius: 0, projectiles: 1, jumps: 3 + Math.floor((l - 1) / 3), duration: 0 };
    case 'frostNova':
      return { damage: 42 + (l - 1) * 7, cooldown: Math.max(2.2, 5.4 - (l - 1) * 0.13), radius: 150 + (l - 1) * 11, projectiles: 1, jumps: 0, duration: 2.1 + (l - 1) * 0.08 };
    case 'flameField':
      return { damage: 19 + (l - 1) * 4.5, cooldown: Math.max(2.4, 5.1 - (l - 1) * 0.12), radius: 92 + (l - 1) * 6, projectiles: 1, jumps: 0, duration: 4.4 + (l - 1) * 0.10 };
    case 'meteorStorm':
      return { damage: 155 + (l - 1) * 32, cooldown: Math.max(18, 31 - (l - 1) * 0.8), radius: 96 + (l - 1) * 5, projectiles: 7 + Math.floor((l - 1) / 2), jumps: 0, duration: 0 };
    case 'blackHole':
      return { damage: 32 + (l - 1) * 8, cooldown: Math.max(22, 38 - (l - 1) * 0.9), radius: 195 + (l - 1) * 8, projectiles: 1, jumps: 0, duration: 5 + (l - 1) * 0.2 };
  }
}


export function chainJumpBudget(baseJumps: number, temporaryBonus: number): number {
  return Math.max(0, Math.floor(baseJumps)) + Math.max(0, Math.floor(temporaryBonus));
}

interface PlayerProjectile {
  heroId: HeroId;
  pos: Vec2;
  vel: Vec2;
  radius: number;
  damage: number;
  ttl: number;
  pierceLeft: number;
  hitIds: Set<number>;
  primary: string;
  secondary: string;
  splashRadius: number;
  splashDamage: number;
  slowFactor: number;
  slowDuration: number;
  evolutionTier: 0 | 1 | 2;
  visualLaunchOffset?: Vec2;
  visualLaunchTtl?: number;
  visualLaunchMaxTtl?: number;
}


interface ProjectileImpactVisual {
  pos: Vec2;
  entryOffset?: Vec2;
  heroId: HeroId;
  ttl: number;
  maxTtl: number;
  size: number;
  alphaScale?: number;
  secondaryKind?: SecondaryImpactKind;
}

interface FlameField {
  spriteId: 'flameField';
  heroId: HeroId;
  pos: Vec2;
  radius: number;
  damage: number;
  ttl: number;
  maxTtl: number;
  tick: number;
  tickTimer: number;
  primary: string;
  secondary: string;
  slowFactor: number;
  slowDuration: number;
  evolutionTier: 0 | 1 | 2;
}

interface Meteor {
  spriteId: 'meteorStorm';
  heroId: HeroId;
  pos: Vec2;
  radius: number;
  damage: number;
  delay: number;
  exploded: boolean;
  flash: number;
  primary: string;
  secondary: string;
  slowFactor: number;
  slowDuration: number;
  evolutionTier: 0 | 1 | 2;
  choreography: UltimateChoreographyDescriptor;
}

interface BlackHole {
  spriteId: 'blackHole';
  heroId: HeroId;
  pos: Vec2;
  radius: number;
  damage: number;
  ttl: number;
  maxTtl: number;
  tickTimer: number;
  tickInterval: number;
  primary: string;
  secondary: string;
  slowFactor: number;
  slowDuration: number;
  pullMultiplier: number;
  evolutionTier: 0 | 1 | 2;
  choreography: UltimateChoreographyDescriptor;
}

interface LightningArc {
  points: Vec2[];
  visualStart?: Vec2;
  heroId: HeroId;
  ttl: number;
  color: string;
  spriteId: 'chainLightning';
}

interface NovaVisual {
  pos: Vec2;
  heroId: HeroId;
  radius: number;
  ttl: number;
  color: string;
  spriteId: 'frostNova';
}

export interface SpellWorld {
  hero: Hero;
  core?: GuardianCore;
  enemies: EnemyManager;
  terrain?: { hitByMagic(pos: Vec2, strength: number): void };
  magicTargets?: MagicTargetSink;
  feedback?: CombatFeedbackSink;
  fusions?: readonly FusionId[];
  autoAim?: boolean;
  preferredAutoTargetId?: number | null;
  preferredManualTargetId?: number | null;
  weakpointAim?: { activeBossId:number|null; nodes:readonly BossEncounterNode[] } | undefined;
  visualBodyOffset?: Vec2 | undefined;
  reducedMotion?: boolean | undefined;
  reducedFlash?: boolean | undefined;
}

const ACTION_TO_SPELL: Partial<Record<ActionId, SpellId>> = {
  spell1: 'fireBolt',
  spell2: 'chainLightning',
  spell3: 'frostNova',
  spell4: 'flameField',
  ultimate1: 'meteorStorm',
  ultimate2: 'blackHole',
};

export class SpellSystem {
  readonly levels: Record<SpellId, number> = {
    fireBolt: 1,
    chainLightning: 1,
    frostNova: 1,
    flameField: 1,
    meteorStorm: 1,
    blackHole: 1,
  };

  private readonly cooldowns: Record<SpellId, number> = {
    fireBolt: 0,
    chainLightning: 0,
    frostNova: 0,
    flameField: 0,
    meteorStorm: 0,
    blackHole: 0,
  };

  private projectiles: PlayerProjectile[] = [];
  private fields: FlameField[] = [];
  private meteors: Meteor[] = [];
  private holes: BlackHole[] = [];
  private arcs: LightningArc[] = [];
  private novas: NovaVisual[] = [];
  private projectileImpactVisuals: ProjectileImpactVisual[] = [];
  private secondaryImpactClusterIdentityHold: SecondaryImpactClusterIdentityHoldState = createSecondaryImpactClusterIdentityHoldState();
  private secondaryImpactClusterSplitLineage: SecondaryImpactClusterSplitLineageState = createSecondaryImpactClusterSplitLineageState();
  private persistentZoneExpireVfx: Array<{heroId:HeroId;kind:'flameField'|'blackHole';pos:Vec2;radius:number;ttl:number;maxTtl:number}> = [];
  private ultimatePostImpactResidues: Array<{heroId:HeroId;kind:UltimatePostImpactResidueVfxKind;pos:Vec2;radius:number;ttl:number;maxTtl:number}> = [];

  reset(): void {
    for (const key of Object.keys(this.levels) as SpellId[]) this.levels[key] = 1;
    for (const key of Object.keys(this.cooldowns) as SpellId[]) this.cooldowns[key] = 0;
    this.projectiles = [];
    this.fields = [];
    this.meteors = [];
    this.holes = [];
    this.arcs = [];
    this.novas = [];
    this.projectileImpactVisuals = [];
    this.secondaryImpactClusterIdentityHold = createSecondaryImpactClusterIdentityHoldState();
    this.secondaryImpactClusterSplitLineage = createSecondaryImpactClusterSplitLineageState();
    this.persistentZoneExpireVfx = [];
    this.ultimatePostImpactResidues = [];
  }

  update(dt: number, world: SpellWorld): void {
    for (const id of Object.keys(this.cooldowns) as SpellId[]) this.cooldowns[id] = Math.max(0, this.cooldowns[id] - dt);
    this.updateProjectiles(dt, world);
    this.updateFields(dt, world);
    this.updateMeteors(dt, world);
    this.updateBlackHoles(dt, world);
    for (const arc of this.arcs) arc.ttl -= dt;
    for (const nova of this.novas) nova.ttl -= dt;
    for (const impact of this.projectileImpactVisuals) impact.ttl -= dt;
    for (const cue of this.persistentZoneExpireVfx) cue.ttl -= dt;
    for (const cue of this.ultimatePostImpactResidues) cue.ttl -= dt;
    this.arcs = this.arcs.filter((v) => v.ttl > 0);
    this.novas = this.novas.filter((v) => v.ttl > 0);
    this.projectileImpactVisuals = this.projectileImpactVisuals.filter((v) => v.ttl > 0);
    this.secondaryImpactClusterIdentityHold = advanceSecondaryImpactClusterIdentityHold(this.secondaryImpactClusterIdentityHold,this.projectileImpactVisuals.filter((impact)=>impact.secondaryKind!==undefined).map((impact)=>({pos:impact.pos})),dt);
    this.secondaryImpactClusterSplitLineage = advanceSecondaryImpactClusterSplitLineage(this.secondaryImpactClusterSplitLineage,this.projectileImpactVisuals.filter((impact)=>impact.secondaryKind!==undefined).map((impact)=>({pos:impact.pos})),dt);
    this.persistentZoneExpireVfx = this.persistentZoneExpireVfx.filter((v)=>v.ttl>0);
    this.ultimatePostImpactResidues = this.ultimatePostImpactResidues.filter((v)=>v.ttl>0);
  }

  tryCast(action: ActionId, world: SpellWorld): boolean {
    const id = ACTION_TO_SPELL[action];
    if (!id || this.cooldowns[id] > 0) return false;
    const tuning = spellTuning(id, this.levels[id]);
    const evolution = spellEvolution(world.hero.profileId, id, this.levels[id]);
    const fusion = composeFusionSpellModifiers(world.fusions ?? [], world.hero.profileId, id);
    const effectiveCooldown = tuning.cooldown * evolution.cooldownMultiplier * fusion.cooldownMultiplier * world.hero.cooldownMultiplier * world.hero.equipmentCooldownMultiplier * world.hero.temporaryCooldownMultiplier;
    this.cooldowns[id] = effectiveCooldown;

    switch (id) {
      case 'fireBolt': this.castFireBolt(world, tuning, fusion); break;
      case 'chainLightning': this.castChainLightning(world, tuning, fusion); break;
      case 'frostNova': this.castFrostNova(world, tuning, fusion); break;
      case 'flameField': this.castFlameField(world, tuning, fusion); break;
      case 'meteorStorm': this.castMeteorStorm(world, tuning); break;
      case 'blackHole': this.castBlackHole(world, tuning); break;
    }
    return true;
  }

  levelUp(id: SpellId): void {
    this.levels[id] = Math.min(10, this.levels[id] + 1);
  }

  cooldownRemaining(action: ActionId): number {
    const id = ACTION_TO_SPELL[action];
    return id ? this.cooldowns[id] : 0;
  }

  cooldownRatio(action: ActionId, hero: Hero): number {
    const id = ACTION_TO_SPELL[action];
    if (!id) return 0;
    const evolution = spellEvolution(hero.profileId, id, this.levels[id]);
    const max = spellTuning(id, this.levels[id]).cooldown * evolution.cooldownMultiplier * hero.cooldownMultiplier * hero.equipmentCooldownMultiplier * hero.temporaryCooldownMultiplier;
    return max <= 0 ? 0 : Math.min(1, this.cooldowns[id] / max);
  }

  get hasActiveBlackHole(): boolean { return this.holes.length > 0; }

  render(ctx: CanvasRenderingContext2D, motion?: ResidualCombatMotionPolicy, propVfxAtlasImage?: HTMLImageElement | null, propVfxAtlasReady = false, heroProjectileAtlasImage?: HTMLImageElement | null, heroProjectileAtlasReady = false, heroSpellSignatureAtlasImage?: HTMLImageElement | null, heroSpellSignatureAtlasReady = false, ultimateSignatureAtlasImage?: HTMLImageElement | null, ultimateSignatureAtlasReady = false, persistentSpellZoneVfxAtlasImage?: HTMLImageElement | null, persistentSpellZoneVfxAtlasReady = false, crowdControlPropagationVfxAtlasImage?: HTMLImageElement | null, crowdControlPropagationVfxAtlasReady = false, reducedFlash = false, ultimatePostImpactResidueVfxAtlasImage?: HTMLImageElement | null, ultimatePostImpactResidueVfxAtlasReady = false, reducedMotion = false, presentationQuality: PresentationQuality = 'high'): void {
    const drawVfxStamp = (id: 'fireBolt' | 'chainLightning' | 'frostNova' | 'flameField' | 'meteorStorm' | 'blackHole', x: number, y: number, size: number, alpha: number): void => {
      if (!propVfxAtlasReady || !propVfxAtlasImage || alpha <= 0 || size <= 0) return;
      const sprite = battlefieldSpellVfxSprite(id);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(propVfxAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, x - size / 2, y - size / 2, size, size);
      ctx.restore();
    };
    for (const field of this.fields) {
      ctx.save();
      const g = ctx.createRadialGradient(field.pos.x, field.pos.y, 10, field.pos.x, field.pos.y, field.radius);
      g.addColorStop(0, `${field.primary}55`); g.addColorStop(.65, `${field.secondary}33`); g.addColorStop(1, `${field.secondary}00`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(field.pos.x, field.pos.y, field.radius, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `${field.primary}88`; ctx.lineWidth = 3; ctx.stroke();
      const fieldAlpha = Math.min(0.72, 0.28 + Math.max(0, Math.min(1, field.ttl / 1.4)) * 0.44);
      drawVfxStamp(field.spriteId, field.pos.x, field.pos.y, field.radius * 2.05, fieldAlpha);
      if (heroSpellSignatureAtlasReady && heroSpellSignatureAtlasImage) {
        const sprite = heroSpellSignatureVfxSprite(field.heroId, 'flameField');
        const size = field.radius * 2.1;
        ctx.save(); ctx.globalAlpha = Math.min(0.62, fieldAlpha * 0.82);
        ctx.drawImage(heroSpellSignatureAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, field.pos.x - size / 2, field.pos.y - size / 2, size, size);
        ctx.restore();
      }
      if (persistentSpellZoneVfxAtlasReady && persistentSpellZoneVfxAtlasImage) {
        const progress = 1 - Math.max(0, field.ttl / Math.max(0.001, field.maxTtl));
        const enterSprite = persistentSpellZoneVfxSprite(field.heroId,'flameField','enter');
        const activeSprite = persistentSpellZoneVfxSprite(field.heroId,'flameField','active');
        const sprite = progress < 0.18 ? enterSprite : activeSprite;
        const size = field.radius * 2.28;
        ctx.save(); ctx.globalAlpha = progress < 0.18 ? 0.76 : 0.48;
        ctx.drawImage(persistentSpellZoneVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,field.pos.x-size/2,field.pos.y-size/2,size,size); ctx.restore();
      }
      ctx.restore();
    }

    for (const hole of this.holes) {
      ctx.save();
      const choreography=hole.choreography;
      const blackHoleMotionAmplitude = motion?.blackHoleMotionAmplitude ?? 0.05;
      const orbitMotionScale = motion ? (motion.owner === 'black-hole-vortex' ? 1 : 0) : 1;
      const pulse = 0.92 + Math.sin(hole.ttl * 8) * blackHoleMotionAmplitude;
      const g = ctx.createRadialGradient(hole.pos.x, hole.pos.y, 10, hole.pos.x, hole.pos.y, hole.radius * pulse);
      g.addColorStop(0, 'rgba(8,8,18,.98)'); g.addColorStop(.45, `${hole.secondary}99`); g.addColorStop(1, `${hole.primary}00`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hole.pos.x, hole.pos.y, hole.radius * pulse, 0, Math.PI * 2); ctx.fill();
      if(choreography.motion==='orbit') for(let i=0;i<choreography.orbitCount;i++){ const r=hole.radius*(.38+i*.16); const movingPhase=Math.sin(hole.ttl*2+i); const staticPhase=i*.83; const orbitPhase=staticPhase+(movingPhase-staticPhase)*orbitMotionScale; ctx.globalAlpha=Math.min(.62,choreography.glowAlpha+.12); ctx.strokeStyle=i%2?hole.secondary:hole.primary; ctx.lineWidth=1.5+i*.55; ctx.beginPath(); ctx.arc(hole.pos.x,hole.pos.y,r,orbitPhase,orbitPhase+Math.PI*1.35); ctx.stroke(); }
      ctx.globalAlpha=.9; ctx.strokeStyle = `${hole.primary}88`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(hole.pos.x,hole.pos.y,hole.radius*pulse,0,Math.PI*2); ctx.stroke();
      drawVfxStamp(hole.spriteId, hole.pos.x, hole.pos.y, hole.radius * 2.15, 0.38);
      if (ultimateSignatureAtlasReady && ultimateSignatureAtlasImage) {
        const sprite = heroUltimateSignatureVfxSprite(hole.heroId, 'blackHole');
        const size = hole.radius * 2.24;
        ctx.save(); ctx.globalAlpha = 0.58;
        ctx.drawImage(ultimateSignatureAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, hole.pos.x - size / 2, hole.pos.y - size / 2, size, size);
        ctx.restore();
      }
      if (persistentSpellZoneVfxAtlasReady && persistentSpellZoneVfxAtlasImage) {
        const progress = 1 - Math.max(0, hole.ttl / Math.max(0.001, hole.maxTtl));
        const enterSprite = persistentSpellZoneVfxSprite(hole.heroId,'blackHole','enter');
        const activeSprite = persistentSpellZoneVfxSprite(hole.heroId,'blackHole','active');
        const sprite = progress < 0.18 ? enterSprite : activeSprite;
        const size = hole.radius * 2.22;
        ctx.save(); ctx.globalAlpha = progress < 0.18 ? 0.72 : 0.46;
        ctx.drawImage(persistentSpellZoneVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,hole.pos.x-size/2,hole.pos.y-size/2,size,size); ctx.restore();
      }
      if (crowdControlPropagationVfxAtlasReady && crowdControlPropagationVfxAtlasImage) {
        const sprite=crowdControlPropagationVfxSprite(hole.heroId,'blackHole');
        const size=hole.radius * 2.34;
        ctx.save();ctx.globalAlpha=reducedFlash ? 0.32 : 0.58;
        ctx.drawImage(crowdControlPropagationVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,hole.pos.x-size/2,hole.pos.y-size/2,size,size);ctx.restore();
      }
      ctx.restore();
    }

    for (const meteor of this.meteors) {
      if (!meteor.exploded) {
        const choreography=meteor.choreography;
        const readiness = Math.max(0, Math.min(1, 1 - meteor.delay / 1.2));
        if(choreography.motion==='descent') for(let i=0;i<choreography.trailCount;i++){ const spread=(i-(choreography.trailCount-1)/2)*6; ctx.globalAlpha=Math.min(.72,choreography.glowAlpha+.2)*(.35+readiness*.65); ctx.strokeStyle=i%2?meteor.secondary:meteor.primary; ctx.lineWidth=1.4+(i%3)*.55; ctx.beginPath(); ctx.moveTo(meteor.pos.x+spread,meteor.pos.y-choreography.streakLength*(1-readiness*.35)); ctx.lineTo(meteor.pos.x+spread*.25,meteor.pos.y-12); ctx.stroke(); }
        ctx.globalAlpha=1; ctx.strokeStyle = meteor.secondary;
        ctx.lineWidth = 4 + readiness * 4;
        ctx.beginPath(); ctx.arc(meteor.pos.x, meteor.pos.y, meteor.radius * (1.1 - readiness * 0.18), 0, Math.PI * 2); ctx.stroke();
      } else if (meteor.flash > 0) {
        const alpha = Math.min(1, meteor.flash / 0.22);
        const g = ctx.createRadialGradient(meteor.pos.x, meteor.pos.y, 8, meteor.pos.x, meteor.pos.y, meteor.radius * 1.3);
        g.addColorStop(0, `${meteor.primary}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`); g.addColorStop(.32, `${meteor.secondary}${Math.round(alpha * 210).toString(16).padStart(2, '0')}`); g.addColorStop(1, `${meteor.secondary}00`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(meteor.pos.x, meteor.pos.y, meteor.radius * 1.3, 0, Math.PI * 2); ctx.fill();
        for(let i=0;i<meteor.choreography.ringCount;i++){ctx.globalAlpha=Math.min(.72,alpha*meteor.choreography.afterglow);ctx.strokeStyle=i%2?meteor.secondary:meteor.primary;ctx.lineWidth=2+i*.65;ctx.beginPath();ctx.arc(meteor.pos.x,meteor.pos.y,meteor.radius*(.62+i*.19+(.28*(1-alpha))),0,Math.PI*2);ctx.stroke();}
        drawVfxStamp(meteor.spriteId, meteor.pos.x, meteor.pos.y, meteor.radius * 2.45, Math.min(0.86, alpha * 0.92));
        if (ultimateSignatureAtlasReady && ultimateSignatureAtlasImage) {
          const sprite = heroUltimateSignatureVfxSprite(meteor.heroId, 'meteorStorm');
          const size = meteor.radius * 2.58;
          ctx.save(); ctx.globalAlpha = Math.min(0.86, alpha * 0.9);
          ctx.drawImage(ultimateSignatureAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, meteor.pos.x - size / 2, meteor.pos.y - size / 2, size, size);
          ctx.restore();
        }
      }
    }

    for (const projectile of this.projectiles) {
      const visualPos = projectile.visualLaunchOffset && projectile.visualLaunchTtl !== undefined && projectile.visualLaunchMaxTtl
        ? visualLaunchPosition(projectile.pos, projectile.visualLaunchOffset, projectile.visualLaunchTtl, projectile.visualLaunchMaxTtl)
        : projectile.pos;
      const trail=projectileTrailLaunchHandoffPresentation({gameplayPos:projectile.pos,velocity:projectile.vel,launchOffset:projectile.visualLaunchOffset,launchTtl:projectile.visualLaunchTtl,launchMaxTtl:projectile.visualLaunchMaxTtl,radius:projectile.radius},reducedMotion);
      if(trail.owner==='launch'){ctx.save();ctx.globalAlpha=trail.alpha;ctx.strokeStyle=projectile.secondary;ctx.lineWidth=Math.max(1.4,projectile.radius*.18);ctx.beginPath();ctx.moveTo(trail.tail.x,trail.tail.y);ctx.lineTo(trail.head.x,trail.head.y);ctx.stroke();ctx.restore();}
      ctx.save();
      ctx.shadowColor = projectile.secondary; ctx.shadowBlur = 18;
      ctx.fillStyle = projectile.primary; ctx.globalAlpha = heroProjectileAtlasReady ? 0.28 : 1; ctx.beginPath(); ctx.arc(projectile.pos.x, projectile.pos.y, projectile.radius, 0, Math.PI * 2); ctx.fill();
      if (heroProjectileAtlasReady && heroProjectileAtlasImage) {
        const sprite = heroProjectileVfxSprite(projectile.heroId);
        const angle = Math.atan2(projectile.vel.y, projectile.vel.x);
        const size = Math.max(34, projectile.radius * 4.6);
        ctx.save(); ctx.translate(visualPos.x, visualPos.y); ctx.rotate(angle); ctx.globalAlpha = 0.96;
        ctx.drawImage(heroProjectileAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -size * 0.6, -size / 2, size * 1.2, size);
        ctx.restore();
      }
      if (projectile.evolutionTier > 0) {
        ctx.globalAlpha = projectile.evolutionTier === 2 ? 0.85 : 0.48;
        ctx.strokeStyle = projectile.secondary; ctx.lineWidth = projectile.evolutionTier === 2 ? 4 : 2;
        ctx.beginPath(); ctx.arc(visualPos.x, visualPos.y, projectile.radius * (projectile.evolutionTier === 2 ? 1.75 : 1.45), 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    }

    if (heroProjectileAtlasReady && heroProjectileAtlasImage) {
      const secondaryImpacts=this.projectileImpactVisuals.filter((impact)=>impact.secondaryKind!==undefined);
      const secondaryBudget=secondaryImpactClusterReadabilityBudgetPresentation(secondaryImpacts.map((impact)=>{const identity=secondaryImpactClusterIdentityFor(this.secondaryImpactClusterIdentityHold,impact.pos),lineage=secondaryImpactSplitLineageFor(this.secondaryImpactClusterSplitLineage,impact.pos),lineageKey=lineage.key;return{pos:impact.pos,ttl:impact.ttl,maxTtl:impact.maxTtl,stableClusterKey:lineageKey,heldCount:identity.heldCount};}),presentationQuality,reducedFlash);
      let secondaryIndex=0;
      for (const impact of this.projectileImpactVisuals) {
        const budget=impact.secondaryKind!==undefined?secondaryBudget[secondaryIndex++]:null;if(budget&&!budget.visible)continue;
        const sprite = heroProjectileImpactVfxSprite(impact.heroId);
        const progress = 1 - Math.max(0, impact.ttl / impact.maxTtl);
        const size = impact.size * (0.72 + progress * 0.5) * (budget?.sizeScale??1);
        const impactVisualPos=projectileImpactVisualPosition(impact.pos,impact.entryOffset??{x:0,y:0},impact.ttl,impact.maxTtl);
        ctx.save(); ctx.globalAlpha = Math.max(0, 1 - progress) * 0.9 * (impact.alphaScale??1) * (budget?.alphaScale??1);
        ctx.drawImage(heroProjectileAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, impactVisualPos.x - size / 2, impactVisualPos.y - size / 2, size, size);
        ctx.restore();
      }
    }

    for (const arc of this.arcs) {
      const alpha = Math.max(0, arc.ttl / 0.18);
      const visualFirst=arc.visualStart??arc.points[0];
      ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = arc.color; ctx.lineWidth = 6; ctx.shadowColor = arc.color; ctx.shadowBlur = 15;
      ctx.beginPath();
      if(visualFirst)ctx.moveTo(visualFirst.x,visualFirst.y);
      for(let i=1;i<arc.points.length;i++){const p=arc.points[i]!;ctx.lineTo(p.x,p.y);}
      ctx.stroke();
      if(crowdControlPropagationVfxAtlasReady&&crowdControlPropagationVfxAtlasImage){const sprite=crowdControlPropagationVfxSprite(arc.heroId,'chainLightning');for(let i=1;i<arc.points.length;i++){const a=i===1&&arc.visualStart?arc.visualStart:arc.points[i-1]!,b=arc.points[i]!,mx=(a.x+b.x)/2,my=(a.y+b.y)/2,angle=Math.atan2(b.y-a.y,b.x-a.x);ctx.save();ctx.translate(mx,my);ctx.rotate(angle);ctx.globalAlpha=Math.min(alpha,reducedFlash ? 0.32 : 0.58);ctx.drawImage(crowdControlPropagationVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,-38,-30,76,60);ctx.restore();}}
      const pivot = arc.points[Math.floor(arc.points.length / 2)] ?? visualFirst;
      if (pivot) {
        drawVfxStamp(arc.spriteId, pivot.x, pivot.y, 88, alpha * 0.42);
        if (heroSpellSignatureAtlasReady && heroSpellSignatureAtlasImage) {
          const sprite = heroSpellSignatureVfxSprite(arc.heroId, 'chainLightning');
          const size = 96; ctx.globalAlpha = alpha * 0.64;
          ctx.drawImage(heroSpellSignatureAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, pivot.x - size / 2, pivot.y - size / 2, size, size);
        }
      }
      ctx.restore();
    }

    for (const nova of this.novas) {
      const t = 1 - Math.max(0, nova.ttl / 0.34);
      ctx.globalAlpha = 1 - t; ctx.strokeStyle = nova.color; ctx.lineWidth = 8 * (1 - t) + 2;
      ctx.beginPath(); ctx.arc(nova.pos.x, nova.pos.y, nova.radius * t, 0, Math.PI * 2); ctx.stroke();
      drawVfxStamp(nova.spriteId, nova.pos.x, nova.pos.y, nova.radius * 2.05, (1 - t) * 0.64);
      if (heroSpellSignatureAtlasReady && heroSpellSignatureAtlasImage) {
        const sprite = heroSpellSignatureVfxSprite(nova.heroId, 'frostNova');
        const size = nova.radius * 2.12; ctx.save(); ctx.globalAlpha = (1 - t) * 0.66;
        ctx.drawImage(heroSpellSignatureAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, nova.pos.x - size / 2, nova.pos.y - size / 2, size, size);
        ctx.restore();
      }
      if(crowdControlPropagationVfxAtlasReady&&crowdControlPropagationVfxAtlasImage){const sprite=crowdControlPropagationVfxSprite(nova.heroId,'frostNova');const size=Math.max(72,nova.radius * t * 2.08);ctx.save();ctx.globalAlpha=(1-t)*(reducedFlash ? 0.32 : 0.58);ctx.drawImage(crowdControlPropagationVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,nova.pos.x-size/2,nova.pos.y-size/2,size,size);ctx.restore();}
    }

    if (persistentSpellZoneVfxAtlasReady && persistentSpellZoneVfxAtlasImage) {
      for (const cue of this.persistentZoneExpireVfx) {
        const sprite = persistentSpellZoneVfxSprite(cue.heroId,cue.kind,'expire');
        const progress = 1 - Math.max(0, cue.ttl / cue.maxTtl);
        const size = cue.radius * (2.1 + progress * 0.34);
        ctx.save(); ctx.globalAlpha = Math.max(0, 1 - progress) * 0.66;
        ctx.drawImage(persistentSpellZoneVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.pos.x-size/2,cue.pos.y-size/2,size,size); ctx.restore();
      }
    }

    if (ultimatePostImpactResidueVfxAtlasReady && ultimatePostImpactResidueVfxAtlasImage) {
      for (const cue of this.ultimatePostImpactResidues) {
        const sprite=ultimatePostImpactResidueVfxSprite(cue.heroId,cue.kind);
        const progress=1-Math.max(0,cue.ttl / cue.maxTtl);
        const size=cue.radius * 2.18 * (1+progress*.18);
        ctx.save();ctx.globalAlpha=Math.max(0,1-progress)*(reducedFlash ? 0.30 : 0.56);
        ctx.drawImage(ultimatePostImpactResidueVfxAtlasImage,sprite.sx,sprite.sy,sprite.sw,sprite.sh,cue.pos.x-size/2,cue.pos.y-size/2,size,size);ctx.restore();
      }
    }
  }

  private castFireBolt(world: SpellWorld, tuning: SpellTuning, fusion: FusionSpellModifiers): void {
    const target = this.chooseTarget(world);
    const aim = this.targetAimPoint(world,target);
    const baseDir = aim ? normalize({ x: aim.x - world.hero.pos.x, y: aim.y - world.hero.pos.y }) : world.hero.facing;
    const identity = heroSpellIdentity(world.hero.profileId, 'fireBolt');
    const evolution = spellEvolution(world.hero.profileId, 'fireBolt', this.levels.fireBolt);
    const count = tuning.projectiles + evolution.projectileBonus;
    const launch = heroProjectileLaunchOriginPresentation({bodyOffsetX:world.visualBodyOffset?.x??0,bodyOffsetY:world.visualBodyOffset?.y??0,facingX:world.hero.facing.x,facingY:world.hero.facing.y,radius:world.hero.radius,kind:'normal'},world.reducedMotion??false);
    const visualLaunchOrigin={x:world.hero.pos.x+launch.originOffsetX,y:world.hero.pos.y+launch.originOffsetY};
    for (let i = 0; i < count; i++) {
      const spread = (i - (count - 1) / 2) * 0.14;
      const angle = Math.atan2(baseDir.y, baseDir.x) + spread;
      const dir = { x: Math.cos(angle), y: Math.sin(angle) };
      const gameplayOrigin={ x: world.hero.pos.x + dir.x * 28, y: world.hero.pos.y + dir.y * 28 };
      this.projectiles.push({
        heroId: world.hero.profileId,
        pos: gameplayOrigin,
        visualLaunchOffset:{x:visualLaunchOrigin.x-gameplayOrigin.x,y:visualLaunchOrigin.y-gameplayOrigin.y},visualLaunchTtl:launch.convergeSeconds,visualLaunchMaxTtl:launch.convergeSeconds,
        vel: { x: dir.x * 700 * identity.projectileSpeedMultiplier, y: dir.y * 700 * identity.projectileSpeedMultiplier },
        radius: tuning.radius * world.hero.equipmentAreaMultiplier * identity.areaMultiplier * evolution.areaMultiplier * fusion.areaMultiplier,
        damage: tuning.damage * world.hero.spellPower * world.hero.equipmentSpellPower * identity.damageMultiplier * evolution.damageMultiplier * fusion.damageMultiplier,
        ttl: 1.35,
        pierceLeft: Math.floor((this.levels.fireBolt - 1) / 4) + identity.pierceBonus + evolution.pierceBonus + fusion.pierceBonus,
        hitIds: new Set<number>(),
        primary: identity.primary, secondary: identity.secondary, splashRadius: identity.splashRadius + evolution.splashRadiusBonus,
        splashDamage: tuning.damage * world.hero.spellPower * world.hero.equipmentSpellPower * (identity.splashDamageMultiplier + evolution.splashDamageBonus) * evolution.damageMultiplier * fusion.damageMultiplier,
        slowFactor: Math.max(0.24, identity.projectileSlowFactor * evolution.slowFactorMultiplier), slowDuration: identity.projectileSlowDuration * evolution.slowDurationMultiplier * fusion.slowDurationMultiplier,
        evolutionTier: evolution.tier,
      });
    }
  }

  private castChainLightning(world: SpellWorld, tuning: SpellTuning, fusion: FusionSpellModifiers): void {
    const identity = heroSpellIdentity(world.hero.profileId, 'chainLightning');
    const evolution = spellEvolution(world.hero.profileId, 'chainLightning', this.levels.chainLightning);
    let current = this.chooseTarget(world);
    if (!current) return;
    const points: Vec2[] = [{ ...world.hero.pos }];
    const launch=heroProjectileLaunchOriginPresentation({bodyOffsetX:world.visualBodyOffset?.x??0,bodyOffsetY:world.visualBodyOffset?.y??0,facingX:world.hero.facing.x,facingY:world.hero.facing.y,radius:world.hero.radius,kind:'normal'},world.reducedMotion??false);
    const visualStart={x:world.hero.pos.x+launch.originOffsetX,y:world.hero.pos.y+launch.originOffsetY};
    const hit = new Set<number>();
    for (let i = 0; i < chainJumpBudget(tuning.jumps + identity.chainJumpBonus + evolution.jumpBonus + fusion.jumpBonus, world.hero.temporaryChainJumpBonus) && current; i++) {
      hit.add(current.id);
      const hitSource={...(points[points.length-1] ?? world.hero.pos)};
      points.push({ ...current.pos });
      world.enemies.damage(current, tuning.damage * world.hero.spellPower * world.hero.equipmentSpellPower * identity.damageMultiplier * evolution.damageMultiplier * fusion.damageMultiplier * Math.pow(0.86, i), hitSource);
      if (identity.chainSlowFactor < 1) world.enemies.applySlow(current, Math.max(0.24, identity.chainSlowFactor * evolution.slowFactorMultiplier), identity.chainSlowDuration * evolution.slowDurationMultiplier * fusion.slowDurationMultiplier);
      const impactPos=this.targetAimPoint(world,current)??current.pos;
      if(i>0){const secondary=secondaryImpactCanonicalPresentation('chain',impactPos,world.reducedFlash??false);this.projectileImpactVisuals.push({pos:secondary.pos,entryOffset:secondary.entryOffset,alphaScale:secondary.alphaScale,secondaryKind:'chain',heroId:world.hero.profileId,ttl:.14,maxTtl:.14,size:54*secondary.sizeScale});if(this.projectileImpactVisuals.length>32)this.projectileImpactVisuals.splice(0,this.projectileImpactVisuals.length-32);}
      world.terrain?.hitByMagic(current.pos, 1);
      world.magicTargets?.hitMagic(impactPos, tuning.damage * 0.72);
      const from = current.pos;
      let next: Enemy | null = null;
      let best = 180;
      for (const candidate of world.enemies.enemies) {
        if (!candidate.alive || hit.has(candidate.id)) continue;
        const d = distance(from, candidate.pos);
        if (d < best) { best = d; next = candidate; }
      }
      current = next;
    }
    if (points.length > 1) {
      this.arcs.push({ points, visualStart, heroId: world.hero.profileId, ttl: 0.18, color: identity.primary, spriteId: 'chainLightning' });
      if (evolution.tier > 0) world.feedback?.addImpact(points[1] ?? world.hero.pos, evolution.tier === 2 ? 'final' : 'awakened');
    }
  }

  private castFrostNova(world: SpellWorld, tuning: SpellTuning, fusion: FusionSpellModifiers): void {
    const identity = heroSpellIdentity(world.hero.profileId, 'frostNova');
    const evolution = spellEvolution(world.hero.profileId, 'frostNova', this.levels.frostNova);
    const radius = tuning.radius * world.hero.equipmentAreaMultiplier * identity.areaMultiplier * evolution.areaMultiplier * fusion.areaMultiplier;
    for (const enemy of world.enemies.enemies) {
      if (!enemy.alive || distance(world.hero.pos, enemy.pos) > radius + enemy.radius) continue;
      const seria = world.hero.profileId === 'seria';
      world.enemies.damage(enemy, tuning.damage * world.hero.spellPower * world.hero.equipmentSpellPower * identity.novaDamageMultiplier * evolution.damageMultiplier * fusion.damageMultiplier * (seria ? 1.06 : 1), world.hero.pos, 'freeze');
      world.enemies.applySlow(enemy, Math.max(0.20, (seria ? 0.42 : 0.53) * evolution.slowFactorMultiplier), tuning.duration * evolution.durationMultiplier * evolution.slowDurationMultiplier * fusion.slowDurationMultiplier * (seria ? 1.25 : 1));
      if (identity.knockback > 0) world.enemies.pushAway(enemy, world.hero.pos, identity.knockback * evolution.knockbackMultiplier);
    }
    world.terrain?.hitByMagic(world.hero.pos, 1);
    world.magicTargets?.hitMagic(world.hero.pos, tuning.damage);
    this.novas.push({ pos: { ...world.hero.pos }, heroId: world.hero.profileId, radius, ttl: 0.34, color: identity.primary, spriteId: 'frostNova' });
    if (evolution.tier > 0) world.feedback?.addImpact(world.hero.pos, evolution.tier === 2 ? 'final' : 'awakened');
  }

  private castFlameField(world: SpellWorld, tuning: SpellTuning, fusion: FusionSpellModifiers): void {
    const identity = heroSpellIdentity(world.hero.profileId, 'flameField');
    const evolution = spellEvolution(world.hero.profileId, 'flameField', this.levels.flameField);
    const target = this.chooseTarget(world);
    const fallback = {
      x: world.hero.pos.x + world.hero.facing.x * 150,
      y: world.hero.pos.y + world.hero.facing.y * 150,
    };
    const aim=this.targetAimPoint(world,target);
    const pos = identity.fieldAtCore && world.core ? { ...world.core.pos } : aim ? { ...aim } : fallback;
    world.terrain?.hitByMagic(pos, 1);
    world.magicTargets?.hitMagic(pos, tuning.damage * 0.8);
    this.fields.push({ spriteId: 'flameField', heroId: world.hero.profileId, pos, radius: tuning.radius * world.hero.equipmentAreaMultiplier * identity.areaMultiplier * evolution.areaMultiplier * fusion.areaMultiplier, damage: tuning.damage * world.hero.spellPower * world.hero.equipmentSpellPower * identity.fieldDamageMultiplier * evolution.damageMultiplier * fusion.damageMultiplier, ttl: tuning.duration * evolution.durationMultiplier, maxTtl: tuning.duration * evolution.durationMultiplier, tick: 0.38 / identity.fieldTickMultiplier / evolution.tickMultiplier / fusion.tickMultiplier, tickTimer: 0, primary: identity.primary, secondary: identity.secondary, slowFactor: Math.max(0.22, identity.fieldSlowFactor * evolution.slowFactorMultiplier), slowDuration: identity.fieldSlowDuration * evolution.slowDurationMultiplier * fusion.slowDurationMultiplier, evolutionTier: evolution.tier });
    if (evolution.tier === 2) world.feedback?.addImpact(pos, 'final');
  }

  private castMeteorStorm(world: SpellWorld, tuning: SpellTuning): void {
    const identity = heroSpellIdentity(world.hero.profileId, 'meteorStorm');
    const evolution = spellEvolution(world.hero.profileId, 'meteorStorm', this.levels.meteorStorm);
    const target = this.chooseTarget(world);
    const aim=this.targetAimPoint(world,target);
    const center = aim ?? { x: world.hero.pos.x + world.hero.facing.x * 260, y: world.hero.pos.y + world.hero.facing.y * 260 };
    for (let i = 0; i < tuning.projectiles + evolution.projectileBonus; i++) {
      const angle = i * 2.399963229728653;
      const dist = 35 + (i % 4) * 58;
      this.meteors.push({
        pos: { x: center.x + Math.cos(angle) * dist, y: center.y + Math.sin(angle) * dist },
        radius: tuning.radius * world.hero.equipmentAreaMultiplier * identity.areaMultiplier * evolution.areaMultiplier,
        damage: tuning.damage * world.hero.spellPower * world.hero.equipmentSpellPower * identity.meteorDamageMultiplier * evolution.damageMultiplier,
        delay: (0.7 + i * 0.13) * identity.meteorDelayMultiplier * evolution.delayMultiplier,
        exploded: false,
        spriteId: 'meteorStorm', heroId: world.hero.profileId, flash: 0, primary: identity.primary, secondary: identity.secondary, choreography:ultimateChoreographyDescriptor('meteorStorm',this.levels.meteorStorm), slowFactor: Math.max(0.22, identity.meteorSlowFactor * evolution.slowFactorMultiplier), slowDuration: identity.meteorSlowDuration * evolution.slowDurationMultiplier, evolutionTier: evolution.tier,
      });
    }
  }

  private castBlackHole(world: SpellWorld, tuning: SpellTuning): void {
    const identity = heroSpellIdentity(world.hero.profileId, 'blackHole');
    const evolution = spellEvolution(world.hero.profileId, 'blackHole', this.levels.blackHole);
    const target = this.chooseTarget(world);
    const aim=this.targetAimPoint(world,target);
    const pos = aim ? { ...aim } : { x: world.hero.pos.x + world.hero.facing.x * 220, y: world.hero.pos.y + world.hero.facing.y * 220 };
    this.holes.push({ spriteId: 'blackHole', heroId: world.hero.profileId, pos, radius: tuning.radius * world.hero.equipmentAreaMultiplier * identity.areaMultiplier * evolution.areaMultiplier, damage: tuning.damage * world.hero.spellPower * world.hero.equipmentSpellPower * identity.holeDamageMultiplier * evolution.damageMultiplier, ttl: tuning.duration * evolution.durationMultiplier, maxTtl: tuning.duration * evolution.durationMultiplier, tickTimer: 0, tickInterval: 0.30 / identity.holeTickMultiplier / evolution.tickMultiplier, primary: identity.primary, secondary: identity.secondary, slowFactor: Math.max(0.20, identity.holeSlowFactor * evolution.slowFactorMultiplier), slowDuration: identity.holeSlowDuration * evolution.slowDurationMultiplier, pullMultiplier: evolution.pullMultiplier, evolutionTier: evolution.tier, choreography:ultimateChoreographyDescriptor('blackHole',this.levels.blackHole) });
    world.feedback?.addImpact(pos, evolution.tier === 2 ? 'final' : 'ultimate');
  }

  private queueUltimatePostImpactResidue(heroId:HeroId,kind:UltimatePostImpactResidueVfxKind,pos:Vec2,radius:number,maxTtl:number):void {
    this.ultimatePostImpactResidues.push({heroId,kind,pos:{...pos},radius:Math.max(48,radius),ttl:maxTtl,maxTtl});
    if(this.ultimatePostImpactResidues.length > 16)this.ultimatePostImpactResidues.splice(0,this.ultimatePostImpactResidues.length-16);
  }

  private chooseTarget(world: SpellWorld): Enemy | null {
    if (world.autoAim !== true && world.preferredManualTargetId !== null && world.preferredManualTargetId !== undefined) {
      const preferred = world.enemies.enemies.find((enemy) => enemy.id === world.preferredManualTargetId && enemy.alive) ?? null;
      if (preferred) return preferred;
    }
    return chooseSpellTarget(world.enemies.enemies, world.hero.pos, world.core?.pos ?? null, world.autoAim === true, world.preferredAutoTargetId ?? null);
  }

  private targetAimPoint(world:SpellWorld,target:Enemy|null):Vec2|null{
    if(!target)return null;
    return autoWeakpointAimPoint({autoAim:world.autoAim===true,target,heroPos:world.hero.pos,activeBossId:world.weakpointAim?.activeBossId??null,nodes:world.weakpointAim?.nodes??[]});
  }

  private updateProjectiles(dt: number, world: SpellWorld): void {
    for (const p of this.projectiles) {
      p.ttl -= dt;
      if(p.visualLaunchTtl!==undefined)p.visualLaunchTtl=Math.max(0,p.visualLaunchTtl-dt);
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      world.magicTargets?.hitMagic(p.pos, p.damage * Math.min(0.28, dt * 4));
      for (const enemy of world.enemies.enemies) {
        if (!enemy.alive || p.hitIds.has(enemy.id)) continue;
        if (distance(p.pos, enemy.pos) > p.radius + enemy.radius) continue;
        const priorImpactCount=p.hitIds.size,continues=p.pierceLeft>0;
        p.hitIds.add(enemy.id);
        world.enemies.damage(enemy, p.damage, p.pos);
        const impactHandoff=projectileMultiHitImpactHandoff({launchOffset:p.visualLaunchOffset,launchTtl:p.visualLaunchTtl,launchMaxTtl:p.visualLaunchMaxTtl,priorImpactCount,continues},world.reducedMotion??false);
        const entryOffset=impactHandoff.entryOffset;
        this.projectileImpactVisuals.push({ pos:{...p.pos}, entryOffset, heroId:p.heroId, ttl:0.18, maxTtl:0.18, size:Math.max(48,p.radius*5.2) });
        if(impactHandoff.retireLaunchOwner){delete p.visualLaunchOffset;delete p.visualLaunchTtl;delete p.visualLaunchMaxTtl;}
        if (p.evolutionTier === 2) world.feedback?.addImpact(p.pos, 'final');
        if (p.slowFactor < 1) world.enemies.applySlow(enemy, p.slowFactor, p.slowDuration);
        if (p.splashRadius > 0 && p.splashDamage > 0) {
          for (const nearby of world.enemies.enemies) {
            if (!nearby.alive || nearby.id === enemy.id) continue;
            if (distance(enemy.pos, nearby.pos) <= p.splashRadius + nearby.radius) { world.enemies.damage(nearby, p.splashDamage, enemy.pos, 'explosion'); const secondary=secondaryImpactCanonicalPresentation('splash',nearby.pos,world.reducedFlash??false); this.projectileImpactVisuals.push({pos:secondary.pos,entryOffset:secondary.entryOffset,alphaScale:secondary.alphaScale,secondaryKind:'splash',heroId:p.heroId,ttl:.14,maxTtl:.14,size:Math.max(38,p.radius*4.2)*secondary.sizeScale}); if(this.projectileImpactVisuals.length>32)this.projectileImpactVisuals.splice(0,this.projectileImpactVisuals.length-32); }
          }
        }
        world.terrain?.hitByMagic(p.pos, 1);
        if (p.pierceLeft > 0) p.pierceLeft -= 1;
        else { p.ttl = -1; break; }
      }
    }
    this.projectiles = this.projectiles.filter((p) => p.ttl > 0);
  }

  private updateFields(dt: number, world: SpellWorld): void {
    for (const field of this.fields) {
      field.ttl -= dt;
      field.tickTimer -= dt;
      if (field.tickTimer > 0) continue;
      field.tickTimer += field.tick;
      world.magicTargets?.hitMagic(field.pos, field.damage * 0.55);
      for (const enemy of world.enemies.enemies) {
        if (enemy.alive && distance(field.pos, enemy.pos) <= field.radius + enemy.radius) {
          world.enemies.damage(enemy, field.damage, field.pos);
          if (field.slowFactor < 1) world.enemies.applySlow(enemy, field.slowFactor, field.slowDuration);
        }
      }
    }
    for (const field of this.fields) if (field.ttl <= 0) { const maxTtl=.48; this.persistentZoneExpireVfx.push({heroId:field.heroId,kind:'flameField',pos:{...field.pos},radius:field.radius,ttl:maxTtl,maxTtl}); if(this.persistentZoneExpireVfx.length > 16)this.persistentZoneExpireVfx.splice(0,this.persistentZoneExpireVfx.length-16); }
    this.fields = this.fields.filter((f) => f.ttl > 0);
  }

  private updateMeteors(dt: number, world: SpellWorld): void {
    for (const meteor of this.meteors) {
      if (!meteor.exploded) {
        meteor.delay -= dt;
        if (meteor.delay <= 0) {
          meteor.exploded = true;
          meteor.flash = 0.26;
          world.terrain?.hitByMagic(meteor.pos, 3);
          world.magicTargets?.hitMagic(meteor.pos, meteor.damage * 0.8);
          world.feedback?.addImpact(meteor.pos, meteor.evolutionTier === 2 ? 'final' : 'ultimate');
          this.queueUltimatePostImpactResidue(meteor.heroId,'meteorStorm',meteor.pos,meteor.radius,.48);
          for (const enemy of world.enemies.enemies) {
            if (enemy.alive && distance(meteor.pos, enemy.pos) <= meteor.radius + enemy.radius) {
              world.enemies.damage(enemy, meteor.damage, meteor.pos, 'ultimate');
              if (meteor.slowFactor < 1) world.enemies.applySlow(enemy, meteor.slowFactor, meteor.slowDuration);
            }
          }
        }
      } else meteor.flash -= dt;
    }
    this.meteors = this.meteors.filter((m) => !m.exploded || m.flash > 0);
  }

  private updateBlackHoles(dt: number, world: SpellWorld): void {
    for (const hole of this.holes) {
      hole.ttl -= dt;
      hole.tickTimer -= dt;
      for (const enemy of world.enemies.enemies) {
        if (!enemy.alive) continue;
        const d = distance(hole.pos, enemy.pos);
        if (d > hole.radius + enemy.radius) continue;
        const dir = normalize({ x: hole.pos.x - enemy.pos.x, y: hole.pos.y - enemy.pos.y });
        const pull = (enemy.type === 'boss' ? 35 : enemy.type === 'elite' ? 65 : 128) * hole.pullMultiplier * dt;
        enemy.pos.x += dir.x * pull;
        enemy.pos.y += dir.y * pull;
        if (hole.tickTimer <= 0) {
          world.enemies.damage(enemy, hole.damage, hole.pos, 'ultimate');
          if (hole.slowFactor < 1) world.enemies.applySlow(enemy, hole.slowFactor, hole.slowDuration);
        }
      }
      if (hole.tickTimer <= 0) {
        world.magicTargets?.hitMagic(hole.pos, hole.damage * 0.55);
        hole.tickTimer += hole.tickInterval;
      }
    }
    for (const hole of this.holes) if (hole.ttl <= 0) { const maxTtl=.52; this.persistentZoneExpireVfx.push({heroId:hole.heroId,kind:'blackHole',pos:{...hole.pos},radius:hole.radius,ttl:maxTtl,maxTtl}); if(this.persistentZoneExpireVfx.length > 16)this.persistentZoneExpireVfx.splice(0,this.persistentZoneExpireVfx.length-16); this.queueUltimatePostImpactResidue(hole.heroId,'blackHole',hole.pos,hole.radius,.68); }
    this.holes = this.holes.filter((h) => h.ttl > 0);
  }
}

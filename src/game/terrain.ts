import { distance, type Vec2 } from '../core/math.js';
import type { Hero } from './entities.js';
import type { EnemyManager } from './enemies.js';
import { MAP_LAYOUTS, selectMapLayout, type MapLayout } from './map-layouts.js';
import { evolveMapLayout, mapEvolutionStage, type MapEvolutionStage } from './map-evolution.js';
import type { ResidualCombatMotionPolicy } from './combat-cue-priority.js';
import { battlefieldTerrainMaterial } from './battlefield-environment-assets.js';

export interface Rect { x: number; y: number; w: number; h: number; }
export interface TerrainPresentationEvent { kind:'crystalBlast'; x:number; y:number; radius:number; }
interface SlowPool { x: number; y: number; radius: number; slowFactor: number; }
interface Crystal { x: number; y: number; charge: number; threshold: number; cooldown: number; blastPending: boolean; blastRadius: number; blastDamage: number; }

export function resolveCircleVsRect(pos: Vec2, radius: number, rect: Rect): Vec2 {
  const closestX = Math.max(rect.x, Math.min(pos.x, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(pos.y, rect.y + rect.h));
  const dx = pos.x - closestX;
  const dy = pos.y - closestY;
  const dist = Math.hypot(dx, dy);
  if (dist >= radius) return { ...pos };
  if (dist > 0) {
    const push = radius - dist;
    return { x: pos.x + (dx / dist) * push, y: pos.y + (dy / dist) * push };
  }

  const options = [
    { d: Math.abs(pos.x - rect.x), x: rect.x - radius, y: pos.y },
    { d: Math.abs(rect.x + rect.w - pos.x), x: rect.x + rect.w + radius, y: pos.y },
    { d: Math.abs(pos.y - rect.y), x: pos.x, y: rect.y - radius },
    { d: Math.abs(rect.y + rect.h - pos.y), x: pos.x, y: rect.y + rect.h + radius },
  ].sort((a, b) => a.d - b.d);
  const best = options[0]!;
  return { x: best.x, y: best.y };
}

export class TerrainSystem {
  private renderClock = 0;
  currentLayout: MapLayout = MAP_LAYOUTS[0]!;
  walls: Rect[] = [];
  pools: SlowPool[] = [];
  crystals: Crystal[] = [];
  evolutionStage: MapEvolutionStage = 0;
  private presentationEvents:TerrainPresentationEvent[]=[];

  constructor() {
    this.loadLayout(this.currentLayout);
  }

  restore(layoutId: import('./map-layouts.js').MapId, stage: MapEvolutionStage): void {
    const layout = MAP_LAYOUTS.find((entry) => entry.id === layoutId) ?? MAP_LAYOUTS[0]!;
    this.currentLayout = layout;
    this.evolutionStage = stage;
    this.loadLayout(evolveMapLayout(layout, stage));
  }

  reset(random: () => number = Math.random): void {
    this.currentLayout = selectMapLayout(random);
    this.evolutionStage = 0;
    this.loadLayout(this.currentLayout);
  }

  updateEvolution(seconds: number): MapEvolutionStage | null {
    const next = mapEvolutionStage(seconds);
    if (next === this.evolutionStage) return null;
    this.evolutionStage = next;
    this.loadLayout(evolveMapLayout(this.currentLayout, next));
    return next;
  }

  resolveHero(hero: Hero): void {
    for (const wall of this.walls) hero.pos = resolveCircleVsRect(hero.pos, hero.radius, wall);
  }

  drainPresentationEvents():TerrainPresentationEvent[]{const out=this.presentationEvents;this.presentationEvents=[];return out;}

  hitByMagic(pos: Vec2, strength: number): void {
    for (const crystal of this.crystals) {
      if (crystal.cooldown > 0 || distance(pos, crystal) > 100) continue;
      crystal.charge += strength;
      if (crystal.charge >= crystal.threshold) crystal.blastPending = true;
    }
  }

  get hasActiveCrystal(): boolean { return this.crystals.some((crystal) => crystal.cooldown <= 0); }

  update(dt: number, enemies: EnemyManager): void {
    this.renderClock += Math.max(0, dt);
    for (const enemy of enemies.enemies) {
      if (!enemy.alive) continue;
      for (const pool of this.pools) {
        if (distance(enemy.pos, pool) <= pool.radius + enemy.radius) enemies.applySlow(enemy, pool.slowFactor, 0.18);
      }
      for (const wall of this.walls) enemy.pos = resolveCircleVsRect(enemy.pos, enemy.radius, wall);
    }

    for (const crystal of this.crystals) {
      if (crystal.cooldown > 0) {
        crystal.cooldown -= dt;
        if (crystal.cooldown <= 0) crystal.charge = 0;
      }
      if (!crystal.blastPending) continue;
      crystal.blastPending = false;
      crystal.cooldown = 8;
      crystal.charge = 0;
      this.presentationEvents.push({kind:'crystalBlast',x:crystal.x,y:crystal.y,radius:crystal.blastRadius});
      for (const enemy of enemies.enemies) {
        if (enemy.alive && distance(enemy.pos, crystal) <= crystal.blastRadius + enemy.radius) enemies.damage(enemy, crystal.blastDamage, crystal, 'explosion');
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, motion?: ResidualCombatMotionPolicy): void {
    const material = battlefieldTerrainMaterial(this.currentLayout.id);
    const crystalAmplitude = motion?.terrainCrystalMotionAmplitude ?? 0.08;
    const poolRipple = crystalAmplitude * 0.75;
    const stageBoost = this.evolutionStage === 2 ? 1 : this.evolutionStage === 1 ? 0.65 : 0.35;

    for (const pool of this.pools) {
      const poolShadow = ctx.createRadialGradient(pool.x, pool.y + pool.radius * 0.16, pool.radius * 0.1, pool.x, pool.y + pool.radius * 0.16, pool.radius * 1.18);
      poolShadow.addColorStop(0, 'rgba(8,12,20,.30)');
      poolShadow.addColorStop(1, 'rgba(8,12,20,0)');
      ctx.fillStyle = poolShadow;
      ctx.beginPath();
      ctx.arc(pool.x, pool.y, pool.radius * 1.12, 0, Math.PI * 2);
      ctx.fill();

      const g = ctx.createRadialGradient(pool.x - pool.radius * 0.16, pool.y - pool.radius * 0.18, 5, pool.x, pool.y, pool.radius);
      g.addColorStop(0, material.poolCenter);
      g.addColorStop(1, material.poolEdge);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(pool.x, pool.y, pool.radius, 0, Math.PI * 2);
      ctx.fill();

      const innerGlow = ctx.createRadialGradient(pool.x, pool.y, pool.radius * 0.12, pool.x, pool.y, pool.radius * (0.78 + poolRipple * 0.25));
      innerGlow.addColorStop(0, 'rgba(255,255,255,.16)');
      innerGlow.addColorStop(0.58, material.poolCenter);
      innerGlow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(pool.x, pool.y, pool.radius * (0.76 + poolRipple * 0.12), 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = material.poolStroke;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pool.x, pool.y, pool.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,255,255,.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pool.x - pool.radius * 0.1, pool.y - pool.radius * 0.12, Math.max(10, pool.radius * 0.72), Math.PI * 1.12, Math.PI * 1.86);
      ctx.stroke();
    }

    for (const wall of this.walls) {
      const wallShadow = ctx.createLinearGradient(wall.x, wall.y, wall.x + wall.w, wall.y + wall.h + 26);
      wallShadow.addColorStop(0, 'rgba(5,9,16,.14)');
      wallShadow.addColorStop(1, 'rgba(5,9,16,0)');
      ctx.fillStyle = wallShadow;
      ctx.fillRect(wall.x + 9, wall.y + 12, wall.w, wall.h + 20);

      const wallFill = ctx.createLinearGradient(wall.x, wall.y, wall.x, wall.y + wall.h);
      wallFill.addColorStop(0, material.wallHighlight);
      wallFill.addColorStop(0.22, material.wallFill);
      wallFill.addColorStop(1, 'rgba(12,16,24,.16)');
      ctx.fillStyle = wallFill;
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);

      ctx.fillStyle = 'rgba(0,0,0,.08)';
      ctx.fillRect(wall.x + 7, wall.y + 7, Math.max(0, wall.w - 14), Math.max(0, wall.h - 14));
      ctx.strokeStyle = this.currentLayout.palette.border;
      ctx.lineWidth = 3;
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
      ctx.fillStyle = material.wallHighlight;
      ctx.fillRect(wall.x + 5, wall.y + 5, Math.max(0, wall.w - 10), 5);
    }

    for (const crystal of this.crystals) {
      const active = crystal.cooldown <= 0;
      const pulse = active ? 1 + Math.sin(this.renderClock * (10 / 3)) * crystalAmplitude : 0.82;
      const baseShadow = ctx.createRadialGradient(crystal.x, crystal.y + 18, 4, crystal.x, crystal.y + 18, 46);
      baseShadow.addColorStop(0, 'rgba(6,10,16,.40)');
      baseShadow.addColorStop(1, 'rgba(6,10,16,0)');
      ctx.fillStyle = baseShadow;
      ctx.beginPath();
      ctx.ellipse(crystal.x, crystal.y + 18, 38, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      if (active) {
        const groundGlow = ctx.createRadialGradient(crystal.x, crystal.y + 4, 10, crystal.x, crystal.y + 4, 58 + stageBoost * 10);
        groundGlow.addColorStop(0, 'rgba(255,255,255,.18)');
        groundGlow.addColorStop(0.48, this.currentLayout.palette.accent);
        groundGlow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.save();
        ctx.globalAlpha = 0.14 + stageBoost * 0.08;
        ctx.fillStyle = groundGlow;
        ctx.beginPath();
        ctx.arc(crystal.x, crystal.y + 4, 54 + stageBoost * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.fillStyle = active ? 'rgba(255,255,255,.10)' : 'rgba(255,255,255,.05)';
      ctx.beginPath();
      ctx.ellipse(crystal.x, crystal.y + 16, 25 * pulse, 11 * pulse, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = active ? 'rgba(255,255,255,.30)' : 'rgba(255,255,255,.12)';
      ctx.lineWidth = active ? 3 : 2;
      ctx.beginPath();
      ctx.ellipse(crystal.x, crystal.y + 16, 29 * pulse, 13 * pulse, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.save();
      ctx.translate(crystal.x, crystal.y);
      ctx.scale(pulse, pulse);
      ctx.shadowColor = active ? this.currentLayout.palette.accent : '#47515a';
      ctx.shadowBlur = active ? 22 : 4;
      ctx.fillStyle = active ? this.currentLayout.palette.accent : material.crystalInactive;
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(20, -7);
      ctx.lineTo(13, 26);
      ctx.lineTo(-15, 22);
      ctx.lineTo(-22, -5);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = active ? '#f5efff' : '#788089';
      ctx.lineWidth = 3;
      ctx.stroke();
      if (active) {
        ctx.fillStyle = '#fff';
        ctx.font = '800 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.floor(crystal.charge)}/${crystal.threshold}`, 0, 46);
      }
      ctx.restore();
    }
  }

  private loadLayout(layout: MapLayout): void {
    this.presentationEvents=[];
    this.walls = layout.walls.map((wall) => ({ ...wall }));
    this.pools = layout.pools.map((pool) => ({ ...pool }));
    this.crystals = layout.crystals.map((crystal) => ({ ...crystal, charge: 0, cooldown: 0, blastPending: false }));
  }
}

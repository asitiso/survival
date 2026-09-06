import { normalize } from '../core/math.js';
import { mythicArenaHazardContact } from './endless/mythic-arena-collision.js';
export class BossArenaSystem {
    rng;
    hazards = [];
    timer = 2.6;
    nextId = 1;
    constructor(rng = Math.random) {
        this.rng = rng;
    }
    reset() { this.hazards = []; this.timer = 2.6; this.nextId = 1; }
    update(dt, ctx) { const safe = Math.max(0, dt); for (const h of this.hazards) {
        const priorTelegraph = h.telegraph;
        h.telegraph = Math.max(0, h.telegraph - safe);
        h.ttl -= safe;
        if (h.launchTtl !== undefined)
            h.launchTtl = Math.max(0, h.launchTtl - safe);
        if (priorTelegraph > 0 && h.telegraph <= 0) {
            h.visualActivationTtl = .08;
            h.visualActivationMaxTtl = .08;
        }
        else if (h.visualActivationTtl !== undefined)
            h.visualActivationTtl = Math.max(0, h.visualActivationTtl - safe);
        if ((h.launchTtl ?? 0) <= 0 || h.telegraph <= 0) {
            delete h.launchOrigin;
            delete h.launchTtl;
            delete h.launchMaxTtl;
        }
    } this.hazards = this.hazards.filter(h => h.ttl > 0); this.timer -= safe; if (this.timer > 0)
        return; this.spawn(ctx); const phasePressure = (ctx.phase - 1) * .35 + ctx.variantTier * .28; const cadence = ctx.mutation?.cadenceMultiplier ?? 1; const geometryCadence = ctx.geometry ? Math.max(.86, Math.min(1.08, 2 - ctx.geometry.pressure)) : 1; this.timer = Math.max(1.7, (4.8 - phasePressure) * cadence * geometryCadence); }
    contactAt(pos, radius) { let best = { hit: false, penetration: 0, slowMultiplier: 1, push: { x: 0, y: 0 } }; for (const h of this.hazards) {
        if (h.telegraph > 0)
            continue;
        const contact = mythicArenaHazardContact(h, pos, radius);
        if (contact.hit && contact.penetration >= best.penetration)
            best = contact;
    } return best; }
    damageAt(pos, radius) { let damage = 0; for (const h of this.hazards) {
        if (h.telegraph > 0)
            continue;
        const contact = mythicArenaHazardContact(h, pos, radius);
        if (contact.hit)
            damage = Math.max(damage, h.damage);
    } return Math.min(28, damage); }
    spawn(ctx) {
        const kind = ctx.archetype === 'inferno' ? 'firePool' : ctx.archetype === 'summoner' ? 'summonSigil' : ctx.archetype === 'juggernaut' ? 'shockLane' : ctx.archetype === 'abyssWitch' ? 'cursePool' : ctx.archetype === 'twinMaw' ? 'twinCross' : 'timeZone';
        const roll = Math.max(0, Math.min(1, this.rng()));
        let pos;
        let radius;
        if (kind === 'firePool' || kind === 'cursePool') {
            const a = roll * Math.PI * 2;
            pos = { x: ctx.heroPos.x + Math.cos(a) * 90, y: ctx.heroPos.y + Math.sin(a) * 90 };
            radius = kind === 'cursePool' ? 82 : 68;
        }
        else if (kind === 'summonSigil') {
            const a = roll * Math.PI * 2;
            pos = { x: ctx.bossPos.x + Math.cos(a) * 150, y: ctx.bossPos.y + Math.sin(a) * 150 };
            radius = 76;
        }
        else if (kind === 'timeZone') {
            pos = { ...ctx.heroPos };
            radius = 92 + ctx.phase * 8;
        }
        else {
            pos = { x: (ctx.heroPos.x + ctx.bossPos.x) / 2, y: (ctx.heroPos.y + ctx.bossPos.y) / 2 };
            radius = kind === 'twinCross' ? 70 + ctx.phase * 6 : 54 + ctx.variantTier * 8;
        }
        const mutation = ctx.mutation;
        if (mutation?.orbitOffsetRadians) {
            const dx = pos.x - ctx.heroPos.x, dy = pos.y - ctx.heroPos.y, c = Math.cos(mutation.orbitOffsetRadians), sn = Math.sin(mutation.orbitOffsetRadians);
            pos = { x: ctx.heroPos.x + dx * c - dy * sn, y: ctx.heroPos.y + dx * sn + dy * c };
        }
        let angle = 0;
        let length = radius * 3;
        const geometry = ctx.geometry;
        if (geometry) {
            const baseAngle = roll * Math.PI * 2 + this.nextId * geometry.rotationRate;
            const bossToHero = normalize({ x: ctx.heroPos.x - ctx.bossPos.x, y: ctx.heroPos.y - ctx.bossPos.y });
            const lineAngle = Math.atan2(bossToHero.y, bossToHero.x);
            if (geometry.shape === 'ring' || geometry.shape === 'orbit') {
                pos = { x: ctx.heroPos.x + Math.cos(baseAngle) * geometry.placementRadius, y: ctx.heroPos.y + Math.sin(baseAngle) * geometry.placementRadius };
                angle = baseAngle;
            }
            else if (geometry.shape === 'pockets') {
                angle = Math.floor(roll * 3) * Math.PI * 2 / 3 + this.nextId * .12;
                pos = { x: ctx.bossPos.x + Math.cos(angle) * geometry.placementRadius, y: ctx.bossPos.y + Math.sin(angle) * geometry.placementRadius };
            }
            else if (geometry.shape === 'corridor') {
                angle = lineAngle;
                const side = this.nextId % 2 === 0 ? 1 : -1;
                const px = -bossToHero.y, py = bossToHero.x;
                pos = { x: (ctx.heroPos.x + ctx.bossPos.x) / 2 + px * geometry.placementRadius * .28 * side, y: (ctx.heroPos.y + ctx.bossPos.y) / 2 + py * geometry.placementRadius * .28 * side };
                length = geometry.placementRadius * 2.5;
            }
            else if (geometry.shape === 'cross') {
                angle = (this.nextId % 2) * Math.PI / 2;
                const dir = { x: Math.cos(angle), y: Math.sin(angle) };
                const offset = (roll - .5) * geometry.placementRadius;
                pos = { x: (ctx.heroPos.x + ctx.bossPos.x) / 2 + dir.x * offset, y: (ctx.heroPos.y + ctx.bossPos.y) / 2 + dir.y * offset };
                length = geometry.placementRadius * 2.2;
            }
            else {
                angle = Math.round(baseAngle / (Math.PI / 6)) * (Math.PI / 6);
                pos = { x: ctx.heroPos.x + Math.cos(angle) * geometry.placementRadius, y: ctx.heroPos.y + Math.sin(angle) * geometry.placementRadius };
            }
            radius *= .94 + .06 * geometry.pressure;
        }
        radius *= mutation?.radiusMultiplier ?? 1;
        const launchMaxTtl = .22;
        const hazard = { id: this.nextId++, kind, pos, radius, telegraph: 1.05 * (mutation?.telegraphMultiplier ?? 1), ttl: 5.4, damage: (18 + (ctx.phase - 1) * 3 + ctx.variantTier * 2) * (mutation?.damageMultiplier ?? 1) * (geometry?.pressure ?? 1), ...(ctx.visualLaunchOrigin ? { launchOrigin: { ...ctx.visualLaunchOrigin }, launchTtl: launchMaxTtl, launchMaxTtl } : {}) };
        if (geometry) {
            hazard.geometryShape = geometry.shape;
            hazard.angle = angle;
            hazard.length = length;
        }
        this.hazards.push(hazard);
        const maxHazards = mutation?.maxHazards ?? 6;
        if (this.hazards.length > maxHazards)
            this.hazards.splice(0, this.hazards.length - maxHazards);
    }
}

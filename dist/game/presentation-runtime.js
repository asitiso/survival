import { admitEffect } from './presentation-budget.js';
export function screenEffectScale(kind, progress, reducedMotion = false) {
    const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
    if (reducedMotion)
        return 1;
    if (kind === 'shockwave')
        return 0.48 + p * 0.82;
    if (kind === 'glow')
        return 0.72 + p * 0.28;
    if (kind === 'pulse')
        return 0.72 + p * 0.42;
    return 1;
}
export function screenGlowProfile(kind, quality, reducedFlash = false) {
    const base = kind === 'boss' ? { radius: 260, alpha: .30, ttl: .34 } : kind === 'ultimate' ? { radius: 230, alpha: .28, ttl: .30 } : kind === 'environment' ? { radius: 190, alpha: .22, ttl: .26 } : { radius: 140, alpha: .18, ttl: .20 };
    const q = quality === 'high' ? 1 : quality === 'medium' ? .78 : .62;
    const flash = reducedFlash ? .58 : 1;
    return { radius: Math.round(base.radius * q), alpha: Math.min(.36, base.alpha * q * flash), ttl: base.ttl };
}
export class PresentationRuntime {
    quality;
    particles = [];
    trails = [];
    telegraphs = [];
    screenEffects = [];
    deathBursts = [];
    recentDeaths = [];
    _aggregatedDeathCount = 0;
    constructor(quality = 'high') {
        this.quality = quality;
    }
    get counts() {
        return { particles: this.particles.length, trails: this.trails.length, telegraphs: this.telegraphs.length };
    }
    get screenEffectCount() { return this.screenEffects.length; }
    get screenEffectSnapshot() { return this.screenEffects; }
    get deathBurstCount() { return this.deathBursts.length; }
    get aggregatedDeathCount() { return this._aggregatedDeathCount; }
    get particleSnapshot() { return this.particles; }
    get trailSnapshot() { return this.trails; }
    get telegraphSnapshot() { return this.telegraphs; }
    get deathBurstSnapshot() { return this.deathBursts; }
    trimToBudget(particleCap, trailCap, telegraphCap) {
        const particles = Math.max(0, Math.floor(particleCap));
        const trails = Math.max(0, Math.floor(trailCap));
        const telegraphs = Math.max(0, Math.floor(telegraphCap));
        if (this.particles.length > particles)
            this.particles = this.particles.slice(-particles);
        if (this.trails.length > trails)
            this.trails = this.trails.slice(-trails);
        if (this.telegraphs.length > telegraphs)
            this.telegraphs = this.telegraphs.slice(-telegraphs);
    }
    reset() {
        this.particles = [];
        this.trails = [];
        this.telegraphs = [];
        this.screenEffects = [];
        this.deathBursts = [];
        this.recentDeaths = [];
        this._aggregatedDeathCount = 0;
    }
    emitParticle(input) {
        if (!admitEffect('particle', this.counts, this.quality))
            return false;
        this.particles.push({ ...input, ttl: Math.max(0.01, input.ttl) });
        return true;
    }
    emitTrail(input) {
        if (!admitEffect('trail', this.counts, this.quality))
            return false;
        this.trails.push({ ...input, ttl: Math.max(0.01, input.ttl) });
        return true;
    }
    emitTelegraph(input) {
        if (!admitEffect('telegraph', this.counts, this.quality))
            return false;
        this.telegraphs.push({ ...input, ttl: Math.max(0.01, input.ttl) });
        return true;
    }
    emitScreenEffect(input) {
        const cap = this.quality === 'high' ? 4 : this.quality === 'medium' ? 3 : 2;
        if (this.screenEffects.length >= cap)
            return false;
        const ttl = Math.max(0.01, input.ttl);
        this.screenEffects.push({ ...input, ttl, maxTtl: ttl, alpha: Math.max(0, Math.min(0.44, input.alpha)) });
        return true;
    }
    recordDeath(input, now) {
        this.recentDeaths = this.recentDeaths.filter((d) => now - d.at <= 0.10);
        const local = this.recentDeaths.filter((d) => Math.hypot(d.x - input.x, d.y - input.y) <= 90);
        this.recentDeaths.push({ x: input.x, y: input.y, at: now });
        if (local.length >= 9) {
            const existing = this.deathBursts.find((b) => b.aggregate && Math.hypot(b.x - input.x, b.y - input.y) <= 110 && b.ttl > 0.2);
            if (existing) {
                existing.radius = Math.min(180, existing.radius + 8);
                existing.ttl = Math.max(existing.ttl, 0.5);
            }
            else {
                this.deathBursts.push({ ...input, radius: Math.min(180, input.radius * 2.2), ttl: 0.55, aggregate: true });
                this._aggregatedDeathCount += 1;
            }
            while (this.deathBursts.filter((b) => !b.aggregate).length > 9) {
                const idx = this.deathBursts.findIndex((b) => !b.aggregate);
                if (idx < 0)
                    break;
                this.deathBursts.splice(idx, 1);
            }
            return;
        }
        if (this.deathBursts.length < 32)
            this.deathBursts.push({ ...input, ttl: 0.32, aggregate: false });
    }
    update(dt, decorativeTimeScale = 1, motionScale = 1) {
        const step = Math.max(0, dt);
        const decorativeStep = step * Math.max(0.05, Math.min(1, Number.isFinite(decorativeTimeScale) ? decorativeTimeScale : 1));
        const motionStep = decorativeStep * Math.max(0, Math.min(1, Number.isFinite(motionScale) ? motionScale : 1));
        for (const p of this.particles) {
            p.ttl -= decorativeStep;
            p.x += (p.vx ?? 0) * motionStep;
            p.y += (p.vy ?? 0) * motionStep;
        }
        for (const t of this.trails)
            t.ttl -= decorativeStep;
        for (const t of this.telegraphs)
            t.ttl -= step;
        for (const effect of this.screenEffects)
            effect.ttl -= decorativeStep;
        for (const b of this.deathBursts)
            b.ttl -= decorativeStep;
        this.particles = this.particles.filter((v) => v.ttl > 0);
        this.trails = this.trails.filter((v) => v.ttl > 0);
        this.telegraphs = this.telegraphs.filter((v) => v.ttl > 0);
        this.screenEffects = this.screenEffects.filter((v) => v.ttl > 0);
        this.deathBursts = this.deathBursts.filter((v) => v.ttl > 0);
    }
    renderDecorative(ctx, reducedMotion = false) {
        ctx.save();
        for (const trail of this.trails) {
            ctx.globalAlpha = Math.min(trail.alpha ?? 0.7, Math.max(0, trail.ttl * 4));
            ctx.strokeStyle = trail.color;
            ctx.lineWidth = trail.width ?? 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(trail.x1, trail.y1);
            ctx.lineTo(trail.x2, trail.y2);
            ctx.stroke();
        }
        for (const particle of this.particles) {
            ctx.globalAlpha = Math.min(particle.alpha ?? 0.8, Math.max(0, particle.ttl * 4));
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size ?? 3, 0, Math.PI * 2);
            ctx.fill();
        }
        for (const burst of this.deathBursts) {
            const alpha = Math.min(0.78, Math.max(0, burst.ttl * 2));
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = burst.color;
            ctx.lineWidth = burst.aggregate ? 6 : 3;
            const progress = 1 - Math.min(1, burst.ttl / (burst.aggregate ? 0.55 : 0.32));
            const burstScale = reducedMotion ? 0.72 : 0.35 + progress * 0.65;
            ctx.beginPath();
            ctx.arc(burst.x, burst.y, burst.radius * burstScale, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
    renderScreenEffects(ctx, reducedFlash = false, reducedMotion = false) {
        ctx.save();
        for (const effect of this.screenEffects) {
            const ratio = Math.max(0, effect.ttl / effect.maxTtl);
            const progress = 1 - ratio;
            const alphaCap = reducedFlash ? Math.min(0.22, effect.alpha) : effect.alpha;
            if (effect.kind === 'flash') {
                ctx.globalAlpha = alphaCap * ratio;
                ctx.fillStyle = effect.color;
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                continue;
            }
            if (effect.kind === 'glow') {
                const r = Math.max(8, effect.radius * screenEffectScale('glow', progress, reducedMotion));
                const g = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, r);
                g.addColorStop(0, effect.color);
                g.addColorStop(.42, effect.color);
                g.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.globalAlpha = alphaCap * ratio * .72;
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, r, 0, Math.PI * 2);
                ctx.fill();
                continue;
            }
            const scale = screenEffectScale(effect.kind, progress, reducedMotion);
            ctx.globalAlpha = alphaCap * ratio;
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = effect.width ?? (effect.kind === 'shockwave' ? 5 : 3);
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, Math.max(1, effect.radius * scale), 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
    renderTelegraphs(ctx) {
        ctx.save();
        for (const cue of this.telegraphs) {
            ctx.globalAlpha = Math.min(cue.alpha ?? 0.82, Math.max(0.25, cue.ttl * 2));
            ctx.strokeStyle = cue.color;
            ctx.lineWidth = cue.width ?? 4;
            if (cue.style === 'lane' && cue.x2 !== undefined && cue.y2 !== undefined) {
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(cue.x, cue.y);
                ctx.lineTo(cue.x2, cue.y2);
                ctx.stroke();
            }
            else {
                ctx.beginPath();
                ctx.arc(cue.x, cue.y, cue.radius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}

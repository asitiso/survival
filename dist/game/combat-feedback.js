import { enemyImpactVfxDescriptor } from './enemy-presentation.js';
import { directionalHitVfxProfile, directionalHitVector, hitApproachProfile, directionalImpactRecoilProfile } from './visual-presence.js';
const CAMERA_PRESSURE = {
    meteor: { scaleOffset: 0.024, duration: 0.24 },
    vortex: { scaleOffset: -0.018, duration: 0.30 },
    bossPhase2: { scaleOffset: 0.012, duration: 0.20 },
    bossPhase3: { scaleOffset: 0.022, duration: 0.28 },
    bossEnter: { scaleOffset: 0.014, duration: 0.24 },
    bossDeath: { scaleOffset: 0.028, duration: 0.32 },
    killChain: { scaleOffset: 0.008, duration: 0.16 },
};
export function cameraPressureProfile(kind) { return { ...CAMERA_PRESSURE[kind] }; }
export function killChainVfxProfile(tier) {
    if (tier === 3)
        return { tier, label: 'ARCANE BREAK', color: '#ffe47a', rayCount: 12, pulseAlpha: 0.24, shake: 5.2 };
    if (tier === 2)
        return { tier, label: 'ARCANE SURGE', color: '#9fe6ff', rayCount: 8, pulseAlpha: 0.18, shake: 3.8 };
    return { tier, label: 'ARCANE RUSH', color: '#ccb9ff', rayCount: 4, pulseAlpha: 0.12, shake: 2.4 };
}
export class KillChainVfxTracker {
    count = 0;
    lastKillAt = -Infinity;
    emittedTier = 0;
    reset() { this.count = 0; this.lastKillAt = -Infinity; this.emittedTier = 0; }
    record(nowSeconds) {
        const now = Number.isFinite(nowSeconds) ? nowSeconds : 0;
        if (now < this.lastKillAt || now - this.lastKillAt > 0.85) {
            this.count = 0;
            this.emittedTier = 0;
        }
        this.lastKillAt = now;
        this.count = Math.min(99, this.count + 1);
        const tier = this.count >= 28 ? 3 : this.count >= 14 ? 2 : this.count >= 6 ? 1 : 0;
        if (tier === 0 || tier <= this.emittedTier)
            return null;
        this.emittedTier = tier;
        return { ...killChainVfxProfile(tier), count: this.count };
    }
}
export function impactTierForDamage(amount, maxHp) {
    const ratio = Math.max(0, amount) / Math.max(1, maxHp);
    if (ratio >= 0.32)
        return 'critical';
    if (ratio >= 0.12)
        return 'heavy';
    return 'normal';
}
export function combatImpactVisual(tier) {
    if (tier === 'critical')
        return { fontSize: 26, rayCount: 8, ringRadius: 34, weight: 900 };
    if (tier === 'heavy')
        return { fontSize: 21, rayCount: 4, ringRadius: 24, weight: 850 };
    return { fontSize: 17, rayCount: 0, ringRadius: 16, weight: 800 };
}
const IMPACT_SHAKE = { awakened: 2.4, final: 6.2, ultimate: 7.4, bossHit: 9.2, eliteKill: 4.8 };
export class CombatFeedbackSystem {
    cues = [];
    shake = 0;
    shakePhase = 0;
    impactVisualCooldown = 0;
    cameraPressureOffset = 0;
    cameraPressureTtl = 0;
    cameraPressureMaxTtl = 0;
    directionalRecoil = { x: 0, y: 0 };
    directionalRecoilTtl = 0;
    directionalRecoilMaxTtl = 0;
    get activeCount() { return this.cues.length; }
    get shakeIntensity() { return this.shake; }
    get cameraScaleOffset() {
        if (this.cameraPressureTtl <= 0 || this.cameraPressureMaxTtl <= 0)
            return 0;
        const ratio = Math.max(0, Math.min(1, this.cameraPressureTtl / this.cameraPressureMaxTtl));
        return this.cameraPressureOffset * ratio;
    }
    get hitEnemyTypeCounts() { const counts = {}; for (const cue of this.cues)
        if (cue.kind === 'hit' && cue.enemyType)
            counts[cue.enemyType] = (counts[cue.enemyType] ?? 0) + 1; return counts; }
    get hitTierCounts() {
        const counts = { normal: 0, heavy: 0, critical: 0 };
        for (const cue of this.cues)
            if (cue.kind === 'hit')
                counts[cue.tier] += 1;
        return counts;
    }
    get cameraOffset() {
        const shakeOffset = this.shake <= 0 ? { x: 0, y: 0 } : { x: Math.sin(this.shakePhase * 51 + 0.7) * this.shake, y: Math.cos(this.shakePhase * 43 + 1.3) * this.shake * 0.72 };
        const recoilRatio = this.directionalRecoilTtl > 0 && this.directionalRecoilMaxTtl > 0 ? Math.max(0, Math.min(1, this.directionalRecoilTtl / this.directionalRecoilMaxTtl)) : 0;
        return { x: shakeOffset.x + this.directionalRecoil.x * recoilRatio, y: shakeOffset.y + this.directionalRecoil.y * recoilRatio };
    }
    reset() { this.cues = []; this.shake = 0; this.shakePhase = 0; this.impactVisualCooldown = 0; this.cameraPressureOffset = 0; this.cameraPressureTtl = 0; this.cameraPressureMaxTtl = 0; this.directionalRecoil = { x: 0, y: 0 }; this.directionalRecoilTtl = 0; this.directionalRecoilMaxTtl = 0; }
    addHit(pos, amount, tier = 'normal', enemyType, source) {
        const resolved = typeof tier === 'boolean' ? (tier ? 'critical' : 'normal') : tier;
        this.cues.push({ kind: 'hit', pos: { ...pos }, amount, ttl: 0.46, maxTtl: 0.46, tier: resolved, ...(enemyType ? { enemyType } : {}), ...(source ? { source: { ...source } } : {}) });
        if (source && resolved !== 'normal') {
            const recoil = directionalImpactRecoilProfile(source, pos, resolved, 'medium');
            if (recoil.magnitude >= Math.hypot(this.directionalRecoil.x, this.directionalRecoil.y)) {
                this.directionalRecoil = { ...recoil.offset };
                this.directionalRecoilTtl = recoil.duration;
                this.directionalRecoilMaxTtl = recoil.duration;
            }
        }
        this.trim();
    }
    addKill(pos, boss = false) {
        this.cues.push({ kind: 'kill', pos: { ...pos }, ttl: boss ? 0.95 : 0.62, maxTtl: boss ? 0.95 : 0.62, boss });
        if (boss)
            this.addShake(14);
        this.trim();
    }
    addCameraPressure(kind) {
        const profile = cameraPressureProfile(kind);
        this.cameraPressureOffset = profile.scaleOffset;
        this.cameraPressureTtl = profile.duration;
        this.cameraPressureMaxTtl = profile.duration;
        if (kind === 'killChain')
            this.addShake(killChainVfxProfile(1).shake);
    }
    addImpact(pos, kind) {
        this.addShake(IMPACT_SHAKE[kind]);
        const bypassThrottle = kind === 'bossHit' || kind === 'eliteKill';
        if (this.impactVisualCooldown > 0 && !bypassThrottle)
            return;
        const ttl = kind === 'bossHit' ? 0.48 : kind === 'final' || kind === 'ultimate' ? 0.40 : 0.32;
        this.cues.push({ kind: 'impact', pos: { ...pos }, ttl, maxTtl: ttl, impactKind: kind });
        this.impactVisualCooldown = kind === 'final' || kind === 'ultimate' ? 0.07 : 0.045;
        this.trim();
    }
    update(dt) {
        this.shakePhase += dt;
        this.shake = Math.max(0, this.shake - dt * 20);
        this.impactVisualCooldown = Math.max(0, this.impactVisualCooldown - dt);
        this.cameraPressureTtl = Math.max(0, this.cameraPressureTtl - dt);
        if (this.cameraPressureTtl <= 0) {
            this.cameraPressureOffset = 0;
            this.cameraPressureMaxTtl = 0;
        }
        this.directionalRecoilTtl = Math.max(0, this.directionalRecoilTtl - dt);
        if (this.directionalRecoilTtl <= 0) {
            this.directionalRecoil = { x: 0, y: 0 };
            this.directionalRecoilMaxTtl = 0;
        }
        for (const cue of this.cues) {
            cue.ttl -= dt;
            if (cue.kind === 'hit')
                cue.pos.y -= dt * (cue.tier === 'critical' ? 82 : cue.tier === 'heavy' ? 68 : 56);
        }
        this.cues = this.cues.filter((cue) => cue.ttl > 0);
    }
    render(ctx, quality = 'high') {
        for (const cue of this.cues) {
            const ratio = Math.max(0, cue.ttl / cue.maxTtl);
            if (cue.kind === 'hit') {
                const visual = combatImpactVisual(cue.tier);
                const identity = cue.enemyType ? enemyImpactVfxDescriptor(cue.enemyType, cue.tier) : null;
                const rayCount = identity ? Math.max(visual.rayCount, identity.rayCount) : visual.rayCount;
                const directional = directionalHitVfxProfile(cue.tier, quality);
                ctx.save();
                if (cue.source) {
                    const dir = directionalHitVector(cue.source, cue.pos), perp = { x: -dir.y, y: dir.x };
                    const approach = hitApproachProfile(cue.source, cue.pos, cue.tier, quality);
                    ctx.globalAlpha = ratio * directional.alpha * approach.alphaScale;
                    ctx.strokeStyle = identity?.color ?? '#dff3ff';
                    ctx.lineWidth = directional.width;
                    ctx.lineCap = 'round';
                    for (let i = 0; i < directional.streakCount; i++) {
                        const o = (i - (directional.streakCount - 1) / 2) * approach.spread;
                        const tail = directional.length * approach.tailScale * (.78 + (i % 3) * .11);
                        ctx.beginPath();
                        ctx.moveTo(cue.pos.x - dir.x * tail + perp.x * o, cue.pos.y - dir.y * tail + perp.y * o);
                        ctx.lineTo(cue.pos.x - dir.x * 5 + perp.x * o * .35, cue.pos.y - dir.y * 5 + perp.y * o * .35);
                        ctx.stroke();
                    }
                }
                if (rayCount > 0) {
                    ctx.globalAlpha = ratio * (cue.tier === 'critical' ? 0.58 : 0.36);
                    ctx.strokeStyle = identity?.color ?? (cue.tier === 'critical' ? '#ffe16d' : '#d9efff');
                    ctx.lineWidth = cue.tier === 'critical' ? 2.8 : 2;
                    for (let i = 0; i < rayCount; i++) {
                        const a = Math.PI * 2 * i / rayCount;
                        const inner = visual.ringRadius * 0.55, outer = visual.ringRadius * (1.15 + (1 - ratio) * 0.45);
                        ctx.beginPath();
                        ctx.moveTo(cue.pos.x + Math.cos(a) * inner, cue.pos.y + Math.sin(a) * inner);
                        ctx.lineTo(cue.pos.x + Math.cos(a) * outer, cue.pos.y + Math.sin(a) * outer);
                        ctx.stroke();
                    }
                    ctx.globalAlpha = ratio * (identity?.glowAlpha ?? 0.42);
                    ctx.beginPath();
                    ctx.arc(cue.pos.x, cue.pos.y, Math.max(visual.ringRadius, identity?.ringRadius ?? 0) * (1.15 - ratio * 0.25), 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.globalAlpha = Math.min(1, ratio * 1.65);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = `${visual.weight} ${visual.fontSize}px system-ui`;
                ctx.lineWidth = 4;
                ctx.strokeStyle = 'rgba(4,8,14,.78)';
                ctx.fillStyle = cue.tier === 'critical' ? '#ffe16d' : cue.tier === 'heavy' ? '#d9efff' : '#f3f7ff';
                const text = `${Math.max(1, Math.round(cue.amount)).toLocaleString()}${cue.tier === 'critical' ? '!' : ''}`;
                ctx.strokeText(text, cue.pos.x, cue.pos.y);
                ctx.fillText(text, cue.pos.x, cue.pos.y);
                ctx.restore();
            }
            else if (cue.kind === 'kill') {
                const progress = 1 - ratio;
                const radius = (cue.boss ? 42 : 24) + progress * (cue.boss ? 78 : 38);
                ctx.save();
                ctx.globalAlpha = ratio * (cue.boss ? 0.92 : 0.58);
                ctx.strokeStyle = cue.boss ? '#ffd66c' : '#d7f4ff';
                ctx.lineWidth = cue.boss ? 7 : 3;
                ctx.beginPath();
                ctx.arc(cue.pos.x, cue.pos.y, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
            else {
                const progress = 1 - ratio;
                const radius = 18 + progress * (cue.impactKind === 'bossHit' ? 78 : cue.impactKind === 'final' || cue.impactKind === 'ultimate' ? 58 : 42);
                const color = cue.impactKind === 'bossHit' ? '#ffcf63' : cue.impactKind === 'eliteKill' ? '#ffe37c' : cue.impactKind === 'final' ? '#fff0a6' : cue.impactKind === 'ultimate' ? '#e2a5ff' : '#bdeeff';
                ctx.save();
                ctx.globalAlpha = ratio * 0.78;
                ctx.strokeStyle = color;
                ctx.lineWidth = cue.impactKind === 'bossHit' ? 7 : cue.impactKind === 'final' || cue.impactKind === 'ultimate' ? 5 : 3;
                ctx.beginPath();
                ctx.arc(cue.pos.x, cue.pos.y, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }
    }
    addShake(value) { this.shake = Math.min(16, Math.max(this.shake, value)); }
    trim() { if (this.cues.length > 96)
        this.cues.splice(0, this.cues.length - 96); }
}

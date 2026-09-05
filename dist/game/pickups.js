import { distance, normalize } from '../core/math.js';
import { battlefieldInteractionSprite } from './battlefield-interaction-vfx-assets.js';
import { pickupFlowVfxSprite } from './pickup-flow-vfx-assets.js';
function isRichPickup(kind, value) { return kind === 'coin' ? value >= 24 : value >= 36; }
export class PickupManager {
    pickups = [];
    collectionVfx = [];
    mergeTimer = 0;
    globalMagnetTimer = 0;
    get globalMagnetRemaining() { return this.globalMagnetTimer; }
    reset() { this.pickups = []; this.collectionVfx = []; this.mergeTimer = 0; this.globalMagnetTimer = 0; }
    setGlobalMagnet(seconds) {
        this.globalMagnetTimer = Math.max(this.globalMagnetTimer, Math.max(0, seconds));
    }
    spawnDeath(death) {
        this.spawn('xp', death.x, death.y, death.xp);
        if (death.gold > 0)
            this.spawn('coin', death.x, death.y, death.gold);
    }
    update(dt, hero, callbacks) {
        const step = Math.max(0, dt);
        this.globalMagnetTimer = Math.max(0, this.globalMagnetTimer - step);
        for (const cue of this.collectionVfx)
            cue.ttl -= step;
        this.collectionVfx = this.collectionVfx.filter((cue) => cue.ttl > 0);
        for (const pickup of this.pickups) {
            pickup.age += dt;
            pickup.pos.x += pickup.vel.x * dt;
            pickup.pos.y += pickup.vel.y * dt;
            pickup.vel.x *= Math.pow(0.05, dt);
            pickup.vel.y *= Math.pow(0.05, dt);
            const d = distance(pickup.pos, hero.pos);
            const basePickupRange = hero.pickupRadius * hero.equipmentPickupMultiplier;
            const magnetRange = this.globalMagnetTimer > 0
                ? Math.max(2000, basePickupRange)
                : pickup.age > 4 ? Math.max(520, basePickupRange) : basePickupRange;
            pickup.flowState = this.globalMagnetTimer > 0 && d <= magnetRange ? 'globalMagnet'
                : isRichPickup(pickup.kind, pickup.value) ? 'rich'
                    : pickup.radius >= 11 ? 'cluster'
                        : d <= magnetRange ? 'attract'
                            : null;
            if (d <= magnetRange) {
                const dir = normalize({ x: hero.pos.x - pickup.pos.x, y: hero.pos.y - pickup.pos.y });
                const speed = 280 + Math.max(0, magnetRange - d) * 2.2;
                pickup.vel.x += dir.x * speed * dt * 5.5;
                pickup.vel.y += dir.y * speed * dt * 5.5;
            }
        }
        const remaining = [];
        for (const pickup of this.pickups) {
            if (distance(pickup.pos, hero.pos) <= hero.radius + pickup.radius + 6) {
                this.queueCollectionVfx(pickup);
                if (pickup.kind === 'xp')
                    callbacks.onXp(pickup.value);
                else
                    callbacks.onCoin(pickup.value);
            }
            else
                remaining.push(pickup);
        }
        this.pickups = remaining;
        this.mergeTimer -= dt;
        if (this.pickups.length > 160 && this.mergeTimer <= 0) {
            this.mergeTimer = 1.2;
            this.mergeDensePickups();
        }
    }
    render(ctx, interactionAtlasImage = null, interactionAtlasReady = false, flowAtlasImage = null, flowAtlasReady = false, reducedFlash = false) {
        for (const pickup of this.pickups) {
            ctx.save();
            ctx.translate(pickup.pos.x, pickup.pos.y);
            if (interactionAtlasReady && interactionAtlasImage) {
                const sprite = battlefieldInteractionSprite('pickup', pickup.kind);
                const size = Math.max(30, pickup.radius * 3.4);
                ctx.globalAlpha = 0.96;
                ctx.drawImage(interactionAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -size / 2, -size / 2, size, size);
            }
            else if (pickup.kind === 'coin') {
                ctx.shadowColor = '#ffd64f';
                ctx.shadowBlur = 12;
                ctx.fillStyle = '#ffd85d';
                ctx.beginPath();
                ctx.arc(0, 0, pickup.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff1a0';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = '#8b5e13';
                ctx.font = '900 10px system-ui';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('G', 0, 1);
            }
            else {
                ctx.rotate(Math.PI / 4);
                ctx.shadowColor = '#63d6ff';
                ctx.shadowBlur = 12;
                ctx.fillStyle = '#71dcff';
                ctx.fillRect(-pickup.radius * .65, -pickup.radius * .65, pickup.radius * 1.3, pickup.radius * 1.3);
            }
            if (flowAtlasReady && flowAtlasImage && pickup.flowState) {
                const flow = pickupFlowVfxSprite(pickup.kind, pickup.flowState);
                const size = Math.max(46, pickup.radius * 4.8);
                ctx.globalAlpha = reducedFlash ? 0.34 : (pickup.flowState === 'globalMagnet' ? 0.68 : 0.56);
                ctx.drawImage(flowAtlasImage, flow.sx, flow.sy, flow.sw, flow.sh, -size / 2, -size / 2, size, size);
            }
            ctx.restore();
        }
        if (flowAtlasReady && flowAtlasImage) {
            for (const cue of this.collectionVfx) {
                const sprite = pickupFlowVfxSprite(cue.kind, cue.state);
                const t = Math.max(0, Math.min(1, cue.ttl / cue.maxTtl));
                const progress = 1 - t;
                const base = cue.state === 'collectLarge' ? 78 : 58, size = base * (1 + progress * .38);
                ctx.save();
                ctx.globalAlpha = (reducedFlash ? .34 : .72) * t;
                ctx.drawImage(flowAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, cue.pos.x - size / 2, cue.pos.y - size / 2, size, size);
                ctx.restore();
            }
        }
    }
    queueCollectionVfx(pickup) {
        const state = isRichPickup(pickup.kind, pickup.value) || pickup.radius >= 11 ? 'collectLarge' : 'collectSmall';
        const maxTtl = state === 'collectLarge' ? .46 : .32;
        this.collectionVfx.push({ kind: pickup.kind, pos: { ...pickup.pos }, state, ttl: maxTtl, maxTtl });
        if (this.collectionVfx.length > 32)
            this.collectionVfx.splice(0, this.collectionVfx.length - 32);
    }
    spawn(kind, x, y, value) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 55 + Math.random() * 80;
        this.pickups.push({
            kind, value, pos: { x, y }, vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
            radius: kind === 'coin' ? 9 : 8, age: 0, flowState: null,
        });
    }
    mergeDensePickups() {
        const next = [];
        const buckets = { xp: [], coin: [] };
        for (const p of this.pickups)
            buckets[p.kind].push(p);
        for (const kind of ['xp', 'coin']) {
            const list = buckets[kind];
            for (let i = 0; i < list.length; i += 2) {
                const a = list[i];
                const b = list[i + 1];
                if (!a)
                    continue;
                if (!b) {
                    next.push(a);
                    continue;
                }
                next.push({
                    kind, value: a.value + b.value,
                    pos: { x: (a.pos.x + b.pos.x) / 2, y: (a.pos.y + b.pos.y) / 2 },
                    vel: { x: 0, y: 0 }, radius: Math.min(15, Math.max(a.radius, b.radius) + 1.2), age: Math.max(a.age, b.age), flowState: 'cluster',
                });
            }
        }
        this.pickups = next;
    }
}

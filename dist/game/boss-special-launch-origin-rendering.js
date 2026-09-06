import { bossSpecialBodyLanguagePresentation } from './boss-special-body-language-rendering.js';
import { bossSpecialOriginAnchorPresentation } from './boss-special-origin-anchor-rendering.js';
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
function clampVector(x, y, max) { const m = Math.hypot(x, y); if (m <= max || m <= .0001)
    return { x, y }; const s = max / m; return { x: x * s, y: y * s }; }
export function bossSpecialLaunchOriginPresentation(input, reducedMotion = false) {
    const len = Math.hypot(input.facingX, input.facingY) || 1, fx = input.facingX / len, fy = input.facingY / len;
    const body = bossSpecialBodyLanguagePresentation(input.archetype, input.phase, input.specialTimer, fx, fy, reducedMotion);
    const handoff = clamp(input.handoffStrength, 0, 1), sharedAnchor = bossSpecialOriginAnchorPresentation({ bodyOffsetX: body.offsetX, bodyOffsetY: body.offsetY, rebaseOffsetX: input.rebaseOffsetX, rebaseOffsetY: input.rebaseOffsetY, handoffStrength: handoff, charge: body.charge, recovery: input.recovery ?? 0, stagger: input.stagger ?? 0 }, reducedMotion), rebaseWeight = sharedAnchor.owner === 'ground' ? clamp(handoff * .72 + (Math.hypot(input.rebaseOffsetX, input.rebaseOffsetY) > 4 ? .24 : 0), 0, 1) : 0;
    const bodyLanguageWeight = clamp(body.charge * .78 + .22, 0, 1), motion = reducedMotion ? .62 : 1, r = clamp(input.radius, 30, 90);
    const rebase = clampVector(sharedAnchor.anchorOffsetX * rebaseWeight, sharedAnchor.anchorOffsetY * rebaseWeight, reducedMotion ? 13 : 24);
    const projectileBase = { x: fx * r * .72 * motion + body.offsetX * bodyLanguageWeight, y: fy * r * .72 * motion + body.offsetY * bodyLanguageWeight };
    const projectile = clampVector(projectileBase.x + rebase.x * .55, projectileBase.y + rebase.y * .55, reducedMotion ? 34 : 52);
    const hazard = clampVector(body.offsetX * .45 + rebase.x * .72, body.offsetY * .45 + rebase.y * .72, reducedMotion ? 14 : 24);
    return { owner: rebaseWeight > .3 ? 'rebase' : 'special-body', projectileOffsetX: projectile.x, projectileOffsetY: projectile.y, hazardOriginOffsetX: hazard.x, hazardOriginOffsetY: hazard.y, bodyLanguageWeight, rebaseWeight, convergeSeconds: .15 * (reducedMotion ? .6 : 1) };
}
export function bossVisualLaunchPosition(x, y, offsetX, offsetY, ttl, maxTtl) { const t = clamp(ttl / Math.max(.0001, maxTtl), 0, 1), b = t * t; return { x: x + offsetX * b, y: y + offsetY * b }; }

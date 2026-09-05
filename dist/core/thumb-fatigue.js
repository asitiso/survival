export function thumbComfortProfile() { return { softFollowStart: 72, maxReach: 92 }; }
export function softFollowJoystickBase(base, pointer, profile = thumbComfortProfile()) {
    const dx = pointer.x - base.x, dy = pointer.y - base.y, d = Math.hypot(dx, dy);
    if (d <= profile.softFollowStart || d <= Number.EPSILON)
        return { ...base };
    const desired = Math.min(profile.maxReach, Math.max(profile.softFollowStart, profile.maxReach));
    const shift = Math.max(0, d - desired);
    if (shift <= 0)
        return { ...base };
    return { x: base.x + dx / d * shift, y: base.y + dy / d * shift };
}

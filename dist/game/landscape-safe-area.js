import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './config.js';
const heroPanel = { x: 18, y: 16, width: 440, height: 146 };
function withPanels(base) {
    return { ...base, heroPanel: { ...heroPanel }, statusPanel: { x: base.headerX, y: 14, width: base.headerWidth, height: 70 } };
}
export function landscapeSafeAreaProfile(viewportWidth, viewportHeight) {
    const w = Math.max(1, Number.isFinite(viewportWidth) ? viewportWidth : LOGICAL_WIDTH), h = Math.max(1, Number.isFinite(viewportHeight) ? viewportHeight : LOGICAL_HEIGHT), aspect = w / h;
    const foldable = aspect >= 1.08 && aspect <= 1.38 && w >= 1800 && h >= 1400;
    if (foldable) {
        const hinge = { x: 775, y: 0, width: 50, height: LOGICAL_HEIGHT };
        return { aspectClass: 'foldable', leftInset: 28, rightInset: 28, topInset: 24, bottomInset: 22, statusMaxChars: 34, joystickMinX: 120, joystickMaxX: 700, joystickMinY: 445, joystickMaxY: 750, headerX: 840, headerWidth: 260, headerCenterX: 970, hingeExclusion: hinge, heroPanel: { x: 18, y: 16, width: 440, height: 146 }, statusPanel: { x: 840, y: 14, width: 260, height: 70 } };
    }
    if (aspect >= 2.8)
        return withPanels({ aspectClass: 'extreme', leftInset: 104, rightInset: 104, topInset: 14, bottomInset: 20, statusMaxChars: 50, joystickMinX: 145, joystickMaxX: 620, joystickMinY: 405, joystickMaxY: 755, headerX: 590, headerWidth: 440, headerCenterX: 810 });
    if (aspect >= 2.05)
        return withPanels({ aspectClass: 'ultrawide', leftInset: 56, rightInset: 56, topInset: 12, bottomInset: 18, statusMaxChars: 56, joystickMinX: 130, joystickMaxX: 670, joystickMinY: 400, joystickMaxY: 760, headerX: 570, headerWidth: 480, headerCenterX: 810 });
    if (aspect <= 1.48)
        return withPanels({ aspectClass: 'compact', leftInset: 20, rightInset: 20, topInset: 30, bottomInset: 22, statusMaxChars: 58, joystickMinX: 120, joystickMaxX: 690, joystickMinY: 430, joystickMaxY: 748, headerX: 570, headerWidth: 480, headerCenterX: 810 });
    return withPanels({ aspectClass: 'standard', leftInset: 16, rightInset: 16, topInset: 10, bottomInset: 14, statusMaxChars: 64, joystickMinX: 110, joystickMaxX: 720, joystickMinY: 400, joystickMaxY: 770, headerX: 570, headerWidth: 480, headerCenterX: 810 });
}

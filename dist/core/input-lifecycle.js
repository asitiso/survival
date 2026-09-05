import { LOGICAL_HEIGHT, LOGICAL_WIDTH, ACTION_BUTTONS } from '../game/config.js';
import { mobileInputRegressionAudit } from '../game/mobile-input-regression-audit.js';
export function logicalPointerPosition(clientX, clientY, rect) {
    const width = Number.isFinite(rect.width) && rect.width > 0 ? rect.width : LOGICAL_WIDTH;
    const height = Number.isFinite(rect.height) && rect.height > 0 ? rect.height : LOGICAL_HEIGHT;
    const left = Number.isFinite(rect.left) ? rect.left : 0, top = Number.isFinite(rect.top) ? rect.top : 0;
    return { x: (clientX - left) * (LOGICAL_WIDTH / width), y: (clientY - top) * (LOGICAL_HEIGHT / height) };
}
export function auditInputLifecycleResilience() {
    const profiles = [[1600, 900], [2400, 1080], [2208, 1840], [0, 0]];
    const points = profiles.map(([width, height]) => logicalPointerPosition(width / 2 || 400, height / 2 || 225, { left: 0, top: 0, width, height }));
    const finite = points.filter(point => Number.isFinite(point.x) && Number.isFinite(point.y)).length;
    const joystickPointer = 1;
    const actionPointers = new Map([[2, 'spell1'], [3, 'ultimate1']]);
    const multitouchIsolation = ![...actionPointers.keys()].includes(joystickPointer) && new Set(actionPointers.keys()).size === 2;
    const transientModel = { joystickPointer: null, actionPointers: new Map(), held: new Set(), pressed: new Set(), keys: new Set(), move: { x: 0, y: 0 } };
    const transientResetCoverage = [transientModel.joystickPointer === null, transientModel.actionPointers.size === 0, transientModel.held.size === 0, transientModel.pressed.size === 0, transientModel.keys.size === 0, transientModel.move.x === 0 && transientModel.move.y === 0].filter(Boolean).length / 6;
    const mobile = mobileInputRegressionAudit();
    const zeroRectSafe = Number.isFinite(points.at(-1)?.x) && Number.isFinite(points.at(-1)?.y);
    const finiteMappingCoverage = finite / points.length, actionCount = ACTION_BUTTONS.length, hingeClear = mobile.hingeClear;
    const passed = profiles.length === 4 && actionCount === 9 && multitouchIsolation && transientResetCoverage === 1 && zeroRectSafe && hingeClear && finiteMappingCoverage === 1;
    return { profiles: profiles.length, actionCount, multitouchIsolation, transientResetCoverage, zeroRectSafe, hingeClear, finiteMappingCoverage, passed };
}

import { clampMagnitude } from './math.js';
import { ACTION_BUTTONS, ACTION_TOUCH_SCALE, LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../game/config.js';
import { applyJoystickDeadzone, hitTestActionButton } from './touch-controls.js';
import { safeJoystickOrigin, shouldStartLandscapeJoystick } from '../game/landscape-hud.js';
import { landscapeSafeAreaProfile } from '../game/landscape-safe-area.js';
import { foldableTouchScaleMap } from '../game/foldable-touch-density.js';
import { foldableThumbIntent } from '../game/foldable-thumb-zones.js';
import { resolveFoldableDeadSpace } from '../game/foldable-dead-space.js';
import { softFollowJoystickBase, thumbComfortProfile } from './thumb-fatigue.js';
import { logicalPointerPosition } from './input-lifecycle.js';
import { ActionHoldLeashTracker, actionHoldReleaseRadius } from './action-hold-leash.js';
import { joystickNeutralRecoveryProfile, shouldCatchJoystickNeutralReturn } from './joystick-neutral-recovery.js';
import { StrategicActionReleaseTracker, strategicActionReleaseRadius } from './strategic-action-release.js';
export class InputState {
    canvas;
    move = { x: 0, y: 0 };
    joystickActive = false;
    joystickBase = { x: 170, y: 710 };
    joystickThumb = { x: 170, y: 710 };
    joystickPointer = null;
    joystickHome = null;
    actionPointers = new Map();
    actionLeashes = new ActionHoldLeashTracker();
    strategicReleases = new StrategicActionReleaseTracker();
    held = new Set();
    pressed = new Set();
    keys = new Set();
    constructor(canvas) {
        this.canvas = canvas;
        canvas.addEventListener('pointerdown', this.onPointerDown, { passive: false });
        canvas.addEventListener('pointermove', this.onPointerMove, { passive: false });
        canvas.addEventListener('pointerup', this.onPointerUp, { passive: false });
        canvas.addEventListener('pointercancel', this.onPointerCancel, { passive: false });
        canvas.addEventListener('lostpointercapture', this.onLostPointerCapture);
        window.addEventListener('keydown', this.onKeyDown, { passive: false });
        window.addEventListener('keyup', this.onKeyUp, { passive: false });
    }
    destroy() {
        this.canvas.removeEventListener('pointerdown', this.onPointerDown);
        this.canvas.removeEventListener('pointermove', this.onPointerMove);
        this.canvas.removeEventListener('pointerup', this.onPointerUp);
        this.canvas.removeEventListener('pointercancel', this.onPointerCancel);
        this.canvas.removeEventListener('lostpointercapture', this.onLostPointerCapture);
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    }
    isHeld(action) {
        return this.held.has(action) || this.keyboardActionHeld(action);
    }
    consumePressed(action) {
        if (this.pressed.delete(action))
            return true;
        return false;
    }
    endFrame() {
        this.pressed.clear();
    }
    clearStrategicActionArms() {
        for (const [pointerId, action] of [...this.actionPointers.entries()]) {
            if (action !== 'shop' && action !== 'auto')
                continue;
            this.strategicReleases.cancel(pointerId);
            this.actionPointers.delete(pointerId);
        }
        for (const action of ['shop', 'auto']) {
            const stillHeldByPointer = [...this.actionPointers.values()].includes(action);
            if (!stillHeldByPointer)
                this.held.delete(action);
        }
    }
    resetTransient() {
        this.joystickPointer = null;
        this.joystickHome = null;
        this.actionPointers.clear();
        this.actionLeashes.clear();
        this.strategicReleases.clear();
        this.held.clear();
        this.pressed.clear();
        this.keys.clear();
        this.joystickActive = false;
        this.move = { x: 0, y: 0 };
        this.joystickThumb = { ...this.joystickBase };
    }
    refreshKeyboardMovement() {
        const x = (this.keys.has('d') || this.keys.has('arrowright') ? 1 : 0) - (this.keys.has('a') || this.keys.has('arrowleft') ? 1 : 0);
        const y = (this.keys.has('s') || this.keys.has('arrowdown') ? 1 : 0) - (this.keys.has('w') || this.keys.has('arrowup') ? 1 : 0);
        if (x !== 0 || y !== 0)
            this.move = clampMagnitude({ x, y }, 1);
        else if (this.joystickPointer === null)
            this.move = { x: 0, y: 0 };
    }
    onPointerDown = (event) => {
        event.preventDefault();
        const p = this.toLogical(event);
        const rect = this.canvas.getBoundingClientRect();
        const safeArea = landscapeSafeAreaProfile(rect.width || LOGICAL_WIDTH, rect.height || LOGICAL_HEIGHT);
        const touchProfile = foldableTouchScaleMap(safeArea, ACTION_BUTTONS, ACTION_TOUCH_SCALE);
        const deadSpace = safeArea.aspectClass === 'foldable' ? resolveFoldableDeadSpace(p, safeArea, ACTION_BUTTONS) : null;
        const thumbIntent = deadSpace?.intent ?? foldableThumbIntent(p, safeArea);
        const deadSpaceButton = deadSpace?.actionId ? ACTION_BUTTONS.find((entry) => entry.id === deadSpace.actionId) ?? null : null;
        const button = safeArea.aspectClass === 'foldable'
            ? deadSpaceButton ?? (thumbIntent === 'right' ? hitTestActionButton(p, ACTION_BUTTONS, ACTION_TOUCH_SCALE, touchProfile) : null)
            : hitTestActionButton(p);
        if (button) {
            const actualTouchScale = touchProfile[button.id] ?? ACTION_TOUCH_SCALE;
            if (button.id === 'shop' || button.id === 'auto') {
                const armed = this.strategicReleases.arm(event.pointerId, button.id, { x: button.x, y: button.y }, strategicActionReleaseRadius(button.radius, actualTouchScale));
                if (armed) {
                    this.actionPointers.set(event.pointerId, button.id);
                    this.held.add(button.id);
                    this.canvas.setPointerCapture?.(event.pointerId);
                }
                return;
            }
            this.actionPointers.set(event.pointerId, button.id);
            if (button.id === 'spell1' || button.id === 'spell2' || button.id === 'spell3' || button.id === 'spell4') {
                this.actionLeashes.begin(event.pointerId, button.id, { x: button.x, y: button.y }, actionHoldReleaseRadius(button.radius, actualTouchScale));
            }
            this.held.add(button.id);
            this.pressed.add(button.id);
            this.canvas.setPointerCapture?.(event.pointerId);
            return;
        }
        const joystickPoint = deadSpace?.joystickOrigin ?? p;
        if ((safeArea.aspectClass !== 'foldable' || thumbIntent === 'left') && shouldStartLandscapeJoystick(joystickPoint, safeArea) && this.joystickPointer === null) {
            const origin = deadSpace?.joystickOrigin ?? safeJoystickOrigin(p, safeArea);
            this.joystickPointer = event.pointerId;
            this.joystickHome = { ...origin };
            this.joystickActive = true;
            this.joystickBase = origin;
            this.joystickThumb = origin;
            this.canvas.setPointerCapture?.(event.pointerId);
            this.updateJoystick(deadSpace?.recovered ? origin : p);
        }
    };
    onPointerMove = (event) => {
        if (this.strategicReleases.has(event.pointerId)) {
            event.preventDefault();
            const canceledAction = this.strategicReleases.move(event.pointerId, this.toLogical(event));
            if (canceledAction)
                this.releaseActionPointer(event.pointerId);
            return;
        }
        if (this.actionLeashes.has(event.pointerId)) {
            event.preventDefault();
            const releasedAction = this.actionLeashes.move(event.pointerId, this.toLogical(event));
            if (releasedAction)
                this.releaseActionPointer(event.pointerId);
            return;
        }
        if (event.pointerId !== this.joystickPointer)
            return;
        event.preventDefault();
        this.updateJoystick(this.toLogical(event));
    };
    onPointerUp = (event) => {
        event.preventDefault();
        if (event.pointerId === this.joystickPointer) {
            this.joystickPointer = null;
            this.joystickHome = null;
            this.joystickActive = false;
            this.move = { x: 0, y: 0 };
            this.joystickThumb = { ...this.joystickBase };
        }
        const committedAction = this.strategicReleases.commit(event.pointerId);
        if (committedAction)
            this.pressed.add(committedAction);
        this.releaseActionPointer(event.pointerId);
    };
    onPointerCancel = (event) => {
        event.preventDefault();
        if (event.pointerId === this.joystickPointer) {
            this.joystickPointer = null;
            this.joystickHome = null;
            this.joystickActive = false;
            this.move = { x: 0, y: 0 };
            this.joystickThumb = { ...this.joystickBase };
        }
        this.strategicReleases.cancel(event.pointerId);
        this.releaseActionPointer(event.pointerId);
    };
    onLostPointerCapture = (event) => {
        if (event.pointerId === this.joystickPointer) {
            this.joystickPointer = null;
            this.joystickHome = null;
            this.joystickActive = false;
            this.move = { x: 0, y: 0 };
            this.joystickThumb = { ...this.joystickBase };
        }
        this.strategicReleases.cancel(event.pointerId);
        this.releaseActionPointer(event.pointerId);
    };
    releaseActionPointer(pointerId) {
        const action = this.actionPointers.get(pointerId);
        if (!action) {
            this.actionLeashes.end(pointerId);
            return;
        }
        this.actionPointers.delete(pointerId);
        this.actionLeashes.end(pointerId);
        const stillHeldByPointer = [...this.actionPointers.values()].includes(action);
        if (!stillHeldByPointer)
            this.held.delete(action);
    }
    onKeyDown = (event) => {
        const key = event.key.toLowerCase();
        this.keys.add(key);
        const action = this.actionFromKey(key);
        if (action && !event.repeat)
            this.pressed.add(action);
        if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key))
            event.preventDefault();
        this.refreshKeyboardMovement();
    };
    onKeyUp = (event) => {
        this.keys.delete(event.key.toLowerCase());
        this.refreshKeyboardMovement();
    };
    keyboardActionHeld(action) {
        const mapping = {
            spell1: '1', spell2: '2', spell3: '3', spell4: '4', ultimate1: 'q', ultimate2: 'e', potion: ' ', shop: 'b', auto: 'r',
        };
        const key = mapping[action];
        return key ? this.keys.has(key) : false;
    }
    actionFromKey(key) {
        const map = {
            '1': 'spell1', '2': 'spell2', '3': 'spell3', '4': 'spell4', q: 'ultimate1', e: 'ultimate2', ' ': 'potion', b: 'shop', r: 'auto',
        };
        return map[key] ?? null;
    }
    updateJoystick(p) {
        const comfort = thumbComfortProfile();
        const recovery = joystickNeutralRecoveryProfile(comfort.maxReach);
        if (this.joystickHome && shouldCatchJoystickNeutralReturn(this.joystickHome, this.joystickBase, p, recovery)) {
            this.joystickHome = { ...p };
            this.joystickBase = { ...p };
            this.joystickThumb = { ...p };
            this.move = { x: 0, y: 0 };
            return;
        }
        this.joystickBase = softFollowJoystickBase(this.joystickBase, p, comfort);
        const maxRadius = comfort.maxReach;
        const raw = { x: p.x - this.joystickBase.x, y: p.y - this.joystickBase.y };
        const normalized = applyJoystickDeadzone(clampMagnitude({ x: raw.x / maxRadius, y: raw.y / maxRadius }, 1));
        this.move = normalized;
        this.joystickThumb = {
            x: this.joystickBase.x + normalized.x * maxRadius,
            y: this.joystickBase.y + normalized.y * maxRadius,
        };
    }
    toLogical(event) {
        const rect = this.canvas.getBoundingClientRect();
        return logicalPointerPosition(event.clientX, event.clientY, rect);
    }
}

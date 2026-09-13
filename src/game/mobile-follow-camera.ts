import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './config.js';
import { mobileLandscapePresentationProfile } from './mobile-landscape-presentation.js';

export interface CameraPoint {
  x: number;
  y: number;
}

export interface CameraArena {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface CameraInput {
  width: number;
  height: number;
  arena: CameraArena;
  hero: CameraPoint;
}

export interface CameraAdvanceInput extends CameraInput {
  deltaSeconds: number;
}

export interface MobileFollowCameraState {
  active: boolean;
  zoom: number;
  center: CameraPoint;
  visible: CameraArena;
}

const MOBILE_ZOOM = 1.70;
const DEAD_ZONE_WIDTH = .36;
const DEAD_ZONE_HEIGHT = .40;
const FOLLOW_SPEED = 7;

function finite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function normalizedArena(arena: CameraArena): CameraArena {
  const left = finite(arena.left, 0);
  const top = finite(arena.top, 0);
  const right = Math.max(left, finite(arena.right, LOGICAL_WIDTH));
  const bottom = Math.max(top, finite(arena.bottom, LOGICAL_HEIGHT));
  return { left, top, right, bottom };
}

function visibleBounds(center: CameraPoint, zoom: number): CameraArena {
  const halfWidth = LOGICAL_WIDTH / Math.max(1, zoom) / 2;
  const halfHeight = LOGICAL_HEIGHT / Math.max(1, zoom) / 2;
  return { left: center.x - halfWidth, top: center.y - halfHeight, right: center.x + halfWidth, bottom: center.y + halfHeight };
}

function clampCenter(center: CameraPoint, arena: CameraArena, zoom: number): CameraPoint {
  const halfWidth = LOGICAL_WIDTH / Math.max(1, zoom) / 2;
  const halfHeight = LOGICAL_HEIGHT / Math.max(1, zoom) / 2;
  const minX = arena.left + halfWidth;
  const maxX = arena.right - halfWidth;
  const minY = arena.top + halfHeight;
  const maxY = arena.bottom - halfHeight;
  return {
    x: minX > maxX ? (arena.left + arena.right) / 2 : Math.max(minX, Math.min(maxX, center.x)),
    y: minY > maxY ? (arena.top + arena.bottom) / 2 : Math.max(minY, Math.min(maxY, center.y)),
  };
}

function activeFor(width: number, height: number): boolean {
  return mobileLandscapePresentationProfile(width, height).active;
}

function state(active: boolean, zoom: number, center: CameraPoint, arena: CameraArena): MobileFollowCameraState {
  const resolved = active ? clampCenter(center, arena, zoom) : center;
  return { active, zoom, center: resolved, visible: visibleBounds(resolved, zoom) };
}

export function createMobileFollowCamera(input: CameraInput): MobileFollowCameraState {
  const arena = normalizedArena(input.arena);
  const active = activeFor(input.width, input.height);
  const zoom = active ? MOBILE_ZOOM : 1;
  return state(active, zoom, { x: LOGICAL_WIDTH / 2, y: LOGICAL_HEIGHT / 2 }, arena);
}

export function advanceMobileFollowCamera(previous: MobileFollowCameraState, input: CameraAdvanceInput): MobileFollowCameraState {
  const arena = normalizedArena(input.arena);
  const active = activeFor(input.width, input.height);
  if (!active) return state(false, 1, { x: LOGICAL_WIDTH / 2, y: LOGICAL_HEIGHT / 2 }, arena);
  const zoom = MOBILE_ZOOM;
  const hero = { x: finite(input.hero.x, previous.center.x), y: finite(input.hero.y, previous.center.y) };
  const current = clampCenter(previous.center, arena, zoom);
  const visible = visibleBounds(current, zoom);
  const halfDeadWidth = (visible.right - visible.left) * DEAD_ZONE_WIDTH / 2;
  const halfDeadHeight = (visible.bottom - visible.top) * DEAD_ZONE_HEIGHT / 2;
  const target = {
    x: hero.x < current.x - halfDeadWidth ? hero.x + halfDeadWidth : hero.x > current.x + halfDeadWidth ? hero.x - halfDeadWidth : current.x,
    y: hero.y < current.y - halfDeadHeight ? hero.y + halfDeadHeight : hero.y > current.y + halfDeadHeight ? hero.y - halfDeadHeight : current.y,
  };
  const dt = Math.max(0, Math.min(1, finite(input.deltaSeconds, 0)));
  const follow = 1 - Math.exp(-FOLLOW_SPEED * dt);
  return state(true, zoom, {
    x: current.x + (target.x - current.x) * follow,
    y: current.y + (target.y - current.y) * follow,
  }, arena);
}

export function cameraWorldToScreen(point: CameraPoint, camera: MobileFollowCameraState): CameraPoint {
  return {
    x: (finite(point.x, camera.center.x) - camera.center.x) * camera.zoom + LOGICAL_WIDTH / 2,
    y: (finite(point.y, camera.center.y) - camera.center.y) * camera.zoom + LOGICAL_HEIGHT / 2,
  };
}

export function cameraTransform(camera: MobileFollowCameraState, combatScale: number): { center: CameraPoint; scale: number } {
  return { center: camera.center, scale: camera.zoom * Math.max(.5, Math.min(1.5, finite(combatScale, 1))) };
}

import { installMobileLandscapeModalStyles } from './mobile-landscape-modal-styles.js';

const PHONE_LANDSCAPE_MAX_WIDTH = 1024;
const PHONE_LANDSCAPE_MAX_HEIGHT = 520;
const HUD_BASE_WIDTH = 1600;
const HUD_BASE_HEIGHT = 900;

export const MOBILE_ACTION_X_OFFSET = 72;
export const MOBILE_ACTION_EDGE_MARGIN = 16;
export const MOBILE_JOYSTICK_MAX_X_OFFSET = 60;

installMobileLandscapeModalStyles();

export interface MobileLandscapePresentationProfile {
  active: boolean;
  actorScale: number;
  hudScale: number;
  controlScale: number;
}

export interface MobileLandscapeHudLayout {
  active: boolean;
  scale: number;
  logicalWidth: number;
  logicalHeight: number;
  offsetX: number;
}

function browserViewport(): readonly [width: number, height: number] {
  try {
    if (typeof window === 'undefined') return [0, 0];
    return [window.innerWidth, window.innerHeight];
  } catch {
    return [0, 0];
  }
}

export function mobileLandscapePresentationProfile(
  viewportWidth?: number,
  viewportHeight?: number,
): MobileLandscapePresentationProfile {
  const [browserWidth, browserHeight] = browserViewport();
  const width = Number.isFinite(viewportWidth) ? Math.max(0, viewportWidth ?? 0) : browserWidth;
  const height = Number.isFinite(viewportHeight) ? Math.max(0, viewportHeight ?? 0) : browserHeight;
  const resolvedWidth = viewportWidth === undefined ? browserWidth : width;
  const resolvedHeight = viewportHeight === undefined ? browserHeight : height;
  const active = resolvedWidth > resolvedHeight
    && resolvedWidth <= PHONE_LANDSCAPE_MAX_WIDTH
    && resolvedHeight <= PHONE_LANDSCAPE_MAX_HEIGHT;
  return {
    active,
    actorScale: active ? 1.1 : 1,
    hudScale: active ? 1.18 : 1,
    controlScale: active ? 1.25 : 1,
  };
}

export function mobileLandscapeHudLayout(
  viewportWidth?: number,
  viewportHeight?: number,
): MobileLandscapeHudLayout {
  const [browserWidth, browserHeight] = browserViewport();
  const width = viewportWidth === undefined ? browserWidth : Math.max(0, Number.isFinite(viewportWidth) ? viewportWidth : 0);
  const height = viewportHeight === undefined ? browserHeight : Math.max(0, Number.isFinite(viewportHeight) ? viewportHeight : 0);
  const profile = mobileLandscapePresentationProfile(width, height);
  if (!profile.active || height <= 0) {
    return { active: false, scale: 1, logicalWidth: HUD_BASE_WIDTH, logicalHeight: HUD_BASE_HEIGHT, offsetX: 0 };
  }
  const logicalWidth = Math.max(HUD_BASE_WIDTH, Math.round(HUD_BASE_HEIGHT * width / height));
  const scale = Math.max(1, Math.min(profile.hudScale, logicalWidth / 1600));
  const offsetX = Math.max(0, (logicalWidth - HUD_BASE_WIDTH * scale) / 2);
  return { active: true, scale, logicalWidth, logicalHeight: HUD_BASE_HEIGHT, offsetX };
}

export function mobileLandscapeActionX(
  baseX: number,
  baseRadius: number,
  logicalWidth = HUD_BASE_WIDTH,
  viewportWidth?: number,
  viewportHeight?: number,
): number {
  const [browserWidth, browserHeight] = browserViewport();
  const width = viewportWidth === undefined ? browserWidth : viewportWidth;
  const height = viewportHeight === undefined ? browserHeight : viewportHeight;
  const profile = mobileLandscapePresentationProfile(width, height);
  if (!profile.active) return baseX;
  const scaledRadius = baseRadius * profile.controlScale;
  const maxCenterX = logicalWidth - scaledRadius - MOBILE_ACTION_EDGE_MARGIN;
  return Math.min(baseX + MOBILE_ACTION_X_OFFSET, maxCenterX);
}

export function mobileLandscapeJoystickMaxX(
  baseMaxX: number,
  viewportWidth?: number,
  viewportHeight?: number,
): number {
  const [browserWidth, browserHeight] = browserViewport();
  const width = viewportWidth === undefined ? browserWidth : viewportWidth;
  const height = viewportHeight === undefined ? browserHeight : viewportHeight;
  const profile = mobileLandscapePresentationProfile(width, height);
  return profile.active
    ? Math.max(0, baseMaxX - MOBILE_JOYSTICK_MAX_X_OFFSET)
    : baseMaxX;
}

export function mobileLandscapeActorScale(): number {
  return mobileLandscapePresentationProfile().actorScale;
}

export function mobileLandscapeControlScale(): number {
  return mobileLandscapePresentationProfile().controlScale;
}

export function mobileLandscapeTouchScale(baseTouchScale: number): number {
  const safeBase = Number.isFinite(baseTouchScale) ? Math.max(0.5, baseTouchScale) : 1;
  return safeBase / mobileLandscapeControlScale();
}

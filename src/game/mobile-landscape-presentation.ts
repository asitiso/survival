const PHONE_LANDSCAPE_MAX_WIDTH = 1024;
const PHONE_LANDSCAPE_MAX_HEIGHT = 520;
const HUD_BASE_WIDTH = 1600;
const HUD_BASE_HEIGHT = 900;

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

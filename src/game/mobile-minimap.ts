import { mobileLandscapePresentationProfile } from './mobile-landscape-presentation.js';
import type { CameraArena, CameraPoint } from './mobile-follow-camera.js';

export interface MobileMinimapRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MobileMinimapToggle {
  x: number;
  y: number;
  radius: number;
}

export interface MobileMinimapLayout {
  active: boolean;
  expanded: boolean;
  toggle: MobileMinimapToggle;
  panel: (MobileMinimapRect & { map: MobileMinimapRect }) | null;
}

const TOGGLE: MobileMinimapToggle = { x: 1522, y: 112, radius: 30 };

export function mobileMinimapLayout(viewportWidth: number, viewportHeight: number, expanded: boolean): MobileMinimapLayout {
  const active = mobileLandscapePresentationProfile(viewportWidth, viewportHeight).active;
  if (!active) return { active: false, expanded: false, toggle: { ...TOGGLE }, panel: null };
  if (!expanded) return { active: true, expanded: false, toggle: { ...TOGGLE }, panel: null };
  const panel: MobileMinimapRect = { x: 1254, y: 42, width: 286, height: 194 };
  return {
    active: true,
    expanded: true,
    toggle: { ...TOGGLE },
    panel: { ...panel, map: { x: panel.x + 12, y: panel.y + 38, width: panel.width - 24, height: panel.height - 50 } },
  };
}

export function mobileMinimapToggleHit(point: CameraPoint, layout: MobileMinimapLayout): boolean {
  if (!layout.active) return false;
  const dx = point.x - layout.toggle.x;
  const dy = point.y - layout.toggle.y;
  return dx * dx + dy * dy <= (layout.toggle.radius + 10) ** 2;
}

export function projectMobileMinimapPoint(point: CameraPoint, arena: CameraArena, layout: MobileMinimapLayout): CameraPoint {
  const map = layout.panel?.map;
  if (!map) return { x: layout.toggle.x, y: layout.toggle.y };
  const width = Math.max(1, arena.right - arena.left);
  const height = Math.max(1, arena.bottom - arena.top);
  const xRatio = Math.max(0, Math.min(1, (point.x - arena.left) / width));
  const yRatio = Math.max(0, Math.min(1, (point.y - arena.top) / height));
  return { x: map.x + map.width * xRatio, y: map.y + map.height * yRatio };
}

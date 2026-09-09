export interface TerrainForegroundOcclusionInput {
  wallWidth: number;
  wallHeight: number;
  battlefieldStress: number;
  reducedFlash: boolean;
}

export interface TerrainForegroundOcclusionPresentation {
  presentationOnly: true;
  capHeight: number;
  capAlpha: number;
  edgeAlpha: number;
  spriteCropRatio: number;
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
const finitePositive = (value: number, fallback: number): number => Number.isFinite(value) && value > 0 ? value : fallback;
const clamp01 = (value: number): number => clamp(Number.isFinite(value) ? value : 0, 0, 1);

export function terrainForegroundOcclusionPresentation(input: TerrainForegroundOcclusionInput): TerrainForegroundOcclusionPresentation {
  const wallWidth = finitePositive(input.wallWidth, 96);
  const wallHeight = finitePositive(input.wallHeight, 56);
  const stress = clamp01(input.battlefieldStress);
  const capHeight = clamp(wallHeight * 0.18, 6, 20);
  const spriteCropRatio = clamp(capHeight / Math.max(1, wallHeight), 0.10, 0.30);
  const depthScale = 1 - stress * 0.20;
  const edgeScale = 1 - stress * 0.32;
  const flashScale = input.reducedFlash ? 0.84 : 1;
  const flashEdgeScale = input.reducedFlash ? 0.72 : 1;
  const aspectGuard = clamp(wallWidth / Math.max(1, wallHeight), 0.5, 6);

  return {
    presentationOnly: true,
    capHeight,
    capAlpha: clamp(0.74 * depthScale * flashScale, 0, 1),
    edgeAlpha: clamp(0.32 * edgeScale * flashEdgeScale * (aspectGuard >= 0.5 ? 1 : 0.9), 0, 1),
    spriteCropRatio,
  };
}

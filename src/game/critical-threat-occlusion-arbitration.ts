export type CriticalThreatOcclusionClass = 'none' | 'specialist' | 'elite' | 'boss';

export interface CriticalThreatOcclusionArbitrationInput {
  threatClass: CriticalThreatOcclusionClass;
  overlap: number;
}

export interface CriticalThreatOcclusionArbitrationPresentation {
  presentationOnly: true;
  capAlphaScale: number;
  edgeAlphaScale: number;
}

export interface CriticalThreatWallCapOverlapInput {
  wallX: number;
  wallY: number;
  wallWidth: number;
  capHeight: number;
  threatX: number;
  threatY: number;
  threatRadius: number;
}

const PROFILES: Readonly<Record<CriticalThreatOcclusionClass, { cap: number; edge: number }>> = {
  none: { cap: 1, edge: 1 },
  specialist: { cap: 0.82, edge: 0.96 },
  elite: { cap: 0.72, edge: 0.93 },
  boss: { cap: 0.58, edge: 0.89 },
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const finite = (value: number, fallback = 0): number => Number.isFinite(value) ? value : fallback;
const positive = (value: number, fallback: number): number => Number.isFinite(value) && value > 0 ? value : fallback;

export function criticalThreatWallCapOverlap(input: CriticalThreatWallCapOverlapInput): number {
  const wallX = finite(input.wallX);
  const wallY = finite(input.wallY);
  const wallWidth = positive(input.wallWidth, 1);
  const capHeight = positive(input.capHeight, 1);
  const threatX = finite(input.threatX);
  const threatY = finite(input.threatY);
  const radius = positive(input.threatRadius, 1);
  const closestX = Math.max(wallX, Math.min(threatX, wallX + wallWidth));
  const closestY = Math.max(wallY, Math.min(threatY, wallY + capHeight));
  const distance = Math.hypot(threatX - closestX, threatY - closestY);
  if (distance >= radius) return 0;
  return clamp01(1 - distance / radius);
}

export function criticalThreatOcclusionArbitrationPresentation(
  input: CriticalThreatOcclusionArbitrationInput,
): CriticalThreatOcclusionArbitrationPresentation {
  const profile = PROFILES[input.threatClass] ?? PROFILES.none;
  const overlap = clamp01(input.overlap);
  return {
    presentationOnly: true,
    capAlphaScale: 1 - (1 - profile.cap) * overlap,
    edgeAlphaScale: 1 - (1 - profile.edge) * overlap,
  };
}

export type ActorGroundingClass = 'agile' | 'regular' | 'heavy' | 'elite' | 'boss';

export interface ActorGroundingDepthInput {
  actorClass: ActorGroundingClass;
  battlefieldStress: number;
  reducedMotion: boolean;
  reducedFlash: boolean;
}

export interface ActorGroundingDepthPresentation {
  presentationOnly: true;
  shadowAlphaScale: number;
  shadowWidthScale: number;
  shadowHeightScale: number;
  contactPulseScale: number;
}

const PROFILES: Record<ActorGroundingClass, { alpha: number; width: number; height: number; pulse: number }> = {
  agile: { alpha: 0.90, width: 0.90, height: 0.82, pulse: 0.72 },
  regular: { alpha: 1.00, width: 1.00, height: 1.00, pulse: 1.00 },
  heavy: { alpha: 1.12, width: 1.08, height: 1.06, pulse: 0.82 },
  elite: { alpha: 1.18, width: 1.14, height: 1.08, pulse: 0.88 },
  boss: { alpha: 1.28, width: 1.22, height: 1.12, pulse: 0.70 },
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function actorGroundingDepthPresentation(input: ActorGroundingDepthInput): ActorGroundingDepthPresentation {
  const stress = clamp01(input.battlefieldStress);
  const profile = PROFILES[input.actorClass];
  const essentialAlphaScale = 1 - stress * 0.16;
  const essentialWidthScale = 1 - stress * 0.06;
  const essentialHeightScale = 1 - stress * 0.05;
  const decorativeScale = 1 - stress * 0.72;
  const motionScale = input.reducedMotion ? 0.30 : 1;
  const flashScale = input.reducedFlash ? 0.72 : 1;

  return {
    presentationOnly: true,
    shadowAlphaScale: profile.alpha * essentialAlphaScale,
    shadowWidthScale: profile.width * essentialWidthScale,
    shadowHeightScale: profile.height * essentialHeightScale,
    contactPulseScale: profile.pulse * decorativeScale * motionScale * flashScale,
  };
}

export interface BattlefieldDepthTerrainInput {
  battlefieldStress: number;
  evolutionStage: 0 | 1 | 2;
  reducedMotion: boolean;
  reducedFlash: boolean;
}

export interface BattlefieldDepthTerrainPresentation {
  presentationOnly: true;
  ground: {
    centerAlpha: number;
    edgeAlpha: number;
    radiusScale: number;
  };
  obstacle: {
    contactShadowAlpha: number;
    edgeAlpha: number;
    shadowOffsetY: number;
  };
  lane: {
    alpha: number;
    segmentLength: number;
    gapLength: number;
    pulseAmplitude: number;
  };
  core: {
    foundationAlpha: number;
    foundationRadius: number;
    ringAlpha: number;
    ringRadius: number;
    pulseAmplitude: number;
  };
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function battlefieldDepthTerrainPresentation(input: BattlefieldDepthTerrainInput): BattlefieldDepthTerrainPresentation {
  const stress = clamp01(input.battlefieldStress);
  const stage = Math.max(0, Math.min(2, input.evolutionStage)) as 0 | 1 | 2;
  const decorativeScale = 1 - stress * 0.64;
  const essentialScale = 1 - stress * 0.22;
  const flashScale = input.reducedFlash ? 0.72 : 1;
  const stageDepthScale = 1 + stage * 0.08;
  const stageCoreScale = 1 + stage * 0.04;

  const groundCenterAlpha = 0.065 * stageDepthScale * decorativeScale * flashScale;
  const groundEdgeAlpha = 0.18 * stageDepthScale * decorativeScale * flashScale;
  const laneAlpha = 0.085 * stageDepthScale * decorativeScale * flashScale;
  const coreFoundationAlpha = 0.26 * stageCoreScale * essentialScale;
  const coreRingAlpha = 0.13 * stageDepthScale * essentialScale * flashScale;

  return {
    presentationOnly: true,
    ground: {
      centerAlpha: groundCenterAlpha,
      edgeAlpha: groundEdgeAlpha,
      radiusScale: 0.78 + stage * 0.04,
    },
    obstacle: {
      contactShadowAlpha: 0.28 * essentialScale,
      edgeAlpha: 0.24 * essentialScale,
      shadowOffsetY: 12,
    },
    lane: {
      alpha: laneAlpha,
      segmentLength: 54,
      gapLength: 38,
      pulseAmplitude: input.reducedMotion ? 0 : 0.035 * decorativeScale,
    },
    core: {
      foundationAlpha: coreFoundationAlpha,
      foundationRadius: 118 + stage * 6,
      ringAlpha: coreRingAlpha,
      ringRadius: 146 + stage * 6,
      pulseAmplitude: input.reducedMotion ? 0 : 0.025 * essentialScale,
    },
  };
}

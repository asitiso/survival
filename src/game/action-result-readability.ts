export type ActionResultKind='normalHit'|'weakpointHit'|'weakpointBreak'|'guardBreak'|'bossStagger'|'enemyKill';

export interface ActionResultPresentationInput{
  kind:ActionResultKind;
  battlefieldStress?:number;
  protectedWarning?:boolean;
  safeLaneVisible?:boolean;
  reducedMotion?:boolean;
  reducedFlash?:boolean;
  sourceDistance?:number;
}

export interface ActionResultPresentation{
  visible:boolean;
  priority:number;
  alpha:number;
  radius:number;
  lineWidth:number;
  rayCount:number;
  connectorAlpha:number;
  pulseAmplitude:number;
}

interface ActionResultProfile{
  priority:number;
  alpha:number;
  radius:number;
  lineWidth:number;
  rayCount:number;
  connectorAlpha:number;
  pulseAmplitude:number;
}

const PROFILES:Record<ActionResultKind,ActionResultProfile>={
  normalHit:{priority:0,alpha:.11,radius:13,lineWidth:1.15,rayCount:0,connectorAlpha:.055,pulseAmplitude:.4},
  weakpointHit:{priority:1,alpha:.20,radius:18,lineWidth:1.45,rayCount:2,connectorAlpha:.12,pulseAmplitude:.8},
  guardBreak:{priority:2,alpha:.30,radius:23,lineWidth:1.9,rayCount:4,connectorAlpha:.16,pulseAmplitude:1.4},
  weakpointBreak:{priority:3,alpha:.36,radius:27,lineWidth:2.2,rayCount:6,connectorAlpha:.19,pulseAmplitude:1.8},
  bossStagger:{priority:4,alpha:.39,radius:30,lineWidth:2.35,rayCount:6,connectorAlpha:.20,pulseAmplitude:2},
  enemyKill:{priority:5,alpha:.42,radius:31,lineWidth:2.4,rayCount:7,connectorAlpha:.21,pulseAmplitude:2.1},
};

export function actionResultMinimumGap(kind:ActionResultKind):number{
  if(kind==='normalHit')return .18;
  if(kind==='weakpointHit')return .14;
  return .02;
}

export function actionResultPresentation(input:ActionResultPresentationInput):ActionResultPresentation{
  const profile=PROFILES[input.kind];
  const stress=Math.max(0,Math.min(1,input.battlefieldStress??0));
  const densityAlphaScale=1-stress*.44;
  const densityStrokeScale=1-stress*.24;
  const warningScale=input.protectedWarning?.48:1;
  const safeLaneScale=input.safeLaneVisible?.62:1;
  const flashScale=input.reducedFlash?.72:1;
  const resultScale=densityAlphaScale*warningScale*safeLaneScale*flashScale;
  const isResolved=profile.priority>=2;
  const minimumAlpha=isResolved?.055:.025;
  const distance=Number.isFinite(input.sourceDistance)?Math.max(0,input.sourceDistance??0):0;
  const connectorDistanceScale=distance<=44?0:Math.min(1,(distance-44)/120);
  const connectorOwnershipScale=densityAlphaScale*warningScale*safeLaneScale*(input.reducedFlash?.78:1);
  const rayDensityScale=1-stress*.35;
  const rayFlashScale=input.reducedFlash?.45:1;
  return{
    visible:true,
    priority:profile.priority,
    alpha:Math.max(minimumAlpha,profile.alpha*resultScale),
    radius:isResolved?Math.max(18,profile.radius):profile.radius,
    lineWidth:Math.max(.72,profile.lineWidth*densityStrokeScale),
    rayCount:Math.max(0,Math.floor(profile.rayCount*rayDensityScale*rayFlashScale)),
    connectorAlpha:profile.connectorAlpha*connectorDistanceScale*connectorOwnershipScale,
    pulseAmplitude:input.reducedMotion?0:profile.pulseAmplitude*(1-stress*.32)*(input.reducedFlash?.58:1),
  };
}

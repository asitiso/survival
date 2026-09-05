import { clamp } from '../../core/math.js';
import type { HeroFinalFormId } from './final-form.js';

export interface FinalFormFinisherSignature {
  formId:HeroFinalFormId;
  signatureId:string;
  labelSuffix:string;
  secondaryAccent:string;
  angleOffset:number;
  particleSides:number;
  trailSkew:number;
  ringScale:number;
}

type Preset=Omit<FinalFormFinisherSignature,'formId'>;
const P:Record<HeroFinalFormId,Preset>={
  'solar-sovereign':{signatureId:'solar-crown',labelSuffix:'SOLAR CROWN',secondaryAccent:'#ffd56a',angleOffset:.08,particleSides:8,trailSkew:.08,ringScale:1.12},
  'phoenix-lord':{signatureId:'phoenix-wing',labelSuffix:'PHOENIX WING',secondaryAccent:'#ff8d68',angleOffset:.42,particleSides:6,trailSkew:.32,ringScale:.98},
  'volcanic-archon':{signatureId:'magma-seal',labelSuffix:'MAGMA SEAL',secondaryAccent:'#ff6f4f',angleOffset:.74,particleSides:5,trailSkew:-.18,ringScale:1.08},
  'absolute-empress':{signatureId:'zero-halo',labelSuffix:'ZERO HALO',secondaryAccent:'#bcecff',angleOffset:1.02,particleSides:6,trailSkew:0,ringScale:1.1},
  'winter-warden':{signatureId:'frost-aegis',labelSuffix:'FROST AEGIS',secondaryAccent:'#d8f7ff',angleOffset:1.36,particleSides:4,trailSkew:.12,ringScale:1.04},
  'crystal-oracle':{signatureId:'prism-orbit',labelSuffix:'PRISM ORBIT',secondaryAccent:'#c8b9ff',angleOffset:1.68,particleSides:7,trailSkew:-.28,ringScale:.96},
  'thunder-tyrant':{signatureId:'thunder-throne',labelSuffix:'THUNDER THRONE',secondaryAccent:'#fff176',angleOffset:2.06,particleSides:5,trailSkew:.4,ringScale:1.06},
  'tempest-runner':{signatureId:'tempest-line',labelSuffix:'TEMPEST LINE',secondaryAccent:'#84efff',angleOffset:2.42,particleSides:3,trailSkew:.45,ringScale:.92},
  'storm-oracle':{signatureId:'storm-eye',labelSuffix:'STORM EYE',secondaryAccent:'#8ac7ff',angleOffset:2.78,particleSides:7,trailSkew:-.12,ringScale:1.02},
  'radiant-king':{signatureId:'radiant-judgment',labelSuffix:'RADIANT JUDGMENT',secondaryAccent:'#fff0a8',angleOffset:3.16,particleSides:8,trailSkew:.06,ringScale:1.12},
  'oath-guardian':{signatureId:'oath-wall',labelSuffix:'OATH WALL',secondaryAccent:'#a8ffd2',angleOffset:3.5,particleSides:4,trailSkew:-.06,ringScale:1.1},
  'light-pilgrim':{signatureId:'pilgrim-path',labelSuffix:'PILGRIM PATH',secondaryAccent:'#d6ffd8',angleOffset:3.88,particleSides:6,trailSkew:.24,ringScale:.94},
};

export function finalFormFinisherSignature(formId:HeroFinalFormId):FinalFormFinisherSignature{
  const p=P[formId];
  return{
    formId,
    signatureId:p.signatureId,
    labelSuffix:p.labelSuffix,
    secondaryAccent:p.secondaryAccent,
    angleOffset:clamp(p.angleOffset,0,Math.PI*2-.0001),
    particleSides:Math.round(clamp(p.particleSides,3,8)),
    trailSkew:clamp(p.trailSkew,-.45,.45),
    ringScale:clamp(p.ringScale,.9,1.12),
  };
}

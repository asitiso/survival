import { clamp } from '../../core/math.js';
import type { AudioPlayVariation } from '../audio.js';
import type { HeroFinalFormId } from './final-form.js';

export interface FinalFormAudioPalette {
  formId:HeroFinalFormId;
  paletteId:string;
  primary:string;
  secondary:string;
  audio:Required<AudioPlayVariation>;
}

type Preset=Omit<FinalFormAudioPalette,'formId'|'audio'> & {f:number;d:number;g:number};
const P:Record<HeroFinalFormId,Preset>={
  'solar-sovereign':{paletteId:'solar-corona',primary:'#ff9b50',secondary:'#ffd76a',f:.92,d:1.10,g:1.10},
  'phoenix-lord':{paletteId:'phoenix-rebirth',primary:'#ff745f',secondary:'#ffb36a',f:1.05,d:1.14,g:1.06},
  'volcanic-archon':{paletteId:'magma-core',primary:'#e85b3f',secondary:'#ff9a62',f:.88,d:1.18,g:1.12},
  'absolute-empress':{paletteId:'absolute-zero',primary:'#90e8ff',secondary:'#d7fbff',f:1.08,d:1.16,g:.96},
  'winter-warden':{paletteId:'winter-aegis',primary:'#b8f4ff',secondary:'#7ec6ff',f:.96,d:1.12,g:1.02},
  'crystal-oracle':{paletteId:'crystal-prism',primary:'#c6b0ff',secondary:'#79ecff',f:1.12,d:1.04,g:.94},
  'thunder-tyrant':{paletteId:'thunder-throne',primary:'#fff36a',secondary:'#82d8ff',f:1.16,d:.92,g:1.08},
  'tempest-runner':{paletteId:'tempest-vector',primary:'#78efff',secondary:'#b8fbff',f:1.10,d:.90,g:.96},
  'storm-oracle':{paletteId:'storm-eye',primary:'#6ba8ff',secondary:'#b28cff',f:.98,d:1.08,g:1.04},
  'radiant-king':{paletteId:'radiant-crown',primary:'#fff0a8',secondary:'#ffd76c',f:1.04,d:1.12,g:1.10},
  'oath-guardian':{paletteId:'oath-bastion',primary:'#a8ffd2',secondary:'#fff6c8',f:.90,d:1.18,g:1.12},
  'light-pilgrim':{paletteId:'pilgrim-ray',primary:'#d6ffd8',secondary:'#b8ecff',f:1.00,d:1.02,g:.90},
};

export function finalFormAudioPalette(formId:HeroFinalFormId):FinalFormAudioPalette{
  const p=P[formId];
  return{formId,paletteId:p.paletteId,primary:p.primary,secondary:p.secondary,audio:{frequencyMultiplier:clamp(p.f,.88,1.16),durationMultiplier:clamp(p.d,.9,1.18),gainMultiplier:clamp(p.g,.9,1.12)}};
}

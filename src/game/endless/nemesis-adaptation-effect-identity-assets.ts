export const NEMESIS_ADAPTATION_EFFECT_IDENTITY_IDS = ['damage-resistance','dash-distance','summon-pressure','special-cadence','mirror-affinity'] as const;
export type NemesisAdaptationEffectIdentityId = typeof NEMESIS_ADAPTATION_EFFECT_IDENTITY_IDS[number];

export const NEMESIS_ADAPTATION_EFFECT_IDENTITY_ATLAS = {
  src:'./assets/ui/nemesis-adaptation-effect-icons.png', columns:3, rows:2, cellSize:96, width:288, height:192,
} as const;

const CELL:Readonly<Record<NemesisAdaptationEffectIdentityId,readonly [number,number]>>={
  'damage-resistance':[0,0], 'dash-distance':[1,0], 'summon-pressure':[2,0], 'special-cadence':[0,1], 'mirror-affinity':[1,1],
};
const LABEL:Readonly<Record<NemesisAdaptationEffectIdentityId,string>>={
  'damage-resistance':'보스 피해 저항', 'dash-distance':'대시 거리', 'summon-pressure':'소환 압박', 'special-cadence':'특수기 주기', 'mirror-affinity':'속성 반사 저항',
};
const ACCENT:Readonly<Record<NemesisAdaptationEffectIdentityId,string>>={
  'damage-resistance':'#76b9ff', 'dash-distance':'#b58cff', 'summon-pressure':'#ff8f78', 'special-cadence':'#ffd166', 'mirror-affinity':'#75f0d0',
};

export interface NemesisAdaptationEffectIdentityIcon {
  id:NemesisAdaptationEffectIdentityId; label:string; accent:string; sx:number; sy:number; sw:96; sh:96;
  animated:false; motionAmplitude:0; bossRecallHelperSupported:true; learningToastHelperSupported:true;
  maxVisibleHelperIcons:2; textFallbackPreserved:true; loadFailureBlocksGameplay:false;
}

export function nemesisAdaptationEffectIdentityIcon(id:NemesisAdaptationEffectIdentityId):NemesisAdaptationEffectIdentityIcon {
  const [column,row]=CELL[id];
  return {id,label:LABEL[id],accent:ACCENT[id],sx:column*96,sy:row*96,sw:96,sh:96,animated:false,motionAmplitude:0,bossRecallHelperSupported:true,learningToastHelperSupported:true,maxVisibleHelperIcons:2,textFallbackPreserved:true,loadFailureBlocksGameplay:false};
}

export function auditNemesisAdaptationEffectIdentityAtlas():{coverage:number;uniqueCellCount:number;outOfBounds:NemesisAdaptationEffectIdentityId[];passed:boolean}{
  const icons=NEMESIS_ADAPTATION_EFFECT_IDENTITY_IDS.map(nemesisAdaptationEffectIdentityIcon);
  const outOfBounds=icons.filter(icon=>icon.sx<0||icon.sy<0||icon.sx+icon.sw>NEMESIS_ADAPTATION_EFFECT_IDENTITY_ATLAS.width||icon.sy+icon.sh>NEMESIS_ADAPTATION_EFFECT_IDENTITY_ATLAS.height).map(icon=>icon.id);
  const uniqueCellCount=new Set(icons.map(icon=>`${icon.sx}:${icon.sy}`)).size;
  const coverage=icons.length/NEMESIS_ADAPTATION_EFFECT_IDENTITY_IDS.length;
  return {coverage,uniqueCellCount,outOfBounds,passed:coverage===1&&uniqueCellCount===5&&outOfBounds.length===0};
}

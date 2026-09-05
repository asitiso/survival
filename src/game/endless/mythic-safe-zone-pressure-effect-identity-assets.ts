export const MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS=['special-cadence','summon-pressure','dash-distance','boss-vulnerability'] as const;
export type MythicSafeZonePressureEffectIdentityId=typeof MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS[number];

export const MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_ATLAS={
  src:'./assets/ui/mythic-safe-zone-pressure-effect-icons.png',columns:2,rows:2,cellSize:96,width:192,height:192,
} as const;

const CELL:Readonly<Record<MythicSafeZonePressureEffectIdentityId,readonly [number,number]>>={
  'special-cadence':[0,0], 'summon-pressure':[1,0], 'dash-distance':[0,1], 'boss-vulnerability':[1,1],
};
const LABEL:Readonly<Record<MythicSafeZonePressureEffectIdentityId,string>>={
  'special-cadence':'특수기 주기','summon-pressure':'소환 압박','dash-distance':'돌진 거리','boss-vulnerability':'보스 피격량',
};
const ACCENT:Readonly<Record<MythicSafeZonePressureEffectIdentityId,string>>={
  'special-cadence':'#ffd166','summon-pressure':'#ff8f78','dash-distance':'#8fc7ff','boss-vulnerability':'#78ffd1',
};

export interface MythicSafeZonePressureEffectIdentityIcon{
  id:MythicSafeZonePressureEffectIdentityId;label:string;accent:string;sx:number;sy:number;sw:96;sh:96;
  animated:false;motionAmplitude:0;safeZoneHelperSupported:true;maxVisibleHelperIcons:2;textFallbackPreserved:true;loadFailureBlocksGameplay:false;
}

export function mythicSafeZonePressureEffectIdentityIcon(id:MythicSafeZonePressureEffectIdentityId):MythicSafeZonePressureEffectIdentityIcon{
  const [column,row]=CELL[id];
  return {id,label:LABEL[id],accent:ACCENT[id],sx:column*96,sy:row*96,sw:96,sh:96,animated:false,motionAmplitude:0,safeZoneHelperSupported:true,maxVisibleHelperIcons:2,textFallbackPreserved:true,loadFailureBlocksGameplay:false};
}

export function auditMythicSafeZonePressureEffectIdentityAtlas():{coverage:number;uniqueCellCount:number;outOfBounds:MythicSafeZonePressureEffectIdentityId[];passed:boolean}{
  const icons=MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS.map(mythicSafeZonePressureEffectIdentityIcon);
  const outOfBounds=icons.filter(icon=>icon.sx<0||icon.sy<0||icon.sx+icon.sw>MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_ATLAS.width||icon.sy+icon.sh>MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_ATLAS.height).map(icon=>icon.id);
  const uniqueCellCount=new Set(icons.map(icon=>`${icon.sx}:${icon.sy}`)).size;
  const coverage=icons.length/MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS.length;
  return {coverage,uniqueCellCount,outOfBounds,passed:coverage===1&&uniqueCellCount===4&&outOfBounds.length===0};
}

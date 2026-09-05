export const HERO_ASCENSION_MODIFIER_IDENTITY_IDS=['spell-power','cooldown','area','move-speed','hero-guard','core-guard','fusion-power','boss-damage'] as const;
export type HeroAscensionModifierIdentityId=typeof HERO_ASCENSION_MODIFIER_IDENTITY_IDS[number];
const CELL:Readonly<Record<HeroAscensionModifierIdentityId,readonly[number,number]>>={
  'spell-power':[0,0],cooldown:[1,0],area:[2,0],'move-speed':[3,0],
  'hero-guard':[0,1],'core-guard':[1,1],'fusion-power':[2,1],'boss-damage':[3,1],
};
const META:Readonly<Record<HeroAscensionModifierIdentityId,{label:string;accent:string}>>={
  'spell-power':{label:'마법 피해',accent:'#ff8a66'},cooldown:{label:'쿨타임',accent:'#75d9ff'},area:{label:'범위',accent:'#bd96ff'},'move-speed':{label:'이동속도',accent:'#7ff0c1'},
  'hero-guard':{label:'영웅 방어',accent:'#91b7ff'},'core-guard':{label:'수호핵 방어',accent:'#7ee7ee'},'fusion-power':{label:'융합 위력',accent:'#ffcb72'},'boss-damage':{label:'보스 피해',accent:'#ff718e'},
};
export interface HeroAscensionModifierIdentityIcon{id:HeroAscensionModifierIdentityId;label:string;accent:string;sx:number;sy:number;sw:96;sh:96;animated:false;motionAmplitude:0;textFallbackPreserved:true;loadFailureBlocksGameplay:false;}
export const HERO_ASCENSION_MODIFIER_IDENTITY_ATLAS={src:'./assets/ui/hero-ascension-modifier-icons.png',columns:4,rows:2,cellSize:96,width:384,height:192} as const;
const pct=(index:number,count:number)=>count<=1?0:(index/(count-1))*100;
export function heroAscensionModifierIdentityIcon(id:HeroAscensionModifierIdentityId):HeroAscensionModifierIdentityIcon{const[column,row]=CELL[id],meta=META[id];return{id,label:meta.label,accent:meta.accent,sx:column*96,sy:row*96,sw:96,sh:96,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};}
export function heroAscensionModifierIdentityStyle(id:HeroAscensionModifierIdentityId):string{const[column,row]=CELL[id];return`--secondary-icon-image:url('${HERO_ASCENSION_MODIFIER_IDENTITY_ATLAS.src}');--secondary-icon-bg-size:400% 200%;--secondary-icon-bg-position:${pct(column,4)}% ${pct(row,2)}%`;}
export function auditHeroAscensionModifierIdentityAtlas(){const icons=HERO_ASCENSION_MODIFIER_IDENTITY_IDS.map(heroAscensionModifierIdentityIcon),outOfBounds=icons.filter(icon=>icon.sx<0||icon.sy<0||icon.sx+icon.sw>HERO_ASCENSION_MODIFIER_IDENTITY_ATLAS.width||icon.sy+icon.sh>HERO_ASCENSION_MODIFIER_IDENTITY_ATLAS.height).map(icon=>icon.id),uniqueCellCount=new Set(icons.map(icon=>`${icon.sx}:${icon.sy}`)).size,coverage=icons.length/8;return{coverage,uniqueCellCount,outOfBounds,passed:coverage===1&&uniqueCellCount===8&&outOfBounds.length===0};}

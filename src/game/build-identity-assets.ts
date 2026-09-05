import type { RelicId } from './relics.js';
import type { FusionId } from './spell-fusions.js';

export const BUILD_IDENTITY_ATLAS = { src:'./assets/ui/build-identity-icons.png', columns:5, rows:4, cellSize:96, width:480, height:384 } as const;
export type BuildIdentityId = RelicId | FusionId;

const IDS:readonly BuildIdentityId[]=[
  'abyss-eye','chrono-shard','guardian-heart','ember-crown','winter-heart',
  'storm-core','oath-seal','inferno-heart','summoner-sigil','juggernaut-core',
  'phoenix-brand','zero-crystal','storm-crown','citadel-sigil','solar-detonation',
  'storm-crucible','frostfire-cataclysm','thunder-singularity','glacial-conduit','cataclysmic-domain',
] as const;
const CELL = new Map<BuildIdentityId,readonly [number,number]>(IDS.map((id,index)=>[id,[index%5,Math.floor(index/5)] as const]));

export interface BuildIdentityIcon { id:BuildIdentityId; atlasSrc:string; backgroundSize:string; backgroundPosition:string; sx:number; sy:number; sw:number; sh:number; animated:false; motionAmplitude:0; textFallbackPreserved:true; }
const pct=(n:number,total:number)=>total<=1?0:(n/(total-1))*100;
export function buildIdentityIcon(id:BuildIdentityId):BuildIdentityIcon{
  const cell=CELL.get(id); if(!cell)throw new Error(`Unknown build identity: ${id}`);
  const [column,row]=cell;
  return {id,atlasSrc:BUILD_IDENTITY_ATLAS.src,backgroundSize:'500% 400%',backgroundPosition:`${pct(column,5)}% ${pct(row,4)}%`,sx:column*96,sy:row*96,sw:96,sh:96,animated:false,motionAmplitude:0,textFallbackPreserved:true};
}
export function buildIdentityIconStyle(id:BuildIdentityId):string{const i=buildIdentityIcon(id);return `--build-icon-image:url('${i.atlasSrc}');--build-icon-bg-size:${i.backgroundSize};--build-icon-bg-position:${i.backgroundPosition}`;}
export function parseBuildIdentity(choiceId:string,kind?:string):BuildIdentityId|null{
  if(kind==='relic'||choiceId.startsWith('relic:')){const id=choiceId.replace(/^relic:/,'') as RelicId;return CELL.has(id)?id:null;}
  if(kind==='fusion'||choiceId.startsWith('fusion:')){const id=choiceId.replace(/^fusion:/,'') as FusionId;return CELL.has(id)?id:null;}
  return CELL.has(choiceId as BuildIdentityId)?choiceId as BuildIdentityId:null;
}
export function auditBuildIdentityAtlas(){const missing:string[]=[];const outOfBounds:string[]=[];const cells=new Set<string>();for(const id of IDS){const [c,r]=CELL.get(id)!;cells.add(`${c}:${r}`);if(c<0||r<0||c>=5||r>=4)outOfBounds.push(id);}return{itemCount:IDS.length,coverage:(IDS.length-missing.length)/IDS.length,uniqueCellCount:cells.size,missing,outOfBounds,assetSrc:BUILD_IDENTITY_ATLAS.src};}
export const BUILD_IDENTITY_IDS=IDS;

import type { BossEncounterNode } from './boss-encounters.js';

export const BOSS_WEAKPOINT_IDENTITY_KINDS: readonly BossEncounterNode['kind'][] = [
  'flamePylon','summonCore','armorPlate','curseAnchor','mawSigil','clockShard',
];

export const BOSS_WEAKPOINT_IDENTITY_ATLAS = {
  src: './assets/bosses/boss-weakpoint-icons.png',
  columns: 3,
  rows: 2,
  cellSize: 96,
  width: 288,
  height: 192,
} as const;

const CELL_BY_KIND: Readonly<Record<BossEncounterNode['kind'], readonly [column:number,row:number]>> = {
  flamePylon:[0,0], summonCore:[1,0], armorPlate:[2,0],
  curseAnchor:[0,1], mawSigil:[1,1], clockShard:[2,1],
};

export interface BossWeakpointIdentityIcon {
  kind: BossEncounterNode['kind'];
  sx:number; sy:number; sw:number; sh:number;
  animated:false;
  motionAmplitude:0;
  textFallbackPreserved:true;
  loadFailureBlocksGameplay:false;
}

export function bossWeakpointIdentityIcon(kind: BossEncounterNode['kind']): BossWeakpointIdentityIcon {
  const [column,row]=CELL_BY_KIND[kind];
  return {
    kind,
    sx:column*BOSS_WEAKPOINT_IDENTITY_ATLAS.cellSize,
    sy:row*BOSS_WEAKPOINT_IDENTITY_ATLAS.cellSize,
    sw:BOSS_WEAKPOINT_IDENTITY_ATLAS.cellSize,
    sh:BOSS_WEAKPOINT_IDENTITY_ATLAS.cellSize,
    animated:false,
    motionAmplitude:0,
    textFallbackPreserved:true,
    loadFailureBlocksGameplay:false,
  };
}

export interface BossWeakpointIdentityAtlasAudit {
  itemCount:number;
  coverage:number;
  uniqueCellCount:number;
  outOfBounds:BossEncounterNode['kind'][];
  passed:boolean;
}

export function auditBossWeakpointIdentityAtlas(): BossWeakpointIdentityAtlasAudit {
  const cells=new Set<string>();
  const outOfBounds:BossEncounterNode['kind'][]=[];
  for(const kind of BOSS_WEAKPOINT_IDENTITY_KINDS){
    const [column,row]=CELL_BY_KIND[kind];
    cells.add(`${column}:${row}`);
    if(column<0||row<0||column>=BOSS_WEAKPOINT_IDENTITY_ATLAS.columns||row>=BOSS_WEAKPOINT_IDENTITY_ATLAS.rows)outOfBounds.push(kind);
  }
  const coverage=BOSS_WEAKPOINT_IDENTITY_KINDS.length===6?1:BOSS_WEAKPOINT_IDENTITY_KINDS.length/6;
  return{itemCount:BOSS_WEAKPOINT_IDENTITY_KINDS.length,coverage,uniqueCellCount:cells.size,outOfBounds,passed:coverage===1&&cells.size===6&&outOfBounds.length===0};
}

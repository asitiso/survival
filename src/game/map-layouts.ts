export type MapId = 'ruinedGate' | 'frozenFen' | 'crystalQuarry';

export interface MapWall { x: number; y: number; w: number; h: number; }
export interface MapSlowPool { x: number; y: number; radius: number; slowFactor: number; }
export interface MapCrystal { x: number; y: number; threshold: number; blastRadius: number; blastDamage: number; }

export interface MapLayout {
  id: MapId;
  name: string;
  subtitle: string;
  palette: { center: string; mid: string; edge: string; grid: string; border: string; accent: string };
  walls: readonly MapWall[];
  pools: readonly MapSlowPool[];
  crystals: readonly MapCrystal[];
}

export const MAP_LAYOUTS: readonly MapLayout[] = [
  {
    id: 'ruinedGate', name: '폐허 관문', subtitle: '좁은 길목에 적을 몰아 광역 마법을 터뜨리세요.',
    palette: { center: '#17303b', mid: '#0d1b24', edge: '#060b11', grid: 'rgba(137,188,198,.11)', border: 'rgba(119,186,203,.34)', accent: '#7bc8d7' },
    walls: [
      { x: 365, y: 260, w: 250, h: 34 }, { x: 365, y: 585, w: 210, h: 34 },
      { x: 1010, y: 275, w: 34, h: 190 }, { x: 1000, y: 605, w: 270, h: 34 },
    ],
    pools: [{ x: 1215, y: 350, radius: 92, slowFactor: 0.68 }],
    crystals: [
      { x: 680, y: 205, threshold: 6, blastRadius: 180, blastDamage: 210 },
      { x: 1030, y: 710, threshold: 6, blastRadius: 180, blastDamage: 210 },
    ],
  },
  {
    id: 'frozenFen', name: '빙결 습지', subtitle: '넓은 둔화지대를 끼고 돌며 적 떼의 속도를 무너뜨리세요.',
    palette: { center: '#183947', mid: '#102934', edge: '#071118', grid: 'rgba(153,221,235,.12)', border: 'rgba(116,216,238,.36)', accent: '#9eeaff' },
    walls: [
      { x: 520, y: 350, w: 36, h: 210 }, { x: 1040, y: 420, w: 36, h: 210 },
    ],
    pools: [
      { x: 330, y: 560, radius: 128, slowFactor: 0.58 },
      { x: 790, y: 235, radius: 112, slowFactor: 0.56 },
      { x: 1260, y: 610, radius: 132, slowFactor: 0.58 },
    ],
    crystals: [{ x: 1320, y: 255, threshold: 7, blastRadius: 190, blastDamage: 225 }],
  },
  {
    id: 'crystalQuarry', name: '마력 채석장', subtitle: '충전이 빠른 수정 연쇄폭발로 수백 마리를 한 번에 정리하세요.',
    palette: { center: '#2a263e', mid: '#171727', edge: '#090912', grid: 'rgba(191,166,255,.10)', border: 'rgba(170,143,255,.34)', accent: '#c2a9ff' },
    walls: [
      { x: 440, y: 300, w: 150, h: 32 }, { x: 1010, y: 300, w: 150, h: 32 }, { x: 725, y: 650, w: 150, h: 32 },
    ],
    pools: [{ x: 800, y: 455, radius: 82, slowFactor: 0.72 }],
    crystals: [
      { x: 330, y: 235, threshold: 5, blastRadius: 175, blastDamage: 205 },
      { x: 1265, y: 245, threshold: 5, blastRadius: 175, blastDamage: 205 },
      { x: 360, y: 700, threshold: 5, blastRadius: 175, blastDamage: 205 },
      { x: 1240, y: 705, threshold: 5, blastRadius: 175, blastDamage: 205 },
    ],
  },
] as const;

export function selectMapLayout(random: () => number = Math.random): MapLayout {
  const r = Math.max(0, Math.min(0.999999, random()));
  return MAP_LAYOUTS[Math.floor(r * MAP_LAYOUTS.length)]!;
}

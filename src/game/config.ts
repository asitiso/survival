export const LOGICAL_WIDTH = 1600;
export const LOGICAL_HEIGHT = 900;
export const ARENA_MARGIN = 72;
export const ACTION_TOUCH_SCALE = 1.30;

export type ActionId = 'spell1' | 'spell2' | 'spell3' | 'spell4' | 'ultimate1' | 'ultimate2' | 'potion' | 'shop' | 'auto';

export interface ActionButtonLayout {
  id: ActionId;
  x: number;
  y: number;
  radius: number;
  label: string;
  key: string;
}

export const ACTION_BUTTONS: readonly ActionButtonLayout[] = [
  { id: 'spell1', x: 1188, y: 724, radius: 58, label: '화염', key: '1' },
  { id: 'spell2', x: 1308, y: 648, radius: 58, label: '연쇄', key: '2' },
  { id: 'spell3', x: 1314, y: 800, radius: 58, label: '서리', key: '3' },
  { id: 'spell4', x: 1438, y: 724, radius: 58, label: '장판', key: '4' },
  { id: 'ultimate1', x: 1480, y: 558, radius: 68, label: '메테오', key: 'Q' },
  { id: 'ultimate2', x: 1480, y: 828, radius: 66, label: '블랙홀', key: 'E' },
  { id: 'potion', x: 1080, y: 616, radius: 46, label: '물약', key: 'SPACE' },
  { id: 'shop', x: 1090, y: 510, radius: 46, label: '상점', key: 'B' },
  { id: 'auto', x: 1060, y: 724, radius: 44, label: 'AUTO', key: 'R' },
] as const;

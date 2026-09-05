export interface MasteryRunInput {
  seconds: number;
  bosses: number;
  threatLevel: number;
  kills: number;
}

export function masteryXpForRun(input: MasteryRunInput): number {
  const seconds = Math.max(0, Number.isFinite(input.seconds) ? input.seconds : 0);
  const bosses = Math.max(0, Number.isFinite(input.bosses) ? Math.floor(input.bosses) : 0);
  const threat = Math.max(0, Math.min(5, Number.isFinite(input.threatLevel) ? Math.floor(input.threatLevel) : 0));
  const kills = Math.max(0, Number.isFinite(input.kills) ? Math.floor(input.kills) : 0);

  const survival = Math.floor(seconds / 60) * 4;
  const boss = bosses * 18;
  const kill = Math.floor(kills / 180) * 2;
  const base = Math.max(12, survival + boss + kill);
  return Math.min(600, Math.floor(base * (1 + threat * 0.12)));
}

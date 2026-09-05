import { advanceSpawnLaneMemory, rememberSpawnLanePortal, SPAWN_LANE_MEMORY_SECONDS } from './spawn-lane-presentation-memory.js';
export function runSpawnLanePresentationMemoryAudit() {
    const samples = [];
    let passed = SPAWN_LANE_MEMORY_SECONDS > .72 && SPAWN_LANE_MEMORY_SECONDS < 2;
    for (let i = 0; i < 64; i++) {
        let mem = rememberSpawnLanePortal([], { pos: { x: 20 + i, y: 80 }, kind: i % 8 === 0 ? 'boss' : i % 5 === 0 ? 'elite' : 'regular', target: i % 2 ? 'hero' : 'core' });
        mem = advanceSpawnLaneMemory(mem, .4);
        const before = mem.length;
        mem = rememberSpawnLanePortal(mem, { pos: { x: 24 + i, y: 84 }, kind: i % 8 === 0 ? 'boss' : i % 5 === 0 ? 'elite' : 'regular', target: i % 2 ? 'hero' : 'core' });
        const ok = before === 1 && mem.length === 1 && mem[0].ttl === SPAWN_LANE_MEMORY_SECONDS;
        passed &&= ok;
        samples.push(`${i}:${mem[0].kind}:${mem[0].target}:${mem.length}`);
    }
    return { samples, actionCount: 9, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed };
}

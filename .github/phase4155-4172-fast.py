from pathlib import Path
import subprocess


def run(cmd, check=True):
    print(f"\n$ {cmd}", flush=True)
    p=subprocess.run(cmd, shell=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    print(p.stdout, end="")
    if check and p.returncode!=0:
        raise SystemExit(p.returncode)
    return p


def write(path, content):
    p=Path(path); p.parent.mkdir(parents=True, exist_ok=True); p.write_text(content.strip()+"\n")


def insert_import(path, marker, line):
    p=Path(path); t=p.read_text()
    if line in t: return
    if marker not in t: raise SystemExit(f"missing import marker {path}: {marker}")
    p.write_text(t.replace(marker, marker+"\n"+line, 1))


def insert_after(path, needle, text):
    p=Path(path); lines=p.read_text().splitlines(); key=text.split('=')[0].strip()
    if any(key and key in line for line in lines): return
    hits=[i for i,line in enumerate(lines) if needle in line and not line.lstrip().startswith('import ')]
    if len(hits)!=1: raise SystemExit(f"{path}: insert needle {needle!r} hits={len(hits)}")
    lines[hits[0]+1:hits[0]+1]=text.splitlines(); p.write_text("\n".join(lines)+"\n")


def replace_all(path, old, new, minimum=1):
    p=Path(path); t=p.read_text(); n=t.count(old)
    if n<minimum: raise SystemExit(f"{path}: fragment missing {old[:120]!r} count={n}")
    p.write_text(t.replace(old,new)); return n


def append_assignment_factor(path, line_needle, factor, require=None):
    p=Path(path); lines=p.read_text().splitlines()
    hits=[i for i,l in enumerate(lines) if line_needle in l and (require is None or require in l)]
    if len(hits)!=1: raise SystemExit(f"{path}: assignment needle {line_needle!r} hits={len(hits)}")
    i=hits[0]; line=lines[i]
    if factor.strip() in line: return
    stripped=line.rstrip()
    if not stripped.endswith(';'): raise SystemExit(f"{path}: assignment line does not end with semicolon: {line[:180]}")
    lines[i]=stripped[:-1]+factor+';'; p.write_text("\n".join(lines)+"\n")


def wrap_assignment_floor(path, line_needle, floor_expr):
    p=Path(path); lines=p.read_text().splitlines(); hits=[i for i,l in enumerate(lines) if line_needle in l]
    if len(hits)!=1: raise SystemExit(f"{path}: floor assignment needle {line_needle!r} hits={len(hits)}")
    i=hits[0]; line=lines[i]
    if floor_expr in line: return
    eq=line.find('=', line.find(line_needle))
    if eq<0 or not line.rstrip().endswith(';'): raise SystemExit(f"{path}: cannot wrap assignment: {line[:180]}")
    lhs=line[:eq+1]; rhs=line[eq+1:].rstrip()[:-1]
    lines[i]=lhs+f"Math.max({floor_expr},{rhs});"
    p.write_text("\n".join(lines)+"\n")


def extend_floor(path, line_needle, old_floor, new_floor):
    p=Path(path); t=p.read_text(); old=f"Math.max({old_floor},"; new=f"Math.max({old_floor},{new_floor},"
    hits=[line for line in t.splitlines() if line_needle in line]
    if len(hits)!=1: raise SystemExit(f"{path}: extend floor needle {line_needle!r} hits={len(hits)}")
    if new in t: return
    if old not in t: raise SystemExit(f"{path}: old floor missing {old}")
    p.write_text(t.replace(old,new,1))


def wrap_ctx_alpha_before_token(path, line_needle, token, floor_expr):
    p=Path(path); lines=p.read_text().splitlines(); hits=[i for i,l in enumerate(lines) if line_needle in l]
    if len(hits)!=1: raise SystemExit(f"{path}: ctx alpha needle {line_needle!r} hits={len(hits)}")
    i=hits[0]; line=lines[i]
    if floor_expr in line: return
    prefix='ctx.globalAlpha='
    start=line.find(prefix)
    if start<0: raise SystemExit(f"{path}: ctx.globalAlpha not found")
    start+=len(prefix); end=line.find(token,start)
    if end<0: raise SystemExit(f"{path}: token {token!r} absent")
    expr=line[start:end]
    lines[i]=line[:start]+f"Math.max({floor_expr},{expr})"+line[end:]
    p.write_text("\n".join(lines)+"\n")


def red(test_file, module_fragment):
    run('npm run build')
    p=run(f'node --test {test_file}', check=False)
    if p.returncode==0: raise SystemExit(f'RED unexpectedly passed: {test_file}')
    if module_fragment not in p.stdout and 'ERR_MODULE_NOT_FOUND' not in p.stdout and 'Cannot find module' not in p.stdout:
        raise SystemExit(f'RED failed for unexpected reason: {test_file}')


def commit(msg, module, test_file, related):
    run('npm run build')
    run('node --test '+ ' '.join([test_file]+related))
    run('git diff --check')
    run(f'git add src/game/enemies.ts src/game/spells.ts src/game/game.ts {module} {test_file}')
    dist=module.replace('src/','dist/').replace('.ts','.js')
    run(f'git add -f dist/game/enemies.js dist/game/spells.js dist/game/game.js {dist}')
    run(f'git commit -m {msg!r}')


baseline=['tests/phase4137-4142-canonical-reacquisition.test.mjs','tests/phase4143-4148-direction-reacquisition.test.mjs','tests/phase4149-4154-critical-reengagement.test.mjs']
run('npm run build')
run('node --test '+' '.join(baseline))

# Train 1 — Phase 4155-4160 effective alpha floors
m1='src/game/threat-impact-effective-alpha-floor-rendering.ts'
t1='tests/phase4155-4160-effective-alpha-floor.test.mjs'
write(t1, r"""
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const moduleUrl=new URL('../dist/game/threat-impact-effective-alpha-floor-rendering.js',import.meta.url);
async function load(){return import(moduleUrl.href+'?v='+Date.now());}
test('Phase 4155 compounded projectile alpha keeps a readable canonical body floor',async()=>{const {projectileEffectiveAlphaFloorPresentation}=await load();const p=projectileEffectiveAlphaFloorPresentation({critical:false,bossVisual:false,laneProximity:.8,reacquire:.15,crowd:1},false);assert.ok(p.bodyAlphaFloor>=.38);assert.ok(p.bodyAlphaFloor<=1);});
test('Phase 4156 impact edge floor survives compounded secondary suppression',async()=>{const {impactEffectiveAlphaFloorPresentation}=await load();const p=impactEffectiveAlphaFloorPresentation({critical:true,bossProximity:1,reacquire:.2,crowd:1},false);assert.ok(p.edgeAlphaFloor>=.45);assert.ok(p.directionAlphaFloor<=p.edgeAlphaFloor);});
test('Phase 4157 active hazard boundary keeps an effective alpha floor',async()=>{const {hazardEffectiveAlphaFloorPresentation}=await load();const p=hazardEffectiveAlphaFloorPresentation({telegraph:true,critical:true,laneProximity:.8,reacquire:.2},false);assert.ok(p.edgeAlphaFloor>=.5);assert.ok(p.edgeAlphaFloor<=1);});
test('Phase 4158 safe lane effective path remains readable under boss pressure',async()=>{const {safeLaneEffectiveAlphaFloorPresentation}=await load();const p=safeLaneEffectiveAlphaFloorPresentation({visible:true,confidence:.9,bossPressure:1,critical:true,reacquire:.2},false);assert.ok(p.pathAlphaFloor>=.72);assert.ok(p.pathAlphaFloor<=1);});
test('Phase 4159 specialist silhouette cannot collapse under stacked presentation multipliers',async()=>{const {specialistEffectiveAlphaFloorPresentation}=await load();const p=specialistEffectiveAlphaFloorPresentation({owner:'special',bossProximity:1,reacquire:.2,critical:true},false);assert.ok(p.silhouetteAlphaFloor>=.52);assert.ok(p.directionAlphaFloor>=.48);});
test('Phase 4160 effective floor budget never lifts decoration with the canonical floor',async()=>{const {effectiveAlphaFloorBudgetPresentation}=await load();const p=effectiveAlphaFloorBudgetPresentation({criticalCount:2,crowd:1,safeLaneVisible:true,bossActive:true},false);assert.equal(p.decorationLift,0);assert.ok(p.canonicalFloorScale>=1);assert.ok(p.safeLaneFloorScale>=1);});
test('Phase 4155-4160 live renderers apply final effective alpha floors',()=>{const e=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8'),s=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8'),g=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');assert.match(e,/projectileEffectiveAlphaFloorPresentation/);assert.match(e,/specialistEffectiveAlphaFloorPresentation/);assert.match(s,/impactEffectiveAlphaFloorPresentation/);assert.match(g,/hazardEffectiveAlphaFloorPresentation/);assert.match(g,/safeLaneEffectiveAlphaFloorPresentation/);assert.match(e,/Math\.max\(projectileEffectiveFloor\.bodyAlphaFloor/);});
""")
red(t1,'threat-impact-effective-alpha-floor-rendering')
write(m1, r"""
const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
export function projectileEffectiveAlphaFloorPresentation(input:{critical:boolean;bossVisual:boolean;laneProximity:number;reacquire:number;crowd:number},reducedFlash=false){const lane=clamp01(input.laneProximity),reacquire=clamp01(input.reacquire),crowd=clamp01(input.crowd),base=input.bossVisual?(input.critical?.26:.2):(input.critical?.58:.34+lane*.08),settle=(1-reacquire)*.035+crowd*.025,flash=reducedFlash?.97:1;return{bodyAlphaFloor:clamp01((base+settle)*flash),directionAlphaFloor:clamp01((input.critical?.5:.34+lane*.08+crowd*.03)*flash),presentationOnly:true as const};}
export function impactEffectiveAlphaFloorPresentation(input:{critical:boolean;bossProximity:number;reacquire:number;crowd:number},reducedFlash=false){const boss=clamp01(input.bossProximity),reacquire=clamp01(input.reacquire),crowd=clamp01(input.crowd),flash=reducedFlash?.94:1,edge=clamp01(((input.critical?.42:.26)+boss*.08+crowd*.035+(1-reacquire)*.025)*flash);return{edgeAlphaFloor:edge,directionAlphaFloor:Math.min(edge,clamp01(((input.critical?.34:.22)+boss*.07+crowd*.025)*flash)),presentationOnly:true as const};}
export function hazardEffectiveAlphaFloorPresentation(input:{telegraph:boolean;critical:boolean;laneProximity:number;reacquire:number},reducedFlash=false){const lane=clamp01(input.laneProximity),reacquire=clamp01(input.reacquire),flash=reducedFlash?.94:1,base=input.telegraph?(input.critical?.5:.43):(input.critical?.34:.24);return{edgeAlphaFloor:clamp01((base+lane*.05+(1-reacquire)*.025)*flash),presentationOnly:true as const};}
export function safeLaneEffectiveAlphaFloorPresentation(input:{visible:boolean;confidence:number;bossPressure:number;critical:boolean;reacquire:number},reducedFlash=false){if(!input.visible)return{pathAlphaFloor:0,presentationOnly:true as const};const confidence=clamp01(input.confidence),pressure=clamp01(input.bossPressure),reacquire=clamp01(input.reacquire),flash=reducedFlash?.96:1;return{pathAlphaFloor:clamp01((.56+confidence*.14+pressure*.05+(input.critical?.06:0)+(1-reacquire)*.02)*flash),presentationOnly:true as const};}
export function specialistEffectiveAlphaFloorPresentation(input:{owner:'locomotion'|'attack'|'recovery'|'hit'|'special';bossProximity:number;reacquire:number;critical:boolean},reducedMotion=false){const boss=clamp01(input.bossProximity),reacquire=clamp01(input.reacquire),action=input.owner==='special'?1:input.owner==='attack'?.85:input.owner==='hit'?.72:input.owner==='recovery'?.45:.18,compact=reducedMotion?.98:1;return{silhouetteAlphaFloor:clamp01(((input.critical?.48:.34)+action*.08+boss*.035+(1-reacquire)*.02)*compact),directionAlphaFloor:clamp01(((input.critical?.45:.32)+action*.07+boss*.03)*compact),presentationOnly:true as const};}
export function effectiveAlphaFloorBudgetPresentation(input:{criticalCount:number;crowd:number;safeLaneVisible:boolean;bossActive:boolean},reducedFlash=false){const critical=clamp01(Math.max(0,input.criticalCount)/3),crowd=clamp01(input.crowd),stress=clamp01(crowd*.78+critical*.22),flash=reducedFlash?.98:1;return{stress,canonicalFloorScale:1+stress*(input.bossActive?.035:.02)*flash,safeLaneFloorScale:input.safeLaneVisible?1+stress*.04*flash:1,decorationLift:0,presentationOnly:true as const};}
""")
insert_import('src/game/enemies.ts',"import { bossProjectileReengagementLockPresentation, criticalReengagementBudgetPresentation, specialistBossReengagementLockPresentation } from './threat-impact-critical-reengagement-rendering.js';","import { effectiveAlphaFloorBudgetPresentation, projectileEffectiveAlphaFloorPresentation, specialistEffectiveAlphaFloorPresentation } from './threat-impact-effective-alpha-floor-rendering.js';")
insert_import('src/game/spells.ts',"import { bossImpactReengagementLockPresentation, criticalReengagementBudgetPresentation } from './threat-impact-critical-reengagement-rendering.js';","import { effectiveAlphaFloorBudgetPresentation, impactEffectiveAlphaFloorPresentation } from './threat-impact-effective-alpha-floor-rendering.js';")
insert_import('src/game/game.ts',"import { bossTelegraphReengagementLockPresentation, criticalReengagementBudgetPresentation, safeLaneCriticalReengagementLockPresentation } from './threat-impact-critical-reengagement-rendering.js';","import { effectiveAlphaFloorBudgetPresentation, hazardEffectiveAlphaFloorPresentation, safeLaneEffectiveAlphaFloorPresentation } from './threat-impact-effective-alpha-floor-rendering.js';")
insert_after('src/game/enemies.ts','const hasBossVisual = Boolean(projectile.bossArchetype',"      const projectileEffectiveFloor=projectileEffectiveAlphaFloorPresentation({critical:Boolean(projectile.bossArchetype),bossVisual:hasBossVisual,laneProximity:projectileLaneProximity,reacquire:projectileCanonicalReacquisition.reacquire,crowd:Math.min(1,this.projectiles.length/12)},reducedFlash),projectileEffectiveFloorBudget=effectiveAlphaFloorBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,crowd:Math.min(1,this.projectiles.length/12),safeLaneVisible:projectileLaneProximity>0,bossActive:Boolean(projectile.bossArchetype)},reducedFlash);")
wrap_assignment_floor('src/game/enemies.ts','ctx.globalAlpha = (hasBossVisual ? 0.28 : 1)','projectileEffectiveFloor.bodyAlphaFloor*projectileEffectiveFloorBudget.canonicalFloorScale')
insert_after('src/game/enemies.ts','const specialistCriticalReengagement=',"      const specialistEffectiveFloor=specialistEffectiveAlphaFloorPresentation({owner:silhouetteDirection.owner,bossProximity:specialistBossProximity,reacquire:specialistCanonicalReacquisition.reacquire,critical:silhouetteDirection.owner==='special'},reducedMotion),specialistEffectiveFloorBudget=effectiveAlphaFloorBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,crowd:Math.min(1,(this.projectiles.length+activeSpecialistCount)/10),safeLaneVisible:false,bossActive:specialistBossProximity>0},reducedFlash);")
wrap_assignment_floor('src/game/enemies.ts','const specialistSilhouetteAlphaScale=','specialistEffectiveFloor.silhouetteAlphaFloor*specialistEffectiveFloorBudget.canonicalFloorScale')
insert_after('src/game/spells.ts','const impactCriticalReengagement=',"        const impactEffectiveFloor=impactEffectiveAlphaFloorPresentation({critical:impactCritical,bossProximity:bossTelegraphOverlap?1:0,reacquire:impactCanonicalReacquisition.reacquire,crowd:Math.min(1,impactNeighborCount/8)},reducedFlash),impactEffectiveFloorBudget=effectiveAlphaFloorBudgetPresentation({criticalCount:impactCritical?1:0,crowd:Math.min(1,impactNeighborCount/8),safeLaneVisible:false,bossActive:bossTelegraphOverlap},reducedFlash);")
wrap_ctx_alpha_before_token('src/game/spells.ts','ctx.save();ctx.globalAlpha=.38*arrivalContinuity.edgeAlphaScale',';ctx.strokeStyle','impactEffectiveFloor.edgeAlphaFloor*impactEffectiveFloorBudget.canonicalFloorScale')
insert_after('src/game/game.ts','const safeLaneCriticalReengagement=',"      const safeLaneEffectiveFloor=safeLaneEffectiveAlphaFloorPresentation({visible:true,confidence:safeLane.confidence,bossPressure:safeLaneDenseBattlefield.stress,critical:this.dangerState.coreCritical||this.dangerState.heroCritical,reacquire:safeLaneReclaim.release},this.presentationSettings.reducedFlash),safeLaneEffectiveFloorBudget=effectiveAlphaFloorBudgetPresentation({criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),crowd:safeLaneDenseBattlefield.stress,safeLaneVisible:true,bossActive:Boolean(boss)},this.presentationSettings.reducedFlash);")
insert_after('src/game/game.ts','const hazardCriticalReengagement=',"      const hazardEffectiveFloor=hazardEffectiveAlphaFloorPresentation({telegraph:hazard.telegraph>0,critical:hazard.id===primaryTelegraphHazardId,laneProximity:safeLane?Math.max(0,1-distance(hazard.pos,safeLane.current)/Math.max(1,hazard.radius+90)):0,reacquire:hazardCanonicalReacquisition.reacquire},this.presentationSettings.reducedFlash),hazardEffectiveFloorBudget=effectiveAlphaFloorBudgetPresentation({criticalCount:hazard.id===primaryTelegraphHazardId?1:0,crowd:Math.min(1,this.bossArena.hazards.length/6),safeLaneVisible:Boolean(safeLane),bossActive:Boolean(boss)},this.presentationSettings.reducedFlash);")
wrap_assignment_floor('src/game/game.ts','const safeLaneBaseAlpha=','safeLaneEffectiveFloor.pathAlphaFloor*safeLaneEffectiveFloorBudget.safeLaneFloorScale')
wrap_assignment_floor('src/game/game.ts','const hazardFillAlpha=','hazardEffectiveFloor.edgeAlphaFloor*hazardEffectiveFloorBudget.canonicalFloorScale')
commit('Phase 4155-4160 effective battlefield alpha floors',m1,t1,baseline)

# Train 2 — Phase 4161-4166 secondary ceiling attenuation
m2='src/game/threat-impact-secondary-ceiling-rendering.ts'
t2='tests/phase4161-4166-secondary-ceiling.test.mjs'
write(t2, r"""
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const moduleUrl=new URL('../dist/game/threat-impact-secondary-ceiling-rendering.js',import.meta.url);
async function load(){return import(moduleUrl.href+'?v='+Date.now());}
test('Phase 4161 projectile trail ceiling tightens as battlefield stress rises',async()=>{const {projectileSecondaryCeilingPresentation}=await load();const low=projectileSecondaryCeilingPresentation({stress:.1,critical:false,bossActive:false,reacquire:.8},false,false),high=projectileSecondaryCeilingPresentation({stress:1,critical:false,bossActive:true,reacquire:.2},false,false);assert.ok(high.trailScale<low.trailScale);assert.ok(high.trailScale>=.45);});
test('Phase 4162 impact fill yields before the protected impact edge',async()=>{const {impactSecondaryCeilingPresentation}=await load();const p=impactSecondaryCeilingPresentation({stress:1,critical:true,bossActive:true,reacquire:.2},false);assert.ok(p.fillScale<1);assert.equal(p.edgeScale,1);});
test('Phase 4163 hazard interior yields while danger boundary remains canonical',async()=>{const {hazardSecondaryCeilingPresentation}=await load();const p=hazardSecondaryCeilingPresentation({stress:1,telegraph:true,critical:true,reacquire:.2},false);assert.ok(p.fillScale<.8);assert.equal(p.edgeScale,1);});
test('Phase 4164 specialist recovery trail yields before silhouette ownership',async()=>{const {specialistSecondaryCeilingPresentation}=await load();const p=specialistSecondaryCeilingPresentation({stress:1,owner:'special',critical:true,reacquire:.2},false);assert.ok(p.trailScale<1);assert.equal(p.silhouetteScale,1);});
test('Phase 4165 stale boss decoration receives a bounded ceiling without touching telegraph edge',async()=>{const {bossSecondaryCeilingPresentation}=await load();const p=bossSecondaryCeilingPresentation({stress:1,critical:true,reacquire:.2},false);assert.ok(p.staleScale<.75);assert.equal(p.telegraphScale,1);});
test('Phase 4166 secondary ceiling budget is monotonic and never boosts decoration',async()=>{const {secondaryCeilingBudgetPresentation}=await load();const a=secondaryCeilingBudgetPresentation({criticalCount:0,crowd:.2,bossActive:false},false,false),b=secondaryCeilingBudgetPresentation({criticalCount:2,crowd:1,bossActive:true},false,false);assert.ok(b.secondaryScale<=a.secondaryScale);assert.ok(b.secondaryScale<=1);assert.ok(b.secondaryScale>=.45);});
test('Phase 4161-4166 live renderers consume final secondary ceilings',()=>{const e=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8'),s=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8'),g=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');assert.match(e,/projectileSecondaryCeilingPresentation/);assert.match(e,/specialistSecondaryCeilingPresentation/);assert.match(s,/impactSecondaryCeilingPresentation/);assert.match(g,/hazardSecondaryCeilingPresentation/);assert.match(g,/bossSecondaryCeilingPresentation/);});
""")
red(t2,'threat-impact-secondary-ceiling-rendering')
write(m2, r"""
const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
export function projectileSecondaryCeilingPresentation(input:{stress:number;critical:boolean;bossActive:boolean;reacquire:number},reducedMotion=false,reducedFlash=false){const stress=clamp01(input.stress),reacquire=clamp01(input.reacquire),weight=clamp01(stress*.82+(1-reacquire)*.18+(input.bossActive?.08:0));return{trailScale:Math.max(input.critical?.62:.48,1-weight*(input.critical?.24:.42))*(reducedMotion?.96:1),staleScale:Math.max(.44,1-weight*.48)*(reducedFlash?.95:1),canonicalScale:1,presentationOnly:true as const};}
export function impactSecondaryCeilingPresentation(input:{stress:number;critical:boolean;bossActive:boolean;reacquire:number},reducedFlash=false){const stress=clamp01(input.stress),reacquire=clamp01(input.reacquire),weight=clamp01(stress*.8+(1-reacquire)*.2+(input.bossActive?.08:0));return{fillScale:Math.max(input.critical?.5:.4,1-weight*(input.critical?.38:.52))*(reducedFlash?.93:1),edgeScale:1,presentationOnly:true as const};}
export function hazardSecondaryCeilingPresentation(input:{stress:number;telegraph:boolean;critical:boolean;reacquire:number},reducedFlash=false){const stress=clamp01(input.stress),reacquire=clamp01(input.reacquire),weight=clamp01(stress*.82+(1-reacquire)*.18);return{fillScale:Math.max(input.critical?.46:.36,1-weight*(input.telegraph?.5:.38))*(reducedFlash?.93:1),edgeScale:1,presentationOnly:true as const};}
export function specialistSecondaryCeilingPresentation(input:{stress:number;owner:'locomotion'|'attack'|'recovery'|'hit'|'special';critical:boolean;reacquire:number},reducedMotion=false){const stress=clamp01(input.stress),reacquire=clamp01(input.reacquire),action=input.owner==='special'||input.owner==='attack',weight=clamp01(stress*.8+(1-reacquire)*.2);return{trailScale:Math.max(input.critical?.58:action?.5:.42,1-weight*(input.critical?.3:.46))*(reducedMotion?.95:1),silhouetteScale:1,presentationOnly:true as const};}
export function bossSecondaryCeilingPresentation(input:{stress:number;critical:boolean;reacquire:number},reducedFlash=false){const stress=clamp01(input.stress),reacquire=clamp01(input.reacquire),weight=clamp01(stress*.82+(1-reacquire)*.18);return{staleScale:Math.max(input.critical?.52:.42,1-weight*.5)*(reducedFlash?.94:1),telegraphScale:1,presentationOnly:true as const};}
export function secondaryCeilingBudgetPresentation(input:{criticalCount:number;crowd:number;bossActive:boolean},reducedMotion=false,reducedFlash=false){const critical=clamp01(Math.max(0,input.criticalCount)/3),crowd=clamp01(input.crowd),stress=clamp01(crowd*.8+critical*.2+(input.bossActive?.06:0));return{stress,secondaryScale:Math.max(.45,1-stress*.42)*(reducedMotion?.97:1)*(reducedFlash?.96:1),canonicalScale:1,presentationOnly:true as const};}
""")
insert_import('src/game/enemies.ts',"import { effectiveAlphaFloorBudgetPresentation, projectileEffectiveAlphaFloorPresentation, specialistEffectiveAlphaFloorPresentation } from './threat-impact-effective-alpha-floor-rendering.js';","import { projectileSecondaryCeilingPresentation, secondaryCeilingBudgetPresentation, specialistSecondaryCeilingPresentation } from './threat-impact-secondary-ceiling-rendering.js';")
insert_import('src/game/spells.ts',"import { effectiveAlphaFloorBudgetPresentation, impactEffectiveAlphaFloorPresentation } from './threat-impact-effective-alpha-floor-rendering.js';","import { impactSecondaryCeilingPresentation, secondaryCeilingBudgetPresentation } from './threat-impact-secondary-ceiling-rendering.js';")
insert_import('src/game/game.ts',"import { effectiveAlphaFloorBudgetPresentation, hazardEffectiveAlphaFloorPresentation, safeLaneEffectiveAlphaFloorPresentation } from './threat-impact-effective-alpha-floor-rendering.js';","import { bossSecondaryCeilingPresentation, hazardSecondaryCeilingPresentation, secondaryCeilingBudgetPresentation } from './threat-impact-secondary-ceiling-rendering.js';")
insert_after('src/game/enemies.ts','const projectileCriticalReengagement=',"      const projectileSecondaryCeiling=projectileSecondaryCeilingPresentation({stress:Math.max(projectileDenseBattlefield.stress,projectileCriticalReengagement.lock),critical:Boolean(projectile.bossArchetype),bossActive:Boolean(projectile.bossArchetype),reacquire:projectileCanonicalReacquisition.reacquire},reducedMotion,reducedFlash),projectileSecondaryCeilingBudget=secondaryCeilingBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,crowd:Math.min(1,this.projectiles.length/12),bossActive:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash);")
replace_all('src/game/enemies.ts','*projectileCriticalReengagement.trailScale*projectileCriticalReengagementBudget.secondaryScale','*projectileCriticalReengagement.trailScale*projectileCriticalReengagementBudget.secondaryScale*projectileSecondaryCeiling.trailScale*projectileSecondaryCeilingBudget.secondaryScale')
insert_after('src/game/enemies.ts','const specialistCriticalReengagement=',"      const specialistSecondaryCeiling=specialistSecondaryCeilingPresentation({stress:Math.max(specialistDenseBattlefield.stress,specialistCriticalReengagement.lock),owner:silhouetteDirection.owner,critical:silhouetteDirection.owner==='special',reacquire:specialistCanonicalReacquisition.reacquire},reducedMotion),specialistSecondaryCeilingBudget=secondaryCeilingBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,crowd:Math.min(1,(this.projectiles.length+activeSpecialistCount)/10),bossActive:specialistBossProximity>0},reducedMotion,reducedFlash);")
replace_all('src/game/enemies.ts','*specialistCriticalReengagement.secondaryScale*specialistCriticalReengagementBudget.secondaryScale;','*specialistCriticalReengagement.secondaryScale*specialistCriticalReengagementBudget.secondaryScale*specialistSecondaryCeiling.trailScale*specialistSecondaryCeilingBudget.secondaryScale;')
insert_after('src/game/spells.ts','const impactCriticalReengagement=',"        const impactSecondaryCeiling=impactSecondaryCeilingPresentation({stress:Math.max(impactDenseBattlefield.stress,impactCriticalReengagement.lock),critical:impactCritical,bossActive:bossTelegraphOverlap,reacquire:impactCanonicalReacquisition.reacquire},reducedFlash),impactSecondaryCeilingBudget=secondaryCeilingBudgetPresentation({criticalCount:impactCritical?1:0,crowd:Math.min(1,impactNeighborCount/8),bossActive:bossTelegraphOverlap},reducedMotion,reducedFlash);")
append_assignment_factor('src/game/spells.ts','ctx.save(); ctx.globalAlpha = Math.max(0, 1 - progress)',' * impactSecondaryCeiling.fillScale * impactSecondaryCeilingBudget.secondaryScale',require='impactDenseArbitration.fillAlphaScale')
insert_after('src/game/game.ts','const hazardCriticalReengagement=',"      const hazardSecondaryCeiling=hazardSecondaryCeilingPresentation({stress:Math.max(hazardDenseBattlefield.stress,hazardCriticalReengagement.lock),telegraph:hazard.telegraph>0,critical:hazard.id===primaryTelegraphHazardId,reacquire:hazardCanonicalReacquisition.reacquire},this.presentationSettings.reducedFlash),hazardSecondaryCeilingBudget=secondaryCeilingBudgetPresentation({criticalCount:hazard.id===primaryTelegraphHazardId?1:0,crowd:Math.min(1,this.bossArena.hazards.length/6),bossActive:Boolean(boss)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),hazardBossSecondaryCeiling=bossSecondaryCeilingPresentation({stress:Math.max(hazardDenseBattlefield.stress,hazardCriticalReengagement.lock),critical:hazard.id===primaryTelegraphHazardId,reacquire:hazardCanonicalReacquisition.reacquire},this.presentationSettings.reducedFlash);")
replace_all('src/game/game.ts','*hazardCriticalReengagement.staleDecorationScale*hazardCriticalReengagementBudget.secondaryScale,','*hazardCriticalReengagement.staleDecorationScale*hazardCriticalReengagementBudget.secondaryScale*hazardSecondaryCeiling.fillScale*hazardSecondaryCeilingBudget.secondaryScale*hazardBossSecondaryCeiling.staleScale,')
commit('Phase 4161-4166 secondary battlefield ceiling attenuation',m2,t2,baseline+[t1])

# Train 3 — Phase 4167-4172 readability contrast coherence
m3='src/game/threat-impact-readability-contrast-rendering.ts'
t3='tests/phase4167-4172-readability-contrast.test.mjs'
write(t3, r"""
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const moduleUrl=new URL('../dist/game/threat-impact-readability-contrast-rendering.js',import.meta.url);
async function load(){return import(moduleUrl.href+'?v='+Date.now());}
test('Phase 4167 projectile body and trail maintain a minimum readability contrast gap',async()=>{const {projectileReadabilityContrastPresentation}=await load();const p=projectileReadabilityContrastPresentation({bodyFloor:.4,trailScale:.7,critical:false,bossActive:false,crowd:1},false);assert.ok(p.bodyAlphaFloor>=.4);assert.ok(p.trailScale<=.7);assert.ok(p.minimumGap>=.12);});
test('Phase 4168 impact edge remains decisively stronger than interior decoration',async()=>{const {impactReadabilityContrastPresentation}=await load();const p=impactReadabilityContrastPresentation({edgeFloor:.45,fillScale:.6,critical:true,bossActive:true,crowd:1},false);assert.ok(p.edgeAlphaFloor>=.45);assert.ok(p.fillScale<=.6);assert.ok(p.minimumGap>=.14);});
test('Phase 4169 hazard boundary contrast increases without raising hazard interior',async()=>{const {hazardReadabilityContrastPresentation}=await load();const p=hazardReadabilityContrastPresentation({edgeFloor:.5,fillScale:.6,telegraph:true,critical:true,crowd:1},false);assert.ok(p.edgeAlphaFloor>=.5);assert.ok(p.fillScale<=.6);});
test('Phase 4170 safe lane path contrast is protected during critical boss pressure',async()=>{const {safeLaneReadabilityContrastPresentation}=await load();const p=safeLaneReadabilityContrastPresentation({pathFloor:.72,confidence:.9,critical:true,bossActive:true,crowd:1},false);assert.ok(p.pathAlphaFloor>=.72);assert.ok(p.decorativeScale<1);});
test('Phase 4171 specialist silhouette and recovery trail retain a stable contrast gap',async()=>{const {specialistReadabilityContrastPresentation}=await load();const p=specialistReadabilityContrastPresentation({silhouetteFloor:.52,trailScale:.65,owner:'special',critical:true,crowd:1},false);assert.ok(p.silhouetteAlphaFloor>=.52);assert.ok(p.trailScale<=.65);assert.ok(p.minimumGap>=.12);});
test('Phase 4172 contrast budget preserves primary layers and tightens only secondary layers',async()=>{const {readabilityContrastBudgetPresentation}=await load();const p=readabilityContrastBudgetPresentation({criticalCount:2,crowd:1,bossActive:true,safeLaneVisible:true},false,false);assert.equal(p.primaryScale,1);assert.ok(p.secondaryScale<1);assert.ok(p.safeLaneScale>=1);});
test('Phase 4167-4172 live renderers compose floor and ceiling into final contrast',()=>{const e=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8'),s=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8'),g=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');assert.match(e,/projectileReadabilityContrastPresentation/);assert.match(e,/specialistReadabilityContrastPresentation/);assert.match(s,/impactReadabilityContrastPresentation/);assert.match(g,/hazardReadabilityContrastPresentation/);assert.match(g,/safeLaneReadabilityContrastPresentation/);});
""")
red(t3,'threat-impact-readability-contrast-rendering')
write(m3, r"""
const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
export function projectileReadabilityContrastPresentation(input:{bodyFloor:number;trailScale:number;critical:boolean;bossActive:boolean;crowd:number},reducedFlash=false){const crowd=clamp01(input.crowd),gap=(input.critical?.18:.12)+(input.bossActive?.03:0)+crowd*.02,body=clamp01(Math.max(input.bodyFloor,(input.critical?.58:.4)+crowd*.025)*(reducedFlash?.98:1));return{bodyAlphaFloor:body,trailScale:Math.min(clamp01(input.trailScale),Math.max(.42,1-gap-crowd*.12)),minimumGap:gap,presentationOnly:true as const};}
export function impactReadabilityContrastPresentation(input:{edgeFloor:number;fillScale:number;critical:boolean;bossActive:boolean;crowd:number},reducedFlash=false){const crowd=clamp01(input.crowd),gap=(input.critical?.16:.12)+(input.bossActive?.03:0)+crowd*.02,edge=clamp01(Math.max(input.edgeFloor,(input.critical?.45:.3)+crowd*.03)*(reducedFlash?.97:1));return{edgeAlphaFloor:edge,fillScale:Math.min(clamp01(input.fillScale),Math.max(.38,1-gap-crowd*.14)),minimumGap:gap,presentationOnly:true as const};}
export function hazardReadabilityContrastPresentation(input:{edgeFloor:number;fillScale:number;telegraph:boolean;critical:boolean;crowd:number},reducedFlash=false){const crowd=clamp01(input.crowd),gap=(input.telegraph?.15:.1)+(input.critical?.04:0)+crowd*.02,edge=clamp01(Math.max(input.edgeFloor,(input.telegraph?.48:.3)+(input.critical?.04:0))*(reducedFlash?.97:1));return{edgeAlphaFloor:edge,fillScale:Math.min(clamp01(input.fillScale),Math.max(.36,1-gap-crowd*.16)),minimumGap:gap,presentationOnly:true as const};}
export function safeLaneReadabilityContrastPresentation(input:{pathFloor:number;confidence:number;critical:boolean;bossActive:boolean;crowd:number},reducedFlash=false){const confidence=clamp01(input.confidence),crowd=clamp01(input.crowd),path=clamp01(Math.max(input.pathFloor,.58+confidence*.14+(input.critical?.06:0)+(input.bossActive?.03:0))*(reducedFlash?.98:1));return{pathAlphaFloor:path,decorativeScale:Math.max(.5,1-crowd*.32-(input.critical?.08:0)),presentationOnly:true as const};}
export function specialistReadabilityContrastPresentation(input:{silhouetteFloor:number;trailScale:number;owner:'locomotion'|'attack'|'recovery'|'hit'|'special';critical:boolean;crowd:number},reducedMotion=false){const crowd=clamp01(input.crowd),action=input.owner==='special'||input.owner==='attack',gap=(input.critical?.16:action?.14:.12)+crowd*.02,body=clamp01(Math.max(input.silhouetteFloor,(input.critical?.5:action?.43:.36)+crowd*.02));return{silhouetteAlphaFloor:body,trailScale:Math.min(clamp01(input.trailScale),Math.max(.4,1-gap-crowd*.14))*(reducedMotion?.97:1),minimumGap:gap,presentationOnly:true as const};}
export function readabilityContrastBudgetPresentation(input:{criticalCount:number;crowd:number;bossActive:boolean;safeLaneVisible:boolean},reducedMotion=false,reducedFlash=false){const critical=clamp01(Math.max(0,input.criticalCount)/3),crowd=clamp01(input.crowd),stress=clamp01(crowd*.78+critical*.22+(input.bossActive?.05:0));return{stress,primaryScale:1,secondaryScale:Math.max(.46,1-stress*.4)*(reducedMotion?.97:1)*(reducedFlash?.96:1),safeLaneScale:input.safeLaneVisible?1+stress*.035*(reducedFlash?.9:1):1,presentationOnly:true as const};}
""")
insert_import('src/game/enemies.ts',"import { projectileSecondaryCeilingPresentation, secondaryCeilingBudgetPresentation, specialistSecondaryCeilingPresentation } from './threat-impact-secondary-ceiling-rendering.js';","import { projectileReadabilityContrastPresentation, readabilityContrastBudgetPresentation, specialistReadabilityContrastPresentation } from './threat-impact-readability-contrast-rendering.js';")
insert_import('src/game/spells.ts',"import { impactSecondaryCeilingPresentation, secondaryCeilingBudgetPresentation } from './threat-impact-secondary-ceiling-rendering.js';","import { impactReadabilityContrastPresentation, readabilityContrastBudgetPresentation } from './threat-impact-readability-contrast-rendering.js';")
insert_import('src/game/game.ts',"import { bossSecondaryCeilingPresentation, hazardSecondaryCeilingPresentation, secondaryCeilingBudgetPresentation } from './threat-impact-secondary-ceiling-rendering.js';","import { hazardReadabilityContrastPresentation, readabilityContrastBudgetPresentation, safeLaneReadabilityContrastPresentation } from './threat-impact-readability-contrast-rendering.js';")
insert_after('src/game/enemies.ts','const projectileSecondaryCeiling=',"      const projectileReadabilityContrast=projectileReadabilityContrastPresentation({bodyFloor:projectileEffectiveFloor.bodyAlphaFloor,trailScale:projectileSecondaryCeiling.trailScale,critical:Boolean(projectile.bossArchetype),bossActive:Boolean(projectile.bossArchetype),crowd:Math.min(1,this.projectiles.length/12)},reducedFlash),projectileReadabilityContrastBudget=readabilityContrastBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,crowd:Math.min(1,this.projectiles.length/12),bossActive:Boolean(projectile.bossArchetype),safeLaneVisible:projectileLaneProximity>0},reducedMotion,reducedFlash);")
extend_floor('src/game/enemies.ts','ctx.globalAlpha = Math.max(projectileEffectiveFloor.bodyAlphaFloor','projectileEffectiveFloor.bodyAlphaFloor*projectileEffectiveFloorBudget.canonicalFloorScale','projectileReadabilityContrast.bodyAlphaFloor*projectileReadabilityContrastBudget.primaryScale')
replace_all('src/game/enemies.ts','*projectileSecondaryCeiling.trailScale*projectileSecondaryCeilingBudget.secondaryScale','*projectileSecondaryCeiling.trailScale*projectileSecondaryCeilingBudget.secondaryScale*projectileReadabilityContrast.trailScale*projectileReadabilityContrastBudget.secondaryScale')
insert_after('src/game/enemies.ts','const specialistSecondaryCeiling=',"      const specialistReadabilityContrast=specialistReadabilityContrastPresentation({silhouetteFloor:specialistEffectiveFloor.silhouetteAlphaFloor,trailScale:specialistSecondaryCeiling.trailScale,owner:silhouetteDirection.owner,critical:silhouetteDirection.owner==='special',crowd:Math.min(1,(this.projectiles.length+activeSpecialistCount)/10)},reducedMotion),specialistReadabilityContrastBudget=readabilityContrastBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,crowd:Math.min(1,(this.projectiles.length+activeSpecialistCount)/10),bossActive:specialistBossProximity>0,safeLaneVisible:false},reducedMotion,reducedFlash);")
extend_floor('src/game/enemies.ts','const specialistSilhouetteAlphaScale=Math.max(specialistEffectiveFloor.silhouetteAlphaFloor','specialistEffectiveFloor.silhouetteAlphaFloor*specialistEffectiveFloorBudget.canonicalFloorScale','specialistReadabilityContrast.silhouetteAlphaFloor*specialistReadabilityContrastBudget.primaryScale')
replace_all('src/game/enemies.ts','*specialistSecondaryCeiling.trailScale*specialistSecondaryCeilingBudget.secondaryScale;','*specialistSecondaryCeiling.trailScale*specialistSecondaryCeilingBudget.secondaryScale*specialistReadabilityContrast.trailScale*specialistReadabilityContrastBudget.secondaryScale;')
insert_after('src/game/spells.ts','const impactSecondaryCeiling=',"        const impactReadabilityContrast=impactReadabilityContrastPresentation({edgeFloor:impactEffectiveFloor.edgeAlphaFloor,fillScale:impactSecondaryCeiling.fillScale,critical:impactCritical,bossActive:bossTelegraphOverlap,crowd:Math.min(1,impactNeighborCount/8)},reducedFlash),impactReadabilityContrastBudget=readabilityContrastBudgetPresentation({criticalCount:impactCritical?1:0,crowd:Math.min(1,impactNeighborCount/8),bossActive:bossTelegraphOverlap,safeLaneVisible:false},reducedMotion,reducedFlash);")
extend_floor('src/game/spells.ts','ctx.save();ctx.globalAlpha=Math.max(impactEffectiveFloor.edgeAlphaFloor','impactEffectiveFloor.edgeAlphaFloor*impactEffectiveFloorBudget.canonicalFloorScale','impactReadabilityContrast.edgeAlphaFloor*impactReadabilityContrastBudget.primaryScale')
append_assignment_factor('src/game/spells.ts','ctx.save(); ctx.globalAlpha = Math.max(0, 1 - progress)',' * impactReadabilityContrast.fillScale * impactReadabilityContrastBudget.secondaryScale',require='impactDenseArbitration.fillAlphaScale')
insert_after('src/game/game.ts','const safeLaneEffectiveFloor=',"      const safeLaneReadabilityContrast=safeLaneReadabilityContrastPresentation({pathFloor:safeLaneEffectiveFloor.pathAlphaFloor,confidence:safeLane.confidence,critical:this.dangerState.coreCritical||this.dangerState.heroCritical,bossActive:Boolean(boss),crowd:safeLaneDenseBattlefield.stress},this.presentationSettings.reducedFlash),safeLaneReadabilityContrastBudget=readabilityContrastBudgetPresentation({criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),crowd:safeLaneDenseBattlefield.stress,bossActive:Boolean(boss),safeLaneVisible:true},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
insert_after('src/game/game.ts','const hazardSecondaryCeiling=',"      const hazardReadabilityContrast=hazardReadabilityContrastPresentation({edgeFloor:hazardEffectiveFloor.edgeAlphaFloor,fillScale:hazardSecondaryCeiling.fillScale,telegraph:hazard.telegraph>0,critical:hazard.id===primaryTelegraphHazardId,crowd:Math.min(1,this.bossArena.hazards.length/6)},this.presentationSettings.reducedFlash),hazardReadabilityContrastBudget=readabilityContrastBudgetPresentation({criticalCount:hazard.id===primaryTelegraphHazardId?1:0,crowd:Math.min(1,this.bossArena.hazards.length/6),bossActive:Boolean(boss),safeLaneVisible:Boolean(safeLane)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
extend_floor('src/game/game.ts','const safeLaneBaseAlpha=Math.max(safeLaneEffectiveFloor.pathAlphaFloor','safeLaneEffectiveFloor.pathAlphaFloor*safeLaneEffectiveFloorBudget.safeLaneFloorScale','safeLaneReadabilityContrast.pathAlphaFloor*safeLaneReadabilityContrastBudget.safeLaneScale')
extend_floor('src/game/game.ts','const hazardFillAlpha=Math.max(hazardEffectiveFloor.edgeAlphaFloor','hazardEffectiveFloor.edgeAlphaFloor*hazardEffectiveFloorBudget.canonicalFloorScale','hazardReadabilityContrast.edgeAlphaFloor*hazardReadabilityContrastBudget.primaryScale')
replace_all('src/game/game.ts','*hazardSecondaryCeiling.fillScale*hazardSecondaryCeilingBudget.secondaryScale*hazardBossSecondaryCeiling.staleScale,','*hazardSecondaryCeiling.fillScale*hazardSecondaryCeilingBudget.secondaryScale*hazardBossSecondaryCeiling.staleScale*hazardReadabilityContrast.fillScale*hazardReadabilityContrastBudget.secondaryScale,')
commit('Phase 4167-4172 battlefield readability contrast coherence',m3,t3,baseline+[t1,t2])

run('npm run build')
run('node --test '+' '.join(baseline+[t1,t2,t3]))
run('git diff --check')
run('git status --short')
run('git push origin HEAD:work/phase4155-4172-fast')

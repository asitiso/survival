from pathlib import Path

runner=Path('.github/phase4155-4172-fast.py').read_text()

runner=runner.replace("laneProximity:safeLane?Math.max(0,1-distance(hazard.pos,safeLane.current)/Math.max(1,hazard.radius+90)):0","laneProximity:hazardLaneProximity")

needle="def red(test_file, module_fragment):"
helper=r'''def wrap_inline_assignment_floor(path, line_needle, variable, floor_expr):
    p=Path(path); lines=p.read_text().splitlines(); hits=[i for i,l in enumerate(lines) if line_needle in l]
    if len(hits)!=1: raise SystemExit(f"{path}: inline floor needle {line_needle!r} hits={len(hits)}")
    i=hits[0]; line=lines[i]; marker=variable+'='
    start=line.find(marker)
    if start<0: raise SystemExit(f"{path}: inline variable {variable!r} missing")
    start+=len(marker); end=line.find(';',start)
    if end<0: raise SystemExit(f"{path}: inline semicolon missing for {variable!r}")
    expr=line[start:end]
    if floor_expr in expr: return
    lines[i]=line[:start]+f"Math.max({floor_expr},{expr})"+line[end:]
    p.write_text("\n".join(lines)+"\n")


def extend_inline_floor(path, line_needle, variable, old_floor, new_floor):
    p=Path(path); lines=p.read_text().splitlines(); hits=[i for i,l in enumerate(lines) if line_needle in l]
    if len(hits)!=1: raise SystemExit(f"{path}: inline extend needle {line_needle!r} hits={len(hits)}")
    i=hits[0]; line=lines[i]; old=f"{variable}=Math.max({old_floor},"; new=f"{variable}=Math.max({old_floor},{new_floor},"
    if new in line: return
    if old not in line: raise SystemExit(f"{path}: inline old floor missing {old}")
    lines[i]=line.replace(old,new,1); p.write_text("\n".join(lines)+"\n")


'''
if needle not in runner:
    raise SystemExit('red helper marker missing')
runner=runner.replace(needle,helper+needle,1)

runner=runner.replace("wrap_assignment_floor('src/game/game.ts','const hazardFillAlpha=','hazardEffectiveFloor.edgeAlphaFloor*hazardEffectiveFloorBudget.canonicalFloorScale')","wrap_inline_assignment_floor('src/game/game.ts','const hazardFillAlpha=','hazardEdgeAlpha','hazardEffectiveFloor.edgeAlphaFloor*hazardEffectiveFloorBudget.canonicalFloorScale')")
runner=runner.replace("extend_floor('src/game/game.ts','const hazardFillAlpha=Math.max(hazardEffectiveFloor.edgeAlphaFloor','hazardEffectiveFloor.edgeAlphaFloor*hazardEffectiveFloorBudget.canonicalFloorScale','hazardReadabilityContrast.edgeAlphaFloor*hazardReadabilityContrastBudget.primaryScale')","extend_inline_floor('src/game/game.ts','const hazardFillAlpha=','hazardEdgeAlpha','hazardEffectiveFloor.edgeAlphaFloor*hazardEffectiveFloorBudget.canonicalFloorScale','hazardReadabilityContrast.edgeAlphaFloor*hazardReadabilityContrastBudget.primaryScale')")

exec(compile(runner,'.github/phase4155-4172-fast.py','exec'),{'__name__':'__main__'})

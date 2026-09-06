from pathlib import Path

patcher=Path('.github/phase4155-4172-fast-v2.py').read_text()
exec_line="exec(compile(runner,'.github/phase4155-4172-fast.py','exec'),{'__name__':'__main__'})"
if exec_line not in patcher:
    raise SystemExit('v2 exec seam missing')
repair=r'''repairs=[
("insert_after('src/game/enemies.ts','const specialistCriticalReengagement=',\"      const specialistSecondaryCeiling=", "insert_after('src/game/enemies.ts','const specialistDenseArbitration=',\"      const specialistSecondaryCeiling="),
("extend_floor('src/game/enemies.ts','ctx.globalAlpha = Math.max(projectileEffectiveFloor.bodyAlphaFloor'", "extend_floor('src/game/enemies.ts','ctx.globalAlpha =Math.max(projectileEffectiveFloor.bodyAlphaFloor'"),
("insert_after('src/game/enemies.ts','const projectileSecondaryCeiling=',\"      const projectileReadabilityContrast=", "insert_after('src/game/enemies.ts','const projectileEffectiveFloor=',\"      const projectileReadabilityContrast="),
("insert_after('src/game/spells.ts','const impactSecondaryCeiling=',\"        const impactReadabilityContrast=", "insert_after('src/game/spells.ts','const impactEffectiveFloor=',\"        const impactReadabilityContrast="),
("insert_after('src/game/game.ts','const hazardSecondaryCeiling=',\"      const hazardReadabilityContrast=", "insert_after('src/game/game.ts','const hazardEffectiveFloor=',\"      const hazardReadabilityContrast="),
]
for old,new in repairs:
    count=runner.count(old)
    if count!=1:
        raise SystemExit(f'expected one runner repair seam, got {count}: {old[:100]}')
    runner=runner.replace(old,new,1)
'''
patcher=patcher.replace(exec_line,repair+exec_line,1)
exec(compile(patcher,'.github/phase4155-4172-fast-v2.py','exec'),{'__name__':'__main__'})

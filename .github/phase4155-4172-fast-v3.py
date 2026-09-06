from pathlib import Path

runner=Path('.github/phase4155-4172-fast-v2.py').read_text()
old="insert_after('src/game/enemies.ts','const specialistCriticalReengagement=',\"      const specialistSecondaryCeiling="
new="insert_after('src/game/enemies.ts','const specialistDenseArbitration=',\"      const specialistSecondaryCeiling="
count=runner.count(old)
if count!=1:
    raise SystemExit(f'expected one specialist secondary ceiling anchor, got {count}')
runner=runner.replace(old,new,1)
exec(compile(runner,'.github/phase4155-4172-fast-v2.py','exec'),{'__name__':'__main__'})

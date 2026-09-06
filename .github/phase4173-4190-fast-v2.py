from pathlib import Path

src=Path('.github/phase4173-4190-fast.py').read_text()
patches={
"'*impactReadabilityContrastBudget.secondaryScale','*impactReadabilityContrastBudget.secondaryScale*impactFinalSettle.secondaryScale*impactFinalSettleBudget.secondaryScale'":"'* impactReadabilityContrastBudget.secondaryScale','* impactReadabilityContrastBudget.secondaryScale * impactFinalSettle.secondaryScale * impactFinalSettleBudget.secondaryScale'",
"'*impactFinalSettleBudget.secondaryScale','*impactFinalSettleBudget.secondaryScale*impactSecondaryRecoveryGate.secondaryScale*impactSecondaryRecoveryGateBudget.secondaryScale'":"'* impactFinalSettleBudget.secondaryScale','* impactFinalSettleBudget.secondaryScale * impactSecondaryRecoveryGate.secondaryScale * impactSecondaryRecoveryGateBudget.secondaryScale'",
"'*impactSecondaryRecoveryGateBudget.secondaryScale','*impactSecondaryRecoveryGateBudget.secondaryScale*impactFocusTransfer.secondaryScale*impactFocusTransferBudget.secondaryScale'":"'* impactSecondaryRecoveryGateBudget.secondaryScale','* impactSecondaryRecoveryGateBudget.secondaryScale * impactFocusTransfer.secondaryScale * impactFocusTransferBudget.secondaryScale'",
}
for old,new in patches.items():
    if old not in src:
        raise SystemExit(f'missing runner patch token: {old}')
    src=src.replace(old,new,1)
exec(compile(src,'.github/phase4173-4190-fast.py','exec'),{'__name__':'__main__'})

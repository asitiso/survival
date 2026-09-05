const PRESERVE = ['mythic', '보스 전장', '보스 진입', '최종', 'signature', '수호핵', '위험', 'tactic', 'safe link', 'last law', '약점', 'overdrive', '융합 발동'];
const ROUTINE = ['상점권 획득', '보급 획득', '무료 보급', '황금 고블린 처치', '황금 고블린이 도망', '보급 상자가 사라', '전장 목표 완료', '미션 성공', '연대기', '보스 성장'];
export function fourEightHourToastFocus(elapsedSeconds, message) {
    const elapsed = Number.isFinite(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0;
    const normalized = (message ?? '').trim().toLowerCase();
    const critical = PRESERVE.some(token => normalized.includes(token));
    if (elapsed < 14400 || critical)
        return { show: true, critical, estimatedRoutineReduction: 0, combatMutation: false, economyMutation: false };
    const routine = ROUTINE.some(token => normalized.includes(token));
    return { show: !routine, critical: false, estimatedRoutineReduction: routine ? .6 : 0, combatMutation: false, economyMutation: false };
}

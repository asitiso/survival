const STORAGE_KEY = 'arcane-last-stand.onboarding';
export const ONBOARDING_STEPS = [
    { id: 'move', title: '이동', hint: '왼쪽 스틱으로 움직이세요' },
    { id: 'spell', title: '마법', hint: '오른쪽 일반 마법을 사용하세요' },
    { id: 'ultimate', title: '궁극기', hint: '큰 궁극기 버튼을 사용하세요' },
    { id: 'levelup', title: '레벨업', hint: '레벨업 보상을 하나 선택하세요' },
    { id: 'shop', title: '상점', hint: '상점권을 얻으면 상점을 열어보세요' },
    { id: 'core', title: '수호핵', hint: '수호핵이 공격받으면 적을 먼저 막으세요' },
];
export function defaultOnboardingState() {
    return { version: 1, stepIndex: 0, completed: false };
}
export function sanitizeOnboardingState(raw) {
    if (typeof raw !== 'object' || raw === null)
        return defaultOnboardingState();
    const source = raw;
    const numeric = typeof source.stepIndex === 'number' ? source.stepIndex : Number(source.stepIndex);
    if (!Number.isFinite(numeric))
        return defaultOnboardingState();
    const stepIndex = Math.min(ONBOARDING_STEPS.length, Math.max(0, Math.floor(numeric)));
    const completed = source.completed === true || stepIndex >= ONBOARDING_STEPS.length;
    return { version: 1, stepIndex: completed ? ONBOARDING_STEPS.length : stepIndex, completed };
}
export function loadOnboardingState(storage) {
    try {
        const raw = storage.getItem(STORAGE_KEY);
        if (raw === null)
            return defaultOnboardingState();
        try {
            return sanitizeOnboardingState(JSON.parse(raw));
        }
        catch {
            return defaultOnboardingState();
        }
    }
    catch {
        return defaultOnboardingState();
    }
}
export function saveOnboardingState(storage, state) {
    try {
        storage.setItem(STORAGE_KEY, JSON.stringify(sanitizeOnboardingState(state)));
    }
    catch { /* persistence is optional */ }
}
export class OnboardingController {
    state;
    constructor(state = defaultOnboardingState()) {
        this.state = sanitizeOnboardingState(state);
    }
    get stepIndex() { return this.state.stepIndex; }
    get done() { return this.state.completed; }
    get current() {
        if (this.state.completed)
            return null;
        return ONBOARDING_STEPS[this.state.stepIndex] ?? null;
    }
    signal(id) {
        const current = this.current;
        if (!current || current.id !== id)
            return false;
        const next = this.state.stepIndex + 1;
        this.state = { version: 1, stepIndex: Math.min(next, ONBOARDING_STEPS.length), completed: next >= ONBOARDING_STEPS.length };
        return true;
    }
    snapshot() { return { ...this.state }; }
}

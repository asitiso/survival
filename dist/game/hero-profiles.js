export const HERO_PROFILES = [
    { id: 'arkan', name: '아르칸', title: '화염 파괴자', passive: '연쇄 폭발', description: '처치한 적이 일정 확률로 주변 적까지 폭발시킵니다.', baseHp: 240, baseSpeed: 285, cooldownMultiplier: 1, spellPower: 1.08, color: '#ff7048' },
    { id: 'seria', name: '세리아', title: '빙결 지배자', passive: '극저온', description: '서리폭발이 더 강하고 더 오래, 더 깊게 둔화시킵니다.', baseHp: 225, baseSpeed: 282, cooldownMultiplier: 0.97, spellPower: 1.02, color: '#6fd8ff' },
    { id: 'kain', name: '카인', title: '폭풍 추적자', passive: '과부하', description: '기본 이동속도와 영창속도가 빨라 난사와 기동에 특화됩니다.', baseHp: 210, baseSpeed: 318, cooldownMultiplier: 0.90, spellPower: 1, color: '#a687ff' },
    { id: 'edric', name: '에드릭', title: '수호 마도기사', passive: '수호자의 맹세', description: '체력이 높고 수호핵 근처에서 영웅과 수호핵이 받는 피해가 감소합니다.', baseHp: 305, baseSpeed: 262, cooldownMultiplier: 1, spellPower: 0.96, color: '#f0c46b' },
];
export function heroProfile(id) {
    return HERO_PROFILES.find((profile) => profile.id === id) ?? HERO_PROFILES[0];
}

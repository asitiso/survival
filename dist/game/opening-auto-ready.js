export function openingAutoReadyProfile() {
    return { initialAutoEnabled: true, savedOpeningTaps: 1, actionCount: 9, newActionCount: 0, snapshotMutation: false };
}
export function openingAutoCastIntent(autoEnabled, held) {
    return { manualHeld: held, autoTriggered: autoEnabled && !held };
}

export function longRunHudFocusPolicy(elapsedSeconds, bossActive = false, mythicActive = false) {
    const seconds = Math.max(0, Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0);
    let tier = 0, statusMaxChars = 64, maxBuildLabels = 4, showXpNumbers = true, showMeterText = true;
    if (seconds >= 8 * 3600) {
        tier = 3;
        statusMaxChars = 44;
        maxBuildLabels = 2;
        showXpNumbers = false;
        showMeterText = false;
    }
    else if (seconds >= 4 * 3600) {
        tier = 2;
        statusMaxChars = 50;
        maxBuildLabels = 2;
        showXpNumbers = false;
        showMeterText = true;
    }
    else if (seconds >= 2 * 3600) {
        tier = 1;
        statusMaxChars = 56;
        maxBuildLabels = 3;
    }
    if (bossActive) {
        statusMaxChars = Math.min(statusMaxChars, 48);
        maxBuildLabels = Math.min(maxBuildLabels, 2);
    }
    if (mythicActive) {
        statusMaxChars = Math.min(statusMaxChars, 42);
        maxBuildLabels = 1;
        showXpNumbers = false;
        showMeterText = false;
    }
    return { tier, statusMaxChars, maxBuildLabels, showXpNumbers, showMeterText, keepHpBar: true, keepXpBar: true, keepMeterBar: true, dangerTelegraphMultiplier: 1 };
}

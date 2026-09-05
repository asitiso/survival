import { SHOP_FIRST_TOKEN_AT, SHOP_TOKEN_INTERVAL } from '../domain/economy.js';
import { projectBalanceAt } from './balance-simulator.js';
const MINUTES = [30, 60, 120];
const THREATS = [0, 3, 5];
const BANDS = ['conservative', 'neutral', 'gold'];
const BAND_MULTIPLIER = { conservative: .85, neutral: 1, gold: 1.12 };
const CORE_PURCHASE_PRICE = 220;
function round(value) { return Math.round(value * 100) / 100; }
function scheduledShopTokens(seconds) { return seconds < SHOP_FIRST_TOKEN_AT ? 0 : 1 + Math.floor((seconds - SHOP_FIRST_TOKEN_AT) / SHOP_TOKEN_INTERVAL); }
function cumulativeGold(minute, threat) {
    let gold = 0;
    for (let start = 0; start < minute; start += 5) {
        const width = Math.min(5, minute - start);
        const midpoint = (start + width / 2) * 60;
        gold += projectBalanceAt(midpoint, threat).goldPerMinute * width;
    }
    return gold;
}
export function progressionPurchasingPowerSamples() {
    const samples = [];
    for (const threat of THREATS)
        for (const minute of MINUTES) {
            const projection = projectBalanceAt(minute * 60, threat);
            const shopTokens = scheduledShopTokens(minute * 60);
            const baseGold = cumulativeGold(minute, threat);
            for (const economyBand of BANDS) {
                const estimatedGold = Math.floor(baseGold * BAND_MULTIPLIER[economyBand]);
                const affordableCorePurchases = Math.min(shopTokens, Math.floor(estimatedGold / CORE_PURCHASE_PRICE));
                samples.push({ threat, minute, economyBand, estimatedGold, estimatedLevel: projection.estimatedLevel, xpToNextLevel: projection.xpToNextLevel, shopTokens, affordableCorePurchases, goldPerAvailableShop: round(estimatedGold / Math.max(1, shopTokens)) });
            }
        }
    return samples;
}
export function auditProgressionPurchasingPower() {
    const samples = progressionPurchasingPowerSamples();
    const minAffordableCorePurchases = Math.min(...samples.map((sample) => sample.affordableCorePurchases));
    const minGoldPerAvailableShop = round(Math.min(...samples.map((sample) => sample.goldPerAvailableShop)));
    let maxEconomyBandSpread = 1, goldMonotonic = true, levelMonotonic = true, shopPowerMonotonic = true, threatLevelParity = true;
    for (const threat of THREATS)
        for (const minute of MINUTES) {
            const group = samples.filter((sample) => sample.threat === threat && sample.minute === minute);
            const gold = group.map((sample) => sample.estimatedGold);
            maxEconomyBandSpread = Math.max(maxEconomyBandSpread, Math.max(...gold) / Math.max(1, Math.min(...gold)));
        }
    for (const threat of THREATS)
        for (const band of BANDS) {
            const group = samples.filter((sample) => sample.threat === threat && sample.economyBand === band).sort((a, b) => a.minute - b.minute);
            for (let i = 1; i < group.length; i += 1) {
                if (group[i].estimatedGold <= group[i - 1].estimatedGold)
                    goldMonotonic = false;
                if (group[i].estimatedLevel <= group[i - 1].estimatedLevel)
                    levelMonotonic = false;
                if (group[i].affordableCorePurchases <= group[i - 1].affordableCorePurchases)
                    shopPowerMonotonic = false;
            }
        }
    for (const minute of MINUTES) {
        const levels = THREATS.map((threat) => samples.find((sample) => sample.threat === threat && sample.minute === minute && sample.economyBand === 'neutral').estimatedLevel);
        if (new Set(levels).size !== 1)
            threatLevelParity = false;
    }
    maxEconomyBandSpread = round(maxEconomyBandSpread);
    const passed = samples.length === 27 && minAffordableCorePurchases >= 3 && minGoldPerAvailableShop >= 180 && maxEconomyBandSpread <= 1.50 && goldMonotonic && levelMonotonic && shopPowerMonotonic && threatLevelParity;
    return { samples, minAffordableCorePurchases, minGoldPerAvailableShop, maxEconomyBandSpread, goldMonotonic, levelMonotonic, shopPowerMonotonic, threatLevelParity, passed };
}

import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { directorSnapshot } from '../dist/domain/director.js';
import { purchaseOffer } from '../dist/domain/economy.js';
import { strengthenEquipment, strengthenRequirement, combineEquipment } from '../dist/domain/equipment-forge.js';
import { equipInventoryStack, inventoryStackKey, sellInventoryStack } from '../dist/domain/equipment-inventory.js';
import { equipmentDefinition } from '../dist/game/shop-data.js';
import { equipmentRecipe } from '../dist/game/equipment-recipes.js';
import { equipmentReadiness } from '../dist/game/equipment-survival-readiness.js';
import { enemyStats, selectRegularEnemyType } from '../dist/game/enemies.js';
import { openingCombatPacing } from '../dist/game/opening-pacing.js';

const checkpoints = [300, 480, 720, 900, 1200];
const empty = () => ({ coins: 180, weapon: null, armor: null, accessory: null, healingPotions: 0, inventory: [], discoveredRecipes: [] });

// Integrate exactly [0, checkpoint): no extra second of income at a checkpoint.
function incomeAtCheckpoints() {
  let gross = 0;
  const income = new Map();
  for (let second = 0; second < 1200; second += 1) {
    const director = directorSnapshot(second);
    const pacing = openingCombatPacing(second);
    let averageGold = 0;
    for (let sample = 0; sample < 100; sample += 1) {
      const type = selectRegularEnemyType(second, (sample + .5) / 100);
      averageGold += enemyStats(type, director.danger, second).gold / 100;
    }
    gross += Math.ceil(director.spawnBurst * pacing.spawnPressureMultiplier) / director.spawnInterval * averageGold;
    if (checkpoints.includes(second + 1)) income.set(second + 1, gross);
  }
  return income;
}

export function equipmentBalanceRows() {
  const income = incomeAtCheckpoints();
  const rows = [];
  for (const recovery of [.25, .45]) {
    let state = empty();
    let earnedGold = 180;
    let spend = 0;
    let resaleGold = 0;
    let optionalSpend = 0;
    const apply = (result) => {
      if (!result.ok) throw new Error(result.message);
      const coinDelta = state.coins - result.state.coins;
      if (coinDelta > 0) spend += coinDelta;
      else resaleGold -= coinDelta;
      state = result.state;
    };
    const definition = (id) => {
      const found = equipmentDefinition(id);
      if (!found) throw new Error(`Unknown equipment: ${id}`);
      return found;
    };
    const buy = (id) => apply(purchaseOffer(state, definition(id)));
    const equip = (id, minimumRank) => {
      const item = definition(id);
      if (state[item.kind]?.id === id && state[item.kind]?.rank >= minimumRank) return;
      const stack = state.inventory.find(candidate => candidate.id === id && candidate.rank >= minimumRank);
      if (!stack) throw new Error(`Missing equipped candidate: ${id}@${minimumRank}`);
      apply(equipInventoryStack(state, inventoryStackKey(stack.id, stack.rank)));
    };
    const sellStored = (id) => {
      let stack = state.inventory.find(candidate => candidate.id === id);
      while (stack) {
        apply(sellInventoryStack(state, inventoryStackKey(stack.id, stack.rank), definition(id).basePrice));
        stack = state.inventory.find(candidate => candidate.id === id);
      }
    };
    const equippedRank = (id, rank, seconds) => {
      const item = definition(id);
      if (state[item.kind]?.id !== id) {
        buy(id);
        equip(id, 1);
      }
      while (state[item.kind].rank < rank) {
        const requirement = strengthenRequirement(state[item.kind].rank);
        for (let count = 0; count < requirement.materialCount; count += 1) buy(id);
        apply(strengthenEquipment(state, { place: 'equipped', kind: item.kind }, seconds));
      }
    };
    // Build a recipe ingredient in storage through the same purchase/strengthen transactions as play.
    const storedAtLeast = (id, rank, seconds) => {
      if (state.inventory.some(stack => stack.id === id && stack.rank >= rank)) return;
      buy(id);
      for (let currentRank = 1; currentRank < rank; currentRank += 1) {
        const requirement = strengthenRequirement(currentRank);
        for (let count = 0; count < requirement.materialCount; count += 1) buy(id);
        apply(strengthenEquipment(state, { place: 'inventory', stackKey: inventoryStackKey(id, currentRank) }, seconds));
      }
    };
    const craft = (id, seconds) => {
      const recipe = equipmentRecipe(id);
      if (!recipe) throw new Error(`Unknown recipe: ${id}`);
      if (state.inventory.some(stack => stack.id === recipe.result.id && stack.rank >= recipe.result.rank)) return;
      for (const ingredientId of recipe.ingredientIds) {
        if (state.inventory.some(stack => stack.id === ingredientId && stack.rank >= recipe.minimumIngredientRank)) continue;
        if (equipmentRecipe(ingredientId)) craft(ingredientId, seconds);
        else storedAtLeast(ingredientId, recipe.minimumIngredientRank, seconds);
      }
      apply(combineEquipment(state, id));
    };

    for (const elapsedSeconds of checkpoints) {
      const nextEarned = Math.floor(income.get(elapsedSeconds) * recovery + 180);
      state = { ...state, coins: state.coins + nextEarned - earnedGold };
      earnedGold = nextEarned;

      if (elapsedSeconds === 300) {
        equippedRank('iron-robe', 3, elapsedSeconds);
        equippedRank('arcane-staff', 1, elapsedSeconds);
        equippedRank('sage-amulet', 1, elapsedSeconds);
      } else if (elapsedSeconds === 480) {
        equippedRank('arcane-staff', 3, elapsedSeconds);
        equippedRank('sage-amulet', 3, elapsedSeconds);
      } else if (elapsedSeconds === 720) {
        craft('arcane-accelerator', elapsedSeconds);
        equip('arcane-accelerator', 3);
        sellStored('arcane-staff');
      } else if (elapsedSeconds === 900) {
        craft('fate-core', elapsedSeconds);
        equip('fate-core', 5);
        sellStored('sage-amulet');
      } else {
        craft('world-tree-armor', elapsedSeconds);
        equip('world-tree-armor', 5);
        sellStored('iron-robe');
      }

      if (recovery === .45) {
        const beforeOptional = spend;
        if (elapsedSeconds === 300) storedAtLeast('fortune-charm', 2, elapsedSeconds);
        else if (elapsedSeconds === 480) equippedRank('arcane-staff', 4, elapsedSeconds);
        else if (elapsedSeconds === 720) craft('alchemical-blast-staff', elapsedSeconds);
        else if (elapsedSeconds === 900) {
          craft('arcane-accelerator', elapsedSeconds);
          apply(combineEquipment(state, 'celestial-fusion-staff'));
          equip('celestial-fusion-staff', 5);
          sellStored('arcane-accelerator');
        } else {
          craft('fate-core', elapsedSeconds);
          apply(strengthenEquipment(state, { place: 'equipped', kind: 'accessory' }, elapsedSeconds));
        }
        optionalSpend += spend - beforeOptional;
      }

      const readiness = equipmentReadiness({ elapsedSeconds, heroMaxHp: 333, state });
      const defensiveTarget = elapsedSeconds === 300 ? state.armor?.id === 'iron-robe' && state.armor.rank >= 3
        : elapsedSeconds === 480 ? [state.weapon, state.armor, state.accessory].every(item => item?.rank >= 3)
        : elapsedSeconds === 720 ? state.armor?.rank >= 3 && state.weapon?.id === 'arcane-accelerator'
        : elapsedSeconds === 900 ? state.accessory?.id === 'fate-core'
        : state.armor?.id === 'world-tree-armor' && state.accessory?.id === 'fate-core';
      const optionalTarget = recovery === .25 || (elapsedSeconds === 300
        ? state.inventory.some(stack => stack.id === 'fortune-charm' && stack.rank >= 2)
        : elapsedSeconds === 480 ? state.weapon?.id === 'arcane-staff' && state.weapon.rank >= 4
        : elapsedSeconds === 720 ? state.inventory.some(stack => stack.id === 'alchemical-blast-staff')
        : elapsedSeconds === 900 ? state.weapon?.id === 'celestial-fusion-staff'
        : state.accessory?.id === 'fate-core' && state.accessory.rank >= 6);
      const milestone = elapsedSeconds === 300 ? '희귀 방어구'
        : elapsedSeconds === 480 ? '희귀 3부위·방어구'
        : elapsedSeconds === 720 ? '희귀 방어구·일반 조합 무기'
        : elapsedSeconds === 900 ? '히든 운명의 핵'
        : '히든 세계수 성갑';
      const routeAddition = elapsedSeconds === 300 ? '금화 장신구 고급 재료'
        : elapsedSeconds === 480 ? '영웅 무기'
        : elapsedSeconds === 720 ? '일반 조합 무기·히든 진행'
        : elapsedSeconds === 900 ? '히든 무기'
        : '전설 추가 강화';
      rows.push({ elapsedSeconds, recovery, earnedGold, spend, resaleGold, optionalSpend, milestone, routeAddition,
        equipped: [state.weapon, state.armor, state.accessory].map(item => `${item.id}@${item.rank}`).join(', '),
        inventoryUsage: state.inventory.length, readiness,
        passed: Boolean(defensiveTarget && optionalTarget && state.coins >= 0 && state.inventory.length <= 6 && readiness.label !== '준비 부족') });
    }
  }
  return rows;
}

export function equipmentBalanceReport() {
  const rows = equipmentBalanceRows();
  const unarmed = equipmentReadiness({ elapsedSeconds: 480, heroMaxHp: 333, state: empty() });
  const baseline = rows.find(row => row.elapsedSeconds === 480 && row.recovery === .25).readiness;
  const unarmedBehind = unarmed.heroSurvivalHits < baseline.heroSurvivalHits * .8
    && unarmed.firepowerIndex < baseline.firepowerIndex * .8;
  let report = '# 장비·생존 난이도 검증\n\n실제 구매·강화·조합·장착·판매 거래를 순차 실행한 누적 예산입니다. 일반 적 100표본의 평균 금화, 생성 주기/묶음, 초반 생성 압력을 초 단위로 적분하고 시작 준비금 180G를 포함합니다. 25%/45%는 처치와 회수를 함께 가정합니다. 적 개체수 상한·실제 명중·회피는 모델링하지 않으므로 수입 보장이 아닙니다. 보스·정예·황금 적·상자·장비 금화 보너스는 제외합니다.\n\n333 HP, 현재 시간의 일반 적 접촉 피해를 사용합니다. 생존 타수 = HP ÷ 장비 피해 배율 ÷ 일반 적 피해. 화력 = 마법 피해 ÷ 쿨타임 × 범위입니다. 회복·영웅 특성·스킬·엔드리스 별도 배율은 제외합니다. 적 난이도는 시간으로만 결정합니다.\n\n25% 경로는 5분 희귀 방어구, 8분 희귀 3부위, 12분 일반 조합 무기, 15분 히든 장신구, 20분 히든 방어구를 누적합니다. 45% 경로는 금화 재료, 영웅 무기, 추가 일반 조합, 히든 무기, 전설 추가 강화를 더합니다. 장착 중인 재료는 소비하지 않고, 사용이 끝난 장비는 35% 판매 거래로 정리합니다.\n\n|시간|회수|획득+준비금|지출|판매 회수|선택 지출|이정표|장착 ID@랭크|보관|영웅 타수|수호핵 배율|화력|준비도|검증|\n|---|---:|---:|---:|---:|---:|---|---|---:|---:|---:|---:|---|---|\n';
  for (const row of rows) {
    const readiness = row.readiness;
    report += `|${row.elapsedSeconds / 60}분|${row.recovery * 100}%|${row.earnedGold}|${row.spend}|${row.resaleGold}|${row.optionalSpend}|${row.recovery === .25 ? row.milestone : row.routeAddition}|${row.equipped}|${row.inventoryUsage}/6|${readiness.heroSurvivalHits.toFixed(2)}|${readiness.coreDamageMultiplier.toFixed(3)}|${readiness.firepowerIndex.toFixed(3)}|${readiness.label}|${row.passed ? 'PASS' : 'FAIL'}|\n`;
  }
  report += `\n8분 무장하지 않은 경로: 생존 ${unarmed.heroSurvivalHits.toFixed(2)}타 / 권장 경로 ${baseline.heroSurvivalHits.toFixed(2)}타, 화력 ${unarmed.firepowerIndex.toFixed(3)} / ${baseline.firepowerIndex.toFixed(3)}. 두 지표 20% 이상 열세: ${unarmedBehind ? 'PASS' : 'FAIL'}.\n`;
  return { rows, text: report, passed: rows.every(row => row.passed) && unarmedBehind };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const report = equipmentBalanceReport();
  console.log(report.text);
  if (!report.passed) process.exitCode = 1;
}

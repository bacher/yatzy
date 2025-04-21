import { times } from "lodash";

import {
  Dice,
  diceOrdered,
  DiceState,
  PlayerScoreData,
  TotalScore,
} from "@/logic/types";
import {
  ScoreboardCategoryScore,
  ScoreboardScoreData,
} from "@/app/components/Scoreboard";
import { diceToUpperCategory } from "@/logic/consts";

export function randomDice(): Dice {
  return (Math.floor(Math.random() * 6) + 1) as Dice;
}

export function mapDice(
  iterator: (diceIndex: number) => Dice,
): DiceState["diceSet"] {
  return times(5, iterator) as DiceState["diceSet"];
}

function convertScore(
  score: number | undefined,
): ScoreboardCategoryScore | undefined {
  if (!score) {
    return undefined;
  }
  return {
    score,
    isTemporary: false,
  };
}

function calculateDiceSum(dice: Dice[]): number {
  return dice.reduce((acc, diceValue) => acc + diceValue, 0);
}

export function addTemporaryScore(
  scoreData: PlayerScoreData,
  diceState: DiceState | undefined,
): ScoreboardScoreData {
  const mergedScoreData: ScoreboardScoreData = {
    ...scoreData,
    upperSection: {
      ones: convertScore(scoreData.upperSection.ones),
      twos: convertScore(scoreData.upperSection.twos),
      threes: convertScore(scoreData.upperSection.threes),
      fours: convertScore(scoreData.upperSection.fours),
      fives: convertScore(scoreData.upperSection.fives),
      sixes: convertScore(scoreData.upperSection.sixes),
    },
    lowerSection: {
      "3_kind": convertScore(scoreData.lowerSection["3_kind"]),
      "4_kind": convertScore(scoreData.lowerSection["4_kind"]),
      full_house: convertScore(scoreData.lowerSection.full_house),
      small_straight: convertScore(scoreData.lowerSection.small_straight),
      large_straight: convertScore(scoreData.lowerSection.large_straight),
      chance: convertScore(scoreData.lowerSection.chance),
      yatzy: convertScore(scoreData.lowerSection.yatzy),
    },
  };

  if (!diceState) {
    return mergedScoreData;
  }

  const { diceSet } = diceState;
  const sortedDice = [...diceSet].sort((a, b) => a - b);

  const diceCount: Record<Dice, number> = diceSet.reduce(
    (acc, diceValue) => ({
      ...acc,
      [diceValue]: (acc[diceValue] ?? 0) + 1,
    }),
    {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    },
  );

  for (const dice of diceOrdered) {
    const category = diceToUpperCategory[dice];

    if (!mergedScoreData.upperSection[category]) {
      if (diceCount[dice] >= 1) {
        mergedScoreData.upperSection[category] = {
          score: diceCount[dice] * dice,
          isTemporary: true,
        };
      }
    }
  }

  if (!mergedScoreData.lowerSection["3_kind"]) {
    if (Object.values(diceCount).some((count) => count >= 3)) {
      mergedScoreData.lowerSection["3_kind"] = {
        score: calculateDiceSum(diceSet),
        isTemporary: true,
      };
    }
  }

  if (!mergedScoreData.lowerSection["4_kind"]) {
    if (Object.values(diceCount).some((count) => count >= 4)) {
      mergedScoreData.lowerSection["4_kind"] = {
        score: calculateDiceSum(diceSet),
        isTemporary: true,
      };
    }
  }

  if (!mergedScoreData.lowerSection["full_house"]) {
    if (
      Object.values(diceCount).some((count) => count === 3) &&
      Object.values(diceCount).some((count) => count === 2)
    ) {
      mergedScoreData.lowerSection["full_house"] = {
        score: 25,
        isTemporary: true,
      };
    }
  }

  if (!mergedScoreData.lowerSection["small_straight"]) {
    for (let start = 0; start < 2; start += 1) {
      const a = sortedDice[start];
      const b = sortedDice[start + 1];
      const c = sortedDice[start + 2];
      const d = sortedDice[start + 3];

      if (a === b - 1 && b === c - 1 && c === d - 1) {
        mergedScoreData.lowerSection["small_straight"] = {
          score: 30,
          isTemporary: true,
        };
      }
    }
  }

  if (!mergedScoreData.lowerSection["large_straight"]) {
    const a = sortedDice[0];
    const b = sortedDice[1];
    const c = sortedDice[2];
    const d = sortedDice[3];
    const e = sortedDice[4];

    if (a === b - 1 && b === c - 1 && c === d - 1 && d === e - 1) {
      mergedScoreData.lowerSection["large_straight"] = {
        score: 40,
        isTemporary: true,
      };
    }
  }

  if (Object.values(diceCount).some((count) => count === 5)) {
    if (!mergedScoreData.lowerSection["yatzy"]) {
      mergedScoreData.lowerSection["yatzy"] = {
        score: 50,
        isTemporary: true,
      };
    } else {
      mergedScoreData.lowerSection["yatzy_bonus"] = {
        score: 100,
        isTemporary: true,
      };
    }
  }

  return mergedScoreData;
}

export function getTotalScore(scoreData: PlayerScoreData): TotalScore {
  const upperSectionTotal = Object.values(scoreData.upperSection).reduce(
    (acc, categoryScore) => acc + (categoryScore ?? 0),
    0,
  );
  const lowerSectionTotal = Object.values(scoreData.lowerSection).reduce(
    (acc, categoryScore) => acc + (categoryScore ?? 0),
    0,
  );

  return {
    upper: upperSectionTotal,
    lower: lowerSectionTotal,
    total: upperSectionTotal + lowerSectionTotal,
  };
}

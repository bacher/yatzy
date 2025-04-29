import { sortBy, sortedUniq, sum, times } from "lodash";

import {
  Dice,
  diceOrdered,
  DiceState,
  GameState,
  PlayerScoreData,
  TotalScore,
} from "@/gameLogic/types";
import {
  ScoreboardCategoryScore,
  ScoreboardPlayer,
  ScoreboardScoreData,
} from "@/app/components/Scoreboard";
import { diceToUpperCategory } from "@/gameLogic/consts";
import { PlayerInfo } from "@/OnlineGameDurableObject";

export function randomDice(): Dice {
  return (Math.floor(Math.random() * 6) + 1) as Dice;
}

export function mapDice(
  iterator: (diceIndex: number) => Dice,
): DiceState["diceSet"] {
  return times(5, iterator) as DiceState["diceSet"];
}

function convertScore(score: number | undefined): ScoreboardCategoryScore {
  return {
    score,
    possibleScore: undefined,
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
    upperSection: {
      ones: convertScore(scoreData.upperSection.ones),
      twos: convertScore(scoreData.upperSection.twos),
      threes: convertScore(scoreData.upperSection.threes),
      fours: convertScore(scoreData.upperSection.fours),
      fives: convertScore(scoreData.upperSection.fives),
      sixes: convertScore(scoreData.upperSection.sixes),
    },
    lowerSection: {
      kind_3: convertScore(scoreData.lowerSection.kind_3),
      kind_4: convertScore(scoreData.lowerSection.kind_4),
      full_house: convertScore(scoreData.lowerSection.full_house),
      small_straight: convertScore(scoreData.lowerSection.small_straight),
      large_straight: convertScore(scoreData.lowerSection.large_straight),
      chance: convertScore(scoreData.lowerSection.chance),
      yatzy: convertScore(scoreData.lowerSection.yatzy),
    },
    yatzyBonusAvailable: false,
  };

  if (!diceState) {
    return mergedScoreData;
  }

  const { diceSet } = diceState;
  const sortedDice = sortBy(diceSet);
  const unduplicatedSortedDice = sortedUniq(sortedDice);

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

  const isYatzy = Object.values(diceCount).some((count) => count === 5);

  mergedScoreData.yatzyBonusAvailable =
    isYatzy &&
    scoreData.lowerSection.yatzy !== undefined &&
    scoreData.lowerSection.yatzy !== 0;

  const isJoker =
    scoreData.lowerSection.yatzy !== undefined &&
    scoreData.upperSection[diceToUpperCategory[diceSet[0]]] !== undefined;

  for (const dice of diceOrdered) {
    const category = diceToUpperCategory[dice];

    if (mergedScoreData.upperSection[category].score === undefined) {
      if (diceCount[dice] >= 1) {
        mergedScoreData.upperSection[category].possibleScore =
          diceCount[dice] * dice;
      }
    }
  }

  if (mergedScoreData.lowerSection["kind_3"].score === undefined) {
    if (Object.values(diceCount).some((count) => count >= 3)) {
      mergedScoreData.lowerSection["kind_3"].possibleScore =
        calculateDiceSum(diceSet);
    }
  }

  if (mergedScoreData.lowerSection["kind_4"].score === undefined) {
    if (Object.values(diceCount).some((count) => count >= 4)) {
      mergedScoreData.lowerSection["kind_4"].possibleScore =
        calculateDiceSum(diceSet);
    }
  }

  if (mergedScoreData.lowerSection["full_house"].score === undefined) {
    if (
      isJoker ||
      (Object.values(diceCount).some((count) => count === 3) &&
        Object.values(diceCount).some((count) => count === 2))
    ) {
      mergedScoreData.lowerSection["full_house"].possibleScore = 25;
    }
  }

  if (mergedScoreData.lowerSection["small_straight"].score === undefined) {
    let allowed = false;

    if (isJoker) {
      allowed = true;
    } else {
      for (
        let start = 0;
        start <= unduplicatedSortedDice.length - 4;
        start += 1
      ) {
        const a = unduplicatedSortedDice[start];
        const b = unduplicatedSortedDice[start + 1];
        const c = unduplicatedSortedDice[start + 2];
        const d = unduplicatedSortedDice[start + 3];

        if (a === b - 1 && b === c - 1 && c === d - 1) {
          allowed = true;
        }
      }
    }

    if (allowed) {
      mergedScoreData.lowerSection["small_straight"].possibleScore = 30;
    }
  }

  if (mergedScoreData.lowerSection["large_straight"].score === undefined) {
    const [a, b, c, d, e] = sortedDice;

    if (isJoker || (a === b - 1 && b === c - 1 && c === d - 1 && d === e - 1)) {
      mergedScoreData.lowerSection["large_straight"].possibleScore = 40;
    }
  }

  if (mergedScoreData.lowerSection["chance"].score === undefined) {
    mergedScoreData.lowerSection["chance"].possibleScore = sum(diceSet);
  }

  if (isYatzy) {
    if (mergedScoreData.lowerSection["yatzy"].score === undefined) {
      mergedScoreData.lowerSection["yatzy"].possibleScore = 50;
    }
  }

  return mergedScoreData;
}

export function getTotalScore(scoreData: PlayerScoreData): TotalScore {
  const upperIntermediate = Object.values(scoreData.upperSection).reduce(
    (acc, categoryScore) => acc + (categoryScore ?? 0),
    0,
  );
  const lowerSectionTotal = Object.values(scoreData.lowerSection).reduce(
    (acc, categoryScore) => acc + (categoryScore ?? 0),
    0,
  );

  const upperBonus = upperIntermediate >= 63 ? 35 : 0;
  const upper = upperIntermediate + upperBonus;

  return {
    upperIntermediate,
    upperBonus,
    upperTotal: upper,
    lowerBonus: scoreData.yatzyBonus,
    lowerTotal: lowerSectionTotal,
    grandTotal: upper + lowerSectionTotal,
  };
}

export function calculateScoreboard({
  players,
  gameState,
  score,
}: {
  players: PlayerInfo[];
  score: Record<string, PlayerScoreData>;
  gameState: GameState;
}): ScoreboardPlayer[] {
  return players.map((playerInfo) => ({
    playerInfo: playerInfo,
    scoreData: addTemporaryScore(
      score[playerInfo.id],
      gameState.state === "game_start" &&
        gameState.currentPlayerId === playerInfo.id
        ? gameState.diceState
        : undefined,
    ),
    total: getTotalScore(score[playerInfo.id]),
  }));
}

export function getEmptyScoreData(): PlayerScoreData {
  return {
    upperSection: {},
    lowerSection: {},
    yatzyBonus: 0,
  };
}

export function getEmptyScoreForPlayers(
  players: PlayerInfo[],
): Record<string, PlayerScoreData> {
  const results = {} as Record<string, PlayerScoreData>;
  for (const { id } of players) {
    results[id] = getEmptyScoreData();
  }
  return results;
}

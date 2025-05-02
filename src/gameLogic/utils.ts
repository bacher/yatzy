import { last, sortBy, sortedUniq, sum, times } from "lodash";

import {
  CategoryId,
  Dice,
  diceOrdered,
  DiceState,
  GameStartState,
  GameState,
  isUpperCategory,
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
      yahtzee: convertScore(scoreData.lowerSection.yahtzee),
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
    scoreData.lowerSection.yahtzee !== undefined &&
    scoreData.lowerSection.yahtzee !== 0;

  const isJoker =
    isYatzy &&
    scoreData.lowerSection.yahtzee !== undefined &&
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
    if (mergedScoreData.lowerSection["yahtzee"].score === undefined) {
      mergedScoreData.lowerSection["yahtzee"].possibleScore = 50;
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

export function rollDice(gameState: GameStartState): GameStartState {
  if (gameState.rollNumber >= 3) {
    throw new Error("Too many rolls");
  }

  const updatedState: GameStartState = { ...gameState };

  if (updatedState.diceState && updatedState.diceState.keepIndexes.length > 0) {
    const { diceSet, keepIndexes } = updatedState.diceState;

    updatedState.diceState.diceSet = mapDice((diceIndex) =>
      keepIndexes.includes(diceIndex) ? diceSet[diceIndex] : randomDice(),
    );
  } else {
    updatedState.diceState = {
      diceSet: mapDice(randomDice),
      keepIndexes: [],
    };
  }

  updatedState.rollNumber += 1;

  return updatedState;
}

export function keepToggle(
  gameState: GameStartState,
  diceIndex: number,
  keep: boolean,
) {
  if (!gameState.diceState) {
    throw new Error("No dice to keep");
  }

  const { diceState } = gameState;

  return {
    ...gameState,
    diceState: {
      ...diceState,
      keepIndexes: keep
        ? [...diceState.keepIndexes, diceIndex]
        : diceState.keepIndexes.filter((i) => i !== diceIndex),
    },
  };
}

export function selectCategory(
  players: PlayerInfo[],
  gameState: GameStartState,
  score: Record<string, PlayerScoreData>,
  scoreboard: ScoreboardPlayer[],
  categoryId: CategoryId,
): {
  gameState: GameState;
  score: Record<string, PlayerScoreData>;
} {
  return {
    gameState: selectCategoryGameState(players, gameState),
    score: selectCategoryScore(gameState, score, scoreboard, categoryId),
  };
}

function selectCategoryScore(
  gameState: GameStartState,
  score: Record<string, PlayerScoreData>,
  scoreboard: ScoreboardPlayer[],
  categoryId: CategoryId,
): Record<string, PlayerScoreData> {
  const playerScoreboard = scoreboard.find(
    (scoreboardPlayer) =>
      scoreboardPlayer.playerInfo.id === gameState.currentPlayerId,
  )!;
  const { scoreData } = playerScoreboard;

  const section = isUpperCategory(categoryId) ? "upperSection" : "lowerSection";

  const currentScore = score[gameState.currentPlayerId];
  let possibleCategoryScore: number;
  if (isUpperCategory(categoryId)) {
    possibleCategoryScore =
      scoreData.upperSection[categoryId].possibleScore ?? 0;
  } else {
    possibleCategoryScore =
      scoreData.lowerSection[categoryId].possibleScore ?? 0;
  }

  return {
    ...score,
    [gameState.currentPlayerId]: {
      ...currentScore,
      [section]: {
        ...currentScore[section],
        [categoryId]: possibleCategoryScore,
      },
      yatzyBonus:
        currentScore.yatzyBonus +
        (playerScoreboard.scoreData.yatzyBonusAvailable ? 100 : 0),
    },
  };
}

function selectCategoryGameState(
  players: PlayerInfo[],
  gameState: GameStartState,
): GameState {
  const updatedGameState: GameStartState = { ...gameState };

  if (gameState.currentPlayerId === last(players)!.id) {
    if (gameState.turn === 12) {
      return {
        state: "game_over",
      };
    }
    updatedGameState.turn += 1;
    updatedGameState.currentPlayerId = players[0].id;
  } else {
    const currentPlayerIndex = players.findIndex(
      (player) => player.id === gameState.currentPlayerId,
    );
    updatedGameState.currentPlayerId = players[currentPlayerIndex + 1].id;
  }

  updatedGameState.rollNumber = 0;
  updatedGameState.diceState = undefined;

  return updatedGameState;
}

export function getEmptyGameState(players: PlayerInfo[]): GameState {
  return {
    state: "game_start",
    currentPlayerId: players[0].id,
    turn: 0,
    rollNumber: 0,
    diceState: undefined,
  };
}

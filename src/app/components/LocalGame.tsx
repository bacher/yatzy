"use client";

import { useMemo, useState } from "react";
import { last } from "lodash";

import { PlayerInfo } from "@/OnlineGameDurableObject";
import {
  GameStartState,
  GameState,
  isUpperCategory,
  LowerCategory,
  PlayerScoreData,
  UpperCategory,
} from "@/gameLogic/types";
import {
  addTemporaryScore,
  getTotalScore,
  mapDice,
  randomDice,
} from "@/gameLogic/utils";

import { Board } from "@/app/components/Board";
import { ScoreboardPlayer } from "@/app/components/Scoreboard";

function getEmptyScoreData(): PlayerScoreData {
  return {
    upperSection: {},
    lowerSection: {},
    yatzyBonus: 0,
  };
}

function getEmptyScoreForPlayers(
  players: PlayerInfo[],
): Record<string, PlayerScoreData> {
  const results = {} as Record<string, PlayerScoreData>;
  for (const { id } of players) {
    results[id] = getEmptyScoreData();
  }
  return results;
}

function getEmptyGameState(players: PlayerInfo[]): GameState {
  return {
    state: "game_start",
    currentPlayerId: players[0].id,
    turn: 0,
    rollNumber: 0,
    diceState: undefined,
  };
}

type LocalGameProps = {
  players: PlayerInfo[];
};

export const LocalGame = ({ players }: LocalGameProps) => {
  const [gameState, setGameState] = useState<GameState>(() =>
    getEmptyGameState(players),
  );

  const [score, setScore] = useState(() => getEmptyScoreForPlayers(players));

  const scoreboard = useMemo<ScoreboardPlayer[]>(
    () =>
      players.map((playerInfo) => ({
        playerInfo: playerInfo,
        scoreData: addTemporaryScore(
          score[playerInfo.id],
          gameState.state === "game_start" &&
            gameState.currentPlayerId === playerInfo.id
            ? gameState.diceState
            : undefined,
        ),
        total: getTotalScore(score[playerInfo.id]),
      })),
    [score, gameState],
  );

  const onRollClick = () => {
    if (gameState.state !== "game_start") {
      return;
    }

    const updatedState: GameStartState = { ...gameState };

    if (
      updatedState.diceState &&
      updatedState.diceState.keepIndexes.length > 0
    ) {
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

    setGameState(updatedState);
  };

  const onRestartClick = () => {
    setScore(getEmptyScoreForPlayers(players));
    setGameState(getEmptyGameState(players));
  };

  const onKeepToggle = (diceIndex: number, keep: boolean) => {
    if (gameState.state !== "game_start" || !gameState.diceState) {
      throw new Error("Invalid state");
    }

    const { diceState } = gameState;

    setGameState({
      ...gameState,
      diceState: {
        ...diceState,
        keepIndexes: keep
          ? [...diceState.keepIndexes, diceIndex]
          : diceState.keepIndexes.filter((i) => i !== diceIndex),
      },
    });
  };

  const onCategorySelect = (categoryId: UpperCategory | LowerCategory) => {
    if (gameState.state !== "game_start") {
      throw new Error("Invalid state");
    }

    setScore((score) => {
      const playerScoreboard = scoreboard.find(
        (scoreboardPlayer) =>
          scoreboardPlayer.playerInfo.id === gameState.currentPlayerId,
      )!;
      const { scoreData } = playerScoreboard;

      const section = isUpperCategory(categoryId)
        ? "upperSection"
        : "lowerSection";

      const currentScore = score[gameState.currentPlayerId];
      let updatedScore: number | undefined;
      if (isUpperCategory(categoryId)) {
        updatedScore = scoreData.upperSection[categoryId].possibleScore;
      } else {
        updatedScore = scoreData.lowerSection[categoryId].possibleScore;
      }

      return {
        ...score,
        [gameState.currentPlayerId]: {
          ...currentScore,
          [section]: {
            ...currentScore[section],
            [categoryId]: updatedScore,
          },
          yatzyBonus:
            currentScore.yatzyBonus +
            (playerScoreboard.scoreData.yatzyBonusAvailable ? 100 : 0),
        },
      };
    });

    const updatedGameState: GameStartState = { ...gameState };

    if (gameState.currentPlayerId === last(players)!.id) {
      if (gameState.turn === 12) {
        setGameState({
          state: "game_over",
        });
        return;
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

    setGameState(updatedGameState);
  };

  return (
    <Board
      players={players}
      gameState={gameState}
      scoreboard={scoreboard}
      onRollClick={onRollClick}
      onKeepToggle={onKeepToggle}
      onCategorySelect={onCategorySelect}
      onRestartClick={onRestartClick}
    />
  );
};

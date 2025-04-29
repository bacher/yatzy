"use client";

import { useMemo, useState } from "react";
import { last } from "lodash";

import { PlayerInfo } from "@/OnlineGameDurableObject";
import {
  CategoryId,
  GameStartState,
  GameState,
  isUpperCategory,
  LowerCategoryId,
  UpperCategoryId,
} from "@/gameLogic/types";
import {
  calculateScoreboard,
  getEmptyGameState,
  getEmptyScoreForPlayers,
  keepToggle,
  mapDice,
  randomDice,
  rollDice,
  selectCategory,
} from "@/gameLogic/utils";

import { Board } from "@/app/components/Board";
import { ScoreboardPlayer } from "@/app/components/Scoreboard";
import { Page } from "@/app/components/Page";

type LocalGameProps = {
  players: PlayerInfo[];
};

export const LocalGame = ({ players }: LocalGameProps) => {
  const [gameState, setGameState] = useState<GameState>(() =>
    getEmptyGameState(players),
  );

  const [score, setScore] = useState(() => getEmptyScoreForPlayers(players));

  const scoreboard = useMemo<ScoreboardPlayer[]>(
    () => calculateScoreboard({ players, gameState, score }),
    [score, gameState, score],
  );

  const onRollClick = () => {
    if (gameState.state !== "game_start") {
      return;
    }

    setGameState(rollDice(gameState));
  };

  const onRestartClick = () => {
    setScore(getEmptyScoreForPlayers(players));
    setGameState(getEmptyGameState(players));
  };

  const onKeepToggle = (diceIndex: number, keep: boolean) => {
    if (gameState.state !== "game_start") {
      throw new Error("Invalid state");
    }

    setGameState(keepToggle(gameState, diceIndex, keep));
  };

  const onCategorySelect = (categoryId: CategoryId) => {
    if (gameState.state !== "game_start") {
      throw new Error("Invalid state");
    }

    const updated = selectCategory(
      players,
      gameState,
      score,
      scoreboard,
      categoryId,
    );

    setScore(updated.score);
    setGameState(updated.gameState);
  };

  return (
    <Page>
      <Board
        players={players}
        localPlayerIds={players.map(({ id }) => id)}
        gameState={gameState}
        scoreboard={scoreboard}
        onRollClick={onRollClick}
        onKeepToggle={onKeepToggle}
        onCategorySelect={onCategorySelect}
        onRestartClick={onRestartClick}
      />
    </Page>
  );
};

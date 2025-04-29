"use client";

import { GameState, PlayerScoreData } from "@/gameLogic/types";
import { PlayerInfo } from "@/OnlineGameDurableObject";
import { Board } from "@/app/components/Board";
import { useMemo } from "react";
import { ScoreboardPlayer } from "@/app/components/Scoreboard";
import {
  calculateScoreboard,
  getEmptyScoreForPlayers,
} from "@/gameLogic/utils";

type OnlineGameProps = {
  roomId: string;
  players: PlayerInfo[];
  gameState: GameState;
};

export const OnlineGame = ({ players, gameState }: OnlineGameProps) => {
  // TODO: temp
  const score = useMemo(() => getEmptyScoreForPlayers(players), [players]);

  const scoreboard = useMemo<ScoreboardPlayer[]>(
    () => calculateScoreboard({ players, gameState, score }),
    [score, gameState, score],
  );

  return (
    <>
      <pre>{JSON.stringify(gameState, null, 2)}</pre>
      <Board
        players={players}
        gameState={gameState}
        scoreboard={scoreboard}
        onRollClick={() => {}}
        onKeepToggle={() => {}}
        onCategorySelect={() => {}}
        onRestartClick={() => {}}
      />
    </>
  );
};

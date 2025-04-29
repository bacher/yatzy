"use client";

import { PlayerInfo } from "@/OnlineGameDurableObject";
import {
  CategoryId,
  GameState,
  LowerCategoryId,
  UpperCategoryId,
} from "@/gameLogic/types";

import { Scoreboard, ScoreboardPlayer } from "@/app/components/Scoreboard";
import { DiceBoard } from "@/app/components/DiceBoard";
import { GameOverResults } from "@/app/components/GameOverResults";

type BoardProps = {
  players: PlayerInfo[];
  localPlayerIds: string[];
  gameState: GameState;
  scoreboard: ScoreboardPlayer[];
  onRollClick: () => void;
  onKeepToggle: (diceIndex: number, keep: boolean) => void;
  onCategorySelect: (categoryId: CategoryId) => void;
  onRestartClick: () => void;
};

export const Board = ({
  players,
  localPlayerIds,
  gameState,
  scoreboard,
  onRollClick,
  onKeepToggle,
  onCategorySelect,
  onRestartClick,
}: BoardProps) => {
  const getPlayerById = (playerId: string): PlayerInfo => {
    const player = players.find(({ id }) => id === playerId);

    if (!player) {
      throw new Error("Invalid player id");
    }

    return player;
  };

  const isCurrentPlayerLocal =
    gameState.state === "game_start"
      ? localPlayerIds.includes(gameState.currentPlayerId)
      : false;

  return (
    <div className="board">
      <div className="board__panel">
        <h1>Yatzy</h1>
        {gameState.state === "game_over" ? (
          <>
            <GameOverResults scoreboardPlayers={scoreboard} />
            <div>
              {localPlayerIds.includes(players[0].id) ? (
                <button type="button" onClick={onRestartClick}>
                  Start new game
                </button>
              ) : (
                <span>Waiting for host</span>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="board__turn-info">
              <h2>Turn: {gameState.turn + 1} of 13</h2>
              <h2>Player: {getPlayerById(gameState.currentPlayerId).name}</h2>
            </div>
            {gameState.diceState ? (
              (() => (
                <DiceBoard
                  diceSet={gameState.diceState.diceSet}
                  keepIndexes={gameState.diceState.keepIndexes}
                  isPlayerTurn={isCurrentPlayerLocal}
                  remainedRerolls={3 - gameState.rollNumber}
                  rollButton={
                    <button type="button" data-primary onClick={onRollClick}>
                      Reroll dice
                    </button>
                  }
                  onKeepToggle={onKeepToggle}
                />
              ))()
            ) : (
              <div>
                {isCurrentPlayerLocal
                  ? "Your turn"
                  : "Waiting for another player to end their turn"}
              </div>
            )}
            {isCurrentPlayerLocal && gameState.diceState === undefined && (
              <div>
                <button type="button" data-primary onClick={onRollClick}>
                  Roll dice
                </button>
              </div>
            )}
            {gameState.rollNumber > 2 && <div>Select category</div>}
          </>
        )}
      </div>
      <div className="board__panel">
        <Scoreboard
          scoreboard={scoreboard}
          activePlayerId={
            gameState.state === "game_start"
              ? gameState.currentPlayerId
              : undefined
          }
          isPlayerTurn={isCurrentPlayerLocal}
          onCategorySelect={onCategorySelect}
        />
      </div>
    </div>
  );
};

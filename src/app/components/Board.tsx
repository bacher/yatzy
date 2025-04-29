"use client";

import { PlayerInfo } from "@/OnlineGameDurableObject";
import { GameState, LowerCategory, UpperCategory } from "@/gameLogic/types";

import { Scoreboard, ScoreboardPlayer } from "@/app/components/Scoreboard";
import { DiceBoard } from "@/app/components/DiceBoard";
import { GameOverResults } from "@/app/components/GameOverResults";
import { Page } from "@/app/components/Page";

type BoardProps = {
  players: PlayerInfo[];
  gameState: GameState;
  scoreboard: ScoreboardPlayer[];
  onRollClick: () => void;
  onKeepToggle: (diceIndex: number, keep: boolean) => void;
  onCategorySelect: (categoryId: UpperCategory | LowerCategory) => void;
  onRestartClick: () => void;
};

export const Board = ({
  players,
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

  return (
    <div className="board">
      <div className="board__panel">
        <h1>Yatzy</h1>
        {gameState.state === "game_over" ? (
          <>
            <GameOverResults scoreboardPlayers={scoreboard} />
            <div>
              <button type="button" onClick={onRestartClick}>
                Start new game
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Turn: {gameState.turn + 1} of 13</h2>
            <h2>
              Current player: {getPlayerById(gameState.currentPlayerId).name}
            </h2>
            {gameState.diceState ? (
              (() => (
                <DiceBoard
                  diceSet={gameState.diceState.diceSet}
                  keepIndexes={gameState.diceState.keepIndexes}
                  rollButton={
                    gameState.rollNumber <= 2 ? (
                      <button type="button" data-primary onClick={onRollClick}>
                        Reroll dice
                      </button>
                    ) : undefined
                  }
                  onKeepToggle={onKeepToggle}
                />
              ))()
            ) : (
              <div>Your turn</div>
            )}
            {gameState.diceState === undefined && (
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
          onCategorySelect={onCategorySelect}
        />
      </div>
    </div>
  );
};

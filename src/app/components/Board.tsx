"use client";

import { Scoreboard, ScoreboardPlayer } from "@/app/components/Scoreboard";
import { useMemo, useState } from "react";
import {
  GameStartState,
  GameState,
  isUpperCategory,
  Player,
  PlayerScoreData,
} from "@/gameLogic/types";
import { DiceBoard } from "@/app/components/DiceBoard";
import {
  addTemporaryScore,
  getTotalScore,
  mapDice,
  randomDice,
} from "@/gameLogic/utils";
import { last } from "lodash";
import { GameOverResults } from "@/app/components/GameOverResults";
import { Page } from "@/app/components/Page";
import { PlayerInfo } from "@/OnlineGameDurableObject";

function getEmptyScoreData(): PlayerScoreData {
  return {
    upperSection: {},
    lowerSection: {},
    yatzyBonus: 0,
  };
}

type BoardProps = {
  players: PlayerInfo[];
};

function generateEmptyScoreForPlayers(
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

export const Board = ({ players }: BoardProps) => {
  const [score, setScore] = useState(() =>
    generateEmptyScoreForPlayers(players),
  );

  const [gameState, setGameState] = useState<GameState>(() =>
    getEmptyGameState(players),
  );

  const getPlayerById = (playerId: string): PlayerInfo => {
    const player = players.find(({ id }) => id === playerId);

    if (!player) {
      throw new Error("Invalid player id");
    }

    return player;
  };

  const scoreboardPlayers = useMemo<ScoreboardPlayer[]>(
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

  return (
    <Page>
      <div className="board">
        <div className="board__panel">
          <h1>Yatzy</h1>
          {gameState.state === "game_over" ? (
            <>
              <GameOverResults scoreboardPlayers={scoreboardPlayers} />
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setScore(generateEmptyScoreForPlayers(players));
                    setGameState(getEmptyGameState(players));
                  }}
                >
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
                (() => {
                  const { diceState } = gameState;

                  return (
                    <DiceBoard
                      diceSet={gameState.diceState.diceSet}
                      keepIndexes={gameState.diceState.keepIndexes}
                      rollButton={
                        gameState.rollNumber <= 2 ? (
                          <button
                            type="button"
                            data-primary
                            onClick={onRollClick}
                          >
                            Reroll dice
                          </button>
                        ) : undefined
                      }
                      onKeepToggle={(diceIndex, keep) => {
                        setGameState({
                          ...gameState,
                          diceState: {
                            ...diceState,
                            keepIndexes: keep
                              ? [...diceState.keepIndexes, diceIndex]
                              : diceState.keepIndexes.filter(
                                  (i) => i !== diceIndex,
                                ),
                          },
                        });
                      }}
                    />
                  );
                })()
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
            players={scoreboardPlayers}
            activePlayerId={
              gameState.state === "game_start"
                ? gameState.currentPlayerId
                : undefined
            }
            onCategorySelect={(categoryId, updatedScore) => {
              if (gameState.state !== "game_start") {
                throw new Error("Invalid state");
              }

              setScore((score) => {
                const section = isUpperCategory(categoryId)
                  ? "upperSection"
                  : "lowerSection";

                const scoreboard = scoreboardPlayers.find(
                  (scoreboardPlayer) =>
                    scoreboardPlayer.playerInfo.id ===
                    gameState.currentPlayerId,
                )!;

                const currentScore = score[gameState.currentPlayerId];

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
                      (scoreboard.scoreData.yatzyBonusAvailable ? 100 : 0),
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
                updatedGameState.currentPlayerId =
                  players[currentPlayerIndex + 1].id;
              }

              updatedGameState.rollNumber = 0;
              updatedGameState.diceState = undefined;

              setGameState(updatedGameState);
            }}
          />
        </div>
      </div>
    </Page>
  );
};

"use client";

import { Scoreboard, ScoreboardPlayer } from "@/app/components/Scoreboard";
import { useMemo, useState } from "react";
import {
  DiceState,
  isUpperCategory,
  Player,
  PlayerScoreData,
} from "@/logic/types";
import { DiceBoard } from "@/app/components/DiceBoard";
import {
  addTemporaryScore,
  getTotalScore,
  mapDice,
  randomDice,
} from "@/logic/utils";
import { last } from "lodash";
import { GameOverResults } from "@/app/components/GameOverResults";
import { Page } from "@/app/components/Page";

function getEmptyScoreData(): PlayerScoreData {
  return {
    upperSection: {},
    lowerSection: {},
    yatzyBonus: 0,
  };
}

type GamePlayState = {
  state: "game_start";
  currentPlayerId: string;
  turn: number;
  diceState: DiceState | undefined;
  rollNumber: number;
};

type GameOverState = {
  state: "game_over";
};

type GameState = GamePlayState | GameOverState;

type GameStateType = GameState["state"];

type BoardProps = {
  playerNames: string[];
};

export const Board = ({ playerNames }: BoardProps) => {
  const [players, setPlayers] = useState<Player[]>(() =>
    playerNames.map((playerName, index) => ({
      playerInfo: {
        id: `id:${index}`,
        name: playerName,
      },
      scoreData: getEmptyScoreData(),
    })),
  );

  const [gameState, setGameState] = useState<GameState>(() => ({
    state: "game_start",
    currentPlayerId: players[0].playerInfo.id,
    turn: 0,
    rollNumber: 0,
    diceState: undefined,
  }));

  const getPlayerById = (id: string): Player => {
    const player = players.find(({ playerInfo }) => playerInfo.id === id);

    if (!player) {
      throw new Error("Invalid player id");
    }

    return player;
  };

  const scoreboardPlayers = useMemo<ScoreboardPlayer[]>(
    () =>
      players.map((player) => ({
        ...player,
        scoreData: addTemporaryScore(
          player.scoreData,
          gameState.state === "game_start" &&
            gameState.currentPlayerId === player.playerInfo.id
            ? gameState.diceState
            : undefined,
        ),
        total: getTotalScore(player.scoreData),
      })),
    [players, gameState],
  );

  const onRollClick = () => {
    if (gameState.state !== "game_start") {
      return;
    }

    const updatedState: GamePlayState = { ...gameState };

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
                    setPlayers(
                      players.map((player) => ({
                        ...player,
                        scoreData: getEmptyScoreData(),
                      })),
                    );
                    setGameState({
                      state: "game_start",
                      currentPlayerId: players[0].playerInfo.id,
                      turn: 0,
                      rollNumber: 0,
                      diceState: undefined,
                    });
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
                Current player:{" "}
                {getPlayerById(gameState.currentPlayerId).playerInfo.name}
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

              setPlayers((players) =>
                players.map((player) => {
                  if (player.playerInfo.id === gameState.currentPlayerId) {
                    const section = isUpperCategory(categoryId)
                      ? "upperSection"
                      : "lowerSection";

                    const scoreboard = scoreboardPlayers.find(
                      (scoreboardPlayer) =>
                        scoreboardPlayer.playerInfo.id === player.playerInfo.id,
                    )!;

                    return {
                      ...player,
                      scoreData: {
                        ...player.scoreData,
                        [section]: {
                          ...player.scoreData[section],
                          [categoryId]: updatedScore,
                        },
                        yatzyBonus:
                          player.scoreData.yatzyBonus +
                          (scoreboard.scoreData.yatzyBonusAvailable ? 100 : 0),
                      },
                    };
                  }
                  return player;
                }),
              );

              const updatedGameState: GamePlayState = { ...gameState };

              if (gameState.currentPlayerId === last(players)!.playerInfo.id) {
                if (gameState.turn === 12) {
                  setGameState({
                    state: "game_over",
                  });
                  return;
                }
                updatedGameState.turn += 1;
                updatedGameState.currentPlayerId = players[0].playerInfo.id;
              } else {
                updatedGameState.currentPlayerId =
                  players[
                    players.indexOf(getPlayerById(gameState.currentPlayerId)) +
                      1
                  ].playerInfo.id;
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

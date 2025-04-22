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
import { last, sortBy } from "lodash";
import { GameOverResults } from "@/app/components/GameOverResults";

function getEmptyScoreData(): PlayerScoreData {
  return {
    upperSection: {},
    lowerSection: {},
  };
}

type GameState = "game_start" | "game_over";

export const Board = () => {
  const [gameState, setGameState] = useState<GameState>("game_start");

  const [players, setPlayers] = useState<Player[]>(() => [
    {
      playerInfo: {
        id: "1",
        name: "Player 1",
      },
      scoreData: getEmptyScoreData(),
    },
    {
      playerInfo: {
        id: "2",
        name: "Player 2",
      },
      scoreData: getEmptyScoreData(),
    },
  ]);

  const [currentPlayerId, setCurrentPlayerId] = useState(
    players[0].playerInfo.id,
  );
  const currentPlayer = useMemo(
    () => players.find(({ playerInfo }) => playerInfo.id === currentPlayerId)!,
    [currentPlayerId, players],
  );

  const [turn, setTurn] = useState(0);
  const [diceState, setDiceState] = useState<DiceState | undefined>();
  const [rollNumber, setRollNumber] = useState(0);

  const scoreboardPlayers = useMemo<ScoreboardPlayer[]>(
    () =>
      players.map((player) => ({
        ...player,
        scoreData: addTemporaryScore(
          player.scoreData,
          player.playerInfo.id === currentPlayerId && gameState === "game_start"
            ? diceState
            : undefined,
        ),
        total: getTotalScore(player.scoreData),
      })),
    [players, diceState],
  );

  const onRollClick = () => {
    if (diceState && diceState.keepIndexes.length > 0) {
      const { diceSet, keepIndexes } = diceState;

      setDiceState({
        ...diceState,
        diceSet: mapDice((diceIndex) =>
          keepIndexes.includes(diceIndex) ? diceSet[diceIndex] : randomDice(),
        ),
      });
    } else {
      setDiceState({
        diceSet: mapDice(randomDice),
        keepIndexes: [],
      });
    }

    setRollNumber((rollNumber) => rollNumber + 1);
  };

  return (
    <div className="board">
      <div className="board__panel">
        {gameState === "game_over" ? (
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
                  setCurrentPlayerId(players[0].playerInfo.id);
                  setTurn(0);
                  setRollNumber(0);
                  setDiceState(undefined);
                  setGameState("game_start");
                }}
              >
                Start new game
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Turn: {turn + 1} of 13</h2>
            <h2>Current player: {currentPlayer.playerInfo.name}</h2>
            {diceState ? (
              <DiceBoard
                diceSet={diceState.diceSet}
                keepIndexes={diceState.keepIndexes}
                allowKeeping={rollNumber <= 2}
                onKeepToggle={(diceIndex, keep) => {
                  setDiceState({
                    ...diceState,
                    keepIndexes: keep
                      ? [...diceState.keepIndexes, diceIndex]
                      : diceState.keepIndexes.filter((i) => i !== diceIndex),
                  });
                }}
              />
            ) : (
              <div>Your turn</div>
            )}
            {rollNumber <= 2 ? (
              <div>
                <button type="button" onClick={onRollClick}>
                  {rollNumber === 0 ? "Roll dice" : "Reroll dice"}
                </button>
              </div>
            ) : (
              <div>Select category</div>
            )}
          </>
        )}
      </div>
      <div className="board__panel">
        <Scoreboard
          players={scoreboardPlayers}
          activePlayerId={currentPlayerId}
          onCategorySelect={(categoryId, updatedScore) => {
            setPlayers((players) =>
              players.map((player) => {
                if (player.playerInfo.id === currentPlayerId) {
                  const section = isUpperCategory(categoryId)
                    ? "upperSection"
                    : "lowerSection";

                  return {
                    ...player,
                    scoreData: {
                      ...player.scoreData,
                      [section]: {
                        ...player.scoreData[section],
                        [categoryId]: updatedScore,
                      },
                    },
                  };
                }
                return player;
              }),
            );

            if (currentPlayerId === last(players)!.playerInfo.id) {
              if (turn === 12) {
                setGameState("game_over");
                return;
              }
              setTurn((turn) => turn + 1);
              setCurrentPlayerId(players[0].playerInfo.id);
            } else {
              setCurrentPlayerId(
                players[players.indexOf(currentPlayer) + 1].playerInfo.id,
              );
            }

            setRollNumber(0);
            setDiceState(undefined);
          }}
        />
      </div>
    </div>
  );
};

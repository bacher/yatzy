"use client";

import { Scoreboard, ScoreboardPlayer } from "@/app/components/Scoreboard";
import { useMemo, useState } from "react";
import { DiceState, Player } from "@/logic/types";
import { DiceBoard } from "@/app/components/DiceBoard";
import {
  addTemporaryScore,
  getTotalScore,
  mapDice,
  randomDice,
} from "@/logic/utils";

export const Board = () => {
  const [players, setPlayers] = useState<Player[]>([
    {
      playerInfo: {
        id: "1",
        name: "Player 1",
      },
      scoreData: {
        upperSection: {},
        lowerSection: {},
      },
    },
    {
      playerInfo: {
        id: "2",
        name: "Player 2",
      },
      scoreData: {
        upperSection: {},
        lowerSection: {},
      },
    },
  ]);

  const [currentPlayerId, setCurrentPlayerId] = useState(
    players[0].playerInfo.id,
  );
  const currentPlayer = useMemo(
    () => players.find(({ playerInfo }) => playerInfo.id === currentPlayerId)!,
    [currentPlayerId, players],
  );

  const [diceState, setDiceState] = useState<DiceState | undefined>();
  const [rollNumber, setRollNumber] = useState(0);

  const scoreboardPlayers = useMemo<ScoreboardPlayer[]>(
    () =>
      players.map((player) => ({
        ...player,
        scoreData: addTemporaryScore(
          player.scoreData,
          player.playerInfo.id === currentPlayerId ? diceState : undefined,
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
          <div>Let's play</div>
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
      </div>
      <div className="board__panel">
        {/*<h2>Scoreboard</h2>*/}
        <Scoreboard players={scoreboardPlayers} />
      </div>
    </div>
  );
};

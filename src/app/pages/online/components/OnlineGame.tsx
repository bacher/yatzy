"use client";

import { useLayoutEffect, useMemo, useState } from "react";

import { GameState, PlayerScoreData } from "@/gameLogic/types";
import { PlayerInfo } from "@/OnlineGameDurableObject";
import { Board } from "@/app/components/Board";
import { ScoreboardPlayer } from "@/app/components/Scoreboard";
import {
  calculateScoreboard,
  getEmptyScoreForPlayers,
} from "@/gameLogic/utils";
import { getLocalPlayerInfo } from "@/app/utils/localStorage";
import {
  keepToggleAction,
  restartGameAction,
  rollDiceAction,
  selectCategoryAction,
} from "@/app/pages/functions";

type OnlineGameProps = {
  roomId: string;
  players: PlayerInfo[];
  gameState: GameState;
  score: Record<string, PlayerScoreData>;
};

export const OnlineGame = ({
  roomId,
  players,
  gameState,
  score,
}: OnlineGameProps) => {
  const [me, setMe] = useState<PlayerInfo | undefined>();
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  useLayoutEffect(() => {
    setMe(getLocalPlayerInfo);

    if (new URLSearchParams(window.location.search).has("debug")) {
      setShowDebugInfo(true);
    }
  }, []);

  const scoreboard = useMemo<ScoreboardPlayer[]>(
    () => calculateScoreboard({ players, gameState, score }),
    [score, gameState, score],
  );

  if (!me) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Board
        players={players}
        localPlayerIds={[me.id]}
        gameState={gameState}
        scoreboard={scoreboard}
        onRollClick={() => {
          rollDiceAction(roomId, me.id).catch(console.error);
        }}
        onKeepToggle={(diceIndex, keep) => {
          keepToggleAction(roomId, me.id, diceIndex, keep).catch(console.error);
        }}
        onCategorySelect={(categoryId) => {
          selectCategoryAction(roomId, me.id, categoryId).catch(console.error);
        }}
        onRestartClick={() => {
          restartGameAction(roomId, me.id).catch(console.error);
        }}
      />
      {showDebugInfo && (
        <div className="online-game__debug-info">
          <div>
            <div>Game State</div>
            <pre>{JSON.stringify(gameState, null, 2)}</pre>
          </div>
          <div>
            <div>Players</div>
            <pre>{JSON.stringify(players, null, 2)}</pre>
          </div>
          <div>
            <div>Score</div>
            <pre>{JSON.stringify(score, null, 2)}</pre>
          </div>
        </div>
      )}
    </>
  );
};

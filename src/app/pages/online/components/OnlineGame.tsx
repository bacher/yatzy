"use client";

import { useLayoutEffect, useMemo, useState } from "react";

import { GameState, PlayerScoreData } from "@/gameLogic/types";
import {
  PlayerInfo,
  PlayerInfoWithClientSecret,
} from "@/OnlineGameDurableObject";
import { Board } from "@/app/components/Board";
import { ScoreboardPlayer } from "@/app/components/Scoreboard";
import { calculateScoreboard } from "@/gameLogic/utils";
import { getOnlinePlayerInfo } from "@/app/utils/localStorage";
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
  const [me, setMe] = useState<PlayerInfoWithClientSecret | undefined>();
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  useLayoutEffect(() => {
    setMe(getOnlinePlayerInfo);

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
          rollDiceAction(roomId, me).catch(console.error);
        }}
        onKeepToggle={(diceIndex, keep) => {
          keepToggleAction(roomId, me, diceIndex, keep).catch(console.error);
        }}
        onCategorySelect={(categoryId) => {
          selectCategoryAction(roomId, me, categoryId).catch(console.error);
        }}
        onRestartClick={() => {
          restartGameAction(roomId, me).catch(console.error);
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

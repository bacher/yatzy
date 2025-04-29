import { useState } from "react";
import { RequestInfo } from "@redwoodjs/sdk/worker";

import { Page } from "@/app/components/Page";
import { getContent } from "@/app/pages/functions";

import { Lobby } from "./components/Lobby";
import { OnlineGame } from "./components/OnlineGame";
import { GameState } from "@/gameLogic/types";

export const HostOnlineGame = async ({
  params,
}: RequestInfo<{ roomId: string }>) => {
  const roomId = params.roomId;
  const roomInfo = await getContent(roomId);

  return (
    <Page className="host-online-game">
      {roomInfo.roomState === "lobby" ? (
        <Lobby roomId={roomId} roomInfo={{ ...roomInfo }} />
      ) : (
        <OnlineGame
          roomId={roomId}
          players={roomInfo.players}
          gameState={roomInfo.gameState as GameState}
        />
      )}
    </Page>
  );
};

import { useState } from "react";
import { RequestInfo } from "@redwoodjs/sdk/worker";

import { Page } from "@/app/components/Page";
import { HostRoom } from "@/app/components/HostRoom";
import { getContent } from "@/app/pages/functions";

import { Lobby } from "./components/Lobby";
import { OnlineGame } from "./components/OnlineGame";

export const HostOnlineGame = async ({
  params,
}: RequestInfo<{ roomId: string }>) => {
  const roomId = params.roomId;
  const roomInfo = await getContent(roomId);

  return (
    <Page>
      <h1>Host Online Game</h1>
      <h2>Room ID: {roomId}</h2>

      {roomInfo.roomState === "lobby" ? (
        <Lobby roomId={roomId} roomInfo={{ ...roomInfo }} />
      ) : (
        <OnlineGame />
      )}
    </Page>
  );
};

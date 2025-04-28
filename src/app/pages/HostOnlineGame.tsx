import { RequestInfo } from "@redwoodjs/sdk/worker";

import { Page } from "@/app/components/Page";
import { HostRoom } from "@/app/components/HostRoom";
import { getContent } from "@/app/pages/functions";

export const HostOnlineGame = async ({
  params,
}: RequestInfo<{ roomId: string }>) => {
  const roomId = params.roomId;
  const content = await getContent(roomId);

  return (
    <Page>
      <h1>Host Online Game</h1>

      <div>ID: {roomId}</div>

      <HostRoom roomId={roomId} initialContent={content.gameState} />
    </Page>
  );
};

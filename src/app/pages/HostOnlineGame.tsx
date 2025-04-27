import { RequestInfo } from "@redwoodjs/sdk/worker";

import { Page } from "@/app/components/Page";
import { HostRoom } from "@/app/components/HostRoom";
import { getContent } from "@/app/pages/functions";

export const HostOnlineGame = async ({
  params,
  request,
}: RequestInfo<{ roomId: string }>) => {
  const roomId = params.roomId;
  const secondRoomId = "34123";

  const content = await getContent(roomId);
  let content2;

  const url = new URL(request.url);
  if (url.searchParams.has("addroom")) {
    content2 = await getContent(secondRoomId);
  }

  return (
    <Page>
      <h1>Host Online Game</h1>

      <div>ID: {roomId}</div>

      <HostRoom roomId={roomId} initialContent={content} />
      {content2 !== undefined && (
        <HostRoom roomId={secondRoomId} initialContent={content2} />
      )}
    </Page>
  );
};

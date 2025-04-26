import { RequestInfo } from "@redwoodjs/sdk/worker";

import { Page } from "@/app/components/Page";
import { HostRoom } from "@/app/components/HostRoom";
import { getContent } from "@/app/pages/functions";

export const HostOnlineGame = async ({
  params,
}: RequestInfo<{ roomId: string }>) => {
  const content = await getContent(params.roomId);

  return (
    <Page>
      <h1>Host Online Game</h1>

      <div>ID: {params.roomId}</div>

      <HostRoom roomId={params.roomId} initialContent={content} />
    </Page>
  );
};

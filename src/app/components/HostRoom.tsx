"use client";

import { useEffect } from "react";
import { updateContent } from "@/app/pages/functions";
// import { initRealtimeClient } from "@redwoodjs/sdk/realtime/client";

type HostRoomProps = {
  roomId: string;
  initialContent: string;
};

export const HostRoom = ({ roomId, initialContent }: HostRoomProps) => {
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       await initRealtimeClient({
  //         key: roomId,
  //       });
  //       console.log("realtime client initialized");
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   })();
  // }, []);

  console.log("initialContent", initialContent);

  return (
    <div>
      <h1>Host room {roomId}</h1>
      <pre>[{initialContent}]</pre>
      <button
        type="button"
        onClick={() => {
          const newValue = `HELLO_${Math.random()}`;
          console.log(`set content to ${newValue}`);
          updateContent(roomId, newValue).then(
            () => console.log("content updated"),
            (error) => console.error(error),
          );
        }}
      >
        set content
      </button>
    </div>
  );
};

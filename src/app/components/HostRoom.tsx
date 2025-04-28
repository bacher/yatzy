"use client";

import { updateContent } from "@/app/pages/functions";
import { OnlineGameState } from "@/OnlineGameDurableObject";

type HostRoomProps = {
  roomId: string;
  initialContent: OnlineGameState;
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
      <pre>
        a: {initialContent.a}, b: {initialContent.b}
      </pre>
      <button
        type="button"
        onClick={() => {
          const newValue = `HELLO_${Math.random()}`;
          console.log(`set content to ${newValue}`);
          updateContent(roomId, {
            roomState: {
              a: (initialContent?.a ?? 0) + 1,
              b: newValue,
            },
          }).then(
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

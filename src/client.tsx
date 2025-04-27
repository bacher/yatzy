import { initClient } from "@redwoodjs/sdk/client";

import { initRealtimeClient } from "@redwoodjs/sdk/realtime/client";

if (window.location.pathname.startsWith("/host/")) {
  console.log("initRealtimeClient");
  initRealtimeClient({
    key: window.location.pathname,
  });
} else {
  console.log("initClient");
  initClient();
}

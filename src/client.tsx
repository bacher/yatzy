import { initClient } from "@redwoodjs/sdk/client";

import { initRealtimeClient } from "@redwoodjs/sdk/realtime/client";

navigator.serviceWorker.register("/sw.js").then(
  (registration) => {
    console.log("Service worker registration succeeded:", registration);
  },
  (error) => {
    console.error(`Service worker registration failed: ${error}`);
  },
);

if (window.location.pathname.startsWith("/host/")) {
  console.log("initRealtimeClient");
  initRealtimeClient({
    key: window.location.pathname,
  });
} else {
  console.log("initClient");
  initClient();
}

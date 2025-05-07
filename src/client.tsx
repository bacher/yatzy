import { initClient } from "rwsdk/client";

import { initRealtimeClient } from "rwsdk/realtime/client";

if (window.location.protocol === "https:") {
  navigator.serviceWorker.register("/sw.js").then(
    (registration) => {
      console.log("Service worker registration succeeded:", registration);
    },
    (error) => {
      console.error(`Service worker registration failed: ${error}`);
    },
  );
}

if (window.location.pathname.startsWith("/host/")) {
  console.log("initRealtimeClient");
  initRealtimeClient({
    key: window.location.pathname,
  });
} else {
  console.log("initClient");
  initClient();
}

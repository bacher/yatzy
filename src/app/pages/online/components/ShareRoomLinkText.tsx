"use client";

import { useEffect, useState } from "react";

export const ShareRoomLinkText = () => {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  return (
    <div>
      Send a link{" "}
      <a href={url} target="_blank">
        {url}
      </a>{" "}
      to your friends so they can join the game.
    </div>
  );
};

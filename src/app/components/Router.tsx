"use client";

import { useEffect, useState } from "react";

import type { PlayerInfo } from "@/OnlineGameDurableObject";
import { LocalGame } from "@/app/components/LocalGame";
import { NewGame } from "./NewGame";

export const Router = () => {
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [mode, setState] = useState<"new_game_menu" | "game">("new_game_menu");

  switch (mode) {
    case "new_game_menu":
      return (
        <NewGame
          onStartGame={(newGamePlayers) => {
            setPlayers(newGamePlayers);
            setState("game");
          }}
        />
      );
    case "game":
      return <LocalGame players={players} />;
  }
};

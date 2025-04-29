"use client";

import { useState } from "react";

import type { PlayerInfo } from "@/OnlineGameDurableObject";
import { NewGame } from "./NewGame";
import { Board } from "./Board";

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
      return <Board players={players} />;
  }
};

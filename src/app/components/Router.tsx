"use client";

import { NewGame } from "./NewGame";
import { Board } from "./Board";
import { useState } from "react";

export const Router = () => {
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [mode, setState] = useState<"new_game_menu" | "game">("new_game_menu");

  switch (mode) {
    case "new_game_menu":
      return (
        <NewGame
          onStartGame={(newGamePlayerNames) => {
            setPlayerNames(newGamePlayerNames);
            setState("game");
          }}
        />
      );
    case "game":
      return <Board playerNames={playerNames} />;
  }
};

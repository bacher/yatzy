"use client";

import { useEffect, useState } from "react";
import { Page } from "@/app/components/Page";
import { link } from "@/app/shared/links";

const PLAYER_NAMES_STORAGE_KEY = "yatzy_players";

type NewGamePlayer = {
  name: string;
};

type NewGameProps = {
  onStartGame: (playerNames: string[]) => void;
};

export const NewGame = ({ onStartGame }: NewGameProps) => {
  const [players, setPlayers] = useState<NewGamePlayer[]>(() => {
    return [
      {
        name: "Player 1",
      },
    ];
  });

  const [hostRoomId, setHostRoomId] = useState<string | undefined>();

  useEffect(() => {
    setHostRoomId(
      Math.random().toString(36).substring(2, 14).padStart(10, "0"),
    );
  }, []);

  useEffect(() => {
    try {
      const playersJson = localStorage.getItem(PLAYER_NAMES_STORAGE_KEY);
      if (playersJson) {
        setPlayers(JSON.parse(playersJson));
      }
    } catch (error) {
      console.warn(error);
    }
  }, []);

  return (
    <Page>
      <form
        className="new-game"
        onSubmit={(event) => {
          event.preventDefault();

          localStorage.setItem(
            PLAYER_NAMES_STORAGE_KEY,
            JSON.stringify(players),
          );
          onStartGame(players.map(({ name }) => name));
        }}
      >
        <h1>New Game</h1>
        <div>
          <a
            href={
              hostRoomId
                ? link("/host/:roomId", {
                    roomId: hostRoomId,
                  })
                : undefined
            }
          >
            Host online game
          </a>
        </div>
        <h2>Players</h2>
        <div className="new-game__players-wrapper">
          <ul className="new-game__player-list">
            {players.map((player, index) => (
              <li key={player.name} className="new-game__player">
                <input
                  value={player.name}
                  onChange={(event) => {
                    setPlayers(
                      players.map((p) =>
                        p.name === player.name
                          ? { ...p, name: event.target.value }
                          : p,
                      ),
                    );
                  }}
                />

                {index !== 0 && (
                  <button
                    type="button"
                    className="new-game__player__remove-button"
                    onClick={() => {
                      setPlayers(players.filter((p) => p.name !== player.name));
                    }}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div>
            <button
              type="button"
              onClick={() => {
                setPlayers([
                  ...players,
                  {
                    name: `Player ${players.length + 1}`,
                  },
                ]);
              }}
            >
              Add more
            </button>
          </div>
        </div>
        <div>
          <button data-primary>Start game</button>
        </div>
      </form>
    </Page>
  );
};

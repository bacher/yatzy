"use client";

import { useEffect, useState } from "react";
import { debounce } from "lodash";

import { Page } from "@/app/components/Page";
import { link } from "@/app/shared/links";
import { generateId } from "@/app/utils/id";
import { PlayerInfo } from "@/OnlineGameDurableObject";
import { getLocalPlayers, saveLocalPlayers } from "@/app/utils/localStorage";

type NewGameProps = {
  onStartGame: (players: PlayerInfo[]) => void;
};

export const NewGame = ({ onStartGame }: NewGameProps) => {
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [hostRoomId, setHostRoomId] = useState<string | undefined>();

  useEffect(() => {
    setHostRoomId(generateId());
    setPlayers(getLocalPlayers());
  }, []);

  const [saveLocalPlayersDebounced] = useState(() =>
    debounce(saveLocalPlayers, 100),
  );

  useEffect(
    () => () => {
      saveLocalPlayersDebounced.cancel();
    },
    [],
  );

  return (
    <Page className="new-game">
      <h1>New Game</h1>
      <div className="new-game__panels">
        <div className="new-game__panel">
          <h2 className="new-game__panel-header">Local game</h2>
          <form
            className="new-game__form"
            onSubmit={(event) => {
              event.preventDefault();

              saveLocalPlayersDebounced.cancel();
              saveLocalPlayers(players);
              onStartGame(players);
            }}
          >
            <h3>Player list</h3>
            <div className="new-game__players-wrapper">
              <ul className="new-game__player-list">
                {players.map((player, index) => (
                  <li key={player.id} className="new-game__player">
                    <input
                      value={player.name}
                      onChange={(event) => {
                        const updatedPlayers = players.map((p) =>
                          p.id === player.id
                            ? { ...p, name: event.target.value }
                            : p,
                        );
                        setPlayers(updatedPlayers);
                        saveLocalPlayersDebounced(updatedPlayers);
                      }}
                    />

                    {index !== 0 && (
                      <button
                        type="button"
                        className="new-game__player__remove-button"
                        onClick={() => {
                          setPlayers(
                            players.filter((p) => p.name !== player.name),
                          );
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
                  data-small
                  onClick={() => {
                    setPlayers([
                      ...players,
                      {
                        id: generateId(),
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
        </div>
        <div className="new-game__panel">
          <h2 className="new-game__panel-header">Play with friends online</h2>
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
      </div>
    </Page>
  );
};

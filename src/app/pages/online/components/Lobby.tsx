"use client";

import { useEffect, useMemo, useState } from "react";

import {
  OnlineGameStatePublic,
  PlayerInfoWithClientSecret,
} from "@/OnlineGameDurableObject";
import { addPlayerIntoRoom, startGame } from "@/app/pages/functions";
import { debounce } from "lodash";
import {
  getOnlinePlayerInfo,
  saveLocalPlayerInfo,
} from "@/app/utils/localStorage";
import { ShareRoomLinkText } from "@/app/pages/online/components/ShareRoomLinkText";

type LobbyProps = {
  roomId: string;
  roomInfo: OnlineGameStatePublic;
};

export const Lobby = ({ roomId, roomInfo }: LobbyProps) => {
  const [me, setMe] = useState<PlayerInfoWithClientSecret | undefined>();

  useEffect(() => {
    setMe(getOnlinePlayerInfo);
  }, []);

  useEffect(() => {
    let timeoutId: number | undefined;

    if (me && roomInfo.players.every(({ id }) => id !== me.id)) {
      setTimeout(() => {
        addPlayerIntoRoom(roomId, me).catch((error) => {
          console.error("addPlayerIntoRoom failed:", error);
        });
      }, 500);
    }
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [roomInfo.players, me]);

  const addPlayerIntoRoomDebounced = useMemo(
    () =>
      debounce(async (roomId, playerInfo) => {
        try {
          await addPlayerIntoRoom(roomId, playerInfo);
        } catch (error) {
          console.error(error);
        }
      }, 200),
    [],
  );

  return (
    <>
      <h1>Host Online Game</h1>
      <h2>Room ID: {roomId}</h2>
      <ShareRoomLinkText />
      <h3>Players:</h3>
      <div>
        <ul className="lobby__players-list">
          {roomInfo.players.map((player) => (
            <li key={player.id}>
              {me && player.id === me.id ? (
                <input
                  value={me.name}
                  autoFocus
                  onChange={(event) => {
                    const updatedMe: PlayerInfoWithClientSecret = {
                      ...me,
                      name: event.target.value,
                    };
                    setMe(updatedMe);
                    saveLocalPlayerInfo(updatedMe);
                    addPlayerIntoRoomDebounced(roomId, updatedMe);
                  }}
                />
              ) : (
                <span>{player.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div>
        {me && roomInfo.players[0]?.id === me.id ? (
          <button
            type="button"
            data-primary
            onClick={() => {
              startGame(roomId, me).catch((error) => console.error(error));
            }}
          >
            Start game
          </button>
        ) : (
          <span>Waiting for the host</span>
        )}
      </div>
    </>
  );
};

"use client";

import { useEffect, useMemo, useState } from "react";

import { OnlineGameState, PlayerInfo } from "@/OnlineGameDurableObject";
import { addPlayerIntoRoom } from "@/app/pages/functions";
import { debounce } from "lodash";
import {
  getLocalPlayerInfo,
  saveLocalPlayerInfo,
} from "@/app/utils/localStorage";

type LobbyProps = {
  roomId: string;
  roomInfo: OnlineGameState;
};

export const Lobby = ({ roomId, roomInfo }: LobbyProps) => {
  const [me, setMe] = useState<PlayerInfo | undefined>();

  useEffect(() => {
    setMe(getLocalPlayerInfo);
  }, []);

  useEffect(() => {
    if (me && roomInfo.players.every(({ id }) => id !== me.id)) {
      console.log("call addPlayerIntoRoom");
      addPlayerIntoRoom(roomId, me).catch((error) => console.error(error));
    }
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
    <div>
      <h3>Players:</h3>
      <div>
        <ul>
          {roomInfo.players.map((player) => (
            <li key={player.id}>
              {me && player.id === me.id ? (
                <input
                  value={me.name}
                  autoFocus
                  onChange={(event) => {
                    const updatedMe: PlayerInfo = {
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
    </div>
  );
};

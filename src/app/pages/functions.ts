"use server";

import { env } from "cloudflare:workers";

import type { OnlineGameState, PlayerInfo } from "@/OnlineGameDurableObject";

export const getContent = async (key: string) => {
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const roomDo = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  return roomDo.getContent();
};

export const updateContent = async (key: string, content: OnlineGameState) => {
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const roomDo = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  await roomDo.setContent(content);
};

export const addPlayerIntoRoom = async (key: string, player: PlayerInfo) => {
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const roomDo = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  await roomDo.addPlayerIntoRoom(player);
};
export const startGame = async (key: string) => {
  // Verify that the game is started by the first player
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const roomDo = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  await roomDo.startGame();
};

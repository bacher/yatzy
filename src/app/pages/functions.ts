"use server";

import { env } from "cloudflare:workers";

import type {
  OnlineGameState,
  OnlineGameStateWrapper,
} from "@/OnlineGameDurableObject";

export const getContent = async (key: string) => {
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const noteDO = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  return noteDO.getContent();
};

export const updateContent = async (
  key: string,
  content: OnlineGameStateWrapper,
) => {
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const noteDO = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  await noteDO.setContent(content);
};

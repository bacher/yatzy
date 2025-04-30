"use server";

import { env } from "cloudflare:workers";

import type { PlayerInfoWithClientSecret } from "@/OnlineGameDurableObject";
import { CategoryId } from "@/gameLogic/types";

export const getContent = async (key: string) => {
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const roomDo = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  return roomDo.getContent();
};

export const addPlayerIntoRoom = async (
  key: string,
  player: PlayerInfoWithClientSecret,
) => {
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const roomDo = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  await roomDo.addPlayerIntoRoom(player);
};

export const startGame = async (
  key: string,
  player: PlayerInfoWithClientSecret,
) => {
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const roomDo = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  await roomDo.startGame(player);
};

export const rollDiceAction = async (
  key: string,
  player: PlayerInfoWithClientSecret,
) => {
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const roomDo = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  await roomDo.rollDice(player);
};

export const keepToggleAction = async (
  key: string,
  player: PlayerInfoWithClientSecret,
  diceIndex: number,
  keep: boolean,
) => {
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const roomDo = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  await roomDo.keepToggle(player, diceIndex, keep);
};

export const selectCategoryAction = async (
  key: string,
  player: PlayerInfoWithClientSecret,
  categoryId: CategoryId,
) => {
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const roomDo = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  await roomDo.selectCategory(player, categoryId);
};

export const restartGameAction = async (
  key: string,
  player: PlayerInfoWithClientSecret,
) => {
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const roomDo = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  await roomDo.restartGame(player);
};

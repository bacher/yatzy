"use server";

import { env } from "cloudflare:workers";

import type { OnlineGameState, PlayerInfo } from "@/OnlineGameDurableObject";
import { CategoryId } from "@/gameLogic/types";

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
  // TODO: Verify that the game is started by the first player
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const roomDo = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  await roomDo.startGame();
};

export const rollDiceAction = async (key: string, playerId: string) => {
  // TODO: Verify player
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const roomDo = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  await roomDo.rollDice(playerId);
};

export const keepToggleAction = async (
  key: string,
  playerId: string,
  diceIndex: number,
  keep: boolean,
) => {
  // TODO: Verify player
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const roomDo = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  await roomDo.keepToggle(playerId, diceIndex, keep);
};

export const selectCategoryAction = async (
  key: string,
  playerId: string,
  categoryId: CategoryId,
) => {
  // TODO: Verify player
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const roomDo = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  await roomDo.selectCategory(playerId, categoryId);
};

export const restartGameAction = async (key: string, playerId: string) => {
  // TODO: Verify player
  const doId = env.ONLINE_GAME_DURABLE_OBJECT.idFromName(key);
  const roomDo = env.ONLINE_GAME_DURABLE_OBJECT.get(doId);
  await roomDo.restartGame(playerId);
};

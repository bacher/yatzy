import { generateId } from "@/app/utils/id";
import {
  PlayerInfo,
  PlayerInfoWithClientSecret,
} from "@/OnlineGameDurableObject";

const PLAYER_NAMES_STORAGE_KEY = "yatzy_players";
const ONLINE_PLAYER_STORAGE_KEY = "yatzy_online_player";

function generateNewPlayer(): PlayerInfo {
  return {
    id: generateId(),
    name: "Player",
  };
}

function generateSecret(): string {
  return `${generateId()}${generateId()}`;
}

function generateNewPlayerWithClientSecret(): PlayerInfoWithClientSecret {
  return {
    ...generateNewPlayer(),
    secret: generateSecret(),
  };
}

export function saveLocalPlayers(players: PlayerInfo[]): void {
  try {
    localStorage.setItem(PLAYER_NAMES_STORAGE_KEY, JSON.stringify(players));
  } catch (error) {
    console.error(error);
  }
}

export function getLocalPlayers() {
  try {
    const playersJson = localStorage.getItem(PLAYER_NAMES_STORAGE_KEY);
    if (playersJson) {
      return JSON.parse(playersJson);
    }
  } catch (error) {
    console.warn(error);
  }

  const newPlayer = generateNewPlayer();
  saveLocalPlayers([newPlayer]);
  return [newPlayer];
}

export function getOnlinePlayerInfo(): PlayerInfoWithClientSecret {
  try {
    const playerJson = localStorage.getItem(ONLINE_PLAYER_STORAGE_KEY);
    if (playerJson) {
      return JSON.parse(playerJson);
    }
  } catch (error) {
    console.warn(error);
  }

  const localPlayers = getLocalPlayers();
  const firstPlayer = localPlayers[0];

  let newPlayer: PlayerInfoWithClientSecret;

  if (firstPlayer) {
    newPlayer = {
      ...firstPlayer,
      secret: generateSecret(),
    };
  } else {
    newPlayer = generateNewPlayerWithClientSecret();
  }

  saveLocalPlayerInfo(newPlayer);
  return newPlayer;
}

export function saveLocalPlayerInfo(
  playerInfo: PlayerInfoWithClientSecret,
): void {
  try {
    localStorage.setItem(ONLINE_PLAYER_STORAGE_KEY, JSON.stringify(playerInfo));
  } catch (error) {
    console.error(error);
  }
}

import { generateId } from "@/app/utils/id";
import { PlayerInfo } from "@/OnlineGameDurableObject";

const PLAYER_NAMES_STORAGE_KEY = "yatzy_players";

function generateNewPlayer(): PlayerInfo {
  return {
    id: generateId(),
    name: "Player",
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

export function getLocalPlayerInfo() {
  return getLocalPlayers()[0];
}

export function saveLocalPlayerInfo(playerInfo: PlayerInfo) {
  const players = getLocalPlayers();
  players[0] = playerInfo;
  saveLocalPlayers(players);
}

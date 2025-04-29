import { GameState } from "@/gameLogic/types";
import { PlayerInfo } from "@/OnlineGameDurableObject";

type OnlineGameProps = {
  roomId: string;
  players: PlayerInfo[];
  gameState: GameState;
};

export const OnlineGame = ({ gameState }: OnlineGameProps) => {
  return <pre>{JSON.stringify(gameState, null, 2)}</pre>;
};

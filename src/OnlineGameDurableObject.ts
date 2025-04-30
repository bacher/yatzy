import { DurableObject } from "cloudflare:workers";

import type {
  CategoryId,
  GameStartState,
  GameState,
  PlayerScoreData,
} from "@/gameLogic/types";
import {
  calculateScoreboard,
  getEmptyGameState,
  getEmptyScoreForPlayers,
  keepToggle,
  rollDice,
  selectCategory,
} from "@/gameLogic/utils";

export type PlayerInfo = {
  id: string;
  name: string;
};

export type PlayerInfoWithClientSecret = {
  id: string;
  name: string;
  secret: string;
};

type OnlineGameState =
  | {
      roomState: "lobby";
      players: PlayerInfoWithClientSecret[];
    }
  | {
      roomState: "game";
      players: PlayerInfoWithClientSecret[];
      gameState: GameState;
      score: Record<string, PlayerScoreData>;
    };

export type OnlineGameStatePublic =
  | {
      roomState: "lobby";
      players: PlayerInfo[];
    }
  | {
      roomState: "game";
      players: PlayerInfo[];
      gameState: GameState;
      score: Record<string, PlayerScoreData>;
    };

export class OnlineGameDurableObject extends DurableObject {
  private content: OnlineGameState | undefined;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.content = undefined;
  }

  private validatePlayer(
    content: OnlineGameState,
    player: PlayerInfoWithClientSecret,
  ): void {
    const gamePlayer = content.players.find(({ id }) => id === player.id);
    if (!gamePlayer || gamePlayer.secret !== player.secret) {
      throw new Error("Unauthorized");
    }
  }

  private checkGameStateAndCurrentPlayer(
    content: OnlineGameState,
    player: PlayerInfoWithClientSecret,
  ): {
    players: PlayerInfoWithClientSecret[];
    gameState: GameStartState;
    score: Record<string, PlayerScoreData>;
  } {
    this.validatePlayer(content, player);

    if (content.roomState !== "game") {
      throw new Error("Room is not in game state");
    }

    if (content.gameState.state !== "game_start") {
      throw new Error("Room is not in game state");
    }

    if (content.gameState.currentPlayerId !== player.id) {
      throw new Error("Not player turn");
    }

    return {
      players: content.players,
      score: content.score,
      gameState: content.gameState,
    };
  }

  async getContent(): Promise<OnlineGameStatePublic> {
    const content = await this.#getContent();

    return {
      ...content,
      players: content.players.map(({ id, name }) => ({ id, name })),
    };
  }

  async #getContent(): Promise<OnlineGameState> {
    if (this.content) {
      return this.content;
    }

    const content = (await this.ctx.storage.get<OnlineGameState>(
      "content",
    )) ?? {
      roomState: "lobby",
      players: [],
    };

    this.content = content;

    return content;
  }

  async #setContent(newContent: OnlineGameState): Promise<void> {
    this.content = newContent;
    await this.ctx.storage.put<OnlineGameState>("content", this.content);
  }

  async addPlayerIntoRoom(player: PlayerInfoWithClientSecret): Promise<void> {
    const content = await this.#getContent();

    if (content.roomState !== "lobby") {
      throw new Error("Room is not in lobby state");
    }

    const alreadyPlayer = content.players.find(({ id }) => id === player.id);

    if (alreadyPlayer) {
      if (alreadyPlayer.name !== player.name) {
        alreadyPlayer.name = player.name;
        await this.#setContent(content);
      }
      return;
    }

    content.players.push(player);
    await this.#setContent(content);
  }

  async startGame(player: PlayerInfoWithClientSecret) {
    const content = await this.#getContent();

    this.validatePlayer(content, player);

    if (content.roomState !== "lobby") {
      throw new Error("Room is not in lobby state");
    }

    if (content.players.length === 0) {
      throw new Error("Room is empty");
    }

    if (content.players[0].id !== player.id) {
      throw new Error("Game can be started only by host");
    }

    await this.#setContent({
      roomState: "game",
      players: content.players,
      score: getEmptyScoreForPlayers(content.players),
      gameState: {
        state: "game_start",
        currentPlayerId: content.players[0].id,
        turn: 0,
        diceState: undefined,
        rollNumber: 0,
      },
    });
  }

  async rollDice(player: PlayerInfoWithClientSecret) {
    const content = await this.#getContent();

    const { gameState, score } = this.checkGameStateAndCurrentPlayer(
      content,
      player,
    );

    await this.#setContent({
      ...content,
      roomState: "game",
      score,
      gameState: rollDice(gameState),
    });
  }

  async keepToggle(
    player: PlayerInfoWithClientSecret,
    diceIndex: number,
    keep: boolean,
  ) {
    const content = await this.#getContent();

    const { gameState, score } = this.checkGameStateAndCurrentPlayer(
      content,
      player,
    );

    await this.#setContent({
      ...content,
      roomState: "game",
      score,
      gameState: keepToggle(gameState, diceIndex, keep),
    });
  }

  async selectCategory(
    player: PlayerInfoWithClientSecret,
    categoryId: CategoryId,
  ) {
    const content = await this.#getContent();

    const { players, gameState, score } = this.checkGameStateAndCurrentPlayer(
      content,
      player,
    );

    const scoreboard = calculateScoreboard({ players, gameState, score });

    await this.#setContent({
      ...content,
      roomState: "game",
      ...selectCategory(players, gameState, score, scoreboard, categoryId),
    });
  }

  async restartGame(player: PlayerInfoWithClientSecret) {
    const content = await this.#getContent();

    this.validatePlayer(content, player);

    if (content.roomState !== "game") {
      throw new Error("Room is not in game state");
    }

    if (content.gameState.state !== "game_over") {
      throw new Error("Game is not over");
    }

    const { players } = content;

    if (player.id !== players[0].id) {
      throw new Error("Only host can restart the game");
    }

    await this.#setContent({
      ...content,
      roomState: "game",
      gameState: getEmptyGameState(players),
      score: getEmptyScoreForPlayers(players),
    });
  }
}

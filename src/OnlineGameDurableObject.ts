import { DurableObject } from "cloudflare:workers";
import { updateContent } from "@/app/pages/functions";

export type PlayerInfo = {
  id: string;
  name: string;
};

export type OnlineGameState =
  | {
      roomState: "lobby";
      players: PlayerInfo[];
    }
  | {
      roomState: "game";
      players: PlayerInfo[];
    };

export class OnlineGameDurableObject extends DurableObject {
  private content: OnlineGameState | undefined;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.content = undefined;
  }

  async getContent(): Promise<OnlineGameState> {
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

  async setContent(newContent: OnlineGameState): Promise<void> {
    this.content = newContent;
    await this.ctx.storage.put<OnlineGameState>("content", this.content);
  }

  async addPlayerIntoRoom(playerInfo: PlayerInfo): Promise<void> {
    const content = await this.getContent();

    if (content.roomState !== "lobby") {
      throw new Error("Room is not in lobby state");
    }

    const alreadyPlayer = content.players.find(
      ({ id }) => id === playerInfo.id,
    );

    if (alreadyPlayer) {
      if (alreadyPlayer.name !== playerInfo.name) {
        alreadyPlayer.name = playerInfo.name;
        await this.setContent(content);
      }
      return;
    }

    content.players.push(playerInfo);
    await this.setContent(content);
  }
}

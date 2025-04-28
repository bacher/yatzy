import { DurableObject } from "cloudflare:workers";

export type OnlineGameState = {
  a: number;
  b: string;
};

export type OnlineGameStateWrapper = {
  gameState: OnlineGameState;
};

export class OnlineGameDurableObject extends DurableObject {
  private content: OnlineGameStateWrapper | undefined;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.content = undefined;
  }

  async getContent(): Promise<OnlineGameStateWrapper> {
    if (this.content) {
      return this.content;
    }

    const content = (await this.ctx.storage.get<OnlineGameStateWrapper>(
      "content",
    )) ?? {
      gameState: {
        a: 0,
        b: "",
      },
    };

    this.content = content;

    return content;
  }

  async setContent(newContent: OnlineGameStateWrapper): Promise<void> {
    this.content = newContent;
    await this.ctx.storage.put<OnlineGameStateWrapper>("content", this.content);
  }
}

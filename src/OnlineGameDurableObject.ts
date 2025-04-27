import { DurableObject } from "cloudflare:workers";

export class OnlineGameDurableObject extends DurableObject {
  private content: string | undefined;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.content = undefined;
  }

  async getContent(): Promise<string> {
    return (this.content ??=
      (await this.ctx.storage.get<string>("content")) ?? "");
  }

  async setContent(newContent: string): Promise<void> {
    this.content = newContent;
    await this.ctx.storage.put<string>("content", this.content);
  }
}

import { defineApp, ErrorResponse } from "rwsdk/worker";
import { route, render, prefix } from "rwsdk/router";
import { Document } from "@/app/Document";
import { Protected } from "@/app/pages/Protected";
import { setCommonHeaders } from "@/app/headers";
import { userRoutes } from "@/app/pages/user/routes";
import { sessions, setupSessionStore } from "./session/store";
import { Session } from "./session/durableObject";
import { db, setupDb } from "./db";
import type { User } from "@prisma/client";
import { env } from "cloudflare:workers";
import { Home } from "@/app/pages/Home";
import { HostOnlineGame } from "@/app/pages/online/HostOnlineGame";
import { realtimeRoute } from "rwsdk/realtime/worker";

export { SessionDurableObject } from "./session/durableObject";
export { RealtimeDurableObject } from "rwsdk/realtime/durableObject";
export { OnlineGameDurableObject } from "@/OnlineGameDurableObject";

export type AppContext = {
  session: Session | null;
  user: User | null;
};

export default defineApp([
  setCommonHeaders(),
  realtimeRoute(() => env.REALTIME_DURABLE_OBJECT),
  async ({ ctx, request, headers }) => {
    await setupDb(env);
    setupSessionStore(env);

    try {
      ctx.session = await sessions.load(request);
    } catch (error) {
      if (error instanceof ErrorResponse && error.code === 401) {
        await sessions.remove(request, headers);
        headers.set("Location", "/user/login");

        return new Response(null, {
          status: 302,
          headers,
        });
      }

      throw error;
    }

    if (ctx.session?.userId) {
      ctx.user = await db.user.findUnique({
        where: {
          id: ctx.session.userId,
        },
      });
    }
  },
  render(Document, [
    route("/", [Home]),
    route("/host/:roomId", [HostOnlineGame]),
    route("/ping", () => <h1>Pong!</h1>),
    route("/protected", [
      ({ ctx }) => {
        if (!ctx.user) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/user/login" },
          });
        }
      },
      Protected,
    ]),
    prefix("/user", userRoutes),
  ]),
]);

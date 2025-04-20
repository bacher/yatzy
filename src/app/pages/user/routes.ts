import { route } from "@redwoodjs/sdk/router";
import { Login } from "./Login";
import { sessions } from "@/session/store";
import { TodoPage } from "@/app/pages/Todos";

export const userRoutes = [
  route("/login", [Login]),
  route("/todos", [TodoPage]),
  route("/logout", async function ({ request }) {
    const headers = new Headers();
    await sessions.remove(request, headers);
    headers.set("Location", "/");

    return new Response(null, {
      status: 302,
      headers,
    });
  }),
];

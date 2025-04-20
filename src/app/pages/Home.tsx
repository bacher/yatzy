import { RequestInfo } from "@redwoodjs/sdk/worker";

export function Home({ ctx }: RequestInfo) {
  return (
    <div className="root">
      HELLO
      <p>
        {ctx.user?.username
          ? `You are logged in as user ${ctx.user.username}`
          : "You are not logged in"}
      </p>
    </div>
  );
}

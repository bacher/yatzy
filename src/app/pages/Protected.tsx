import { RequestInfo } from "rwsdk/worker";

export function Protected({ ctx }: RequestInfo) {
  return (
    <div>
      HELLO
      <p>
        {ctx.user?.username
          ? `You are logged in as user ${ctx.user.username}`
          : "You are not logged in"}
      </p>
    </div>
  );
}

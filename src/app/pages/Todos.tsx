import { RequestInfo } from "@redwoodjs/sdk/worker";
import { Suspense } from "react";
import { AddTodo } from "@/app/pages/AddTodo";

export async function Todos({ ctx }: { ctx: RequestInfo["ctx"] }) {
  const todos = await new Promise<{ id: string; title: string }[]>((resolve) =>
    setTimeout(() => {
      resolve([
        { id: "a1", title: "title #1" },
        { id: "a2", title: "title #2" },
      ]);
    }, 5000),
  );

  // const todos = await db.todo.findMany({ where: { userId: ctx.user.id } });
  return (
    <ol>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ol>
  );
}

export async function TodoPage({ ctx }: RequestInfo) {
  return (
    <div>
      <h1>Todos</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <Todos ctx={ctx} />
      </Suspense>
      <AddTodo />
    </div>
  );
}

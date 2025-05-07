"use server";

import { requestInfo } from "rwsdk/worker";

export async function addTodo(formData: FormData) {
  const { ctx } = requestInfo;
  const title = formData.get("title");

  console.log(`USER ${ctx.user?.username}, title=${title}`);

  await new Promise((resolve) => setTimeout(resolve, 5000));
  // await db.todo.create({ data: { title, userId: ctx.user.id } });
}

export async function addTodo2({ title }: { title: string }) {
  const { ctx } = requestInfo;

  console.log(`USER ${ctx.user?.username}, title=${title}`);

  await new Promise((resolve) => setTimeout(resolve, 5000));
  // await db.todo.create({ data: { title, userId: ctx.user.id } });
}

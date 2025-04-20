"use client";

import { addTodo, addTodo2 } from "../server/todos";

export function AddTodo() {
  return (
    <form action={addTodo}>
      <input type="text" name="title" />
      <button type="submit">Add</button>
      <button
        type="button"
        onClick={async () => {
          console.log("onClick");
          await addTodo2({
            title: "title from client",
          });
          console.log("operation done");
        }}
      >
        Call server action
      </button>
    </form>
  );
}

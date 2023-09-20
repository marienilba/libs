"use client";

import { useZorm } from "@/libs/services/zorm";
import { useRef } from "react";
import { z } from "zod";

const checkUsernameAlreadyExists = async (username: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return username !== "marie";
};

const schema = z.object({
  username: z.coerce
    .string()
    .refine(async (data) => await checkUsernameAlreadyExists(data), {
      message: "Username already exists",
    }),
});

export default function Home() {
  const form = useRef<HTMLFormElement>(null);

  const zorm = useZorm(schema, async (event) => {
    event.preventDefault();
    if (event.success) event.data; // OK
  });

  return (
    <main className="bg-slate-950 p-4 min-h-screen text-white">
      <form ref={form} onSubmit={zorm.form.submit}>
        <fieldset className="flex gap-2 p-4">
          <input
            type="text"
            name={zorm.fields.username().name()}
            className="p-2 bg-slate-600 text-white border border-slate-400"
          />
        </fieldset>
        <div className="m-4">
          {zorm.errors
            .username()
            .errors()
            ?.map((error) => (
              <p key={error.code}>{error.message}</p>
            ))}
        </div>
        <button
          className="bg-slate-800 mx-4 text-white px-2.5 py-1 rounded cursor-pointer hover:bg-slate-950 focus-within:bg-slate-800"
          type="submit"
        >
          submit
        </button>
      </form>
    </main>
  );
}

"use client";

import { useZorm } from "@/libs/services/zorm";
import { useRef } from "react";
import { ZodError, z } from "zod";

const password = z
  .string()
  .min(8, { message: "Password should be at least 8 character" })
  .regex(/[A-Z]/, { message: "Password should have at least one capital" })
  .regex(/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/, {
    message: "Password should have at least one special character",
  })
  .regex(/\d/, { message: "Password should have at least one digit" });

const schema = z.object({
  password: z
    .object({
      password: password,
      confirm: z.string(),
    })
    .refine((data) => data.password === data.confirm, {
      message: "Passwords don't match",
    }),
});

export default function Home() {
  const form = useRef<HTMLFormElement>(null);

  const zorm = useZorm(schema, async (event) => {
    event.preventDefault();
    if (event.success) console.log(event.data); // OK
    else console.log(event.error);

    return new ZodError([]);
  });

  return (
    <main className="bg-slate-950 p-4 min-h-screen text-white">
      <form ref={form} onSubmit={zorm.form.submit}>
        <fieldset className="flex flex-col gap-2 p-4">
          <input
            type="text"
            name={zorm.fields.password().password().name()}
            className="p-2 bg-slate-600 text-white border border-slate-400"
          />
          <input
            type="text"
            name={zorm.fields.password().confirm().name()}
            className="p-2 bg-slate-600 text-white border border-slate-400"
          />
        </fieldset>
        <div className="m-4"></div>
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

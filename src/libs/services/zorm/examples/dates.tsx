"use client";

import { useZorm } from "@/libs/services/zorm";
import { useRef } from "react";
import { z } from "zod";

const datePeriod = z
  .object({
    begin: z.coerce.date(),
    end: z.coerce.date(),
  })
  .refine((data) => data.begin.getTime() !== data.end.getTime(), {
    message: "Date can't be same",
  })
  .refine((data) => data.begin <= data.end, {
    message: "Begin can't be after end",
  });

const schema = z.object({
  date: datePeriod,
});

export default function Home() {
  const form = useRef<HTMLFormElement>(null);

  const zorm = useZorm(schema, (event) => {
    event.preventDefault();
    if (event.success) event.data; // OK
  });

  return (
    <main className="bg-slate-950 p-4 min-h-screen text-white">
      <form ref={form} onSubmit={zorm.form.submit}>
        <fieldset className="flex gap-2 p-4">
          <input
            type="date"
            name={zorm.fields.date().begin().name()}
            className="p-2 bg-slate-600 text-white border border-slate-400"
          />
          <input
            type="date"
            name={zorm.fields.date().end().name()}
            className="p-2 bg-slate-600 text-white border border-slate-400"
          />
        </fieldset>
        <div className="m-4">
          {zorm.errors
            .date()
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

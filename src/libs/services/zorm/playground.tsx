"use client";

import { useZorm } from "@/libs/services/zorm";
import { useRef } from "react";
import { z } from "zod";

const schema = z.object({
  test: z.coerce.number().max(10).optional(),
  array: z.array(
    z.object({
      testoa: z.coerce.number(),
      darr: z.array(z.object({ huhu: z.coerce.string() })),
    })
  ),
  object: z.object({
    testobj: z.coerce.number(),
  }),
});

export default function Home() {
  const form = useRef<HTMLFormElement>(null);

  const zorm = useZorm(schema, (event) => {
    if (event.success) event.data;
    event.preventDefault();
    // valide
  });

  const test = zorm.watch(form, zorm.fields.object().name());

  const arr = zorm.watch(form, zorm.fields.array().name());

  return (
    <main className="bg-slate-950 p-4 min-h-screen text-white">
      <p>VALUE: {test?.testobj} </p>
      <p>
        ERROR:
        {zorm.errors
          .object()
          .errors()
          ?.map((e) => (
            <span key={e.code}>{e.message}</span>
          ))}
      </p>
      <p>VALUE: {JSON.stringify(arr)} </p>
      <p>
        ERROR:
        {zorm.errors
          .array()
          .errors()
          ?.map((e) => (
            <span key={e.code}>{e.message}</span>
          ))}
      </p>
      <form ref={form} onSubmit={zorm.form.submit}>
        <input
          type="number"
          name={zorm.fields.test().name()}
          className="p-2 bg-slate-600 text-white border border-slate-400"
          placeholder="test"
        />
        <input
          type="text"
          name={zorm.fields.object().testobj().name()}
          className="p-2 bg-slate-600 text-white border border-slate-400"
          placeholder="testobj"
        />
        {Array(5)
          .fill(null)
          .map((_, index) => {
            return (
              <div key={index}>
                {Array(5)
                  .fill(null)
                  .map((_, index2) => (
                    <input
                      key={index2}
                      type="text"
                      name={zorm.fields.array(index).darr(index2).huhu().name()}
                      className="p-2 bg-slate-600 text-white border border-slate-400"
                      placeholder="array darr huhu"
                    />
                  ))}
                <input
                  type="text"
                  name={zorm.fields.array(index).testoa().name()}
                  className="p-2 bg-slate-600 text-white border border-slate-400"
                  placeholder="array testoa"
                />
              </div>
            );
          })}
        <button
          className="bg-slate-900 text-white px-2.5 py-1 rounded cursor-pointer hover:bg-slate-950 focus-within:bg-slate-800"
          type="submit"
        >
          submit
        </button>
      </form>
    </main>
  );
}

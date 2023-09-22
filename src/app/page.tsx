"use client";

import { useSyncURL } from "@/libs/services/syncURL";
import { z } from "zod";

const schema = z
  .object({
    page: z.coerce.number().min(0),
    size: z.union([
      z.preprocess((val) => Number(val), z.literal(10)),
      z.preprocess((val) => Number(val), z.literal(20)),
      z.preprocess((val) => Number(val), z.literal(30)),
    ]),
    asc: z.array(z.string()),
    desc: z.array(z.string()),
  })
  .deepPartial();

export default function Home() {
  const { data, set } = useSyncURL(schema);
  return (
    <main className="bg-slate-950 p-4 min-h-screen text-white">
      {JSON.stringify(data)}
      <button
        onClick={() => {
          data.size = 20;
          set(data);
        }}
        className="bg-slate-900 text-white px-2.5 py-1 rounded cursor-pointer hover:bg-slate-950 focus-within:bg-slate-800"
      >
        Add new state
      </button>
    </main>
  );
}

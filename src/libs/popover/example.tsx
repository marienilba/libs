import { Popover } from "@/libs/popover";

export default function Home() {
  return (
    <main className="bg-pink-100 h-screen flex justify-center items-center">
      <Popover.Root>
        <Popover.Trigger className="bg-slate-800 text-slate-50 rounded px-2 py-1">
          Trigger
        </Popover.Trigger>
        <Popover.Content className="bg-slate-900 text-slate-50 shadow-md rounded w-40 my-2">
          <div className="first:border-b-slate-700 last:border-t-slate-700 first:border-t-0 last:border-b-0 border-t border-b p-1 cursor-pointer hover:bg-slate-950/50">
            About
          </div>
          <div className="first:border-b-slate-700 last:border-t-slate-700 first:border-t-0 last:border-b-0 border-t border-b p-1 cursor-pointer hover:bg-slate-950/50">
            Login
          </div>
          <div className="first:border-b-slate-700 last:border-t-slate-700 first:border-t-0 last:border-b-0 border-t border-b p-1 cursor-pointer hover:bg-slate-950/50">
            Contact
          </div>
          <div className="first:border-b-slate-700 last:border-t-slate-700 first:border-t-0 last:border-b-0 border-t border-b p-1 cursor-pointer hover:bg-slate-950/50">
            CGU
          </div>
        </Popover.Content>
      </Popover.Root>
    </main>
  );
}

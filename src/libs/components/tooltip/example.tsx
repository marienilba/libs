import { Tooltip } from "@/libs/components/tooltip/tooltip";

export default function Home() {
  return (
    <main className="bg-pink-100 h-screen flex justify-center items-center">
      <Tooltip
        value="prout"
        x={1}
        y={0}
        className="after:bg-slate-600 hover:after:ring-2 hover:after:ring-slate-500 hover:after:p-1 hover:after:text-slate-100 hover:after:rounded"
      >
        <div>test paragraph test paragraph test paragraph test paragraph</div>
      </Tooltip>
    </main>
  );
}

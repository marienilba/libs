"use client";

import { Player } from "@/libs/components/audioplayer";

export default function Home() {
  return (
    <main className="bg-green-200 p-4 min-h-screen flex flex-col justify-center items-center">
      <Player.Root
        as="div"
        className="bg-green-700 w-60 h-20 rounded-lg items-center flex"
      >
        <Player.Audio>
          <Player.Source src="/audio.mp3" />
        </Player.Audio>
        <Player.Play className="text-4xl data-[play=true]:hidden">
          ▶
        </Player.Play>
        <Player.Pause className="text-4xl data-[pause=true]:hidden">
          ⏸
        </Player.Pause>
        <Player.Time>
          {({ time, duration }) => (
            <div>
              time: {time} duration: {duration}
            </div>
          )}
        </Player.Time>
      </Player.Root>
    </main>
  );
}

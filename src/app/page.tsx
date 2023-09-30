"use client";

import { Carousel } from "@/libs/components/carousel";

export default function Home() {
  return (
    <main className="bg-pink-200 p-4 min-h-screen flex justify-center items-center">
      <Carousel.Root>
        <Carousel.Button
          onClick={(scrollInto) => scrollInto(10, { behavior: "smooth" })}
        >
          Move
        </Carousel.Button>
        <div className="flex gap-2 max-w-7xl overflow-scroll snap-x snap-mandatory">
          {Array(20)
            .fill(0)
            .map((_, i) => (
              <Carousel.Content
                key={i}
                as="img"
                src="https://picsum.photos/200"
                className="snap-center"
              />
            ))}
        </div>
      </Carousel.Root>
    </main>
  );
}

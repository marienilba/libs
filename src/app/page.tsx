"use client";

import { Carousel } from "@/libs/components/carousel";

export default function Home() {
  return (
    <main className="bg-pink-200 p-4 min-h-screen flex justify-center items-center">
      <Carousel.Root>
        <Carousel.Items
          as="div"
          className="flex gap-2 w-[calc(3*200px+3*0.5rem)] overflow-scroll snap-x snap-mandatory"
        >
          {Array(20)
            .fill(0)
            .map((_, i) => (
              <Carousel.Item
                key={i}
                as="img"
                src="https://picsum.photos/200"
                className="snap-start"
              />
            ))}
        </Carousel.Items>
        <Carousel.Range>
          {({ min, max, length }) => (
            <div className="flex gap-2">
              <Carousel.Button
                onClick={(scrollInto, { min, max, length }) =>
                  scrollInto(Math.max(0, min - 5), { behavior: "smooth" })
                }
              >
                {"<"}
              </Carousel.Button>
              <Carousel.Button
                onClick={(scrollInto, { min, max, length }) => {
                  scrollInto(Math.min(length - 1, min + 5), {
                    behavior: "smooth",
                  });
                }}
              >
                {">"}
              </Carousel.Button>

              <div>
                {min + 1}-{max + 1} / {length}
              </div>
            </div>
          )}
        </Carousel.Range>
      </Carousel.Root>
    </main>
  );
}

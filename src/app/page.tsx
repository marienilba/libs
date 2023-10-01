"use client";

import { Carousel } from "@/libs/components/carousel";

export default function Home() {
  return (
    <main className="bg-pink-200 p-4 min-h-screen flex justify-center items-center">
      <Carousel.Root>
        <Carousel.Range>
          {({ min, max, length }) => (
            <div className="flex gap-2">
              <Carousel.ScrollTo value={-5} options={{ behavior: "smooth" }}>
                {"<"}
              </Carousel.ScrollTo>
              <Carousel.ScrollTo value={5} options={{ behavior: "smooth" }}>
                {">"}
              </Carousel.ScrollTo>

              <div>
                {min + 1}-{max + 1} / {length}
              </div>
            </div>
          )}
        </Carousel.Range>
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
                loading="lazy"
                className="snap-start max-sm:w-[100px] w-[200px]"
              />
            ))}
        </Carousel.Items>

        <Carousel.Progression>
          {({ sizes, min, max, length }) => (
            <div className="flex gap-0.5 justify-center items-center py-4 w-[600px]">
              {sizes.map((size, index, array) => (
                <Carousel.Button
                  data-current={size.includes(min) || size.includes(max)}
                  key={index}
                  onClick={(scrollInto) => {
                    const current = array.findIndex((s) => s.includes(min));
                    const go =
                      current > index
                        ? size[0]
                        : Math.min(length - 1, size[size.length - 1] + 1);
                    scrollInto(go, { behavior: "smooth" });
                  }}
                  className="w-10 h-2 rounded-lg bg-pink-400 data-[current=true]:bg-pink-500"
                ></Carousel.Button>
              ))}
            </div>
          )}
        </Carousel.Progression>
      </Carousel.Root>
    </main>
  );
}

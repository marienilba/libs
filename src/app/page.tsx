"use client";

import { Step } from "@/libs/components/steps";

export default function Home() {
  return (
    <main className="bg-pink-200 p-4 min-h-screen">
      <Step.Root onChange={console.log}>
        <Step.Share as="p" start>
          Lorem Ipsum
        </Step.Share>
        <Step.Step
          value={1}
          className="flex flex-col gap-2 justify-center items-center"
        >
          <input type="text" />
        </Step.Step>
        <Step.Step
          value={2}
          className="flex flex-col gap-2 justify-center items-center"
        >
          Rem numquam sit aut pariatur eius illum rerum. Inventore fugiat labore
          aut fuga laborum odio consequatur autem. Aut voluptatem vitae ipsam
          dolore vitae. Excepturi quis ab dolorem ipsam et omnis. Repudiandae
          quia modi voluptas incidunt maiores. Eos dolores ullam expedita omnis
          nulla consequatur.
        </Step.Step>
        <Step.Step
          value={3}
          className="flex flex-col gap-2 justify-center items-center"
        >
          Aperiam eius enim nobis veniam non. Enim est velit iure aut numquam.
          Facere ullam voluptatum et est incidunt doloribus. Error nulla autem
          at laudantium quia eligendi dolorem. Fugiat aut odio veritatis.
        </Step.Step>
        <Step.Step
          value={4}
          className="flex flex-col gap-2 justify-center items-center"
        >
          Totam doloremque et beatae id. Qui inventore qui voluptatibus nulla
          adipisci. Dignissimos maxime beatae cumque aperiam est. Tempora libero
          quaerat harum nihil porro maiores quidem eum.
        </Step.Step>
        <Step.Step
          value={5}
          className="flex flex-col gap-2 justify-center items-center"
        >
          Repellendus laborum eos unde itaque totam placeat veritatis facere.
          Dignissimos et quia veniam consequatur doloribus commodi totam. Quo
          magni voluptatem quis odit modi. Omnis vel quia tempore.
        </Step.Step>
        <Step.Share
          as="div"
          end
          className="flex gap-2 justify-center items-center"
        >
          <Step.Button
            className="data-[has-prev=true]:opacity-50 data-[has-prev=true]:pointer-events-none data-[has-prev=true]:cursor-none bg-pink-400 rounded p-1.5 text-white hover:bg-pink-400/75 active:bg-pink-500/75 transition-colors duration-75 shadow shadow-pink-400"
            onClick={(set) => set((step) => Math.max(1, step - 1))}
          >
            Previous
          </Step.Button>
          <Step.Button
            className="data-[has-next=true]:opacity-50 data-[has-next=true]:pointer-events-none data-[has-next=true]:cursor-none bg-pink-400 rounded p-1.5 text-white hover:bg-pink-400/75 active:bg-pink-500/75 transition-colors duration-75 shadow shadow-pink-400"
            onClick={(set, length) => set((step) => Math.min(length, step + 1))}
          >
            Next
          </Step.Button>
        </Step.Share>
      </Step.Root>
    </main>
  );
}

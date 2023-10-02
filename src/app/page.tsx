"use client";

import { create, useMessage } from "@/libs/hooks/useMessage";
import { ReactNode } from "react";

const count = create(0);
export default function Home() {
  const [state, setState] = useMessage(count);
  return (
    <main className="bg-pink-200 p-4 min-h-screen flex justify-center items-center">
      <button onClick={(e) => setState((c) => c + 1)}>click</button>
      <Child>
        <Child>
          <Child>
            <Child>
              <Out />
            </Child>
          </Child>
        </Child>
      </Child>
    </main>
  );
}

const Child = ({ children }: { children: ReactNode }) => <>{children}</>;

const Out = () => {
  const [state, setState] = useMessage(count);

  return (
    <div>
      {state > 20 ? (
        <>
          {state} : <Pout />
        </>
      ) : (
        state
      )}
    </div>
  );
};

const Pout = () => {
  const [state, setState] = useMessage(count);

  return <div>{state}</div>;
};

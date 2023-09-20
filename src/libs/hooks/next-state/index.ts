import { useSyncExternalStore } from "react";

type State = "CLIENT" | "SERVER";
export const useNextState = (state: State) =>
  useSyncExternalStore(
    () => () => {},
    () => state === "CLIENT",
    () => state === "SERVER"
  );

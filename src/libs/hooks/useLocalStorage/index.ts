"use client";

import { useSyncExternalStore } from "react";
import { ZodSchema } from "zod";

const subscribe = (listener: () => void) => {
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener("storage", listener);
  };
};

export const useLocalStorage = (item: string, schema: ZodSchema) =>
  useSyncExternalStore(
    subscribe,
    () => schema.parse(window.localStorage.getItem(item)),
    () => null
  );

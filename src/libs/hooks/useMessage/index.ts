"use client";

import { useEffect, useState } from "react";

type Message<T = any> = Event & { data: T };
class Messager<T> {
  private name: string;
  public value: T;
  constructor(value: T, name: string) {
    this.value = value;
    this.name = name;
  }

  effect(setState: React.Dispatch<React.SetStateAction<T>>) {
    return useEffect(() => {
      const listener = (e: Event) => {
        this.value = (e as Message<T>).data;
        setState((e as Message<T>).data);
      };
      document.addEventListener(this.name, listener);
      return () => document.removeEventListener(this.name, listener);
    }, []);
  }

  send(value: T) {
    const ev = new Event(this.name);
    (ev as Message<T>).data = value;
    document.dispatchEvent(ev);
  }
}

let id = 0;
export function create<T>(initialValue: T, name?: string) {
  return new Messager<T>(initialValue, "message:" + (name || id++));
}

type MessagerType<T extends Messager<any>> = T extends Messager<infer U>
  ? U
  : never;

export function useMessage<T extends Messager<any>>(messager: T) {
  const [state, setState] = useState<MessagerType<T>>(messager.value);

  messager.effect(setState);
  const setValue = (
    value: MessagerType<T> | ((value: MessagerType<T>) => MessagerType<T>)
  ) => messager.send(value instanceof Function ? value(state) : value);

  return [state, setValue] as const;
}

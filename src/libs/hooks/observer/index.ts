import { RecordMap } from "@/libs/class/record-map";
import { useEffect, useRef, useState } from "react";

type RecordK<T> = T extends Record<infer K, any> ? K : never;
type RecordV<T> = T extends Record<any, infer V> ? V : never;
export type Observer<TObj extends Record<PropertyKey, any>> = TObj & {
  subscribe: <TKey extends keyof TObj>(
    key: TKey,
    callback: (value: TObj[TKey]) => void
  ) => () => boolean;
};

export function useObserver<TObj extends Record<PropertyKey, any>>(
  value: TObj
): Observer<TObj> {
  const listeners = useRef<
    RecordMap<PropertyKey, (value: RecordV<TObj>) => void>
  >(new RecordMap());

  const observer = useRef(
    Object.assign(
      new Proxy(value, {
        get: (target, p, receiver) => {
          return Reflect.get(target, p, receiver);
        },
        set(target, p, newValue, receiver) {
          if (listeners.current.has(p) && target[p] !== newValue) {
            listeners.current.get(p).forEach((cb) => cb(newValue));
          }
          return Reflect.set(target, p, newValue, receiver);
        },
      }),
      {
        subscribe: <TKey extends keyof TObj>(
          key: TKey,
          callback: (value: RecordV<TObj>) => void
        ) => {
          listeners.current.set(key, callback);

          return () => listeners.current.delete(key, callback);
        },
      }
    )
  );

  return observer.current;
}

export function useSubscribe<
  TObs extends Observer<Record<any, any>>,
  TKey extends keyof Omit<TObs, "subscribe">
>(observer: TObs, observerKey: TKey, callback: (value: TObs[TKey]) => void) {
  useEffect(() => {
    const unsubscribe = observer.subscribe(observerKey, callback);

    return () => {
      unsubscribe();
    };
  }, [observer, observerKey]);
}

export function useObserverState<
  TObs extends Observer<Record<any, any>>,
  TKey extends keyof Omit<TObs, "subscribe">
>(observer: TObs, observerKey: TKey): TObs[TKey] {
  const [state, setState] = useState<TObs[TKey]>(observer[observerKey]);
  useSubscribe(observer, observerKey, setState);
  return state;
}

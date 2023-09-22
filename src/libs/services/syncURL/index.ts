"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { ZodObject, ZodOptional, ZodTypeAny, z } from "zod";

type JSONString = {} & string;

const getQueries = (searchParams: URLSearchParams) => {
  const queries: { [k: string]: any } = {};
  searchParams.forEach((v, key) => {
    const value = toPrimitive(v);
    if (queries[key]) {
      if (Array.isArray(queries[key])) {
        (queries[key] as any[]).push(value);
      } else {
        queries[key] = [queries[key], value];
      }
    } else {
      queries[key] = value;
    }
  });
  return queries;
};

const toPrimitive = <T = unknown>(value: string): T => {
  let v: any;
  try {
    v = JSON.parse(value);
  } catch (error) {
    v = Date.parse(value) ? new Date(Date.parse(value)) : NaN || value;
  } finally {
    return v;
  }
};

const nullish = <T>(value: T) =>
  Boolean(value === null || value === undefined || value === "");

function replaceHistory(params: { [x: string]: any }) {
  const url = new URL(window.location.href);
  const oldPrams = getQueries(new URLSearchParams(window.location.search));
  const newParams = { ...oldPrams, ...params };
  const search = new URLSearchParams();

  Object.keys(newParams).forEach((key) => {
    const param = newParams[key];
    if (Array.isArray(param))
      (param as any[]).forEach(
        (value) => !nullish(param) && search.append(key.toString(), value)
      );
    else !nullish(param) && search.append(key.toString(), param);
  });
  url.search = search.toString();
  window.history.replaceState({}, "", url.href);

  const event = new PopStateEvent("popstate");
  window.dispatchEvent(event);
}

function getSnapshot(): JSONString {
  return JSON.stringify(
    getQueries(new URLSearchParams(window.location.search))
  );
}

function getServerSnapshot(): JSONString {
  return JSON.stringify(null);
}

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => {
    window.removeEventListener("popstate", callback);
  };
}

type ZodRawOptionalShape = {
  [k: string]: ZodOptional<ZodTypeAny>;
};

export function useSyncURL<TSchema extends ZodObject<ZodRawOptionalShape>>(
  schema: TSchema
) {
  const string = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const stringify = useMemo(() => JSON.parse(string), [string]);

  const data = useMemo<z.infer<TSchema> | null>(() => {
    try {
      return schema.parse(stringify);
    } catch (error) {
      return null;
    }
  }, [stringify]);

  const set = (params: z.infer<TSchema>) => replaceHistory(params);

  return { data, set };
}

export function useSyncURLSelector<
  T extends Record<PropertyKey, any> | null,
  P extends (selector: NonNullable<T>) => NonNullable<T>[keyof NonNullable<T>]
>(
  data: T,
  selector: P
): readonly [
  ReturnType<P> | undefined,
  (value: ReturnType<P> | undefined) => void
];
export function useSyncURLSelector<
  T extends Record<PropertyKey, any> | null,
  P extends (selector: NonNullable<T>) => NonNullable<T>[keyof NonNullable<T>]
>(
  data: T,
  selector: P,
  initialValue: NonNullable<ReturnType<P>>
): readonly [
  NonNullable<ReturnType<P>>,
  (value: NonNullable<ReturnType<P>>) => void
];
export function useSyncURLSelector<
  T extends Record<PropertyKey, any> | null,
  P extends (selector: NonNullable<T>) => NonNullable<T>[keyof NonNullable<T>]
>(
  data: T,
  selector: P,
  initialValue?: ReturnType<P>
): readonly [
  ReturnType<P> | undefined,
  (value: ReturnType<P> | undefined) => void
] {
  const key = selector(proxy as any) as keyof T;
  const state = useMemo<ReturnType<P> | undefined>(
    () => (data ? data[key] ?? initialValue : initialValue),
    [data]
  );

  const setState = (state: ReturnType<P> | undefined) =>
    replaceHistory({ [key]: state });

  useEffect(() => {
    if (initialValue !== undefined) setState(initialValue);
  }, [initialValue]);

  return [state, setState] as const;
}

const proxy = new Proxy(
  {},
  {
    get: (_, p) => p,
  }
);

"use client";

import { useAsyncEffect } from "@/libs/hooks/useAsyncEffect";
import { DeepWriteable, ReturnAsyncType, SyncOrAsync } from "@/libs/types";
import t from "@/libs/types/t";
import { useState } from "react";
import { create } from "zustand";

const unreadonly = <
  T extends ReadonlyArray<any> | ReadonlyMap<any, any> | ReadonlySet<any>
>(
  value: T
): DeepWriteable<T> => value;

type Cache = Map<string | number, Cache | unknown>;
const useCache = create<{
  cache: Cache;
  save: (queryKeys: QueryKeys, value: unknown) => void;
  find: <T = unknown>(queryKeys: QueryKeys) => T | undefined;
}>((set, get) => ({
  cache: new Map(),
  save: (queryKeys, value) => {
    let cache = structuredClone(get().cache);
    const keys = unreadonly(structuredClone(queryKeys));
    while (keys.length) {
      const key = keys.shift();
      if (key === undefined) continue;
      if (keys.length === 0) {
        cache.set(key, value);
      } else {
        cache.set(key, new Map());
      }
    }
    set({ cache: new Map(cache) });
  },
  find: (queryKeys) => {
    let cached = structuredClone(get().cache);
    const keys = unreadonly(structuredClone(queryKeys));
    while (keys.length) {
      const key = keys.shift();
      if (key === undefined) continue;
      const item = cached.get(key);
      if (!item) return undefined;
      if (item instanceof Map) cached = item;
      else return item as any;
    }
  },
}));

type Query<TKeys extends QueryKeys> = (options: {
  signal: AbortSignal;
  queryKeys: TKeys;
}) => Promise<any>;
type QueryKeys = readonly (string | number)[] | (string | number)[];
type QueryOptions<T> = {
  onSuccess?: (data: T) => SyncOrAsync<void>;
  onError?: (error: unknown) => SyncOrAsync<void>;
};

export function useQuery<TKeys extends QueryKeys, TQuery extends Query<TKeys>>(
  queryKeys: TKeys,
  query: TQuery,
  options: QueryOptions<ReturnAsyncType<TQuery>> = {}
) {
  const save = useCache((store) => store.save);
  const find = useCache((store) => store.find);

  const [data, setData] = useState<ReturnAsyncType<TQuery> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const { onError, onSuccess } = options;
  useAsyncEffect(async () => {
    const controller = new AbortController();
    const cached = find<typeof data>(queryKeys);
    if (cached) {
      setData(cached);
      setIsSuccess(true);
      setIsError(false);
      onSuccess && onSuccess(cached);
    } else {
      try {
        setIsLoading(true);
        const data = await query({ signal: controller.signal, queryKeys });
        setData(data);
        save(queryKeys, data);
        setIsSuccess(true);
        setIsError(false);
        onSuccess && onSuccess(data);
      } catch (error) {
        setIsSuccess(false);
        setIsError(true);
        onError && onError(error);
      } finally {
        setIsLoading(false);
      }
    }
    return () => controller.abort();
  }, []);

  return { data, isLoading, isError, isSuccess };
}

export function useMutation<TQuery extends (...args: any) => Promise<any>>(
  query: TQuery
) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const mutate = async (...args: Parameters<TQuery>) => {
    let data: ReturnAsyncType<TQuery> | never = t.NEVER;
    try {
      setIsLoading(true);
      data = await query(args);
      setIsSuccess(true);
      setIsError(false);
    } catch (error) {
      setIsSuccess(false);
      setIsError(true);
    } finally {
      setIsLoading(false);
      return data;
    }
  };

  return { mutate, isLoading, isError, isSuccess };
}

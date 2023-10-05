"use client";

import {
  Convert,
  DeepWriteable,
  EqualsArray,
  JSON,
  Union,
  UnionToIntersection,
} from "@/libs/types";

type PathsToProps<
  O extends { [x: string]: any },
  T
> = T extends `${infer K}.${infer R}`
  ? K extends keyof O
    ? PathsToProps<O[K], R>
    : never
  : T extends keyof O
  ? O[T]
  : never;

type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[], D extends string> = T extends []
  ? never
  : T extends [infer F]
  ? F
  : T extends [infer F, ...infer R]
  ? F extends string
    ? `${F}${D}${Join<Extract<R, string[]>, D>}`
    : never
  : string;

export default function Translate<TLocales extends { [lang: string]: JSON }>(
  locales: TLocales
) {
  const currentLocale = "fr";
  const translations =
    Object.entries(locales).find(([k]) => k === currentLocale) ??
    locales[Object.keys(locales)[0]] ??
    {};

  return Object.assign(translations ?? {}, {
    t: <T extends string & Join<PathsToStringProps<Union<TLocales>>, ".">>(
      key: T
    ): PathsToProps<Union<TLocales>, T> => {
      return key.split(".").reduce((o: any, k: any) => {
        return o[k];
      }, translations);
    },
  });
}

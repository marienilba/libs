"use client";

import {
  ConvertedToTypeArray,
  Equals,
  JSON,
  MergeObject,
  Prettify,
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

export default function Translate<TLocales extends readonly JSON[]>(
  locales: TLocales extends Equals<ConvertedToTypeArray<TLocales, string>>
    ? TLocales
    : "LOCALES ARE NOT EQUALS" & never
) {
  return Object.assign(
    locales.reduce((prev, curr) => Object.assign(prev, curr), {}),
    {
      t: <
        T extends Join<PathsToStringProps<Prettify<MergeObject<TLocales>>>, ".">
      >(
        t: T
      ): PathsToProps<Prettify<MergeObject<TLocales>>, T> => {
        return null as any;
      },
    }
  );
}

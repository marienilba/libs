"use client";

import { JSON, Trim, Union } from "@/libs/types";

type PathArgs<T, O = {}> = T extends `${string}{{${infer V}}}${string}`
  ? T extends `${string}{{${string}}}${infer R}`
    ? PathArgs<
        R,
        {
          [K in Trim<V>]: string;
        } & O
      >
    : {
        [K in Trim<V>]: string;
      } & O
  : keyof O extends never
  ? never
  : O;

type IsEmpty<T extends string> = T extends "" ? true : false;

type PathWithoutArgs<
  T,
  U extends string = ""
> = T extends `${infer A}{{${infer B}}}${infer R}`
  ? IsEmpty<Trim<R>> extends false
    ? PathWithoutArgs<`${U}${A}${string}${R}`>
    : `${U}${A}${string}`
  : T;

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

type FunctionArgs<
  L extends { [lang: string]: JSON },
  T extends string & Join<PathsToStringProps<Union<L>>, ".">
> = PathArgs<PathsToProps<Union<L>, T>> extends never
  ? [T]
  : [T, PathArgs<PathsToProps<Union<L>, T>>];

function replace<T extends string>(
  inputString: T,
  replacementObject: { [key: string]: string }
): T {
  return inputString.replace(
    /{{\s*([^}\s]+)\s*}}/g,
    (match, key) => replacementObject[key.trim()] || match
  ) as T;
}

export default function Translate<TLocales extends { [lang: string]: JSON }>(
  locales: TLocales
) {
  const currentLocale = "fr";
  const translations =
    Object.entries(locales).find(([k]) => k === currentLocale) ??
    locales[Object.keys(locales)[0]] ??
    {};

  function t<T extends string & Join<PathsToStringProps<Union<TLocales>>, ".">>(
    ...args: FunctionArgs<TLocales, T>
  ): PathWithoutArgs<PathsToProps<Union<TLocales>, T>> {
    const [key, params = {}] = Array.from(args) as [
      T,
      PathArgs<PathsToProps<Union<TLocales>, T>>
    ];

    return replace(
      key.split(".").reduce((o: any, k: any) => {
        return o[k];
      }, translations),
      params
    );
  }

  return Object.assign(translations ?? {}, {
    t,
  });
}

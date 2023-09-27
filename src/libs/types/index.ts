export type Together<TObj> = TObj | { [K in keyof TObj]?: never };
export type Apart<
  T extends { [x: string]: any },
  U extends { [x: string]: any }
> =
  | ({
      [K in keyof T]: T[K];
    } & { [K in keyof U]?: never })
  | ({
      [K in keyof U]: U[K];
    } & { [K in keyof T]?: never });

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;

export type SingleObject<TObj extends { [x: PropertyKey]: PropertyKey }> =
  IsUnion<keyof TObj> extends true ? never : TObj;

type CheckForNever<T extends any[]> = T extends [never, ...infer U]
  ? never
  : T extends [infer H, ...infer R]
  ? CheckForNever<R>
  : T;

export type OnlySingleObject<
  TObjs extends { [x: PropertyKey]: PropertyKey }[]
> = CheckForNever<{
  [K in keyof TObjs]: SingleObject<TObjs[K]>;
}> extends never
  ? never
  : TObjs;

export type SyncOrAsync<T> = T | Promise<T>;

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

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;
export type IntersectionOf<A extends readonly any[]> = UnionToIntersection<
  A[number]
>;

export type SingleObject<TObj extends { [x: PropertyKey]: PropertyKey }> =
  IsUnion<keyof TObj> extends true ? never : TObj;

type CheckForNever<T extends any[]> = T extends [never, ...infer U]
  ? never
  : T extends [infer _, ...infer R]
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
export type ReturnAsyncType<T extends (...args: any) => any> = Awaited<
  ReturnType<T>
>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepWriteable<T> = {
  -readonly [P in keyof T]: DeepWriteable<T[P]>;
};
export type Writeable<T> = {
  -readonly [K in keyof T]: T[K];
};

type ArrayLengthMutationKeys =
  | "splice"
  | "push"
  | "pop"
  | "shift"
  | "unshift"
  | number;
type ArrayItems<T extends Array<any>> = T extends Array<infer TItems>
  ? TItems
  : never;
export type FixedLengthArray<T extends any[]> = Pick<
  T,
  Exclude<keyof T, ArrayLengthMutationKeys>
> & { [Symbol.iterator]: () => IterableIterator<ArrayItems<T>> };

export type JSON = {
  [x: string]: string | JSON;
};

export type Convert<T, U = any> = {
  [K in keyof T]: T[K] extends object ? Convert<T[K], U> : U;
};

export type ConvertArray<T extends any[], U = any> = {
  [K in keyof T]: Convert<T[K], U>;
};

export type TypeEqualityGuard<A, B> = Exclude<A, B> | Exclude<B, A>;
type IsEqual<A, B> = TypeEqualityGuard<A, B> extends never ? true : false;

type AllEqualArray<T extends any[]> = T extends [infer First, ...infer Rest]
  ? Rest extends []
    ? true
    : IsEqual<First, Rest[0]> extends true
    ? AllEqualArray<Rest>
    : false
  : true;

export type EqualsArray<T extends any[]> = AllEqualArray<T> extends true
  ? T
  : never;

export type MergeObject<T extends readonly object[]> = {
  [K in keyof T[0]]: UnionFromKey<T, K>;
};

type UnionFromKey<
  T extends readonly object[],
  K extends keyof T[0]
> = T[number][K];

export type Union<T> = {
  [K in keyof T]: T[K];
}[keyof T];

type PickType<T, K extends AllKeys<T>> = T extends { [k in K]?: any }
  ? T[K]
  : undefined;
type CommonKeys<T extends object> = keyof T;
type AllKeys<T> = T extends any ? keyof T : never;
type Subtract<A, C> = A extends C ? never : A;
type NonCommonKeys<T extends object> = Subtract<AllKeys<T>, CommonKeys<T>>;
type PickTypeOf<T, K extends string | number | symbol> = K extends AllKeys<T>
  ? PickType<T, K>
  : never;
export type Merge<T extends object> = {
  [k in CommonKeys<T>]: PickTypeOf<T, k>;
} & {
  [k in NonCommonKeys<T>]?: PickTypeOf<T, k>;
};
export type Equals<T> = T extends infer U ? (U extends T ? U : never) : never;

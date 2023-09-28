type Constructor =
  | ObjectConstructor
  | ArrayConstructor
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | FunctionConstructor
  | RegExpConstructor
  | DateConstructor
  | ErrorConstructor
  | MapConstructor
  | SetConstructor
  | PromiseConstructor
  | Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

export const isConstructorOf = <T extends Constructor>(
  value: any,
  constructor: T
): value is T => value.constructor === constructor;

export const isInstanceOf = <T extends Function>(
  value: any,
  instance: T
): value is T => value instanceof instance;

type Type =
  | "undefined"
  | "object"
  | "boolean"
  | "number"
  | "bigint"
  | "string"
  | "symbol"
  | "function"
  | "object"
  | "undefined";

export const isTypeOf = <T extends Type>(value: any, type: T): value is T =>
  typeof value === type;

export const is = <T>(value: any): value is T => true;

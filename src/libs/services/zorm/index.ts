"use client";

declare global {
  interface ObjectConstructor {
    keys<T extends object>(o: T): (keyof T)[];
  }
}

import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ZodArray,
  ZodBranded,
  ZodEffects,
  ZodError,
  ZodNullable,
  ZodObject,
  ZodOptional,
  ZodPromise,
  ZodRawShape,
  ZodRecord,
  ZodSchema,
  z,
} from "zod";

export function useZorm<TSchema extends ZodSchema>(
  schema: TSchema,
  submit: (
    event: React.FormEvent<HTMLFormElement> &
      z.SafeParseReturnType<z.infer<TSchema>, z.infer<TSchema>>
  ) => void | Promise<void>
) {
  const [errors, setErrors] = useState<z.ZodError<z.infer<TSchema>>>(
    new ZodError([])
  );

  const mock = ZormUtil.mock(schema);

  return {
    form: {
      submit: async (event: React.FormEvent<HTMLFormElement>) => {
        if (ZormUtil.promises(schema)) event.preventDefault();
        const result = await ZormUtil.process(schema, event);
        setErrors(result.success ? new ZodError([]) : result.error);
        submit(Object.assign(event, result));
      },
    },
    fields: ZormUtil.generateFields(mock),
    errors: Object.assign(ZormUtil.generateErrors(mock, errors), {
      errors: () => errors.errors,
    }),
    watch: ZormUtil.generateWatch(schema, setErrors),
  };
}

class ZormUtil {
  static generateWatch<TSchema extends ZodSchema>(
    schema: TSchema,
    setError: Dispatch<SetStateAction<ZodError>>
  ) {
    return <TPath extends string>(
      ref: RefObject<HTMLFormElement>,
      path: WatchPatcher<TPath, DeepRemoveOptionals<TSchema["_type"]>>
    ): WatchResult<TPath, DeepRemoveOptionals<TSchema["_type"]>> | null => {
      const [state, setState] = useState<WatchResult<
        TPath,
        DeepRemoveOptionals<TSchema["_type"]>
      > | null>(null);

      const validation = useRef(
        ZormUtil.extraction(schema, ZormUtil.path(path))
      );

      useEffect(() => {
        const listener = async (event: Event) => {
          if (!ref.current || !validation.current) return;
          const target = event.target as HTMLInputElement;

          const implied = ZormUtil.implied(
            ZormUtil.path(target.name),
            ZormUtil.path(path)
          );

          if (implied) {
            const raw = Object.fromEntries(new FormData(ref.current));
            const mapped = this.mapObject(raw);

            const nestOut = ZormUtil.nestOut(ZormUtil.path(path), mapped);

            const validate = await validation.current.safeParseAsync(nestOut);

            if (validate.success) {
              setState(validate.data);
              setError(
                (errors) =>
                  new ZodError(
                    errors.errors.filter(
                      (error) =>
                        !ZormUtil.implied(error.path, ZormUtil.path(path))
                    )
                  )
              );
            } else {
              setError((error) => {
                const ep = ZormUtil.path(path);
                validate.error.errors.forEach((error) => {
                  error.path = ep;
                });
                return new ZodError([
                  ...error.errors.filter(
                    (error) => !ZormUtil.implied(error.path, ep)
                  ),
                  ...validate.error.errors,
                ]);
              });
            }
          }
        };

        if (ref.current) ref.current.addEventListener("input", listener);
        return () => ref.current?.removeEventListener("input", listener);
      }, [ref]);

      return state;
    };
  }

  static nestOut(path: string[], object: Record<PropertyKey, any>) {
    return path.reduce((result, key) => result?.[key], object);
  }
  /**
   * Return path [] format to array format
   * @param path
   * @returns path[]
   */
  static path(path: string): string[] {
    return path
      .match(/\[(.*?)\]/g)!
      .filter((match) => !/\d+/.test(match))
      .map((match) => match.slice(1, -1));
  }

  /**
   * Compare if target is implied in path
   * @param target
   * @param path
   * @returns
   */
  static implied(target: PropertyKey[], path: PropertyKey[]) {
    if (target.length < path.length) return false;
    const trimmed = target.slice(0, path.length);

    return trimmed.every((value, index) => value === path[index]);
  }

  static arrayEquals(array1: PropertyKey[], array2: PropertyKey[]) {
    return (
      array1.length === array2.length &&
      array1.every((value, index) => value === array2[index])
    );
  }
  /**
   * Get schema based from path
   * @param schema
   * @param path
   */
  static extraction<TSchema extends ZodSchema>(
    schema: TSchema,
    path: string[]
  ): ZodSchema<any> | undefined {
    const tar = path.shift();
    if (tar === undefined) return schema;

    const through = ZormUtil.through(schema);
    const obj = ZormUtil.object(through);

    const shape = obj[tar];
    if (ZormUtil.through(shape) instanceof ZodObject) {
      return ZormUtil.extraction(shape, path);
    } else if (ZormUtil.through(shape) instanceof ZodArray) {
      if (path.length) return ZormUtil.extraction(ZormUtil.array(shape), path);
      else return shape;
    }

    return shape;
  }

  /**
   * safeParse the form data with the schema
   * @param schema
   * @param event
   * @returns ZodSafeParse
   */
  static async process<TSchema extends ZodSchema>(
    schema: TSchema,
    event: React.FormEvent<HTMLFormElement>
  ) {
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const mapped = this.mapObject(raw);
    return await schema.safeParseAsync(mapped);
  }

  /**
   * Map the data from form to object
   * @param raw
   * @returns object
   */
  private static mapObject(raw: Record<string, any>) {
    const result: Record<PropertyKey, any> = {};

    for (const key in raw) {
      const value = raw[key];
      const keys = key.split(/\]\[|\[|\]/).filter((k) => k !== "");

      let obj = result;
      keys.forEach((k, index) => {
        if (!obj[k]) {
          obj[k] = {};
        }
        if (index === keys.length - 1) {
          obj[k] = value;
        }
        obj = obj[k];
      });
    }

    return ZormUtil.mapArray(result);
  }

  /**
   * Map mapObject object-arrays to arrays
   * @param obj
   * @returns object
   */
  private static mapArray(obj: any): Record<PropertyKey, any> {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj) || ZormUtil.isNumericKeys(obj)) {
      return Object.values(obj).map(ZormUtil.mapArray);
    }

    const result: Record<PropertyKey, any> = {};
    for (const key in obj) {
      result[key] = ZormUtil.mapArray(obj[key]);
    }

    return result;
  }

  /**
   * Return if a object have only numeric keys
   * @param obj
   * @returns boolean
   */
  private static isNumericKeys(obj: Record<string, any>) {
    return Object.keys(obj).every((key) => !isNaN(parseInt(key)));
  }

  /**
   * Generate fields name based on object
   * @param object
   * @param path
   */
  static generateFields<TObject extends Record<PropertyKey, any>>(
    object: TObject,
    path: string = ""
  ): DeepWrapField<DeepRemoveOptionals<TObject>> {
    return Object.keys(object).reduce((prev, key) => {
      const value = object[key];
      if (z.object({}).safeParse(value).success) {
        return {
          ...prev,
          [key]: () =>
            Object.assign(
              ZormUtil.generateFields(value, path + `[${key.toString()}]`),
              { name: () => path + `[${key.toString()}]` }
            ),
        };
      }
      if (z.array(z.any()).min(1).safeParse(value).success) {
        const inside = value[0];
        if (
          z.object({}).safeParse(inside).success ||
          z.array(z.any()).min(1).safeParse(inside).success
        ) {
          return {
            ...prev,
            [key]: (index?: number) =>
              typeof index === "number"
                ? Object.assign(
                    ZormUtil.generateFields(
                      inside,
                      path + `[${key.toString()}]` + `[${index}]`
                    ),
                    { name: () => path + `[${key.toString()}]` + `[${index}]` }
                  )
                : { name: () => path + `[${key.toString()}]` },
          };
        } else {
          return {
            ...prev,
            [key]: (index?: number) => ({
              name: () =>
                path + typeof index === "number"
                  ? `[${key.toString()}]` + `[${index}]`
                  : `[${key.toString()}]`,
            }),
          };
        }
      }

      return {
        ...prev,
        [key]: () => ({
          name: () => path + `[${key.toString()}]`,
        }),
      };
    }, {} as any);
  }

  /**
   * Generate errors name based on object
   * @param object
   * @param path
   */
  static generateErrors<
    TObject extends Record<PropertyKey, any>,
    TError extends ZodError
  >(
    object: TObject,
    errors: TError,
    path: PropertyKey[] = []
  ): DeepWrapError<DeepRemoveOptionals<TObject>> {
    return Object.keys(object).reduce((prev, key) => {
      const value = object[key];
      if (z.object({}).safeParse(value).success) {
        return {
          ...prev,
          [key]: () =>
            Object.assign(
              {},
              ZormUtil.generateErrors(value, errors, [...path, key]),
              { errors: () => this.findError(errors, [...path, key]) }
            ),
        };
      }
      if (z.array(z.any()).min(1).safeParse(value).success) {
        const inside = value[0];
        if (
          z.object({}).safeParse(inside).success ||
          z.array(z.any()).min(1).safeParse(inside).success
        ) {
          return {
            ...prev,
            [key]: (index?: number) =>
              typeof index === "number"
                ? Object.assign(
                    {},
                    ZormUtil.generateErrors(inside, errors, [
                      ...path,
                      key,
                      index,
                    ]),
                    {
                      errors: () =>
                        this.findError(errors, [...path, key, index]),
                    }
                  )
                : { errors: () => this.findError(errors, [...path, key]) },
          };
        } else {
          return {
            ...prev,
            [key]: (index?: number) => ({
              errors: () =>
                ZormUtil.findError(
                  errors,
                  typeof index === "number"
                    ? [...path, key, index]
                    : [...path, key]
                ),
            }),
          };
        }
      }

      return {
        ...prev,
        [key]: () => ({
          errors: () => ZormUtil.findError(errors, [...path, key]),
        }),
      };
    }, {} as any);
  }

  static findError(errors: ZodError, path: PropertyKey[]) {
    return errors.errors.filter((error) => ZormUtil.implied(error.path, path));
  }

  /**
   * Mock a value object based from a zod schema
   * @param schema
   * @returns mock
   */
  static mock<TSchema extends ZodSchema>(schema: TSchema): TSchema["_type"] {
    const shape = ZormUtil.object(schema);
    const mock = ZormUtil.shapeOut(shape);

    return mock ?? {};
  }

  /**
   * Recursive transform zod schema to native object
   * @param schema
   * @returns object
   */
  private static shapeOut<TSchema extends ZodRawShape>(
    schema: TSchema
  ): Record<PropertyKey, any> | null {
    if (schema.constructor === Object) {
      const keys = Object.keys(schema);
      if (keys.length === 0) return null;
      return keys.reduce((obj, key) => {
        const value = ZormUtil.through(schema[key] as ZodSchema);

        if (value instanceof ZodObject) {
          return { ...obj, [key]: this.shapeOut(ZormUtil.shape(value)) };
        }

        if (value instanceof ZodArray) {
          return { ...obj, [key]: [this.shapeOut(ZormUtil.shape(value))] };
        }

        return { ...obj, [key]: null };
      }, {});
    }

    return null;
  }

  /**
   * Assert schema is a ZodObject
   * @param schema
   * @returns boolean
   */
  private static object<TSchema extends ZodSchema>(
    schema: TSchema
  ): ZodRawShape {
    const schemaObject = ZormUtil.through(schema);
    if (schemaObject instanceof ZodObject) return schemaObject.shape;
    throw new Error("The schema type must be a object");
  }

  /**
   * Assert schema is a ZodArray
   * @param schema
   * @returns boolean
   */
  private static array<TSchema extends ZodSchema>(schema: TSchema): ZodSchema {
    const schemaArray = ZormUtil.through(schema);
    if (schemaArray instanceof ZodArray) return schemaArray.element;
    throw new Error("The schema type must be a array");
  }

  /**
   * Assert schema has a promise function
   * @param schema
   */
  static promises<TSchema extends ZodSchema>(schema: TSchema): boolean {
    try {
      schema.parse(z.NEVER, { async: true });
    } catch (error) {
      return (
        error instanceof Error &&
        error.message === "Synchronous parse encountered promise."
      );
    }
    return false;
  }

  /**
   * Remove all effects, optionals etc
   */
  static through<TSchema extends ZodSchema>(schema: TSchema, promise = true) {
    let out = schema;
    while (ZormUtil.outable(out, promise))
      try {
        out = ZormUtil.out(out, promise);
      } catch (error) {
        break;
      }

    return out;
  }

  /**
   * Get schema shape
   * @param schema
   * @returns shape
   */
  static shape<TSchema extends ZodSchema>(schema: TSchema): any {
    if (schema instanceof ZodArray || schema instanceof ZodRecord)
      return ZormUtil.shape(ZormUtil.through(schema.element));

    if (schema instanceof ZodObject) return schema.shape;

    return schema;
  }

  /**
   * Out schema from other effects
   * @param schema
   * @returns
   */
  static out<TSchema extends ZodSchema>(schema: TSchema, effect = true) {
    if (
      schema instanceof ZodOptional ||
      schema instanceof ZodNullable ||
      schema instanceof ZodBranded ||
      schema instanceof ZodPromise ||
      schema instanceof ZodBranded
    )
      return schema.unwrap();

    if (effect && schema instanceof ZodEffects) return schema.innerType();

    throw new Error(`schema ${schema.description} can't be outed`);
  }

  /**
   * Return if schema have effects
   * @param schema
   * @returns boolean
   */
  static outable<TSchema extends ZodSchema>(schema: TSchema, effect = true) {
    return (
      (effect && schema instanceof ZodEffects) ||
      schema instanceof ZodOptional ||
      schema instanceof ZodBranded ||
      schema instanceof ZodNullable ||
      schema instanceof ZodPromise
    );
  }
}

type DeepRemoveOptionals<T> = T extends object
  ? {
      [K in keyof T]-?: DeepRemoveOptionals<T[K]>;
    }
  : T;

type DeepWrapField<T, P extends string = ""> = {
  [K in keyof T]: T[K] extends any[]
    ? <TIndex>(index?: TIndex) => TIndex extends number
        ? DeepWrapField<T[K][number], `${P}[${K & string}][${TIndex}]`> & {
            name: () => `${P}[${K & string}][${TIndex}]`;
          }
        : {
            name: () => `${P}[${K & string}]`;
          }
    : T[K] extends { [x: string]: any }
    ? () => DeepWrapField<T[K], `${P}[${K & string}]`> & {
        name: () => `${P}[${K & string}]`;
      }
    : () => { name: () => `${P}[${K & string}]` };
} & {};

type DeepWrapError<T> = {
  [K in keyof T]: T[K] extends any[]
    ? <TIndex>(index?: TIndex) => TIndex extends number
        ? DeepWrapError<T[K][number]> & {
            errors: () => ZodError<T[K]>["errors"] | undefined;
          }
        : { errors: () => ZodError<T[K]>["errors"] | undefined }
    : T[K] extends { [x: string]: any }
    ? () => DeepWrapError<T[K]> & {
        errors: () => ZodError<T[K]>["errors"] | undefined;
      }
    : () => { errors: () => ZodError<T[K]>["errors"] | undefined };
} & {};

type WatchPatcher<
  T extends string,
  M,
  N = false
> = T extends `[${infer K}]${infer R}`
  ? N extends true
    ? R extends `[${infer RK}]${infer RR}`
      ? RK extends keyof M
        ? RR extends `[${string | number}]`
          ? M[RK] extends any[]
            ? `[${K}][${RK}]${WatchPatcher<RR, M[RK][number], true>}`
            : `[${K}][${RK}]${WatchPatcher<RR, M[RK]>}`
          : RR extends ""
          ? T
          : never
        : never
      : K extends `${number}`
      ? T
      : never
    : K extends keyof M
    ? R extends `[${string | number}]`
      ? M[K] extends any[]
        ? `[${K}]${WatchPatcher<R, M[K][number], true>}`
        : `[${K}]${WatchPatcher<R, M[K]>}`
      : R extends ""
      ? T
      : never
    : never
  : never;

type WatchResult<T extends string, M> = T extends `[${infer K}]${infer R}`
  ? K extends `${number}`
    ? M extends any[]
      ? WatchResult<R, M[number]>
      : never
    : K extends keyof M
    ? WatchResult<R, M[K]>
    : never
  : M;

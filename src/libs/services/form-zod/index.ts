import { useRef, useState } from "react";
import {
  ZodArray,
  ZodEffects,
  ZodError,
  ZodObject,
  ZodOptional,
  ZodSchema,
  z,
} from "zod";

type ExtractSchema<T extends ZodObject<any> | ZodEffects<ZodObject<any>>> =
  T extends ZodEffects<ZodObject<any>> ? ReturnType<T["innerType"]> : T;

type EventData<TData> =
  | {
      data: TData;
      success: true;
    }
  | {
      success: false;
      error: ZodError;
    };

export function useForm<TSchema extends ZodObject<any>>(
  schema: TSchema,
  submit: (
    event: React.FormEvent<HTMLFormElement> & EventData<z.infer<TSchema>>
  ) => void | Promise<void>
) {
  const form = useRef<HTMLFormElement>();
  const listeners = useRef<Set<string>>(new Set());

  const [watchs, setWatchs] = useState<
    Record<string, { data: any; errors?: string[] }>
  >({});

  const [errors, setErrors] = useState<Record<PropertyKey, any> | null>(null);

  // @ts-ignore
  return {
    watch: function <TName extends Name<any>>(
      name: TName
    ): {
      data: (typeof name)["__type"];
      errors?: string[];
    } {
      listeners.current.add(name);
      return watchs[name] ?? { data: undefined };
    },
    ref: () => (element: HTMLFormElement | null) => {
      if (element && !form.current) {
        form.current = element;
        form.current.addEventListener("input", (event) => {
          const target = event.target as HTMLInputElement;
          if (target) {
            if (listeners.current.has(target.name)) {
              const verificator = extractNameSchema(
                schema,
                nameToArray(target.name)
              );

              const verification = verificator.safeParse(
                target.value || undefined // || undefined to avoid coerce to set at default JS value
              );

              const value = verification.success
                ? { data: verification.data }
                : {
                    data: undefined,
                    errors: verification.error.errors.map((err) => err.message),
                  };

              setWatchs((v) => ({
                ...v,
                [target.name]: value,
              }));
            }
          }
        });
      }
    },
    form: () => ({
      onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
        const data = convertFormDataToObject(
          Object.fromEntries(new FormData(event.currentTarget))
        );
        const res = schema.safeParse(data);
        // @ts-ignore
        event["data"] = res.data;
        // @ts-ignore
        event["success"] = res.success;
        // @ts-ignore
        event["error"] = res.error;
        // @ts-ignore
        if (res.error && res.error instanceof ZodError) {
          // @ts-ignore
          const errors = convertZodErrorToObject(res.error);
          setErrors(errors);
        } else {
          setErrors(null);
        }
        // @ts-ignore
        submit(event);
      },
    }),
    fields: {
      ...convertZodSchemaKeys(schema),
    },
    errors: {
      ...convertZodSchemaErrors(schema, errors),
    },
  };
}

type Name<T> = { __type: T } & string;

type ConverterKeys<TSchema extends ZodObject<any>> = {
  [TP in keyof z.infer<TSchema>]-?: TSchema["shape"][TP] extends ZodArray<any>
    ? (index: number) => ConverterKeys<TSchema["shape"][TP]["element"]>
    : TSchema["shape"][TP] extends ZodObject<any>
    ? () => ConverterKeys<TSchema["shape"][TP]>
    : TSchema["shape"][TP] extends ZodEffects<any>
    ? (
        index?: number
      ) => ConverterKeys<
        ReturnType<TSchema["shape"][TP]["innerType"]> extends ZodArray<any>
          ? ReturnType<TSchema["shape"][TP]["innerType"]>["element"]
          : ReturnType<TSchema["shape"][TP]["innerType"]>
      >
    : () => Name<z.infer<TSchema["shape"][TP]>>;
};

function convertZodSchemaKeys<TSchema extends ZodObject<any>>(
  schema: TSchema,
  pre_field = ""
): ConverterKeys<ExtractSchema<TSchema>> {
  const obj: Record<PropertyKey, any> = {};

  for (const field in schema.shape) {
    let shape = schema.shape[field];
    if (shape instanceof ZodOptional) shape = shape.unwrap();
    if (shape instanceof ZodEffects) shape = shape.innerType();
    if (shape instanceof ZodObject) {
      obj[field] = () => convertZodSchemaKeys(shape, field);
    } else if (shape instanceof ZodArray) {
      obj[field] = (index: number) =>
        convertZodSchemaKeys(
          shape.element,
          concatFieldAndIndex(concatPrefieldAndField(pre_field, field), index)
        );
    } else {
      obj[field] = () => concatPrefieldAndField(pre_field, field);
    }
  }

  // @ts-ignore
  return obj;
}

type ConverterErrors<TSchema extends ZodObject<any>> = {
  [TP in keyof z.infer<TSchema>]-?: TSchema["shape"][TP] extends ZodArray<any>
    ? (index: number) => ConverterErrors<TSchema["shape"][TP]["element"]> & {
        error: () => string[] | undefined;
      }
    : TSchema["shape"][TP] extends ZodObject<any>
    ? () => ConverterErrors<TSchema["shape"][TP]> & {
        error: () => string[] | undefined;
      }
    : TSchema["shape"][TP] extends ZodEffects<any>
    ? () => ConverterKeys<
        ReturnType<TSchema["shape"][TP]["innerType"]> extends ZodArray<any>
          ? ReturnType<TSchema["shape"][TP]["innerType"]>["element"]
          : ReturnType<TSchema["shape"][TP]["innerType"]>
      > & {
        error: () => string[] | undefined;
      }
    : () => string[];
};

function convertZodSchemaErrors<TSchema extends ZodObject<any>>(
  schema: TSchema,
  errors: Record<PropertyKey, any> | null,
  pre_field = ""
): ConverterErrors<ExtractSchema<TSchema>> {
  const obj: Record<PropertyKey, any> = {};

  for (const field in schema.shape) {
    let shape = schema.shape[field];
    if (shape instanceof ZodOptional) shape = shape.unwrap();
    if (shape instanceof ZodEffects) shape = shape.innerType();
    if (shape instanceof ZodObject) {
      obj[field] = () => ({
        error: () =>
          errors
            ? errors[concatPrefieldAndField(pre_field, field)] ?? undefined
            : undefined,
        ...convertZodSchemaErrors(shape, errors, field),
      });
    } else if (shape instanceof ZodArray) {
      obj[field] = (index: number) => ({
        error: () =>
          errors
            ? errors[
                concatFieldAndIndex(
                  concatPrefieldAndField(pre_field, field),
                  index
                )
              ] ?? undefined
            : undefined,
        ...convertZodSchemaErrors(
          shape.element,
          errors,
          concatFieldAndIndex(concatPrefieldAndField(pre_field, field), index)
        ),
      });
    } else {
      obj[field] = () =>
        errors
          ? errors[concatPrefieldAndField(pre_field, field)] ?? undefined
          : undefined;
    }
  }

  // @ts-ignore
  return obj;
}

function concatPrefieldAndField(pre_field: string, field: string) {
  return pre_field ? pre_field + `[${field}]` : `[${field}]`;
}

function concatFieldAndIndex(field: string, index: number) {
  return field + `[${index}]`;
}

function convertZodErrorToObject(error: ZodError) {
  const errors = error.errors
    .flat()
    .map((err) => ({
      path: err.path.map((p) => `[${p}]`).join(""),
      message: err.message,
    }))
    .reduce((prev, curr) => {
      // @ts-ignore
      if (prev[curr.path]) {
        // @ts-ignore
        prev[curr.path] = [...prev[curr.message], curr.message];
      } else {
        // @ts-ignore
        prev[curr.path] = [curr.message];
      }
      return prev;
    }, {});

  return errors;
}

function convertFormDataToObject(input: Record<string, any>) {
  const result: Record<PropertyKey, any> = {};

  for (const key in input) {
    const value = input[key];
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

  return convertObjectToArrays(result);
}

function convertObjectToArrays(obj: any): Record<PropertyKey, any> {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj) || isNumericKeys(obj)) {
    return Object.values(obj).map(convertObjectToArrays);
  }

  const result: Record<PropertyKey, any> = {};
  for (const key in obj) {
    result[key] = convertObjectToArrays(obj[key]);
  }

  return result;
}

function isNumericKeys(obj: Record<PropertyKey, any>) {
  // @ts-ignore
  return Object.keys(obj).every((key) => !isNaN(parseInt(key)));
}

export type Form<TSchema extends ZodObject<any>> = ReturnType<
  typeof useForm<TSchema>
>;

export type Watch<TSchema extends ZodObject<any>> = ReturnType<
  typeof useForm<TSchema>
>["watch"];

export type Fields<TSchema extends ZodObject<any>> = ReturnType<
  typeof useForm<TSchema>
>["fields"];

export type Errors<TSchema extends ZodObject<any>> = ReturnType<
  typeof useForm<TSchema>
>["errors"];

const nameToArray = (name: string) =>
  name
    .match(/\[(.*?)\]/g)!
    .filter((match) => !/\d+/.test(match))
    .map((match) => match.slice(1, -1));

function extractNameSchema(
  schema: ZodObject<any>,
  target: string[]
): ZodSchema {
  const first = target.shift();

  if (!first) {
    throw new Error("No more keys in the target");
  }

  const shape = schema.shape[first] as ZodSchema;

  if (!shape) {
    throw new Error(`Key '${first}' not found in the schema`);
  }

  if (shape instanceof ZodArray) {
    return extractNameSchema(shape.element, target);
  } else if (shape instanceof ZodObject) {
    return extractNameSchema(shape, target);
  }

  return shape; // Found the target schema
}

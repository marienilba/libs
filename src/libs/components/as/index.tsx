import { type ComponentProps } from "react";

export type AsProps<T extends keyof JSX.IntrinsicElements> =
  ComponentProps<T> & {
    as: T;
  };

export function As<T extends keyof JSX.IntrinsicElements>({
  as,
  ...props
}: AsProps<T>) {
  const Tag = as;

  // @ts-ignore
  return <Tag {...props} />;
}

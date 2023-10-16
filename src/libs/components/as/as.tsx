import { type ComponentProps } from "react";

type Props<T extends keyof JSX.IntrinsicElements> = ComponentProps<T> & {
  as: T;
};

export function As<T extends keyof JSX.IntrinsicElements>({
  as,
  ...props
}: Props<T>) {
  const Tag = as;

  // @ts-ignore
  return <Tag {...props} />;
}

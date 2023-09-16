import { CSSProperties, ComponentProps, ReactElement } from "react";

type Axis = 0 | 1 | 2;

type TooltipProps = {
  value: string;
  children: ReactElement;
  className?: string;
  x?: Axis;
  y?: Axis;
} & Omit<ComponentProps<"data">, "value" | "className" | "style">;

export const Tooltip = ({
  value,
  x = 1,
  y = 0,
  className,
  children,
  ...props
}: TooltipProps) => {
  return (
    <data
      {...props}
      data-x={x}
      data-y={y}
      style={
        {
          "--y": y === 2 ? "-100%" : y === 1 ? "0%" : "100%",
        } as CSSProperties
      }
      value={value}
      className={`relative hover:after:content-[attr(value)] after:-translate-y-[var(--y)] after:absolute flex data-[x='0']:justify-start data-[x='1']:justify-center data-[x='2']:justify-end data-[y='1']:data-[x='0']:after:-translate-x-[calc(100%+0.5rem)] data-[y='1']:data-[x='2']:after:translate-x-[calc(100%+0.5rem)] ${className}`}
    >
      {children}
    </data>
  );
};

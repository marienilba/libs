import { ComponentProps } from "react";

const Popover = () => {};

Popover.Root = ({ children, ...props }: ComponentProps<"details">) => (
  <details className="group/popover relative" {...props}>
    {children}
  </details>
);

Popover.Trigger = ({
  children,
  style,
  className,
  ...props
}: ComponentProps<"summary">) => (
  <summary
    style={{ ...style, listStyle: "none" }}
    className={`group-open/popover:after:content-[''] group-open/popover:after:w-screen group-open/popover:after:fixed group-open/popover:after:h-screen group-open/popover:after:top-0 group-open/popover:after:left-0 ${className}`}
    {...props}
  >
    {children}
  </summary>
);

Popover.Content = ({
  children,
  style,
  ...props
}: ComponentProps<"section">) => (
  <section style={{ ...style, position: "absolute" }} {...props}>
    {children}
  </section>
);

export const { Content, Root, Trigger } = Popover;

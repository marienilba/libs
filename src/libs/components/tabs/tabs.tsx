import React from "react";
import { ComponentProps } from "react";

const Tabs = () => {};

Tabs.Root = ({ children, ...props }: ComponentProps<"section">) => {
  const childs = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child) && index && child.type === Tabs.Content) {
      return Tabs.Content({ ...child.props, "data-tab-index": index });
    }
    return child;
  });

  return <section {...props}>{childs}</section>;
};

Tabs.Panel = ({ children, ...props }: ComponentProps<"ul">) => {
  const childs = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child) && child.type === Tabs.Trigger) {
      return Tabs.Trigger({ ...child.props, tabIndex: index + 1 });
    }
    return child;
  });

  return <ul {...props}>{childs}</ul>;
};

Tabs.Trigger = ({ children, tabIndex, ...props }: ComponentProps<"li">) => (
  <li {...props}>
    <a href={`#tabs-${tabIndex}`}>{children}</a>
  </li>
);

Tabs.Content = ({
  children,
  className = "",
  ...props
}: ComponentProps<"div">) => (
  <div
    className={`absolute first-of-type:z-10 target:z-10 ${className}`}
    {...props}
    // @ts-ignore
    id={`tabs-${props["data-tab-index"]}`}
  >
    {children}
  </div>
);

export const { Root, Panel, Trigger, Content } = Tabs;

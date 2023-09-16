"use client";

import React, {
  ComponentProps,
  createContext,
  useContext,
  useState,
} from "react";

type GroupProps = {
  defaultIndex?: number;
  toggle?: boolean;
};

const Context = createContext<{
  index: number | undefined;
  setIndex: (index: number | undefined) => void;
  toggle: boolean | undefined;
}>({
  index: -1,
  setIndex: (index: number | undefined) => {},
  toggle: false,
});

const Iterator = createContext(0);

const Accordion = () => <></>;

Accordion.Group = ({
  children,
  toggle,
  defaultIndex,
  ...props
}: ComponentProps<"div"> & GroupProps) => {
  const [index, setIndex] = useState(defaultIndex);

  // Quirky hack to get child positions
  const childs = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return <Iterator.Provider value={index}>{child}</Iterator.Provider>;
    }
  });

  return (
    <Context.Provider
      value={{
        index,
        setIndex,
        toggle,
      }}
    >
      <div data-toggle={toggle} data-index={index} {...props}>
        {childs}
      </div>
    </Context.Provider>
  );
};

Accordion.Item = ({
  children,
  itemID,
  ...props
}: ComponentProps<"details">) => {
  const { index: groupIndex, setIndex, toggle } = useContext(Context);
  const compIndex = useContext(Iterator);
  const open = groupIndex === compIndex;

  return (
    <details
      open={open}
      {...props}
      onToggle={(event) => {
        if (toggle) {
          const toggleOpen = (event.target as HTMLDetailsElement).open;
          if (toggleOpen) setIndex(compIndex);
          if (!toggleOpen && open) setIndex(undefined);
        }
      }}
    >
      {children}
    </details>
  );
};

Accordion.Title = ({ children, ...props }: ComponentProps<"summary">) => {
  return <summary {...props}>{children}</summary>;
};

Accordion.Body = ({ children, ...props }: ComponentProps<"section">) => {
  return <section {...props}>{children}</section>;
};

export const { Group, Item, Body, Title } = Accordion;

"use client";

import { useInstersectionObserver } from "@/libs/hooks/inView";
import { Observer, useObserver, useObserverState } from "@/libs/hooks/observer";
import {
  Children,
  ComponentProps,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

export const Carousel = () => <></>;

type Range = { min: number; max: number; length: number };
const Context = createContext<{
  refs: HTMLElement[];
  refsView: Map<number, boolean>;
  setRefsView: (value: number, inView: boolean) => void;
  setLength: (length: number) => void;
  range: Observer<Range>;
}>({
  refs: [],
  refsView: new Map(),
  setRefsView: () => {},
  setLength: () => {},
  range: null as any,
});

type RootProps = {} & ComponentProps<"section">;
Carousel.Root = ({ children, ...props }: RootProps) => {
  const refs = useRef<HTMLElement[]>([]);
  const refsView = useRef<Map<number, boolean>>(new Map());
  const range = useObserver<Range>({ min: 0, max: 0, length: 0 });

  useLayoutEffect(() => {
    refs.current[0]?.scrollIntoView({ behavior: "instant" });
  }, []);

  return (
    <Context.Provider
      value={{
        refs: refs.current,
        refsView: refsView.current,
        setRefsView: (value, inView) => {
          refsView.current.set(value, inView);
          const inViews = Array.from(refsView.current)
            .filter(([_, k]) => k)
            .map(([v]) => v);

          range.min = Math.min(...inViews);
          range.max = Math.max(...inViews);
        },
        setLength: (l) => {
          range.length = l;
        },
        range,
      }}
    >
      <section {...props}>{children}</section>
    </Context.Provider>
  );
};

type ItemsProps<T extends keyof JSX.IntrinsicElements> = {
  as: T;
  children: ReactNode;
} & ComponentProps<T>;
Carousel.Items = <T extends keyof JSX.IntrinsicElements>({
  as,
  children,
  ...props
}: ItemsProps<T>) => {
  const { setLength } = useContext(Context);
  // Cannot update a component (`Unknown`) while rendering a different component (`Unknown`)
  // But useEffect dont work with useObserverState?
  setLength(Children.count(children));

  const Tag: T = as;
  // @ts-ignore
  return <Tag {...props}>{children}</Tag>;
};

type ItemProps<T extends keyof JSX.IntrinsicElements> = {
  as: T;
  children?: ReactNode;
} & ComponentProps<T>;
Carousel.Item = <T extends keyof JSX.IntrinsicElements>({
  children,
  as,
  ...props
}: ItemProps<T>) => {
  const { refs, setRefsView } = useContext(Context);
  const Tag: T = as;
  const mounted = useRef(false);
  const ref = useRef<HTMLElement>();
  const index = useRef<number>();
  useInstersectionObserver(
    ref,
    (entries) => {
      const isInView = entries[0];
      if (isInView && index.current !== undefined)
        setRefsView(index.current, isInView.isIntersecting);
    },
    {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    }
  );

  return (
    // @ts-ignore
    <Tag
      // @ts-ignore
      ref={(r: any) => {
        if (mounted.current) return;
        mounted.current = true;
        index.current = refs.length;
        refs.push(r);
        ref.current = r;
      }}
      {...props}
    >
      {children}
    </Tag>
  );
};

type ScrollInto = (
  index: number,
  options: boolean | ScrollIntoViewOptions | undefined
) => void;
type ButtonProps = {
  onClick: (
    scrollInto: ScrollInto,
    range: Range,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
} & Omit<ComponentProps<"button">, "onClick">;

Carousel.Button = ({ onClick, children, ...props }: ButtonProps) => {
  const { refs, range } = useContext(Context);

  return (
    <button
      onClick={(e) => {
        onClick(
          (number, options) => {
            refs[number].scrollIntoView(options);
          },
          range,
          e
        );
      }}
      {...props}
    >
      {children}
    </button>
  );
};

type RangeProps = {
  children: (range: Range) => ReactNode;
};
Carousel.Range = ({ children }: RangeProps) => {
  const { range } = useContext(Context);
  const min = useObserverState(range, "min");
  const max = useObserverState(range, "max");
  const length = useObserverState(range, "length");

  return <>{children({ max, min, length })}</>;
};

type ProgressionProps = {};
Carousel.Progression = ({}: ProgressionProps) => <></>;

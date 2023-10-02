"use client";

import { useInstersectionObserver } from "@/libs/hooks/useInView";
import {
  Observer,
  useObserver,
  useObserverState,
} from "@/libs/hooks/useObserver";
import {
  Children,
  ComponentProps,
  ReactNode,
  RefObject,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export const Carousel = () => <></>;

type Range = { min: number; max: number; length: number };
type Scroll = { scroll: boolean };
const Context = createContext<{
  refs: HTMLElement[];
  refsView: Map<number, boolean>;
  setRefsView: (value: number, inView: boolean) => void;
  range: Observer<Range>;
  scroll: Observer<Scroll>;
}>({
  refs: [],
  refsView: new Map(),
  setRefsView: () => {},
  range: {} as any,
  scroll: {} as any,
});

type RootProps = {} & ComponentProps<"section">;
Carousel.Root = ({ children, ...props }: RootProps) => {
  const refs = useRef<HTMLElement[]>([]);
  const refsView = useRef<Map<number, boolean>>(new Map());
  const range = useObserver<Range>({ min: 0, max: 0, length: 0 });
  const scroll = useObserver<Scroll>({ scroll: false });

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

          if (inViews.length) {
            // Math.min/max of empty array give not finite result
            range.min = Math.min(...inViews);
            range.max = Math.max(...inViews);
          }
        },
        range,
        scroll,
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
  const { range, scroll } = useContext(Context);
  const ref = useRef<HTMLElement>();
  range.length = Children.count(children);

  useEffect(() => {
    const onScroll = (_: Event) => {
      scroll.scroll = true;
    };
    const onScrollEnd = (_: Event) => {
      scroll.scroll = false;
    };

    ref.current && ref.current.addEventListener("scroll", onScroll);
    ref.current && ref.current.addEventListener("scrollend", onScrollEnd);

    return () => {
      ref.current && ref.current.removeEventListener("scroll", onScroll);
      ref.current && ref.current.removeEventListener("scrollend", onScrollEnd);
    };
  }, [ref]);

  const Tag: T = as;
  // @ts-ignore
  return (
    // @ts-ignore
    <Tag ref={ref} {...props}>
      {children}
    </Tag>
  );
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
  options?: boolean | ScrollIntoViewOptions | undefined
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
  // Usefull for re-render, but lenght is buggy, should investigate
  const min = useObserverState(range, "min");
  const max = useObserverState(range, "max");
  const length = useObserverState(range, "length");

  return <>{children(range)}</>;
};

type ScrollToProps = {
  value: number;
  options?: boolean | ScrollIntoViewOptions | undefined;
} & Omit<ComponentProps<"button">, "onClick" | "value">;
Carousel.ScrollTo = ({ children, options, value, ...props }: ScrollToProps) => (
  <Carousel.Button
    onClick={(scrollInto, { min, max, length }) =>
      scrollInto(
        value > 0
          ? Math.min(length - 1, max + value)
          : Math.max(0, min - value),
        options
      )
    }
    {...props}
  >
    {children}
  </Carousel.Button>
);

type ProgressionProps = {
  children: (progression: { sizes: number[][] } & Range) => ReactNode;
};
Carousel.Progression = ({ children }: ProgressionProps) => {
  const { scroll, range } = useContext(Context);
  const min = useObserverState(range, "min");
  const max = useObserverState(range, "max");
  const length = useObserverState(range, "length");
  const isScrolling = useObserverState(scroll, "scroll");

  const [sizes, setSizes] = useState<number[][]>([]);

  useEffect(() => {
    if (!isScrolling && max && length) {
      const size = max - min + 1;
      const result = Array.from(
        { length: Math.ceil(length / size) },
        (_, index) =>
          Array.from(
            {
              length:
                index === Math.floor(length / size) ? length % size : size,
            },
            (_, subIndex) => index * size + subIndex
          )
      );
      setSizes(result);
    }
  }, [isScrolling, min, max, length]);

  return children({ sizes, min, max, length });
};

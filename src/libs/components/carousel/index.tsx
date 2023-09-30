"use client";

import {
  ComponentProps,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

export const Carousel = () => <></>;

const Context = createContext<{
  refs: HTMLElement[];
  refsView: Map<number, boolean>;
  setRefsView: (value: number, inView: boolean) => void;
}>({
  refs: [],
  refsView: new Map(),
  setRefsView: () => {},
});

const rangeView = (views: Map<number, boolean>) => {
  const inViews = Array.from(views)
    .filter(([_, k]) => k)
    .map(([v]) => v);

  return [(Math.min(...inViews), Math.max(...inViews))];
};

type RootProps = {} & ComponentProps<"section">;
Carousel.Root = ({ children, ...props }: RootProps) => {
  const refs = useRef<HTMLElement[]>([]);
  const refsView = useRef<Map<number, boolean>>(new Map());

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

          console.log(rangeView(refsView.current));
        },
      }}
    >
      <section {...props}>{children}</section>
    </Context.Provider>
  );
};

type ContentProps<T extends keyof JSX.IntrinsicElements> = {
  as: T;
  children?: ReactNode;
} & ComponentProps<T>;

Carousel.Content = <T extends keyof JSX.IntrinsicElements>({
  children,
  as,
  ...props
}: ContentProps<T>) => {
  const { refs, setRefsView } = useContext(Context);
  const Tag: T = as;
  const ref = useRef<HTMLElement>();
  const index = useRef<number>();

  useEffect(() => {
    const callback = (entries: IntersectionObserverEntry[]) => {
      const isInView = entries[0];
      if (isInView && index.current)
        setRefsView(index.current, isInView.isIntersecting);
    };
    const observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    });

    ref.current && observer.observe(ref.current);
    return () => {
      ref.current && observer.unobserve(ref.current);
    };
  }, [ref]);
  return (
    // @ts-ignore
    <Tag
      // @ts-ignore
      ref={(r: any) => {
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
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
} & Omit<ComponentProps<"button">, "onClick">;

Carousel.Button = ({ onClick, children, ...props }: ButtonProps) => {
  const { refs } = useContext(Context);

  return (
    <button
      onClick={(e) => {
        onClick((number, options) => {
          refs[number]?.scrollIntoView(options);
        }, e);
      }}
      {...props}
    >
      {children}
    </button>
  );
};

type ProgressionProps = {};
Carousel.Progression = ({}: ProgressionProps) => <></>;

import { RefObject, useEffect, useState } from "react";

export function useInstersectionObserver(
  ref: RefObject<HTMLElement | undefined>,
  callback: (
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ) => void,
  options?: IntersectionObserverInit
) {
  useEffect(() => {
    const observer = new IntersectionObserver(callback, options);
    ref.current && observer.observe(ref.current);
    return () => {
      ref.current && observer.unobserve(ref.current);
    };
  }, [ref]);
}

export function useInView(
  ref: RefObject<HTMLElement>,
  options: IntersectionObserverInit = {
    root: null,
    rootMargin: "0px",
    threshold: 1.0,
  }
) {
  const [state, setState] = useState(false);
  useInstersectionObserver(
    ref,
    (entries) => {
      if (entries[0]) setState(entries[0].isIntersecting);
    },
    options
  );
  return state;
}

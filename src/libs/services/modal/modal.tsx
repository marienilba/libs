"use client";

import { useNextState } from "@/libs/hooks/next-state";
import {
  ComponentProps,
  JSX,
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { create } from "zustand";

type Store = {
  components: Map<
    string,
    [(props: any) => JSX.Element, Record<PropertyKey, any>]
  >;
  open: (
    element: (props: any) => JSX.Element,
    props: Record<PropertyKey, any>,
    id: string
  ) => void;
  close: (id: string) => void;
};

const useStore = create<Store>((set, get) => ({
  components: new Map(),
  open: (element, props, id) => {
    const cmpts = get().components;
    cmpts.set(id, [element, props]);
    return set({ components: new Map(cmpts) });
  },
  close: (id) => {
    const cmpts = get().components;
    cmpts.delete(id);
    return set({ components: new Map(cmpts) });
  },
}));

export const Modals = () => {
  const components = useStore((state) => state.components);

  const isClient = useNextState("CLIENT");
  if (!isClient) return <div></div>;

  return (
    <>
      {createPortal(
        <>
          {Array.from(components).map(([id, [component, props]]) =>
            createElement(component, { key: id, ...props })
          )}
        </>,
        document.body
      )}
    </>
  );
};

Modals.Overlay = ({ className }: { className: string }) => (
  <div
    style={{
      position: "fixed",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
    }}
    className={`peer-open/dialog:visible invisible ${className}`}
  ></div>
);

Modals.Close = ({
  children,
  ...props
}: Omit<ComponentProps<"button">, "form" | "value">) => {
  const id = useContext(Context);
  return (
    <button {...props} form={`modal:${id}`} value="cancel">
      {children}
    </button>
  );
};

export const useModal = () => {
  const add = useStore((store) => store.open);

  const open = function <TComponent extends Wrapped<any>>(
    component: TComponent,
    props: TComponent extends Wrapped<infer P> ? P : never
  ) {
    add(component, props, component.id);
  };

  const closeAll = () => {};

  return { open, closeAll };
};

const Context = createContext<string>("");

type Wrapped<P = {}> = ((props: P) => JSX.Element) & {
  __branded: true;
  id: string;
};
export function wrap<TComponent extends (props: any) => JSX.Element>(
  component: TComponent
): Wrapped<Parameters<TComponent>[number]> {
  const id = Math.random().toString();
  const element = (props: Parameters<TComponent>[number]) => {
    const ref = useRef<HTMLDialogElement>(null);
    const close = useStore((store) => store.close);

    useEffect(() => {
      if (ref.current) ref.current.showModal();
    }, [ref]);

    return (
      <dialog
        ref={ref}
        onClose={() => close(id)}
        style={{
          backgroundColor: "transparent",
          zIndex: 9999,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        <form id={`modal:${id}`} method="dialog"></form>
        <Context.Provider value={id}>{component(props)}</Context.Provider>
      </dialog>
    );
  };

  element.id = id;

  // @ts-ignore
  return element;
}

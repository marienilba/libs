"use client";

import {
  ComponentProps,
  ReactNode,
  createContext,
  useContext,
  useMemo,
} from "react";
import { DropSchema } from "./accept";

export const DropZone = () => <></>;

const Context = createContext<{
  setFiles?: (files: File[]) => void;
}>({ setFiles: (files) => {} });

type RootProps<T extends DropSchema> = {
  accept?: T;
  value?: File[];
  onChange?: (files: File[]) => void;
  children: (
    files: T extends DropSchema<infer TType>
      ? DropFile<TType>[]
      : DropFile<string>[]
  ) => ReactNode;
};

DropZone.Root = <T extends DropSchema>({
  children,
  value,
  onChange,
}: RootProps<T>) => {
  return (
    <Context.Provider value={{ setFiles: onChange }}>
      {children(value ?? ([] as any))}
    </Context.Provider>
  );
};

DropZone.Area = ({
  children,
  className,
  style,
  ...props
}: Omit<ComponentProps<"input">, "type" | "onChange">) => {
  const { setFiles } = useContext(Context);
  return (
    <div
      onDragOver={dataAttr}
      onDragLeave={dataAttr}
      className={className}
      style={{ ...style, position: "relative" }}
      onChange={dataAttr}
    >
      <input
        multiple
        onChange={(e) =>
          e.target instanceof HTMLInputElement &&
          e.target.files &&
          setFiles &&
          setFiles(Array.from(e.target.files))
        }
        data-dragged={String(false)}
        style={{
          opacity: 0,
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        type="file"
        {...props}
      />
      {children}
    </div>
  );
};

type DropFile<T extends string = string> = File & { type: T };

const dataAttr = (
  e: React.DragEvent<HTMLDivElement> | React.FormEvent<HTMLDivElement>
) =>
  e.target instanceof HTMLDivElement
    ? e.target.setAttribute("data-dragged", String(e.type === "dragover"))
    : e.currentTarget instanceof HTMLDivElement &&
      e.currentTarget.setAttribute(
        "data-dragged",
        String(e.type === "dragover")
      );

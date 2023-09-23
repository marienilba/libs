"use client";

import { ComponentProps, ReactNode, createContext, useContext } from "react";
import { DropArraySchema, DropSchema } from "./accept";

export const DropZone = () => <></>;

const Context = createContext<{
  setFiles?: (files: File[]) => void;
}>({ setFiles: (files) => {} });

const ContextAccept = createContext<DropSchema | undefined>(undefined);

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
  accept,
}: RootProps<T>) => {
  return (
    <Context.Provider value={{ setFiles: onChange }}>
      <ContextAccept.Provider value={accept}>
        {children(value ?? ([] as any))}
      </ContextAccept.Provider>
    </Context.Provider>
  );
};

DropZone.Area = ({
  children,
  className,
  style,
  multiple,
  onChange,
  ...props
}: Omit<ComponentProps<"input">, "type">) => {
  const { setFiles } = useContext(Context);
  const accept = useContext(ContextAccept);
  return (
    <div
      onDragOver={dataAttr}
      onDragLeave={dataAttr}
      className={className}
      style={{ ...style, position: "relative" }}
      onChange={dataAttr}
    >
      <input
        onChange={(e) => {
          onChange && onChange(e);
          e.target instanceof HTMLInputElement &&
            e.target.files &&
            setFiles &&
            (accept
              ? accept.parse(Array.from(e.target.files)) &&
                setFiles(Array.from(e.target.files))
              : setFiles(Array.from(e.target.files)));
        }}
        data-dragged={String(false)}
        style={{
          opacity: 0,
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        type="file"
        multiple={Boolean(accept instanceof DropArraySchema || multiple)}
        {...props}
      />
      {children}
    </div>
  );
};

type DropFile<T extends string> = File & { type: T };

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

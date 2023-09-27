"use client";

import { SyncOrAsync } from "@/libs/types";
import React, {
  ComponentProps,
  ReactNode,
  createContext,
  useContext,
  useRef,
  useState,
} from "react";

export const SelectList = () => <></>;

type Context<T extends unknown[] = unknown[]> = {
  inputValues: T;
  setInputValues: (values: T) => void;
  outputValues: T;
  setOutputValues: (values: T) => void;
  inputRef: React.RefObject<HTMLSelectElement> | null;
  outputRef: React.RefObject<HTMLSelectElement> | null;
  onValuesChange?: (values: [T, T]) => void;
};

const Context = createContext<Context>({
  inputValues: [],
  setInputValues: (values) => {},
  outputValues: [],
  setOutputValues: (values) => {},
  inputRef: null,
  outputRef: null,
  onValuesChange: (values) => {},
});

const useTypedContext = <T,>() => {
  return useContext(Context) as T;
};

type RootProps<TValues extends [unknown[], unknown[]]> = {
  children: ReactNode;
  values: TValues;
  onValuesChange?: (values: [TValues, TValues]) => void;
} & Omit<ComponentProps<"section">, "children" | "values">;

SelectList.Root = function <TValues extends [unknown[], unknown[]]>({
  children,
  values,
  onValuesChange,
  ...props
}: RootProps<TValues>) {
  const [inputValues, setInputValues] = useState<unknown[]>(values[0]);
  const [outputValues, setOutputValues] = useState<unknown[]>(values[1]);
  const inputRef = useRef<HTMLSelectElement>(null);
  const outputRef = useRef<HTMLSelectElement>(null);

  return (
    <section {...props}>
      <Context.Provider
        value={{
          inputValues,
          setInputValues,
          outputValues,
          setOutputValues,
          inputRef,
          outputRef,
        }}
      >
        {children}
      </Context.Provider>
    </section>
  );
};

type InputProps<T extends any[]> = {
  children: (value: T[number]) => ReactNode;
} & Omit<ComponentProps<"select">, "multiple" | "children">;

SelectList.Input = function <TValue extends any[]>({
  children,
  ...props
}: InputProps<TValue>) {
  const { inputValues, inputRef } = useContext(Context);
  return (
    <select ref={inputRef} multiple {...props}>
      {inputValues.map(children)}
    </select>
  );
};

type OutputProps<T extends any[]> = InputProps<T>;

SelectList.Output = function <TValue extends any[]>({
  children,
  ...props
}: OutputProps<TValue>) {
  const { outputValues, outputRef } = useContext(Context);

  return (
    <select ref={outputRef} multiple {...props}>
      {outputValues.map(children)}
    </select>
  );
};

type ButtonProps<TValues extends unknown[]> = {
  onClick: (values: {
    input: TValues;
    output: TValues;
    inputSelected: HTMLOptionElement[];
    outputSelect: HTMLOptionElement[];
  }) => SyncOrAsync<{
    input: TValues;
    output: TValues;
  }>;
} & Omit<ComponentProps<"button">, "onClick">;

SelectList.Button = function <TValues extends unknown[]>({
  children,
  onClick,
  ...props
}: ButtonProps<TValues>) {
  const {
    inputValues,
    outputRef,
    setInputValues,
    setOutputValues,
    inputRef,
    outputValues,
    onValuesChange,
  } = useTypedContext<Context<TValues>>();
  return (
    <button
      onClick={async () => {
        if (!inputRef || !inputRef.current || !outputRef || !outputRef.current)
          return;

        const newValues = await onClick({
          input: inputValues,
          inputSelected: Array.from(inputRef.current.selectedOptions),
          output: outputValues,
          outputSelect: Array.from(outputRef.current.selectedOptions),
        });

        setInputValues(newValues.input);
        setOutputValues(newValues.output);

        if (
          !(
            deepEquals(inputValues, newValues.input) &&
            deepEquals(outputValues, newValues.output)
          )
        )
          onValuesChange && onValuesChange([newValues.input, newValues.output]);
      }}
      {...props}
    >
      {children}
    </button>
  );
};

const deepEquals = (arr1: unknown[], arr2: unknown[]) =>
  JSON.stringify(arr1) === JSON.stringify(arr2);

type Optionrops = ComponentProps<"option">;

SelectList.Option = function ({ children, ...props }: Optionrops) {
  return <option {...props}>{children}</option>;
};

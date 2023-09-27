"use client";

import { usePrevious } from "@/libs/hooks/usePrevious";
import { Apart } from "@/libs/types";
import React, {
  CSSProperties,
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { ComponentProps, ReactNode } from "react";

export const Steps = () => <></>;

const ContextShare = createContext<{
  start: (
    | React.ReactPortal
    | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
  )[];
  end: (
    | React.ReactPortal
    | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
  )[];
}>({
  start: [],
  end: [],
});

const ContextStep = createContext<{
  step: number;
  setStep: (value: number | ((prev: number) => number)) => void;
  length: number;
}>({
  step: 1,
  setStep: () => {},
  length: 1,
});

type RootProps = {
  value?: number;
  onChange?: (value: number) => void;
  children: ReactNode;
};

Steps.Root = ({ children, value = 1, onChange }: RootProps) => {
  const shares = useMemo(
    () =>
      (
        React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === Steps.Share) {
            return child;
          }
        }) ?? []
      )?.filter(Boolean),
    [children]
  );
  const start = useMemo(
    () => shares.filter((child) => (child.props as ShareProps<"div">).start),
    [shares]
  );
  const end = useMemo(
    () => shares.filter((child) => (child.props as ShareProps<"div">).end),
    [shares]
  );

  const steps = useMemo(
    () =>
      (
        React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === Steps.Step) {
            return child;
          }
        }) ?? []
      )?.filter(Boolean),
    [children]
  );

  const [currentStep, setCurrentStep] = useState<number>(value);
  const previous = usePrevious(currentStep);
  if (onChange && currentStep !== previous) onChange(currentStep);

  return (
    <ContextShare.Provider value={{ start, end }}>
      <ContextStep.Provider
        value={{
          step: currentStep,
          setStep: setCurrentStep,
          length: steps.length,
        }}
      >
        {steps}
      </ContextStep.Provider>
    </ContextShare.Provider>
  );
};

type StepProps = {
  value: number;
  children: ReactNode;
  share?: boolean;
} & Omit<ComponentProps<"div">, "value" | "children">;
Steps.Step = ({
  children,
  value,
  share = true,
  style,
  ...props
}: StepProps) => {
  const { start, end } = useContext(ContextShare);
  const { step } = useContext(ContextStep);

  const hidden: CSSProperties = step === value ? {} : { display: "none" };
  return (
    <div
      data-current={step === value}
      style={{ ...style, ...hidden }}
      {...props}
    >
      {share ? start : <></>}
      {children}
      {share ? end : <></>}
    </div>
  );
};

type ButtonProps = {
  onClick: (
    setValue: (set: ((value: number) => number) | number) => void,
    length: number
  ) => void;
} & Omit<ComponentProps<"button">, "onClick">;
Steps.Button = ({ children, onClick, ...props }: ButtonProps) => {
  const { setStep, length, step } = useContext(ContextStep);
  return (
    <button
      data-has-prev={step === 1}
      data-has-next={step === length}
      data-step={step}
      onClick={() => onClick(setStep, length)}
      {...props}
    >
      {children}
    </button>
  );
};

type As<T> = T extends keyof JSX.IntrinsicElements
  ? Omit<ComponentProps<T>, "children">
  : {};

type ShareProps<T extends keyof JSX.IntrinsicElements> = {
  children: ReactNode;
  as?: T;
} & Apart<{ start: true }, { end: true }> &
  As<T>;

Steps.Share = <T extends keyof JSX.IntrinsicElements>({
  children,
  start,
  end,
  as,
  ...props
}: ShareProps<T>) => {
  if (as) return React.createElement(as, { ...props, children } as any);
  else return <>{children}</>;
};

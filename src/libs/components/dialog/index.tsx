import React, { ComponentProps } from "react";

const DIALOG_ZINDEX = 99;

export const Dialog = () => <></>;

let DialogId = 0;
const getId = () => DialogId;
const genId = () => DialogId++;

Dialog.Root = ({ children, ...props }: ComponentProps<"dialog">) => {
  const overlay = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === Dialog.Overlay)
      return child;
  });

  genId();

  return (
    <div>
      <dialog
        {...props}
        style={{
          zIndex: DIALOG_ZINDEX,
          top: "50%",
          transform: "translateY(-50%)",
        }}
        className="peer/dialog"
      >
        <form id={`dialog:${getId()}`} method="dialog"></form>
        {children}
      </dialog>
      {overlay}
    </div>
  );
};

Dialog.Close = ({
  children,
  ...props
}: Omit<ComponentProps<"button">, "form" | "value">) => (
  <button {...props} form={`dialog:${getId()}`} value="cancel">
    {children}
  </button>
);

Dialog.Overlay = ({ className }: { className: string }) => (
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

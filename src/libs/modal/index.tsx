import React, { ComponentProps } from "react";

const MODAL_ZINDEX = 99;

export const Modal = () => <></>;

let modalId = 0;
const getId = () => modalId;
const genId = () => modalId++;

Modal.Root = ({ children, ...props }: ComponentProps<"dialog">) => {
  const overlay = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === Modal.Overlay)
      return child;
  });

  genId();

  return (
    <div>
      <dialog
        {...props}
        style={{
          zIndex: MODAL_ZINDEX,
          top: "50%",
          transform: "translateY(-50%)",
        }}
        className="peer/dialog"
      >
        <form id={`modal:${getId()}`} method="dialog"></form>
        {children}
      </dialog>
      {overlay}
    </div>
  );
};

Modal.Close = ({
  children,
  ...props
}: Omit<ComponentProps<"button">, "form" | "value">) => (
  <button {...props} form={`modal:${getId()}`} value="cancel">
    {children}
  </button>
);

Modal.Overlay = ({ className }: { className: string }) => (
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

"use client";

import { ComponentProps, useRef } from "react";

export const Box = ({ children, ...props }: ComponentProps<"div">) => {
  const ref = useRef<HTMLDivElement>(null);
  const handler = (
    mouseDownEvent: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => {
    // const startPosition = { x: mouseDownEvent.pageX, y: mouseDownEvent.pageY };

    function onMouseMove(mouseMoveEvent: MouseEvent) {
      console.log(mouseDownEvent);
      //   setSize((currentSize) => ({
      //     x: startSize.x - startPosition.x + mouseMoveEvent.pageX,
      //     y: startSize.y - startPosition.y + mouseMoveEvent.pageY,
      //   }));
    }
    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp, { once: true });
  };

  return (
    <div {...props} style={{ position: "relative" }}>
      {children}
      <span
        onMouseDown={handler}
        className="absolute z-10 top-0 right-0 h-full w-1 cursor-ew-resize"
      />
      <span className="absolute z-10 top-0 left-0 h-full w-1 cursor-ew-resize" />
      <span className="absolute z-10 bottom-0 right-0 w-full h-1 cursor-ns-resize" />
      <span className="absolute z-10 top-0 right-0 w-full h-1 cursor-ns-resize" />
    </div>
  );
};

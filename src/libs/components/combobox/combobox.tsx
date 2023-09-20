import { ComponentProps } from "react";

const Combobox = () => <></>;

let comboId = 0;
const getId = () => comboId;
const genId = () => comboId++;

Combobox.List = ({
  children,
  ...props
}: Omit<ComponentProps<"input">, "list">) => {
  genId();
  return (
    <>
      <input list={`combobox:${getId()}`} {...props} />
      <datalist id={`combobox:${getId()}`}>{children}</datalist>
    </>
  );
};

Combobox.Item = (props: Omit<ComponentProps<"option">, "children">) => (
  <option {...props}></option>
);

export const { Item, List } = Combobox;

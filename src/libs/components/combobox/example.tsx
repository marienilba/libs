import { Combobox } from "@/libs/components/combobox";

export default function Home() {
  return (
    <>
      <Combobox.List>
        <Combobox.Item value="Chrome" />
        <Combobox.Item value="Firefox" />
        <Combobox.Item value="Opera" />
        <Combobox.Item value="Safari" />
        <Combobox.Item value="Microsoft Edge" />
      </Combobox.List>

      <Combobox.List type="time">
        <Combobox.Item value="12:00" />
        <Combobox.Item value="13:00" />
        <Combobox.Item value="14:00" />
      </Combobox.List>

      <Combobox.List type="range" min="0" max="100">
        <Combobox.Item value="0" />
        <Combobox.Item value="10" />
        <Combobox.Item value="20" />
        <Combobox.Item value="30" />
      </Combobox.List>

      <Combobox.List type="color">
        <Combobox.Item value="#800000" />
        <Combobox.Item value="#8B0000" />
        <Combobox.Item value="#A52A2A" />
        <Combobox.Item value="#DC143C" />
      </Combobox.List>
    </>
  );
}

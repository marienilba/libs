"use client";

import { SelectList } from "@/libs/components/select-list";
import { useState } from "react";

export default function Home() {
  const [initialValues, _] = useState<{ value: number; label: string }[]>(
    Array(10)
      .fill(0)
      .map((_, i) => ({ value: i, label: i.toString() }))
  );
  return (
    <main className="bg-slate-950 p-4 min-h-screen">
      <SelectList.Root values={[initialValues, []]} className="flex gap-2">
        <SelectList.Input<
          typeof initialValues
        > className="w-20 h-48 border border-blue-900 bg-slate-950 text-white appearance-none [-webkit-appearance:none] [-moz-appearance:none]">
          {({ value, label }) => (
            <SelectList.Option
              className="bg-slate-700 px-2 text-white appearance-none [-webkit-appearance:none] [-moz-appearance:none]"
              key={value}
              value={value}
            >
              {label}
            </SelectList.Option>
          )}
        </SelectList.Input>
        <div className="flex flex-col gap-2 justify-center items-center">
          <SelectList.Button<typeof initialValues>
            onClick={({ input, output, inputSelected }) => ({
              input: input.filter(
                (option) =>
                  !inputSelected
                    .map((o) => o.value)
                    .includes(option.value.toString())
              ),
              output: output.concat(
                inputSelected.map((o) => ({
                  value: Number(o.value),
                  label: o.label,
                }))
              ),
            })}
            className="text-white border border-dashed border-blue-900 w-10 h-10 hover:bg-slate-900 cursor-pointer"
          >
            {">"}
          </SelectList.Button>
          <SelectList.Button<typeof initialValues>
            onClick={({ input, output }) => ({
              input: [],
              output: output.concat(input),
            })}
            className="text-white border border-dashed border-blue-900 w-10 h-10 hover:bg-slate-900 cursor-pointer"
          >
            {">>"}
          </SelectList.Button>
          <SelectList.Button<typeof initialValues>
            onClick={({ input, output, outputSelect }) => ({
              input: input.concat(
                outputSelect.map((o) => ({
                  value: Number(o.value),
                  label: o.label,
                }))
              ),
              output: output.filter(
                (option) =>
                  !outputSelect
                    .map((o) => o.value)
                    .includes(option.value.toString())
              ),
            })}
            className="text-white border border-dashed border-blue-900 w-10 h-10 hover:bg-slate-900 cursor-pointer"
          >
            {"<"}
          </SelectList.Button>
          <SelectList.Button<typeof initialValues>
            onClick={({ input, output }) => ({
              input: input.concat(output),
              output: [],
            })}
            className="text-white border border-dashed border-blue-900 w-10 h-10 hover:bg-slate-900 cursor-pointer"
          >
            {"<<"}
          </SelectList.Button>
        </div>
        <SelectList.Output<
          typeof initialValues
        > className="w-20 h-48 border border-blue-900 bg-slate-950 text-white appearance-none [-webkit-appearance:none] [-moz-appearance:none]">
          {({ value, label }) => (
            <SelectList.Option
              className="bg-slate-700 px-2 text-white appearance-none [-webkit-appearance:none] [-moz-appearance:none]"
              key={value}
              value={value}
            >
              {label}
            </SelectList.Option>
          )}
        </SelectList.Output>
      </SelectList.Root>
    </main>
  );
}

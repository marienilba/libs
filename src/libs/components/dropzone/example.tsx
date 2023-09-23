"use client";

import { d } from "@/libs/components/dropzone/accept";
import { DropZone } from "@/libs/components/dropzone/dropzone";
import { useState } from "react";

const schema = d.array(d.file().types(["application/pdf"])).min(2);

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <main className="bg-slate-950 p-4 min-h-screen text-white">
      <DropZone.Root value={files} onChange={setFiles} accept={schema}>
        {(files) => (
          <>
            {files.map((file, index) => (
              <p key={index}>{file.name}</p>
            ))}
            <DropZone.Area className="border border-dashed border-blue-950 rounded w-60 h-20 data-[dragged=true]:bg-slate-800"></DropZone.Area>
          </>
        )}
      </DropZone.Root>
    </main>
  );
}

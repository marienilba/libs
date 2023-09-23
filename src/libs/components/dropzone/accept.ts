export class DropSchema<TType extends AcceptValue = AcceptValue> {
  private _type?: TType;
  constructor() {}

  // Overwritted by other schema
  parse(file: File | File[]): File | File[] {
    return file;
  }
}

export class DropError {
  public code: string | null = null;
  public message: string;
  constructor(message: string, code: string | null = null) {
    this.code = code;
    this.message = message;
  }
}

export class DropArraySchema<
  TType extends AcceptValue = AcceptValue
> extends DropSchema<TType> {
  protected _max?: number;
  protected _min?: number;
  protected _file: DropFileSchema;
  constructor(file: DropFileSchema) {
    super();
    this._file = file;
  }

  max<T extends number>(value: T) {
    this._max = value;
    return this;
  }

  min<T extends number>(value: T) {
    this._min = value;
    return this;
  }

  parse(files: File[]) {
    if (this._max && files.length > this._max) throw new DropError("");
    if (this._min && files.length < this._min) throw new DropError("");
    files.every((file) => this._file.parse(file));

    return files;
  }
}

export class DropFileSchema<
  TType extends AcceptValue = AcceptValue
> extends DropSchema<TType> {
  protected _types?: TType[];
  protected _max?: number;
  protected _min?: number;

  constructor() {
    super();
  }

  any(): DropFileSchema<any> {
    return this;
  }

  types<T extends AcceptValue[]>(value: T): DropFileSchema<T[number]> {
    // @ts-ignore
    this._types = value;
    return this;
  }

  max<T extends number>(value: T) {
    this._max = value;
    return this;
  }

  min<T extends number>(value: T) {
    this._min = value;
    return this;
  }

  parse(file: File) {
    // @ts-ignore
    if (this._types && !this._types.includes(file.type))
      throw new DropError("");
    if (this._max && this._max < file.size) throw new DropError("");
    if (this._min && this._min > file.size) throw new DropError("");

    return file;
  }
}

export const d = {
  file() {
    return new DropFileSchema();
  },

  array<T extends DropFileSchema>(file: T) {
    return new DropArraySchema<
      T extends DropFileSchema<infer TType> ? TType : any
    >(file);
  },
} as const;

const acceptValues = [
  "image/*",
  "image/jpeg",
  "image/png",
  "audio/*",
  "audio/mpeg",
  "audio/wav",
  "video/*",
  "video/mp4",
  "video/webm",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/zip",
  "application/x-gzip",
  ".csv",
  ".json",
  ".xml",
] as const;

export type AcceptValue = (typeof acceptValues)[number];

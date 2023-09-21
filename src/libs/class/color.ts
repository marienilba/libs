type Hexadecimal =
  | "a"
  | "A"
  | "b"
  | "B"
  | "c"
  | "C"
  | "d"
  | "D"
  | "e"
  | "E"
  | "f"
  | "F"
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9;

type HexaLiteral = `#${number | string}${number | string}${number | string}${
  | number
  | string}${number | string}${number | string}`;
type IsHexa<T extends string> =
  T extends `#${infer A}${infer B}${infer C}${infer D}${infer E}${infer F}`
    ? A extends Hexadecimal
      ? B extends Hexadecimal
        ? C extends Hexadecimal
          ? D extends Hexadecimal
            ? E extends Hexadecimal
              ? F extends Hexadecimal
                ? T & string
                : never
              : never
            : never
          : never
        : never
      : never
    : never;

type RBGLiteral = `rgb(${number},${number},${number})`;
type IsRGB<T extends string> = T extends RBGLiteral ? T : never;

type AlphaNumber<T extends string> = T extends `0.${number}` ? T : never;
type RBGaLiteral = `rgba(${number},${number},${number},${
  | `0.${number}`
  | "0"
  | "1"})`;
type IsRGBa<T extends string> = T extends RBGaLiteral ? T : never;

type CMYKLiteral = `cmyk(${number}%,${number}%,${number}%,${number}%)`;
type IsCMYK<T extends string> = T extends CMYKLiteral ? T : never;

type HSVLiteral = `hsv(${number}°,${number}%,${number}%)`;
type IsHSV<T extends string> = T extends HSVLiteral ? T : never;

type HSLLiteral = `hsl(${number}°,${number}%,${number}%)`;
type IsHSL<T extends string> = T extends HSLLiteral ? T : never;

type Get<T extends string> = T extends `#${string}`
  ? Hex
  : T extends `${infer A}(${string})`
  ? A extends `rgb`
    ? RGB
    : A extends `rgba`
    ? RGBa
    : A extends `cmyk`
    ? CMYK
    : A extends `hsl`
    ? HSL
    : A extends `hsv`
    ? HSV
    : never
  : never;

class Color {
  constructor(
    color:
      | RBGLiteral
      | RBGaLiteral
      | CMYKLiteral
      | HSVLiteral
      | HSLLiteral
      | HexaLiteral
  ) {}

  to<
    TClass extends
      | typeof Hex
      | typeof RGB
      | typeof RGBa
      | typeof CMYK
      | typeof HSV
      | typeof HSL
  >(to: TClass): InstanceType<TClass> {
    return 0 as any;
  }
}

class Hex extends Color {
  constructor(color: HexaLiteral) {
    super(color);
  }
}

class RGB extends Color {
  constructor(color: RBGLiteral) {
    super(color);
  }
}

class RGBa extends Color {
  constructor(color: RBGaLiteral) {
    super(color);
  }
}

class CMYK extends Color {
  constructor(color: CMYKLiteral) {
    super(color);
  }
}

class HSV extends Color {
  constructor(color: HSVLiteral) {
    super(color);
  }
}

class HSL extends Color {
  constructor(color: HSLLiteral) {
    super(color);
  }
}

const color = new Color("#ffffff").to(HSL);

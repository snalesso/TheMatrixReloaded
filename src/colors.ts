export abstract class Color {

    public abstract toHexString(showSharp: boolean): string;
}

export class Color_RGB extends Color {

    constructor(
        public readonly R: number,
        public readonly G: number,
        public readonly B: number) {
        super();
    }

    public toHexString(showSharp: boolean = true): string {
        return `${showSharp ? '#' : ''}${numberToHex(this.R)}${numberToHex(this.G)}${numberToHex(this.B)}`;
    }

    // public toArgb(a: number): Color_ARGB { return new Color_ARGB(a, this.R, this.G, this.B); }
};

export class Color_RGBA extends Color_RGB {
    constructor(
        R: number,
        G: number,
        B: number,
        public readonly A: number) {
        super(R, G, B);
    }

    public toHexString(showSharp: boolean = true): string {
        return super.toHexString(showSharp) + numberToHex(this.A);
    }

    // public toRgb(): Color_RGB { return new Color_RGB(this.R, this.G, this.B); }
}

export class ColorString {

    private constructor() { }

    public static parseRgb(hex: string): Color_RGB | null {
        // TODO: all 1 or 2
        const rgbValues = /^#?([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})$/i.exec(hex);
        return (!rgbValues)
            ? null
            : new Color_RGB(parseInt(rgbValues[1], 16), parseInt(rgbValues[2], 16), parseInt(rgbValues[3], 16));
    }

    public static parseRgba(hex: string): Color_RGBA | null {
        // TODO: all 1 or 2
        const rgbValues = /^#?([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})$/i.exec(hex);
        return (!rgbValues)
            ? null
            : new Color_RGBA(parseInt(rgbValues[1], 16), parseInt(rgbValues[2], 16), parseInt(rgbValues[3], 16), parseInt(rgbValues[4], 16));
    }

    public static parse(hex: string): Color_RGB | Color_RGBA | null {
        if (!hex)
            return null;

        if (hex.startsWith('#'))
            hex = hex.substr(1);

        switch (hex.length) {
            case 3:
            case 6:
                return this.parseRgb(hex);

            case 4:
            case 8:
                return this.parseRgba(hex);

            default:
                throw new Error("hex color format not recognized");
        }
    }
}

export class Colors_RGB {

    private constructor() { }

    public static readonly black: Color_RGB = new Color_RGB(0, 0, 0);
    public static readonly white: Color_RGB = new Color_RGB(255, 255, 255);
    public static readonly red: Color_RGB = new Color_RGB(255, 0, 0);
    public static readonly theMatrixGreen: Color_RGB = new Color_RGB(52, 253, 125);
}

export class Colors_RGBA {

    private constructor() { }

    public static readonly black: Color_RGBA = new Color_RGBA(0, 0, 0, 255);
    public static readonly white: Color_RGBA = new Color_RGBA(255, 255, 255, 255);
    public static readonly red: Color_RGBA = new Color_RGBA(255, 0, 0, 255);
    public static readonly theMatrixGreen: Color_RGBA = new Color_RGBA(52, 253, 125, 255);
}
// TODO: colors hex from props

// function hexToArgb(hex: string): Color_ARGB | null {
//   const rgbValues = /^#?([a-f\d]{2})?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

//   if (!rgbValues)
//     return null;

//   let hasAlpha = rgbValues.length === 3;
//   let i = 1;

//   return new Color_ARGB(
//     hasAlpha ? parseInt(rgbValues[i++], 16) : 255,
//     parseInt(rgbValues[i++], 16),
//     parseInt(rgbValues[i++], 16),
//     parseInt(rgbValues[i], 16));
// }

export function numberToHex(value: number) {
    const hex = value.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

export function rgbaToHex(r: number, g: number, b: number, a: number): string {
    return `#${a ? numberToHex(a) : ""}${numberToHex(r)}${numberToHex(g)}${numberToHex(b)}`;
}

export function rgbToHex(r: number, g: number, b: number): string {
    return `#${numberToHex(r)}${numberToHex(g)}${numberToHex(b)}`;
}

// function colorToHex(color: Color_RGB, printAlpha: boolean = false): string {
//   return `#${printAlpha ? numberToHex(color.A) : ""}${numberToHex(color.R)}${numberToHex(color.G)}${numberToHex(color.B)}`;
// }
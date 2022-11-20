interface IColor {
    toHexString(showSharp: boolean): string;
}

class Color_RGB implements IColor {
    public static readonly ExtendedFormat = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    public static readonly CompressedFormat = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

    constructor(
        public readonly R: number,
        public readonly G: number,
        public readonly B: number) {
    }

    public toHexString(showSharp: boolean): string {
        return `${showSharp ? '#' : ''}${numberToHex(this.R)}${numberToHex(this.G)}${numberToHex(this.B)}`;
    }


    public static isValidString(hex: string): boolean {
        return this.ExtendedFormat.test(hex) || this.CompressedFormat.test(hex);
    }

    public static parse(hex: string): Color_RGB | never {
        if (hex == null)
            throw new Error('Color code not defined.');

        const colorValues = this.ExtendedFormat.exec(hex) ?? this.CompressedFormat.exec(hex);
        if (colorValues == null)
            throw new Error('"' + hex + '" is not a valid RGBA code.');

        const r = colorValues[1];
        const g = colorValues[2];
        const b = colorValues[3];
        return new Color_RGB(
            parseInt(r.padEnd(2, r), 16),
            parseInt(g.padEnd(2, g), 16),
            parseInt(b.padEnd(2, b), 16));
    }
}

class Color_RGBA extends Color_RGB implements IColor {
    public static readonly ExtendedFormat = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    public static readonly CompressedFormat = /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])$/i;

    constructor(
        R: number,
        G: number,
        B: number,
        public readonly A: number) {
        super(R, G, B);
    }

    public override toHexString(showSharp: boolean): string {
        return super.toHexString(showSharp) + numberToHex(this.A);
    }

    public static isValidString(hex: string): boolean {
        return this.ExtendedFormat.test(hex) || this.CompressedFormat.test(hex);
    }

    public static parse(hex: string): Color_RGBA | never {
        if (hex == null)
            throw new Error('Color code not defined.');

        const colorValues = this.ExtendedFormat.exec(hex) ?? this.CompressedFormat.exec(hex);
        if (colorValues == null)
            throw new Error('"' + hex + '" is not a valid RGBA code.');

        const r = colorValues[1];
        const g = colorValues[2];
        const b = colorValues[3];
        const a = colorValues[4];
        return new Color_RGBA(
            parseInt(r.padEnd(2, r), 16),
            parseInt(g.padEnd(2, g), 16),
            parseInt(b.padEnd(2, b), 16),
            parseInt(a.padEnd(2, a), 16));
    }
}

function parseHexColorString(hex: string): Color_RGB | Color_RGBA {
    if (hex == null)
        throw new Error('Cannot parse color string: no color string provided.');

    if (hex.length <= 0)
        throw new Error('Empty string is not a valid color string.');

    if (hex.startsWith('#'))
        hex = hex.substr(1);

    switch (hex.length) {
        case 3:
        case 6:
            return Color_RGB.parse(hex);

        case 4:
        case 8:
            return Color_RGBA.parse(hex);

        default:
            throw new Error("Hex color string format not recognized.");
    }
}

abstract class Colors {

    public static readonly RGB = class {
        public static readonly black: Color_RGB = new Color_RGB(0, 0, 0);
        public static readonly white: Color_RGB = new Color_RGB(255, 255, 255);
        public static readonly red: Color_RGB = new Color_RGB(255, 0, 0);
        public static readonly theMatrixGreen: Color_RGB = new Color_RGB(52, 253, 125);
    }

    public static readonly RGBA = class {
        public static readonly black: Color_RGBA = new Color_RGBA(0, 0, 0, 255);
        public static readonly white: Color_RGBA = new Color_RGBA(255, 255, 255, 255);
        public static readonly red: Color_RGBA = new Color_RGBA(255, 0, 0, 255);
        public static readonly theMatrixGreen: Color_RGBA = new Color_RGBA(52, 253, 125, 255);
    }
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

function numberToHex(value: number) {
    const hex = value.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbaToHex(r: number, g: number, b: number, a: number): string {
    return `#${a ? numberToHex(a) : ""}${numberToHex(r)}${numberToHex(g)}${numberToHex(b)}`;
}

function rgbToHex(r: number, g: number, b: number): string {
    return `#${numberToHex(r)}${numberToHex(g)}${numberToHex(b)}`;
}

// function colorToHex(color: Color_RGB, printAlpha: boolean = false): string {
//   return `#${printAlpha ? numberToHex(color.A) : ""}${numberToHex(color.R)}${numberToHex(color.G)}${numberToHex(color.B)}`;
// }

function rgbToRgba(rgbColor: Color_RGB, alpha: number = 255): Color_RGBA {
    return new Color_RGBA(rgbColor.R, rgbColor.G, rgbColor.B, alpha);
}
function rgbaToRgb(rgbaColor: Color_RGBA): Color_RGB {
    return new Color_RGB(rgbaColor.R, rgbaColor.G, rgbaColor.B);
}
///<reference path="./core.ts" />
///<reference path="./colors.ts" />
// import { Color, Colors_RGB } from "./colors";
// import { numbers, ValueRange } from "./core";

class Chars {
    public static readonly digits = Chars.range('0', '9');
    public static readonly latin = Chars.range('A', 'z');
    public static readonly greek_LC = Chars.range('α', 'ω');
    public static readonly greek_UC = "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨ";
    public static readonly cyrillic = Chars.range('А', 'я');
    public static readonly hiragana = Chars.range('ぁ', 'ゖ');
    public static readonly hiragana_some = "あいうえおかきくけこがぎぐげごさしすせそざじずぜぞtたちつてとだぢづでどなにぬねのはひふへほばびぶべぼぱぴぷぺぽまみむめもやゆよらりるれろわゐゑをん";
    public static readonly katakana = "゠アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレワヰヱヲンヺ・ーヽヿ";
    public static readonly katakana_some = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲ";

    public static range(start: string, end: string) {
        return numbers(start.charCodeAt(0), end.charCodeAt(0)).map(charCode => String.fromCharCode(charCode));
    }

    public static manyChars(...ranges: ValueRange<string>[]) {
        return ranges
            ?.map(([from, to]) => numbers(from.charCodeAt(0), to.charCodeAt(0)).map(charCode => String.fromCharCode(charCode))).flat(1)
            ?? [];
    }
}

// const defaultFontColor = Color_RGB.white;
// const defaultFontFamily = fontFamilies[defaultFontFamilyIndex];
// const defaultFontLineHeight_px = 32;
// const defaultFontOptions: FontOptions = { color: defaultFontColor, family: defaultFontFamily, lineHeight_px: defaultFontLineHeight_px,  };

// type FontOptionKey = `${keyof FontOptions}`;

// TODO: freeze make it faster?
class FontOptions implements Pick<CanvasTextDrawingStyles, 'textAlign' | 'textBaseline'> {
    constructor(
        public readonly family: string,
        public readonly lineHeight_px: number,
        public readonly color: IColor,
        public readonly textAlign: CanvasTextAlign,
        public readonly textBaseline: CanvasTextBaseline) {

        this.fontStr = `${this.lineHeight_px}px ${this.family}`;
    }

    public readonly fontStr: string;

    public with(changes: Partial<Omit<FontOptions, 'with'>>): FontOptions {
        return new FontOptions(
            changes['family'] ?? this.family,
            changes['lineHeight_px'] ?? this.lineHeight_px,
            changes['color'] ?? this.color,
            changes['textAlign'] ?? this.textAlign,
            changes['textBaseline'] ?? this.textBaseline);
    }

    public static readonly FontFamilies: readonly string[] = ["Monospace", "Courier", "Courier New", "Consolas", "Monaco"];
    public static readonly Default: FontOptions = new FontOptions(
        FontOptions.FontFamilies[0],
        22,
        Colors.RGB.white,
        "center",
        "middle");
}

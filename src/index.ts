///<reference path="./core.ts" />
///<reference path="./text.ts" />
///<reference path="./colors.ts" />
// import { ColorString, Colors_RGB, Color_RGBA } from './colors';
// import { getRandomItem, RelativeArea } from './core';
// import { Chars, fontFamilies, FontOptions } from './text';

type FontSettingKey = `font${Capitalize<keyof FontOptions>}`;
type SettingKey = keyof Config | FontSettingKey;

// TODO: make immutable
class Config {

    private static readonly defaultFps: number = 60;

    constructor() { }

    // TODO: cache values
    trailLength: number = 32;
    cps: number = 14;
    private _fps: number = Config.defaultFps;
    public get fps() { return this._fps; }
    public set fps(value) { this._fpsDelta_ms = Config.calculateDeltasFps(this._fps = value); }
    private _fpsDelta_ms: number = Config.calculateDeltasFps(Config.defaultFps);
    get fpsDelta_ms() { return this._fpsDelta_ms; }
    getFpsDelta_ms = () => { return 1000 / this._fps; }
    backgroundColor: Color_RGBA = new Color_RGBA(0, 0, 0, 255);
    fontOptions: FontOptions = FontOptions.Default;
    // useRainbow: boolean = false;
    // rainbowSpeed: number = 0.75;

    private static calculateDeltasFps(fps: number): number { return 1000 / fps; }
}
function livelyPropertyListener(propName: SettingKey, value: any) {

    switch (propName) {

        case "backgroundColor":
            const newBackground = parseHexColorString(value);
            if (newBackground) {
                config.backgroundColor = newBackground instanceof Color_RGBA ? newBackground : rgbToRgba(newBackground);
                restartAnimation('canvas');
            }
            break;

        case "fontColor":
            const newFontColor = parseHexColorString(value);
            if (newFontColor)
                config.fontOptions = config.fontOptions.with({ color: newFontColor });
            break;

        case "fontFamily":
            value = parseInt(value);
            if (isNaN(value) || value <= 0)
                return;

            restartAnimation("matrix", () => config.fontOptions = config.fontOptions.with({ family: FontOptions.FontFamilies[value] }));
            break;

        case "fontLineHeight_px":
            value = parseInt(value);
            if (isNaN(value) || value <= 0)
                return;

            restartAnimation("matrix", () => {
                config.fontOptions = config.fontOptions.with({ lineHeight_px: value });
            });
            break;

        case "trailLength":
            value = parseInt(value);
            // TODO: find a better place for these validations
            if (isNaN(value) || value <= 0)
                return;

            restartAnimation("matrix", () => config.trailLength = value);
            break;

        case "fps":
            value = parseInt(value);
            if (isNaN(value) || value <= 0)
                return;

            restartAnimation("none", () => config.fps = value);
            break;

        case "cps":
            value = parseInt(value);
            if (isNaN(value) || value <= 0)
                return;

            restartAnimation("none", () => config.cps = value);
            break;

        // case "useRainbow":
        //     config.useRainbow = !!val;
        //     break;

        // case "rainbowSpeed":
        //     val = +parseInt(val);
        //     if (!isNaN(val)) {
        //         val = Math.abs(val);
        //         config.rainbowSpeed = val / 100;
        //     }
        //     break;

        default:
            alert("Unhandled property: " + propName);
    }
}
function clearCanvas() {
    renderer2DCtx.clearRect(0, 0, renderer2DCtx.canvas.width, renderer2DCtx.canvas.height);
}
function fadeFrameByPerc(percent: number) {
    let imgData = renderer2DCtx.getImageData(0, 0, renderer2DCtx.canvas.width, renderer2DCtx.canvas.height);
    // TODO: cache value
    imgData = alterAlphaByAbs(imgData, 255 * percent);
    renderer2DCtx.putImageData(imgData, 0, 0);
}
let prevFrameImageData: ImageData | null = null;
function alterAlphaByAbs(img: ImageData, alphaChange: number) {

    let i = img.data.length - 1;
    while (i >= 3) {
        // TODO: optimize
        // TODO: test with updating only needed cells
        img.data[i] = Math.min(255, Math.max(0, img.data[i] + alphaChange));
        i -= 4;
    }

    return img;
}
function forText<T>(func: () => T, options: FontOptions = config.fontOptions) {

    renderer2DCtx.save();

    renderer2DCtx.textAlign = options.textAlign;
    renderer2DCtx.textBaseline = options.textBaseline;
    renderer2DCtx.font = options.fontStr;
    renderer2DCtx.fillStyle = options.color.toHexString(true);

    const result = func();

    renderer2DCtx.restore();

    return result;
}
function printText(text: string, area: Omit<RelativeArea, "size"> & Partial<Pick<RelativeArea, "size">>, fontOptions: FontOptions = config.fontOptions) {
    forText(
        () => {
            const w = (area.size?.w ?? renderer2DCtx.measureText(text).width) / 2;
            const h = (area.size?.h ?? fontOptions.lineHeight_px) / 2;
            renderer2DCtx.fillText(text, area.pos.x + w, area.pos.y + h);
        },
        fontOptions);
}
function measureText(text: string, fontOptions: FontOptions = config.fontOptions) {
    return forText(() => renderer2DCtx.measureText(text), fontOptions);
}
function drawDrop(drops: number[], i: number) {
    // const font: FontOptions = { ...defaultFontOptions, color: getDropFontColor() };
    printText(
        getRandomItem(allChars),
        {
            pos: {
                x: i * config.fontOptions.lineHeight_px,
                y: drops[i] * config.fontOptions.lineHeight_px
            },
            size: {
                w: config.fontOptions.lineHeight_px,
                h: config.fontOptions.lineHeight_px
            }
        });
}
function drawMatrix(time: number) {

    const timeD: number | null = prevFrameTime != null
        ? (time - prevFrameTime)
        : null;

    if (timeD == null || timeD >= config.fpsDelta_ms) {
        // if (timeD == null || timeD >= config.getFpsDelta_ms()) {

        let needsClear: boolean = false;
        needsClear = refreshMatrixValues() || needsClear;
        needsClear = refreshDropsListSize() || needsClear;

        if (needsClear) {
            clearCanvas();
        }

        if (updateDrops(timeD)) {
            // TODO: cache value
            // fadeFrameByPerc(-1 / (config.trailLength + 1));
            fadeFrameByPerc(-1 / (config.trailLength + 1));
            drawDrops();
        }

        // printConfig();

        prevFrameTime = time;
    }

    updaterHandle = requestAnimationFrame(drawMatrix);
}
function updateDropPosition(drops: number[], i: number, step: number): boolean {

    let dropY = drops[i];

    if (dropY < 0 && Math.random() <= 0.98)
        return false;

    dropY += step;

    if (dropY * config.fontOptions.lineHeight_px >= renderer2DCtx.canvas.height)
        dropY = -1; // TODO: check === -1 vs === NaN

    drops[i] = dropY;

    return true;
}
function updateDrops(timeD: number | null): boolean {
    // (1s) 1000 : config.cps = timeD : x
    dropsStep += timeD != null ? config.cps * timeD / 1000 : 0;
    const dsIntPart: number = Math.floor(dropsStep);

    if (dsIntPart < 1)
        return false;

    let anyChanges: boolean = false;
    let di = drops.length;
    while (--di >= 0) {
        anyChanges = updateDropPosition(drops, di, dropsStep) || anyChanges;
    }

    dropsStep -= dsIntPart;

    return anyChanges
}
function drawDrops() {
    let n = drops.length;
    while (--n >= 0) {
        drawDrop(drops, n);
    }
}
function printConfig() {
    forText(() => {

        const text =
            `bg: ${config.backgroundColor.toHexString(true)}` +
            `, font: ${config.fontOptions.lineHeight_px} px ${renderer2DCtx.font} ${config.fontOptions.color.toHexString(true)}` +
            `, cols: ${columnsCount}` +
            `, spacing: ${columnsSpacing}`;
        const padding = 4;
        const doublePadding = padding * 2;
        const textSize = renderer2DCtx.measureText(text);
        const marginX = Math.floor((renderer2DCtx.canvas.width - textSize.width - doublePadding) / 2);
        const marginY = Math.floor((renderer2DCtx.canvas.height - config.fontOptions.lineHeight_px - doublePadding) / 2);

        renderer2DCtx.save();

        renderer2DCtx.fillStyle = Colors.RGB.black.toHexString(true);
        renderer2DCtx.fillRect(marginX, marginY, textSize.width + doublePadding, config.fontOptions.lineHeight_px + doublePadding);

        renderer2DCtx.restore();

        printText(text, { pos: { x: marginX + padding, y: marginY + padding } });
    });
}
function getRainbowColorChannel(hueCoeff: number, channelMask: number) {
    return Math.floor(127 * Math.sin(hueCoeff + channelMask) + 128);
}
function getDropFontColor() {

    // if (config.useRainbow) {
    //     hue += hueStep * hueDirection;
    //     const hueCoeff = config.rainbowSpeed * hue;
    //     return new Color_RGB(
    //         getRainbowColorChannel(hueCoeff, 0),
    //         getRainbowColorChannel(hueCoeff, 2),
    //         getRainbowColorChannel(hueCoeff, 4));
    // }

    return config.fontOptions.color;
}

// function composeCanvasFont(family: string = config.fontFamily, size_px: number = config.fontSize) {
//     return `${size_px}px "${family}"`;
// }
// function setFont(family: string, size_px: number, color: Color_RGB) {

//     let hasChanges: boolean = false;

//     if (config.fontFamily != family) {
//         config.fontFamily = family;
//         hasChanges = true;
//     }
//     if (config.fontOptions.lineHeight_px != size_px) {
//         config.fontOptions.lineHeight_px = size_px;
//         hasChanges = true;
//     }

//     if (hasChanges) {
//         if (refreshColumnsValues())
//             hasChanges = true;
//     }

//     if (config.fontOptions.color != color) {
//         config.fontOptions.color = color;
//         hasChanges = true;
//     }

//     return hasChanges;
// }
// function setBackgroundColor(color: Color_RGB) {
//     config.backgroundColor = color;
//     canvasCtx.canvas.style.backgroundColor = config.backgroundColor?.toHexString();
// }
// function setDrawInterval(ms: number) {

//     stopDrawingLoop();

//     if (ms > 0 && config.stepsInterval !== ms) {
//         // alert("Setting drawing interval: " + ms);
//         config.stepsInterval = ms;
//     }

//     restartDrawingLoop();
// }
function refreshCanvasSize() {

    let hasChanges: boolean = false;

    if (renderer2DCtx.canvas.height !== window.innerHeight) {
        renderer2DCtx.canvas.height = window.innerHeight;
        hasChanges = true;
    }
    if (renderer2DCtx.canvas.width !== window.innerWidth) {
        renderer2DCtx.canvas.width = window.innerWidth;
        hasChanges = true;
    }
    hasChanges = refreshMatrixValues() || hasChanges;

    return hasChanges;
}
function refreshCanvas(): boolean {
    let hasChanges: boolean = refreshCanvasSize();
    rendering.style.backgroundColor = config.backgroundColor.toHexString(true);
    return hasChanges;
}
function calculateColumnsSpacing() {
    return (renderer2DCtx.canvas.width % config.fontOptions.lineHeight_px) / (columnsCount - 1);
}
function refreshMatrixValues() {

    let hasChanges: boolean = false;

    const newColsCount = Math.floor(renderer2DCtx.canvas.width / config.fontOptions.lineHeight_px);
    if (newColsCount !== columnsCount) {
        columnsCount = newColsCount;
        hasChanges = refreshDropsListSize() || true;
    }
    const newColsSpac = calculateColumnsSpacing();
    if (newColsSpac !== columnsSpacing) {
        columnsSpacing = newColsSpac;
        hasChanges = true;
    }
    return hasChanges;
}
function createDropsList() {
    const drops = new Array<number>(columnsCount);
    for (let i = 0; i < columnsCount; i++) {
        drops[i] = Math.ceil((renderer2DCtx.canvas.height / config.fontOptions.lineHeight_px) * Math.random());
    }
    return drops;
}
// TODO: make it only change width by trimming or adding missing columns, dont regenerate the array or the drops
function refreshDropsListSize() {

    if (!drops || columnsCount !== drops.length) {
        drops = createDropsList();
        return true;
    }

    return false;
}
function refreshAll() {
    let hasChanges: boolean = false;
    hasChanges = refreshCanvas() || hasChanges;
    return hasChanges;
}
// function stopDrawingLoop() {
//     console.log("Stopping handle: " + updaterHandle);
//     if (updaterHandle != null) {
//         console.log("No need to stop interval");
//         return;
//     }
//     clearInterval(updaterHandle);
//     updaterHandle = undefined;
//     console.log("Interval stopped: " + updaterHandle);
// }
// function restartDrawingLoop() {
//     stopDrawingLoop();
//     console.log("Starting interval with " + config.stepsInterval + "ms ...");
//     updaterHandle = setInterval(drawMatrix, config.stepsInterval);
//     console.log("Interval started: " + updaterHandle);
// }
function stopAnimation() {
    if (updaterHandle === undefined)
        return;

    cancelAnimationFrame(updaterHandle);
    updaterHandle = undefined;
    prevFrameTime = undefined;
}
type RefreshLevel = "canvas" | "matrix" | "none";
// function restartAnimation(refreshLevelOrFunc: RefreshLevel | (() => RefreshLevel)) {
function restartAnimation(refreshLevel: RefreshLevel, action?: () => void) {

    stopAnimation();

    action?.();
    // const refreshLevel = refreshLevelOrFunc instanceof Function
    //     ? refreshLevelOrFunc()
    //     : refreshLevelOrFunc;

    switch (refreshLevel) {
        case "canvas":
            refreshCanvas();
            break;
        case "matrix":
            refreshMatrixValues();
            break;
    }
    updaterHandle = requestAnimationFrame(drawMatrix);
}

// colors
const hueDirection = -1;
const hueStep = 0.01;
// text
const allChars = [...Chars.digits, ...Chars.latin, ...Chars.cyrillic, ...Chars.katakana_some, ...Chars.hiragana, ...Chars.greek_LC, ...Chars.greek_UC];

const config = new Config();

let hue = 0;
let drops: number[] = []; // not number[] | null to avoid null checkings inside hot path or @ts-ignore
let dropsStep: number = 0;
let columnsCount: number = Number.NaN;
let columnsSpacing: number = Number.NaN;

let updaterHandle: number | undefined = undefined;
let prevFrameTime: number | undefined = undefined;

const USE_OFFSCREEN = true;
const renderingSettings_2D: CanvasRenderingContext2DSettings = {
    alpha: true,
    // willReadFrequently: true,
};

const rendering: HTMLCanvasElement = document.createElement("canvas");
document.body.appendChild(rendering);
if (!rendering) throw new Error("Unable to create canvas");

const renderer_2D = rendering.transferControlToOffscreen();

const tempRenderer_2DCtx = USE_OFFSCREEN
    ? renderer_2D.getContext("2d", renderingSettings_2D) as OffscreenCanvasRenderingContext2D
    : rendering.getContext("2d", renderingSettings_2D);

if (!tempRenderer_2DCtx) throw new Error("Unable to obtain canvas 2D context");
const renderer2DCtx = tempRenderer_2DCtx;

// bitmaprenderer

// const tempImgRendererCtx = rendering2D.getContext("bitmaprenderer", { alpha: true });
// if (!tempImgRendererCtx) throw new Error("Unable to obtain canvas drawing context");
// const imgRendererCtx: ImageBitmapRenderingContext = tempImgRendererCtx;

// subscribe to events

document.addEventListener('DOMContentLoaded', () => {
    // stopDrawingLoop();
    // stopAnimation();
    // restartDrawingLoop();
    restartAnimation("canvas");
});

window.addEventListener('resize', () => {
    // stopDrawingLoop();
    // stopAnimation();
    restartAnimation("canvas");
    // restartDrawingLoop();
});
import { Color_RGBA, Colors_RGBA, ColorString, Colors_RGB } from './colors';
import { getRandomItem, RelativeArea } from './core';
import { Chars, fontFamilies, FontOptions } from './text';

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
    getFpsDelta_ms() { return 1000 / this._fps; }
    backgroundColor: Color_RGBA = new Color_RGBA(0, 0, 0, 255);
    fontOptions: FontOptions = FontOptions.Default;
    // useRainbow: boolean = false;
    // rainbowSpeed: number = 0.75;

    private static calculateDeltasFps(fps: number): number { return 1000 / fps; }
}
function livelyPropertyListener(name: keyof Config | `font${Capitalize<keyof FontOptions>}`, val: any) {

    switch (name) {

        case "backgroundColor":
            const newBg = ColorString.parseRgba(val);
            if (newBg)
                config.backgroundColor = newBg;
            break;

        case "fontColor":
            const newFontColor = ColorString.parse(val);
            if (newFontColor)
                config.fontOptions = config.fontOptions.with({ color: newFontColor });
            break;

        case "fontFamily":
            val = parseInt(val);
            if (isNaN(val) || val <= 0)
                return;

            restartAnimation("matrix", () => config.fontOptions = config.fontOptions.with({ family: fontFamilies[val] }));
            break;

        case "fontLineHeight_px":
            val = parseInt(val);
            if (isNaN(val) || val <= 0)
                return;

            restartAnimation("matrix", () => config.fontOptions = config.fontOptions.with({ lineHeight_px: val }));
            break;

        case "trailLength":
            val = parseInt(val);
            // TODO: if value is ok should be decided by logic o target property, not externally, move to config.setTrailLength (same for other props)
            if (isNaN(val) || val <= 0)
                return;

            restartAnimation("matrix", () => config.trailLength = val);
            break;

        case "fps":
            val = parseInt(val);
            if (isNaN(val) || val <= 0)
                return;

            restartAnimation("none", () => config.fps = val);
            break;

        case "cps":
            val = parseInt(val);
            if (isNaN(val) || val <= 0)
                return;

            restartAnimation("none", () => config.cps = val);
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
            alert("Unhandled property: " + name);
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
function alterAlphaByAbs(imagedata: ImageData, alphaChange: number) {

    let i = imagedata.data.length - 1;
    // for (let i = 0; i < len; i += 4) {
    //     // TODO: optimize
    //     // TODO: test with updating only needed cells
    //     imagedata.data[i + 3] = Math.min(255, Math.max(0, imagedata.data[i + 3] + alphaChange));
    // }
    while (i >= 3) {
        // TODO: optimize
        // TODO: test with updating only needed cells
        imagedata.data[i] = Math.min(255, Math.max(0, imagedata.data[i] + alphaChange));
        i -= 4;
    }

    return imagedata;
}
function forText<T>(func: () => T, options: FontOptions = config.fontOptions) {

    renderer2DCtx.save();

    renderer2DCtx.textAlign = options.textAlign;
    renderer2DCtx.textBaseline = options.textBaseline;
    renderer2DCtx.font = options.fontStr;
    renderer2DCtx.fillStyle = options.color.toHexString(true);

    const r = func();

    renderer2DCtx.restore();

    return r;
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

    const timeD: number | undefined = prevFrameTime != null
        ? (time - prevFrameTime)
        : undefined;

    // TODO: benchmark undefined === undefined vs !value
    if (timeD === undefined || timeD >= config.fpsDelta_ms) {
        // if (timeD == null || timeD >= config.getFpsDelta_ms()) {

        let needsClear: boolean = false;
        needsClear = refreshMatrixValues() || needsClear;
        needsClear = refreshDropsListSize() || needsClear;

        if (needsClear) clearCanvas();

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

    if (dropY < 0 && Math.random() <= 0.975)
        return false;

    dropY += step;

    // TODO: verificare valori Math.floor/ceil
    if (dropY * config.fontOptions.lineHeight_px >= renderer2DCtx.canvas.height)
        dropY = -1; // TODO: check === -1 vs === NaN

    drops[i] = dropY;

    return true;
}
function updateDrops(timeD?: number): boolean {
    // (1s) 1000 : config.cps = timeD : x
    dropsStep += timeD != null ? config.cps * timeD / 1000 : 0;
    const dsIntPart: number = Math.floor(dropsStep);

    if (dsIntPart < 1)
        return false;

    let anyChanges: boolean = false;
    let di = drops.length;
    while (--di >= 0) {
        anyChanges = updateDropPosition(drops, di, dropsStep) || anyChanges;
        // TODO: bench if + set vs x = () || x
        // if (updateDropPosition(drops, di, dropsStep)) {
        //     anyDropChangedPosition = true;
        // }
    }

    dropsStep -= dsIntPart;

    return anyChanges
}
function drawDrops() {
    let n = drops.length;
    while (--n >= 0)
        drawDrop(drops, n);
}
function printConfig() {
    forText(() => {

        const text = renderer2DCtx.font + ", cols: " + columnsCount + ", spacing: " + columnsSpacing;
        const textSize = renderer2DCtx.measureText(text);
        const margin = 10;
        const padding = 4;

        renderer2DCtx.save();

        renderer2DCtx.fillStyle = Colors_RGB.black.toHexString();
        renderer2DCtx.fillRect(margin, margin, textSize.width + padding * 2, config.fontOptions.lineHeight_px + padding * 2);

        renderer2DCtx.restore();

        printText(text, { pos: { x: margin + padding, y: margin + padding } });
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

//     // TODO: good sanitization?
//     if (ms > 0 && config.stepsInterval !== ms) {
//         // alert("Setting drawing interval: " + ms);
//         config.stepsInterval = ms;
//     }

//     restartDrawingLoop();
// }
function calculateColumnsSpacing() {
    return (renderer2DCtx.canvas.width % config.fontOptions.lineHeight_px) / (columnsCount - 1);
}
function refreshCanvas(): boolean {
    let hasChanges: boolean = refreshCanvasSize();
    rendering.style.backgroundColor = config.backgroundColor.toHexString();
    return hasChanges;
}
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
function createDropsList() {
    const drops = new Array<number>(columnsCount);
    for (let i = 0; i < columnsCount; i++) {
        drops[i] = Math.ceil((renderer2DCtx.canvas.height / config.fontOptions.lineHeight_px) * Math.random());
    }
    return drops;
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
const renderingSettings_2D: CanvasRenderingContext2DSettings = { alpha: true };

const rendering: HTMLCanvasElement = document.createElement("canvas");
document.body.appendChild(rendering);
if (!rendering) throw new Error("Unable to create canvas");

const renderer_2D = rendering.transferControlToOffscreen();

const tempRenderer_2DCtx = USE_OFFSCREEN
    ? renderer_2D.getContext("2d", renderingSettings_2D)
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
    stopAnimation();
    restartAnimation("canvas");
    // restartDrawingLoop();
});
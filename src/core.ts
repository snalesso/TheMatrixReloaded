export type ValueRange<T> = [from: T, to: T];
export type Vector2D = { x: number, y: number };
export type Size2D = { w: number, h: number };
export type RelativeArea = { pos: Vector2D, size: Size2D };

export function getRandomItem<T>(items: T[]) { return items[Math.floor(Math.random() * items.length)]; }

export function numbers(start: number, end: number) {
  return Array.from({ length: (end - start) }, (_, k) => k + start);
}
export type UppercaseFirstLetter<S extends string> =
  S extends `${infer P1}${infer P2}`
  ? `${Uppercase<P1>}${P2}`
  : Lowercase<S>
// type LowercaseFirstLetter<S extends string> =
//   S extends `${infer P1}${infer P2}`
//   ? `${Lowercase<P1>}${P2}`
//   : Lowercase<S>
export type PrefixWith<S extends string, X extends string> = `${X}${S}`;
// type KeysToCamelCase<T> = {T[keyof in T as K]: T[K]} ?KeysToCamelCase<T[K]> : `${string & typeofT}${Capitalize<string & K>}`]: T[K] }
// type keys = KeysToCamelCase<Config>;
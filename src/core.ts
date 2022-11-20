type ValueRange<T> = [from: T, to: T]
type Vector2D = { x: number, y: number }
type Size2D = { w: number, h: number }
type RelativeArea = { pos: Vector2D, size: Size2D }

function getRandomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function numbers(start: number, end: number) {
  return Array.from({ length: (end - start) }, (_, k) => k + start);
}

type UppercaseFirstLetter<S extends string> =
  S extends `${infer P1}${infer P2}`
  ? `${Uppercase<P1>}${P2}`
  : Lowercase<S>
// type LowercaseFirstLetter<S extends string> =
//   S extends `${infer P1}${infer P2}`
//   ? `${Lowercase<P1>}${P2}`
//   : Lowercase<S>
type PrefixWith<S extends string, X extends string> = `${X}${S}`;
// type KeysToCamelCase<T> = {T[keyof in T as K]: T[K]} ?KeysToCamelCase<T[K]> : `${string & typeofT}${Capitalize<string & K>}`]: T[K] }
// type keys = KeysToCamelCase<Config>;
import { toHex } from "./toHex"

export function altiumColorToCss(
  raw: string | undefined,
  fallback: string,
): string {
  if (raw === undefined) return fallback
  const encodedColor = Number(raw)
  if (!Number.isInteger(encodedColor) || encodedColor < 0) return fallback
  const red = encodedColor & 0xff
  const green = (encodedColor >>> 8) & 0xff
  const blue = (encodedColor >>> 16) & 0xff
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`
}

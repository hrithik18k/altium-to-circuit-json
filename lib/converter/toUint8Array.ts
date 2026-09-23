import type { AltiumSource } from "./types"

export function toUint8Array(source: AltiumSource): Uint8Array {
  if (typeof source === "string") return new TextEncoder().encode(source)
  if (source instanceof Uint8Array) return source
  return new Uint8Array(source)
}

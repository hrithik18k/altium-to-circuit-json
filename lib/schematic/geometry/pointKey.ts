import type { AltiumPoint } from "altiumts"
import type { SchematicPointKey } from "./types"

export function pointKey(point: AltiumPoint): SchematicPointKey {
  return `${point.x.toFixed(6)},${point.y.toFixed(6)}` as SchematicPointKey
}

import type { AltiumPoint } from "altiumts"
import type { PcbComponentId } from "../identifiers"

export interface CourtyardPath {
  componentId: PcbComponentId
  layer: "top" | "bottom"
  points: AltiumPoint[]
  strokeWidthMils: number
}

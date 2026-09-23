import type { LayerRef } from "circuit-json"
import { INNER_LAYERS } from "./constants"

export function mapAltiumCopperLayer(
  layer: string | undefined,
): LayerRef | undefined {
  const normalized = (layer ?? "").replace(/[\s_.-]+/gu, "").toUpperCase()
  if (normalized === "TOP" || normalized === "TOPLAYER") return "top"
  if (normalized === "BOTTOM" || normalized === "BOTTOMLAYER") return "bottom"

  const innerMatch = /^(?:MID|MIDLAYER|INTERNALPLANE)(\d+)$/u.exec(normalized)
  if (!innerMatch?.[1]) return undefined
  const innerNumber = Math.min(Math.max(Number(innerMatch[1]), 1), 8)
  return INNER_LAYERS[innerNumber - 1]
}

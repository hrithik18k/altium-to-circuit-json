import { normalizeLayer } from "../layers"

export function isCopperLayer(layer: string | undefined): boolean {
  const normalized = normalizeLayer(layer)
  return (
    normalized === "TOP" ||
    normalized === "TOPLAYER" ||
    normalized === "BOTTOM" ||
    normalized === "BOTTOMLAYER" ||
    /^(?:MID|MIDLAYER|INTERNALPLANE)\d+$/u.test(normalized)
  )
}

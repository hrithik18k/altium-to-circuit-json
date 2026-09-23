import { normalizeLayer } from "./normalizeLayer"

export function mapMechanicalLayer(
  layer: string | undefined,
): "top" | "bottom" {
  return normalizeLayer(layer).includes("BOTTOM") ? "bottom" : "top"
}

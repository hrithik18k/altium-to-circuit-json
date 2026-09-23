import { normalizeLayer } from "./normalizeLayer"

export function mapCourtyardLayer(layer: string | undefined): "top" | "bottom" {
  return normalizeLayer(layer) === "MECHANICAL16" ? "bottom" : "top"
}

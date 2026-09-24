import { normalizeLayer } from "./normalizeLayer"

export function mapOverlayLayer(layer: string | undefined): "top" | "bottom" {
  return normalizeLayer(layer) === "BOTTOMOVERLAY" ? "bottom" : "top"
}

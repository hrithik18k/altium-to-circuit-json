import { normalizeLayer } from "./normalizeLayer"

export function isOverlayLayer(layer: string | undefined): boolean {
  const normalizedLayer = normalizeLayer(layer)
  return normalizedLayer === "TOPOVERLAY" || normalizedLayer === "BOTTOMOVERLAY"
}

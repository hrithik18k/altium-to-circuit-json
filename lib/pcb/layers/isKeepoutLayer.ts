import { normalizeLayer } from "./normalizeLayer"

export function isKeepoutLayer(layer: string | undefined): boolean {
  return normalizeLayer(layer) === "KEEPOUT"
}

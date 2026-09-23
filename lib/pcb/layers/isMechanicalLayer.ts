import { normalizeLayer } from "./normalizeLayer"

export function isMechanicalLayer(layer: string | undefined): boolean {
  return normalizeLayer(layer).startsWith("MECHANICAL")
}

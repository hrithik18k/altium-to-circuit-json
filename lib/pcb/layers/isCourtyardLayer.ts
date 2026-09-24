import { normalizeLayer } from "./normalizeLayer"

export function isCourtyardLayer(layer: string | undefined): boolean {
  const normalizedLayer = normalizeLayer(layer)
  return (
    normalizedLayer === "MECHANICAL15" || normalizedLayer === "MECHANICAL16"
  )
}

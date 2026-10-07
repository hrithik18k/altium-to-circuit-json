import type { Bounds } from "../geometry"
import { scaleLength } from "../geometry"
import type { SymbolSelection } from "../model"

export function getComponentSize({
  bodyBounds,
  scale,
  symbolSelection,
}: {
  bodyBounds: Bounds
  scale: number
  symbolSelection: SymbolSelection | undefined
}): { width: number; height: number } {
  if (symbolSelection) return { ...symbolSelection.symbol.size }
  return {
    height: Math.max(
      scaleLength(bodyBounds.maxY - bodyBounds.minY, scale),
      0.4,
    ),
    width: Math.max(scaleLength(bodyBounds.maxX - bodyBounds.minX, scale), 0.4),
  }
}

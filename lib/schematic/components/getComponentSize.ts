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
  if (symbolSelection)
    return {
      width: scaleLength(
        symbolSelection.symbol.size.width,
        symbolSelection.geometryScale ?? 1,
      ),
      height: scaleLength(
        symbolSelection.symbol.size.height,
        symbolSelection.geometryScale ?? 1,
      ),
    }
  return {
    height: Math.max(
      scaleLength(bodyBounds.maxY - bodyBounds.minY, scale),
      0.4,
    ),
    width: Math.max(scaleLength(bodyBounds.maxX - bodyBounds.minX, scale), 0.4),
  }
}

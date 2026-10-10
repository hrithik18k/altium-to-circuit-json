import type { AltiumRecord } from "altiumts"
import { type Bounds, getBoundsForPoints, scaleLength } from "../geometry"
import type { SymbolSelection } from "../model"

export function getNativeResistorScale({
  bodyBounds,
  scale,
  selection,
  records,
}: {
  bodyBounds: Bounds
  scale: number
  selection: SymbolSelection
  records: AltiumRecord[]
}): number {
  if (!selection.name.startsWith("boxresistor_")) return 1
  if (
    !records.some(
      (record) =>
        ["6", "13", "14"].includes(record.recordKind ?? "") &&
        !record.getBoolean("ISHIDDEN"),
    )
  )
    return 1
  // Catalog size includes label space. Fit the body itself to the source
  // footprint so dense resistor banks keep their pitch and label clearance.
  const points = selection.symbol.primitives.flatMap((primitive) =>
    primitive.type === "path" ? primitive.points : [],
  )
  if (!points.length) return 1
  const nativeBounds = getBoundsForPoints(points)
  const ratios = [
    scaleLength(bodyBounds.maxX - bodyBounds.minX, scale) /
      (nativeBounds.maxX - nativeBounds.minX),
    scaleLength(bodyBounds.maxY - bodyBounds.minY, scale) /
      (nativeBounds.maxY - nativeBounds.minY),
  ].filter((ratio) => Number.isFinite(ratio) && ratio > 0)
  return Math.min(1, ...ratios)
}

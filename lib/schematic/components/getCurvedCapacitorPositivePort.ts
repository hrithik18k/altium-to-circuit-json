import { type AltiumRecord, getSchematicRecordPoints } from "altiumts"
import { applyToPoint, compose, rotateDEG, scale } from "transformation-matrix"
import { getCoordinateOrFallback, getCorner, getLocation } from "../geometry"
import type { ConvertedPort } from "../model"
import { getCapacitorAxis } from "./getCapacitorAxis"

export function getCurvedCapacitorPositivePort({
  ports,
  records,
}: {
  ports: ConvertedPort[]
  records: AltiumRecord[]
}): ConvertedPort | null | undefined {
  const axis = getCapacitorAxis(ports)
  if (!axis) return undefined
  const straightPlates: number[] = []
  const curvedPlates: number[] = []
  for (const record of records) {
    if (record.getBoolean("ISHIDDEN")) continue
    const location = getLocation(record)
    if (
      (record.recordKind === "11" || record.recordKind === "12") &&
      location
    ) {
      const startAngle = record.getNumber("STARTANGLE") ?? 0
      const rawSpan = (record.getNumber("ENDANGLE") ?? 360) - startAngle
      const span = ((rawSpan % 360) + 360) % 360
      // A plate is a partial arc, not a closed circle or a surrounding outline.
      if (span <= 0 || span > 180) continue
      const radiusX = getCoordinateOrFallback({
        record,
        key: "RADIUS",
        fallback: 0,
      })
      const radiusY = getCoordinateOrFallback({
        record,
        key: "SECONDARYRADIUS",
        fallback: radiusX,
      })
      const arcToSchematic = compose(
        scale(radiusX, radiusY),
        rotateDEG(startAngle + span / 2),
      )
      const midpoint = applyToPoint(arcToSchematic, { x: 1, y: 0 })
      const x = location.x + midpoint.x - axis.start.x
      const y = location.y + midpoint.y - axis.start.y
      const along = (x * axis.dx + y * axis.dy) / axis.squaredLength
      const across = (x * axis.dy - y * axis.dx) / Math.sqrt(axis.squaredLength)
      if (
        along >= -0.5 &&
        along <= 1.5 &&
        Math.abs(across) <= Math.max(radiusX, radiusY) / 2
      ) {
        curvedPlates.push(along)
      }
    }
    const corner = getCorner(record)
    const points =
      record.recordKind === "13" && location && corner
        ? [location, corner]
        : record.recordKind === "6"
          ? getSchematicRecordPoints(record)
          : []
    for (let index = 1; index < points.length; index++) {
      const a = points[index - 1]!
      const b = points[index]!
      const aAlong =
        ((a.x - axis.start.x) * axis.dx + (a.y - axis.start.y) * axis.dy) /
        axis.squaredLength
      const bAlong =
        ((b.x - axis.start.x) * axis.dx + (b.y - axis.start.y) * axis.dy) /
        axis.squaredLength
      const aAcross =
        (a.x - axis.start.x) * axis.dy - (a.y - axis.start.y) * axis.dx
      const bAcross =
        (b.x - axis.start.x) * axis.dy - (b.y - axis.start.y) * axis.dx
      if (
        Math.abs(aAlong - bAlong) < 1e-5 &&
        aAcross * bAcross < 0 &&
        aAlong >= -0.25 &&
        aAlong <= 1.25
      ) {
        straightPlates.push(aAlong)
      }
    }
  }
  const candidates = new Set<ConvertedPort>()
  for (const curved of curvedPlates) {
    for (const straight of straightPlates) {
      if (Math.abs(curved - straight) < 0.05) continue
      // The curved plate is negative; physical pad numbering is unrelated.
      candidates.add(ports[curved > straight ? 0 : 1]!)
    }
  }
  return candidates.size > 1 ? null : [...candidates][0]
}

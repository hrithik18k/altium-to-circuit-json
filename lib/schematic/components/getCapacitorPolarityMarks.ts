import {
  type AltiumPoint,
  type AltiumRecord,
  AltiumSchLabelRecord,
  getSchematicRecordPoints,
} from "altiumts"
import { getCorner, getLocation } from "../geometry"

export function getCapacitorPolarityMarks(
  records: AltiumRecord[],
): { point: AltiumPoint; graphic: boolean }[] {
  const marks: { point: AltiumPoint; graphic: boolean }[] = []
  const strokes: { start: AltiumPoint; end: AltiumPoint }[] = []
  for (const record of records) {
    if (record.getBoolean("ISHIDDEN")) continue
    const location = getLocation(record),
      corner = getCorner(record)
    if (
      record instanceof AltiumSchLabelRecord &&
      record.text?.trim() === "+" &&
      location
    )
      marks.push({ point: location, graphic: false })
    if (
      ["10", "14"].includes(record.recordKind ?? "") &&
      record.getBoolean("ISSOLID") &&
      location &&
      corner
    ) {
      const width = Math.abs(location.x - corner.x),
        height = Math.abs(location.y - corner.y)
      if (width > height * 3)
        strokes.push({
          start: { x: location.x, y: (location.y + corner.y) / 2 },
          end: { x: corner.x, y: (location.y + corner.y) / 2 },
        })
      if (height > width * 3)
        strokes.push({
          start: { x: (location.x + corner.x) / 2, y: location.y },
          end: { x: (location.x + corner.x) / 2, y: corner.y },
        })
    }
    const points =
      record.recordKind === "13" && location && corner
        ? [location, corner]
        : record.recordKind === "6"
          ? getSchematicRecordPoints(record)
          : []
    for (let index = 1; index < points.length; index++)
      strokes.push({ start: points[index - 1]!, end: points[index]! })
  }
  for (const horizontal of strokes.filter(
    (s) => Math.abs(s.start.y - s.end.y) < 1e-5 && s.start.x !== s.end.x,
  )) {
    for (const vertical of strokes.filter(
      (s) => Math.abs(s.start.x - s.end.x) < 1e-5 && s.start.y !== s.end.y,
    )) {
      const width = Math.abs(horizontal.end.x - horizontal.start.x),
        height = Math.abs(vertical.end.y - vertical.start.y)
      const x = vertical.start.x,
        y = horizontal.start.y
      // A plus crosses near the center of both strokes, unlike a pin/plate T.
      if (
        width / height < 0.5 ||
        width / height > 2 ||
        Math.abs(x - (horizontal.start.x + horizontal.end.x) / 2) >
          width * 0.15 ||
        Math.abs(y - (vertical.start.y + vertical.end.y) / 2) > height * 0.15
      )
        continue
      marks.push({ point: { x, y }, graphic: true })
    }
  }
  return marks
}

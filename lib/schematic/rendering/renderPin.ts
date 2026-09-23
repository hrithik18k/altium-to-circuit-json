import type { AltiumRecord } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import type { SchematicContext } from "../document"
import { getLocation } from "../geometry"
import { createDirectText, createLine } from "../text"
import type { SymbolRenderOptions } from "./types"

export function renderPin({
  record,
  index,
  context,
  options,
  color,
}: {
  record: AltiumRecord
  index: number
  context: SchematicContext
  options: SymbolRenderOptions
  color: string
}): AnyCircuitElement[] {
  const location = getLocation(record)
  if (!location) return []
  const pinConglomerate = record.getNumber("PINCONGLOMERATE")
  const hidden =
    record.getBoolean("ISHIDDEN") ||
    (pinConglomerate !== undefined && (pinConglomerate & 0x04) !== 0)
  if (hidden && !options.includeHidden) return []
  const orientation =
    (pinConglomerate ?? Number(record.getCaseInsensitive("ORIENTATION") ?? 0)) &
    3
  const direction = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
  ][orientation] ?? { x: 1, y: 0 }
  const length = Math.max(
    Number(record.getCaseInsensitive("PINLENGTH") ?? 10),
    1,
  )
  const end = {
    x: location.x + direction.x * length,
    y: location.y + direction.y * length,
  }
  const elements: AnyCircuitElement[] = [
    createLine({
      index,
      start: location,
      end,
      color,
      strokeWidth: 0.1,
      scale: context.scale,
      suffix: "pin",
    }),
  ]
  if (options.includeText === false) return elements
  const name = record.getDecoded("NAME") ?? ""
  const designator = record.getDecoded("DESIGNATOR") ?? ""
  const showName =
    pinConglomerate === undefined || (pinConglomerate & 0x08) !== 0
  const showDesignator =
    pinConglomerate === undefined || (pinConglomerate & 0x10) !== 0
  const ccwRotationDegrees = orientation === 1 || orientation === 3 ? 90 : 0
  const directionMatchesText = orientation === 0 || orientation === 1
  const textOffset = 2
  if (showName && name) {
    elements.push(
      createDirectText({
        id: `schematic_pin_name_altium_${index}`,
        text: name,
        location: {
          x: location.x - direction.x * textOffset,
          y: location.y - direction.y * textOffset,
        },
        fontSize: 6,
        color,
        scale: context.scale,
        ccwRotationDegrees,
        anchor: directionMatchesText ? "right" : "left",
      }),
    )
  }
  if (showDesignator && designator) {
    elements.push(
      createDirectText({
        id: `schematic_pin_designator_altium_${index}`,
        text: designator,
        location: {
          x: location.x + direction.x * textOffset,
          y: location.y + direction.y * textOffset,
        },
        fontSize: 6,
        color,
        scale: context.scale,
        ccwRotationDegrees,
        anchor: directionMatchesText ? "left" : "right",
      }),
    )
  }
  return elements
}

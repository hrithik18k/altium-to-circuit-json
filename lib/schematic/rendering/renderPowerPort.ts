import type { AltiumRecord } from "altiumts"
import type { AnyCircuitElement, SchematicText } from "circuit-json"
import type { SchematicContext } from "../document"
import { getLocation } from "../geometry"
import { createDirectText, getFontSize } from "../text"
import { getPowerPortPoint } from "./getPowerPortPoint"
import { renderPowerPortGraphics } from "./renderPowerPortGraphics"
import type { PowerPortGeometry, SymbolRenderOptions } from "./types"

export function renderPowerPort({
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
  const orientation =
    ((Math.round(record.getNumber("ORIENTATION") ?? 0) % 4) + 4) % 4
  const direction = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
  ][orientation] ?? { x: 1, y: 0 }
  const powerPortGeometry: PowerPortGeometry = {
    direction,
    location,
    perpendicular: { x: -direction.y, y: direction.x },
  }
  const style = Math.round(Number(record.getCaseInsensitive("STYLE") ?? 2))
  const { elements, labelDistance } = renderPowerPortGraphics({
    color,
    index,
    powerPortGeometry,
    scale: context.scale,
    style,
  })
  const text = record.getDecoded("TEXT") ?? record.getDecoded("NAME")
  if (
    !text ||
    options.includeText === false ||
    record.getBoolean("SHOWNETNAME") === false
  ) {
    return elements
  }
  const vertical = direction.y !== 0
  const anchor: SchematicText["anchor"] = vertical
    ? direction.y > 0
      ? "bottom_center"
      : "top_center"
    : direction.x > 0
      ? "center_left"
      : "center_right"
  elements.push(
    createDirectText({
      id: `schematic_power_port_text_altium_${index}`,
      text,
      location: getPowerPortPoint({
        ...powerPortGeometry,
        along: labelDistance,
      }),
      fontSize: getFontSize(record, context),
      color,
      scale: context.scale,
      ccwRotationDegrees: 0,
      anchor,
    }),
  )
  return elements
}

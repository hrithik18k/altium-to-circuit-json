import type { AltiumRecord } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import type { ConvertAltiumSchDocOptions } from "../../api"
import type { SchematicContext } from "../document"
import { getLocation } from "../geometry"
import { createText } from "./createText"
import { renderTextFrameRecord } from "./renderTextFrameRecord"
import { resolveSchematicText } from "./resolveSchematicText"

export function renderTextRecord({
  record,
  index,
  context,
  options,
  color,
  strokeWidth,
}: {
  record: AltiumRecord
  index: number
  context: SchematicContext
  options: ConvertAltiumSchDocOptions
  color: string
  strokeWidth: number
}): AnyCircuitElement[] | undefined {
  const kind = record.recordKind
  if (
    kind === "4" ||
    kind === "25" ||
    kind === "32" ||
    kind === "33" ||
    kind === "34" ||
    kind === "41"
  ) {
    if (options.includeText === false) return []
    if (record.getBoolean("ISHIDDEN") && !options.includeHidden) return []
    const reference =
      record.getDecoded("TEXT") ??
      record.getDecoded("NAME") ??
      record.getDecoded("DESIGNATOR")
    const location = getLocation(record)
    if (!reference || !location) return []
    const text = resolveSchematicText({
      document: context.document,
      options,
      record,
      reference,
    })
    return [createText({ record, index, text, location, color, context })]
  }

  if (kind === "28") {
    return renderTextFrameRecord({
      record,
      index,
      context,
      options,
      color,
      strokeWidth,
    })
  }

  return undefined
}

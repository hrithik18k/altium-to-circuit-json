import type { AltiumRecord } from "altiumts"
import type { SchematicContext } from "../document"

export function getFontSize(
  record: AltiumRecord,
  context: SchematicContext,
): number {
  const fontId = Math.max(
    Math.round(Number(record.getCaseInsensitive("FONTID") ?? 1)),
    1,
  )
  return Math.max(
    Number(context.sheetRecord?.getCaseInsensitive(`SIZE${fontId}`) ?? 9),
    1,
  )
}

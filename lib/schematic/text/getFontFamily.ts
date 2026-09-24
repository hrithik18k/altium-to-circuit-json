import type { AltiumRecord } from "altiumts"
import type { SchematicContext } from "../document"

export function getFontFamily(
  record: AltiumRecord,
  context: SchematicContext,
): string {
  const fontId = Math.max(
    Math.round(Number(record.getCaseInsensitive("FONTID") ?? 1)),
    1,
  )
  return context.sheetRecord?.getDecoded(`FONTNAME${fontId}`) ?? "Arial"
}

import { SCHEMATIC_SHEET_ID } from "./constants"
import { convertSemanticSchematic } from "./convertSemanticSchematic"
import type { SchematicConversionContext } from "./types"

export function convertSchematicSemantics(
  context: SchematicConversionContext,
): void {
  const conversion = convertSemanticSchematic(context.document, {
    includeHidden: context.options.includeHidden,
    includeText: context.options.includeText,
    scale: context.scale,
    schematicSheetId: SCHEMATIC_SHEET_ID,
  })
  context.elements.push(...conversion.elements)
  for (const record of conversion.handledRecords) {
    context.handledRecords.add(record)
  }
}

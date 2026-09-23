import { SCHEMATIC_SHEET_ID } from "./constants"
import { createSheetBorder } from "./createSheetBorder"
import type { SchematicConversionContext } from "./types"

export function addSchematicSheet(context: SchematicConversionContext): void {
  context.elements.push({
    type: "schematic_sheet",
    schematic_sheet_id: SCHEMATIC_SHEET_ID,
    name: context.options.sheetName ?? "Altium schematic",
    outline_color: "#334155",
    sheet_index: 0,
  })
  if (context.options.includeSheetBorder === true) {
    context.elements.push(createSheetBorder(context.sheetRecord, context.scale))
  }
}

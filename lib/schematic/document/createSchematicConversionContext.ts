import type { AltiumSchDoc } from "altiumts"
import type { ConvertAltiumSchDocOptions } from "../../api"
import { getAltiumSheetDimensions } from "./getAltiumSheetDimensions"
import { getPageFitScale } from "./getPageFitScale"
import type { SchematicConversionContext } from "./types"

export function createSchematicConversionContext({
  document,
  options,
}: {
  document: AltiumSchDoc
  options: ConvertAltiumSchDocOptions
}): SchematicConversionContext {
  const records = document.records
  const sheetRecord = records.find((record) => record.recordKind === "31")
  const sheetDimensions = getAltiumSheetDimensions(sheetRecord)
  const scale = options.schematicUnitScale ?? getPageFitScale(sheetDimensions)
  if (!Number.isFinite(scale) || scale <= 0) {
    throw new RangeError("schematicUnitScale must be a positive finite number")
  }
  return {
    document,
    elements: [],
    handledRecords: new Set(),
    options,
    records,
    scale,
    sheetDimensions,
    sheetRecord,
  }
}

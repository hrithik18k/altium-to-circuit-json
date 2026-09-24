import type { AltiumRecord } from "altiumts"
import { getPositiveNumber } from "./getPositiveNumber"
import type { SheetDimensions } from "./types"

export function getAltiumSheetDimensions(
  sheetRecord: AltiumRecord | undefined,
): SheetDimensions {
  return {
    width: getPositiveNumber(sheetRecord?.getCaseInsensitive("CUSTOMX"), 1000),
    height: getPositiveNumber(sheetRecord?.getCaseInsensitive("CUSTOMY"), 800),
  }
}

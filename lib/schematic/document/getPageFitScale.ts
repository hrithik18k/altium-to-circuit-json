import {
  SCHEMATIC_SHEET_INNER_HEIGHT,
  SCHEMATIC_SHEET_INNER_WIDTH,
} from "./constants"
import type { SheetDimensions } from "./types"

export function getPageFitScale(sheetDimensions: SheetDimensions): number {
  return Math.min(
    SCHEMATIC_SHEET_INNER_WIDTH / sheetDimensions.width,
    SCHEMATIC_SHEET_INNER_HEIGHT / sheetDimensions.height,
  )
}

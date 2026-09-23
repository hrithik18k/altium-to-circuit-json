import type { AltiumRecord } from "altiumts"
import type { SchematicRect } from "circuit-json"
import { scaleLength, scalePoint } from "../geometry"
import { SCHEMATIC_SHEET_ID } from "./constants"
import { getAltiumSheetDimensions } from "./getAltiumSheetDimensions"

export function createSheetBorder(
  sheetRecord: AltiumRecord | undefined,
  scale: number,
): SchematicRect {
  const { height, width } = getAltiumSheetDimensions(sheetRecord)
  return {
    type: "schematic_rect",
    schematic_rect_id: "schematic_rect_altium_sheet_border",
    schematic_sheet_id: SCHEMATIC_SHEET_ID,
    center: scalePoint({ x: width / 2, y: height / 2 }, scale),
    width: scaleLength(width, scale),
    height: scaleLength(height, scale),
    rotation: 0,
    stroke_width: 0.1,
    color: "#334155",
    is_filled: false,
    is_dashed: false,
  }
}

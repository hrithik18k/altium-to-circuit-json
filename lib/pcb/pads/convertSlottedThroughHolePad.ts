import { normalizeAltiumAngle } from "altiumts"
import type { LayerRef, PcbPlatedHole } from "circuit-json"
import { milsToMillimeters } from "../geometry"
import { getRotatedHoleOffset } from "./getRotatedHoleOffset"
import { isRectangularShape } from "./isRectangularShape"
import type { ThroughHolePadConversionOptions } from "./types"

export function convertSlottedThroughHolePad({
  cornerRadius,
  geometry,
  height,
  id,
  shape,
  width,
  x,
  y,
}: ThroughHolePadConversionOptions): PcbPlatedHole {
  const holeOffset = getRotatedHoleOffset(geometry)
  const holeCcwRotationDegrees = normalizeAltiumAngle(
    geometry.ccwRotationDegrees + geometry.holeCcwRotationDegrees,
  )
  const holeHeight = milsToMillimeters(Math.max(geometry.holeSizeMils, 1))
  const holeWidth = milsToMillimeters(
    Math.max(geometry.slotLengthMils, geometry.holeSizeMils, 1),
  )
  const layers: LayerRef[] = ["top", "bottom"]

  if (!isRectangularShape(shape)) {
    return {
      type: "pcb_plated_hole",
      pcb_plated_hole_id: `pcb_plated_hole_${id}`,
      shape: "pill",
      outer_width: width,
      outer_height: height,
      hole_width: holeWidth,
      hole_height: holeHeight,
      ccw_rotation: holeCcwRotationDegrees,
      x,
      y,
      layers,
    }
  }

  const isRotated =
    holeCcwRotationDegrees !== 0 || geometry.ccwRotationDegrees !== 0
  if (isRotated) {
    return {
      type: "pcb_plated_hole",
      pcb_plated_hole_id: `pcb_plated_hole_${id}`,
      shape: "rotated_pill_hole_with_rect_pad",
      hole_shape: "rotated_pill",
      pad_shape: "rect",
      hole_width: holeWidth,
      hole_height: holeHeight,
      hole_ccw_rotation: holeCcwRotationDegrees,
      rect_pad_width: width,
      rect_pad_height: height,
      rect_border_radius: cornerRadius,
      rect_ccw_rotation: geometry.ccwRotationDegrees,
      hole_offset_x: milsToMillimeters(holeOffset.x),
      hole_offset_y: milsToMillimeters(holeOffset.y),
      x,
      y,
      layers,
    }
  }

  return {
    type: "pcb_plated_hole",
    pcb_plated_hole_id: `pcb_plated_hole_${id}`,
    shape: "pill_hole_with_rect_pad",
    hole_shape: "pill",
    pad_shape: "rect",
    hole_width: holeWidth,
    hole_height: holeHeight,
    rect_pad_width: width,
    rect_pad_height: height,
    rect_border_radius: cornerRadius,
    hole_offset_x: milsToMillimeters(holeOffset.x),
    hole_offset_y: milsToMillimeters(holeOffset.y),
    x,
    y,
    layers,
  }
}

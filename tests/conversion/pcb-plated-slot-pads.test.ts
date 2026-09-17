import { expect, test } from "bun:test"
import { parseAltiumPcbDoc } from "altiumts"
import { convertAltiumPcbDocToCircuitJson } from "../../lib"

const platedSlotPcbDoc = parseAltiumPcbDoc(
  [
    "|RECORD=Board|SHEETWIDTH=400mil|SHEETHEIGHT=300mil",
    "|RECORD=Pad|NAME=1|LAYER=MULTILAYER|X=100mil|Y=100mil|XSIZE=80mil|YSIZE=220mil|SHAPE=ROUND|HOLESIZE=190mil|HOLETYPE=2|HOLESHAPE=SLOT|SLOTLENGTH=60mil|LAYER0ALTSHAPE=ROUNDRECT|LAYER0CORNERRADIUS=5|ROTATION=180|PLATED=TRUE",
    "|RECORD=Pad|NAME=2|LAYER=MULTILAYER|X=300mil|Y=100mil|XSIZE=190mil|YSIZE=75mil|SHAPE=ROUND|HOLESIZE=50mil|HOLETYPE=2|HOLESHAPE=SLOT|SLOTLENGTH=165mil|LAYER0ALTSHAPE=ROUNDRECT|LAYER0CORNERRADIUS=100|PLATED=TRUE",
    "|RECORD=Pad|NAME=3|LAYER=BOTTOM|X=200mil|Y=200mil|XSIZE=80mil|YSIZE=40mil|BOTTOMXSIZE=80mil|BOTTOMYSIZE=40mil|SHAPE=ROUND|BOTTOMSHAPE=ROUND|LAYER31ALTSHAPE=ROUNDRECT|LAYER31CORNERRADIUS=25|PLATED=TRUE",
  ].join("\n"),
)

test("preserves plated slot dimensions and roundrect pad geometry", () => {
  const circuitJson = convertAltiumPcbDocToCircuitJson(platedSlotPcbDoc)
  const platedHoles = circuitJson.filter(
    (element) => element.type === "pcb_plated_hole",
  )

  expect(platedHoles).toEqual([
    expect.objectContaining({
      shape: "rotated_pill_hole_with_rect_pad",
      hole_width: 1.524,
      hole_height: 4.826,
      hole_ccw_rotation: 0,
      rect_pad_width: 2.032,
      rect_pad_height: 5.588,
      rect_border_radius: 0.0508,
      rect_ccw_rotation: 180,
    }),
    expect.objectContaining({
      shape: "pill_hole_with_rect_pad",
      hole_width: 4.191,
      hole_height: 1.27,
      rect_pad_width: 4.826,
      rect_pad_height: 1.905,
      rect_border_radius: 0.9525,
    }),
  ])

  expect(circuitJson.find((element) => element.type === "pcb_smtpad")).toEqual(
    expect.objectContaining({
      layer: "bottom",
      shape: "rect",
      width: 2.032,
      height: 1.016,
      corner_radius: 0.127,
    }),
  )
})

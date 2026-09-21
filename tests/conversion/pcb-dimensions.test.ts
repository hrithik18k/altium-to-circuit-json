import { expect, test } from "bun:test"
import { parseAltiumPcbDoc } from "altiumts"
import type {
  PcbFabricationNoteDimension,
  PcbFabricationNotePath,
} from "circuit-json"
import { convertAltiumPcbDocToCircuitJson } from "../../lib"

test("imports Altium linear dimensions as fabrication-note dimensions", () => {
  const document = parseAltiumPcbDoc(
    [
      "|RECORD=Board|KIND0=0|VX0=0mil|VY0=0mil|KIND1=0|VX1=500mil|VY1=0mil|KIND2=0|VX2=500mil|VY2=500mil|KIND3=0|VX3=0mil|VY3=500mil|KIND4=0|VX4=0mil|VY4=0mil",
      "|RECORD=Dimension|LAYER=MECHANICAL1|REFERENCES_COUNT=2|REFERENCE0POINTX=100mil|REFERENCE0POINTY=100mil|REFERENCE1POINTX=400mil|REFERENCE1POINTY=100mil|X1=100mil|Y1=200mil|TEXTFORMAT=10mil|TEXTDIMENSIONUNIT=MILLIMETERS|TEXTPRECISION=2|TEXTHEIGHT=40mil|ARROWSIZE=20mil",
    ].join("\n"),
  )

  const dimensions = convertAltiumPcbDocToCircuitJson(document).filter(
    (element): element is PcbFabricationNoteDimension =>
      element.type === "pcb_fabrication_note_dimension",
  )

  expect(dimensions).toHaveLength(1)
  expect(dimensions[0]?.text).toBe("7.62 mm")
  expect(dimensions[0]?.offset_distance).toBeCloseTo(2.54)
  expect(dimensions[0]?.offset_direction?.x).toBeCloseTo(0)
  expect(dimensions[0]?.offset_direction?.y).toBeCloseTo(1)
  expect(dimensions[0]?.arrow_size).toBeCloseTo(0.508)
})

test("imports exploded EasyEDA dimensions as fabrication-note paths", () => {
  const document = parseAltiumPcbDoc(
    [
      "|RECORD=Board|KIND0=0|VX0=0mil|VY0=0mil|KIND1=0|VX1=500mil|VY1=0mil|KIND2=0|VX2=500mil|VY2=500mil|KIND3=0|VX3=0mil|VY3=500mil|KIND4=0|VX4=0mil|VY4=0mil",
      "|RECORD=Component|ID=0|LAYER=MECHANICAL15|X=0mil|Y=0mil|PATTERN=|SOURCEDESIGNATOR=",
      "|RECORD=Track|COMPONENT=0|LAYER=MECHANICAL15|X1=100mil|Y1=200mil|X2=400mil|Y2=200mil|WIDTH=4mil",
    ].join("\n"),
  )

  const paths = convertAltiumPcbDocToCircuitJson(document).filter(
    (element): element is PcbFabricationNotePath =>
      element.type === "pcb_fabrication_note_path",
  )

  expect(paths).toHaveLength(1)
  expect(paths[0]?.route).toEqual([
    { x: 2.54, y: 5.08 },
    { x: 10.16, y: 5.08 },
  ])
  expect(paths[0]?.stroke_width).toBeCloseTo(0.1016)
  expect(paths[0]?.layer).toBe("top")
})

import { expect, test } from "bun:test"
import { parseAltiumPcbDoc, serializeAltiumPcbToSvg } from "altiumts"
import type { PcbPlatedHole } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { convertAltiumPcbDocToCircuitJson } from "../../lib"
import { stackAltiumAndCircuitJsonSvgs } from "../helpers/stack-svg-comparison"

const padOffsetPcbDoc = parseAltiumPcbDoc(
  [
    "|RECORD=Board|VERSION=5.0|KIND0=0|VX0=-400mil|VY0=-400mil|KIND1=0|VX1=400mil|VY1=-400mil|KIND2=0|VX2=400mil|VY2=400mil|KIND3=0|VX3=-400mil|VY3=400mil|KIND4=0|VX4=-400mil|VY4=-400mil",
    "|RECORD=Pad|NAME=1|LAYER=MULTILAYER|X=0mil|Y=0mil|XSIZE=680mil|YSIZE=500mil|HOLESIZE=254mil|SHAPE=RECTANGLE|ROTATION=90|PLATED=TRUE|LAYER0HOLEXOFFSET=-90mil|LAYER0HOLEYOFFSET=0mil",
  ].join("\n"),
)

test("preserves and rotates Altium plated-hole offsets", async () => {
  const circuitJson = convertAltiumPcbDocToCircuitJson(padOffsetPcbDoc)
  const platedHole = circuitJson.find(
    (element): element is PcbPlatedHole => element.type === "pcb_plated_hole",
  )

  expect(platedHole).toMatchObject({
    hole_offset_x: 0,
    hole_offset_y: -2.286,
  })

  const comparisonSvg = stackAltiumAndCircuitJsonSvgs({
    altiumSvg: serializeAltiumPcbToSvg(padOffsetPcbDoc),
    circuitJsonSvg: convertCircuitJsonToPcbSvg(circuitJson),
    label: "Offset plated hole",
  })
  await expect(comparisonSvg).toMatchSvgSnapshot(import.meta.path)
})

import { expect, test } from "bun:test"
import { parseAltiumPcbDoc } from "altiumts"
import { convertAltiumPcbDocToCircuitJson } from "../../lib"

test("detects a via inside an elongated ROUND pad", () => {
  const document = parseAltiumPcbDoc(
    [
      "|RECORD=Board",
      "|RECORD=Net|NAME=GND",
      "|RECORD=Component|ID=0|LAYER=TOP|X=100mil|Y=100mil|SOURCEDESIGNATOR=U1",
      "|RECORD=Pad|NAME=1|COMPONENT=0|NET=0|LAYER=TOP|X=100mil|Y=100mil|XSIZE=100mil|YSIZE=50mil|SHAPE=ROUND",
      "|RECORD=Via|NET=0|X=135mil|Y=120mil|DIAMETER=4mil|HOLESIZE=2mil|STARTLAYER=TOP|ENDLAYER=BOTTOM",
    ].join("\n"),
  )

  const circuitJson = convertAltiumPcbDocToCircuitJson(document)
  const board = circuitJson.find((element) => element.type === "pcb_board")

  expect(board?.is_via_in_pad_allowed).toBe(true)
})

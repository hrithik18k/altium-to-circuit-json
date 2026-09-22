import { expect, test } from "bun:test"
import { parseAltiumPcbDoc } from "altiumts"
import { any_circuit_element } from "circuit-json"
import { convertAltiumPcbDocToCircuitJson } from "../../lib"

test("imports copper-layer KEEPOUT primitives without emitting copper", () => {
  const document = parseAltiumPcbDoc(
    [
      "|RECORD=Board|VERSION=5.0|KIND0=0|VX0=0mil|VY0=0mil|KIND1=0|VX1=500mil|VY1=0mil|KIND2=0|VX2=500mil|VY2=500mil|KIND3=0|VX3=0mil|VY3=500mil|KIND4=0|VX4=0mil|VY4=0mil",
      "|RECORD=Arc|LAYER=TOP|KEEPOUT=TRUE|LOCATION.X=100mil|LOCATION.Y=100mil|RADIUS=25mil|STARTANGLE=0|ENDANGLE=0|WIDTH=10mil",
      "|RECORD=Fill|LAYER=MID-LAYER1|KEEPOUT=TRUE|X1=200mil|Y1=200mil|X2=300mil|Y2=250mil|ROTATION=0",
      "|RECORD=Track|LAYER=TOP|KEEPOUT=TRUE|X1=50mil|Y1=400mil|X2=450mil|Y2=400mil|WIDTH=10mil",
      "|RECORD=Track|LAYER=TOP|X1=50mil|Y1=450mil|X2=450mil|Y2=450mil|WIDTH=10mil",
    ].join("\n"),
  )

  const circuitJson = convertAltiumPcbDocToCircuitJson(document)
  const keepouts = circuitJson.filter(
    (element) => element.type === "pcb_keepout",
  )
  const traces = circuitJson.filter((element) => element.type === "pcb_trace")
  const pours = circuitJson.filter(
    (element) => element.type === "pcb_copper_pour",
  )

  expect(keepouts).toMatchObject([
    {
      pcb_keepout_id: "pcb_keepout_1",
      shape: "circle",
      center: { x: 2.54, y: 2.54 },
      radius: 0.762,
      layers: ["top"],
    },
    {
      pcb_keepout_id: "pcb_keepout_2",
      shape: "rect",
      center: { x: 6.35, y: 5.715 },
      width: 2.54,
      height: 1.27,
      layers: ["inner1"],
    },
  ])
  expect(traces).toHaveLength(1)
  expect(pours).toHaveLength(0)
  expect(
    circuitJson.every(
      (element) => any_circuit_element.safeParse(element).success,
    ),
  ).toBe(true)
})

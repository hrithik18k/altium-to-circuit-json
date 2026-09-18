import { expect, test } from "bun:test"
import { parseAltiumPcbDoc } from "altiumts"
import { any_circuit_element } from "circuit-json"
import { convertAltiumPcbDocToCircuitJson } from "../../lib"

const arcGeometry =
  "LOCATION.X=100mil|LOCATION.Y=200mil|RADIUS=50mil|STARTANGLE=350|ENDANGLE=10|WIDTH=8mil"

test.each([
  ["TOP", "top"],
  ["BOTTOM", "bottom"],
  ["MID1", "inner1"],
] as const)("converts wrapped copper arcs on %s", (altiumLayer, layer) => {
  const document = parseAltiumPcbDoc(
    `|RECORD=Board|VERSION=5.0\n|RECORD=Arc|LAYER=${altiumLayer}|${arcGeometry}`,
  )
  const circuitJson = convertAltiumPcbDocToCircuitJson(document)
  const traces = circuitJson.filter((element) => element.type === "pcb_trace")

  expect(traces).toHaveLength(1)
  const trace = traces[0]!
  expect(any_circuit_element.safeParse(trace).success).toBe(true)
  expect(trace.route.length).toBeGreaterThan(2)
  for (const point of trace.route) {
    expect(point.route_type).toBe("wire")
    if (point.route_type !== "wire") throw new Error("Expected wire point")
    expect(point.layer).toBe(layer)
    expect(point.width).toBeCloseTo(0.2032)
    expect(Math.hypot(point.x - 2.54, point.y - 5.08)).toBeCloseTo(1.27)
    // A 350-to-10-degree sweep stays to the right of the center.
    expect(point.x).toBeGreaterThan(3.79)
  }
  const wirePoints = trace.route.filter((point) => point.route_type === "wire")
  expect(wirePoints[0]!.y).toBeCloseTo(4.859466814)
  expect(wirePoints.at(-1)!.y).toBeCloseTo(5.300533186)
})

test("preserves copper text alongside arcs and independent visibility options", () => {
  const document = parseAltiumPcbDoc(
    [
      "|RECORD=Board|VERSION=5.0",
      `|RECORD=Arc|LAYER=TOP|${arcGeometry}`,
      `|RECORD=Arc|LAYER=TOPOVERLAY|${arcGeometry}`,
      `|RECORD=Arc|LAYER=MECHANICAL15|${arcGeometry}`,
      `|RECORD=Arc|LAYER=KEEPOUT|${arcGeometry}`,
      "|RECORD=Text|LAYER=TOP|X=100mil|Y=200mil|TEXT=Copper label|HEIGHT=30mil",
      "|RECORD=Text|LAYER=TOPOVERLAY|X=100mil|Y=200mil|TEXT=Silkscreen label|HEIGHT=30mil",
    ].join("\n"),
  )
  const circuitJson = convertAltiumPcbDocToCircuitJson(document)
  expect(circuitJson.map((element) => element.type)).toEqual([
    "pcb_board",
    "pcb_trace",
    "pcb_silkscreen_path",
    "pcb_copper_text",
    "pcb_silkscreen_text",
  ])
  expect(
    circuitJson.find((element) => element.type === "pcb_copper_text"),
  ).toMatchObject({ text: "Copper label", layer: "top" })

  const withoutTraces = convertAltiumPcbDocToCircuitJson(document, {
    includeTraces: false,
  })
  expect(withoutTraces.map((element) => element.type)).toEqual([
    "pcb_board",
    "pcb_silkscreen_path",
    "pcb_copper_text",
    "pcb_silkscreen_text",
  ])

  const withoutSilkscreen = convertAltiumPcbDocToCircuitJson(document, {
    includeSilkscreen: false,
  })
  expect(withoutSilkscreen.map((element) => element.type)).toEqual([
    "pcb_board",
    "pcb_trace",
    "pcb_copper_text",
  ])
})

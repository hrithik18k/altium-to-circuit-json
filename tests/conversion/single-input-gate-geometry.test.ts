import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import { any_circuit_element, type SchematicLine } from "circuit-json"
import {
  applyToPoint,
  compose,
  rotateDEG,
  translate,
} from "transformation-matrix"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { hasTriangularLineBody } from "../../lib/schematic/components/hasTriangularLineBody"

test.each([
  [0, false],
  [1, false],
  [2, false],
  [3, false],
  [0, true],
  [1, true],
  [2, true],
  [3, true],
] as const)(
  "keeps a rotated gate's pins attached (turns=%s, inverted=%s)",
  (turns, inverted) => {
    const localToSheet = compose(translate(100, 100), rotateDEG(turns * 90))
    const input = applyToPoint(localToSheet, { x: 0, y: 0 })
    const output = applyToPoint(localToSheet, { x: 20, y: 0 })
    const terminal = applyToPoint(localToSheet, { x: 30, y: 0 })
    const wireEnd = applyToPoint(localToSheet, { x: 40, y: 0 })
    const bodyLines = (
      [
        [
          { x: 0, y: -10 },
          { x: 0, y: 10 },
        ],
        [
          { x: 0, y: 10 },
          { x: 20, y: 0 },
        ],
        [
          { x: 0, y: -10 },
          { x: 20, y: 0 },
        ],
      ] as const
    ).map(([start, end]) => {
      const first = applyToPoint(localToSheet, start)
      const last = applyToPoint(localToSheet, end)
      return `|RECORD=13|OWNERINDEX=1|OWNERPARTID=1|LOCATION.X=${first.x}|LOCATION.Y=${first.y}|CORNER.X=${last.x}|CORNER.Y=${last.y}`
    })
    const document = parseAltiumSchDoc(
      [
        "|RECORD=31|CUSTOMX=200|CUSTOMY=200",
        "|RECORD=1|LIBREFERENCE=SingleInputGate|CURRENTPARTID=1",
        ...bodyLines,
        `|RECORD=2|OWNERINDEX=1|OWNERPARTID=1|PINCONGLOMERATE=${48 + ((turns + 2) % 4)}|PINLENGTH=10|LOCATION.X=${input.x}|LOCATION.Y=${input.y}|NAME=A|DESIGNATOR=1|COLOR=16711680`,
        `|RECORD=2|OWNERINDEX=1|OWNERPARTID=1|PINCONGLOMERATE=${48 + turns}|PINLENGTH=10|LOCATION.X=${output.x}|LOCATION.Y=${output.y}|NAME=Y|DESIGNATOR=2|SYMBOL_OUTEREDGE=${inverted ? 1 : 0}|COLOR=16711680`,
        `|RECORD=27|LOCATIONCOUNT=2|X1=${terminal.x}|Y1=${terminal.y}|X2=${wireEnd.x}|Y2=${wireEnd.y}`,
      ].join("\n"),
    )
    const circuitJson = convertAltiumSchDocToCircuitJson(document, {
      centerOnSchematicSheet: false,
      schematicUnitScale: 1,
    })
    expect(
      circuitJson.find((element) => element.type === "schematic_component"),
    ).toMatchObject({ is_box_with_pins: false })
    const port = circuitJson.find(
      (element) =>
        element.type === "schematic_port" && element.pin_number === 2,
    )
    if (port?.type !== "schematic_port") throw new Error("Missing output pin")
    expect(port.center.x).toBeCloseTo(terminal.x)
    expect(port.center.y).toBeCloseTo(terminal.y)
    expect(port.is_connected).toBe(true)
    const label = circuitJson.find(
      (element) =>
        element.type === "schematic_text" &&
        element.schematic_text_id === "schematic_pin_designator_altium_6",
    )
    if (label?.type !== "schematic_text") throw new Error("Missing pin number")
    const labelPosition = applyToPoint(localToSheet, { x: 29, y: 0 })
    expect(label.position.x).toBeCloseTo(labelPosition.x)
    expect(label.position.y).toBeCloseTo(labelPosition.y)
    expect(label.color).toBe("#0f0f0f")
    const pinLines = circuitJson.filter(
      (element): element is SchematicLine =>
        element.type === "schematic_line" &&
        element.schematic_line_id.endsWith("_pin"),
    )
    expect(pinLines).toHaveLength(2)
    expect(pinLines.every((line) => line.color === "#840000")).toBe(true)
    expect(
      circuitJson.find((element) => element.type === "source_trace"),
    ).toMatchObject({ connected_source_port_ids: [port.source_port_id] })
    const circles = circuitJson.filter(
      (element) => element.type === "schematic_circle",
    )
    expect(circles).toHaveLength(inverted ? 1 : 0)
    if (inverted) {
      const center = applyToPoint(localToSheet, { x: 22.5, y: 0 })
      expect(circles[0]?.center.x).toBeCloseTo(center.x)
      expect(circles[0]?.center.y).toBeCloseTo(center.y)
      expect(circles[0]?.radius).toBe(2.5)
      expect(circles[0]).toMatchObject({
        color: "#840000",
        fill_color: "#ffffff",
        is_filled: true,
      })
      const stem = circuitJson.find(
        (element) =>
          element.type === "schematic_line" &&
          element.schematic_line_id === "schematic_line_altium_6_pin",
      )
      if (stem?.type !== "schematic_line")
        throw new Error("Missing output stem")
      const start = applyToPoint(localToSheet, { x: 25, y: 0 })
      expect(stem.x1).toBeCloseTo(start.x)
      expect(stem.y1).toBeCloseTo(start.y)
      expect(stem.x2).toBeCloseTo(terminal.x)
      expect(stem.y2).toBeCloseTo(terminal.y)
    }
    expect(
      circuitJson.every(
        (element) => any_circuit_element.safeParse(element).success,
      ),
    ).toBe(true)
  },
)

test("does not mistake open or collinear lines for a triangular body", () => {
  for (const source of [
    "|RECORD=13|LOCATION.X=0|LOCATION.Y=0|CORNER.X=10|CORNER.Y=10\n|RECORD=13|LOCATION.X=10|LOCATION.Y=10|CORNER.X=10|CORNER.Y=0",
    "|RECORD=13|LOCATION.X=0|LOCATION.Y=0|CORNER.X=10|CORNER.Y=0\n|RECORD=13|LOCATION.X=10|LOCATION.Y=0|CORNER.X=20|CORNER.Y=0\n|RECORD=13|LOCATION.X=20|LOCATION.Y=0|CORNER.X=0|CORNER.Y=0",
  ]) {
    expect(
      hasTriangularLineBody(parseAltiumSchDoc(`|RECORD=31\n${source}`).records),
    ).toBe(false)
  }
})

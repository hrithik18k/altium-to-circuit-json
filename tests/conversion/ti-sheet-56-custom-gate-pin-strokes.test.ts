import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import type {
  AnyCircuitElement,
  SchematicComponent,
  SchematicLine,
} from "circuit-json"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { TI_TMDS62LEVM_FIXTURE_NAME } from "../../scripts/references/reference-manifest"
import { readReferenceBytes } from "../helpers/read-reference"

type SourceComponent = Extract<AnyCircuitElement, { type: "source_component" }>

test("matches custom gate pin and body strokes on TI sheet 56", async () => {
  const source = await readReferenceBytes(
    `${TI_TMDS62LEVM_FIXTURE_NAME}/56.SchDoc`,
  )
  const circuitJson = convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(source),
  )
  const gateSourceIds = new Set(
    circuitJson.flatMap((element) =>
      element.type === "source_component" &&
      (element.name === "U83" || element.name === "U86")
        ? [(element as SourceComponent).source_component_id]
        : [],
    ),
  )
  const gates = circuitJson.filter(
    (element): element is SchematicComponent =>
      element.type === "schematic_component" &&
      element.source_component_id !== undefined &&
      gateSourceIds.has(element.source_component_id),
  )

  expect(gates).toHaveLength(2)
  for (const gate of gates) {
    const pinLines = circuitJson.filter(
      (element): element is SchematicLine =>
        element.type === "schematic_line" &&
        element.schematic_component_id === gate.schematic_component_id &&
        element.schematic_line_id.endsWith("_pin"),
    )
    const bodyLines = circuitJson.filter(
      (element) =>
        element.type === "schematic_rect" &&
        element.schematic_component_id === gate.schematic_component_id &&
        element.schematic_rect_id.startsWith("compatibility_frame_"),
    )

    expect(pinLines).toHaveLength(5)
    expect(bodyLines.length).toBeGreaterThan(0)
    expect(new Set(pinLines.map((line) => line.stroke_width))).toEqual(
      new Set(
        bodyLines.map((line) =>
          line.type === "schematic_rect" ? line.stroke_width : undefined,
        ),
      ),
    )
  }
})

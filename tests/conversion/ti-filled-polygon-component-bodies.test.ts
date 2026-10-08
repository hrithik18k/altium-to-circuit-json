import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { readReferenceBytes } from "../helpers/read-reference"

type SourceComponent = Extract<AnyCircuitElement, { type: "source_component" }>
type SchematicComponent = Extract<
  AnyCircuitElement,
  { type: "schematic_component" }
>

test("preserves filled-polygon custom bodies for LM5155 U3 and D4", async () => {
  const document = parseAltiumSchDoc(
    await readReferenceBytes("ti-lm5155evm-fly.SchDoc"),
  )
  const elements = convertAltiumSchDocToCircuitJson(document, {
    centerOnSchematicSheet: false,
    schematicUnitScale: 0.05,
  })

  for (const [name, minimumPaths] of [
    ["U3", 4],
    ["D4", 6],
  ] as const) {
    const source = elements.find(
      (element): element is SourceComponent =>
        element.type === "source_component" && element.name === name,
    )
    const component = elements.find(
      (element): element is SchematicComponent =>
        element.type === "schematic_component" &&
        element.source_component_id === source?.source_component_id,
    )
    expect(component?.is_box_with_pins, name).toBe(false)
    expect(component?.symbol_name).toBeUndefined()
    const bodyPaths = elements.filter(
      (element) =>
        element.type === "schematic_path" &&
        element.schematic_component_id === component?.schematic_component_id,
    )
    expect(bodyPaths.length).toBeGreaterThanOrEqual(minimumPaths)
  }
})

test("preserves filled-polygon potentiometers on LMG342X", async () => {
  const document = parseAltiumSchDoc(
    await readReferenceBytes("ti-lmg342x-bb-evm.SchDoc"),
  )
  const elements = convertAltiumSchDocToCircuitJson(document, {
    centerOnSchematicSheet: false,
    schematicUnitScale: 0.05,
  })

  for (const name of ["R3", "R15"]) {
    const source = elements.find(
      (element): element is SourceComponent =>
        element.type === "source_component" && element.name === name,
    )
    const component = elements.find(
      (element): element is SchematicComponent =>
        element.type === "schematic_component" &&
        element.source_component_id === source?.source_component_id,
    )
    expect(component?.is_box_with_pins, name).toBe(false)
    expect(
      elements.some(
        (element) =>
          element.type === "schematic_path" &&
          element.schematic_component_id === component?.schematic_component_id,
      ),
    ).toBe(true)
  }
})

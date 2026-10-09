import { expect, test } from "bun:test"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { parseAltiumSchDoc } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import {
  convertAltiumSchDocToCircuitJson,
  convertAltiumToCircuitJson,
} from "../../lib"
import { convertSingleSchematicComponent } from "../helpers/convert-single-schematic-component"
import { readReferenceBytes } from "../helpers/read-reference"

type SourceComponent = Extract<AnyCircuitElement, { type: "source_component" }>
type SchematicComponent = Extract<
  AnyCircuitElement,
  { type: "schematic_component" }
>

function expectSchottkySymbol(
  elements: AnyCircuitElement[],
  name: string,
  direction: string,
): void {
  const source = elements.find(
    (element): element is SourceComponent =>
      element.type === "source_component" && element.name === name,
  )
  const component = elements.find(
    (element): element is SchematicComponent =>
      element.type === "schematic_component" &&
      element.source_component_id === source?.source_component_id,
  )
  expect(component?.symbol_name).toBe(`schottky_diode_${direction}`)
  expect(
    elements.filter(
      (element) =>
        element.type === "schematic_port" &&
        element.schematic_component_id === component?.schematic_component_id,
    ),
  ).toHaveLength(2)
}

test("uses Schottky symbols for DRV8307 D7 and D8 from their descriptions", async () => {
  const source = await readReferenceBytes("ti-drv8307evm.SchDoc")
  const elements = convertAltiumSchDocToCircuitJson(parseAltiumSchDoc(source), {
    centerOnSchematicSheet: false,
    schematicUnitScale: 0.05,
  })
  expectSchottkySymbol(elements, "D7", "up")
  expectSchottkySymbol(elements, "D8", "down")
})

test("uses Schottky symbols for Arduino D5 and D6 from their descriptions", async () => {
  const source = new Uint8Array(
    await readFile(resolve(import.meta.dir, "../fixtures/arduino-uno.SchDoc")),
  )
  const elements = convertAltiumToCircuitJson(source, {
    sourceType: "schematic",
    schematic: {
      documentName: "arduino-uno.SchDoc",
      sheetName: "Arduino Uno",
    },
  })
  expectSchottkySymbol(elements, "D5", "up")
  expectSchottkySymbol(elements, "D6", "up")
})

test("retains library-reference detection and ordinary diode fallback", () => {
  const schottky = convertSingleSchematicComponent({
    comment: "",
    designator: "D1",
    displayText: "10V",
    libraryReference: "DIODE_SCHOTTKY",
  })
  const ordinary = convertSingleSchematicComponent({
    comment: "",
    designator: "D1",
    displayText: "10V",
    libraryReference: "DIODE_RECTIFIER",
  })
  expect(
    schottky.find((element) => element.type === "schematic_component")
      ?.symbol_name,
  ).toMatch(/^schottky_diode_/u)
  expect(
    ordinary.find((element) => element.type === "schematic_component")
      ?.symbol_name,
  ).toMatch(/^diode_/u)
})

import { expect, test } from "bun:test"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { parseAltiumSchDoc, serializeAltiumSheetToSvg } from "altiumts"
import { convertAltiumToCircuitJson } from "../../lib"
import { expectValidImportedSchematic } from "../helpers/expect-valid-imported-schematic"
import { renderImportedSchematicToSvg } from "../helpers/render-imported-schematic"
import { stackAltiumAndCircuitJsonSvgs } from "../helpers/stack-svg-comparison"

const filename = "arduino-uno.SchDoc"
const source = new Uint8Array(
  await readFile(resolve(import.meta.dir, "../fixtures", filename)),
)
const circuitJson = convertAltiumToCircuitJson(source, {
  sourceType: "schematic",
  schematic: { documentName: filename, sheetName: "Arduino Uno" },
})

test("uses native C1 and C2 polarized symbols with connected terminals", () => {
  for (const name of ["C1", "C2"]) {
    const sourceComponent = circuitJson.find(
      (e) => e.type === "source_component" && e.name === name,
    )
    if (sourceComponent?.type !== "source_component")
      throw new Error(`Missing ${name}`)
    const component = circuitJson.find(
      (e) =>
        e.type === "schematic_component" &&
        e.source_component_id === sourceComponent.source_component_id,
    )
    if (component?.type !== "schematic_component")
      throw new Error(`Missing ${name} symbol`)
    expect(component.symbol_name).toBe("capacitor_polarized_down")
    const owned = circuitJson.filter(
      (e) =>
        "schematic_component_id" in e &&
        e.schematic_component_id === component.schematic_component_id,
    )
    expect(
      owned.filter((e) => e.type === "schematic_text" && e.text === "+"),
    ).toHaveLength(0)
    expect(
      owned.filter((e) => e.type === "schematic_path" && e.points.length > 4),
    ).toHaveLength(0)
    const ports = owned.filter((e) => e.type === "schematic_port")
    expect(ports).toHaveLength(2)
    for (const port of ports) {
      expect(
        circuitJson.some(
          (e) =>
            e.type === "source_trace" &&
            e.connected_source_port_ids.includes(port.source_port_id ?? ""),
        ),
      ).toBe(true)
    }
  }
})

test("Arduino Uno full schematic source and conversion", async () => {
  const circuitJsonSvg = renderImportedSchematicToSvg(circuitJson)
  const comparisonSvg = stackAltiumAndCircuitJsonSvgs({
    altiumSvg: serializeAltiumSheetToSvg(parseAltiumSchDoc(source), {
      documentName: filename,
      height: 600,
      width: 800,
      title: "altiumts source rendering",
    }),
    circuitJsonSvg,
    label: "Arduino Uno schematic",
  })
  expectValidImportedSchematic({ circuitJson, circuitJsonSvg })
  await expect(comparisonSvg).toMatchSvgSnapshot(import.meta.path)
})

test("preserves all six Arduino circular component bodies", () => {
  for (const name of ["MH1", "MH2", "MH3", "MH4", "J8", "J9"]) {
    const sourceComponent = circuitJson
      .filter((element) => element.type === "source_component")
      .find((element) => element.name === name)
    const component = circuitJson
      .filter((element) => element.type === "schematic_component")
      .find(
        (element) =>
          element.source_component_id === sourceComponent?.source_component_id,
      )
    expect(component?.is_box_with_pins).toBe(false)
    expect(
      circuitJson.filter(
        (element) =>
          element.type === "schematic_circle" &&
          element.schematic_component_id === component?.schematic_component_id,
      ),
    ).toHaveLength(1)
  }
})

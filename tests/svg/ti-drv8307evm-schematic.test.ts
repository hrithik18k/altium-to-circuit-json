import { expect, test } from "bun:test"
import { classifyComponent } from "../../lib/schematic/symbols/classifyComponent"
import { TI_EVM_REFERENCE_FILENAMES } from "../../scripts/references/reference-manifest"
import { createOpenSourceSchematicComparison } from "../helpers/create-open-source-schematic-comparison"
import { expectValidImportedSchematic } from "../helpers/expect-valid-imported-schematic"

test(
  "TI DRV8307EVM schematic: Altium SVG beside Circuit JSON SVG",
  async () => {
    const { circuitJson, circuitJsonSvg, comparisonSvg } =
      await createOpenSourceSchematicComparison({
        filename: TI_EVM_REFERENCE_FILENAMES.drv8307Evm.schematic,
        projectFilename: TI_EVM_REFERENCE_FILENAMES.drv8307Evm.project,
        schematicName: "TI DRV8307EVM",
      })

    expectValidImportedSchematic({ circuitJson, circuitJsonSvg })
    for (const name of ["D3", "D4"]) {
      const sourceComponent = circuitJson
        .filter((element) => element.type === "source_component")
        .find((element) => element.name === name)
      const component = circuitJson
        .filter((element) => element.type === "schematic_component")
        .find(
          (element) =>
            element.source_component_id ===
            sourceComponent?.source_component_id,
        )
      expect(sourceComponent?.ftype).toBe("simple_led")
      expect(component?.symbol_name).toBeUndefined()
      expect(component?.is_box_with_pins).toBe(false)
      expect(
        circuitJson.filter(
          (element) =>
            element.type === "schematic_path" &&
            element.schematic_component_id ===
              component?.schematic_component_id,
        ).length,
      ).toBeGreaterThan(3)
      expect(
        circuitJson.filter(
          (element) =>
            element.type === "schematic_port" &&
            element.schematic_component_id ===
              component?.schematic_component_id,
        ),
      ).toHaveLength(2)
    }
    await expect(comparisonSvg).toMatchSvgSnapshot(import.meta.path)
  },
  { timeout: 120_000 },
)

test.each([
  ["D1", "LED SMARTLED GREEN 570NM 0603", "led"],
  ["D1", "  led orange 0603", "led"],
  ["D1", "Light-emitting diode, green", "led"],
  ["D1", "DIODE SCHOTTKY 30V 0.2A SOD323", "diode"],
  ["D1", "DIODE for LED protection", "diode"],
  ["D1", "LED driver protection diode", "diode"],
  ["D1", "LED controller protection diode", "diode"],
  ["D1", "", "diode"],
  ["R1", "LED current-limiting resistor", "resistor"],
  ["U1", "LED driver IC", "unknown"],
] as const)(
  "classifies %s with description %s as %s",
  (designator, description, expected) => {
    expect(
      classifyComponent({
        designator,
        description,
        libraryReference: "manufacturer-part-number",
      }),
    ).toBe(expected)
  },
)

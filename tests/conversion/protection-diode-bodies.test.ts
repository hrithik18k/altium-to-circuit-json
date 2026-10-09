import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { isProtectionDiode } from "../../lib/schematic/symbols/isProtectionDiode"
import { readReferenceBytes } from "../helpers/read-reference"

test.each([
  ["Diode_TVS_Uni", "", true],
  ["ManufacturerPart", "Diode, Zener, 10 V", true],
  ["ManufacturerPart", "Transient voltage suppressor", true],
  ["DIODE", "ordinary diode", false],
  ["DIODE", "Schottky diode", false],
  ["TVSdriver", "", false],
])(
  "recognizes protection metadata: %s",
  (libraryReference, description, expected) => {
    expect(
      isProtectionDiode({
        libraryReference: String(libraryReference),
        description: String(description),
      }),
    ).toBe(expected)
  },
)

test("LM251772 retains Zener and TVS bodies and connected terminals", async () => {
  const source = await readReferenceBytes("ti-lm251772evm-pd.SchDoc")
  const elements = convertAltiumSchDocToCircuitJson(parseAltiumSchDoc(source))
  for (const name of ["D2", "D3", "D4"]) {
    const sourceComponent = elements
      .filter((e) => e.type === "source_component")
      .find((e) => e.name === name)
    const component = elements
      .filter((e) => e.type === "schematic_component")
      .find(
        (e) => e.source_component_id === sourceComponent?.source_component_id,
      )
    expect(component).toMatchObject({ is_box_with_pins: false })
    expect(component?.symbol_name).toBeUndefined()
    const paths = elements
      .filter((e) => e.type === "schematic_path")
      .filter(
        (e) => e.schematic_component_id === component?.schematic_component_id,
      )
    expect(paths.some((path) => path.is_filled)).toBe(true)
    // Cathode strokes include bends rather than a plain two-point bar.
    expect(
      paths.some(
        (path) =>
          !path.is_filled &&
          path.points.some(
            (point, index) =>
              index > 0 &&
              point.x !== path.points[index - 1]?.x &&
              point.y !== path.points[index - 1]?.y,
          ),
      ),
    ).toBe(true)
    const ports = elements
      .filter((e) => e.type === "schematic_port")
      .filter(
        (e) => e.schematic_component_id === component?.schematic_component_id,
      )
    expect(ports).toHaveLength(2)
    expect(ports.every((port) => port.is_connected)).toBe(true)
    expect(ports.map((port) => port.pin_number).sort()).toEqual([1, 2])
  }
}, 120_000)

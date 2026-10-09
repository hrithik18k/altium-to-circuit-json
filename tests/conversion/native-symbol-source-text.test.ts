import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { readReferenceBytes } from "../helpers/read-reference"

test.each([true, false])(
  "preserves capacitor-bank source text with includeText=%s",
  async (includeText) => {
    const source = await readReferenceBytes("ti-lm251772evm-pd.SchDoc")
    const elements = convertAltiumSchDocToCircuitJson(
      parseAltiumSchDoc(source),
      { centerOnSchematicSheet: false, schematicUnitScale: 1, includeText },
    )
    const sourceComponent = elements
      .filter((e) => e.type === "source_component")
      .find((e) => e.name === "C5")
    const component = elements
      .filter((e) => e.type === "schematic_component")
      .find(
        (e) => e.source_component_id === sourceComponent?.source_component_id,
      )
    expect(component?.symbol_name).toBeUndefined()
    expect(component?.is_box_with_pins).toBe(false)
    const paths = elements.filter(
      (e) =>
        e.type === "schematic_path" &&
        e.schematic_component_id === component?.schematic_component_id,
    )
    expect(paths).toHaveLength(4)
    expect(
      paths.every(
        (path) =>
          path.type === "schematic_path" &&
          path.schematic_path_id.includes("_native_"),
      ),
    ).toBe(true)
    const text = elements
      .filter((e) => e.type === "schematic_text")
      .filter(
        (e) => e.schematic_component_id === component?.schematic_component_id,
      )
    expect(
      text.map((e) => ({
        text: e.text,
        position: e.position,
        font_size: e.font_size,
        rotation: e.rotation,
        anchor: e.anchor,
        color: e.color,
      })),
    ).toEqual(
      includeText
        ? [
            {
              text: "100V",
              position: { x: 1579, y: 1062 },
              font_size: 10,
              rotation: 0,
              anchor: "bottom_left",
              color: "#000000",
            },
            {
              text: "10uF",
              position: { x: 1579, y: 1052 },
              font_size: 10,
              rotation: 0,
              anchor: "bottom_left",
              color: "#000000",
            },
            {
              text: "C5",
              position: { x: 1579, y: 1072 },
              font_size: 10,
              rotation: 0,
              anchor: "bottom_left",
              color: "#000000",
            },
          ]
        : [],
    )
    const ports = elements
      .filter((e) => e.type === "schematic_port")
      .filter(
        (e) => e.schematic_component_id === component?.schematic_component_id,
      )
    expect(ports).toHaveLength(2)
    expect(ports.every((port) => port.is_connected)).toBe(true)
  },
  120_000,
)

import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import type {
  AnyCircuitElement,
  SchematicComponent,
  SchematicPath,
  SchematicPort,
} from "circuit-json"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { hasCompleteLedBody } from "../../lib/schematic/components/hasCompleteLedBody"
import { readReferenceBytes } from "../helpers/read-reference"

test.each([true, false])(
  "preserves opposite LED arrow layouts with includeText=%s",
  async (includeText) => {
    const source = await readReferenceBytes("ti-tmds62levm-rev-b/13.SchDoc")
    const elements = convertAltiumSchDocToCircuitJson(
      parseAltiumSchDoc(source),
      {
        centerOnSchematicSheet: false,
        schematicUnitScale: 1,
        includeText,
      },
    )
    for (const { name, axis, tips } of [
      {
        name: "LD5",
        axis: 400,
        tips: [
          { x: 390, y: 424 },
          { x: 390, y: 430 },
        ],
      },
      {
        name: "LD8",
        axis: 820,
        tips: [
          { x: 830, y: 374 },
          { x: 830, y: 380 },
        ],
      },
    ]) {
      const sourceComponent = elements.find(
        (e): e is Extract<AnyCircuitElement, { type: "source_component" }> =>
          e.type === "source_component" && e.name === name,
      )
      const component = elements.find(
        (e): e is SchematicComponent =>
          e.type === "schematic_component" &&
          e.source_component_id === sourceComponent?.source_component_id,
      )
      expect(component).toMatchObject({ is_box_with_pins: false })
      expect(component).not.toHaveProperty("symbol_name")
      const paths = elements.filter(
        (e): e is SchematicPath =>
          e.type === "schematic_path" &&
          e.schematic_component_id === component?.schematic_component_id,
      )
      expect(paths).toHaveLength(3)
      const body = elements.filter(
        (element) =>
          "schematic_component_id" in element &&
          element.schematic_component_id === component?.schematic_component_id,
      )
      expect(hasCompleteLedBody(body)).toBe(true)
      expect(
        hasCompleteLedBody(
          body.filter(
            (element) =>
              element.type !== "schematic_path" || !element.is_filled,
          ),
        ),
      ).toBe(false)
      expect(
        hasCompleteLedBody(
          body.filter(
            (element) =>
              element.type !== "schematic_line" &&
              (element.type !== "schematic_path" || element.is_filled),
          ),
        ),
      ).toBe(false)
      expect(
        hasCompleteLedBody(
          body.filter(
            (element) =>
              element.type !== "schematic_path" ||
              !element.is_filled ||
              element.points.some((point) => point.x === axis),
          ),
        ),
      ).toBe(false)
      for (const tip of tips) {
        const arrow = paths.find((path) =>
          path.points.some((point) => point.x === tip.x && point.y === tip.y),
        )
        expect(arrow?.is_filled).toBe(true)
        expect(
          arrow?.points.every((point) =>
            name === "LD5" ? point.x < axis : point.x > axis,
          ),
        ).toBe(true)
      }
      const ports = elements.filter(
        (e): e is SchematicPort =>
          e.type === "schematic_port" &&
          e.schematic_component_id === component?.schematic_component_id,
      )
      expect(ports).toHaveLength(2)
      expect(ports.every((port) => port.is_connected)).toBe(true)
    }
  },
  120_000,
)

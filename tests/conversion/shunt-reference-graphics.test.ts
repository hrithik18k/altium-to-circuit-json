import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import type { AnyCircuitElement, SchematicComponent } from "circuit-json"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { readReferenceBytes } from "../helpers/read-reference"

type SourceComponent = Extract<AnyCircuitElement, { type: "source_component" }>

test.each([true, false])(
  "preserves LM5155 U3's shunt-reference body and connected pins with includeText=%s",
  async (includeText) => {
    const elements = convertAltiumSchDocToCircuitJson(
      parseAltiumSchDoc(await readReferenceBytes("ti-lm5155evm-fly.SchDoc")),
      {
        schematicUnitScale: 1,
        centerOnSchematicSheet: false,
        includeText,
      },
    )
    const source = elements.find(
      (element): element is SourceComponent =>
        element.type === "source_component" && element.name === "U3",
    )
    const component = elements.find(
      (element): element is SchematicComponent =>
        element.type === "schematic_component" &&
        element.source_component_id === source?.source_component_id,
    )
    expect(component).toMatchObject({ is_box_with_pins: false })
    expect(component).not.toHaveProperty("symbol_name")
    const owned = elements.filter(
      (element) =>
        "schematic_component_id" in element &&
        element.schematic_component_id === component?.schematic_component_id,
    )
    const paths = owned.filter((element) => element.type === "schematic_path")
    expect(paths.map((path) => path.points)).toEqual([
      [
        { x: 1257, y: 376 },
        { x: 1250, y: 386 },
        { x: 1243, y: 376 },
      ],
      [
        { x: 1254, y: 380 },
        { x: 1260, y: 380 },
      ],
      [
        { x: 1250, y: 370 },
        { x: 1250, y: 390 },
      ],
      [
        { x: 1257, y: 388 },
        { x: 1255, y: 386 },
        { x: 1245, y: 386 },
        { x: 1243, y: 384 },
      ],
    ])
    expect(paths.filter((path) => path.is_filled)).toHaveLength(1)
    const ports = owned.filter((element) => element.type === "schematic_port")
    expect(ports.map((port) => [port.pin_number, port.center])).toEqual([
      [1, { x: 1270, y: 380 }],
      [2, { x: 1250, y: 400 }],
      [3, { x: 1250, y: 360 }],
    ])
    for (const port of ports) {
      expect(port.is_connected).toBe(true)
      expect(
        elements.some(
          (element) =>
            element.type === "schematic_trace" &&
            element.edges.some(
              (edge) =>
                (edge.from_schematic_port_id === port.schematic_port_id &&
                  edge.from.x === port.center.x &&
                  edge.from.y === port.center.y) ||
                (edge.to_schematic_port_id === port.schematic_port_id &&
                  edge.to.x === port.center.x &&
                  edge.to.y === port.center.y),
            ),
        ),
      ).toBe(true)
    }
    expect(
      owned.some(
        (element) =>
          element.type === "schematic_text" &&
          element.text === "LMV431BIMF/NOPB",
      ),
    ).toBe(includeText)
  },
)

test.each([
  ["a lone polygon and polyline", [7, 6]],
  ["only polylines", [6, 6, 6]],
  ["only polygons", [7, 7, 7]],
])("keeps the box fallback for insufficient body evidence: %s", (_, kinds) => {
  const document = parseAltiumSchDoc(
    [
      "|RECORD=31",
      "|RECORD=1|LibReference=CustomChip|Designator=U1|CurrentPartId=1|Location.X=50|Location.Y=50",
      "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=40|Location.Y=50|Name=1|Designator=1|PinLength=10|Orientation=2",
      ...kinds.map(
        (kind) =>
          `|RECORD=${kind}|OwnerIndex=1|OwnerPartId=1|LocationCount=3|X1=40|Y1=40|X2=50|Y2=60|X3=60|Y3=40`,
      ),
    ].join("\n"),
  )
  const component = convertAltiumSchDocToCircuitJson(document).find(
    (element) => element.type === "schematic_component",
  )
  expect(component).toMatchObject({ is_box_with_pins: true })
})

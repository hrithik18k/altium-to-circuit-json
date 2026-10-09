import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import { convertAltiumSchDocToCircuitJson } from "../../lib"

type SourceComponent = Extract<AnyCircuitElement, { type: "source_component" }>
type SchematicComponent = Extract<
  AnyCircuitElement,
  { type: "schematic_component" }
>
type SourcePort = Extract<AnyCircuitElement, { type: "source_port" }>
type SchematicPort = Extract<AnyCircuitElement, { type: "schematic_port" }>

test.each([
  { leftName: "1", rightName: "2", expectedSymbol: "led_right" },
  { leftName: "K", rightName: "A", expectedSymbol: "led_left" },
  { leftName: "A", rightName: "K", expectedSymbol: "led_right" },
  {
    leftName: "Cathode",
    rightName: "Anode",
    expectedSymbol: "led_left",
  },
])(
  "maps LED terminals by meaning when available: %p",
  ({ leftName, rightName, expectedSymbol }) => {
    const document = parseAltiumSchDoc(
      [
        "|RECORD=31",
        "|RECORD=1|LibReference=LED|Designator=D1|CurrentPartId=1|Location.X=50|Location.Y=50",
        `|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=40|Location.Y=50|Name=${leftName}|Designator=1|PinLength=10|Orientation=2`,
        `|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=60|Location.Y=50|Name=${rightName}|Designator=2|PinLength=10|Orientation=0`,
      ].join("\n"),
    )
    const elements = convertAltiumSchDocToCircuitJson(document, {
      centerOnSchematicSheet: false,
      schematicUnitScale: 1,
    })
    const component = elements.find(
      (element): element is SchematicComponent =>
        element.type === "schematic_component",
    )
    expect(component?.symbol_name).toBe(expectedSymbol)
  },
)

test("Arduino LEDs follow anode and cathode positions despite reversed pin numbers", async () => {
  const source = new Uint8Array(
    await Bun.file(
      new URL("../fixtures/arduino-uno.SchDoc", import.meta.url),
    ).arrayBuffer(),
  )
  const elements = convertAltiumSchDocToCircuitJson(parseAltiumSchDoc(source), {
    centerOnSchematicSheet: false,
    schematicUnitScale: 0.05,
  })

  for (const name of ["D1", "D2", "D3", "D4"]) {
    const sourceComponent = elements.find(
      (element): element is SourceComponent =>
        element.type === "source_component" && element.name === name,
    )
    const component = elements.find(
      (element): element is SchematicComponent =>
        element.type === "schematic_component" &&
        element.source_component_id === sourceComponent?.source_component_id,
    )
    expect(component?.symbol_name).toBeUndefined()
    expect(component?.is_box_with_pins).toBe(false)
    expect(
      elements.filter(
        (element) =>
          element.type === "schematic_path" &&
          element.schematic_component_id === component?.schematic_component_id,
      ).length,
    ).toBeGreaterThanOrEqual(3)

    const sourcePorts = elements.filter(
      (element): element is SourcePort =>
        element.type === "source_port" &&
        element.source_component_id === sourceComponent?.source_component_id,
    )
    const anode = sourcePorts.find(
      (port) => port.name.toLowerCase() === "anode",
    )
    const cathode = sourcePorts.find(
      (port) => port.name.toLowerCase() === "cathode",
    )
    expect(anode?.pin_number).toBe(2)
    expect(cathode?.pin_number).toBe(1)

    const schematicPorts = elements.filter(
      (element): element is SchematicPort =>
        element.type === "schematic_port" &&
        element.schematic_component_id === component?.schematic_component_id,
    )
    const anodePort = schematicPorts.find(
      (port) => port.source_port_id === anode?.source_port_id,
    )
    const cathodePort = schematicPorts.find(
      (port) => port.source_port_id === cathode?.source_port_id,
    )
    expect(anodePort?.pin_number).toBe(2)
    expect(cathodePort?.pin_number).toBe(1)
    expect(anodePort?.is_connected).toBe(true)
    expect(cathodePort?.is_connected).toBe(true)
    expect(cathodePort?.center.y).toBeLessThan(anodePort?.center.y ?? 0)
  }
}, 120_000)

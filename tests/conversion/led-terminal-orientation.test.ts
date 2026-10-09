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
  "matches semantic LED terminals or uses the catalog numeric fallback: %p",
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

test.each([
  "",
  "|RECORD=6|OwnerIndex=1|OwnerPartId=1|LocationCount=2|X1=45|Y1=45|X2=55|Y2=55",
  "|RECORD=7|OwnerIndex=1|OwnerPartId=1|IsSolid=T|LocationCount=3|X1=45|Y1=45|X2=55|Y2=50|X3=45|Y3=55",
])("uses semantic native fallback for incomplete LED geometry: %s", (body) => {
  const document = parseAltiumSchDoc(
    [
      "|RECORD=31",
      "|RECORD=1|LibReference=LED|Designator=D1|CurrentPartId=1|Location.X=50|Location.Y=50",
      "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=40|Location.Y=50|Name=K|Designator=1|PinLength=10|Orientation=2",
      "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=60|Location.Y=50|Name=A|Designator=2|PinLength=10|Orientation=0",
      body,
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
  expect(component?.symbol_name).toBe("led_left")
  expect(
    elements.filter((element) => element.type === "schematic_path"),
  ).toHaveLength(0)
  const sourcePorts = elements.filter(
    (element): element is SourcePort => element.type === "source_port",
  )
  const ports = elements.filter(
    (element): element is SchematicPort => element.type === "schematic_port",
  )
  for (const sourcePort of sourcePorts) {
    const port = ports.find(
      (port) => port.source_port_id === sourcePort.source_port_id,
    )
    expect(port?.pin_number).toBe(sourcePort.pin_number)
  }
  expect(ports.find((port) => port.pin_number === 1)?.center.x).toBeLessThan(
    ports.find((port) => port.pin_number === 2)?.center.x ?? 0,
  )
})

test("preserves numeric-only LED polarity from a complete source body", () => {
  const document = parseAltiumSchDoc(
    [
      "|RECORD=31",
      "|RECORD=1|LibReference=LED|Designator=D1|CurrentPartId=1|Location.X=50|Location.Y=50",
      "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=40|Location.Y=50|Name=1|Designator=1|PinLength=10|Orientation=2",
      "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=60|Location.Y=50|Name=2|Designator=2|PinLength=10|Orientation=0",
      "|RECORD=7|OwnerIndex=1|OwnerPartId=1|IsSolid=T|LocationCount=4|X1=46|Y1=50|X2=55|Y2=45|X3=55|Y3=55|X4=46|Y4=50",
      "|RECORD=6|OwnerIndex=1|OwnerPartId=1|LocationCount=2|X1=46|Y1=45|X2=46|Y2=55",
      "|RECORD=6|OwnerIndex=1|OwnerPartId=1|LocationCount=3|X1=50|Y1=57|X2=54|Y2=61|X3=52|Y3=61",
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
  expect(component?.symbol_name).toBeUndefined()
  const paths = elements.filter((element) => element.type === "schematic_path")
  expect(
    paths.some(
      (path) =>
        !path.is_filled &&
        JSON.stringify(path.points) ===
          JSON.stringify([
            { x: 46, y: 45 },
            { x: 46, y: 55 },
          ]),
    ),
  ).toBe(true)
  const ports = elements.filter(
    (element): element is SchematicPort => element.type === "schematic_port",
  )
  expect(ports.find((port) => port.pin_number === 1)?.center).toEqual({
    x: 30,
    y: 50,
  })
  expect(ports.find((port) => port.pin_number === 2)?.center).toEqual({
    x: 70,
    y: 50,
  })
})

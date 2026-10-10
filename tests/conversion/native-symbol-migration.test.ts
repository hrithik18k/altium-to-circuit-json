import { SYMBOL_CATALOG } from "../../lib/schematic/symbols/constants"
import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import { convertAltiumSchDocToCircuitJson } from "../../lib"

function capacitor(artwork: string) {
  return convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(
      [
        "|RECORD=31",
        "|RECORD=1|LibReference=CAP|Designator=C1|CurrentPartId=1|Location.X=50|Location.Y=50",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=60|Name=2|Designator=2|PinLength=10|Orientation=1",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=40|Name=1|Designator=1|PinLength=10|Orientation=3",
        "|RECORD=4|OwnerIndex=1|OwnerPartId=1|Location.X=52|Location.Y=58|Text=+",
        artwork,
      ].join("\n"),
    ),
    { schematicUnitScale: 1, centerOnSchematicSheet: false },
  )
}

test("polarized capacitor artwork comes from the native catalog, independently of source paths", () => {
  const elements = capacitor(
    "|RECORD=6|OwnerIndex=1|OwnerPartId=1|LocationCount=3|X1=30|Y1=30|X2=60|Y2=80|X3=80|Y3=50",
  )
  expect(elements.filter((e) => e.type === "schematic_path")).toHaveLength(0)
  const component = elements.find((e) => e.type === "schematic_component")
  expect(component).toMatchObject({ symbol_name: "capacitor_polarized_down" })
  expect(component).toEqual(
    capacitor("").find((e) => e.type === "schematic_component"),
  )
  expect(
    elements.filter((e) => e.type === "source_port").map((p) => p.pin_number),
  ).toEqual([2, 1])
})

test.each([
  ["IC 2-input AND gate", "&"],
  ["IC 2-input OR gate", "\u22651"],
])(
  "independent compatibility artwork represents %s without copying body primitives",
  (description, legend) => {
    const input = [
      "|RECORD=31",
      `|RECORD=1|LibReference=LogicDevice|ComponentDescription=${description}|Designator=U1|CurrentPartId=1|Location.X=50|Location.Y=50`,
      "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=40|Location.Y=55|Name=A|Designator=1|PinLength=10|Orientation=2",
      "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=40|Location.Y=45|Name=B|Designator=2|PinLength=10|Orientation=2",
      "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=60|Location.Y=50|Name=Y|Designator=3|PinLength=10|Orientation=0",
      "|RECORD=7|OwnerIndex=1|OwnerPartId=1|IsSolid=T|AreaColor=16711680|LocationCount=3|X1=40|Y1=40|X2=60|Y2=40|X3=50|Y3=60",
    ]
    const elements = convertAltiumSchDocToCircuitJson(
      parseAltiumSchDoc(input.join("\n")),
    )
    expect(elements.filter((e) => e.type === "schematic_path")).toHaveLength(0)
    expect(
      elements.filter(
        (e) =>
          e.type === "schematic_rect" &&
          e.schematic_rect_id.startsWith("compatibility_frame_"),
      ),
    ).toHaveLength(1)
    expect(
      elements.find((e) => e.type === "schematic_text" && e.text === legend),
    ).toMatchObject({ color: "#0f0f0f" })
    expect(
      elements.filter((e) => e.type === "source_port").map((p) => p.name),
    ).toEqual(["A", "B", "Y"])
  },
)

test("LED terminal names override reversed numeric pins in the native catalog", () => {
  const elements = convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(
      [
        "|RECORD=31",
        "|RECORD=1|LibReference=LED|Designator=D1|CurrentPartId=1|Location.X=50|Location.Y=50",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=40|Location.Y=50|Name=K|Designator=1|PinLength=10|Orientation=2",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=60|Location.Y=50|Name=A|Designator=2|PinLength=10|Orientation=0",
      ].join("\n"),
    ),
    { centerOnSchematicSheet: false, schematicUnitScale: 1 },
  )
  expect(elements.find((e) => e.type === "schematic_component")).toMatchObject({
    symbol_name: "led_left",
  })
  expect(
    elements
      .filter((e) => e.type === "source_port")
      .map((p) => [p.name, p.pin_number]),
  ).toEqual([
    ["K", 1],
    ["A", 2],
  ])
})
import { normalizeFunctionalPortLabel } from "../../lib/schematic/symbols/normalizeFunctionalPortLabel"

test("native bipolar transistor terminals use their roles instead of Altium pin numbers", () => {
  const elements = convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(
      [
        "|RECORD=31",
        "|RECORD=1|LibReference=BJT_PNP|Designator=Q1|CurrentPartId=1|Location.X=50|Location.Y=50",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=40|Location.Y=50|Name=B|Designator=1|PinLength=10|Orientation=2",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=40|Name=E|Designator=2|PinLength=10|Orientation=3",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=60|Name=C|Designator=3|PinLength=10|Orientation=1",
      ].join("\n"),
    ),
    { centerOnSchematicSheet: false, schematicUnitScale: 1 },
  )
  const component = elements.find((e) => e.type === "schematic_component")!
  if (component.type !== "schematic_component" || !component.symbol_name)
    throw new Error("Expected native PNP")
  expect(component.symbol_name).toMatch(/^pnp_bipolar_transistor_/)
  const symbol = SYMBOL_CATALOG[component.symbol_name]!
  for (const source of elements.filter((e) => e.type === "source_port")) {
    const role = normalizeFunctionalPortLabel(source.name)
    const expected = symbol.ports.find((p) => p.labels.includes(role!))!
    const actual = elements.find(
      (e) =>
        e.type === "schematic_port" &&
        e.source_port_id === source.source_port_id,
    )
    expect(actual).toMatchObject({
      center: {
        x: component.center.x + expected.x - symbol.center.x,
        y: component.center.y + expected.y - symbol.center.y,
      },
    })
  }
})

test.each(["SPST switch", "SPST normally closed switch"])(
  "selects a native %s without source artwork",
  (description) => {
    const elements = convertAltiumSchDocToCircuitJson(
      parseAltiumSchDoc(
        [
          "|RECORD=31",
          `|RECORD=1|LibReference=Switch|ComponentDescription=${description}|Designator=SW1|CurrentPartId=1|Location.X=50|Location.Y=50`,
          "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=40|Location.Y=50|Name=1|Designator=1|PinLength=10|Orientation=2",
          "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=60|Location.Y=50|Name=2|Designator=2|PinLength=10|Orientation=0",
        ].join("\n"),
      ),
    )
    expect(
      elements.find((e) => e.type === "schematic_component")?.symbol_name,
    ).toMatch(
      description.includes("closed")
        ? /^spst_normally_closed_switch_/
        : /^spst_switch_/,
    )
  },
)

test("does not guess a numeric-only potentiometer's wiper terminal", () => {
  const elements = convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(
      [
        "|RECORD=31",
        "|RECORD=1|LibReference=Potentiometer|Designator=R1|CurrentPartId=1|Location.X=50|Location.Y=50",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=40|Location.Y=50|Name=1|Designator=1|PinLength=10|Orientation=2",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=60|Location.Y=50|Name=2|Designator=2|PinLength=10|Orientation=0",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=40|Name=3|Designator=3|PinLength=10|Orientation=3",
      ].join("\n"),
    ),
  )
  expect(
    elements.find((e) => e.type === "schematic_component")?.symbol_name,
  ).toBeUndefined()
  expect(
    elements.filter((e) => e.type === "source_port").map((e) => e.pin_number),
  ).toEqual([1, 2, 3])
})

test("P-channel metadata selects matching native artwork and source electrical type", () => {
  const elements = convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(
      [
        "|RECORD=31",
        "|RECORD=1|LibReference=ManufacturerPart|ComponentDescription=P Channel transistor|Designator=Q1|CurrentPartId=1|Location.X=50|Location.Y=50",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=40|Location.Y=50|Name=G|Designator=1|PinLength=10|Orientation=2",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=40|Name=S|Designator=2|PinLength=10|Orientation=3",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=60|Name=D|Designator=3|PinLength=10|Orientation=1",
      ].join("\n"),
    ),
  )
  expect(elements.find((e) => e.type === "source_component")).toMatchObject({
    ftype: "simple_mosfet",
    channel_type: "p",
  })
  expect(
    elements.find((e) => e.type === "schematic_component")?.symbol_name,
  ).toMatch(/^p_channel_e_mosfet_/)
})

test("buffer-and-driver metadata must not select an AND gate", () => {
  const elements = convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(
      [
        "|RECORD=31",
        "|RECORD=1|LibReference=Buffer|ComponentDescription=IC HEX BUFFER AND DRIVER WITH OPEN DRAIN OUTPUT|Designator=U1|CurrentPartId=1|Location.X=50|Location.Y=50",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=40|Location.Y=50|Name=1A|Designator=1|PinLength=10|Orientation=2",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=60|Location.Y=50|Name=1Y|Designator=2|PinLength=10|Orientation=0",
      ].join("\n"),
    ),
  )
  expect(
    elements.some(
      (e) =>
        e.type === "schematic_rect" &&
        e.schematic_rect_id.startsWith("compatibility_frame_"),
    ),
  ).toBe(false)
  expect(
    elements.some((e) => e.type === "schematic_text" && e.text === "&"),
  ).toBe(false)
  expect(
    elements.filter((e) => e.type === "source_port").map((e) => e.name),
  ).toEqual(["1A", "1Y"])
})

import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { readReferenceBytes } from "../helpers/read-reference"

type SourceComponent = Extract<AnyCircuitElement, { type: "source_component" }>
type SchematicComponent = Extract<
  AnyCircuitElement,
  { type: "schematic_component" }
>

test("preserves filled-polygon custom bodies for LM5155 U3 and D4", async () => {
  const document = parseAltiumSchDoc(
    await readReferenceBytes("ti-lm5155evm-fly.SchDoc"),
  )
  const elements = convertAltiumSchDocToCircuitJson(document, {
    centerOnSchematicSheet: false,
    schematicUnitScale: 0.05,
  })

  for (const [name, minimumPaths] of [
    ["U3", 4],
    ["D4", 6],
  ] as const) {
    const source = elements.find(
      (element): element is SourceComponent =>
        element.type === "source_component" && element.name === name,
    )
    const component = elements.find(
      (element): element is SchematicComponent =>
        element.type === "schematic_component" &&
        element.source_component_id === source?.source_component_id,
    )
    expect(component?.is_box_with_pins, name).toBe(false)
    expect(component?.symbol_name).toBeUndefined()
    const bodyPaths = elements.filter(
      (element) =>
        element.type === "schematic_path" &&
        element.schematic_component_id === component?.schematic_component_id,
    )
    expect(bodyPaths.length).toBeGreaterThanOrEqual(minimumPaths)
  }
})

test("selects native three-terminal potentiometers on LMG342X", async () => {
  const document = parseAltiumSchDoc(
    await readReferenceBytes("ti-lmg342x-bb-evm.SchDoc"),
  )
  const elements = convertAltiumSchDocToCircuitJson(document, {
    centerOnSchematicSheet: false,
    schematicUnitScale: 0.05,
  })

  for (const name of ["R3", "R15"]) {
    const source = elements.find(
      (element): element is SourceComponent =>
        element.type === "source_component" && element.name === name,
    )
    const component = elements.find(
      (element): element is SchematicComponent =>
        element.type === "schematic_component" &&
        element.source_component_id === source?.source_component_id,
    )
    expect(component?.symbol_name, name).toMatch(/^potentiometer3_/)
    expect(
      elements.filter(
        (element) =>
          element.type === "schematic_path" &&
          element.schematic_component_id === component?.schematic_component_id,
      ),
    ).toHaveLength(0)
    const ports = elements.filter(
      (element) =>
        element.type === "source_port" &&
        element.source_component_id === source?.source_component_id,
    )
    expect(ports).toHaveLength(3)
    expect(
      ports.find(
        (port) => port.type === "source_port" && /wiper/i.test(port.name),
      ),
    ).toMatchObject({ pin_number: 2 })
  }
})

test.each([
  [
    "filled polygon without enough supporting geometry",
    true,
    2,
    "polyline",
    true,
  ],
  ["three unfilled polygons", false, 3, "polygon", true],
  ["unfilled polygon with supporting polylines", false, 3, "polyline", false],
] as const)(
  "checks custom-body evidence for %s",
  (_description, isSolid, count, supportingKind, isBox) => {
    const polygon =
      "|RECORD=7|OwnerIndex=1|OwnerPartId=1|LocationCount=3|X1=45|Y1=50|X2=55|Y2=50|X3=50|Y3=60"
    const polyline =
      "|RECORD=6|OwnerIndex=1|OwnerPartId=1|LocationCount=2|X1=45|Y1=40|X2=55|Y2=40"
    const records = [
      "|RECORD=31",
      "|RECORD=1|LibReference=CustomDevice|Designator=U1|PartCount=1|CurrentPartId=1|Location.X=50|Location.Y=50",
      "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=40|Location.Y=50|Name=IN|Designator=1|PinLength=10|Orientation=0",
      "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=60|Location.Y=50|Name=OUT|Designator=2|PinLength=10|Orientation=2",
      `${polygon}|ISSOLID=${isSolid ? "T" : "F"}`,
      ...Array.from({ length: count - 1 }, () =>
        supportingKind === "polygon" ? `${polygon}|ISSOLID=F` : polyline,
      ),
    ]
    const elements = convertAltiumSchDocToCircuitJson(
      parseAltiumSchDoc(records.join("\n")),
      { centerOnSchematicSheet: false },
    )
    const component = elements.find(
      (element) => element.type === "schematic_component",
    )
    expect(component?.is_box_with_pins).toBe(isBox)
    expect(
      elements.filter(
        (element) =>
          element.type === "schematic_path" &&
          element.schematic_component_id === component?.schematic_component_id,
      ),
    ).toHaveLength(isBox ? 0 : count)
  },
)

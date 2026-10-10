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

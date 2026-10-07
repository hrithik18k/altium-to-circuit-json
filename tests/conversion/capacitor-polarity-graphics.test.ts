import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import { convertAltiumSchDocToCircuitJson } from "../../lib"

function convertCapacitor(
  marker: string,
  includeBody = true,
  includeText = true,
) {
  return convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(
      [
        "|RECORD=31",
        "|RECORD=1|LibReference=ManufacturerPart|Designator=C1|CurrentPartId=1|Location.X=50|Location.Y=50",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=60|Name=2|Designator=2|PinLength=10|Orientation=1",
        "|RECORD=2|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=40|Name=1|Designator=1|PinLength=10|Orientation=3",
        ...(includeBody
          ? [
              "|RECORD=6|OwnerIndex=1|OwnerPartId=1|LocationCount=4|X1=50|Y1=60|X2=50|Y2=50|X3=60|Y3=50|X4=40|Y4=50",
              "|RECORD=6|OwnerIndex=1|OwnerPartId=1|LocationCount=2|X1=50|Y1=40|X2=50|Y2=46",
              "|RECORD=12|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=30|Radius=16|StartAngle=50|EndAngle=130",
            ]
          : []),
        marker,
      ].join("\n"),
    ),
    { schematicUnitScale: 1, centerOnSchematicSheet: false, includeText },
  )
}

const plus =
  "|RECORD=4|OwnerIndex=1|OwnerPartId=1|Location.X=52|Location.Y=58|Text=+"

test.each([true, false])(
  "preserves marked capacitor geometry with includeText=%s",
  (includeText) => {
    const elements = convertCapacitor(plus, true, includeText)
    const component = elements.find((e) => e.type === "schematic_component")
    expect(component).toMatchObject({ is_box_with_pins: false })
    expect(component).not.toHaveProperty("symbol_name")
    expect(elements.filter((e) => e.type === "schematic_path")).toHaveLength(3)
    const ports = elements.filter((e) => e.type === "schematic_port")
    expect(ports.find((p) => p.pin_number === 2)?.center).toEqual({
      x: 50,
      y: 70,
    })
    expect(ports.find((p) => p.pin_number === 1)?.center).toEqual({
      x: 50,
      y: 30,
    })
    expect(
      elements.some((e) => e.type === "schematic_text" && e.text === "+"),
    ).toBe(includeText)
  },
)

test.each([
  "",
  `${plus}|IsHidden=T`,
  plus.replace("OwnerPartId=1", "OwnerPartId=2"),
  `${plus.replace("RECORD=4", "RECORD=41")}|Name=Comment`,
])(
  "keeps the native capacitor without a visible body polarity mark: %s",
  (marker) => {
    const component = convertCapacitor(marker).find(
      (e) => e.type === "schematic_component",
    )
    expect(component?.symbol_name).toMatch(/^capacitor_(right|left|up|down)$/)
  },
)

test("keeps the native symbol when source body graphics are incomplete", () => {
  const component = convertCapacitor(plus, false).find(
    (e) => e.type === "schematic_component",
  )
  expect(component?.symbol_name).toMatch(/^capacitor_(right|left|up|down)$/)
})

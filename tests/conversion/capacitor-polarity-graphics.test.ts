import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import type { SchematicComponent, SchematicText } from "circuit-json"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { readReferenceBytes } from "../helpers/read-reference"

function convertCapacitor({
  marker,
  includeBody = true,
  includeText = true,
  includeCurvedPlate = true,
}: {
  marker: string
  includeBody?: boolean
  includeText?: boolean
  includeCurvedPlate?: boolean
}) {
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
              ...(includeCurvedPlate
                ? [
                    "|RECORD=12|OwnerIndex=1|OwnerPartId=1|Location.X=50|Location.Y=30|Radius=16|StartAngle=50|EndAngle=130",
                  ]
                : []),
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
    const elements = convertCapacitor({ marker: plus, includeText })
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
  "keeps the native capacitor without a curved plate or visible polarity mark: %s",
  (marker) => {
    const component = convertCapacitor({
      marker,
      includeCurvedPlate: false,
    }).find((e) => e.type === "schematic_component")
    expect(component?.symbol_name).toMatch(/^capacitor_(right|left|up|down)$/)
  },
)

test("keeps the native symbol when source body graphics are incomplete", () => {
  const component = convertCapacitor({ marker: plus, includeBody: false }).find(
    (e) => e.type === "schematic_component",
  )
  expect(component?.symbol_name).toMatch(/^capacitor_(right|left|up|down)$/)
})

test("preserves a curved capacitor plate even when the plus is not text", () => {
  const elements = convertCapacitor({ marker: "" })
  const component = elements.find((e) => e.type === "schematic_component")
  expect(component).toMatchObject({ is_box_with_pins: false })
  expect(component).not.toHaveProperty("symbol_name")
  expect(elements.some((e) => e.type === "schematic_path")).toBe(true)
})

test("preserves the shape-drawn plus and curved plate on SimpleFOC Mini C3", async () => {
  const source = await readReferenceBytes("simplefocmini-2024-04-26.SchDoc")
  const elements = convertAltiumSchDocToCircuitJson(parseAltiumSchDoc(source))
  const component = elements.find(
    (e) =>
      e.type === "schematic_component" &&
      e.source_component_id === "source_component_altium_95",
  )
  expect(component).toMatchObject({ is_box_with_pins: false })
  expect(component).not.toHaveProperty("symbol_name")
  const owned = elements.filter(
    (e) =>
      "schematic_component_id" in e &&
      e.schematic_component_id === "schematic_component_altium_95",
  )
  // Two arc segments make the curved plate; the third path is the flat plate.
  expect(owned.filter((e) => e.type === "schematic_path")).toHaveLength(3)
  expect(
    owned.filter((e) => e.type === "schematic_rect" && e.is_filled),
  ).toHaveLength(2)
  expect(owned.filter((e) => e.type === "schematic_port")).toHaveLength(2)
})

test("keeps SimpleFOC Shield C6 labels black with its curved source body", async () => {
  const source = await readReferenceBytes("simplefoc-shield-v3.SchDoc")
  const elements = convertAltiumSchDocToCircuitJson(parseAltiumSchDoc(source))
  const component = elements.find(
    (element): element is SchematicComponent =>
      element.type === "schematic_component" &&
      element.source_component_id === "source_component_altium_230",
  )
  expect(component).toMatchObject({ is_box_with_pins: false })
  const labels = elements.filter(
    (element): element is SchematicText =>
      element.type === "schematic_text" &&
      element.schematic_component_id === component?.schematic_component_id &&
      ["C6", "100uF"].includes(element.text),
  )
  expect(labels.map((label) => [label.text, label.color])).toEqual([
    ["C6", "#0f0f0f"],
    ["100uF", "#0f0f0f"],
  ])
})
